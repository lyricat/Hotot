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
)

qt4_automoc(${Hotot_QT_SRCS})
qt4_wrap_ui(Hotot_QT_SRCS mainwindow.ui)
add_executable(hotot-qt ${Hotot_QT_SRCS})
target_link_libraries(hotot-qt
    ${QT_QTCORE_LIBRARY}
    ${QT_QTGUI_LIBRARY}
    ${QT_QTSQL_LIBRARY}
    ${QT_QTWEBKIT_LIBRARY}
    ${QT_QTNETWORK_LIBRARY}
)

install(TARGETS hotot-qt DESTINATION bin)
