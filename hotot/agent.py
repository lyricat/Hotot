#!/usr/bin/env python
# -*- coding:utf8 -*-
import json
import config
import time
import base64
import urllib, urllib2
import pynotify
import gtk
import threading 
import gobject
import utils
import hotot
import os
import sys
import subprocess
import ctypes

reload(sys)
sys.setdefaultencoding('utf8')

try: import i18n
except: from gettext import gettext as _

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

def webkit_set_proxy_uri(uri):
    if uri and '://' not in uri:
        uri = 'https://' + uri
    try:
        if os.name == 'nt':
            libgobject = ctypes.CDLL('libgobject-2.0-0.dll')
            libsoup = ctypes.CDLL('libsoup-2.4-1.dll')
            libwebkit = ctypes.CDLL('libwebkit-1.0-2.dll')
        else:
            libgobject = ctypes.CDLL('libgobject-2.0.so.0')
            libsoup = ctypes.CDLL('libsoup-2.4.so.1')
            try:
                libwebkit = ctypes.CDLL('libwebkit-1.0.so.2')
            except:
                libwebkit = ctypes.CDLL('libwebkitgtk-1.0.so.0')
            pass
        proxy_uri = libsoup.soup_uri_new(uri) if uri else 0
        session = libwebkit.webkit_get_default_session()
        libgobject.g_object_set(session, "proxy-uri", proxy_uri, None)
        if proxy_uri:
            libsoup.soup_uri_free(proxy_uri)
        libgobject.g_object_set(session, "max-conns", 20, None)
        libgobject.g_object_set(session, "max-conns-per-host", 5, None)
        return 0
    except:
        exctype, value = sys.exc_info()[:2]
        print 'error: webkit_set_proxy_uri: (%s, %s)' % (exctype,value)
        return 1

def apply_proxy_setting():
    if get_prefs('use_http_proxy'):
        proxy_uri = "https://%s:%s" % (
              get_prefs('http_proxy_host')
            , get_prefs('http_proxy_port'))
        webkit_set_proxy_uri(proxy_uri)
    else:
        webkit_set_proxy_uri("")
    # workaround for a BUG of webkitgtk/soupsession
    # proxy authentication
    webv.execute_script('''
        new Image().src='http://google.com/';''');

def init_notify():
    notify.set_icon_from_pixbuf(
        gtk.gdk.pixbuf_new_from_file(
            utils.get_ui_object('imgs/ic64_hotot.png')))
    notify.set_timeout(5000)

def do_notify(summary, body):
    n = pynotify.Notification(summary, body)
    n.set_icon_from_pixbuf(
        gtk.gdk.pixbuf_new_from_file(
            utils.get_ui_object('imgs/ic64_hotot.png')))
    n.set_timeout(5000)
    n.show()

def crack_hotot(uri):
    params = uri.split('/')
    if params[0] == 'system':
        crack_system(params)
    elif params[0] == 'action':
        crack_action(params)
    elif params[0] == 'request':
        crack_request(params)
    else:
        pass

def crack_action(params):
    if params[1] == 'user':
        screen_name = params[2]
        load_user(screen_name)
    elif params[1] == 'search':
        load_search(params[2])
    elif params[1] == 'choose_file':
        callback = params[2]
        file_path = utils.open_file_chooser_dialog()
        webv.execute_script('%s("%s")' % (callback, file_path))
    elif params[1] == 'log':
        print '\033[1;31;40m[%s]\033[0m %s' % (urllib.unquote(params[2]) ,urllib.unquote(params[3]))

def crack_system(params):
    if params[1] == 'notify':
        type = urllib.unquote(params[2])
        summary = urllib.unquote(params[3])
        body = urllib.unquote(params[4])
        if type == 'content':
            do_notify(summary, body)
        elif type == 'count':
            notify.update(summary, body)
            notify.show()
    elif params[1] == 'load_settings':
        settings = json.loads(urllib.unquote(params[2]))
        config.load_settings(settings)
        app.init_hotkey()
    elif params[1] == 'apply_proxy_setting':
        apply_proxy_setting()
    elif params[1] == 'sign_in':
        app.on_sign_in()
    elif params[1] == 'sign_out':
        app.on_sign_out()
    elif params[1] == 'quit':
        app.quit()

def crack_request(params):
    raw_json = urllib.unquote(params[1])
    request_info = dict([(k.encode('utf8'), v)
        for k, v in json.loads(raw_json).items()])
    args = ( request_info['uuid']
        , request_info['method']
        , request_info['url']
        , request_info['params']
        , request_info['headers']
        , request_info['files'])
    th = threading.Thread(target = request, args=args)
    th.start()

def execute_script(scripts):
    return webv.execute_script(scripts)

def update_status(text):
    webv.execute_script('''
        ui.StatusBox.update_status('%s');
        ''' % text);

def load_user(screen_name):
    webv.execute_script('''
        ui.PeopleTabs.set_people('%s');
        ui.Notification.set(_("Loading @%s\'s timeline...")).show();
        daemon.Updater.update_people();
        ''' % (screen_name, screen_name));

def load_search(query):
    webv.execute_script('''
        ui.Main.reset_search_page('%s');
        $('#search_tweet_block > ul').html('');
        ui.Notification.set(_("Loading Search result %s ...")).show();
        daemon.Updater.update_search();
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
            ui.MessageDlg.set_text('%s', '%s');
            ui.DialogHelper.open(ui.MessageDlg);
            lib.network.error_task_table['%s']('');
            ''' % ('Ooops, an Error occurred!', content, uuid);
    except urllib2.URLError, e:
        content = '<p><label>Error Code:</label>%s<br/><label>Reason:</label> %s, %s<br/></p>' % (e.errno, e.reason, e.strerror)
        scripts = '''
            ui.MessageDlg.set_text('%s', '%s');
            ui.DialogHelper.open(ui.MessageDlg);
            lib.network.error_task_table['%s']('');
            ''' % ('Ooops, an Error occurred!', content, uuid);
    else:
        if uuid != None:
            if result[0] != '{' and result[0] != '[':
                scripts = '''lib.network.success_task_table['%s']('%s');
                ''' % (uuid, result)
            else:
                scripts = '''lib.network.success_task_table['%s'](%s);
                ''' % (uuid, result)
    scripts += '''delete lib.network.success_task_table['%s'];
    delete lib.network.error_task_table['%s'];
    '''  % (uuid, uuid);
    gobject.idle_add(webv.execute_script, scripts)

def _get(url, params={}, req_headers={}):
    urlopen = urllib2.urlopen
    if get_prefs('use_http_proxy'):
        proxy_support = urllib2.ProxyHandler(
            {"http" : get_prefs('http_proxy_host') +':'+str(get_prefs('http_proxy_port'))})
        urlopen = urllib2.build_opener(proxy_support).open
    request =  urllib2.Request(url, headers=req_headers)
    ret = urlopen(request).read()
    return ret

def _post(url, params={}, req_headers={}, files=[], additions=''):
    if files != []:
        files_headers, files_data = utils.encode_multipart_formdata(params, files)
        params ={}
        req_headers.update(files_headers)
        additions += files_data

    urlopen = urllib2.urlopen
    if get_prefs('use_http_proxy'):
        proxy_support = urllib2.ProxyHandler(
            {"http" : get_prefs('http_proxy_host') +':'+str(get_prefs('http_proxy_port'))})
        urlopen = urllib2.build_opener(proxy_support).open
    params = dict([(k.encode('utf8')
            , v.encode('utf8') if type(v)==unicode else v) 
                for k, v in params.items()])

    request = urllib2.Request(url, 
        urlencode(params) + additions, headers=req_headers);
    ret = urlopen(request).read()
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

