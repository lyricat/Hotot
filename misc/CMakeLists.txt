install(DIRECTORY "${PROJECT_SOURCE_DIR}/data/"
  DESTINATION share/hotot
  PATTERN .hg PATTERN *~ EXCLUDE)

install(FILES "${PROJECT_SOURCE_DIR}/data/image/ic24_hotot_mono_light.svg"
  DESTINATION share/icons/hicolor/scalable/status/
  RENAME hotot_qt-inactive.svg)
install(FILES "${PROJECT_SOURCE_DIR}/data/image/ic24_hotot_mono_dark.svg"
  DESTINATION share/icons/hicolor/scalable/status/
  RENAME hotot_qt-active.svg)

set(ICON_SIZE 22x22 24x24 32x32 48x48 64x64 128x128)

foreach(size ${ICON_SIZE})
  install(FILES "${PROJECT_SOURCE_DIR}/data/icons/${size}/apps/hotot.png"
    DESTINATION "share/icons/hicolor/${size}/apps/")
endforeach()
