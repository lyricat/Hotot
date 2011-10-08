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

#ifndef TRAYICON_BACKEND_H
#define TRAYICON_BACKEND_H
#include <QObject>

class MainWindow;
class QMenu;
class TrayIconBackend : public QObject
{
    Q_OBJECT
public:
    TrayIconBackend(MainWindow* parent = 0);
    virtual void setContextMenu(QMenu* menu);
    virtual void showMessage(QString type, QString title, QString message, QString image);
    virtual void unreadAlert(QString number);
};

#endif