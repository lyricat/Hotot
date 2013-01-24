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

#ifndef COMMON_H
#define COMMON_H

#include <QtGlobal>
#include "config.h"

#ifndef _MSC_VER
#include <getopt.h>
#endif

#ifndef Q_OS_WIN32
#include <unistd.h>
#endif

#ifdef HAVE_KDE
#   include <KLocalizedString>
#else
#   if defined(Q_OS_WIN32) || defined(Q_OS_MAC)
#       define i18n(x) tr(x)
#   else
#       include <libintl.h>
#       define i18n(x) QString::fromUtf8(gettext(x))
#   endif
#endif

#endif
