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

// system
#include <unistd.h>

// Qt
#include <QApplication>
#include <QGraphicsWebView>
#include <QWebDatabase>
#include <QWebSettings>
#include <QDir>
#include <QWebSecurityOrigin>
#include <QDebug>
#include <QSqlDatabase>
#include <QSqlQuery>
#include <QWebFrame>
#include <QNetworkProxy>
#include <QSettings>
#include <QLocale>
#include <QSystemTrayIcon>
#include <QMenu>
#include <QWebInspector>
#include <QGraphicsView>

#ifdef HAVE_KDE
#include <KWindowSystem>
#endif

#ifdef MEEGO_EDITION_HARMATTAN
#include <MApplicationPage>
#endif

// Hotot
#include "mainwindow.h"
#include "hototwebpage.h"
#include "trayiconinterface.h"
#include "qttraybackend.h"
#include "hototwebview.h"
#ifdef HAVE_KDE
#include "kdetraybackend.h"
#endif

MainWindow::MainWindow(QWidget *parent) :
    ParentWindow(parent),
    m_page(0),
    m_webView(new QGraphicsWebView),
    m_inspector(0)
{
#ifdef Q_OS_UNIX
    chdir(PREFIX);
#endif
    setWindowTitle(i18n("Hotot"));
    setWindowIcon(QIcon::fromTheme("hotot_qt", QIcon("share/hotot-qt/html/image/ic64_hotot.png")));
    qApp->setWindowIcon(QIcon::fromTheme("hotot_qt", QIcon("share/hotot-qt/html/image/ic64_hotot.png")));
    m_webView->setPreferredSize(QSize(640, 480));
#ifndef MEEGO_EDITION_HARMATTAN
    HototWebView* view = new HototWebView(m_webView, this);
    this->resize(QSize(640, 480));
    this->setCentralWidget(view);
#else
    MApplicationPage* page = new MApplicationPage;
    page->setCentralWidget(m_webView);
    page->setComponentsDisplayMode(MApplicationPage::AllComponents,
                                           MApplicationPageModel::Hide);
    page->setAutoMarginsForComponentsEnabled(false);
    page->resize(page->exposedContentRect().size());
    page->appear(this, MSceneWindow::DestroyWhenDone);
    page->setPannable(false);
#endif

#ifndef MEEGO_EDITION_HARMATTAN
    QSettings settings("hotot-qt", "hotot");
    restoreGeometry(settings.value("geometry").toByteArray());
    restoreState(settings.value("windowState").toByteArray());
#endif

    m_menu = new QMenu(this);

#ifndef MEEGO_EDITION_HARMATTAN
    m_actionMinimizeToTray = new QAction(i18n("&Minimize to Tray"), this);
    m_actionMinimizeToTray->setCheckable(true);
    m_actionMinimizeToTray->setChecked(settings.value("minimizeToTray", true).toBool());
    connect(m_actionMinimizeToTray, SIGNAL(toggled(bool)), this, SLOT(toggleMinimizeToTray(bool)));
    m_menu->addAction(m_actionMinimizeToTray);
#endif

    m_actionExit = new QAction(QIcon::fromTheme("application-exit"), i18n("&Exit"), this);
    m_actionExit->setShortcut(QKeySequence::Quit);
    connect(m_actionExit, SIGNAL(triggered()), this, SLOT(close()));
    m_menu->addAction(m_actionExit);

    m_actionDev = new QAction(QIcon::fromTheme("configure"), i18n("&Developer Tool"), this);
    connect(m_actionDev, SIGNAL(triggered()), this, SLOT(showDeveloperTool()));

#ifdef HAVE_KDE
    m_tray = new KDETrayBackend(this);
#else
    m_tray = new QtTrayBackend(this);
#endif

    m_tray->setContextMenu(m_menu);
#ifndef MEEGO_EDITION_HARMATTAN
    addAction(m_actionExit);
#endif

    m_page = new HototWebPage(this);

    QWebSettings::setOfflineStoragePath(QDir::homePath().append("/.config/hotot-qt"));
    QWebSettings::setOfflineStorageDefaultQuota(15 * 1024 * 1024);

    m_webView->setPage(m_page);
    m_webView->settings()->globalSettings()->setAttribute(QWebSettings::LocalContentCanAccessFileUrls, true);
    m_webView->settings()->globalSettings()->setAttribute(QWebSettings::LocalContentCanAccessRemoteUrls, true);
    m_webView->settings()->globalSettings()->setAttribute(QWebSettings::LocalStorageEnabled, true);
    m_webView->settings()->globalSettings()->setAttribute(QWebSettings::OfflineStorageDatabaseEnabled, true);
    m_webView->settings()->globalSettings()->setAttribute(QWebSettings::JavascriptCanOpenWindows, true);
    m_webView->settings()->globalSettings()->setAttribute(QWebSettings::JavascriptCanAccessClipboard, true);
    m_webView->settings()->globalSettings()->setAttribute(QWebSettings::JavascriptEnabled, true);

    m_inspector = new QWebInspector;
    m_inspector->setPage(m_page);

#ifdef MEEGO_EDITION_HARMATTAN
    connect(page, SIGNAL(exposedContentRectChanged()), this, SLOT(contentSizeChanged()));
    m_page->setPreferredContentsSize(page->exposedContentRect().size().toSize());
    m_webView->setResizesToContents(true);
#endif

#ifdef Q_OS_UNIX
    m_webView->load(QUrl("file://" PREFIX "/share/hotot-qt/html/index.html"));
#else
    m_webView->load(QUrl("share/hotot-qt/html/index.html"));
#endif
    connect(m_webView, SIGNAL(loadFinished(bool)), this, SLOT(loadFinished(bool)));
}

#ifdef MEEGO_EDITION_HARMATTAN
void MainWindow::contentSizeChanged()
{
    m_page->setPreferredContentsSize(currentPage()->exposedContentRect().size().toSize());
}
#endif

void MainWindow::closeEvent(QCloseEvent *event)
{
#ifndef MEEGO_EDITION_HARMATTAN
    QSettings settings("hotot-qt", "hotot");
    settings.setValue("geometry", saveGeometry());
    settings.setValue("windowState", saveState());
#endif
    ParentWindow::closeEvent(event);
}

MainWindow::~MainWindow()
{
    delete m_inspector;
}

void MainWindow::loadFinished(bool ok)
{
    disconnect(m_webView, SIGNAL(loadFinished(bool)), this, SLOT(loadFinished(bool)));
    if (ok) {
        initDatabases();
        m_webView->page()->currentFrame()->evaluateJavaScript(QString("db.MAX_TWEET_CACHE_SIZE = 2048;"));
        m_webView->page()->currentFrame()->evaluateJavaScript(QString("db.MAX_USER_CACHE_SIZE = 128;"));
        m_webView->page()->currentFrame()->evaluateJavaScript(QString("i18n.locale = \"%1\";").arg(QLocale::system().name()));
        m_webView->page()->currentFrame()->evaluateJavaScript("globals.load_flags = 1;");
    }
}

void MainWindow::initDatabases()
{
    const QWebSecurityOrigin& origin = m_webView->page()->currentFrame()->securityOrigin();
    const QList<QWebDatabase>& databases = origin.databases();
    Q_FOREACH(QWebDatabase webDatabase, databases) {
        {
            QSqlDatabase sqldb = QSqlDatabase::addDatabase("QSQLITE", "myconnection");
            sqldb.setDatabaseName(webDatabase.fileName());
            if (sqldb.open()) {
                sqldb.exec("vacuum");

                if (webDatabase.name() == "hotot.cache") {
                    sqldb.exec("vacuum");
                    QSqlQuery result = sqldb.exec("select value from Info where key=\"settings\"");
                    while (result.next()) {
                        QString settings = result.value(0).toString();
                        m_webView->page()->currentFrame()->evaluateJavaScript("hotot_qt = " + settings + ";");
                        bool useHttpProxy = m_webView->page()->currentFrame()->evaluateJavaScript("hotot_qt.use_http_proxy").toBool();
                        bool useHttpProxyAuth = m_webView->page()->currentFrame()->evaluateJavaScript("hotot_qt.use_http_proxy_auth").toBool();
                        int httpProxyPort = m_webView->page()->currentFrame()->evaluateJavaScript("hotot_qt.http_proxy_port").toInt();
                        QString httpProxyHost = m_webView->page()->currentFrame()->evaluateJavaScript("hotot_qt.http_proxy_host").toString();
                        QString httpProxyAuthName = m_webView->page()->currentFrame()->evaluateJavaScript("hotot_qt.http_proxy_auth_name").toString();
                        QString httpProxyAuthPassword = m_webView->page()->currentFrame()->evaluateJavaScript("hotot_qt.http_proxy_auth_password").toString();

                        if (useHttpProxy) {
                            QNetworkProxy proxy(QNetworkProxy::HttpProxy,
                                                httpProxyHost,
                                                httpProxyPort);
                            
                            if (useHttpProxyAuth)
                            {
                                proxy.setUser(httpProxyAuthName);
                                proxy.setPassword(httpProxyAuthPassword);
                            }

                            m_webView->page()->networkAccessManager()->setProxy(proxy);
                        }
                        
                    }
                }
                sqldb.close();
            }
        }
        QSqlDatabase::removeDatabase("myconnection");
    }
}

void MainWindow::triggerVisible()
{
#ifndef Q_WS_MAC
#ifdef HAVE_KDE
    const KWindowInfo info = KWindowSystem::windowInfo( winId(), 0, 0 );
    const int currentDesktop = KWindowSystem::currentDesktop();
    if( !isVisible() )
    {
        setVisible( true );
        KWindowSystem::setOnDesktop( winId(), currentDesktop );
        KWindowSystem::forceActiveWindow( winId() );
    }
    else
    {
        if( !isMinimized() )
        {
            if( !isActiveWindow() ) // not minimised and without focus
            {
                KWindowSystem::setOnDesktop( winId(), currentDesktop );
                KWindowSystem::forceActiveWindow( winId() );
            }
            else // Amarok has focus
            {
                setVisible( false );
            }
        }
        else // Amarok is minimised
        {
            setWindowState( windowState() & ~Qt::WindowMinimized );
            KWindowSystem::setOnDesktop( winId(), currentDesktop );
            KWindowSystem::forceActiveWindow( winId() );
        }
    }
#else
    setVisible(!isVisible());
#endif
#else
    show();
#endif
}

void MainWindow::notification(QString type, QString title, QString message, QString image)
{
    m_tray->showMessage(type, title, message, image);
}

void MainWindow::activate()
{
    if (!isActiveWindow()) {
        if (!isVisible()) {
#ifndef Q_WS_MAC
#ifdef HAVE_KDE
            KWindowSystem::activateWindow( winId() );
#else
            setVisible(true);
#endif
#else
            show();
#endif
        }
    }
}

void MainWindow::unreadAlert(QString number)
{
    m_tray->unreadAlert(number);
}

void MainWindow::setEnableDeveloperTool(bool e)
{
    m_webView->settings()->globalSettings()->setAttribute(QWebSettings::DeveloperExtrasEnabled, e);
    if (e)
        m_menu->insertAction(m_actionExit, m_actionDev);
    else
        m_menu->removeAction(m_actionDev);
    m_tray->setContextMenu(m_menu);

}

void MainWindow::showDeveloperTool()
{
    m_inspector->setVisible(true);
}

#ifndef MEEGO_EDITION_HARMATTAN
void MainWindow::toggleMinimizeToTray(bool checked)
{
    QSettings settings("hotot-qt", "hotot");
    settings.setValue("minimizeToTray", checked);
}

void MainWindow::changeEvent(QEvent *event)
{
    if (event->type() == QEvent::WindowStateChange) {
        if (isMinimized() && m_actionMinimizeToTray->isChecked()) {
            hide();
        }
    }
    ParentWindow::changeEvent(event);
}
#endif

