file(GLOB PO_FILES RELATIVE ${CMAKE_CURRENT_SOURCE_DIR} *.po)
file(RELATIVE_PATH REL_SOURCE_ROOT ${PROJECT_BINARY_DIR} ${PROJECT_SOURCE_DIR})
if ("${REL_SOURCE_ROOT}" STREQUAL "")
    set(REL_SOURCE_ROOT ".")
endif("${REL_SOURCE_ROOT}" STREQUAL "")

set(POT_FILE hotot.pot)

configure_file(POTFILES.in.in ${CMAKE_CURRENT_BINARY_DIR}/POTFILES.in)

add_custom_command(OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/js.po
                   COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/i18n_scanner.py
                   COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/i18n_extractor.py > ${CMAKE_CURRENT_BINARY_DIR}/js.po
                   WORKING_DIRECTORY ${PROJECT_SOURCE_DIR})
                   
find_program(INTLTOOL_EXTRACT intltool-extract)
find_program(INTLTOOL_UPDATE intltool-update)

add_custom_target(
    pot
    COMMAND INTLTOOL_EXTRACT=${INTLTOOL_EXTRACT} srcdir=${CMAKE_CURRENT_BINARY_DIR} ${INTLTOOL_UPDATE} --gettext-package hotot --pot
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/js.po
    )

# Update .po files and compile them to binary .gmo files
gettext_create_translations(${POT_FILE} ALL ${PO_FILES})
