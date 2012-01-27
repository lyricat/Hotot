#!/usr/bin/env python
# -*- coding:utf8 -*-
'''Hotot
@author: U{Shellex Wei <5h3ll3x@gmail.com>}
@license: LGPLv3+
'''
import gtk
import gobject
import os
import view
import config
import agent
import keybinder
import utils
import dbus
import dbus.service 
import threading
import time
from dbus.mainloop.glib import DBusGMainLoop

try:
    import appindicator
except ImportError:
    HAS_INDICATOR = False
else:
    HAS_INDICATOR = True

try:
    import indicate
except ImportError:
    HAS_ME_MENU = False
else:
    HAS_ME_MENU = True

if __import__('os').environ.get('DESKTOP_SESSION') in ('gnome-2d', 'classic-gnome'):
    HAS_INDICATOR = False
    HAS_ME_MENU = False

HAS_ME_MENU = False

try: import i18n
except: from gettext import gettext as _

try:
    import glib
    glib.set_application_name(_("Hotot"))
except:
    pass

HOTOT_DBUS_PATH = '/org/hotot/service'
HOTOT_DBUS_NAME = 'org.hotot.service'

class HototDbusService(dbus.service.Object):
    def __init__(self, app):
        bus_name = dbus.service.BusName(HOTOT_DBUS_NAME, bus=dbus.SessionBus())
        dbus.service.Object.__init__(self, bus_name, HOTOT_DBUS_PATH)
        self.app = app

    @dbus.service.method(dbus_interface=HOTOT_DBUS_NAME, in_signature="", out_signature="i")
    def unread(self):
        return self.app.state['unread_count']

    @dbus.service.signal(dbus_interface=HOTOT_DBUS_NAME)
    def incoming(self, group, tweets):
        pass

    @dbus.service.method(dbus_interface=HOTOT_DBUS_NAME, in_signature="s", out_signature="")
    def update_status(self, text):
        self.app.update_status(text)

    @dbus.service.method(dbus_interface=HOTOT_DBUS_NAME, in_signature="", out_signature="")
    def show(self):
        return self.app.window.present()

    @dbus.service.method(dbus_interface=HOTOT_DBUS_NAME, in_signature="", out_signature="")
    def hide(self):
        return self.app.window.hide()

    @dbus.service.method(dbus_interface=HOTOT_DBUS_NAME, in_signature="", out_signature="")
    def quit(self):
        return self.app.quit()


class Hotot:
    def __init__(self):
        self.is_sign_in = False
        self.active_profile = 'default'
        self.protocol = ''
        self.build_gui()
        self.mm_indicators = {}
        self.trayicon_pixbuf = [None, None]
        self.state = {
            'unread_count': 0,
        }

        self.inblinking = False
        self.dbus_service = HototDbusService(self)
        if not HAS_INDICATOR:
            self.create_trayicon()

        if HAS_ME_MENU:
            self.create_memenu()

    def build_gui(self):
        self.window = gtk.Window()
        gtk.window_set_default_icon_from_file(
            utils.get_ui_object('image/ic128_hotot.png'))
        self.window.set_icon_from_file(
            utils.get_ui_object('image/ic128_hotot.png'))

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
        mitem_resume.connect('activate', self.on_mitem_resume_activate)
        menuitem_file_menu.append(mitem_resume)
        mitem_prefs = gtk.ImageMenuItem(gtk.STOCK_PREFERENCES)
        mitem_prefs.connect('activate', self.on_mitem_prefs_activate)
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
        self.window.connect('delete-event', self.on_window_delete)
        self.window.connect('size-allocate', self.on_window_size_allocate)

    def create_memenu(self):
        # Memssage Menu indicator
        self.mm = indicate.indicate_server_ref_default()
        self.mm.set_type('message.hotot')
        self.mm.set_desktop_file(utils.get_ui_object('hotot.desktop'))
        self.mm.connect('server-display', self.on_mm_server_activate)
        self.mm.show()

    def emit_incoming(self, group, tweets):
        self.dbus_service.incoming(group, tweets)

    def update_status(self, text):
        self.webv.execute_script('update_status("%s")' % text)

    def unread_alert(self, subtype, sender, body="", count=0):
        if HAS_ME_MENU:
            try:
                idr = indicate.Indicator()
            except:
                idr = indicate.IndicatorMessage()
            idr.set_property('subtype', subtype)
            idr.set_property('sender', sender)
            idr.set_property('body', body)
            idr.set_property('draw-attention', 'true' if count > 0 else 'false')
            idr.set_property('count', count)
            idr.connect('user-display', self.on_mm_activate)
            idr.show()
            self.mm_indicators[subtype] = idr

        if count > 0:
            self.start_blinking()
        else:
            self.stop_blinking()
        
        if not HAS_INDICATOR:
            self.trayicon.set_tooltip("Hotot: %d unread tweets/messages." % count if count > 0 else _("Hotot: Click to Active."))
        self.state['unread_count'] = count

    def start_blinking(self):
        if self.inblinking:
            return
        def blink_proc():
            flag = 0
            while self.inblinking:
                if HAS_INDICATOR:
                    self.indicator.set_status(appindicator.STATUS_ATTENTION if flag else appindicator.STATUS_ACTIVE)
                else:
                    self.trayicon.set_from_pixbuf(self.trayicon_pixbuf[flag])
                flag ^= 1
                time.sleep(1)
            if HAS_INDICATOR:
                self.indicator.set_status(appindicator.STATUS_ACTIVE)
            else:
                self.trayicon.set_from_pixbuf(self.trayicon_pixbuf[0])
        self.inblinking = True
        th = threading.Thread(target = blink_proc)
        th.start()

    def stop_blinking(self):
        self.inblinking = False

    def on_window_delete(self, widget, event):
        if config.settings['close_to_exit']:
            self.quit() 
        else:
            return widget.hide_on_delete()

    def on_window_size_allocate(self, widget, allocation):
        x, y = self.window.get_position()
        script = 'if (conf) {conf.settings.pos_x=%d; \
        conf.settings.pos_y=%d;}' % (x, y)
        gobject.idle_add(self.webv.execute_script, script)

    def on_mm_activate(self, idr, arg1):
        if HAS_ME_MENU:
            subtype = idr.get_property('subtype')
            idr.set_property('draw-attention', 'false')
            self.window.present()
            if subtype in self.mm_indicators:
                del self.mm_indicators[subtype]
            
    def on_mm_server_activate(self, serv, arg1):
        self.window.present()

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
        self.stop_blinking()
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
        self.window.move(
              config.settings['pos_x']
            , config.settings['pos_y'])
        # apply proxy
        self.apply_proxy_setting()

    def apply_proxy_setting(self):
        if config.settings['use_http_proxy']:
            proxy_host = config.settings['http_proxy_host']
            proxy_port = config.settings['http_proxy_port']
            proxy_scheme = 'https'
            if config.settings['use_http_proxy_auth']:
                auth_user = config.settings['http_proxy_auth_name']
                auth_pass = config.settings['http_proxy_auth_password']
                utils.webkit_set_proxy_uri(proxy_scheme, proxy_host, proxy_port, auth_user, auth_pass)
            else:
                utils.webkit_set_proxy_uri(proxy_scheme, proxy_host, proxy_port, '', '')
        else:
            utils.webkit_set_proxy_uri('', '', '', '', '')
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
        self.trayicon_pixbuf[0] = gtk.gdk.pixbuf_new_from_file(
            utils.get_ui_object('image/ic24_hotot_mono_light.svg'))
        self.trayicon_pixbuf[1] = gtk.gdk.pixbuf_new_from_file(
            utils.get_ui_object('image/ic24_hotot_mono_light_blink.svg'))
        self.trayicon.set_from_pixbuf(self.trayicon_pixbuf[0])
        self.trayicon.set_visible(True)

    def on_trayicon_activate(self, icon):
        gobject.idle_add(self._on_trayicon_activate, icon)

    def _on_trayicon_activate(self, icon):
        if self.window.is_active():
            self.window.hide()
        else:
            self.stop_blinking()
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
    DBusGMainLoop(set_as_default=True)

    global HAS_INDICATOR
    gtk.gdk.threads_init()
    config.loads();
    try:
        import ctypes
        libc = ctypes.CDLL('libc.so.6')
        libc.prctl(15, 'hotot', 0, 0, 0)
    except:
        import dl
        libc = dl.open('/lib/libc.so.6')
        libc.call('prctl', 15, 'hotot', 0, 0, 0)
        
    agent.init_notify()
    app = Hotot()
    agent.app = app
    if HAS_INDICATOR:
        indicator = appindicator.Indicator('hotot',
                                            'hotot',
                                            appindicator.CATEGORY_COMMUNICATIONS)
        indicator.set_status(appindicator.STATUS_ACTIVE)
        indicator.set_icon(utils.get_ui_object('image/ic24_hotot_mono_light.svg'))
        indicator.set_attention_icon(utils.get_ui_object('image/ic24_hotot_mono_dark.svg'))
        indicator.set_menu(app.menu_tray)
        app.indicator = indicator


    gtk.gdk.threads_enter()
    gtk.main()
    gtk.gdk.threads_leave()

if __name__ == '__main__':
    main()

