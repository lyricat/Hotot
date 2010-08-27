# -*- coding:utf8 -*-

import os
import pickle
import json
import gtk
import sys
import db

PROGRAM_NAME = "hotot"
UI_DIR_NAME = "ui"
LAUNCH_DIR = os.path.abspath(sys.path[0])
CONF_DIR = os.path.join(os.path.expanduser('~'), '.config', PROGRAM_NAME)
CACHE_DIR = os.path.join(os.path.expanduser('~'), '.cache', PROGRAM_NAME)
AVATAR_CACHE_DIR = os.path.join(CACHE_DIR, 'avatar')

DATA_DIRS = [os.path.abspath('./data')]

DATA_BASE_DIRS = [
      os.path.join(os.path.expanduser('~'), '.local', 'share')
    , '/usr/local/share', '/usr/share']

DATA_DIRS += [os.path.join(d, PROGRAM_NAME) for d in DATA_BASE_DIRS]


default_config = {
    'remember_password': False,
    'default_username':'',
    'default_password':'',
#template:
    'font_family_used': 'Sans',
    'font_size': 12,
    'use_native_input': False,
    'use_native_notify': True,
    'shortcut_summon_hotot': '<Alt>C',
    'template':'index.html',
#api url:
    'api_base': 'http://api.twitter.com/1/',
    'oauth_base': 'https://twitter.com/oauth/',
    'use_pyrequest'
#update interval:
    'update_interval': 120,
    'consumer_key': 'SCEdx4ZEOO68QDCTC7FFUQ',
    'consumer_secret': '2IBoGkVrpwOo7UZhjkYYekw0ciXG1WHpsqQtUqZCSw',
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
    screen_name_cache = CACHE_DIR + '/screen_name.cache'
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
    config['screen_name_cache'] = screen_name_cache
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
    if value.isdigit():
        value = int(value)
    else:
        if value =='True':
            value = True
        elif value == 'False':
            value = False
    globals()[name] = value;
    pass

def get(name):
    return globals()[name];

def get_ui_object(name):
    for base in DATA_DIRS:
        fullpath = os.path.join(base, UI_DIR_NAME, name)
        if os.path.exists(fullpath):
            return fullpath

