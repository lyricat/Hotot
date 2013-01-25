project(hotot_qt5 C CXX)

find_package(Qt5Core REQUIRED)
find_package(Qt5Gui REQUIRED)
find_package(Qt5Widgets REQUIRED)
find_package(Qt5WebKit REQUIRED)
find_package(Qt5WebKitWidgets REQUIRED)
find_package(Qt5Sql REQUIRED)

configure_file(../qt/config.h.in config.h)

include_directories("${CMAKE_CURRENT_BINARY_DIR}")
include_directories("${CMAKE_CURRENT_SOURCE_DIR}/../qt")

set(CMAKE_CXX_FLAGS "-Wall -Wextra -Wno-sign-compare -Wno-unused-parameter -fvisibility=hidden ${CMAKE_CXX_FLAGS}")
set(CMAKE_SHARED_LINKER_FLAGS "-Wl,--as-needed ${CMAKE_SHARED_LINKER_FLAGS}")
set(CMAKE_MODULE_LINKER_FLAGS "-Wl,--as-needed ${CMAKE_MODULE_LINKER_FLAGS}")

set(HOTOT_QT5_INCLUDE_DIRS
  ${Qt5Core_INCLUDE_DIRS}
  ${Qt5Gui_INCLUDE_DIRS}
  ${Qt5Widgets_INCLUDE_DIRS}
  ${Qt5WebKit_INCLUDE_DIRS}
  ${Qt5WebKitWidgets_INCLUDE_DIRS}
  ${Qt5NetWork_INCLUDE_DIRS}
  )
set(HOTOT_QT5_LINKS
  ${Qt5Core_LIBRARIES}
  ${Qt5Gui_LIBRARIES}
  ${Qt5Widgets_LIBRARIES}
  ${Qt5WebKit_LIBRARIES}
  ${Qt5WebKitWidgets_LIBRARIES}
  ${Qt5NetWork_LIBRARIES}
  )

add_definitions("-fPIC -DHAVE_QT5")

function(hotot_set_qt5_target tgt)
  get_target_property(HOTOT_INCLUDES "${tgt}" INCLUDE_DIRECTORIES)
  if(HOTOT_INCLUDES)
    set(HOTOT_QT5_INCLUDE_DIRS ${HOTOT_QT5_INCLUDE_DIRS}
      ${HOTOT_INCLUDES})
  endif()
  set_target_properties("${tgt}"
    PROPERTIES LINKER_LANGUAGE CXX
    INCLUDE_DIRECTORIES "${HOTOT_QT5_INCLUDE_DIRS}")
  target_link_libraries("${tgt}" ${HOTOT_QT5_LINKS})
endfunction()

set(Hotot_QT_SRCS
  ../qt/formpost.cpp
  ../qt/hototrequest.cpp
  ../qt/main.cpp
  ../qt/mainwindow.cpp
  ../qt/hototwebpage.cpp
  ../qt/qttraybackend.cpp
  )
set(Hotot_QT_MOC_SRCS
  ../qt/mainwindow.h
  ../qt/formpost.h
  ../qt/hototrequest.h
  ../qt/hototwebpage.h
  ../qt/qttraybackend.h
  )
qt5_wrap_cpp(Hotot_QT_MOCS ${Hotot_QT_MOC_SRCS})

add_executable(hotot-qt5 ${Hotot_QT_SRCS} ${Hotot_QT_MOCS})
hotot_set_qt5_target(hotot-qt5)
install(TARGETS hotot-qt5 DESTINATION bin)
set(HOTOT_QT_BIN hotot-qt5)
configure_file("${PROJECT_SOURCE_DIR}/../misc/hotot-qt5.desktop.in.in"
  hotot-qt5.desktop.in @ONLY)
intltool_merge_translation(
  "${CMAKE_CURRENT_BINARY_DIR}/hotot-qt5.desktop.in"
  "${CMAKE_CURRENT_BINARY_DIR}/hotot-qt5.desktop")
add_custom_target(desktopfile-qt5 ALL
  DEPENDS "${CMAKE_CURRENT_BINARY_DIR}/hotot-qt5.desktop")
install(FILES "${CMAKE_CURRENT_BINARY_DIR}/hotot-qt5.desktop"
  DESTINATION share/applications/)
