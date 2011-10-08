/***************************************************************************
 *   Copyright (C) 2011~2011 by CSSlayer                                   *
 *   wengxt@gmail.com                                                      *
 *                                                                         *
 *   This program is free software; you can redistribute it and/or modify  *
 *   it under the terms of the GNU General Public License as published by  *
 *   the Free Software Foundation, version 2 of the License.               *
 *                                                                         *
 *   This program is distributed in the hope that it will be useful,       *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
 *   GNU General Public License for more details.                          *
 *                                                                         *
 *   You should have received a copy of the GNU General Public License     *
 *   along with this program; if not, write to the                         *
 *   Free Software Foundation, Inc.,                                       *
 *   59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.             *
 ***************************************************************************/

#include "common.h"

// Qt
#include <QApplication>
#include <libintl.h>

// KDE
#ifdef HAVE_KDE
#include <KAboutData>
#include <KApplication>
#include <KCmdLineOptions>
#include <KUniqueApplication>
#include <KDebug>
#endif

// System
#include <stdio.h>

// Hotot
#include "mainwindow.h"

int main(int argc, char *argv[])
{
#ifdef HAVE_KDE

    KAboutData aboutData( "hotot-qt",                                   // internal name
                        0,                                         // catalog name
                        ki18n("Hotot"),                            // program name
                        "0.9.9",                             // app version from config-kmess.h
                        ki18n("Lightweight, Flexible Microblogging"),  // short description
                        KAboutData::License_LGPL,                   // license
                        ki18n("(c) 2009-2011 Shellex Wai\n"),   // copyright
                        KLocalizedString(),
                        "http://www.hotot.org/",                   // home page
                        "https://github.com/shellex/Hotot/issues"               // address for bugs
                      );
  
    aboutData.addAuthor( ki18n("Shellex Wai"),       ki18n("Developer and Artwork"), "5h3ll3x@gmail.com" );
    aboutData.addAuthor( ki18n("Jiahua Huang"),        ki18n("Developer"),                     "jhuangjiahua" "@" "gmail" "." "com" );
    aboutData.addAuthor( ki18n("Jimmy Xu"),            ki18n("Developer"),               "xu.jimmy.wrk" "@" "gmail" "." "com" );
    aboutData.addAuthor( ki18n("Tualatrix Chou"), ki18n("Developer"),             "tualatrix" "@" "gmail" "." "com" );
    aboutData.addAuthor( ki18n("Xu Zhen"), ki18n("Developer"),             "xnreformer" "@" "gmail" "." "com" );
    aboutData.addAuthor( ki18n("Evan"),          ki18n("Artwork"),             "www.freemagi.com" );
    aboutData.addAuthor( ki18n("Marguerite Su"),       ki18n("Document"),             "admin"  "@" "doublechou.pp.ru" );

    KCmdLineOptions options;
    KCmdLineArgs::init( argc, argv, &aboutData );
    
    KCmdLineArgs::addCmdLineOptions( options );
    KCmdLineArgs::parsedArgs();
    
    KApplication a;
    MainWindow w;
    w.show();
    return a.exec();
#else
    bind_textdomain_codeset("hotot-qt", "UTF-8");
    QApplication a(argc, argv);
    MainWindow w;
    w.show();

    return a.exec();
#endif
}
