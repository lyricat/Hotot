#! /bin/sh
ORIGIN="$1/data/"
SRC="$2/data/"
DEST="$2/hotot-chrome/"
RSYNC="$3"

if [ ! -x "$3" ]; then
    echo "hotot-chrome: rsync not found."
    exit 1
fi

rsync -av --exclude '.*.*' $ORIGIN $SRC

echo "\033[1;31;40m[i]Update Version ...\033[0m"
VER=`sed -n -e 's/.*version\": \"\([0-9.]*\)\",/\1/p' ${SRC}manifest.json`
sed -i "s/'version': '[0-9.]*'/'version': '${VER}'/g" ${SRC}js/conf.js

echo "\033[1;31;40m[i]Sync ...\033[0m"
# ignore .*.swp, .hgignore, etc
rsync -av --exclude '.*.*' $SRC $DEST

# replace conf.vars.platform, key and secret
echo "\033[1;31;40m[i] Replace platform, key and secret ...\033[0m"
sed -i "s/'platform': '\w*'/'platform': 'Chrome'/g" ${DEST}js/conf.js
sed -i "s/'consumer_key': '\w*'/'consumer_key': 'nYvvlKCjRBdm71An5JoFTg'/g" ${DEST}js/conf.js
sed -i "s/'consumer_secret': '\w*'/'consumer_secret': 'vt8Dw8a4cnrubcm9E0Zny72YMoFwISbovDKdI77fvJ8'/g" ${DEST}js/conf.js

echo "\033[1;31;40m[i] Done!\033[0m"

rm -f hotot-chrome.zip
zip -r hotot-chrome.zip "$DEST"
rm -rf "$DEST" "$SRC"


