#!/usr/bin/env python
# -*- coding:utf8 -*-
import json
import config
import time
import base64
import urllib
import pynotify
import gtk
import db

pynotify.init('Hotot Notification')
notify = pynotify.Notification('Init', '')

webv = None 
app = None

def init_notify():
    notify.set_icon_from_pixbuf(
        gtk.gdk.pixbuf_new_from_file(
            config.get_ui_object ('imgs/ic64_hotot.png')))
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
    elif params[0] == 'cache':
        crack_cache(params)
    else:
        pass

def crack_config(params):
    if params[1] == 'dumps':
        config.dumps()
    elif params[1] == 'loads': # useless
        config.loads()
    elif params[1] == 'push_prefs':
        config.push_prefs(webv)
    elif params[1] == 'save_prefs':
        prefs = db.unserialize_dict(params[2])
        config.save_prefs(prefs)
        apply_prefs()
    elif params[1] == 'set_opt':
        opt = params[2]
        value = params[3]
        config.set(opt, value);
    pass
    
def crack_token(params):
    if params[1] == 'load':
        token = config.load_token()
        push_option('lib.twitterapi', 'access_token', json.loads(token))
    elif params[1] == 'dump':
        config.dump_token(params[2])
    pass
    
def crack_cache(params):
    if params[1] == 'load_screen_name':
        execute_script(db.load_screen_name())
    elif params[1] == 'dump_screen_name':
        db.dump_screen_name(webv)
    pass

def crack_action(params):
    if params[1] == 'user':
        screen_name = params[2]
        load_user(screen_name)
    pass

def crack_system(params):
    if params[1] == 'notify':
        if config.use_native_notify:
            summary = base64.decodestring(params[2])
            body = base64.decodestring(params[3])
            notify.update(summary, body)
            notify.show()
    elif params[1] == 'quit':
        app.quit(); 
    pass

def execute_script(script):
    return webv.execute_script(script)

def push_option(set, name, value):
    webv.execute_script('%s[%s]=%s' % (set, name, value));
    pass

def update_status(text):
    webv.execute_script('''
        ui.StatusBox.update_status('%s');
        ''' % text);
    pass

def show_dialog(dialog):
    webv.execute_script('''
        show_dialog('%s');
        ''' % dialog);
    pass

def load_user(screen_name):
    webv.execute_script('''
        ui.Main.reset_people_page(null, '%s');
        $('#people_tweet_block > ul').html('');
        ui.Notification.set("Loading @%s\'s timeline...").show();
        daemon.Updater.update_people();
        ''' % (screen_name, screen_name));
    pass

def apply_prefs(): 
    remember_password = config.remember_password
    font_family_used = config.font_family_used
    font_size = config.font_size

    consumer_key = config.consumer_key
    consumer_secret = config.consumer_secret

    api_base = config.api_base
    webv.execute_script('''
        $('#chk_remember_password').attr('checked', eval('%s'));
        $('body').css('font-family', '%s');
        globals.tweet_font_size = %s;
        lib.twitterapi.api_base = '%s';
        jsOAuth.key = '%s';
        jsOAuth.secret = '%s';
        ''' % (
              'true' if remember_password else 'false'
            , font_family_used, font_size
            , api_base
            , consumer_key, consumer_secret ))

def apply_config():
    default_username = config.default_username
    default_password = config.default_password
    access_token = config.load_token()
    webv.execute_script('''
        $('#tbox_basic_auth_username').attr('value', '%s');
        $('#tbox_basic_auth_password').attr('value', '%s');
        jsOAuth.access_token = utility.DB.unserialize_dict('%s');
        ''' % (default_username, default_password
            , access_token))

    apply_prefs()
    pass

def load_cache():
    # load screen_names
    execute_script(db.load_screen_name())

