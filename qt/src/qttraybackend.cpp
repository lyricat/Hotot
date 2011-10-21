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
#include <QSystemTrayIcon>

// Hotot
#include "qttraybackend.h"
#include "mainwindow.h"

QtTrayBackend::QtTrayBackend(MainWindow* parent):
    TrayIconBackend(parent),
    m_mainWindow(parent),
    m_trayicon(new QSystemTrayIcon(this))
{
    m_trayicon->setIcon(QIcon::fromTheme("hotot_qt", QIcon("share/hotot-qt/html/image/ic64_hotot.png")));
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
