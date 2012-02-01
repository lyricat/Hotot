#!/usr/bin/env python
# -*- coding:utf8 -*-
'''Hotot
@author: U{Shellex Wei <5h3ll3x@gmail.com>}
@license: LGPLv3+
'''
import dbus
import dbus.service

_HOTOT_DBUS_PATH = '/org/hotot/service'
_HOTOT_DBUS_NAME = 'org.hotot.service'

class DbusService(dbus.service.Object):
    def __init__(self, app):
        from dbus.mainloop.glib import DBusGMainLoop
        DBusGMainLoop(set_as_default=True)
        bus_name = dbus.service.BusName(_HOTOT_DBUS_NAME, bus=dbus.SessionBus())
        dbus.service.Object.__init__(self, bus_name, _HOTOT_DBUS_PATH)
        self.app = app

    @dbus.service.method(dbus_interface=_HOTOT_DBUS_NAME, in_signature="", out_signature="i")
    def unread(self):
        return self.app.state['unread_count']

    @dbus.service.signal(dbus_interface=_HOTOT_DBUS_NAME)
    def incoming(self, group, tweets):
        pass

    @dbus.service.method(dbus_interface=_HOTOT_DBUS_NAME, in_signature="s", out_signature="")
    def update_status(self, text):
        self.app.update_status(text)

    @dbus.service.method(dbus_interface=_HOTOT_DBUS_NAME, in_signature="", out_signature="")
    def show(self):
        self.app.window.present()

    @dbus.service.method(dbus_interface=_HOTOT_DBUS_NAME, in_signature="", out_signature="")
    def hide(self):
        self.app.window.hide()

    @dbus.service.method(dbus_interface=_HOTOT_DBUS_NAME, in_signature="", out_signature="")
    def quit(self):
        self.app.quit()


