# Hotot
Hotot is a "Lightweight, Flexible Microblogging Client" supporting
Twitter and Identi.ca at this point of development. You may visit our
official website at http://hotot.org/ . Check it out for any updates
on Hotot.

## Building from source:
Since Hotot core is largely based on HTML5, Javascript and webkit technology,
It can be run under many Webkit implementation. Hotot Offically support Gtk,
Qt, and Chrome webkit wrapper.

Dependencies:

Common Requirement:
* cmake
* intltool

Qt Wrapper
* Qt4 (newer than 4.7)
* KDE Libs (optional, for better kde integration)

Gtk2 Wrapper
* python2
* pygtk
* python-webkit
* python-keybinder (optional)

Gtk3 Wrapper
* python-gobject (for gtk3 wrapper)
* gtk3
* libwebkit3

On Ubuntu 11.10 all of these ressources are available in the standard repositories.

```shell
$ sudo apt-get install libqt4-dev cmake intltool

$ cd {source-directory}
$ mkdir build
$ cd build
$ cmake ..
$ make
```

To install as root:

```
sudo make install
```

This will install in the default prefix: /usr/local, in order to change to different prefix, use:
-DCMAKE_INSTALL_PREFIX=/prefix/you/want

By default gtk with gir,and qt will be built.

Following option can be applied, with On/Off as value.

-DWITH_GTK build gtk version

-DWITH_GIR build gir(gtk3) verson (need gtk enabled)

-DWITH_QT build qt version

-DWITH_KDE build qt with kde support

-DWITH_CHROME build chrome with mk-chrome-app.sh, will be placed under build directory/chrome/hotot-chrome.zip, need rsync

Eg: just build gtk with gir rather than qt:

$ cmake -DWITH_QT=off ..

To build on arch:

-DPYTHON_EXECUTABLE=/usr/bin/python2


There is something about a Gtk version in Python using some sort of
"distutils".

