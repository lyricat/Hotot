cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0002 OLD)
project(hotot NONE)
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

    if (NOT PYTHONLIBRARY_FOUND)
        message(FATAL_ERROR "GTK Wrapper for Hotot need python")
    endif (NOT PYTHONLIBRARY_FOUND)

    INCLUDE(PythonMacros)
    if (WITH_GIR)
        add_subdirectory(hotot-gir)
    else (WITH_GIR)
        add_subdirectory(hotot)
    endif (WITH_GIR)
    configure_file(${CMAKE_CURRENT_SOURCE_DIR}/scripts/hotot.in ${CMAKE_CURRENT_BINARY_DIR}/scripts/hotot @ONLY)
    install(PROGRAMS ${CMAKE_CURRENT_BINARY_DIR}/scripts/hotot DESTINATION bin )
endif (WITH_GTK)


##################### CHROME Version ######################
if (WITH_CHROME)
    add_subdirectory(chrome)
endif (WITH_CHROME)

##################### Qt Version ######################
if (WITH_QT)
    add_subdirectory(qt)
endif (WITH_QT)

add_subdirectory(po)
add_subdirectory(misc)
