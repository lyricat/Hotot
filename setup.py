#!/usr/bin/env python
# -*- coding:utf8 -*-

from distutils.core import setup
from DistUtilsExtra.command import *
from glob import glob

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
          ('share/hotot/ui', ['data/ui/index.html']),
          ('share/hotot/ui/js', glob('data/ui/js/*')),
          ('share/hotot/ui/imgs', glob('data/ui/imgs/*')),
          ('share/hotot/ui/css', glob('data/ui/css/*')),

          ('share/hotot/ext', ['data/ext/ext.js']),
          ('share/hotot/ext/org.hotot.imagepreview'
            , glob('data/ext/org.hotot.imagepreview/*')),
          ('share/hotot/ext/org.hotot.sample'
            , glob('data/ext/org.hotot.sample/*')),
          ('share/hotot/ext/org.hotot.gmap'
            , glob('data/ext/org.hotot.gmap/*')),
          ('share/hotot/ext/org.hotot.imageupload'
            , glob('data/ext/org.hotot.imageupload/*')),
          ('share/hotot/ext/org.hotot.translate'
            , glob('data/ext/org.hotot.translate/*')),
      ],
      cmdclass = { "build" :  build_extra.build_extra,
                   "build_i18n" :  build_i18n.build_i18n,
                 }
      )

