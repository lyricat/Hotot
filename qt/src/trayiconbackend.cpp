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

#include "trayiconbackend.h"
#include "mainwindow.h"

TrayIconBackend::TrayIconBackend(MainWindow* parent): QObject(parent)
{

}

void TrayIconBackend::setContextMenu(QMenu* menu)
{
    Q_UNUSED(menu)
}

void TrayIconBackend::showMessage(QString type, QString title, QString message, QString image)
{
    Q_UNUSED(type)
    Q_UNUSED(image)
    Q_UNUSED(title)
    Q_UNUSED(message)
}

void TrayIconBackend::unreadAlert(QString number)
{
    Q_UNUSED(number)
}


#include "trayiconbackend.moc"