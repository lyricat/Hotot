# Hotot
Hotot is a "Lightweight, Flexible Microblogging Client" supporting
Twitter and Identi.ca at this point of development. You may visit our
official website at http://hotot.org/ . Check it out for any updates
on Hotot.

## Building from source:
Dependencies:

* cmake
* Qt4
* intltool
* python-keybinder (only gtk version)

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


This will install in the default prefix: /usr/local

By default gtk with gir,and qt will be built.

-DWITH_GTK build gtk version

-DWITH_GIR build gir verson (need gtk enabled)

-DWITH_QT build qt version

-DWITH_KDE build qt with kde support

-DWITH_CHROME build chrome with mk-chrome-app.sh, will be placed under build directory/chrome/hotot-chrome.zip

To build on arch:

-DPYTHON_EXECUTABLE=/usr/bin/python2


There is something about a Gtk version in Python using some sort of
"distutils".

