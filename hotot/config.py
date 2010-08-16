# -*- coding:utf8 -*-

import os
import pickle
import json
import sys

PROGRAM_NAME = "hotot"
UI_DIR_NAME = "ui"
LAUNCH_DIR = os.path.abspath(sys.path[0])
CONF_DIR = os.path.join(os.path.expanduser('~'), '.config', PROGRAM_NAME)
CACHE_DIR = os.path.join(os.path.expanduser('~'), '.cache', PROGRAM_NAME)

DATA_DIRS = [os.path.abspath('./data')]

DATA_BASE_DIRS = [
      os.path.join(os.path.expanduser('~'), '.local', 'share')
    , '/usr/local/share', '/usr/share']

DATA_DIRS += [os.path.join(d, PROGRAM_NAME) for d in DATA_BASE_DIRS]


opts = {
    'remember_password': False,
    'default_username':'',
    'default_password':'',
#template:
    'use_native_input': False,
    'use_native_notify': True,
    'shortcut_summon_hotot': '<Alt>C',
    'template':'index.html',
#api url:
    'api_base': 'http://api.twitter.com/1',
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
    profdir = os.environ['HOME'] + '/.config/hotot'
    avatarcachedir = profdir + '/picscache'
    if not os.path.isdir(profdir): os.makedirs(profdir)    
    if not os.path.isdir(avatarcachedir): os.makedirs(avatarcachedir) 
    
    tokenfile = profdir + '/profile.token'
    prof = profdir + '/hotot.conf'
    if not os.path.exists(prof): 
        write_to_disk(prof)
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
    config['profdir'] = profdir
    config['avatarcachedir'] = avatarcachedir
    config['prof'] = prof
    config['tokenfile'] = tokenfile
    return config

def loads():
    '''读取 config
    '''
    config = getconf()
    ##
    try: 
        config_raw = json.loads(file(config['prof']).read().encode('utf-8'))
        for k,v in config_raw.iteritems():
            config[k.encode('utf-8')]=v.encode('utf-8') if isinstance(v, unicode) else v
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
    write_to_disk(config['prof'])
    pass

def write_to_disk(prof):
    conf_file = open(prof, 'w')
    conf_file.write('{ "version": 0 \n')
    for key, val in opts.iteritems():
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
        return 'null'
    token = pickle.loads(file(config['tokenfile']).read())
    return token

def dump_token(token):
    config = getconf()
    file(config['tokenfile'], 'w').write(pickle.dumps(token))
    return config

def apply_config(webv):
    config = getconf()
    default_username = config['default_username']
    default_password = config['default_password']
    remember_password = config['remember_password']
    consumer_key = config['consumer_key']
    consumer_secret = config['consumer_secret']
    api_base = config['api_base'];
    access_token = load_token()
    webv.execute_script('''
        $('#tbox_basic_auth_username').attr('value', '%s');
        $('#tbox_basic_auth_password').attr('value', '%s');
        $('#chk_remember_password').attr('checked', eval('%s'));
        lib.twitterapi.api_base = '%s';
        jsOAuth.key = '%s';
        jsOAuth.secret = '%s';
        jsOAuth.access_token = jsOAuth.load_token('%s');
        ''' % (default_username, default_password
            , 'true' if remember_password else 'false'
            , api_base
            , consumer_key, consumer_secret
            , access_token))
    pass

def save_prefs(prefs_obj):
    config = getconf()
    config.update(prefs_obj);
    globals().update(config)
    dumps()
    pass

def push_prefs(webv):
    loads()
    config = getconf()
    # account settings
    remember_password = 'true' if config['remember_password'] else 'false'
    consumer_key = config['consumer_key']
    consumer_secret = config['consumer_secret']
    
    # system settings
    shortcut_summon_hotot = config['shortcut_summon_hotot']

    # display settings 
    use_native_input = 'true' if config['use_native_input'] else 'false'
    use_native_notify = 'true' if config['use_native_notify'] else 'false'

    # networks settings
    api_base = config['api_base'];
    
    webv.execute_script('''
        var prefs_obj = {
          "remember_password": %s
        , "consumer_key": "%s"
        , "consumer_secret": "%s"
        , "shortcut_summon_hotot": "%s"
        , "use_native_input": %s
        , "use_native_notify": %s
        , "api_base": "%s"
        };
        ui.PrefsDlg.request_prefs_cb(eval(prefs_obj));
        ''' % (remember_password
            , consumer_key, consumer_secret
            , shortcut_summon_hotot
            , use_native_input, use_native_notify
            , api_base));
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

