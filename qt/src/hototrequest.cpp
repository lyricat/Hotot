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

#include "hototrequest.h"
#include <QNetworkAccessManager>
#include <QNetworkRequest>
#include <QNetworkReply>
#include "formpost.h"

HototRequest::HototRequest(const QString& uuid,
                           const QString& request_method,
                           const QString& request_url,
                           const QMap<QString, QVariant>& request_params,
                           const QMap<QString, QVariant>& request_headers,
                           const QList<QVariant>& request_files,
                           const QString&  userAgent,
                           QNetworkAccessManager* manager,
                           QObject* parent) : QObject(parent),
    m_uuid(uuid),
    m_method(request_method),
    m_url(request_url),
    m_params(request_params),
    m_headers(request_headers),
    m_files(request_files),
    m_userAgent(userAgent)
{
    m_manager = manager;
}

HototRequest::~HototRequest()
{
}

bool HototRequest::doRequest()
{
    QNetworkRequest request;
    request.setUrl(m_url);
    QMap< QString, QVariant >::const_iterator iter = m_headers.begin();
    for (; iter != m_headers.end(); iter ++)
        request.setRawHeader(iter.key().toUtf8(), iter.value().toString().toUtf8());

    m_reply = NULL;
    if (m_method == "POST") {
        FormPost formPost(m_manager);
        QMap< QString, QVariant >::const_iterator paramiter = m_params.begin();

        for (; paramiter != m_params.end(); paramiter ++)
            formPost.addField(paramiter.key(), paramiter.value().toString());
        Q_FOREACH(const QVariant & filepair, m_files) {
            QList<QVariant> list = filepair.toList();
            if (list.length() == 2) {
                QString filename = list[1].toString();
                QString mimeType;
                if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
                    mimeType = "image/jpeg";
                else if (filename.endsWith(".gif"))
                    mimeType = "image/gif";
                else if (filename.endsWith(".png"))
                    mimeType = "image/png";
                else
                    mimeType = "application/octet-stream";
                formPost.addFile(list[0].toString(), list[1].toString(), mimeType);
            }
        }
        m_reply = formPost.postData(request);
    } else {
        m_reply = m_manager->get(request);
    }

    if (m_reply) {
        connect(m_reply, SIGNAL(finished()), this, SLOT(finished()));
        return true;
    } else
        return false;
}

void HototRequest::finished()
{
    int httpCode = m_reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
    QByteArray result = m_reply->readAll();
    emit requestFinished(this, result, m_uuid, m_reply->error() != QNetworkReply::NoError || httpCode != 200);
    m_reply->close();
    m_reply->deleteLater();
    m_reply = NULL;
}


#include "hototrequest.moc"