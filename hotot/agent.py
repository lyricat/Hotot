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

pynotify.init('Hotot Notification')
notify = pynotify.Notification('Init', '')

try: import i18n
except: from gettext import gettext as _

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
    notify.set_icon_from_pixbuf(
        gtk.gdk.pixbuf_new_from_file(
            config.get_ui_object ('imgs/ic64_hotot.png')))
    notify.set_timeout(3000)
    pass

def crack_hotot(uri):
    params = uri.split('/')
    if params[0] == 'token':
        crack_token(params)
    elif params[0] == 'exts':
        crack_exts(params)
    elif params[0] == 'config':
        crack_config(params)
    elif params[0] == 'system':
        crack_system(params)
    elif params[0] == 'action':
        crack_action(params)
    elif params[0] == 'request':
        crack_request(params)
    else:
        pass

def crack_exts(params):
    if params[1] == 'save_enabled':
        exts_enabled = json.loads(urllib2.unquote(params[2]))
        config.set('exts_enabled', exts_enabled)
        config.dumps()
    pass

def crack_config(params):
    if params[1] == 'dumps':
        config.dumps()
    elif params[1] == 'loads': # useless
        config.loads()
    elif params[1] == 'push_prefs':
        config.loads()
        push_prefs()
    elif params[1] == 'save_prefs':
        prefs = json.loads(urllib2.unquote(params[2]))
        config.save_prefs(prefs)
        apply_prefs()
    elif params[1] == 'restore_defaults':
        config.restore_defaults()
        apply_config()
        push_prefs()
    elif params[1] == 'set_opts':
        opts = json.loads(urllib2.unquote(params[2]))
        for key, value in opts.items():
            config.set(key, value)
    pass
    
def crack_token(params):
    if params[1] == 'load':
        token = config.load_token()
        push_option('lib.twitterapi', 'access_token', json.dumps(token))
    elif params[1] == 'dump':
        config.dump_token(json.loads(urllib.unquote(params[2])))
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
    pass

def crack_system(params):
    if params[1] == 'notify':
        if config.use_native_notify:
            summary = base64.decodestring(params[2])
            body = base64.decodestring(params[3])
            notify.update(summary, body)
            notify.show()
    elif params[1] == 'quit':
        app.quit(); 
    pass

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
    pass

def execute_script(scripts):
    return webv.execute_script(scripts)

def push_option(set, name, value):
    webv.execute_script('%s[%s]=%s' % (set, name, value));
    pass

def update_status(text):
    webv.execute_script('''
        ui.StatusBox.update_status('%s');
        ''' % text);
    pass

def load_user(screen_name):
    webv.execute_script('''
        ui.Main.reset_people_page(null, '%s');
        $('#people_tweet_block > ul').html('');
        ui.Notification.set("Loading @%s\'s timeline...").show();
        daemon.Updater.update_people();
        ''' % (screen_name, screen_name));
    pass

def load_search(query):
    webv.execute_script('''
        ui.Main.reset_search_page('%s');
        $('#search_tweet_block > ul').html('');
        ui.Notification.set("Loading Search result %s ...").show();
        daemon.Updater.update_search();
        ''' % (query, query));
    pass

def load_exts():
    scripts = []
    exts = config.get_exts()
    webv.execute_script('''
        var exts = %s;
        ext.load_exts(exts);
        '''
        # @TODO
        % json.dumps(exts))
    pass

def apply_prefs(): 
    remember_password = config.remember_password
    font_family_used = config.font_family_used
    font_size = config.font_size

    consumer_key = config.consumer_key
    consumer_secret = config.consumer_secret

    api_base = config.api_base
    if api_base[-1] != '/': api_base += '/'
    sign_api_base = config.sign_api_base
    if sign_api_base[-1] != '/': sign_api_base += '/'
    search_api_base = config.search_api_base
    if search_api_base[-1] != '/': search_api_base += '/'
    oauth_base = config.oauth_base
    if oauth_base[-1] != '/': oauth_base += '/'
    sign_oauth_base = config.sign_oauth_base
    if sign_oauth_base[-1] != '/': sign_oauth_base += '/'

    webv.execute_script('''
        $('#chk_remember_password').attr('checked', eval('%s'));
        $('body').css('font-family', '%s');
        globals.tweet_font_size = %s;
        lib.twitterapi.api_base = '%s';
        lib.twitterapi.sign_api_base = '%s';
        lib.twitterapi.search_api_base = '%s';
        lib.twitterapi.use_same_sign_api_base = %s;
        jsOAuth.oauth_base = '%s';
        jsOAuth.sign_oauth_base = '%s';
        jsOAuth.use_same_sign_oauth_base = %s;
        jsOAuth.key = '%s';
        jsOAuth.secret = '%s';
        ''' % (
              'true' if remember_password else 'false'
            , font_family_used, font_size
            , api_base, sign_api_base, search_api_base
            , 'true' if config.use_same_sign_api_base else 'false'
            , oauth_base, sign_oauth_base
            , 'true' if config.use_same_sign_oauth_base else 'false'
            , consumer_key, consumer_secret ))
    pass

def apply_config():
    version = 'ver %s (%s)'% (hotot.__version__, hotot.__codename__)
    default_username = config.default_username
    default_password = config.default_password
    access_token = json.dumps(config.load_token())
    exts_enabled = json.dumps(config.exts_enabled)
    webv.execute_script('''
        $('#version').text('%s');
        $('#tbox_basic_auth_username').attr('value', '%s');
        $('#tbox_basic_auth_password').attr('value', '%s');
        jsOAuth.access_token = %s;
        ext.exts_enabled = %s;
        ''' % (version
            , default_username, default_password
            , access_token
            , exts_enabled))
    apply_prefs()
    pass

def push_prefs():
    # account settings
    remember_password = 'true' if config.remember_password else 'false'
    consumer_key = config.consumer_key
    consumer_secret = config.consumer_secret
    
    # system settings
    shortcut_summon_hotot = config.shortcut_summon_hotot

    # display settings 
    font_family_list = [ff.get_name()
        for ff in gtk.gdk.pango_context_get().list_families()]
    font_family_list.sort()
    # raise CJK fontnames
    for font_family in font_family_list:
        try:
            font_family.decode('ascii')
            pass
        except:
            font_family_list.remove(font_family)
            font_family_list.insert(0, font_family)
            pass
        pass
    font_family_used = config.font_family_used
    if font_family_used not in font_family_list:
        font_family_list.insert(0, font_family_used)
    font_size = config.font_size
    use_native_input = 'true' if config.use_native_input else 'false'
    use_native_notify = 'true' if config.use_native_notify else 'false'

    # networks settings
    api_base = config.api_base;
    sign_api_base = config.sign_api_base;
    search_api_base = config.search_api_base;
    oauth_base = config.oauth_base;
    sign_oauth_base = config.sign_oauth_base;
    use_same_sign_api_base = 'true' if config.use_same_sign_api_base else 'false'
    use_same_sign_oauth_base = 'true' if config.use_same_sign_oauth_base else 'false'

    use_http_proxy = 'true' if config.use_http_proxy else 'false'
    http_proxy_host = config.http_proxy_host
    http_proxy_port = config.http_proxy_port

    use_socks_proxy = 'true' if config.use_socks_proxy else 'false'
    socks_proxy_host = config.socks_proxy_host
    socks_proxy_port = config.socks_proxy_port

    webv.execute_script('''
        var prefs_obj = {
          "remember_password": %s
        , "consumer_key": "%s"
        , "consumer_secret": "%s"
        , "shortcut_summon_hotot": "%s"
        , "font_family_list":  %s
        , "font_family_used": "%s"
        , "font_size": "%s"
        , "use_native_input": %s
        , "use_native_notify": %s
        , "api_base": "%s"
        , "sign_api_base": "%s"
        , "search_api_base": "%s"
        , "use_same_sign_api_base": %s
        , "oauth_base": "%s"
        , "sign_oauth_base": "%s"
        , "use_same_sign_oauth_base": %s
        , "use_http_proxy" : %s
        , "http_proxy_host": "%s"
        , "http_proxy_port": "%s"
        , "use_socks_proxy": %s
        , "socks_proxy_host": "%s"
        , "socks_proxy_port": "%s"
        };
        ui.PrefsDlg.request_prefs_cb(eval(prefs_obj));
        ''' % (remember_password
            , consumer_key, consumer_secret
            , shortcut_summon_hotot
            , json.dumps(font_family_list), font_family_used, font_size
            , use_native_input, use_native_notify
            , api_base, sign_api_base, search_api_base
            , use_same_sign_api_base
            , oauth_base, sign_oauth_base
            , use_same_sign_oauth_base
            , use_http_proxy, http_proxy_host, http_proxy_port
            , use_socks_proxy, socks_proxy_host, socks_proxy_port
            ));
    pass

def set_style_scheme():
    style = app.window.get_style()
    base, fg, bg, text = style.base, style.fg, style.bg, style.text
    webv.execute_script('''
        $('#header').css('background', '%s');    
    ''' % str(bg[gtk.STATE_NORMAL]));
    pass

def request(uuid, method, url, params={}, headers={},files=[],additions=''):
    scripts = ''
    try:
        if (method == 'POST'):
            result = _post(url, params, headers, files, additions)
        else:
            result = _get(url, params, headers)
        pass
    except urllib2.HTTPError, e:
        msg = 'Unknown Errors ... '
        if http_code_msg_table.has_key(e.getcode()):
            msg = http_code_msg_table[e.getcode()]
        pass
        tech_info = 'HTTP Code: %s\\nURL: %s\\nDetails: %s' % (e.getcode(), e.geturl(), str(e))
        content = '<p>%s</p><h3>- Technological Info -</h3><div class="dlg_group"><pre>%s</pre></div>' % (msg, tech_info)
        scripts = '''
            ui.MessageDlg.set_text('%s', '%s');
            ui.DialogHelper.open(ui.MessageDlg);
            lib.network.error_task_table['%s']('');
            ''' % ('Ooops, an Error occurred!', content, uuid);
        pass 
    except urllib2.URLError, e:
        content = '<p><label>Error Code:</label>%s<br/><label>Reason:</label> %s, %s<br/></p>' % (e.errno, e.reason, e.strerror)
        scripts = '''
            ui.MessageDlg.set_text('%s', '%s');
            ui.DialogHelper.open(ui.MessageDlg);
            lib.network.error_task_table['%s']('');
            ''' % ('Ooops, an Error occurred!', content, uuid);
        pass
    else:
        if uuid != None:
            if result[0] != '{' and result[0] != '[':
                scripts = '''lib.network.success_task_table['%s']('%s');
                ''' % (uuid, result)
            else:
                scripts = '''lib.network.success_task_table['%s'](%s);
                ''' % (uuid, result)
            pass
    scripts += '''delete lib.network.success_task_table['%s'];
    delete lib.network.error_task_table['%s'];
    '''  % (uuid, uuid);
    gobject.idle_add(webv.execute_script, scripts)
    pass

def _get(url, params={}, req_headers={}):
    urlopen = urllib2.urlopen
    if config.use_http_proxy:
        proxy_support = urllib2.ProxyHandler(
            {"http" : config.http_proxy_host+':'+str(config.http_proxy_port)})
        urlopen = urllib2.build_opener(proxy_support).open
        pass
    request =  urllib2.Request(url, headers=req_headers)
    ret = urlopen(request).read()
    return ret

def _post(url, params={}, req_headers={}, files=[], additions=''):
    if files != []:
        files_headers, files_data = utils.encode_multipart_formdata(params, files)
        params ={}
        req_headers.update(files_headers)
        additions += files_data
        pass

    urlopen = urllib2.urlopen
    if config.use_http_proxy:
        proxy_support = urllib2.ProxyHandler(
            {"http" : config.http_proxy_host+':'+str(config.http_proxy_port)})
        urlopen = urllib2.build_opener(proxy_support).open
        pass
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

    if config.use_socks_proxy:
        SOCKS5_PROXY = '%s:%s' % (config.socks_proxy_host, config.socks_proxy_port)
        curl.setopt(pycurl.PROXYTYPE, pycurl.PROXYTYPE_SOCKS5)
        curl.setopt(pycurl.PROXY, SOCKS5_PROXY)
        pass
    if config.use_http_proxy:
        HTTP_PROXY = '%s:%s' % (config.http_proxy_host, config.http_proxy_port)
        curl.setopt(pycurl.PROXY, HTTP_PROXY)
        pass

    if header:
        curl.setopt(pycurl.HTTPHEADER, [str(k) + ':' + str(v) for k, v in header.items()])
        pass

    if post:
        curl.setopt(pycurl.POST, 1)
        pass

    if params:
        if post:
            curl.setopt(pycurl.POSTFIELDS, urllib.urlencode(params))
        else:
            url = "?".join((url, urllib.urlencode(params)))
        pass
    
    curl.setopt(pycurl.URL, str(url))
    
    if username and password:
        curl.setopt(pycurl.USERPWD, "%s:%s" % (str(username), str(password)))
        pass

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
            pass
        pass
    return urllib.urlencode(query)

