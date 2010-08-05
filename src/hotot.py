#!/usr/bin/env python
# -*- coding:utf8 -*-
'''GWrite
@author: U{Shellex Wei <5h3ll3x@gmail.com>}
@license: LGPLv3+
'''

__version__ = '0.1.1'

import gtk
import gobject
import view
import config
import agent
import keybinder

class MainWindow:
    def __init__(self):
        self.build_gui()
        self.build_inputw()
        self.create_trayicon()
        self.init_hotkey()
        pass

    def build_gui(self):
        self.window = gtk.Window()
        gtk.window_set_default_icon_name("gtk-dnd")
        self.window.set_icon_name("gtk-dnd")
        self.window.set_default_size(750, 550)
        self.window.set_title("Hotot")
        self.window.set_position(gtk.WIN_POS_CENTER)

        vbox = gtk.VBox()
        scrollw = gtk.ScrolledWindow()
        self.webv = view.MainView()

        agent.view = self.webv

        scrollw.add(self.webv)
        vbox.pack_start(scrollw)
        vbox.show_all()
        self.window.add(vbox)

        self.menu_tray = gtk.Menu()
        mitem_resume = gtk.MenuItem('Resume/Active')
        mitem_resume.connect('activate', self.on_mitem_resume_activate);
        self.menu_tray.append(mitem_resume)
        mitem_prefs = gtk.MenuItem('Preferences')
        mitem_prefs.connect('activate', self.on_mitem_prefs_activate);
        self.menu_tray.append(mitem_prefs)
        mitem_about = gtk.MenuItem('About')
        mitem_about.connect('activate', self.on_mitem_about_activate);
        self.menu_tray.append(mitem_about)
        mitem_quit = gtk.MenuItem('Quit')
        mitem_quit.connect('activate', self.on_mitem_quit_activate);
        self.menu_tray.append(mitem_quit)
        self.menu_tray.show_all()

        self.window.show()
        self.window.connect("delete-event", gtk.Widget.hide_on_delete)
        pass
    
    def build_inputw(self):
        # input window
        self.inputw = gtk.Window()
        self.inputw.set_position(gtk.WIN_POS_CENTER)
        self.inputw.set_title('What\'s happening?')
        hbox = gtk.HBox()

        self.tbox_status = gtk.Entry()
        self.tbox_status.connect('changed', self.on_tbox_status_changed)
        self.tbox_status.connect('key-release-event'
            , self.on_tbox_status_key_released)
        hbox.pack_start(self.tbox_status)

        self.btn_update = gtk.Button('Update')
        self.btn_update.connect('clicked', self.on_btn_update_clicked) 
        hbox.pack_start(self.btn_update)

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
        agent.show_dialog('prefs');
        self.window.present()
        pass

    def on_mitem_about_activate(self, item):
        agent.show_dialog('about');
        self.window.present()
        pass

    def on_mitem_quit_activate(self, item):
        self.quit()
        pass

    def quit(self, *args):
        gtk.gdk.threads_leave()
        self.window.destroy()
        gtk.main_quit() 
        pass
        
    def init_hotkey(self):
        keybinder.bind(config.shortcut_summon_hotot, self.on_hotkey_compose)
        pass

    def create_trayicon(self):
        """ 
        Create status icon and connect signals
        """
        self.trayicon = gtk.StatusIcon()
        self.trayicon.connect('activate', self.on_trayicon_activate)
        self.trayicon.connect('popup-menu', self.on_trayicon_popup_menu)
        self.trayicon.set_tooltip('Hotot: Click to Active.')
        self.trayicon.set_from_file(config.abspath+'/imgs/ic64_hotot.png')
        self.trayicon.set_visible(True)
        pass

    def on_trayicon_activate(self, icon):
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
        if config.use_native_input:
            self.inputw.present()
            self.tbox_status.grab_focus()
        else:
            self.window.present()
        pass

def main():
    config.loads();
    agent.init_notify()
    app = MainWindow()
    agent.app = app
    gtk.gdk.threads_enter()
    gtk.main()
    gtk.gdk.threads_leave()

if __name__ == '__main__':
    main()

