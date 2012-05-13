# -*- coding: UTF-8 -*-

from gi.repository import GLib
import os
import pickle
import json
import sys
import glob
import shutil

TEMPLATE = 'index.html'
ENABLE_INSPECTOR = False

dirs = {}

settings = {}

def getconf():
    '''获取 config
    '''
    config = {}
    ##

    if not os.path.isdir(dirs["conf"]): os.makedirs(dirs["conf"])
    if not os.path.isdir(dirs["avatar"]): os.makedirs(dirs["avatar"])

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

def init():
    program = 'hotot'
    dirs["conf"] = os.path.join(GLib.get_user_config_dir(), program)
    dirs["db"] = os.path.join(dirs["conf"], 'db')
    dirs["cache"] = os.path.join(GLib.get_user_cache_dir(), program)
    dirs["avatar"] = os.path.join(dirs["cache"], 'avatar')
    dirs["data"] = [os.path.join(d, program) for d in ['/usr/local/share', '/usr/share', GLib.get_user_data_dir()]]
    dirs["data"].append(os.path.abspath('./data'))
    dirs["theme"] = os.path.join(dirs["conf"], 'theme')
    dirs["ext"] = os.path.join(dirs["conf"], 'ext')
    config = getconf();

def get_path(dirname):
    return dirs[dirname]

def load_settings(pushed_settings):
    pushed_settings = dict([(k.encode('utf8'), v) for k, v in pushed_settings.items()])
    globals()['settings'] = pushed_settings
    return settings

