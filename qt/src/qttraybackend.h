#ifndef QTTRAY_BACKEND_H
#define QTTRAY_BACKEND_H

// Qt
#include <QSystemTrayIcon>

// Hotot
#include "trayiconbackend.h"

class QtTrayBackend : public TrayIconBackend
{
    Q_OBJECT
public:
    QtTrayBackend(MainWindow* parent = 0);
    virtual void setContextMenu(QMenu* menu);
    virtual void showMessage(QString type, QString title, QString message, QString image);
    virtual void unreadAlert(QString number);
protected Q_SLOTS:
    void trayIconClicked(QSystemTrayIcon::ActivationReason reason);
    void messageClicked();
private:
    MainWindow* m_mainWindow;
    QSystemTrayIcon* m_trayicon;
};

#endif