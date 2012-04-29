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

// System
#include <getopt.h>

// Qt
#include <QApplication>

// KDE
#ifdef HAVE_KDE
#include <KAboutData>
#include <KApplication>
#include <KCmdLineOptions>
#include <KUniqueApplication>
#include <KDebug>
#endif

// Meego
#ifdef MEEGO_EDITION_HARMATTAN
#include <MApplication>
#endif

// System
#include <stdio.h>

// Hotot
#include "mainwindow.h"

void Usage()
{
    printf("Usage: hotot-qt [options]\n"
           "\t\t-d\tEnable Develope Tool\n"
           "\t\t-s\tEnable Socket Proxy\n"
           "\t\t-h\tShow this help\n"
          );
}

int main(int argc, char *argv[])
{
    bool enableDeveloper = false;
    bool enableSocket = false;

#ifdef HAVE_KDE

    KAboutData aboutData("hotot",                                        // internal name
                         "hotot-qt",                                     // catalog name
                         ki18n("Hotot"),                            // program name
                         "0.9.7",                             // app version
                         ki18n("Lightweight, Flexible Microblogging"),  // short description
                         KAboutData::License_GPL_V2,                   // license
                         ki18n("(c) 2009-2012 Shellex Wai\n"),   // copyright
                         KLocalizedString(),
                         "http://www.hotot.org/",                   // home page
                         "https://github.com/shellex/Hotot/issues"               // address for bugs
                        );

    aboutData.addAuthor(ki18n("Shellex Wai"),       ki18n("Developer and Artwork"), "5h3ll3x@gmail.com");
    aboutData.addAuthor(ki18n("Jiahua Huang"),      ki18n("Developer"),             "jhuangjiahua" "@" "gmail" "." "com");
    aboutData.addAuthor(ki18n("Jimmy Xu"),          ki18n("Developer"),             "xu.jimmy.wrk" "@" "gmail" "." "com");
    aboutData.addAuthor(ki18n("Tualatrix Chou"),    ki18n("Developer"),             "tualatrix" "@" "gmail" "." "com");
    aboutData.addAuthor(ki18n("Xu Zhen"),           ki18n("Developer"),             "xnreformer" "@" "gmail" "." "com");
    aboutData.addAuthor(ki18n("Evan"),              ki18n("Artwork"),               "www.freemagi.com");
    aboutData.addAuthor(ki18n("Marguerite Su"),     ki18n("Document"),              "admin"  "@" "doublechou.pp.ru");

    KCmdLineOptions options;
    options.add("d");
    options.add("dev", ki18n("Enable developer Tool"));
    options.add("s");
    options.add("socket", ki18n("Use Proxy as Socks Proxy instead of HTTP Proxy"));
    KCmdLineArgs::init(argc, argv, &aboutData);

    KCmdLineArgs::addCmdLineOptions(options);
    KCmdLineArgs* args = KCmdLineArgs::parsedArgs();

    enableDeveloper = args->isSet("dev");
    enableSocket = args->isSet("socket");

    KApplication a;
#else
#if !defined(Q_OS_WIN32) && !defined(Q_OS_MAC)
    bind_textdomain_codeset("hotot-qt", "UTF-8");
#endif
#ifdef MEEGO_EDITION_HARMATTAN
    MApplication a(argc, argv);
#else
    QApplication a(argc, argv);

    int opt;
    while ((opt = getopt(argc, argv, "sdh")) != -1) {
        switch (opt) {
        case 's':
            enableSocket = true;
            break;
        case 'd':
            enableDeveloper = true;
            break;
        case 'h':
            Usage();
            return 0;
        default:
            Usage();
            exit(EXIT_FAILURE);
            break;
        }
    }
#endif

#endif
    MainWindow w(enableSocket);
    w.setEnableDeveloperTool(enableDeveloper);

#ifdef MEEGO_EDITION_HARMATTAN
    w.setOrientationAngle(M::Angle0);
    w.setOrientationAngleLocked(true);
#endif

    return a.exec();
}
