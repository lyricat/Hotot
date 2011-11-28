from gi.repository import Gtk, WebKit

class HototInspector ():
    def __init__ (self, inspector):
        self.webview = WebKit.WebView()

        scrolled_window = Gtk.ScrolledWindow()
        scrolled_window.add(self.webview)
        scrolled_window.show_all()

        self.window = Gtk.Window()
        self.window.add(scrolled_window)
        self.window.set_default_size(600, 480)
        self.window.set_title("Hotot Inspector")
        self.window.connect("delete-event", self.on_delete_event)

        inspector.set_property("javascript-profiling-enabled", True)
        inspector.set_property("timeline-profiling-enabled", True)
        inspector.connect("inspect-web-view", self.on_inspect_web_view)
        inspector.connect("show-window", self.on_show_window)
        inspector.connect("close-window", self.on_close_window)
        inspector.connect("finished", self.on_finished)

    def __del__ (self):
        self.window.destory()

    def on_delete_event (self, widget, event):
        self.window.hide()
        return True

    def on_inspect_web_view (self, inspector, web_view):
        return self.webview

    def on_show_window (self, inspector):
        self.window.present()
        return True

    def on_close_window (self, inspector):
        self.window.hide()
        return True

    def on_finished (self, inspector):
        self.window.hide()

