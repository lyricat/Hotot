#!/usr/bin/env python

#   Copyright (C) 2012~2012 by Yichao Yu
#   yyc1992@gmail.com
#
#   This program is free software; you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, version 2 of the License.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program; if not, write to the
#   Free Software Foundation, Inc.,
#   59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.

# This file incorporates work covered by the following copyright and
# permission notice:
#
#     Copyright (c) 2007, Simon Edwards <simon@simonzone.com>
#     Redistribution and use is allowed according to the terms of the BSD
#     license. For details see the accompanying COPYING-CMAKE-SCRIPTS file.

import sys, distutils.sysconfig, imp

print("exec_prefix:%s" % sys.exec_prefix)
print("short_version:%s" % sys.version[:3])
print("long_version:%s" % sys.version.split()[0])
print("py_inc_dir:%s" % distutils.sysconfig.get_python_inc())
print("site_packages_dir:%s" %
      distutils.sysconfig.get_python_lib(plat_specific=1))
try:
    magic_tag = imp.get_tag()
except AttributeError:
    magic_tag = ''
print("magic_tag:%s" % magic_tag)
