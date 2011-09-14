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

#include <QMainWindow>
#include <QSystemTrayIcon>

class QSystemTrayIcon;
namespace Ui {
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
    void notification(QString arg1, QString arg2, QString arg3, QString arg4);

protected Q_SLOTS:
    void loadFinished(bool ok);
    void trayIconClicked(QSystemTrayIcon::ActivationReason reason);
    void messageClicked();

protected:
    void initDatabases();
    void closeEvent(QCloseEvent *evnet);

private:
    Ui::MainWindow *ui;
    QSystemTrayIcon* m_trayicon;
    HototWebPage* m_page;
    QWebView* m_webView;
    QMenu* m_menu;
};

#endif // MAINWINDOW_H
