# -*- coding: UTF-8 -*-

import os
import pickle
import json
import gtk
import sys
import glob
import shutil
import glib

PROGRAM_NAME = 'hotot'
UI_DIR_NAME = 'ui'
EXT_DIR_NAME = 'ext'
SOUND_DIR_NAME = 'sound'
LAUNCH_DIR = os.path.abspath(sys.path[0])
CONF_DIR = os.path.join(glib.get_user_config_dir(), PROGRAM_NAME)
DB_DIR = os.path.join(CONF_DIR, 'db')
CACHE_DIR = os.path.join(glib.get_user_cache_dir(), PROGRAM_NAME)
AVATAR_CACHE_DIR = os.path.join(CACHE_DIR, 'avatar')
PROFILES_DIR = os.path.join(CONF_DIR, 'profiles')
SYSTEM_CONF = os.path.join(CONF_DIR, 'sys.conf')

DATA_DIRS = []

DATA_BASE_DIRS = [
      '/usr/local/share'
    , '/usr/share'
    , glib.get_user_data_dir()
    ]

DATA_DIRS += [os.path.join(d, PROGRAM_NAME) for d in DATA_BASE_DIRS]
DATA_DIRS.append(os.path.abspath('./data'))

TEMPLATE = 'index.html'

twitter_profile = {
    'remember_password': False,
    'default_username':'',
    'default_password':'',
#Appearance:
    'font_family_used': 'Droid Sans Fallback, WenQuanYi Micro Hei, Sans, Microsoft Yahei, Simhei, Simsun',
    'font_size': 12,
    'use_native_input': False,
    'use_native_notify': True,
    'use_hover_box': True,
    'use_preload_conversation': True,
    'use_auto_loadmore': False,
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

identica_profile = {}
identica_profile.update(twitter_profile)
identica_profile.update({'api_base': 'https://identi.ca/api/'})

default_sys_config = {
    'use_verbose_mode': False,
    'use_ubuntu_indicator': False,
}

active_profile = ''

profiles = {'default': {}}
profiles['default'].update(twitter_profile)
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
        write_profile_to_disk(profiles[name])

sys_conf = {}
sys_conf.update(default_sys_config)


def getconf():
    '''获取 config
    '''
    config = {}
    config['profiles'] = {}
    config['sys_conf'] = {}
    ##

    if not os.path.isdir(CONF_DIR): os.makedirs(CONF_DIR)
    if not os.path.isdir(PROFILES_DIR): os.makedirs(PROFILES_DIR)
    if not os.path.isdir(AVATAR_CACHE_DIR): os.makedirs(AVATAR_CACHE_DIR)

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
    config['profiles'][profile_name].update(
        select_default_profile(profile_name))
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

    for name, prof in loaded_profiles.iteritems():
        if name == 'default':
            continue
        # load default
        for k, v in select_default_profile(profile_name).iteritems():
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
    for name, prof in dumped_profiles.iteritems():
        write_profile_to_disk(prof)
    globals()['profiles'].update(config['profiles'])

def write_to_disk(new, default, path):
    conf_file = open(path, 'w')
    conf_file.write('{ "version": 0 \n')
    for key, val in default.iteritems():
        r_val =  new[key] if new.has_key(key) else val
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

def write_profile_to_disk(prof):
    if prof['name'] == 'default':
        return None
    write_to_disk(prof, select_default_profile(prof['name']), prof['path'])

def write_sys_conf_to_disk():
    write_to_disk(globals()['sys_conf'], default_sys_config, SYSTEM_CONF)

def load_sys_conf():
    '''读取 system config
    '''
    if not os.path.exists(SYSTEM_CONF):
        write_sys_conf_to_disk()
    conf = getconf()
    for k, v in default_sys_config.iteritems():
        conf['sys_conf'][k] = v
    # load from file
    try:
        config_raw = json.loads(file(SYSTEM_CONF).read().encode('utf-8'))
        for k, v in config_raw.iteritems():
            conf['sys_conf'][k.encode('utf-8')] \
                = v.encode('utf-8') if isinstance(v, unicode) else v
    except Exception, e:
        print 'error:%s'% str(e)
    globals()['sys_conf'].update(conf['sys_conf'])
    return conf

def dump_sys_conf():
    '''保存 system config
    '''
    config = getconf()
    write_sys_conf_to_disk()
    globals()['sys_conf'].update(config['sys_conf'])


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

def save_sys_prefs(prefs_obj):
    config = getconf()
    config['sys_conf'].update(prefs_obj);
    globals()['sys_conf'].update(config['sys_conf'])
    dump_sys_conf()

def restore_defaults(prof_name):
    globals()['profiles'][prof_name].update(
        select_default_profile(prof_name))

def select_default_profile(prof_name):
    if prof_name == None or prof_name == 'default':
        return twitter_profile
    protocol = prof_name.split('@')[1];
    if protocol == 'twitter':
        return twitter_profile
    elif protocol == 'identica':
        return identica_profile
    else:
        return twitter_profile

def set(prof_name, name, value):
    globals()['profiles'][prof_name][name] = value;

def get(prof_name, name):
    return globals()['profiles'][prof_name][name];

def sys_set(name, value):
    globals()['sys_conf'][name] = value;

def sys_get(name):
    return globals()['sys_conf'][name];



