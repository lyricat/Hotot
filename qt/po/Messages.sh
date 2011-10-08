#!/bin/sh

BASEDIR="../src" # root of translatable sources
PROJECT="hotot-qt" # project name
BUGADDR="https://github.com/shellex/Hotot/issues" # MSGID-Bugs
WDIR="`pwd`" # working dir

echo "Preparing rc files"

# we use simple sorting to make sure the lines do not jump around too much from system to system
find "${BASEDIR}" -name '*.rc' -o -name '*.ui' -o -name '*.kcfg' | sort > "${WDIR}/rcfiles.list"
xargs --arg-file="${WDIR}/rcfiles.list" extractrc > "${WDIR}/rc.cpp"

# additional string for KAboutData
echo 'i18nc("NAME OF TRANSLATORS","Your names");' >> "${WDIR}/rc.cpp"
echo 'i18nc("EMAIL OF TRANSLATORS","Your emails");' >> "${WDIR}/rc.cpp"

echo "Done preparing rc files"
echo "Extracting messages"

# see above on sorting

find "${BASEDIR}" -name '*.cpp' -o -name '*.h' -o -name '*.c' | sort > "${WDIR}/infiles.list"
echo "rc.cpp" >> "${WDIR}/infiles.list"

xgettext --from-code=UTF-8 -C -kde -ci18n -ki18n:1 -ki18nc:1c,2 -ki18np:1,2 -ki18ncp:1c,2,3 \
    -ktr2i18n:1 -kI18N_NOOP:1 -kI18N_NOOP2:1c,2 -kaliasLocale -kki18n:1 -kki18nc:1c,2 \
    -kki18np:1,2 -kki18ncp:1c,2,3 --msgid-bugs-address="${BUGADDR}" --files-from=infiles.list \
    -D "${BASEDIR}" -D "${WDIR}" -o "${PROJECT}.pot" || \
    { echo "error while calling xgettext. aborting."; exit 1; }
echo "Done extracting messages"

echo "Merging translations"
catalogs=`find . -name '*.po'`
for cat in $catalogs; do
    echo "$cat"
    msgmerge -o "$cat.new" "$cat" "${WDIR}/${PROJECT}.pot"
    mv "$cat.new" "$cat"
done

echo "Done merging translations"
echo "Cleaning up"
rm "${WDIR}/rcfiles.list"
rm "${WDIR}/infiles.list"
rm "${WDIR}/rc.cpp"
echo "Done"
