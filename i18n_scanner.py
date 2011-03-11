#!/usr/bin/env python
# -*- coding:utf8 -*-

import re
import json
import os.path

TEMPLATE = "data/index.html"
LOCALE_FILE_DIR = 'data/_locales/'

template_tag_re = re.compile('data-i18n-[a-z0-9]+="(.+?)"')

def scan_template():
    template_file = open(TEMPLATE, 'r')
    html_data = template_file.read()
    template_file.close()
    key_list = template_tag_re.findall(html_data)
    return key_list
    
def generate_trans_template(key_list):
    template = {}
    for key in key_list:
        template[key] = {'message':'', 'description': ''}
    return template

def load_exist_trans(trans_file):
    return json.loads(file(trans_file).read())

def walk_cb(empty_trans, dir_name, f_names):
    new_trans = ''
    exists_trans = {}
    if dir_name.endswith('data/_locales/'):
        return
    file_path = os.path.join(dir_name, 'messages.json')
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
        new_trans = format_out(empty_trans)
        print '[Create]', file_path
    trans_file = open(file_path, 'w+')
    trans_file.write(new_trans.encode('utf-8'))
    trans_file.close()

def merge_trans(empty_trans, exists_trans):
    keys_not_supported = []
    for key in exists_trans:
        if not (key in empty_trans):
            keys_not_supported.append(key)
    for key in keys_not_supported:
        print 'Cannot find Key', key, 'in template, delete it? (y/n):' ,
        if raw_input().strip() == 'y':
            del exists_trans[key]
    empty_trans.update(exists_trans)
    return empty_trans

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
    print 'keys: ', keys
    empty_trans = generate_trans_template(keys)
    os.path.walk(LOCALE_FILE_DIR, walk_cb, empty_trans)

