#!/usr/bin/env python
# -*- coding:utf8 -*-
import config
import os
import pickle
import json
import urllib
try:
    import jswebkit
except ImportError:
    CAN_EVAL_SCRIPT = False
else:
    CAN_EVAL_SCRIPT = True


DEFAULT_SCREEN_NAME = ["hotot"]

def unserialize_dict(str):
     return dict([(urllib.unquote(each[0]), urllib.unquote(each[1]))
            for each in [pairs.split('=')
                for pairs in str.split('&')]])

def unserialize_array(str):
    return [urllib.unquote(elem) for elem in str.split('&')]

def get_screen_name(webv):
    if CAN_EVAL_SCRIPT:
        return  webv.ctx().EvaluateScript('''
            utility.DB.json(utility.DB.auto_complete_list)
        ''')
    else:
        return json.dumps(DEFAULT_SCREEN_NAME)

def dump_screen_name(screen_name_list):
    # screen_name_list = unserialize_array(str)
    f = open(config.screen_name_cache, 'w')
    f.write(pickle.dumps(json.loads(screen_name_list)))
    f.close()
    pass

def load_screen_name():
    def write_defalut():
        f = open(config.screen_name_cache,'w')
        f.write(pickle.dumps(DEFAULT_SCREEN_NAME))
        f.close()
        pass
    if not os.path.exists(config.screen_name_cache):
        write_defalut()
    f = open(config.screen_name_cache, 'r')
    raw = f.read()
    f.close()
    try:
        list = pickle.loads(raw)
    except:
        list = DEFAULT_SCREEN_NAME
    return '''
        utility.DB.auto_complete_list=%s;
    ''' % json.dumps(list)
