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

#ifndef HOTOTREQUEST_H
#define HOTOTREQUEST_H

#include <QObject>
#include <QMap>
#include <QList>
#include <QVariant>
#include <QNetworkAccessManager>

class FormPost;
class QNetworkReply;
class QNetworkAccessManager;

class HototRequest : public QObject
{
    Q_OBJECT
public:
    HototRequest(const QString& uuid,
                 const QString& request_method,
                 const QString& request_url,
                 const QMap<QString, QVariant>& request_params,
                 const QMap<QString, QVariant>& request_headers,
                 const QList<QVariant>& request_files,
                 const QString&  userAgent,
                 QNetworkAccessManager* manager,
                 QObject* parent = 0);
    ~HototRequest();

    bool doRequest();
Q_SIGNALS:
    void requestFinished(HototRequest* request, QByteArray result, QString uuid, bool hasError);
protected Q_SLOTS:
    void finished();
private:
    QNetworkAccessManager* m_manager;
    QString m_uuid;
    QString m_method;
    QString m_url;
    QMap<QString, QVariant> m_params;
    QNetworkReply* m_reply;
    QMap<QString, QVariant> m_headers;
    QList<QVariant> m_files;
    QString m_userAgent;
};

#endif