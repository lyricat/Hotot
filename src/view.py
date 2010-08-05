#!/usr/bin/env python
# -*- coding:utf8 -*-
import webkit
import agent
import config

class MainView(webkit.WebView):
    def __init__(self):
        webkit.WebView.__init__(self)
        self.load_finish_flag = False
        self.set_property('can-focus', True)
        self.set_property('can-default', True)
        self.set_full_content_zoom(1)

        settings = self.get_settings()
        settings.set_property('enable-xss-auditor', False)
        settings.set_property('enable-universal-access-from-file-uris', True)
        settings.set_property('enable-file-access-from-file-uris', True)
        settings.set_property('enable-page-cache', True)
        settings.set_property('tab-key-cycles-through-elements', False)
        ##
        self.connect('navigation-requested',
            self.on_navigation_requested);
        self.connect('load-finished', self.on_load_finish);
        self.open('file://'+config.abspath+'/'+config.template);
        pass

    def on_navigation_requested(self, view, webframe, request):
        # get uri from request object
        uri=request.get_uri()
        if uri.startswith('file://'):
            return 0
        elif uri.startswith('hotot:'):
            agent.crack_hotot(uri[6:])
        else:
            import webbrowser
            webbrowser.open_new_tab(uri)
        return 1

    def on_load_finish(self, view, webframe):
        self.load_finish_flag = True;
        config.apply_config(self)
        pass
