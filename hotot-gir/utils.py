#!/usr/bin/python
# -*- coding: UTF-8 -*-
# vim:set shiftwidth=4 tabstop=4 expandtab textwidth=79:

import subprocess
import os
import sys
from webbrowser import _iscommand as is_command
from gi.repository import Gtk, Gdk, GLib, WebKit, Soup;
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
    , 'es_ES': 'es'
    , 'pt_BR': 'pt_BR'
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
    try:
        session = WebKit.get_default_session()
        session.set_property("max-conns", 20)
        session.set_property("max-conns-per-host", 5)

        if host:
            proxy_uri = Soup.URI()
            proxy_uri.set_scheme(str(scheme))
            proxy_uri.set_host(str(host))
            if port:
                proxy_uri.set_port(int(port))
            if user:
                proxy_uri.set_user(str(user))
            if passwd:
                proxy_uri.set_password(str(passwd))

            session.set_property("proxy-uri", proxy_uri)
        return True
    except:
        exctype, value = sys.exc_info()[:2]
        print 'error: webkit_set_proxy_uri: (%s, %s)' % (exctype,value)
        return False

def open_file_chooser_dialog():
    sel_file = None
    fc_dlg = Gtk.FileChooserDialog(title='Open ... '
        , parent=None
        , action=Gtk.FileChooserAction.OPEN
        , buttons=(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL, Gtk.STOCK_OPEN, Gtk.ResponseType.OK))
    fc_dlg.set_default_response(Gtk.ResponseType.OK)
    resp = fc_dlg.run()
    if resp == Gtk.ResponseType.OK:
        sel_file =  fc_dlg.get_filename()
    fc_dlg.destroy()
    Gdk.threads_leave()
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
    Gdk.pango_context_get().list_families()]
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
