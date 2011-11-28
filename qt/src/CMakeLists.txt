include_directories(${QT_INCLUDE_DIR})
include_directories(${QT_QTCORE_INCLUDE_DIR})
include_directories(${QT_QTGUI_INCLUDE_DIR})
include_directories(${QT_QTSQL_INCLUDE_DIR})
include_directories(${QT_QTWEBKIT_INCLUDE_DIR})
include_directories(${QT_QTNETWORK_INCLUDE_DIR})
include_directories(${PROJECT_BINARY_DIR})
include_directories(${CMAKE_CURRENT_BINARY_DIR})
include_directories(${CMAKE_CURRENT_SOURCE_DIR})

set(Hotot_QT_SRCS
    formpost.cpp
    hototrequest.cpp
    main.cpp
    mainwindow.cpp
    hototwebpage.cpp
    trayiconbackend.cpp
    qttraybackend.cpp
    hototwebview.cpp
)

set(Hotot_QT_MOC_SRCS
    mainwindow.h
    formpost.h
    hototrequest.h
    hototwebpage.h
    qttraybackend.h
    trayiconbackend.h
    hototwebview.h
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
target_link_libraries(hotot-qt
    ${QT_QTCORE_LIBRARY}
    ${QT_QTGUI_LIBRARY}
    ${QT_QTSQL_LIBRARY}
    ${QT_QTWEBKIT_LIBRARY}
    ${QT_QTNETWORK_LIBRARY}
)

if(HAVE_KDE)
    target_link_libraries(hotot-qt ${KDE4_KDEUI_LIBRARY})
endif(HAVE_KDE)

install(TARGETS hotot-qt DESTINATION bin)
