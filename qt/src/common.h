#include "config.h"

#ifdef HAVE_KDE
#include <KLocalizedString>
#else
#include <libintl.h>
#define i18n(x) QString::fromUtf8(gettext(x))
#endif
