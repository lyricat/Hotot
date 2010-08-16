#!/usr/bin/env python
# -*- coding:utf8 -*-
import json
import config
import time
import base64
import pynotify
import gtk

pynotify.init('Hotot Notification')
notify = pynotify.Notification('Init', '')

view = None 
app = None

def init_notify():
    notify.set_icon_from_pixbuf(
        gtk.gdk.pixbuf_new_from_file(config.abspath + '/imgs/ic64_hotot.png'))
    notify.set_timeout(3000)
    pass

def crack_hotot(uri):
    params = uri.split('/')
    if params[0] == 'token':
        crack_token(params)
    elif params[0] == 'config':
        crack_config(params)
    elif params[0] == 'system':
        crack_system(params)
    elif params[0] == 'action':
        crack_action(params)
    else:
        pass

def crack_config(params):
    opt = params[1]
    value = params[2]
    config.set(opt, value);
    pass
    
def crack_token(params):
    if params[1] == 'load':
        token = config.load_token()
        push_option('lib.twitterapi', 'access_token', json.loads(token))
    elif params[1] == 'dump':
        config.dump_token(params[2])
    pass
    
def crack_action(params):
    if params[1] == 'user':
        screen_name = params[2]
        load_user(screen_name)
    pass

def crack_system(params):
    if params[1] == 'dumps':
        config.dumps()
    elif params[1] == 'loads':
        config.loads()
    elif params[1] == 'push_prefs':
        config.push_prefs(view)
    elif params[1] == 'save_prefs':
        str = base64.decodestring(params[2])
        prefs = dict([pairs.split('=') for pairs in str.split('&')])
        config.save_prefs(prefs)
    elif params[1] == 'notify':
        if config.use_native_notify:
            summary = base64.decodestring(params[2])
            body = base64.decodestring(params[3])
            notify.update(summary, body)
            notify.show()
    elif params[1] == 'quit':
        app.quit(); 
    pass

def push_option(set, name, value):
    view.execute_script('%s[%s]=%s' % (set, name, value));
    pass

def update_status(text):
    view.execute_script('''
        ui.StatusBox.update_status('%s');
        ''' % text);
    pass

def show_dialog(dialog):
    view.execute_script('''
        show_dialog('%s');
        ''' % dialog);
    pass

def load_user(screen_name):
    view.execute_script('''
        ui.Main.reset_people_page(null, '%s');
        $('#people_tweet_block > ul').html('');
        ui.Notification.set("Loading @%s\'s timeline...").show();
        daemon.Updater.update_people();
        ''' % (screen_name, screen_name));
    pass

