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

#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include "common.h"

// Qt
#include <QMainWindow>
#include <QSystemTrayIcon>

// Meego
#ifdef MEEGO_EDITION_HARMATTAN
#include <MApplicationWindow>
#endif

class QWebInspector;
struct TrayIconInterface;
class KStatusNotifierItem;

#ifdef MEEGO_EDITION_HARMATTAN
typedef MApplicationWindow ParentWindow;
#else
typedef QMainWindow ParentWindow;
#endif

class QGraphicsWebView;
class HototWebPage;

class MainWindow : public ParentWindow
{
    Q_OBJECT
public:
    explicit MainWindow(bool useSocket, QWidget *parent = 0);
    ~MainWindow();
    void notification(QString type, QString title, QString message, QString image);
    void triggerVisible();
    void activate();
    void unreadAlert(QString number);
    void setEnableDeveloperTool(bool e);

protected Q_SLOTS:
    void loadFinished(bool ok);
    void onLinkHovered(const QString & link, const QString & title, const QString & textContent );
    void showDeveloperTool();
    void exit();
#ifdef MEEGO_EDITION_HARMATTAN
    void contentSizeChanged();
#else
    void toggleMinimizeToTray(bool checked);
#endif

protected:
    void initDatabases();
    bool isCloseToExit();
    void closeEvent(QCloseEvent *evnet);
#ifndef MEEGO_EDITION_HARMATTAN
    void changeEvent(QEvent *event);
#endif

private:
    HototWebPage* m_page;
    QGraphicsWebView* m_webView;
    QMenu* m_menu;
    TrayIconInterface* m_tray;
    QAction* m_actionShow;
    QAction* m_actionExit;
    QAction* m_actionDev;
#ifndef MEEGO_EDITION_HARMATTAN
    QAction* m_actionMinimizeToTray;
#endif
    QWebInspector* m_inspector;
    bool m_useSocket;
};

#endif // MAINWINDOW_H
