project(hotot_qt C CXX)

if(WITH_KDE_QT)
  set(WITH_KDE On)
endif()

# Setup KDE4 support
if(WITH_KDE)
  find_package(Qt4 4.7 REQUIRED COMPONENTS QtCore QtGui QtWebkit QtSql)
  find_package(KDE4)
  if(KDE4_FOUND)
    message(STATUS "Enabling KDE4 integration")
    set(HOTOT_KDE4_INCLUDE_DIRS ${KDE4_INCLUDES})
    set(HAVE_KDE 1)
  else()
    message(STATUS "KDE4 not found, disabling KDE integration")
    set(WITH_KDE_QT Off)
  endif()
elseif(WITH_QT)
  message(STATUS "Not enabling KDE4 integration")
endif()

if(WITH_QT AND NOT HAVE_KDE)
  find_package(Qt4 4.7 REQUIRED COMPONENTS QtCore QtGui QtWebkit QtSql)
  set(BUILD_QT On)
elseif(HAVE_KDE)
  set(BUILD_KDE On)
  if(WITH_KDE_QT)
    set(BUILD_QT On)
    if(NOT HOTOT_KDE_BIN_NAME)
      set(HOTOT_KDE_BIN_NAME hotot-kde)
    endif()
  else()
    # specify HOTOT_KDE_BIN_NAME if you want to rename hotot-qt executable
    # with KDE support even if the version without KDE support is not enabled
    if(NOT HOTOT_KDE_BIN_NAME)
      set(HOTOT_KDE_BIN_NAME hotot-qt)
    endif()
  endif()
endif()

set(CMAKE_CXX_FLAGS "-Wall -Wextra -Wno-sign-compare -Wno-unused-parameter -fvisibility=hidden ${CMAKE_CXX_FLAGS}")
set(CMAKE_SHARED_LINKER_FLAGS "-Wl,--as-needed ${CMAKE_SHARED_LINKER_FLAGS}")
set(CMAKE_MODULE_LINKER_FLAGS "-Wl,--as-needed ${CMAKE_MODULE_LINKER_FLAGS}")

configure_file(config.h.in config.h)

set(HOTOT_QT4_INCLUDE_DIRS
  ${QT_INCLUDE_DIR}
  ${QT_QTCORE_INCLUDE_DIR}
  ${QT_QTGUI_INCLUDE_DIR}
  ${QT_QTWEBKIT_INCLUDE_DIR}
  ${QT_QTNETWORK_INCLUDE_DIR})

function(hotot_set_qt4_target tgt)
  get_target_property(HOTOT_INCLUDES "${tgt}" INCLUDE_DIRECTORIES)
  if(HOTOT_INCLUDES)
    set(HOTOT_QT4_INCLUDE_DIRS ${HOTOT_QT4_INCLUDE_DIRS}
      ${HOTOT_INCLUDES})
  endif()
  set_target_properties("${tgt}"
    PROPERTIES LINKER_LANGUAGE CXX
    INCLUDE_DIRECTORIES "${HOTOT_QT4_INCLUDE_DIRS}")
  target_link_libraries("${tgt}" ${HOTOT_QT_LINKS})
endfunction()

function(hotot_set_kde4_target tgt)
  hotot_set_qt4_target("${tgt}")
  get_target_property(HOTOT_INCLUDES "${tgt}" INCLUDE_DIRECTORIES)
  if(HOTOT_INCLUDES)
    set(HOTOT_KDE4_INCLUDE_DIRS ${HOTOT_KDE4_INCLUDE_DIRS}
      ${HOTOT_INCLUDES})
  endif()
  hotot_convert_flags(HOTOT_KDE4_DEFS HOTOT_KDE4_FLAGS ${KDE4_DEFINITIONS})
  set_target_properties("${tgt}"
    PROPERTIES COMPILE_DEFINITIONS "HAVE_KDE=1;${HOTOT_KDE4_DEFS}"
    COMPILE_FLAGS "${HOTOT_KDE4_FLAGS}"
    INCLUDE_DIRECTORIES "${HOTOT_KDE4_INCLUDE_DIRS}")
  target_link_libraries("${tgt}"
    ${KDE4_KDEUI_LIBRARY} ${KDE4_KIO_LIBS})
endfunction()

include_directories(${CMAKE_CURRENT_BINARY_DIR})
include_directories(${CMAKE_CURRENT_SOURCE_DIR})

set(Hotot_QT_SRCS
  formpost.cpp
  hototrequest.cpp
  main.cpp
  mainwindow.cpp
  hototwebpage.cpp
  qttraybackend.cpp
  )
set(Hotot_QT_MOC_SRCS
  mainwindow.h
  formpost.h
  hototrequest.h
  hototwebpage.h
  qttraybackend.h
  )

set(Hotot_KDE_SRCS
  kdetraybackend.cpp
  )
set(Hotot_KDE_MOC_SRCS
  kdetraybackend.h
  )

if(BUILD_QT OR BUILD_KDE)
  qt4_wrap_cpp(Hotot_QT_MOCS ${Hotot_QT_MOC_SRCS})
endif()

set(HOTOT_QT_LINKS
  ${QT_QTCORE_LIBRARY}
  ${QT_QTGUI_LIBRARY}
  ${QT_QTWEBKIT_LIBRARY}
  ${QT_QTNETWORK_LIBRARY}
  )

if(BUILD_QT)
  add_executable(hotot-qt ${Hotot_QT_SRCS} ${Hotot_QT_MOCS})
  hotot_set_qt4_target(hotot-qt)
  install(TARGETS hotot-qt DESTINATION bin)
  set(HOTOT_QT_BIN hotot-qt)
  configure_file("${PROJECT_SOURCE_DIR}/../misc/hotot-qt.desktop.in.in"
    hotot-qt.desktop.in @ONLY)
  intltool_merge_translation(
    "${CMAKE_CURRENT_BINARY_DIR}/hotot-qt.desktop.in"
    "${CMAKE_CURRENT_BINARY_DIR}/hotot-qt.desktop")
  add_custom_target(desktopfile-qt ALL
    DEPENDS "${CMAKE_CURRENT_BINARY_DIR}/hotot-qt.desktop")
  install(FILES "${CMAKE_CURRENT_BINARY_DIR}/hotot-qt.desktop"
    DESTINATION share/applications/)
endif()

if(BUILD_KDE)
  qt4_wrap_cpp(Hotot_KDE_MOCS ${Hotot_KDE_MOC_SRCS})
  add_executable("${HOTOT_KDE_BIN_NAME}"
    ${Hotot_QT_SRCS} ${Hotot_QT_MOCS}
    ${Hotot_KDE_SRCS} ${Hotot_KDE_MOCS})
  hotot_set_kde4_target("${HOTOT_KDE_BIN_NAME}")
  install(TARGETS "${HOTOT_KDE_BIN_NAME}" DESTINATION bin)
  install(FILES ../misc/hotot_qt.svg
    DESTINATION ${KDE4_DATA_INSTALL_DIR}/desktoptheme/default/icons)
  set(HOTOT_QT_BIN "${HOTOT_KDE_BIN_NAME}")
  configure_file("${PROJECT_SOURCE_DIR}/../misc/hotot-kde.desktop.in.in"
    "${HOTOT_KDE_BIN_NAME}.desktop.in" @ONLY)
  intltool_merge_translation(
    "${CMAKE_CURRENT_BINARY_DIR}/${HOTOT_KDE_BIN_NAME}.desktop.in"
    "${CMAKE_CURRENT_BINARY_DIR}/${HOTOT_KDE_BIN_NAME}.desktop")
  add_custom_target(desktopfile-kde ALL
    DEPENDS "${CMAKE_CURRENT_BINARY_DIR}/${HOTOT_KDE_BIN_NAME}.desktop")
  install(FILES "${CMAKE_CURRENT_BINARY_DIR}/${HOTOT_KDE_BIN_NAME}.desktop"
    DESTINATION share/applications/)
endif()
