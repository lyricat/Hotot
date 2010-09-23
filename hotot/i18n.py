#!/usr/bin/python
# -*- coding: UTF-8 -*-
# vim:set shiftwidth=4 tabstop=4 expandtab textwidth=79:
# Author: Huang Jiahua <jhuangjiahua@gmail.com>
# License: LGPLv3+
# Last modified:

app = 'hotot'

import os, sys
import gettext
import json
import re

if os.path.isdir(os.path.dirname(sys.argv[0]) + '/../build/mo'):
    gettext.install(app, os.path.dirname(sys.argv[0]) + '/../build/mo', unicode=True)
elif os.path.isdir(os.path.dirname(sys.argv[0]) + '/build/mo'):
    gettext.install(app, os.path.dirname(sys.argv[0]) + '/build/mo', unicode=True)
else:
    gettext.install(app, unicode=True)

def get_i18n_json(domain=app, localedir=None, languages=None):
    try:
        mofile = gettext.find(domain, localedir, languages)
        translations = gettext.GNUTranslations(open(mofile, 'rb'))
        return json.dumps(translations._catalog, ensure_ascii=0)
    except:
        return '{}'

def trans_html(html):
    html = re.sub('(_\("(.*)"\))', lambda m: _(m.group(2)), html)
    html = re.sub("(_\('(.*)'\))", lambda m: _(m.group(2)), html)
    return html

if __name__=="__main__":
	print _('')

