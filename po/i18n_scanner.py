#!/usr/bin/env python2
# -*- coding: UTF-8 -*-

import re
import json
import os.path

TEMPLATE = "data/index.html"

DEFAULT_LOCALE_FILE = 'data/_locales/en/messages.json'

JS_FILE_DIR = ['data/js/']

LOCALE_FILE_DIR = 'data/_locales/'


template_tag_re = re.compile('data-i18n-[a-z0-9]+="(.+?)"')
js_tag_re = re.compile('''_\('([a-z0-9_]+)'\)''', re.MULTILINE)

js_tag_map = {}

def scan_template():
    template_file = open(TEMPLATE, 'r')
    html_data = template_file.read()
    template_file.close()
    key_list = template_tag_re.findall(html_data)
    return key_list

def scan_js_dir():
    for dir in JS_FILE_DIR:
        os.path.walk(dir, scan_js_dir_cb, None)

def scan_js_dir_cb(arg, dir_name, f_names):
    ''' scan js files and generate a empty map'''
    for name in f_names:
        if not name.endswith('.js'):
            continue
        path = os.path.join(dir_name, name)
        data = file(path, 'r').read()
        tags = js_tag_re.findall(data) 
        if tags:
            for tag in tags:
                js_tag_map[tag] = {'message': '', 'description': path}

def generate_trans_template(key_list):
    template = {}
    for key in key_list:
        template[key] = {'message':'', 'description': TEMPLATE}
    return template

def load_exist_trans(trans_file):
    return json.loads(file(trans_file).read())

def walk_cb(empty_trans, dir_name, f_names):
    new_trans = ''
    exists_trans = {}
    if dir_name.endswith('data/_locales/'):
        return
    file_path = os.path.join(dir_name, 'messages.json')
    print 'File:', file_path
    if 'messages.json' in f_names:
        trans_file = open(file_path, 'r')
        exists_data = trans_file.read()
        if exists_data:
            exists_trans = json.loads(exists_data)
        else:
            exists_trans = {}
        trans_file.close()
        new_trans = format_out(merge_trans(empty_trans, exists_trans))
        print '[Update]', file_path
    else:
        default_trans = json.loads(file(DEFAULT_LOCALE_FILE, 'r').read())
        new_trans = format_out(merge_trans(empty_trans, default_trans))
        print '[Create]', file_path
    trans_file = open(file_path, 'w+')
    trans_file.write(new_trans.encode('utf-8'))
    trans_file.close()

def merge_trans(empty_trans, exists_trans):
    keys_not_supported = []
    for key in exists_trans:
        if key not in empty_trans:
            keys_not_supported.append(key)
    for key in keys_not_supported:
        print 'Cannot find Key', key, 'in template, delete it? (y/n):' ,
        if raw_input().strip() == 'y':
            del exists_trans[key]
    new_trans = empty_trans.copy()
    new_trans.update(exists_trans)
    for key in new_trans:
        if not new_trans[key]['message']:
            print '[!] Empty Key: [%s]' % key
    return new_trans 

def format_out(trans):
    arr = []
    for k, v in trans.items():
        sub_arr = []
        for sub_k, sub_v in v.items():
            sub_arr.append('\t\t"%s": "%s"' % (sub_k, sub_v))
        arr.append(('\t"%s": {\n' % k )+ ',\n'.join(sub_arr) + '\n\t}')
    return '{\n'+',\n'.join(arr)+'\n}'

if __name__ == '__main__':
    keys = scan_template()
    scan_js_dir()
    print 'keys: ', keys
    empty_trans = generate_trans_template(keys)
    empty_trans.update(js_tag_map)
    os.path.walk(LOCALE_FILE_DIR, walk_cb, empty_trans)

