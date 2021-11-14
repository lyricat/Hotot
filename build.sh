#!/bin/sh

ROOT=$(realpath $(dirname $0));


# Uninstall
sudo find /{usr,etc,var} -type d -name '*hotot*' -exec rm -fr {} \;
sudo find /{usr,etc,var} -type f -name '*hotot*' -exec rm -f {} \;

rm -fr build && mkdir build && cd build

cmake -DPYTHON_EXECUTABLE=/usr/bin/python2 -DWITH_GIR=off -DWITH_QT=off -DWITH_KDE=off -DWITH_CHROME=off -DWITH_GTK3=off -DWITH_GTK2=on -DWITH_GTK=off ..
make
sudo make install

hotot
