#
# spec file for package hotot
#
# Copyright (c) 2010 SUSE LINUX Products GmbH, Nuernberg, Germany.
#
# All modifications and additions to the file contributed by third parties
# remain the property of their copyright owners, unless otherwise agreed
# upon. The license for this file, and modifications and additions to the
# file, is the same license as for the pristine package itself (unless the
# license for the pristine package is not an Open Source License, in which
# case the license is the MIT License). An "Open Source License" is a
# license that conforms to the Open Source Definition (Version 1.9)
# published by the Open Source Initiative.

# Please submit bugfixes or comments via http://bugs.opensuse.org/
#


Name: hotot
Version: 0.9.8.8
Release: beta4
Summary: A lightweight, flexible microblogging client
Group:  Productivity/Networking/Instant Messenger
License: LGPL-3.0
Url: https://hotot.org
Source:	%{name}-%{version}.tar.bz2
BuildRequires: cmake gcc-c++ intltool
%if 0%{?suse_version}
%py_requires
%endif

# KDE Versions
%if 0%{?suse_version}
BuildRequires: libqt4-devel libQtWebKit-devel libkde4-devel
BuildRequires:  update-desktop-files fdupes
%else
BuildRequires: qt-devel qt-webkit-devel kdelibs-devel sane-backends-libs
%endif

# GTK/GIR Versions
%if %{?suse_version}
%if %{?suse_version} <= 1140
BuildRequires:	python-keybinder
BuildRequires:	libwebkitgtk-devel gtk2-devel python-gtk-devel python-webkitgtk-devel
%else
BuildRequires: libwebkitgtk3-devel gtk3-devel
BuildRequires: python-gobject-devel
%endif
%else
%if %{?fedora_version} >= 15
BuildRequires:	webkitgtk3-devel gtk3-devel pygobject2-devel python-devel
%else
BuildRequires:	python-keybinder
BuildRequires:	pygtk2-devel gtk2-devel pywebkitgtk webkitgtk-devel python-devel
%endif
%endif

%description
Hotot is a multi-column microblogging client written by HTML5 technologies through Webkit, thus can run on any device supports webkit(Currently runs on Windows/Linux/Mac OS X/Google Chrome/QT Mobiles).

It supports Twitter and Identi.ca services, as well as real-time update(via Twitter Streaming API), profile editing, multi-lingual, thread conversations, 3 level in-app effects, Trending Topics detailed into City level, Color Label(assign color to people).

For geek it has native notification system, Ubuntu appindicator and Me menu, Http/Socks proxy, Vim-style Keyboard Shortcuts, even a powerful Kismet content filter system which could do a few auto tasks, and Speech Input on Chrome.

It supports Instapaper/ReadItLater, Google Tweet Translate, Geo information shown on Google Maps, Plenty of image upload service including Twtter Official one(and their previews) and Video Preview like Youtube, Url shorten and unshorten(many beautiful prefixes), and User Stat through inside extensions.

%package qt
Summary: A lightweight, flexible microblogging client
Group:  Productivity/Networking/Instant Messenger
Requires: %{name}-data = %{version}
%if 0%{?suse_version}
%kde4_runtime_requires
%endif

%description qt
Hotot is a multi-column microblogging client written by HTML5 technologies through Webkit, thus can run on any device supports webkit(Currently runs on Windows/Linux/Mac OS X/Google Chrome/QT Mobiles).

It supports Twitter and Identi.ca services, as well as real-time update(via Twitter Streaming API), profile editing, multi-lingual, thread conversations, 3 level in-app effects, Trending Topics detailed into City level, Color Label(assign color to people).

For geek it has native notification system, Ubuntu appindicator and Me menu, Http/Socks proxy, Vim-style Keyboard Shortcuts, even a powerful Kismet content filter system which could do a few auto tasks, and Speech Input on Chrome.

It supports Instapaper/ReadItLater, Google Tweet Translate, Geo information shown on Google Maps, Plenty of image upload service including Twtter Official one(and their previews) and Video Preview like Youtube, Url shorten and unshorten(many beautiful prefixes), and User Stat through inside extensions.

This package provides Hotot QT edition with KDE integration.

%package data
Summary: A lightweight, flexible microblogging client
Group:  Productivity/Networking/Instant Messenger
Recommends: hotot-gtk = %{version}
Recommends: hotot-gir = %{version}
Recommends: hotot-qt = %{version}

%description data
Hotot is a multi-column microblogging client written by HTML5 technologies through Webkit, thus can run on any device supports webkit(Currently runs on Windows/Linux/Mac OS X/Google Chrome/QT Mobiles).

It supports Twitter and Identi.ca services, as well as real-time update(via Twitter Streaming API), profile editing, multi-lingual, thread conversations, 3 level in-app effects, Trending Topics detailed into City level, Color Label(assign color to people).

For geek it has native notification system, Ubuntu appindicator and Me menu, Http/Socks proxy, Vim-style Keyboard Shortcuts, even a powerful Kismet content filter system which could do a few auto tasks, and Speech Input on Chrome.

It supports Instapaper/ReadItLater, Google Tweet Translate, Geo information shown on Google Maps, Plenty of image upload service including Twtter Official one(and their previews) and Video Preview like Youtube, Url shorten and unshorten(many beautiful prefixes), and User Stat through inside extensions.

This package provides Data files(Icons/Themes/Stylesheets/Javascipts
/Locales/Extensions/Sound) for Hotot.

%if 0%{?suse_version}
%if 0%{?suse_version} <= 1140
%package gtk
Summary: A lightweight, flexible microblogging client
Group:  Productivity/Networking/Instant Messenger
Requires: %{name}-data = %{version}
Conflicts: %{name}-gir

%description gtk
Hotot is a multi-column microblogging client written by HTML5 technologies through Webkit, thus can run on any device supports webkit(Currently runs on Windows/Linux/Mac OS X/Google Chrome/QT Mobiles).

It supports Twitter and Identi.ca services, as well as real-time update(via Twitter Streaming API), profile editing, multi-lingual, thread conversations, 3 level in-app effects, Trending Topics detailed into City level, Color Label(assign color to people).

For geek it has native notification system, Ubuntu appindicator and Me menu, Http/Socks proxy, Vim-style Keyboard Shortcuts, even a powerful Kismet content filter system which could do a few auto tasks, and Speech Input on Chrome.

It supports Instapaper/ReadItLater, Google Tweet Translate, Geo information shown on Google Maps, Plenty of image upload service including Twtter Official one(and their previews) and Video Preview like Youtube, Url shorten and unshorten(many beautiful prefixes), and User Stat through inside extensions.

This package provides Hotot GTK2 edition.

%else
%package gir
Summary: A lightweight, flexible microblogging client
Group:  Productivity/Networking/Instant Messenger
Requires: %{name}-data = %{version}
Conflicts: %{name}-gtk

%description gir
Hotot is a multi-column microblogging client written by HTML5 technologies through Webkit, thus can run on any device supports webkit(Currently runs on Windows/Linux/Mac OS X/Google Chrome/QT Mobiles).

It supports Twitter and Identi.ca services, as well as real-time update(via Twitter Streaming API), profile editing, multi-lingual, thread conversations, 3 level in-app effects, Trending Topics detailed into City level, Color Label(assign color to people).

For geek it has native notification system, Ubuntu appindicator and Me menu, Http/Socks proxy, Vim-style Keyboard Shortcuts, even a powerful Kismet content filter system which could do a few auto tasks, and Speech Input on Chrome.

It supports Instapaper/ReadItLater, Google Tweet Translate, Geo information shown on Google Maps, Plenty of image upload service including Twtter Official one(and their previews) and Video Preview like Youtube, Url shorten and unshorten(many beautiful prefixes), and User Stat through inside extensions.

This package provides Hotot GTK3 edition with Gir.
%endif
%else
%if 0%{?fedora_version} < 15
%package gtk
Summary: A lightweight, flexible microblogging client
Group:  Productivity/Networking/Instant Messenger
Requires: %{name}-data = %{version}
Conflicts: %{name}-gir

%description gtk
Hotot is a multi-column microblogging client written by HTML5 technologies through Webkit, thus can run on any device supports webkit(Currently runs on Windows/Linux/Mac OS X/Google Chrome/QT Mobiles).

It supports Twitter and Identi.ca services, as well as real-time update(via Twitter Streaming API), profile editing, multi-lingual, thread conversations, 3 level in-app effects, Trending Topics detailed into City level, Color Label(assign color to people).

For geek it has native notification system, Ubuntu appindicator and Me menu, Http/Socks proxy, Vim-style Keyboard Shortcuts, even a powerful Kismet content filter system which could do a few auto tasks, and Speech Input on Chrome.

It supports Instapaper/ReadItLater, Google Tweet Translate, Geo information shown on Google Maps, Plenty of image upload service including Twtter Official one(and their previews) and Video Preview like Youtube, Url shorten and unshorten(many beautiful prefixes), and User Stat through inside extensions.

This package provides Hotot GTK2 edition.
%else
%package gir
Summary: A lightweight, flexible microblogging client
Group:  Productivity/Networking/Instant Messenger
Requires: %{name}-data = %{version}
Conflicts: %{name}-gtk

%description gir
Hotot is a multi-column microblogging client written by HTML5 technologies through Webkit, thus can run on any device supports webkit(Currently runs on Windows/Linux/Mac OS X/Google Chrome/QT Mobiles).

It supports Twitter and Identi.ca services, as well as real-time update(via Twitter Streaming API), profile editing, multi-lingual, thread conversations, 3 level in-app effects, Trending Topics detailed into City level, Color Label(assign color to people).

For geek it has native notification system, Ubuntu appindicator and Me menu, Http/Socks proxy, Vim-style Keyboard Shortcuts, even a powerful Kismet content filter system which could do a few auto tasks, and Speech Input on Chrome.

It supports Instapaper/ReadItLater, Google Tweet Translate, Geo information shown on Google Maps, Plenty of image upload service including Twtter Official one(and their previews) and Video Preview like Youtube, Url shorten and unshorten(many beautiful prefixes), and User Stat through inside extensions.

This package provides Hotot GTK3 edition with Gir.
%endif
%endif


%prep
%setup -q -n %{name}-%{version}
# Already Fix Upstream. Will be droped next major release.
sed -i "s/Categories=Qt;Network;/Categories=Qt;Network;InstantMessaging;/" misc/hotot-qt.desktop.in

%build
mkdir build
cd build
cmake -DCMAKE_INSTALL_PREFIX=%{_prefix} -DLIB_INSTALL_DIR=%{_libdir} \
%if 0%{?suse_version}
%if 0%{?suse_version} <= 1140
      -DWITH_GIR=OFF \
%else
      -DWITH_GIR=ON \
%endif
%else
%if 0%{?fedora_version} < 15
      -DWITH_GIR=OFF \
%else
      -DWITH_GIR=ON \
%endif
%endif
	..
make

%install
cd build
%make_install
cd ..

%if 0%{?suse_version}
%suse_update_desktop_file %{name} Network InstantMessaging
%suse_update_desktop_file %{name}-qt Network InstantMessaging

# Fix python-bytecode-inconsistent-mtime
pushd %{buildroot}%{python_sitearch}/%{name}/
%py_compile .
popd

%fdupes %{buildroot}
%endif

%find_lang %{name}

%if 0%{?suse_version}
%if 0%{?suse_version} <= 1140
%files gtk
%defattr(-,root,root)
%{_bindir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{python_sitearch}/%{name}/
%else
%files gir
%defattr(-,root,root)
%{_bindir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{python_sitearch}/%{name}/
%endif
%else
%if 0%{?fedora_version} < 15
%files gtk
%defattr(-,root,root)
%{_bindir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{python_sitearch}/%{name}/
%else
%files gir
%defattr(-,root,root)
%{_bindir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{python_sitearch}/%{name}/
%endif
%endif

%files qt
%defattr(-,root,root)
%dir %{_datadir}/kde4/apps/desktoptheme
%dir %{_datadir}/kde4/apps/desktoptheme/default
%dir %{_datadir}/kde4/apps/desktoptheme/default/icons
%{_bindir}/%{name}-qt
%{_datadir}/applications/%{name}-qt.desktop
%{_datadir}/kde4/apps/desktoptheme/default/icons/hotot_qt.svg

%files data -f %{name}.lang
%defattr(-,root,root)
%{_datadir}/%{name}/
%{_datadir}/icons/*

%changelog
