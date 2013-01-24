# Hotot
Hotot is a "Lightweight, Flexible Microblogging Client" supporting
Twitter and Identi.ca at this point of development. You may visit our
official website at http://hotot.org/ . Check it out for any updates
on Hotot.

## Install in Distrubtions:

### openSUSE

    # zypper ar -f http://download.opensuse.org/repositories/KDE:/Extra/openSUSE_12.2 KDE:Extra

Change "12.2" to your version.

#### GNOME 3:

    # zypper in hotot-gir

#### GNOME 2 (11.4- Only):

    # zypper in hotot-gtk

#### QT with KDE:

    # zypper in hotot-qt

### Fedora

    # yum install hotot

### Arch / Charka
to be finished by marguerite on OBS

### Debian / Ubuntu

    # add-apt-repository ppa:hotot-team
    # apt-get update
    # apt-get install hotot

### Mandriva

    $ urpmi.addmedia --wget --distrib ftp://ftp.blogdrake.net/mandriva/"mandriva-version"/"arch"
    $ urpmi --auto-update
    $ urpmi hotot

### Gentoo

    $ emerge hotot

## Building from source:
Since Hotot core is largely based on HTML5, JavaScript and Webkit technology,
It can be run under many Webkit implementations. Hotot officially supports Gtk,
Qt, and Chrome webkit wrapper.

Dependencies:

Common Requirements:
* cmake
* intltool

Qt Wrapper:
* Qt4 (newer than 4.7)
* KDE Libs (optional, for better KDE integration)

Gtk2 Wrapper:
* python2
* pygtk
* python-webkit
* python-keybinder (optional)

Gtk3 Wrapper:
* python-gobject (for gtk3 wrapper)
* gtk3
* libwebkit3

On Ubuntu 11.10 all of these resources are available in the standard repositories.

    # apt-get install libqt4-dev cmake intltool

    $ cd {source-directory}
    $ mkdir build
    $ cd build
    $ cmake ..
    $ make

Install as root:

    # make install

This will install Hotot in the default prefix: `/usr/local`, in order to change
to a different prefix, use:
`-DCMAKE_INSTALL_PREFIX=/prefix/you/want`

By default gtk with gir, and qt will be built.

The following options can be applied, with On/Off as value.

* `-DWITH_GTK2` build gtk2 version (program name: `hotot-gtk2`)
* `-DWITH_GTK3` build gtk3 version (program name: `hotot-gtk3`)
* `-DWITH_GTK` build gtk version (without `-DWITH_GTK{2,3}` options, the program's name will be `hotot`)
* `-DWITH_GIR` build gir(gtk3) version (need gtk enabled) (without `-DWITH_GTK{2,3}` options, this option will disable gtk2 version.)
* `-DWITH_QT` build qt version (program name: `hotot-qt`)
* `-DWITH_KDE` build qt with kde support (program name by default: `hotot-qt`)
* `-DWITH_KDE_QT` build qt with (program name: `hotot-kde`) and without (program name: `hotot-qt`) kde support at the same time.
* `-DWITH_CHROME` build chrome with mk-chrome-app.sh, will be placed under build directory/chrome/hotot-chrome.zip, need rsync

There is also a option to specify the name of the qt binary with kde support enabled.

* `-DHOTOT_KDE_BIN_NAME=` the value of this option is ONLY used when `-DWITH_QT=On` `-DWITH_KDE=On` `-DWITH_KDE_QT=Off` (all default), in which case this will be the name of the qt wrapper.

For example, to just build gtk with gir rather than qt, the `cmake` command
will be:

    $ cmake .. -DWITH_QT=off

To build all local wrappers (useful for split package,):

    $ cmake .. -DWITH_GTK2=On -DWITH_GTK3=On -DWITH_KDE_QT=On

To build on Arch, add:
`-DPYTHON_EXECUTABLE=/usr/bin/python2`

There is something about a Gtk version in Python using some sort of
"distutils".
