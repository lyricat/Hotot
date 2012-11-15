
install(DIRECTORY ${PROJECT_SOURCE_DIR}/data/ DESTINATION share/hotot PATTERN .hg PATTERN *~ EXCLUDE)

install(FILES ${PROJECT_SOURCE_DIR}/data/image/ic24_hotot_mono_light.svg
        DESTINATION share/icons/hicolor/scalable/status/ RENAME hotot_qt-inactive.svg)
install(FILES ${PROJECT_SOURCE_DIR}/data/image/ic24_hotot_mono_dark.svg
        DESTINATION share/icons/hicolor/scalable/status/ RENAME hotot_qt-active.svg)

set(ICON_SIZE 22x22 24x24 32x32 48x48 64x64 128x128)

foreach(size ${ICON_SIZE})
    install(FILES ${PROJECT_SOURCE_DIR}/data/icons/${size}/apps/hotot.png
            DESTINATION share/icons/hicolor/${size}/apps/)
endforeach(size ${ICON_SIZE})

find_program(INTLTOOL_MERGE intltool-merge)

if (NOT INTLTOOL_MERGE)
    message(FATAL_ERROR "intltool-merge required for i18n generation")
endif (NOT INTLTOOL_MERGE)

MACRO(INTLTOOL_MERGE_TRANSLATION infile outfile)
    ADD_CUSTOM_COMMAND(
        OUTPUT ${outfile}
        COMMAND LC_ALL=C ${INTLTOOL_MERGE} -d -u ${PROJECT_SOURCE_DIR}/po ${infile} ${outfile}
        DEPENDS ${infile}
    )
ENDMACRO(INTLTOOL_MERGE_TRANSLATION)

INTLTOOL_MERGE_TRANSLATION(${CMAKE_CURRENT_SOURCE_DIR}/hotot.desktop.in ${CMAKE_CURRENT_BINARY_DIR}/hotot.desktop)
INTLTOOL_MERGE_TRANSLATION(${CMAKE_CURRENT_SOURCE_DIR}/hotot-qt.desktop.in ${CMAKE_CURRENT_BINARY_DIR}/hotot-qt.desktop)

add_custom_target(desktopfile ALL DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/hotot.desktop ${CMAKE_CURRENT_BINARY_DIR}/hotot-qt.desktop)

if (WITH_GTK)
    install(FILES ${CMAKE_CURRENT_BINARY_DIR}/hotot.desktop 
            DESTINATION share/applications/)
endif (WITH_GTK)

if (WITH_QT)
    install(FILES ${CMAKE_CURRENT_BINARY_DIR}/hotot-qt.desktop
            DESTINATION share/applications/)
endif (WITH_QT)
