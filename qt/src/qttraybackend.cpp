#include "common.h"

// Qt
#include <QSystemTrayIcon>

// Hotot
#include "qttraybackend.h"
#include "mainwindow.h"

QtTrayBackend::QtTrayBackend(MainWindow* parent):
    TrayIconBackend(parent),
    m_mainWindow(parent),
    m_trayicon(new QSystemTrayIcon(this))
{
    m_trayicon->setIcon(QIcon::fromTheme("hotot-qt", QIcon("share/hotot-qt/html/image/ic64_hotot_classics.png" )));
    m_trayicon->show();
    connect(m_trayicon,
            SIGNAL(activated(QSystemTrayIcon::ActivationReason)),
            this,
            SLOT(trayIconClicked(QSystemTrayIcon::ActivationReason)));
    connect(m_trayicon,
             SIGNAL(messageClicked()),
            this,
            SLOT(messageClicked()));
}

void QtTrayBackend::setContextMenu(QMenu* menu)
{
    m_trayicon->setContextMenu(menu);
}

void QtTrayBackend::showMessage(QString type, QString title, QString message, QString image)
{
    Q_UNUSED(type)
    Q_UNUSED(image)
    m_trayicon->showMessage(title, message);
}

void QtTrayBackend::messageClicked()
{
    m_mainWindow->activate();
}

void QtTrayBackend::trayIconClicked(QSystemTrayIcon::ActivationReason reason)
{
    if (reason == QSystemTrayIcon::Trigger)
        m_mainWindow->triggerVisible();
}

void QtTrayBackend::unreadAlert(QString number)
{
    m_trayicon->setToolTip(i18n("%1 unread Messages").arg(number));
}


#include "qttraybackend.moc"