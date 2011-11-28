install(DIRECTORY ${PROJECT_SOURCE_DIR}/data/ DESTINATION share/hotot-qt/html PATTERN .hg PATTERN *~ EXCLUDE)

install(FILES ${PROJECT_SOURCE_DIR}/data/image/ic24_hotot_mono_light.svg
        DESTINATION share/icons/hicolor/scalable/status/ RENAME hotot_qt-inactive.svg)
install(FILES ${PROJECT_SOURCE_DIR}/data/image/ic24_hotot_mono_dark.svg
        DESTINATION share/icons/hicolor/scalable/status/ RENAME hotot_qt-active.svg)
install(FILES hotot-qt.desktop DESTINATION share/applications/ )

set(ICON_SIZE 22x22 24x24 32x32 48x48 64x64 128x128)

foreach(size ${ICON_SIZE})
    install(FILES ${PROJECT_SOURCE_DIR}/data/icons/${size}/apps/hotot.png
            DESTINATION share/icons/hicolor/${size}/apps/ RENAME hotot_qt.png)
endforeach(size ${ICON_SIZE})

if (HAVE_KDE)
install(FILES hotot_qt.svg DESTINATION ${KDE4_DATA_INSTALL_DIR}/desktoptheme/default/icons)
endif (HAVE_KDE)
