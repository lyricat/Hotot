#!/usr/bin/python
# -*- coding: UTF-8 -*-
# vim:set shiftwidth=4 tabstop=4 expandtab textwidth=79:

import subprocess
import os
import sys
from webbrowser import _iscommand as is_command
import gtk

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
    browser = get_system_default_browser()
    subprocess.Popen([browser, uri])
    pass
