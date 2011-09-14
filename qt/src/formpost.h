/* from : http://code.google.com/p/bungeni-transcriber/ */

#ifndef __FORMPOST_H__
#define __FORMPOST_H__
#include <QtPlugin>
#include <QString>
#include <QByteArray>
#include <QFile>
#include <QProgressBar>
#include <QDateTime>
#include <QWidget>
#include <QNetworkAccessManager>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QDebug>

class FormPost: public QObject
{
Q_OBJECT
  public:
    FormPost(QNetworkAccessManager* manager);
    QString userAgent();
    void setUserAgent(QString agent);
    QString referer();
    void setReferer(QString ref);
    QString encoding();
    void setEncoding(QString enc);
    void addField(QString name, QString value);
    void addFile(QString fieldName, QByteArray file, QString name, QString mime);
    void addFile(QString fieldName, QString fileName, QString mime);
    QNetworkReply * postData(QNetworkRequest& request);
    QByteArray response();
    QNetworkAccessManager * http;
  private:
    QByteArray data;
    QByteArray strToEnc(QString s);
    QString encodingS;
    QString userAgentS;
    QString refererS;
    QStringList fieldNames;
    QStringList fieldValues;
    QStringList fileFieldNames;
    QStringList fileNames;
    QStringList fileMimes;
    QList<QByteArray> files;
  private slots:
    void readData(QNetworkReply * r);
};

#endif