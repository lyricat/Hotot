/* from : http://code.google.com/p/bungeni-transcriber/ */

#include "formpost.h"

FormPost::FormPost(QNetworkAccessManager* manager)
    : QObject(0)
{
    userAgentS = "";
    encodingS = "utf-8";
    refererS = "";
    http = manager;
}

QString FormPost::userAgent()
{
    return userAgentS;
}

void FormPost::setUserAgent(QString agent)
{
    userAgentS = agent;
}

QString FormPost::referer()
{
    return refererS;
}

void FormPost::setReferer(QString ref)
{
    refererS = ref;
}

QString FormPost::encoding()
{
    return encodingS;
}

void FormPost::setEncoding(QString enc)
{
    if (enc == "utf-8" || enc == "ascii") {
        encodingS = enc;
    }
}

QByteArray FormPost::strToEnc(QString s)
{
    if (encodingS == "utf-8") {
        return s.toUtf8();
    } else {
        return s.toLatin1();
    }
}

void FormPost::addField(QString name, QString value)
{
    fieldNames.append(name);
    fieldValues.append(value);
}

void FormPost::addFile(QString fieldName, QByteArray file, QString name, QString mime)
{
    files.append(file);
    fileFieldNames.append(fieldName);
    fileNames.append(name);
    fileMimes.append(mime);
}

void FormPost::addFile(QString fieldName, QString fileName, QString mime)
{
    QFile f(fileName);
    f.open(QIODevice::ReadOnly);
    QByteArray file = f.readAll();
    f.close();
    QString name;
    if (fileName.contains("/")) {
        int pos = fileName.lastIndexOf("/");
        name = fileName.right(fileName.length() - pos - 1);
    } else if (fileName.contains("\\")) {
        int pos = fileName.lastIndexOf("\\");
        name = fileName.right(fileName.length() - pos - 1);
    } else {
        name = fileName;
    }
    addFile(fieldName, file, name, mime);
}

QNetworkReply * FormPost::postData(QNetworkRequest& request)
{
    QString crlf = "\r\n";
    qsrand(QDateTime::currentDateTime().toTime_t());
    QString b = QVariant(qrand()).toString() + QVariant(qrand()).toString()
                + QVariant(qrand()).toString();
    QString boundary = "---------------------------" + b;
    QString endBoundary = crlf + "--" + boundary + "--" + crlf;
    QString contentType = "multipart/form-data; boundary=" + boundary;
    boundary = "--" + boundary + crlf;
    QByteArray bond = boundary.toLatin1();
    QByteArray send;
    bool first = true;

    for (int i = 0; i < fieldNames.size(); i++) {
        send.append(bond);
        if (first) {
            boundary = crlf + boundary;
            bond = boundary.toLatin1();
            first = false;
        }
        send.append(QString("Content-Disposition: form-data; name=\""
                            + fieldNames.at(i) + "\"" + crlf).toLatin1());
        if (encodingS == "utf-8") send.append(QString("Content-Transfer-Encoding: 8bit"
                                                  + crlf).toLatin1());
        send.append(crlf.toLatin1());
        send.append(strToEnc(fieldValues.at(i)));
    }
    for (int i = 0; i < files.size(); i++) {
        send.append(bond);
        send.append(QString("Content-Disposition: form-data; name=\""
                            + fileFieldNames.at(i) + "\"; filename=\""
                            + fileNames.at(i) + "\"" + crlf).toLatin1());
        send.append(QString("Content-Type: " + fileMimes.at(i) + crlf + crlf).toLatin1());
        send.append(files.at(i));
    }

    send.append(endBoundary.toLatin1());

    fieldNames.clear();
    fieldValues.clear();
    fileFieldNames.clear();
    fileNames.clear();
    fileMimes.clear();
    files.clear();


    connect(http, SIGNAL(finished(QNetworkReply *)), this, SLOT(readData(QNetworkReply *)));
    if (userAgentS != "") request.setRawHeader("User-Agent", userAgentS.toLatin1());
    if (refererS != "") request.setRawHeader("Referer", refererS.toLatin1());
    request.setHeader(QNetworkRequest::ContentTypeHeader, contentType.toLatin1());
    request.setHeader(QNetworkRequest::ContentLengthHeader, QVariant(send.size()).toString());
    QNetworkReply * reply = http->post(request, send);
    return reply;
}

void FormPost::readData(QNetworkReply * r)
{
    this->data = r->readAll();
}

QByteArray FormPost::response()
{
    return this->data;
}
