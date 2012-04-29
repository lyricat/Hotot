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
#include <QDesktopServices>
#include <QWebDatabase>
#include <QWebSettings>
#include <QDir>
#include <QWebSecurityOrigin>
#include <QDebug>
#include <QWebFrame>
#include <QNetworkProxy>
#include <QSettings>
#include <QFontDatabase>
#include <QTimer>
#include <QLocale>
#include <QSystemTrayIcon>
#include <QMenu>
#include <QToolTip>
#include <QCursor>
#include <QWebInspector>
#include <QGraphicsView>
#include <QTimer>

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
#ifdef HAVE_KDE
#include "kdetraybackend.h"
#endif

MainWindow::MainWindow(bool socks, QWidget *parent) :
    ParentWindow(parent),
    m_page(0),
    m_webView(new QWebView),
#ifndef MEEGO_EDITION_HARMATTAN
    m_actionMinimizeToTray(new QAction(i18n("&Minimize to Tray"), this)),
#endif
    m_inspector(0),
    m_useSocks(socks),
    m_fontDB()
{
#ifdef Q_OS_UNIX
    chdir(PREFIX);
#endif
    setWindowTitle(i18n("Hotot"));
    setWindowIcon(QIcon::fromTheme("hotot_qt", QIcon("share/hotot/image/ic64_hotot.png")));
    qApp->setWindowIcon(QIcon::fromTheme("hotot_qt", QIcon("share/hotot/image/ic64_hotot.png")));
#ifndef MEEGO_EDITION_HARMATTAN
    this->resize(QSize(640, 480));
    this->setCentralWidget(m_webView);
    this->setMinimumSize(QSize(400, 400));
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

    m_menu = new QMenu(this);

#ifndef MEEGO_EDITION_HARMATTAN
    QSettings settings("hotot-qt", "hotot");
    m_actionMinimizeToTray->setCheckable(true);
    m_actionMinimizeToTray->setChecked(settings.value("minimizeToTray", false).toBool());
    connect(m_actionMinimizeToTray, SIGNAL(toggled(bool)), this, SLOT(toggleMinimizeToTray(bool)));
    m_menu->addAction(m_actionMinimizeToTray);
#endif
    m_actionShow = new QAction(QIcon(), i18n("Show &MainWindow"), this);
    connect(m_actionShow, SIGNAL(triggered()), this, SLOT(show()));
    m_menu->addAction(m_actionShow);

    m_actionExit = new QAction(QIcon::fromTheme("application-exit"), i18n("&Exit"), this);
    m_actionExit->setShortcut(QKeySequence::Quit);
    connect(m_actionExit, SIGNAL(triggered()), this, SLOT(exit()));
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

#ifdef Q_OS_UNIX
    QDir dir(QDir::homePath().append("/.config/hotot-qt"));
#else
    QDir dir(QDesktopServices::storageLocation(QDesktopServices::DataLocation).append("/Hotot"));
#endif

    if (!dir.exists())
        dir.mkpath(".");

    m_confDir = dir.absolutePath();

    QWebSettings::setOfflineStoragePath(dir.absolutePath());
    QWebSettings::setOfflineStorageDefaultQuota(15 * 1024 * 1024);

    m_webView->setPage(m_page);
    QWebSettings::globalSettings()->setAttribute(QWebSettings::LocalContentCanAccessFileUrls, true);
    QWebSettings::globalSettings()->setAttribute(QWebSettings::LocalContentCanAccessRemoteUrls, true);
    QWebSettings::globalSettings()->setAttribute(QWebSettings::LocalStorageEnabled, true);
    QWebSettings::globalSettings()->setAttribute(QWebSettings::OfflineStorageDatabaseEnabled, true);
    QWebSettings::globalSettings()->setAttribute(QWebSettings::JavascriptCanOpenWindows, true);
    QWebSettings::globalSettings()->setAttribute(QWebSettings::JavascriptCanAccessClipboard, true);
    QWebSettings::globalSettings()->setAttribute(QWebSettings::JavascriptEnabled, true);

    m_inspector = new QWebInspector;
    m_inspector->setPage(m_page);

#ifdef MEEGO_EDITION_HARMATTAN
    connect(page, SIGNAL(exposedContentRectChanged()), this, SLOT(contentSizeChanged()));
    m_page->setPreferredContentsSize(page->exposedContentRect().size().toSize());
    m_webView->setResizesToContents(true);
#endif

#ifdef Q_OS_UNIX
    m_webView->load(QUrl("file://" PREFIX "/share/hotot/index.html"));
#else
    QFileInfo f("share/hotot/index.html");
    m_webView->load(QUrl::fromLocalFile(f.absoluteFilePath()));
#endif
    connect(m_webView, SIGNAL(loadFinished(bool)), this, SLOT(loadFinished(bool)));
    connect(m_page, SIGNAL(linkHovered(QString, QString, QString)), this, SLOT(onLinkHovered(QString, QString, QString)));
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
    if (isCloseToExit()) {
        exit();
    }
    else {
        event->ignore();
        hide();
    }
#else
    ParentWindow::closeEvent(event);
#endif
}

void MainWindow::exit()
{
    qApp->exit();
}

bool MainWindow::isCloseToExit() {
    QVariant var = m_webView->page()->currentFrame()->evaluateJavaScript("conf.settings.close_to_exit");
    if (var.isValid()) {
        return var.toBool();
    }
    else
        return false;
}

bool MainWindow::isStartMinimized() {
    QVariant mini = m_webView->page()->currentFrame()->evaluateJavaScript("conf.settings.starts_minimized");
    if (!mini.isValid())
        mini = m_webView->page()->currentFrame()->evaluateJavaScript("hotot_qt.starts_minimized");
    if (mini.isValid()) {
        return mini.toBool();
    }
    else
        return false;
}

bool MainWindow::isAutoSignIn() {
    QVariant mini = m_webView->page()->currentFrame()->evaluateJavaScript("conf.settings.sign_in_automatically");
    if (!mini.isValid())
        mini = m_webView->page()->currentFrame()->evaluateJavaScript("hotot_qt.sign_in_automatically");
    if (mini.isValid()) {
        return mini.toBool();
    }
    else
        return false;
}

MainWindow::~MainWindow()
{
#ifndef MEEGO_EDITION_HARMATTAN
    QSettings settings("hotot-qt", "hotot");
    settings.setValue("geometry", saveGeometry());
    settings.setValue("windowState", saveState());
#endif
    delete m_inspector;
}

void MainWindow::loadFinished(bool ok)
{
    disconnect(m_webView, SIGNAL(loadFinished(bool)), this, SLOT(loadFinished(bool)));
    if (ok) {
        QString confString = QString(
            "hotot_qt_variables = {"
            "      'platform': 'Linux'"
            "    , 'avatar_cache_dir': '%3'"
            "    , 'extra_fonts': %4"
            "    , 'extra_exts': %5"
            "    , 'extra_themes': %6"
            "    , 'locale': '%7'"
            "};").arg(m_confDir)
                 .arg(extraFonts())
                 .arg(extraExtensions())
                 .arg(extraThemes())
                 .arg(QLocale::system().name());

        m_webView->page()->currentFrame()->evaluateJavaScript(confString);
        QTimer::singleShot(0, this, SLOT(notifyLoadFinished()));
#ifndef MEEGO_EDITION_HARMATTAN
        if (!isStartMinimized() || !isAutoSignIn()) {
            show();
            QSettings settings("hotot-qt", "hotot");
            restoreGeometry(settings.value("geometry").toByteArray());
            restoreState(settings.value("windowState").toByteArray());
        }
#else
        show();
#endif
    }
    else {
        show();
    }
}

void MainWindow::notifyLoadFinished()
{
    m_webView->page()->currentFrame()->evaluateJavaScript(
        "overlay_variables(hotot_qt_variables);"
        "globals.load_flags = 1;");
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
    if (isVisible()) {
        setVisible(!isVisible());
    }
    else {
        setVisible(!isVisible());
        setWindowState(windowState() & ~Qt::WindowMinimized);
        activateWindow();
    }

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
    QWebSettings::globalSettings()->setAttribute(QWebSettings::DeveloperExtrasEnabled, e);
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
    ParentWindow::changeEvent(event);
    if (event->type() == QEvent::WindowStateChange) {
        if (m_actionMinimizeToTray->isChecked() && isMinimized()) {
            QTimer::singleShot(0, this, SLOT(hide()));
            event->ignore();
        }
    }
}
#endif

void MainWindow::onLinkHovered(const QString & link, const QString & title, const QString & textContent )
{
    if (!link.isEmpty() && !title.isEmpty()) {
        QToolTip::showText(QCursor::pos(), title);
    }
}

QString MainWindow::extraFonts()
{
    return toJSArray(m_fontDB.families());
}

QString MainWindow::extraThemes()
{
    QDir dir(QString(m_confDir).append("/theme"));
    if (!dir.exists())
        return toJSArray();

    QStringList dirList = dir.entryList(QDir::NoDotAndDotDot | QDir::Dirs);
    QStringList themeList;

    Q_FOREACH(const QString& themedir, dirList) {
        QFileInfo info1(dir.absoluteFilePath(QString(themedir).append("/info.json")));
        QFileInfo info2(dir.absoluteFilePath(QString(themedir).append("/style.css")));
        if (info1.exists() && info1.isFile() && info2.exists() && info2.isFile())
            themeList << QUrl::fromLocalFile(dir.absoluteFilePath(themedir)).toString();
    }
    return toJSArray(themeList);
}

QString MainWindow::extraExtensions()
{
    QDir dir(QString(m_confDir).append("/ext"));
    if (!dir.exists())
        return toJSArray();

    QStringList dirList = dir.entryList(QDir::NoDotAndDotDot | QDir::Dirs);
    QStringList extJSList;

    Q_FOREACH(const QString& extdir, dirList) {
        QFileInfo info(dir.absoluteFilePath(QString(extdir).append("/entry.js")));
        if (info.exists() && info.isFile())
            extJSList << QUrl::fromLocalFile(info.absoluteFilePath()).toString();
    }
    return toJSArray(extJSList);
}

QString MainWindow::toJSArray(const QStringList& list)
{
    QString itemString;
    bool first = true;
    Q_FOREACH(const QString& item, list)
    {
        QString s = item;
        s.replace("\\", "\\\\");
        s.replace("'", "\\'");
        if (!first) {
            itemString.append(",");
        }
        itemString.append("'").append(s).append("'");
        first = false;
    }

    return QString("[%1]").arg(itemString);
}

bool MainWindow::useSocks()
{
    return m_useSocks;
}
