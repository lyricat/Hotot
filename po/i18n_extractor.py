#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import re
import json
import os.path

DEFAULT_LOCALE_FILE = 'data/_locales/en/messages.json'

if __name__ == '__main__':
    default_trans = json.loads(file(DEFAULT_LOCALE_FILE, 'r').read())
    for key in default_trans:
        if default_trans[key]['message']:
            print '#: %s\nmsgid "%s"\nmsgstr ""\n' % (default_trans[key]['description'], default_trans[key]['message'])

