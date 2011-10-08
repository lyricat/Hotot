#include "common.h"

// KDE
#include <KStatusNotifierItem>
#include <KMenu>
#include <KIcon>

// Hotot
#include "mainwindow.h"
#include "kdetraybackend.h"

KDETrayBackend::KDETrayBackend(MainWindow* parent):
    TrayIconBackend(parent),
    m_mainWindow(parent),
    m_statusNotifierItem(new KStatusNotifierItem("hotot", this))
{
    m_statusNotifierItem->setIconByName("hotot-qt");
    m_statusNotifierItem->setTitle("Hotot");
    m_statusNotifierItem->setToolTipIconByName("hotot-qt");
    m_statusNotifierItem->setStatus( KStatusNotifierItem::Active );
    m_statusNotifierItem->setCategory( KStatusNotifierItem::Communications );
    m_statusNotifierItem->setStandardActionsEnabled(false);
    m_statusNotifierItem->setToolTipTitle(i18n("Hotot"));
    
    connect(m_statusNotifierItem, SIGNAL(activateRequested(bool,QPoint)), this, SLOT(activate()));
}

void KDETrayBackend::showMessage(QString type, QString title, QString message, QString image)
{
    Q_UNUSED(type)
    Q_UNUSED(image)
    m_statusNotifierItem->setStatus( KStatusNotifierItem::NeedsAttention );
    m_statusNotifierItem->showMessage(title, message, "hotot-qt", 4000);
}

void KDETrayBackend::setContextMenu(QMenu* menu)
{
    KMenu* kmenu = m_statusNotifierItem->contextMenu();
    Q_FOREACH(QAction* action, menu->actions())
    {
        kmenu->addAction(action);
    }
}

void KDETrayBackend::activate()
{
    m_mainWindow->triggerVisible();
}

void KDETrayBackend::unreadAlert(QString number)
{
    m_statusNotifierItem->setToolTipSubTitle(i18n("%1 unread Messages").arg(number));
}

#include "kdetraybackend.moc"