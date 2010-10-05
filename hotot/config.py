# -*- coding: UTF-8 -*-

import os
import pickle
import json
import gtk
import sys

PROGRAM_NAME = 'hotot'
UI_DIR_NAME = 'ui'
EXT_DIR_NAME = 'ext'
SOUND_DIR_NAME = 'sound'
LAUNCH_DIR = os.path.abspath(sys.path[0])
CONF_DIR = os.path.join(os.path.expanduser('~'), '.config', PROGRAM_NAME)
DB_DIR = os.path.join(CONF_DIR, 'db')
CACHE_DIR = os.path.join(os.path.expanduser('~'), '.cache', PROGRAM_NAME)
AVATAR_CACHE_DIR = os.path.join(CACHE_DIR, 'avatar')

DATA_DIRS = []

DATA_BASE_DIRS = [
      '/usr/local/share'
    , '/usr/share'
    , os.path.join(os.path.expanduser('~'), '.local', 'share')
    ]

DATA_DIRS += [os.path.join(d, PROGRAM_NAME) for d in DATA_BASE_DIRS]
DATA_DIRS.append(os.path.abspath('./data'))

default_config = {
    'remember_password': False,
    'default_username':'',
    'default_password':'',
#template:
    'template':'index.html',
#Appearance:
    'font_family_used': 'Droid Sans Fallback, WenQuanYi Micro Hei, Sans, Microsoft Yahei, Simhei, Simsun',
    'font_size': 12,
    'use_native_input': False,
    'use_native_notify': True,
    'use_ubuntu_indicator': True,
    'use_hover_box': True,
    'use_preload_conversation': True,
    # Appearance > Notification:
    'use_home_timeline_notify': True,
    'use_home_timeline_notify_sound': True,
    'use_mentions_notify': True,
    'use_mentions_notify_sound': True,
    'use_direct_messages_inbox_notify': True,
    'use_direct_messages_inbox_notify_sound': True,
#System:
    'shortcut_summon_hotot': '<Alt>C',
    
#api url:
    'api_base': 'https://api.twitter.com/1/',
    'sign_api_base': 'https://api.twitter.com/',
    'use_same_sign_api_base': True,
    'oauth_base': 'https://api.twitter.com/oauth/',
    'sign_oauth_base': 'https://api.twitter.com/oauth/',
    'use_same_sign_oauth_base': True,
    'search_api_base': 'http://search.twitter.com/',
#proxy:
    'use_http_proxy': False,
    'http_proxy_host': '',
    'http_proxy_port': 0,
    'use_socks_proxy': False,
    'socks_proxy_host': '',
    'socks_proxy_port': 0,
    
#update interval:
    'update_interval': 120,
    'consumer_key': 'SCEdx4ZEOO68QDCTC7FFUQ',
    'consumer_secret': '2IBoGkVrpwOo7UZhjkYYekw0ciXG1WHpsqQtUqZCSw',

#others:
    'exts_enabled': ["org.hotot.imagepreview", "org.hotot.gmap", "org.hotot.translate", "org.hotot.imageupload"],
    'size_w': 750,
    'size_h': 550,
}

def getconf():
    '''获取 config
    '''
    config = {}
    ##
    abspath = os.path.abspath('./')

    if not os.path.isdir(CONF_DIR): os.makedirs(CONF_DIR)    
    if not os.path.isdir(AVATAR_CACHE_DIR): os.makedirs(AVATAR_CACHE_DIR) 
    

    tokenfile = CONF_DIR + '/profile.token'
    prefs = CONF_DIR + '/hotot.conf'
    if not os.path.exists(prefs): 
        write_to_disk(prefs)
    ##    
    for k, v in globals().items():
        if not k.startswith('__') and (
              isinstance(v, str) 
           or isinstance(v, int)
           or isinstance(v, long)
           or isinstance(v, float)
           or isinstance(v, dict)
           or isinstance(v, list)
           or isinstance(v, bool)
           ):
            config[k] = v
            pass
    config['abspath'] = abspath
    config['prefs'] = prefs
    config['tokenfile'] = tokenfile
    return config

def loads():
    '''读取 config
    '''
    config = getconf()
    ##
    try: 
        for k, v in default_config.iteritems():
            config[k] = v
        config_raw = json.loads(file(config['prefs']).read().encode('utf-8'))
        for k, v in config_raw.iteritems():
            config[k.encode('utf-8')] \
                = v.encode('utf-8') if isinstance(v, unicode) else v
    except Exception, e: 
        print 'error:%s'% str(e)
    ##
    globals().update(config)
    return config

def dumps():
    '''保存 config
    '''
    config = getconf()
    globals().update(config)
    write_to_disk(config['prefs'])
    pass

def write_to_disk(prefs):
    conf_file = open(prefs, 'w')
    conf_file.write('{ "version": 0 \n')
    for key, val in default_config.iteritems():
        r_val =  globals()[key] if globals().has_key(key) else val
        if isinstance(val, str):
            conf_file.write(',    "%s": "%s"\n' % (key, r_val))
        elif isinstance(val, bool):
            conf_file.write(',    "%s": %s\n' % (key, str(r_val).lower()))
        elif isinstance(val, list):
            conf_file.write(',    "%s": %s\n' % (key, json.dumps(r_val)))
        else:
            conf_file.write(',    "%s": %s\n' % (key, r_val))
    conf_file.write('}\n')
    conf_file.close()
    pass

def load_token():
    config = getconf()
    if not os.path.exists(config['tokenfile']):
        return None
    token = pickle.loads(file(config['tokenfile']).read())
    return token

def dump_token(token):
    config = getconf()
    file(config['tokenfile'], 'w').write(pickle.dumps(token))
    return config

def save_prefs(prefs_obj):
    config = getconf()
    config.update(prefs_obj);
    globals().update(config)
    dumps()
    pass

def restore_defaults():
    globals().update(default_config)
    pass

def set(name, value):
    globals()[name] = value;
    pass

def get(name):
    return globals()[name];

def get_ui_object(name):
    for base in DATA_DIRS:
        fullpath = os.path.join(base, UI_DIR_NAME, name)
        if os.path.exists(fullpath):
            return fullpath

def get_sound(name):
    for base in DATA_DIRS:
        fullpath = os.path.join(base, SOUND_DIR_NAME, name + '.wav')
        if os.path.exists(fullpath):
            return fullpath

def get_exts():
    import glob
    exts = []
    for base in DATA_DIRS:
        files = glob.glob(os.path.join(base, EXT_DIR_NAME) + '/*')
        ext_dirs = filter(lambda x: os.path.isdir(x), files)
        for dir in ext_dirs:
            ext_js = os.path.join(dir, 'entry.js')
            if os.path.exists(ext_js):
                exts.append('file://%s' % ext_js)
            pass
        pass
    return exts


