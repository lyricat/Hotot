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
import ctypes

try: import i18n
except: from gettext import gettext as _

_browser = ''

def get_desktop_environment_name():
    screen = gtk.gdk.screen_get_default()
    window_manager_name = screen.get_window_manager_name().lower() if screen else ''
    desktop_session_name = os.environ.get('DESKTOP_SESSION', '').lower()
    if sys.platform[:3] == "win":
        return 'win'
    elif os.environ.get('GNOME_DESKTOP_SESSION_ID'):
        return 'gnome'
    elif 'gnome' in desktop_session_name:
        return 'gnome'
    elif 'unity' in desktop_session_name:
        return 'gnome'
    elif 'moblin' in desktop_session_name:
        return 'gnome'
    elif os.environ.get('KDE_FULL_SESSION'):
        return 'kde'
    elif window_manager_name in 'mutter':
        return 'gnome'
    elif window_manager_name in 'metacity':
        return 'gnome'
    elif window_manager_name in 'compiz':
        return 'gnome'
    elif window_manager_name in 'awesome':
        return 'awesome'
    elif window_manager_name in 'openbox':
        return 'openbox'
    elif '= "xfce4"' in subprocess.Popen(['xprop', '-root', '_DT_SAVE_MODE'],
            stdout = subprocess.PIPE).stdout.read():
        return 'xfce'
    return ''

def get_system_default_browser():
    global _browser
    if _browser:
        return _browser
    desktop = get_desktop_environment_name()
    tryfirst = []
    if desktop == 'awesome':
        tryfirst = ['opera']
    elif desktop == 'openbox':
        tryfirst = ['firefox']
    elif desktop == 'win':
        tryfirst = ['start']
    elif desktop == 'gnome':
        tryfirst = ['gnome-open']
    for trycmd in tryfirst + ['xdg-open', 'google-chrome', 'chromium-browser', 'firefox', 'x-www-browser']:
        if is_command(trycmd):
            _browser = trycmd
            return _browser

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
        proxy_uri = libsoup.soup_uri_new(str(uri)) if uri else 0
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
    lang, encode = locale.getdefaultlocale()
    return lang
    
