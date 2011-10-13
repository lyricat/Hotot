cmake_minimum_required(VERSION 2.6)

project(hotot-qt)

find_package(Gettext REQUIRED)

option(WITH_KDE "Enable KDE4 integration" ON)

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

configure_file(config.h.in config.h)

# uninstall target
configure_file(
    "${CMAKE_CURRENT_SOURCE_DIR}/cmake/cmake_uninstall.cmake.in"
    "${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake"
    IMMEDIATE @ONLY)

set(CMAKE_CXX_FLAGS "-Wall -Wextra -Wno-sign-compare -Wno-unused-parameter -fvisibility=hidden ${CMAKE_CXX_FLAGS}")
set(CMAKE_SHARED_LINKER_FLAGS "-Wl,--as-needed ${CMAKE_SHARED_LINKER_FLAGS}")
set(CMAKE_MODULE_LINKER_FLAGS "-Wl,--as-needed ${CMAKE_MODULE_LINKER_FLAGS}")

add_custom_target(uninstall
    COMMAND ${CMAKE_COMMAND} -P ${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake)

add_subdirectory(qt)
