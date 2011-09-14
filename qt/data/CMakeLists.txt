install(DIRECTORY ${PROJECT_SOURCE_DIR}/data/ DESTINATION share/hotot-qt/html PATTERN .hg PATTERN *~ EXCLUDE)

install(FILES ${PROJECT_SOURCE_DIR}/data/image/ic64_hotot_classics.png DESTINATION share/icons/hicolor/64x64/apps/ RENAME hotot-qt.png)
install(FILES ${PROJECT_SOURCE_DIR}/data/image/ic32_hotot_classics.png DESTINATION share/icons/hicolor/32x32/apps/ RENAME hotot-qt.png)
install(FILES hotot-qt.desktop DESTINATION share/applications/ )