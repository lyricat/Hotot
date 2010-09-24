#!/usr/bin/env python
# -*- coding:utf8 -*-
import config
import os
import pickle
import json
import urllib

def unserialize_dict(str):
     return dict([(urllib.unquote(each[0]), urllib.unquote(each[1]))
            for each in [pairs.split('=')
                for pairs in str.split('&')]])

def unserialize_array(str):
    return [urllib.unquote(elem) for elem in str.split('&')]

