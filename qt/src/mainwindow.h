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

// Qt
#include <QMainWindow>
#include <QSystemTrayIcon>

class QWebInspector;
class TrayIconBackend;
class KStatusNotifierItem;
namespace Ui
{
class MainWindow;
}

class QWebView;
class HototWebPage;

class MainWindow : public QMainWindow
{
    Q_OBJECT
public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();
    void notification(QString type, QString title, QString message, QString image);
    void triggerVisible();
    void activate();
    void unreadAlert(QString number);
    void setEnableDeveloperTool(bool e);

protected Q_SLOTS:
    void loadFinished(bool ok);
    void showDeveloperTool();

protected:
    void initDatabases();
    void closeEvent(QCloseEvent *evnet);

private:
    Ui::MainWindow *ui;
    HototWebPage* m_page;
    QWebView* m_webView;
    QWebInspector* m_inspector;
    QMenu* m_menu;
    TrayIconBackend* m_tray;
    QAction* m_actionExit;
    QAction* m_actionDev;
};

#endif // MAINWINDOW_H
