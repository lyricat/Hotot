project(hotot_qt C CXX)

# Setup KDE4 support
if(WITH_KDE)
    find_package(KDE4)
    if(KDE4_FOUND)
        message(STATUS "Enabling KDE4 integration")
        include_directories(${KDE4_INCLUDES})
        add_definitions(${KDE4_DEFINITIONS})
        set(HAVE_KDE 1)
    else(KDE4_FOUND)
        message(STATUS "KDE4 not found, disabling KDE integration")
    endif(KDE4_FOUND)
    else(WITH_KDE)
        message(STATUS "Not enabling KDE4 integration")
endif(WITH_KDE)

if(NOT HAVE_KDE)
    find_package(Qt4 4.7 REQUIRED COMPONENTS QtCore QtGui QtWebkit QtSql)
endif(NOT HAVE_KDE)

set(CMAKE_CXX_FLAGS "-Wall -Wextra -Wno-sign-compare -Wno-unused-parameter -fvisibility=hidden ${CMAKE_CXX_FLAGS}")
set(CMAKE_SHARED_LINKER_FLAGS "-Wl,--as-needed ${CMAKE_SHARED_LINKER_FLAGS}")
set(CMAKE_MODULE_LINKER_FLAGS "-Wl,--as-needed ${CMAKE_MODULE_LINKER_FLAGS}")

configure_file(${CMAKE_CURRENT_SOURCE_DIR}/config.h.in ${CMAKE_CURRENT_BINARY_DIR}/config.h)

include_directories(${QT_INCLUDE_DIR})
include_directories(${QT_QTCORE_INCLUDE_DIR})
include_directories(${QT_QTGUI_INCLUDE_DIR})
include_directories(${QT_QTWEBKIT_INCLUDE_DIR})
include_directories(${QT_QTNETWORK_INCLUDE_DIR})
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

if (HAVE_KDE)
    set(Hotot_QT_SRCS
        ${Hotot_QT_SRCS}
        kdetraybackend.cpp
    )
    set(Hotot_QT_MOC_SRCS
        ${Hotot_QT_MOC_SRCS}
        kdetraybackend.h
    )
endif (HAVE_KDE)

qt4_wrap_cpp(Hotot_QT_MOCS ${Hotot_QT_MOC_SRCS})
add_executable(hotot-qt ${Hotot_QT_SRCS} ${Hotot_QT_MOCS})

set_target_properties(hotot-qt PROPERTIES LINKER_LANGUAGE CXX)

target_link_libraries(hotot-qt
    ${QT_QTCORE_LIBRARY}
    ${QT_QTGUI_LIBRARY}
    ${QT_QTWEBKIT_LIBRARY}
    ${QT_QTNETWORK_LIBRARY}
)

if(HAVE_KDE)
    target_link_libraries(hotot-qt ${KDE4_KDEUI_LIBRARY} ${KDE4_KIO_LIBS})
    install(FILES ../misc/hotot_qt.svg DESTINATION ${KDE4_DATA_INSTALL_DIR}/desktoptheme/default/icons)
endif (HAVE_KDE)

install(TARGETS hotot-qt DESTINATION bin)
