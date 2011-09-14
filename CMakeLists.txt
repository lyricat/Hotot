cmake_minimum_required(VERSION 2.6)

project(hotot-qt)

find_package(Qt4 4.7 REQUIRED COMPONENTS QtCore QtGui QtWebkit QtSql)

configure_file(config.h.in config.h)

# uninstall target
configure_file(
    "${CMAKE_CURRENT_SOURCE_DIR}/cmake/cmake_uninstall.cmake.in"
    "${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake"
    IMMEDIATE @ONLY)

add_custom_target(uninstall
    COMMAND ${CMAKE_COMMAND} -P ${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake)

add_subdirectory(qt)
