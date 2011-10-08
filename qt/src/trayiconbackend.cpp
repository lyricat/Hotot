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