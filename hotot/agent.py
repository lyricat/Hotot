# -*- coding: UTF-8 -*-
# vim:set shiftwidth=4 tabstop=4 expandtab textwidth=79:
import json
import config
import time
import base64
import urllib, urllib2
import gtk
import threading
import gobject
import utils
import hotot
import os
import sys
import subprocess
import hashlib

try: import i18n
except: from gettext import gettext as _

reload(sys)
sys.setdefaultencoding('utf8')

USE_GTKNOTIFICATION_IN_NATIVE_PLATFORM = True

## Disable GtkNotification on Gnome3
screen = gtk.gdk.screen_get_default()
window_manager_name = screen.get_window_manager_name().lower() if screen else ''
if 'mutter' in window_manager_name or 'i3' in window_manager_name:
    USE_GTKNOTIFICATION_IN_NATIVE_PLATFORM = False

if USE_GTKNOTIFICATION_IN_NATIVE_PLATFORM:
    import gtknotification
    class  Notification(object):
        def do_notify(self, summary, body, icon_file = None):
            if (icon_file == None or not os.path.isfile(icon_file) or os.path.getsize(icon_file) == 0):
                icon_file = utils.get_ui_object(os.path.join('image','ic64_hotot.png'));
            icon_file = 'file://' + icon_file
            title = _("Hotot Notification")
            text = summary + '\n' + body
            gobject.idle_add(gtknotification.gtknotification, title, text, icon_file)
        update = do_notify
        show = str
    notify = Notification()
else:
    import pynotify
    pynotify.init(_("Hotot Notification"))
    notify = pynotify.Notification('Init', '')

webv = None
app = None
http_code_msg_table = {
      404: 'The URL you request does not exist. Please check your API Base/OAuth Base/Search Base.'
    , 401: 'Server cannot authenticate you. Please check your username/password and API base.'
    , 500: 'Server is broken. Please try again later.'
    , 502: 'Server is down or being upgraded. Please try again later.'
    , 503: 'Server is overcapacity. Please try again later.'
}

def init_notify():
    if USE_GTKNOTIFICATION_IN_NATIVE_PLATFORM:
        return
    notify.set_icon_from_pixbuf(
        gtk.gdk.pixbuf_new_from_file(
            utils.get_ui_object(os.path.join('image','ic64_hotot.png'))))
    notify.set_timeout(30000)

def do_notify(summary, body, icon_file = None):
    if USE_GTKNOTIFICATION_IN_NATIVE_PLATFORM:
        return notify.do_notify(summary, body, icon_file)
    n = pynotify.Notification(summary, body)
    if (icon_file == None or not os.path.isfile(icon_file) or os.path.getsize(icon_file) == 0):
        icon_file = utils.get_ui_object(os.path.join('image','ic64_hotot.png'));
    n.set_icon_from_pixbuf(gtk.gdk.pixbuf_new_from_file(icon_file))
    n.set_timeout(30000)
    n.show()

def crack_hotot(uri):
    params = uri.split('/')
    try:
        if params[0] == 'system':
            crack_system(params)
        elif params[0] == 'action':
            crack_action(params)
        elif params[0] == 'request':
            raw_json = urllib.unquote(params[1])
            req_params = dict([(k.encode('utf8'), v)
                for k, v in json.loads(raw_json).items()])
            crack_request(req_params)
    except Exception, e:
        import traceback
        print "Exception:"
        traceback.print_exc(file=sys.stdout)

def crack_action(params):
    if params[1] == 'search':
        load_search(params[2])
    elif params[1] == 'choose_file':
        callback = params[2]
        file_path = utils.open_file_chooser_dialog()
        webv.execute_script('%s("%s")' % (callback, file_path))
    elif params[1] == 'save_avatar':
        img_uri = urllib.unquote(params[2])
        avatar_file = urllib.unquote(params[3])
        avatar_path = os.path.join(config.AVATAR_CACHE_DIR, avatar_file)
        th = threading.Thread(
            target = save_file_proc,
            args=(img_uri, avatar_path))
        th.start()
    elif params[1] == 'log':
        print '\033[1;31;40m[%s]\033[0m %s' % (urllib.unquote(params[2]) ,urllib.unquote(params[3]))
    elif params[1] == 'paste_clipboard_text':
        webv.paste_clipboard();
    elif params[1] == 'set_clipboard_text':
        clipboard = gtk.clipboard_get()
        text = list(params)
        del text[0:2]
        clipboard.set_text('/'.join(text))

def crack_system(params):
    if params[1] == 'notify':
        type = urllib.unquote(params[2])
        summary = urllib.unquote(params[3])
        body = urllib.unquote(params[4])
        if type == 'content':
            try:
                img_uri = urllib.unquote(params[5])
                avatar_file = os.path.join(config.AVATAR_CACHE_DIR, hashlib.new("sha1", img_uri).hexdigest())
                avatar_path = avatar_file
                th = threading.Thread(
                    target = save_file_proc,
                    args=(img_uri, avatar_path))
                th.start()
            except:
                avatar_file = None
            do_notify(summary, body, avatar_file)
        elif type == 'count':
            notify.update(summary, body)
            notify.show()
    elif params[1] == 'unread_alert':
        unread_count = int(urllib.unquote(params[2]))
        app.unread_alert("unread", "Unread", "Items", unread_count)
    elif params[1] == 'incoming':
        # @TODO
        pass
    elif params[1] == 'load_settings':
        settings = json.loads(urllib.unquote(params[2]))
        config.load_settings(settings)
        app.apply_settings()
    elif params[1] == 'sign_in':
        app.on_sign_in()
    elif params[1] == 'sign_out':
        app.on_sign_out()
    elif params[1] == 'quit':
        app.quit()

def crack_request(req_params):
    args = ( req_params['uuid']
        , req_params['method']
        , req_params['url']
        , req_params['params']
        , req_params['headers']
        , req_params['files'])
    th = threading.Thread(target = request, args=args)
    th.start()

def save_file_proc(uri, save_path):
    if (not os.path.isfile(save_path)) or os.path.getsize(save_path) == 0:
        try:
            data = _get(uri)
            avatar = open(save_path, "wb")
            avatar.write(data)
            avatar.close()
        except:
            import traceback
            print "Exception:"
            traceback.print_exc(file=sys.stdout)
            if os.path.isfile(save_path):
                os.unlink(save_path)


def execute_script(scripts):
    return webv.execute_script(scripts)

def update_status(text):
    webv.execute_script('''
        ui.StatusBox.update_status('%s');
        ''' % text);

def load_search(query):
    webv.execute_script('''
        ui.Main.reset_search_page('%s');
        $('#search_tweet_block > ul').html('');
        ui.Notification.set(_("Loading Search result %s ...")).show();
        daemon.update_search();
        ''' % (query, query));

def set_style_scheme():
    style = app.window.get_style()
    base, fg, bg, text = style.base, style.fg, style.bg, style.text
    webv.execute_script('''
        $('#header').css('background', '%s');
    ''' % str(bg[gtk.STATE_NORMAL]));

def get_prefs(name):
    return config.settings[name]

def set_prefs(name, value):
    config.settings[name] = value

def _encoding_workaround(func):
    def wrap(*args, **argkw):
        sys.setdefaultencoding('iso8859-1')
        result = func(*args, **argkw)
        sys.setdefaultencoding('utf8')
        return result
    return wrap

@_encoding_workaround
def request(uuid, method, url, params={}, headers={},files=[],additions=''):
    scripts = ''
    try:
        if (method == 'POST'):
            result = _post(url, params, headers, files, additions)
        else:
            result = _get(url, params, headers)
    except urllib2.HTTPError, e:
        msg = 'Unknown Errors ... '
        if http_code_msg_table.has_key(e.getcode()):
            msg = http_code_msg_table[e.getcode()]
        tech_info = 'HTTP Code: %s\\nURL: %s\\nDetails: %s' % (e.getcode(), e.geturl(), str(e))
        content = '<p>%s</p><h3>- Technological Info -</h3><div class="dlg_group"><pre>%s</pre></div>' % (msg, tech_info)
        scripts = '''
            widget.DialogManager.alert('%s', '%s');
            globals.network.error_task_table['%s']('');
            ''' % ('Ooops, an Error occurred!', content, uuid);
    except urllib2.URLError, e:
        content = '<p><label>Error Code:</label>%s<br/><label>Reason:</label> %s, %s<br/></p>' % (e.errno, e.reason, e.strerror)
        scripts = '''
            widget.DialogManager.alert('%s', '%s');
            globals.network.error_task_table['%s']('');
            ''' % ('Ooops, an Error occurred!', content, uuid);
    else:
        if uuid != None:
            if result[0] != '{' and result[0] != '[':
                scripts = '''globals.network.success_task_table['%s']('%s');
                ''' % (uuid, result)
            else:
                scripts = '''globals.network.success_task_table['%s'](%s);
                ''' % (uuid, result)
    scripts += '''delete globals.network.success_task_table['%s'];
    delete globals.network.error_task_table['%s'];
    '''  % (uuid, uuid);
    gobject.idle_add(webv.execute_script, scripts)

def get_urlopen():
    proxy_type = get_prefs('proxy_type')
    if proxy_type == 'http':
        scheme = 'http'
        host = str(get_prefs('proxy_host'))
        port = str(get_prefs('proxy_port'))
        url = scheme + '://' + host + ':' + port
        if get_prefs('proxy_auth'):
            proxy_support = urllib2.ProxyHandler({ 'http': url, 'https': url })
            username = str(get_prefs('proxy_auth_name'))
            password = str(get_prefs('proxy_auth_password'))
            auth_handler = urllib2.ProxyBasicAuthHandler()
            auth_handler.add_password(None, url, username, password)
            return urllib2.build_opener(proxy_support, auth_handler).open
        else:
            proxy_support = urllib2.ProxyHandler({ 'http': url, 'https': url })
            return urllib2.build_opener(proxy_support).open
    elif proxy_type == 'system':
        if 'http_proxy' in os.environ and os.environ["http_proxy"]:
            url = os.environ["http_proxy"]
        elif 'HTTP_PROXY' in os.environ and os.environ["HTTP_PROXY"]:
            url = os.environ["HTTP_PROXY"]
        else:
            url = None

        if not url:
            return urllib2.urlopen
        else:
            proxy_support = urllib2.ProxyHandler({ 'http': url, 'https': url })
            return urllib2.build_opener(proxy_support).open
    else:
        return urllib2.urlopen


def _get(url, params={}, req_headers={}, req_timeout=None):
    urlopen = get_urlopen()
    request =  urllib2.Request(url, headers=req_headers)
    ret = urlopen(request, timeout=req_timeout).read()
    return ret

def _post(url, params={}, req_headers={}, files=[], additions='', req_timeout=None):
    if files != []:
        files_headers, files_data = utils.encode_multipart_formdata(params, files)
        params ={}
        req_headers.update(files_headers)
        additions += files_data

    urlopen = get_urlopen()
    params = dict([(k.encode('utf8')
            , v.encode('utf8') if type(v)==unicode else v)
                for k, v in params.items()])

    request = urllib2.Request(url,
        urlencode(params) + additions, headers=req_headers);
    ret = urlopen(request, timeout=req_timeout).read()
    return ret

pycurl = None
StringIO = None
def _curl(url, params=None, post=False, username=None, password=None, header=None, body=None):
    global pycurl, StringIO
    if not pycurl:
        import pycurl
    try: import cStringIO as StringIO
    except: import StringIO

    curl = pycurl.Curl()

    if get_prefs('use_http_proxy'):
        HTTP_PROXY = '%s:%s' % (get_prefs('http_proxy_host'), get_prefs('http_proxy_port'))
        curl.setopt(pycurl.PROXY, HTTP_PROXY)

    if header:
        curl.setopt(pycurl.HTTPHEADER, [str(k) + ':' + str(v) for k, v in header.items()])

    if post:
        curl.setopt(pycurl.POST, 1)

    if params:
        if post:
            curl.setopt(pycurl.POSTFIELDS, urllib.urlencode(params))
        else:
            url = "?".join((url, urllib.urlencode(params)))

    curl.setopt(pycurl.URL, str(url))

    if username and password:
        curl.setopt(pycurl.USERPWD, "%s:%s" % (str(username), str(password)))

    curl.setopt(pycurl.FOLLOWLOCATION, 1)
    curl.setopt(pycurl.MAXREDIRS, 5)
    curl.setopt(pycurl.TIMEOUT, 15)
    curl.setopt(pycurl.CONNECTTIMEOUT, 8)
    curl.setopt(pycurl.HTTP_VERSION, pycurl.CURL_HTTP_VERSION_1_0)

    content = StringIO.StringIO()
    hdr = StringIO.StringIO()
    curl.setopt(pycurl.WRITEFUNCTION, content.write)
    curl.setopt(pycurl.HEADERFUNCTION, hdr.write)

    print curl, url, header
    try:
        curl.perform()
    except pycurl.error, e:
        raise e

    http_code = curl.getinfo(pycurl.HTTP_CODE)
    if http_code != 200:
        status_line = hdr.getvalue().splitlines()[0]
        status_message = status_line
        e =urllib2.HTTPError (str(url), http_code, status_message, {}, None)
        e.url = url
        raise e
    else:
        return content.getvalue()

def urlencode(query):
    for k,v in query.items():
        if not v:
            del query[k]
    return urllib.urlencode(query)

def idle_it(fn):
    return lambda *args: gobject.idle_add(fn, *args)

