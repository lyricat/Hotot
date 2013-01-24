file(GLOB PO_FILES RELATIVE ${CMAKE_CURRENT_SOURCE_DIR} *.po)
file(RELATIVE_PATH REL_SOURCE_ROOT ${PROJECT_BINARY_DIR} ${PROJECT_SOURCE_DIR})
if ("${REL_SOURCE_ROOT}" STREQUAL "")
    set(REL_SOURCE_ROOT ".")
endif("${REL_SOURCE_ROOT}" STREQUAL "")

set(POT_FILE hotot.pot)

configure_file(POTFILES.in.in ${CMAKE_CURRENT_BINARY_DIR}/POTFILES.in)
find_program(INTLTOOL_EXTRACT intltool-extract)
find_program(INTLTOOL_UPDATE intltool-update)

set(XGETTEXT_ARGS "--from-code=UTF-8 -C -kde -ci18n -k_ -ki18n:1 -ki18nc:1c,2 -ki18np:1,2 -ki18ncp:1c,2,3 -ktr2i18n:1 -kI18N_NOOP:1 -kI18N_NOOP2:1c,2 -kaliasLocale -kki18n:1 -kki18nc:1c,2 -kki18np:1,2 -kki18ncp:1c,2,3")

add_custom_target(
    pot
    COMMAND sh -c "XGETTEXT_ARGS=\"${XGETTEXT_ARGS}\" INTLTOOL_EXTRACT=${INTLTOOL_EXTRACT} srcdir=${CMAKE_CURRENT_BINARY_DIR} ${INTLTOOL_UPDATE} --gettext-package hotot --pot"
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    )

# Update .po files and compile them to binary .gmo files
gettext_create_translations(${POT_FILE} ALL ${PO_FILES})
