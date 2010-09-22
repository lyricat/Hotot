#!/usr/bin/python
# -*- coding: UTF-8 -*-
# vim:set shiftwidth=4 tabstop=4 expandtab textwidth=79:

import subprocess
import os
import sys
from webbrowser import _iscommand as is_command
import gtk
import mimetypes, mimetools

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
        pass
    pass
def open_webbrowser(uri):
    '''open a URI in the registered default application
    '''
    browser = 'xdg-open'
    if sys.platform[:3] == "win":
        browser = 'start'
    subprocess.Popen([browser, uri])
    pass

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
        pass

    for pair in files:
        key, filename = pair[0].encode('utf8'), pair[1].encode('utf8')
        L.append('--' + BOUNDARY)
        L.append('Content-Disposition: form-data; name="%s"; filename="%s"' %
            (key, 'hotot.png'));
        L.append('Content-Type: %s' % get_content_type(filename))
        L.append('')
        L.append(file(filename).read())
        total_size += os.path.getsize(filename)
        pass
    L.append('--' + BOUNDARY + '--')
    L.append('')
    body = CRLF.join(L)
    headers = {'content-type':'multipart/form-data; boundary=%s' % BOUNDARY
        , 'content-length': str(len(body))};
    return headers, body

def get_content_type(filename):
    return mimetypes.guess_type(filename)[0] or 'application/octet-stream'
