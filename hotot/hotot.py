#!/usr/bin/env python
# -*- coding:utf8 -*-
'''Hotot
@author: U{Shellex Wei <5h3ll3x@gmail.com>}
@license: LGPLv3+
'''
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

if __import__('os').environ.get('DESKTOP_SESSION') in ('gnome-2d', 'classic-gnome'):
    HAS_INDICATOR = False

try: import i18n
except: from gettext import gettext as _

try:
    import glib
    glib.set_application_name(_("Hotot"))
except:
    pass

class Hotot:
    def __init__(self):
        self.is_sign_in = False
        self.active_profile = 'default'
        self.protocol = ''
        self.build_gui()
        if not HAS_INDICATOR:
            self.create_trayicon()

    def build_gui(self):
        self.window = gtk.Window()
        gtk.window_set_default_icon_from_file(
            utils.get_ui_object('image/ic64_hotot_classics.png'))
        self.window.set_icon_from_file(
            utils.get_ui_object('image/ic64_hotot_classics.png'))

        self.window.set_title(_("Hotot"))
        self.window.set_position(gtk.WIN_POS_CENTER)
        #self.window.set_default_size(500, 550)

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
        self.window.set_geometry_hints(min_height=380, min_width=460)
        self.window.show()
        self.window.connect('delete-event', gtk.Widget.hide_on_delete)

    def on_btn_update_clicked(self, btn):
        if (self.tbox_status.get_text_length() <= 140):
            agent.update_status(self.tbox_status.get_text())
            self.tbox_status.set_text('')
            self.inputw.hide()

    def on_tbox_status_changed(self, entry):
        if (self.tbox_status.get_text_length() <= 140):
            entry.modify_base(gtk.STATE_NORMAL, gtk.gdk.Color('#fff'))
        else:
            entry.modify_base(gtk.STATE_NORMAL, gtk.gdk.Color('#f00'))

    def on_tbox_status_key_released(self, entry, event):
        if event.keyval == gtk.keysyms.Return:
            self.btn_update.clicked();
            entry.stop_emission('insert-text')

    def on_mitem_resume_activate(self, item):
        self.window.present()

    def on_mitem_prefs_activate(self, item):
        agent.execute_script('''
        ui.PrefsDlg.load_settings(conf.settings);
        ui.PrefsDlg.load_prefs();
        globals.prefs_dialog.open();''');
        self.window.present()

    def on_mitem_about_activate(self, item):
        agent.execute_script('globals.about_dialog.open();');
        self.window.present()

    def on_mitem_quit_activate(self, item):
        self.quit()

    def quit(self, *args):
        gtk.gdk.threads_leave()
        self.window.destroy()
        gtk.main_quit()
        import sys
        sys.exit(0)

    def apply_settings(self):
        # init hotkey
        self.init_hotkey()
        # resize window
        self.window.set_gravity(gtk.gdk.GRAVITY_CENTER)
        self.window.resize(
              config.settings['size_w']
            , config.settings['size_h'])
        # apply proxy
        self.apply_proxy_setting()

    def apply_proxy_setting(self):
        if config.settings['use_http_proxy']:
            proxy_uri = "https://%s:%s" % (
                  config.settings['http_proxy_host']
                , config.settings['http_proxy_port'])            
            if config.settings['http_proxy_host'].startswith('http://'):
                proxy_uri = "%s:%s" % (
                      config.settings['http_proxy_host']
                    , config.settings['http_proxy_port'])  
            utils.webkit_set_proxy_uri(proxy_uri)
        else:
            utils.webkit_set_proxy_uri("")
        # workaround for a BUG of webkitgtk/soupsession
        # proxy authentication
        agent.execute_script('''
            new Image().src='http://google.com/';''');
        
    def init_hotkey(self):
        try:
            keybinder.bind(
                  config.settings['shortcut_summon_hotot']
                , self.on_hotkey_compose)
        except:
            pass

    def create_trayicon(self):
        """ 
        Create status icon and connect signals
        """
        self.trayicon = gtk.StatusIcon()
        self.trayicon.connect('activate', self.on_trayicon_activate)
        self.trayicon.connect('popup-menu', self.on_trayicon_popup_menu)
        self.trayicon.set_tooltip(_("Hotot: Click to Active."))
        self.trayicon.set_from_file(
            utils.get_ui_object('image/ic24_hotot_mono_light.svg'))
        self.trayicon.set_visible(True)

    def on_trayicon_activate(self, icon):
        gobject.idle_add(self._on_trayicon_activate, icon)

    def _on_trayicon_activate(self, icon):
        if self.window.is_active():
            self.window.hide()
        else:
            self.window.present()

    def on_trayicon_popup_menu(self, icon, button, activate_time):
        self.menu_tray.popup(None, None
            , None, button=button
            , activate_time=activate_time)

    def on_hotkey_compose(self):
        gobject.idle_add(self._on_hotkey_compose)

    def _on_hotkey_compose(self):
        if not self.webv.is_focus():
            self.window.hide()
        self.window.present()
        self.webv.grab_focus()

    def on_sign_in(self):
        self.is_sign_in = True
        #self.window.set_title('Hotot | %s' % '$')

    def on_sign_out(self):
        self.is_sign_in = False

def main():
    global HAS_INDICATOR
    gtk.gdk.threads_init()
    config.loads();
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
        indicator.set_attention_icon(utils.get_ui_object('image/ic24_hotot_mono_light.svg'))
        indicator.set_menu(app.menu_tray)
    gtk.gdk.threads_enter()
    gtk.main()
    gtk.gdk.threads_leave()

if __name__ == '__main__':
    main()

