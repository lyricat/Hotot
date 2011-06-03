#!/usr/bin/python
# -*- coding: UTF-8 -*-
# vim:set shiftwidth=4 tabstop=4 expandtab textwidth=79:
import glib
import gtk
import pango
import os

from xml.sax.saxutils import escape

queue = list()
actual_notification = None

def gtknotification(title, text, icon_file=None, const=None, callback=None, tooltip=None):
    global actual_notification
    global queue

    if actual_notification is None:
        actual_notification = Notification(title, text, icon_file, callback, tooltip)
        actual_notification.show()
    else:
        if actual_notification._title == title:
            actual_notification.append_text(text)
        else:
            found = False
            auxqueue = list()
            for _title, _text, _icon_file, _callback, _tooltip in queue:
                if _title == title:
                    _text = _text + "\n" + text
                    found = True
                auxqueue.append([_title, _text, _icon_file, _callback, _tooltip])

            if found:
                del queue
                queue = auxqueue
            else:
                queue.append([title, text, icon_file, callback, tooltip])

class Notification(gtk.Window):
    title_markup = '<span foreground="%s" weight="ultrabold">%s</span>'
    text_markup = '<span foreground="%s"><b>%s</b>\n<span>%s</span></span>'

    def __init__(self, title, text, icon_file, callback, tooltip):

        gtk.Window.__init__(self, type=gtk.WINDOW_POPUP)

        self.foreground_color = "white"
        background_color = gtk.gdk.Color()
        icon_size = 48;
        max_width = 300;
        self.callback = callback

        self.set_border_width(10)

        self._title = title
        title_label = gtk.Label(self.title_markup % (self.foreground_color, escape(self._title)))
        title_label.set_use_markup(True)
        title_label.set_justify(gtk.JUSTIFY_LEFT)
        title_label.set_ellipsize(pango.ELLIPSIZE_END)

        text1, text2 = (text + '\n').split('\n', 1)
        text = self.text_markup % (self.foreground_color, escape(text1), escape(text2))
        self.text = text
        self.message_label = gtk.Label(text)
        self.message_label.set_use_markup(True)
        self.message_label.set_justify(gtk.JUSTIFY_LEFT)
        self.message_label.set_line_wrap(True)
        self.message_label.set_alignment(0, 0)

        image = gtk.Image()
        image.set_alignment(0, 0)
        if icon_file.startswith('file://'):
            icon_file = icon_file[7:]
        try:
            pixbuf = gtk.gdk.pixbuf_new_from_file_at_size(icon_file, icon_size, icon_size)
            image.set_from_pixbuf(pixbuf)
        except:
            pass

        self.message_vbox = gtk.VBox()
        self.message_vbox.pack_start(title_label, False, False)
        self.message_vbox.pack_start(self.message_label, False, True)

        lbox = gtk.HBox()
        lbox.set_spacing(10)
        lbox.pack_start(image, False, False)
        lbox.pack_start(self.message_vbox, True, True)

        event_box = gtk.EventBox()
        event_box.set_visible_window(False)
        event_box.set_events(gtk.gdk.BUTTON_PRESS_MASK)
        event_box.connect("button_press_event", self.on_click)
        event_box.add(lbox)
        self.connect("button_press_event", self.on_click)

        if tooltip is not None:
            event_box.set_tooltip_text(tooltip)

        nbox = gtk.HBox()
        nbox.pack_start(event_box, True, True)

        self.add(nbox)

        self.set_app_paintable(True)
        self.realize()
        self.window.set_background(background_color)

        self.set_opacity(0.8)

        self.timer_id = None
        self.set_default_size(max_width, -1)
        self.connect("size-allocate", self.relocate)
        self.show_all()

    def append_text(self, text):
        text1, text2 = (text + '\n').split('\n', 1)
        text = self.text_markup % (self.foreground_color, escape(text1), escape(text2))
        self.text = self.text + "\n" + text
        self.message_label.set_text(self.text)
        self.message_label.set_use_markup(True)
        self.message_label.show()

    def relocate(self, widget=None, allocation=None):
        width, height = self.get_size()

        screen_w = gtk.gdk.screen_width()
        screen_h = gtk.gdk.screen_height()
        x = screen_w - width - 20
        y = 30
        self.move(x,y)

    def on_click(self, widget, event):
        if self.callback is not None:
            self.callback()
        self.close()

    def show(self):
        self.show_all()
        self.timer_id = glib.timeout_add_seconds(15, self.close)
        return True

    def close(self, *args):
        global actual_notification
        global queue

        self.hide()
        if self.timer_id is not None:
            glib.source_remove(self.timer_id)
        if len(queue) != 0:
            title, text, icon_file, callback, tooltip = queue.pop(0)
            actual_notification = Notification(title, text, icon_file, callback, tooltip)
            actual_notification.show()
        else:
            actual_notification = None
        self.destroy()

