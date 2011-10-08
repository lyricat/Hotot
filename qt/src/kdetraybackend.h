#ifndef KDETRAY_BACKEND_H
#define KDETRAY_BACKEND_H
#include "trayiconbackend.h"

class KStatusNotifierItem;
class KDETrayBackend : public TrayIconBackend
{
    Q_OBJECT
public:
    KDETrayBackend(MainWindow* parent = 0);
    virtual void setContextMenu(QMenu* menu);
    virtual void showMessage(QString type, QString title, QString message, QString image);
    virtual void unreadAlert(QString number);
protected Q_SLOTS:
    void activate();
private:
    MainWindow* m_mainWindow;
    KStatusNotifierItem* m_statusNotifierItem;
};

#endif