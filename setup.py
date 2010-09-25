#!/usr/bin/env python
# -*- coding:utf8 -*-

from distutils.core import setup
from DistUtilsExtra.command import *
from glob import glob
import os, os.path

def get_data_files(root):
    return [
               (root, [ os.path.join(root, fn) for fn in files])
                   for root, dirs, files in os.walk(root) if files
           ]

setup(name='hotot',
      version='1.0',
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
      scripts=['scripts/hotot'],
      packages = ['hotot'], 
      data_files = [
          ('share/pixmaps', ['hotot.png']),
      ] + get_data_files('data'),
      cmdclass = { "build" :  build_extra.build_extra,
                   "build_i18n" :  build_i18n.build_i18n,
                 }
      )

