install(DIRECTORY ${PROJECT_SOURCE_DIR}/data/ DESTINATION share/hotot-qt/html PATTERN .hg PATTERN *~ EXCLUDE)

install(FILES ${PROJECT_SOURCE_DIR}/data/image/ic64_hotot_classics.png DESTINATION share/icons/hicolor/64x64/apps/ RENAME hotot_qt.png)
install(FILES ${PROJECT_SOURCE_DIR}/data/image/ic32_hotot_classics.png DESTINATION share/icons/hicolor/32x32/apps/ RENAME hotot_qt.png)

install(FILES ${PROJECT_SOURCE_DIR}/data/image/ic24_hotot_mono_light.svg
        DESTINATION share/icons/hicolor/scalable/status/ RENAME hotot_qt-inactive.svg)
install(FILES ${PROJECT_SOURCE_DIR}/data/image/ic24_hotot_mono_dark.svg
        DESTINATION share/icons/hicolor/scalable/status/ RENAME hotot_qt-active.svg)
install(FILES hotot-qt.desktop DESTINATION share/applications/ )

if (HAVE_KDE)
install(FILES hotot_qt.svg DESTINATION ${KDE4_DATA_INSTALL_DIR}/desktoptheme/default/icons)
endif (HAVE_KDE)