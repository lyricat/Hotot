#!/usr/bin/env python
# -*- coding:utf8 -*-
import gtk
gtk.gdk.threads_init() ## fix issue 24
import webkit
import agent
import config
from webkit import WebView
import utils

try: import i18n
except: from gettext import gettext as _

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
        except:
            pass
        webkit.set_web_database_directory_path(config.DB_DIR)
        webkit.set_default_web_database_quota(1024**3L)
        ## bind events
        self.connect('navigation-requested',
            self.on_navigation_requested);
        self.connect('load-finished', self.on_load_finish);
        templatefile = utils.get_ui_object(config.TEMPLATE)
        template = open(templatefile, 'rb').read()
        template = i18n.trans_html(template)
        self.load_html_string(template, 'file://' + templatefile)
        pass

    def ctx(self, *args):
        try:
            import jswebkit
        except:
            print 'Error: module `python-jswebkit` is not available.'
            pass
        else:
            ctx = jswebkit.JSContext(
                self.get_main_frame().get_global_context())
        return ctx

    def on_navigation_requested(self, view, webframe, request):
        # get uri from request object
        uri=request.get_uri()
        if uri.startswith('file://'):
            return 0
        elif uri.startswith('hotot:'):
            agent.crack_hotot(uri[6:])
        elif uri.startswith('about:'):
            return 1
        else:
            utils.open_webbrowser(uri)
        return 1

    def on_load_finish(self, view, webframe):
        self.load_finish_flag = True;
        view.execute_script("""
        i18n_dict = %s;
        function _(msg){
            return msg && i18n_dict[msg] || msg;
        };
        """ % i18n.get_i18n_json())
        agent.webv = self
        agent.set_style_scheme()
        agent.push_profiles()
        agent.apply_config()
        agent.load_exts()
        pass



