cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0002 OLD)
project(hotot)
set(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake/modules ${CMAKE_MODULE_PATH})

find_package(Gettext REQUIRED)

option(WITH_GTK "Enable GTK Version" On)
option(WITH_GIR "Use GIR as GTK Version" Off)

option(WITH_QT "Enable Qt Version" On)
option(WITH_KDE "Enable KDE4 integration for Qt" On)

option(WITH_CHROME "Enable Chrome Version" Off)

# uninstall target
configure_file(
    "${CMAKE_CURRENT_SOURCE_DIR}/cmake/cmake_uninstall.cmake.in"
    "${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake"
    IMMEDIATE @ONLY)

add_custom_target(uninstall
    COMMAND ${CMAKE_COMMAND} -P ${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake)

##################### GTK Version ######################
if (WITH_GTK)
    FIND_PACKAGE(PythonLibrary REQUIRED)
    INCLUDE(PythonMacros)
    if (WITH_GIR)
        add_subdirectory(hotot-gir)
    else (WITH_GIR)
        add_subdirectory(hotot)
    endif (WITH_GIR)
    install(PROGRAMS scripts/hotot DESTINATION bin )
endif (WITH_GTK)


##################### CHROME Version ######################
if (WITH_CHROME)
    add_subdirectory(chrome)
endif (WITH_CHROME)

##################### Qt Version ######################
if (WITH_QT)

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

    add_subdirectory(qt)
endif (WITH_QT)

add_subdirectory(po)
add_subdirectory(misc)
