#!/usr/bin/env python
# -*- coding:utf8 -*-

import re
import json
import os.path

TEMPLATE = "data/index.html"
LOCALE_FILE_DIR = 'data/_locales/'

template_tag_re = re.compile('data-i18n-[a-z0-9]+="(.+)"')

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
    if dir_name.endswith('data/_locales/'):
        return
    file_path = os.path.join(dir_name, 'messages.json')
    if 'messages.json' in f_names:
        trans_file = open(file_path, 'r')
        exists_trans = json.loads(trans_file.read())
        trans_file.close()
        new_trans = format_out(merge_trans(empty_trans, exists_trans))
        print '[Update]', file_path
    else:
        new_trans = format_out(empty_trans)
        print '[Create]', file_path
    trans_file = open(file_path, 'w+')
    trans_file.write(new_trans)
    trans_file.close()

def merge_trans(empty_trans, exists_trans):
    keys_not_supported = []
    for key in exists_trans:
        if not (key in empty_trans):
            keys_not_supported.append(key)
    for key in keys_not_supported:
        del exists_trans[key]
        print 'del', key
    empty_trans.update(exists_trans)
    return empty_trans

def format_out(trans):
    str = json.dumps(trans)
    str = str.replace('}}', '}\n}')
    str = str.replace('{"', '{\n    "').replace('"}', '"\n  }')
    str = str.replace('}, ', '}\n, ').replace('", "', '",\n    "')
    return str


if __name__ == '__main__':
    keys = scan_template()
    print 'keys: ', keys
    empty_trans = generate_trans_template(keys)
    os.path.walk(LOCALE_FILE_DIR, walk_cb, empty_trans)

