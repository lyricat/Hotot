#!/usr/bin/env python
# -*- coding:utf8 -*-

from distutils.core import setup
from DistUtilsExtra.command import *
from glob import glob
import os, os.path

def get_data_files(root, data_dir):
    return [
            (root + parent[len(data_dir):], [ os.path.join(parent, fn) for fn in files ])
                for parent, dirs, files in os.walk(data_dir) if files and (not parent.startswith('data/icons') or 'icons' in root)
           ]

setup(name='hotot',
      version="0.9.6",
      description='Lightweight Twitter Client',
      long_description =
"""
Lightweight Twitter Client base on Gtk2 and Webkit.

Features include:

   - Update/View Timelines.
   - Follow/Unfollow peoples.
   - Post status.
   - Reply tweets.
   - Post direct messages.
   - View people profile.
   - Native notification.
   - Global key-shortcut.
""",
      author='Shellex Wai',
      author_email='5h3ll3x@gmail.com',
      license='LGPL-3',
      url="http://code.google.com/p/hotot",
      download_url="http://code.google.com/p/hotot/downloads/list",
      platforms = ['Linux'],
      requires = ['webkit', 'gtk', 'gobject', 'keybinder', 'pynotify'],
      scripts=['scripts/hotot'],
      packages = ['hotot'],
      data_files = [
          ('share/pixmaps', ['hotot.png']),
      ] + get_data_files('share/hotot', 'data') + get_data_files('share/icons/hicolor', 'data/icons'),
      cmdclass = { "build" :  build_extra.build_extra,
                   "build_i18n" :  build_i18n.build_i18n,
                 }
      )

