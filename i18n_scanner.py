#!/usr/bin/env python
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
        total = len(exists_trans)
        ret, cnt = merge_trans(empty_trans, exists_trans)
        new_trans = format_out(ret)
        print '[Update] %s, %d empty keys.' % (file_path, cnt)
    else:
        default_trans = json.loads(file(DEFAULT_LOCALE_FILE, 'r').read())
        total = len(default_trans)
        ret, cnt = merge_trans(empty_trans, default_trans)
        new_trans = format_out(ret)
        print '[Create] %s, %d empty keys.' % (file_path, cnt)
    print '[Status] %d/%d, %0.2f%%\n' % (total - cnt, total, 100*(total-cnt+0.)/total)
    trans_file = open(file_path, 'w+')
    trans_file.write(new_trans.encode('utf-8'))
    trans_file.close()

def merge_trans(empty_trans, exists_trans):
    keys_not_supported = []
    for key in exists_trans:
        if key not in empty_trans:
            keys_not_supported.append(key)
    for key in keys_not_supported:
        del exists_trans[key]
    new_trans = empty_trans.copy()
    new_trans.update(exists_trans)
    keys = []
    for key in new_trans:
        if not new_trans[key]['message']:
            keys.append(key)
    # print '[!] Empty Key: [%s]' % ','.join(keys)
    return new_trans, len(keys)

def format_out(trans):
    arr = []
    sorted_trans = []
    for k, v in trans.items():
        sorted_trans.append((k, v))
    sorted_trans.sort(lambda a, b: 0 if a[0] == b[0] else -1 if a[0]<b[0] else 1)
    for k, v in sorted_trans:
        sub_arr = []
        for sub_k, sub_v in v.items():
            sub_v = sub_v.replace('\\"', '"').replace('"', '\\"')
            sub_arr.append('\t\t"%s": "%s"' % (sub_k, sub_v))
        arr.append(('\t"%s": {\n' % k )+ ',\n'.join(sub_arr) + '\n\t}')
    return '{\n'+',\n'.join(arr)+'\n}'

if __name__ == '__main__':
    keys = scan_template()
    scan_js_dir()
    empty_trans = generate_trans_template(keys)
    empty_trans.update(js_tag_map)
    os.path.walk(LOCALE_FILE_DIR, walk_cb, empty_trans)

