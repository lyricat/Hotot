#!/usr/bin/env python
# -*- coding:utf8 -*-
'''Hotot
@author: U{Shellex Wei <5h3ll3x@gmail.com>}
@license: LGPLv3+
'''

__version__ = '0.9.5'
__codename__ = 'Ada'

import gtk
import gobject
import view
import config
import agent
import keybinder
import utils

try:
    import appindicator
except ImportError:
    HAS_INDICATOR = False
else:
    HAS_INDICATOR = True
HAS_INDICATOR = False

try: import i18n
except: from gettext import gettext as _

try:
    import glib
    glib.set_application_name(_("Hotot"))
    pass
except:
    pass

class Hotot:
    def __init__(self):
        self.is_sign_in = False
        self.active_profile = 'default'
        self.protocol = ''
        self.build_gui()
        self.build_inputw()
        if not HAS_INDICATOR:
            self.create_trayicon()
        pass

    def build_gui(self):
        self.window = gtk.Window()
        gtk.window_set_default_icon_from_file(
            utils.get_ui_object('imgs/ic64_hotot.png'))
        self.window.set_icon_from_file(
            utils.get_ui_object('imgs/ic64_hotot.png'))

        self.window.set_title(_("Hotot"))
        self.window.set_position(gtk.WIN_POS_CENTER)
        self.window.set_default_size(500, 550)

        vbox = gtk.VBox()
        scrollw = gtk.ScrolledWindow()
        self.webv = view.MainView()

        agent.view = self.webv

        scrollw.add(self.webv)
        vbox.pack_start(scrollw)
        vbox.show_all()
        self.window.add(vbox)

        self.menu_tray = gtk.Menu()
        mitem_resume = gtk.MenuItem(_("_Resume/Hide"))
        mitem_resume.connect('activate', self.on_trayicon_activate);
        self.menu_tray.append(mitem_resume)
        mitem_prefs = gtk.ImageMenuItem(gtk.STOCK_PREFERENCES)
        mitem_prefs.connect('activate', self.on_mitem_prefs_activate);
        self.menu_tray.append(mitem_prefs)
        mitem_about = gtk.ImageMenuItem(gtk.STOCK_ABOUT)
        mitem_about.connect('activate', self.on_mitem_about_activate);
        self.menu_tray.append(mitem_about)
        mitem_quit = gtk.ImageMenuItem(gtk.STOCK_QUIT)
        mitem_quit.connect('activate', self.on_mitem_quit_activate);
        self.menu_tray.append(mitem_quit)

        self.menu_tray.show_all()

        ## support for ubuntu unity indicator-appmenu
        menubar = gtk.MenuBar()
        menuitem_file = gtk.MenuItem(_("_File"))
        menuitem_file_menu = gtk.Menu()

        mitem_resume = gtk.MenuItem(_("_Resume/Hide"))
        mitem_resume.connect('activate', self.on_mitem_resume_activate);
        menuitem_file_menu.append(mitem_resume)
        mitem_prefs = gtk.ImageMenuItem(gtk.STOCK_PREFERENCES)
        mitem_prefs.connect('activate', self.on_mitem_prefs_activate);
        menuitem_file_menu.append(mitem_prefs)

        menuitem_quit = gtk.ImageMenuItem(gtk.STOCK_QUIT)
        menuitem_quit.connect("activate", self.quit)
        menuitem_file_menu.append(menuitem_quit)
        menuitem_file.set_submenu(menuitem_file_menu)
        menubar.append(menuitem_file)

        menuitem_help = gtk.MenuItem(_("_Help"))
        menuitem_help_menu = gtk.Menu()
        menuitem_about = gtk.ImageMenuItem(gtk.STOCK_ABOUT)
        menuitem_about.connect("activate", self.on_mitem_about_activate)
        menuitem_help_menu.append(menuitem_about)
        menuitem_help.set_submenu(menuitem_help_menu)
        menubar.append(menuitem_help)

        menubar.set_size_request(0, 0)
        menubar.show_all()
        vbox.pack_start(menubar, expand=0, fill=0, padding=0)
        ##
        self.window.set_geometry_hints(min_height=540, min_width=460)
        self.window.show()
        self.window.connect('delete-event', gtk.Widget.hide_on_delete)
        self.window.connect('size-allocate', self.on_size_allocate)
        pass
    
    def build_inputw(self):
        # input window
        self.inputw = gtk.Window()
        self.inputw.set_default_size(300, 10)
        self.inputw.set_position(gtk.WIN_POS_CENTER)
        self.inputw.set_title(_("What's happening?"))
        hbox = gtk.HBox()

        self.tbox_status = gtk.Entry()
        self.tbox_status.connect('changed', self.on_tbox_status_changed)
        self.tbox_status.connect('key-release-event'
            , self.on_tbox_status_key_released)
        hbox.pack_start(self.tbox_status)

        self.btn_update = gtk.Button(_("Update"))
        self.btn_update.connect('clicked', self.on_btn_update_clicked) 
        hbox.pack_start(self.btn_update, expand=0, fill=0, padding=0)

        hbox.show_all() 
        self.inputw.add(hbox)
        self.inputw.connect('delete-event', gtk.Widget.hide_on_delete)
        pass

    def on_btn_update_clicked(self, btn):
        if (self.tbox_status.get_text_length() <= 140):
            agent.update_status(self.tbox_status.get_text())
            self.tbox_status.set_text('')
            self.inputw.hide()
        pass

    def on_tbox_status_changed(self, entry):
        if (self.tbox_status.get_text_length() <= 140):
            entry.modify_base(gtk.STATE_NORMAL, gtk.gdk.Color('#fff'))
        else:
            entry.modify_base(gtk.STATE_NORMAL, gtk.gdk.Color('#f00'))
        pass
    
    def on_tbox_status_key_released(self, entry, event):
        if event.keyval == gtk.keysyms.Return:
            self.btn_update.clicked();
            entry.stop_emission('insert-text')
        pass

    def on_mitem_resume_activate(self, item):
        self.window.present()
        pass

    def on_mitem_prefs_activate(self, item):
        agent.execute_script('ui.DialogHelper.open(ui.PrefsDlg);');
        self.window.present()
        pass

    def on_mitem_about_activate(self, item):
        agent.execute_script('ui.DialogHelper.open(ui.AboutDlg);');
        self.window.present()
        pass

    def on_mitem_quit_activate(self, item):
        self.quit()
        pass

    def quit(self, *args):
        if self.active_profile != 'default':
            config.dumps(self.active_profile)
        gtk.gdk.threads_leave()
        self.window.destroy()
        gtk.main_quit() 
        import sys
        sys.exit(0)
        pass
        
    def init_hotkey(self):
        try:
            keybinder.bind(
                  config.get(self.active_profile, 'shortcut_summon_hotot')
                , self.on_hotkey_compose)
        except:
            pass
        pass

    def create_trayicon(self):
        """ 
        Create status icon and connect signals
        """
        self.trayicon = gtk.StatusIcon()
        self.trayicon.connect('activate', self.on_trayicon_activate)
        self.trayicon.connect('popup-menu', self.on_trayicon_popup_menu)
        self.trayicon.set_tooltip('Hotot: Click to Active.')
        self.trayicon.set_from_file(
            utils.get_ui_object('imgs/ic64_hotot.png'))
        self.trayicon.set_visible(True)
        pass

    def on_trayicon_activate(self, icon):
        gobject.idle_add(self._on_trayicon_activate, icon)
        pass

    def _on_trayicon_activate(self, icon):
        if self.window.is_active():
            self.window.hide()
        else:
            self.window.present()
        pass

    def on_trayicon_popup_menu(self, icon, button, activate_time):
        self.menu_tray.popup(None, None
            , None, button=button
            , activate_time=activate_time)
        pass

    def on_hotkey_compose(self):
        gobject.idle_add(self._on_hotkey_compose)
        pass

    def _on_hotkey_compose(self):
        if config.get(self.active_profile, 'use_native_input'):
            if not self.tbox_status.is_focus():
                self.inputw.hide()
                pass
            self.inputw.present()
            self.tbox_status.grab_focus()
        else:
            if not self.webv.is_focus():
                self.window.hide()
                pass
            self.window.present()
            self.webv.grab_focus()
        pass

    def on_size_allocate(self, win, req):
        if self.is_sign_in:
            config.set(self.active_profile, 'size_h', req.height)
            config.set(self.active_profile, 'size_w', req.width)
        pass

    def on_sign_in(self, profile):
        self.is_sign_in = True
        self.active_profile = profile
        if not config.profiles.has_key(self.active_profile):
            config.create_profile(self.active_profile)
         
        self.window.set_title('Hotot | %s' % self.active_profile)
        self.window.resize(
              config.get(self.active_profile, 'size_w')
            , config.get(self.active_profile, 'size_h'))
        self.init_hotkey()
        agent.apply_config()
        agent.load_exts()
        pass

    def on_sign_out(self):
        self.is_sign_in = False
        pass

def main():
    global HAS_INDICATOR
    gtk.gdk.threads_init()
    config.loads();
#    if not config.get('use_ubuntu_indicator'):
#        HAS_INDICATOR = False
    try:
        import dl
        libc = dl.open('/lib/libc.so.6')
        libc.call('prctl', 15, 'hotot', 0, 0, 0)
    except:
        pass
    agent.init_notify()
    app = Hotot()
    agent.app = app
    if HAS_INDICATOR:
        #TODO the icon is only work when installed to /usr/share/icons/hicolor/
        indicator = appindicator.Indicator('hotot',
                                           'hotot',
                                           appindicator.CATEGORY_COMMUNICATIONS)
        indicator.set_status(appindicator.STATUS_ACTIVE)
        indicator.set_attention_icon(utils.get_ui_object('imgs/ic64_hotot.png'))
        indicator.set_menu(app.menu_tray)
        pass
    gtk.gdk.threads_enter()
    gtk.main()
    gtk.gdk.threads_leave()

if __name__ == '__main__':
    main()

