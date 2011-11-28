# -*- coding: UTF-8 -*-

from gi.repository import GLib;
import os
import pickle
import json
import sys
import glob
import shutil

PROGRAM_NAME = 'hotot'
EXT_DIR_NAME = 'ext'
THEME_DIR_NAME = 'theme'
CONF_DIR = os.path.join(GLib.get_user_config_dir(), PROGRAM_NAME)
DB_DIR = os.path.join(CONF_DIR, 'db')
CACHE_DIR = os.path.join(GLib.get_user_cache_dir(), PROGRAM_NAME)
AVATAR_CACHE_DIR = os.path.join(CACHE_DIR, 'avatar')

DATA_DIRS = []

DATA_BASE_DIRS = [
      '/usr/local/share'
    , '/usr/share'
    , GLib.get_user_data_dir()
    ]

DATA_DIRS += [os.path.join(d, PROGRAM_NAME) for d in DATA_BASE_DIRS]
DATA_DIRS.append(os.path.abspath('./data'))

TEMPLATE = 'index.html'

settings = {}

def getconf():
    '''获取 config
    '''
    config = {}
    ##

    if not os.path.isdir(CONF_DIR): os.makedirs(CONF_DIR)
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

def loads():
    config = getconf();

def load_settings(pushed_settings):
    pushed_settings = dict([(k.encode('utf8'), v) for k, v in pushed_settings.items()])
    globals()['settings'] = pushed_settings
    return settings

