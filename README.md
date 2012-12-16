# Hotot
Hotot is a "Lightweight, Flexible Microblogging Client" supporting
Twitter and Identi.ca at this point of development. You may visit our
official website at http://hotot.org/ . Check it out for any updates
on Hotot.

## Install in Distrubtions:

### openSUSE
	sudo zypper ar -f http://download.opensuse.org/repositories/KDE:/Extra/openSUSE_12.2 KDE:Extra
	//Change 12.2 string to your version.

GNOME 3:

	sudo zypper in hotot-gir

GNOME 2 (11.4- Only)

	sudo zypper in hotot-gtk

QT with KDE:

	sudo zypper in hotot-qt

### Fedora
	sudo yum install hotot

### Arch / Charka
	to be finished by marguerite on OBS

### Debian / Ubuntu
	sudo add-apt-repository ppa:hotot-team
	sudo apt-get update
	sudo apt-get install hotot

### Mandriva
	urpmi.addmedia --wget --distrib ftp://ftp.blogdrake.net/mandriva/"mandriva-version"/"arch"
	urpmi --auto-update
	urpmi hotot

### Gentoo
	emerge hotot

## Building from source:
Since Hotot core is largely based on HTML5, JavaScript and Webkit technology,
It can be run under many Webkit implementations. Hotot officially supports Gtk,
Qt, and Chrome webkit wrapper.

Dependencies:

Common Requirements:
* cmake
* intltool

Qt Wrapper
* Qt4 (newer than 4.7)
* KDE Libs (optional, for better KDE integration)

Gtk2 Wrapper
* python2
* pygtk
* python-webkit
* python-keybinder (optional)

Gtk3 Wrapper
* python-gobject (for gtk3 wrapper)
* gtk3
* libwebkit3

On Ubuntu 11.10 all of these resources are available in the standard repositories.

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

This will install Hotot in the default prefix: `/usr/local`, in order to change
to a different prefix, use:
`-DCMAKE_INSTALL_PREFIX=/prefix/you/want`

By default gtk with gir, and qt will be built.

The following options can be applied, with On/Off as value.

* `-DWITH_GTK` build gtk version
* `-DWITH_GIR` build gir(gtk3) version (need gtk enabled)
* `-DWITH_QT` build qt version
* `-DWITH_KDE` build qt with kde support
* `-DWITH_CHROME` build chrome with mk-chrome-app.sh, will be placed under build directory/chrome/hotot-chrome.zip, need rsync

For example, to just build gtk with gir rather than qt, the `cmake` command
will be:

```shell
$ cmake -DWITH_QT=off ..
```

To build on Arch, use:
`-DPYTHON_EXECUTABLE=/usr/bin/python2`


There is something about a Gtk version in Python using some sort of
"distutils".

