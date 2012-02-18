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

// Qt
#include <QWebFrame>
#include <QDebug>

#include "hototwebview.h"

HototWebView::HototWebView(QGraphicsWebView* webview, QWidget* parent)
    : QGraphicsView(new QGraphicsScene(), parent), m_webview(webview)
{
    setViewportUpdateMode(QGraphicsView::BoundingRectViewportUpdate);
    setOptimizationFlags(QGraphicsView::DontSavePainterState);

    setHorizontalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
    setVerticalScrollBarPolicy(Qt::ScrollBarAlwaysOff);

    setFrameShape(QFrame::NoFrame);
    setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    scene()->addItem(m_webview);
    setAcceptDrops(true);
}

void HototWebView::resizeEvent(QResizeEvent *e)
{
    QGraphicsView::resizeEvent(e);
    setUpdatesEnabled(false);

    if (!m_webview)
        return;

    QRectF rect(QPointF(0, 0), size());
    scene()->setSceneRect(rect);

    m_webview->setGeometry(rect);
    setUpdatesEnabled(true);
    update();
}

void HototWebView::dragEnterEvent(QDragEnterEvent* event)
{
    if (event->mimeData()->hasFormat("text/uri-list") && event->mimeData()->hasUrls())
        event->acceptProposedAction();
}

void HototWebView::dropEvent(QDropEvent* event)
{
    if (!event->mimeData()->hasFormat("text/uri-list") || !event->mimeData()->hasUrls())
        return;
    else {
        if (event->mimeData()->urls().length() <= 0)
            return;
        QUrl url = event->mimeData()->urls().at(0);
        if (url.isLocalFile()) {
            QString cmd = QString(
                "ui.ImageUploader.pyload(\"%1\");\n"
                "ui.ImageUploader.show();"
            ).arg(url.toLocalFile());
            m_webview->page()->currentFrame()->evaluateJavaScript(cmd);
        }
    }
}
