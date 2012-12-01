# -*- coding: UTF-8 -*-
import gtk
gtk.gdk.threads_init() ## fix issue 24
import webkit
import agent
import config
from webkit import WebView
import utils
import json
import gobject
import os
import platform

try: import i18n
except: from gettext import gettext as _
TARGET_TYPE_URI_LIST = 80
dnd_list = [ ( 'text/uri-list', 0, TARGET_TYPE_URI_LIST ) ]

class MainView(WebView):
    def __init__(self):
        WebView.__init__(self)
        self.load_finish_flag = False
        self.set_property('can-focus', True)
        self.set_property('can-default', True)
        self.set_full_content_zoom(1)
        self.clipbord = gtk.Clipboard()

        settings = self.get_settings()
        try:
            settings.set_property('enable-universal-access-from-file-uris', True)
            settings.set_property('javascript-can-access-clipboard', True)
            settings.set_property('enable-default-context-menu', True)
            settings.set_property('enable-page-cache', True)
            settings.set_property('tab-key-cycles-through-elements', True)
            settings.set_property('enable-file-access-from-file-uris', True)
            settings.set_property('enable-spell-checking', False)
            settings.set_property('enable-caret-browsing', False)
            try:
                # Since 1.7.5
                settings.set_property('enable-accelerated-compositing', True)
            except TypeError:
                pass
        except:
            print 'Error: settings property was not set.'
        webkit.set_web_database_directory_path(config.DB_DIR)
        webkit.set_default_web_database_quota(1024**3L)
        ## bind events
        self.connect('navigation-requested', self.on_navigation_requested);
        self.connect('new-window-policy-decision-requested', self.on_new_window_requested);
        self.connect('script-alert', self.on_script_alert)
        self.connect('load-finished', self.on_load_finish)
        self.connect("hovering-over-link", self.on_over_link)
#        self.connect('drag_data_received', self.on_drag_data_received)
#        self.connect('drag_motion', self.on_drag_motion)
#        self.connect('drag_drop', self.on_drag_drop)
#        self.drag_dest_set(gtk.DEST_DEFAULT_DROP,
#                  dnd_list, gtk.gdk.ACTION_COPY)
        templatefile = utils.get_ui_object(config.TEMPLATE)
        template = open(templatefile, 'rb').read()
        self.load_html_string(template, 'file://' + templatefile)

    def on_navigation_requested(self, view, webframe, request):
        return self.handle_uri(request.get_uri())

    def on_new_window_requested(self, view, frame, request, decision, u_data):
        return self.handle_uri(request.get_uri())

    def handle_uri(self, uri):
        if uri.startswith('file://'):
            return False
        elif uri.startswith('hotot:'):
            self.on_hotot_action(uri)
            return True
        elif uri.startswith('about:'):
            return True
        elif uri.startswith('http://stat.hotot.org'):
            return False
        else:
            utils.open_webbrowser(uri)
        return True

    def on_script_alert(self, view, webframe, message):
        if message.startswith('hotot:'):
            self.on_hotot_action(message)
            return True
        return False

    def on_hotot_action(self, uri):
        if uri.startswith('hotot:'):
            agent.crack_hotot(uri[6:])
        return True

    def on_load_finish(self, view, webframe):
        if self.load_finish_flag:
            return
        self.load_finish_flag = True;
        agent.webv = self
        # overlay extra variables of web part
        variables = {
              'platform': platform.system()
            , 'wrapper': 'python-gtk2'
            , 'conf_dir': config.CONF_DIR
            , 'cache_dir': config.CACHE_DIR
            , 'avatar_cache_dir': config.AVATAR_CACHE_DIR
            , 'extra_fonts': utils.get_extra_fonts()
            , 'extra_exts': utils.get_extra_exts()
            , 'extra_themes': utils.get_extra_themes()
            , 'locale': utils.get_locale()
        };
        # and then, notify web part i am ready to work :)
        gobject.idle_add(view.execute_script, '''
            overlay_variables(%s);
            globals.load_flags = 1;
            ''' % json.dumps(variables))

    def on_over_link(self, view, alt, href):
        href = href or ""
        if not alt and not href.startswith('file:'):
            self.parent.set_tooltip_text(href)

    def on_drag_motion(self, view, context, x, y, time):
        context.drag_status(gtk.gdk.ACTION_COPY, time)
        return True

    def on_drag_drop(self, view, context, x, y, time):
        context.finish(True, False, time)
        return True 

    def on_drag_data_received(self, view, context, x, y, selection, target_type, time):
        if target_type != TARGET_TYPE_URI_LIST:
            print target_type, 'is not supported.'
            return
        uri = selection.data.strip('\r\n\x00')
        # print 'uri', uri
        uri_splitted = uri.split()
        if len(uri_splitted) >= 1:
            path =utils.get_file_path_from_dnd_dropped_uri(uri_splitted[0])
        else:
            return
        if os.path.isfile(path):
            gobject.idle_add(view.execute_script, '''
                ui.ImageUploader.pyload("%s");
                ui.ImageUploader.show();
                ''' % path)

