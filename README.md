Hotot is a "Lightweight, Flexible Microblogging Client" supporting
Twitter and Identi.ca at this point of development. You may visit our
official website at http://hotot.org/ . Check it out for any updates
on Hotot.

To compile you need Cmake and Qt.

in the source dir

$ mkdir build
$ cd build
$ cmake ..
$ make

To install as root:

# make install

This will install in the default prefix: /usr/local

If you want to change the prefix, call cmake with 
-DCMAKE_INSTALL_PREFIX=/my/prefix/



There is something about a Gtk version in Python using some sort of
"distutils".