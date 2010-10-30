# -*- coding: UTF-8 -*-

import os
import pickle
import json
import gtk
import sys
import glob
import shutil

PROGRAM_NAME = 'hotot'
UI_DIR_NAME = 'ui'
EXT_DIR_NAME = 'ext'
SOUND_DIR_NAME = 'sound'
LAUNCH_DIR = os.path.abspath(sys.path[0])
CONF_DIR = os.path.join(os.path.expanduser('~'), '.config', PROGRAM_NAME)
DB_DIR = os.path.join(CONF_DIR, 'db')
CACHE_DIR = os.path.join(os.path.expanduser('~'), '.cache', PROGRAM_NAME)
AVATAR_CACHE_DIR = os.path.join(CACHE_DIR, 'avatar')
PROFILES_DIR = os.path.join(CONF_DIR, 'profiles')


DATA_DIRS = []

DATA_BASE_DIRS = [
      '/usr/local/share'
    , '/usr/share'
    , os.path.join(os.path.expanduser('~'), '.local', 'share')
    ]

DATA_DIRS += [os.path.join(d, PROGRAM_NAME) for d in DATA_BASE_DIRS]
DATA_DIRS.append(os.path.abspath('./data'))

TEMPLATE = 'index.html'

default_config = {
    'remember_password': False,
    'default_username':'',
    'default_password':'',
#Appearance:
    'font_family_used': 'Droid Sans Fallback, WenQuanYi Micro Hei, Sans, Microsoft Yahei, Simhei, Simsun',
    'font_size': 12,
    'use_native_input': False,
    'use_native_notify': True,
    'use_ubuntu_indicator': False,
    'use_hover_box': True,
    'use_preload_conversation': True,
    # Appearance > Notification:
    'use_home_timeline_notify': True,
    'use_home_timeline_notify_type': 'count',
    'use_home_timeline_notify_sound': True,
    'use_mentions_notify': True,
    'use_mentions_notify_type': 'content',
    'use_mentions_notify_sound': True,
    'use_direct_messages_inbox_notify': True,
    'use_direct_messages_inbox_notify_type': 'content',
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
    
#update interval:
    'update_interval': 120,
    'consumer_key': 'SCEdx4ZEOO68QDCTC7FFUQ',
    'consumer_secret': '2IBoGkVrpwOo7UZhjkYYekw0ciXG1WHpsqQtUqZCSw',

#others:
    'exts_enabled': ["org.hotot.imagepreview", "org.hotot.gmap", "org.hotot.translate", "org.hotot.imageupload"],
    'size_w': 500,
    'size_h': 550,
}

active_profile = ''

profiles = {'default': {}}
profiles['default'].update(default_config)
profiles['default']['tokenfile'] = CONF_DIR + '/tmp.token'
profiles['default']['name'] = 'default'

profile_paths = glob.glob(PROFILES_DIR +'/*@*')
for path in profile_paths:
    _ , name = os.path.split(path)
    if not profiles.has_key(name):
        profiles[name]= {
              'name': name
            , 'path': path + '/profile.conf'
            , 'tokenfile': path + '/profile.token'}
    else:
        profiles[name]['name'] = name 
        profiles[name]['path'] = path + '/profile.conf'
        profiles[name]['tokenfile'] = path + '/profile.token'
    if not os.path.exists(profiles[name]['path']): 
        write_to_disk(profiles[name])

def getconf():
    '''获取 config
    '''
    config = {}
    config['profiles'] = {}
    ##
    abspath = os.path.abspath('./')

    if not os.path.isdir(CONF_DIR): os.makedirs(CONF_DIR)    
    if not os.path.isdir(PROFILES_DIR): os.makedirs(PROFILES_DIR)
    if not os.path.isdir(AVATAR_CACHE_DIR): os.makedirs(AVATAR_CACHE_DIR) 

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
    return config

def create_profile(profile_name):
    config = getconf()
    path = os.path.join(PROFILES_DIR, profile_name)
    conf = os.path.join(path, 'profile.conf')
    token = os.path.join(path, 'profile.token')
    if os.path.exists(path):
        return
    if not os.path.exists(path): 
        os.makedirs(path)
    
    config['profiles'][profile_name] = {}
    config['profiles'][profile_name].update(config['profiles']['default'])
    config['profiles'][profile_name].update({
          'name': profile_name
        , 'path': conf
        , 'tokenfile': token
    })
    dumps(profile_name)
    if os.path.exists(os.path.join(CONF_DIR, 'tmp.token')):
        shutil.move(os.path.join(CONF_DIR, 'tmp.token')
            , os.path.join(token))
    loads(profile_name)
    pass

def delete_profile(profile_name):
    config = getconf()    
    if config['profiles'].has_key(profile_name):
        prof_path = os.path.join(PROFILES_DIR, profile_name)
        if os.path.exists(prof_path):
            shutil.rmtree(prof_path)
            del globals()['profiles'][profile_name]

def loads(profile_name=None):
    '''读取 config
    '''
    config = getconf()
    loaded_profiles = None
    if profile_name == None or not config['profiles'].has_key(profile_name):
        loaded_profiles = config['profiles']
    else:
        loaded_profiles = {profile_name: config['profiles'][profile_name]}
    pass
    
    for name, prof in loaded_profiles.iteritems():
        if name == 'default':
            continue
        # load default 
        for k, v in default_config.iteritems():
            prof[k] = v
        # load from file
        try: 
            config_raw = json.loads(file(prof['path']).read().encode('utf-8'))
            for k, v in config_raw.iteritems():
                prof[k.encode('utf-8')] \
                    = v.encode('utf-8') if isinstance(v, unicode) else v
        except Exception, e: 
            print 'error:%s'% str(e)
        globals()['profiles'][name].update(prof)
        pass
    return config

def dumps(profile_name=None):
    '''保存 config
    '''
    config = getconf()
    dumped_profiles = None
    if profile_name == None or not config['profiles'].has_key(profile_name):
        dumped_profiles = config['profiles']
    else:
        dumped_profiles = {
            profile_name: config['profiles'][profile_name]}
    pass
    for name, prof in dumped_profiles.iteritems():
        write_to_disk(prof)
    globals()['profiles'].update(config['profiles'])
    pass

def write_to_disk(prof):
    if prof['name'] == 'default':
        return None
    conf_file = open(prof['path'], 'w')
    conf_file.write('{ "version": 0 \n')
    for key, val in default_config.iteritems():
        r_val =  prof[key] if prof.has_key(key) else val
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

def load_token(prof_name):
    config = getconf()
    if not os.path.exists(config['profiles'][prof_name]['tokenfile']):
        return None
    token = pickle.loads(file(config['profiles'][prof_name]['tokenfile']).read())
    return token

def dump_token(prof_name, token):
    config = getconf()
    file(config['profiles'][prof_name]['tokenfile'], 'w').write(pickle.dumps(token))
    return config

def save_prefs(prof_name, prefs_obj):
    config = getconf()
    config['profiles'][prof_name].update(prefs_obj);
    globals()['profiles'][prof_name].update(config['profiles'][prof_name])
    dumps(prof_name)
    pass

def restore_defaults(prof_name):
    globals()['profiles'][prof_name].update(default_config)
    pass

def set(prof_name, name, value):
    globals()['profiles'][prof_name][name] = value;
    pass

def get(prof_name, name):
    return globals()['profiles'][prof_name][name];




