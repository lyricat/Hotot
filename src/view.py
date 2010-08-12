#!/usr/bin/env python
# -*- coding:utf8 -*-
import gtk
import webkit
import agent
import config
import webbrowser

class MainView(webkit.WebView):
    def __init__(self):
        webkit.WebView.__init__(self)
        self.load_finish_flag = False
        self.set_property('can-focus', True)
        self.set_property('can-default', True)
        self.set_full_content_zoom(1)
        self.clipbord = gtk.Clipboard()

        settings = self.get_settings()
        settings.set_property('enable-xss-auditor', False)
        settings.set_property('enable-universal-access-from-file-uris', True)
        settings.set_property('enable-file-access-from-file-uris', True)
        settings.set_property('enable-page-cache', True)
        settings.set_property('tab-key-cycles-through-elements', False)
        settings.set_property('enable-default-context-menu', False)

        ## context menu
        self.contextmenu = gtk.Menu()
        # edit menu items: copy cut past delete
        self.edit_mitems = {} 
        self.edit_mitems['copy'] = gtk.MenuItem('Copy')
        self.edit_mitems['copy'].connect('activate'
            , self.on_mitem_copy_activated)
        self.edit_mitems['cut'] = gtk.MenuItem('Cut')
        self.edit_mitems['cut'].connect('activate'
            , self.on_mitem_cut_activated)
        self.edit_mitems['paste'] = gtk.MenuItem('Paste')
        self.edit_mitems['paste'].connect('activate'
            , self.on_mitem_copy_activated)
        self.edit_mitems['remove'] = gtk.MenuItem('Remove')
        self.edit_mitems['remove'].connect('activate'
            , self.on_mitem_copy_activated)
        map(self.contextmenu.append, self.edit_mitems.values())
        self.contextmenu.append(gtk.MenuItem())

        self.mitem_google = gtk.MenuItem('Buscar con Google')
        self.mitem_google.connect('activate',
            self.on_mitem_google_activated);
        mitem_prefs = gtk.MenuItem('Preferences')
        
        self.contextmenu.append(self.mitem_google)
        self.contextmenu.append(mitem_prefs)
        self.contextmenu.show()

        ## bind events
        self.connect('button-press-event', self.on_button_pressed)
        self.connect('navigation-requested',
            self.on_navigation_requested);
        self.connect('load-finished', self.on_load_finish);
        self.open('file://'+config.abspath+'/'+config.template);
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

    def get_selection(self, *args):
        text = self.ctx().EvaluateScript('''
            document.getSelection().toString();
        ''')
        return text

    def on_navigation_requested(self, view, webframe, request):
        # get uri from request object
        uri=request.get_uri()
        if uri.startswith('file://'):
            return 0
        elif uri.startswith('hotot:'):
            agent.crack_hotot(uri[6:])
        else:
            webbrowser.open_new_tab(uri)
        return 1

    def on_load_finish(self, view, webframe):
        self.load_finish_flag = True;
        config.apply_config(self)
        pass

    def on_mitem_copy_activated(self, item):
        self.clipbord.set_text(self.get_selection().encode('utf-8'))
        pass
        
    def on_mitem_cut_activated(self, item):
        self.execute_script('''
            range = window.getSelection().createRange();
            range.execCommand('Cut');
        ''' % text)
        pass

    def on_mitem_paste_activated(self, item):
        self.execute_script('''
            range = document.createTextRange();
            range.execCommand('Paste');
        ''')
        pass

    def on_mitem_google_activated(self, item):
        selection = self.get_selection()
        webbrowser.open_new_tab('http://google.com/search?sourceid=chrome&ie=UTF-8&q=%s' % selection)
        pass

    def on_button_pressed(self, widget, event):
        def display_edit_mitems():
            # for mitem in self.edit_mitems.values():
            #    mitem.show()
            can_copy = self.has_selection() \
                    and len(self.get_selection()) != 0
            self.edit_mitems['copy'].set_sensitive(can_copy)
            self.edit_mitems['copy'].show()
            
            can_cut = self.can_cut_clipboard()
            self.edit_mitems['cut'].set_sensitive(can_cut)
            can_remove = self.has_selection()
            self.edit_mitems['remove'].set_sensitive(can_remove)
            can_paste = self.can_paste_clipboard()
            self.edit_mitems['paste'].set_sensitive(can_paste)
            pass

        if event.button == 3:
            if self.has_selection():
                # has selection and selection is not null 
                selection = self.get_selection()
                selection = selection[:32] + '...' \
                    if 10 < len(selection) else selection
                display_edit_mitems()
                # show search menu item
                if len(selection) != 0:
                    self.mitem_google.get_child().set_text(
                        'Buscar \'%s\' con Google' % selection)
                    self.mitem_google.show()
                else:
                    self.mitem_google.hide()
            else:
                # hide edit menu items & search menu item
                display_edit_mitems()
                self.mitem_google.hide()
            pass

            self.contextmenu.popup(None, None
                , None, button=event.button
                , activate_time=event.time)
        pass
