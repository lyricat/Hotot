# -*- coding: UTF-8 -*-
'''Hotot
@author: U{Shellex Wei <5h3ll3x@gmail.com>}
@license: LGPLv3+
'''
import os
import sys
import threading
import time
import config
import gi
gi.require_version('Gtk', '3.0')
gi.require_version('Gdk', '3.0')
gi.require_version('GdkX11', '3.0')
gi.require_version('WebKit', '3.0')
from gi.repository import Gtk, Gdk, GObject, GdkPixbuf
import utils, agent, view

class Hotot:
    def __init__(self):
        self.is_sign_in = False
        self.active_profile = 'default'
        self.protocol = ''
        self.build_gui()
        self.trayicon_pixbuf = [None, None]
        self.state = {
            'unread_count': 0
        }

        self.inblinking = False

        import dbusservice
        self.dbus_service = dbusservice.DbusService(self)

        if os.environ.get('DESKTOP_SESSION') not in ('ubuntu', 'ubuntu-2d'):
            self.has_indicator = False
        else:
            try:
                from gi.repository import AppIndicator3 as AppIndicator
            except ImportError:
                self.has_indicator = False
            else:
                self.has_indicator = True

        if self.has_indicator:
            self.indicator = AppIndicator.Indicator.new('hotot', 'hotot', AppIndicator.IndicatorCategory.COMMUNICATIONS)
            self.indicator.set_status(AppIndicator.IndicatorStatus.ACTIVE)
            self.indicator.set_icon_theme_path(utils.get_ui_object('image/'))
            self.indicator.set_icon_full('ic24_hotot_mono_light', 'hotot')
            self.indicator.set_attention_icon_full('ic24_hotot_mono_light_blink', 'hotot')
            self.indicator.set_menu(self.traymenu)
            self.indicatorStatus = AppIndicator.IndicatorStatus
        else:
            self.create_trayicon()
            # workaround for icon display issue in some cases
            #  libgtk-3-0            => 3.4.0-0ubuntu5
            #  libgdk-pixbuf2.0-0    => 2.26.0-1
            #  trayer                => 1.1.1-1ubuntu1
            # ugly but whoever cares
            self.start_blinking()
            self.stop_blinking()

    def build_gui(self):
        self.window = Gtk.Window()
        self.window.set_default_icon_from_file(
            utils.get_ui_object('image/ic128_hotot.png'))
        self.window.set_icon_from_file(
            utils.get_ui_object('image/ic128_hotot.png'))

        self.window.set_title(_("Hotot"))
        self.window.set_position(Gtk.WindowPosition.CENTER)

        self.window.connect('delete-event', self.on_window_delete)
        # self.window.connect('size-allocate', self.on_window_size_allocate)
        self.window.connect('show', self.on_window_show_or_hide)
        self.window.connect('hide', self.on_window_show_or_hide)

        vbox = Gtk.VBox()
        scrollw = Gtk.ScrolledWindow()

        self.webv = view.MainView(scrollw)

        agent.view = self.webv

        scrollw.add(self.webv)
        vbox.pack_start(scrollw, True, True, 0)
        vbox.show_all()
        self.window.add(vbox)

        self.traymenu = Gtk.Menu()
        mitem_resume = Gtk.MenuItem.new_with_mnemonic(_("_Show"))
        mitem_resume.connect('activate', self.on_mitem_show_activate);
        self.traymenu.append(mitem_resume)
        mitem_resume = Gtk.MenuItem.new_with_mnemonic(_("_Hide"))
        mitem_resume.connect('activate', self.on_mitem_hide_activate);
        self.traymenu.append(mitem_resume)
        mitem_compose = Gtk.MenuItem.new_with_mnemonic(_("_Compose"))
        mitem_compose.connect('activate', self.on_mitem_compose);
        self.traymenu.append(mitem_compose)
        if (config.ENABLE_INSPECTOR):
            mitem_inspector = Gtk.ImageMenuItem.new_with_mnemonic(_("_Inspector"))
            mitem_inspector.set_image(Gtk.Image.new_from_stock(Gtk.STOCK_FIND, Gtk.IconSize.MENU))
            mitem_inspector.connect('activate', self.on_mitem_inspector_activate)
            self.traymenu.append(mitem_inspector)
        mitem_prefs = Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_PREFERENCES, None)
        mitem_prefs.connect('activate', self.on_mitem_prefs_activate);
        self.traymenu.append(mitem_prefs)
        mitem_about = Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_ABOUT, None)
        mitem_about.connect('activate', self.on_mitem_about_activate);
        self.traymenu.append(mitem_about)
        mitem_quit = Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_QUIT, None)
        mitem_quit.connect('activate', self.on_mitem_quit_activate);
        self.traymenu.append(mitem_quit)

        self.traymenu.show_all()

        ## support for ubuntu unity indicator-appmenu
        self.menubar = Gtk.MenuBar()

        menuitem_file = Gtk.MenuItem.new_with_mnemonic(_("_File"))
        menuitem_file_menu = Gtk.Menu()
        mitem_resume = Gtk.MenuItem.new_with_mnemonic(_("_Show"))
        mitem_resume.connect('activate', self.on_mitem_show_activate)
        menuitem_file_menu.append(mitem_resume)
        mitem_compose = Gtk.MenuItem.new_with_mnemonic(_("_Compose"))
        mitem_compose.connect('activate', self.on_mitem_compose)
        menuitem_file_menu.append(mitem_compose)
        mitem_prefs = Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_PREFERENCES, None)
        mitem_prefs.connect('activate', self.on_mitem_prefs_activate)
        menuitem_file_menu.append(mitem_prefs)
        if (config.ENABLE_INSPECTOR):
            mitem_inspector = Gtk.ImageMenuItem.new_with_mnemonic(_("_Inspector"))
            mitem_inspector.set_image(Gtk.Image.new_from_stock(Gtk.STOCK_FIND, 16))
            mitem_inspector.connect('activate', self.on_mitem_inspector_activate)
            menuitem_file_menu.append(mitem_inspector)
        menuitem_quit = Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_QUIT, None)
        menuitem_quit.connect("activate", self.quit)
        menuitem_file_menu.append(menuitem_quit)
        menuitem_file.set_submenu(menuitem_file_menu)
        self.menubar.append(menuitem_file)

        menuitem_help = Gtk.MenuItem.new_with_mnemonic(_("_Help"))
        menuitem_help_menu = Gtk.Menu()
        menuitem_about = Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_ABOUT, None)
        menuitem_about.connect("activate", self.on_mitem_about_activate)
        menuitem_help_menu.append(menuitem_about)
        menuitem_help.set_submenu(menuitem_help_menu)
        self.menubar.append(menuitem_help)

        self.menubar.set_size_request(0, 0)
        self.menubar.show_all()
        self.menubar.hide()
        vport = Gtk.Viewport()
        vport.set_size_request(0, 0)
        vport.add(self.menubar)
        vbox.pack_start(vport, False, False, False)

        ##
        geometry = Gdk.Geometry()
        geometry.min_height = 400
        geometry.min_width = 460
        self.window.set_geometry_hints(self.window, geometry, Gdk.WindowHints.MIN_SIZE)
        self.window.show()

    def update_status(self, text):
        self.webv.execute_script('update_status("%s")' % text)

    def unread_alert(self, count=0):
        if count > 0:
            self.start_blinking()
        else:
            self.stop_blinking()

        if not self.has_indicator:
            self.trayicon.set_tooltip_text("Hotot: %d unread tweets/messages." % count if count > 0 else _("Hotot: Click to Active."))
        self.state['unread_count'] = count

    def start_blinking(self):
        if self.inblinking:
            return
        def blink_proc():
            flag = 0
            while self.inblinking:
                if self.has_indicator:
                    self.indicator.set_status(self.indicatorStatus.ATTENTION if flag else self.indicatorStatus.ACTIVE)
                else:
                    self.trayicon.set_from_pixbuf(self.trayicon_pixbuf[flag])
                flag ^= 1
                time.sleep(1)
            if self.has_indicator:
                self.indicator.set_status(self.indicatorStatus.ACTIVE)
            else:
                self.trayicon.set_from_pixbuf(self.trayicon_pixbuf[0])
        self.inblinking = True
        th = threading.Thread(target = blink_proc)
        th.start()

    def stop_blinking(self):
        self.inblinking = False

    def on_window_delete(self, widget, event):
        if 'close_to_exit' in config.settings and config.settings['close_to_exit']:
            self.quit()
        else:
            return widget.hide_on_delete()

    def on_window_size_allocate(self, widget, allocation):
        x, y = self.window.get_position()
        script = 'if (typeof conf!=="undefined"){conf.settings.pos_x=%d; \
        conf.settings.pos_y=%d;}' % (x, y)
        GObject.idle_add(self.webv.execute_script, script)

    def on_window_show_or_hide(self, widget):
        menuitems = self.traymenu.get_children()
        if self.window.get_visible():
            menuitems[0].hide();
            menuitems[1].show();
        else:
            menuitems[1].hide();
            menuitems[0].show();

    def on_mitem_show_activate(self, item):
        self.window.present()

    def on_mitem_hide_activate(self, item):
        self.window.hide()

    def on_mitem_inspector_activate(self, item):
        inspector = self.webv.get_inspector()
        inspector.show()

    def on_mitem_prefs_activate(self, item):
        agent.execute_script('''
        ui.PrefsDlg.load_settings(conf.settings);
        ui.PrefsDlg.load_prefs();
        globals.prefs_dialog.open();''');
        self.window.present()

    def on_mitem_compose(self, item):
        if self.is_sign_in:
            agent.execute_script('ui.StatusBox.open();')
        self.window.present()

    def on_mitem_about_activate(self, item):
        agent.execute_script('globals.about_dialog.open();');
        self.window.present()

    def on_mitem_quit_activate(self, item):
        self.quit()

    def quit(self, *args):
        self.release_hotkey()
        self.stop_blinking()
        self.window.destroy()
        Gtk.main_quit()

    def apply_settings(self):
        # init hotkey
        self.init_hotkey()
        # resize window
        self.window.set_gravity(Gdk.Gravity.CENTER)
        self.window.resize(
              config.settings['size_w']
            , config.settings['size_h'])
        # apply proxy
        self.apply_proxy_setting()
        # starts minimized
        if config.settings['starts_minimized']:
            self.window.hide()


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
            import xhotkey
            xhk = xhotkey.XHotKey()
            keydesc = config.settings['shortcut_summon_hotot']
            keycode, modifiers = xhk.parse(keydesc)
            if keycode is None:
                print "cannot register hotkey: %s" % keydesc
            else:
                xhk.bind(keycode, modifiers, self.on_hotkey_compose)
                xhk.start()
                self.xhk = xhk;
        except:
            pass

    def release_hotkey(self):
        if hasattr(self, "xhk"):
            self.xhk.clear()
            self.xhk.stop()

    def create_trayicon(self):
        """
        Create status icon and connect signals
        """
        self.trayicon = Gtk.StatusIcon()
        self.trayicon.connect('activate', self.on_trayicon_activate)
        self.trayicon.connect('popup-menu', self.on_trayicon_popup_menu)
        self.trayicon.set_tooltip_text(_("Hotot: Click to Active."))
        self.trayicon_pixbuf[0] = GdkPixbuf.Pixbuf.new_from_file(
            utils.get_ui_object('image/ic24_hotot_mono_light.svg'))
        self.trayicon_pixbuf[1] = GdkPixbuf.Pixbuf.new_from_file(
            utils.get_ui_object('image/ic24_hotot_mono_light_blink.svg'))
        self.trayicon.set_from_pixbuf(self.trayicon_pixbuf[0])
        self.trayicon.set_visible(True)

    def on_trayicon_activate(self, icon):
        GObject.idle_add(self._on_trayicon_activate, icon)

    def _on_trayicon_activate(self, icon):
        if self.window.get_visible():
            self.window.hide()
        else:
            self.stop_blinking()
            self.window.present()

    def on_trayicon_popup_menu(self, icon, button, activate_time):
        self.traymenu.popup(None, None
            , None, None, button=button
            , activate_time=activate_time)

    def on_hotkey_compose(self, event):
        GObject.idle_add(self._on_hotkey_compose)

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

def usage():
    print '''Usage: hotot [OPTION...]
  -d, --dev                enable hotot inspector
  -h, --help               display this help'''

def main():
    for opt in sys.argv[1:]:
        if opt in ('-h', '--help'):
            usage()
            sys.exit()
        elif opt in ('-d', '--dev'):
            config.ENABLE_INSPECTOR = True
        else:
            print "hotot: unrecognized option '%s'" % opt
            usage()
            sys.exit(1)

    try:
        import i18n
    except:
        from gettext import gettext as _

    try:
        import prctl
        prctl.set_name('hotot')
    except:
        pass

    GObject.threads_init()
    config.loads();

    agent.init_notify()
    app = Hotot()
    agent.app = app

    Gdk.threads_enter()
    Gtk.main()
    Gdk.threads_leave()

if __name__ == '__main__':
    main()
    sys.exit(0)

