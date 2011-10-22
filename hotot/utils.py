#!/usr/bin/python
# -*- coding: UTF-8 -*-
# vim:set shiftwidth=4 tabstop=4 expandtab textwidth=79:

import subprocess
import os
import sys
from webbrowser import _iscommand as is_command
import gtk
import mimetypes, mimetools

import config
import locale

try: import i18n
except: from gettext import gettext as _

supported_locate = {
      'en_US': 'en'
    , 'zh_CN': 'zh_CN'
    , 'ja_JP': 'ja'
    , 'fr_FR': 'fr'
}

_browser = ''

def open_webbrowser(uri):
    '''open a URI in the registered default application
    '''
    ## for proxychains
    os.environ['LD_PRELOAD'] = ' '.join(
            [ ld for ld in os.environ.get('LD_PRELOAD', '').split(' ') if 'libproxychains.so' not in ld ]
        )
    browser = 'xdg-open'
    if sys.platform[:3] == "win":
        browser = 'start'
    subprocess.Popen([browser, uri])

def webkit_set_proxy_uri(scheme, host, port, user = None, passwd = None):
    from ctypes import CDLL, c_void_p, c_char_p, c_int
    try:
        if os.name == 'nt':
            libgobject = CDLL('libgobject-2.0-0.dll')
            libsoup = CDLL('libsoup-2.4-1.dll')
            libwebkit = CDLL('libwebkit-1.0-2.dll')
        else:
            libgobject = CDLL('libgobject-2.0.so.0')
            libsoup = CDLL('libsoup-2.4.so.1')
            try:
                libwebkit = CDLL('libwebkitgtk-1.0.so.0')
            except:
                libwebkit = CDLL('libwebkit-1.0.so.2')
            pass

        get_session = libwebkit.webkit_get_default_session
        get_session.restype = c_void_p
        session = get_session()
        g_object_set = libgobject.g_object_set
        if session == 0:
            return 1

        g_object_set.argtypes = [ c_void_p, c_char_p, c_int, c_void_p ]
        g_object_set(session, "max-conns", 20, None)
        g_object_set(session, "max-conns-per-host", 5, None)

        if host:
            soup_uri_new = libsoup.soup_uri_new
            soup_uri_new.restype = c_void_p
            soup_uri_new.argtypes = [ c_char_p ]
            proxy_uri = soup_uri_new(None)
            if proxy_uri == 0:
                return 1

            soup_uri_set_scheme = libsoup.soup_uri_set_scheme
            soup_uri_set_scheme.argtypes = [ c_void_p, c_char_p ]
            soup_uri_set_scheme(proxy_uri, str(scheme))

            soup_uri_set_host = libsoup.soup_uri_set_host
            soup_uri_set_host.argtypes = [ c_void_p, c_char_p ]
            soup_uri_set_host(proxy_uri, str(host))
            if port:
                soup_uri_set_port = libsoup.soup_uri_set_port
                soup_uri_set_port.argtypes = [ c_void_p, c_int ]
                soup_uri_set_port(proxy_uri, int(port))
            if user:
                soup_uri_set_user = libsoup.soup_uri_set_user
                soup_uri_set_user.argtypes = [ c_void_p, c_char_p ]
                soup_uri_set_user(proxy_uri, str(user))
            if passwd:
                soup_uri_set_password = libsoup.soup_uri_set_password
                soup_uri_set_password.argtypes = [ c_void_p, c_char_p ]
                soup_uri_set_password(proxy_uri, str(passwd))

            g_object_set.argtypes = [ c_void_p, c_char_p, c_void_p, c_void_p ]
            g_object_set(session, "proxy-uri", proxy_uri, None)

            soup_uri_free = libsoup.soup_uri_free
            soup_uri_free.argtypes = [ c_void_p ]
            soup_uri_free(proxy_uri)
        return 0
    except:
        exctype, value = sys.exc_info()[:2]
        print 'error: webkit_set_proxy_uri: (%s, %s)' % (exctype,value)
        return 1

def open_file_chooser_dialog():
    sel_file = None
    fc_dlg = gtk.FileChooserDialog(title='Open ... '
        , parent=None
        , action=gtk.FILE_CHOOSER_ACTION_OPEN
        , buttons=(gtk.STOCK_CANCEL, gtk.RESPONSE_CANCEL, gtk.STOCK_OPEN,gtk.RESPONSE_OK))
    fc_dlg.set_default_response(gtk.RESPONSE_OK)
    resp = fc_dlg.run()
    if resp == gtk.RESPONSE_OK:
        sel_file =  fc_dlg.get_filename()
    fc_dlg.destroy()
    gtk.gdk.threads_leave()
    return sel_file

def encode_multipart_formdata(fields, files):
    BOUNDARY = mimetools.choose_boundary()
    CRLF = '\r\n'
    L = []
    total_size = 0
    L = []
    for key, value in fields.items():
        key, value = key.encode('utf8'), value.encode('utf8')
        L.append('--' + BOUNDARY)
        L.append('Content-Disposition: form-data; name="%s"' % key)
        L.append('')
        L.append(value)

    for pair in files:
        key, filename = pair[0].encode('utf8'), pair[1].encode('utf8')
        L.append('--' + BOUNDARY)
        L.append('Content-Disposition: form-data; name="%s"; filename="%s"' %
            (key, 'hotot.png'));
        L.append('Content-Type: %s' % get_content_type(filename))
        L.append('')
        L.append(file(filename).read())
        total_size += os.path.getsize(filename)

    L.append('--' + BOUNDARY + '--')
    L.append('')
    body = CRLF.join(L)
    headers = {'content-type':'multipart/form-data; boundary=%s' % BOUNDARY
        , 'content-length': str(len(body))};
    return headers, body

def get_content_type(filename):
    return mimetypes.guess_type(filename)[0] or 'application/octet-stream'

def get_ui_object(name):
    for base in config.DATA_DIRS:
        fullpath = os.path.join(base, name)
        if os.path.exists(fullpath):
            return fullpath

def get_extra_exts():
    import glob
    exts = []
    files = glob.glob(os.path.join(config.CONF_DIR, config.EXT_DIR_NAME) + '/*')
    ext_dirs = filter(lambda x: os.path.isdir(x), files)
    for dir in ext_dirs:
        ext_js = os.path.join(dir, 'entry.js')
        if os.path.exists(ext_js):
            exts.append('file://%s' % ext_js)
    return exts

def get_extra_themes():
    import glob
    themes = []
    files = glob.glob(os.path.join(config.CONF_DIR, config.THEME_DIR_NAME) + '/*')
    theme_dirs = filter(lambda x: os.path.isdir(x), files)
    for dir in theme_dirs:
        info_file = os.path.join(dir, 'info.json')
        style_file = os.path.join(dir, 'style.css')
        if os.path.exists(info_file) and os.path.exists(style_file):
            themes.append('file://%s' % dir)
    return themes

def get_extra_fonts():
    font_list = [ff.get_name() for ff in
    gtk.gdk.pango_context_get().list_families()]
    font_list.sort()
    for font in font_list:
        try:
            font.decode('ascii')
        except:
            font_list.remove(font)
            font_list.insert(0, font)
    return font_list

def get_locale():
    try:
        lang, encode = locale.getdefaultlocale()
    except:
        lang = 'en'
    if lang in supported_locate:
        return supported_locate[lang]
    return 'en'

