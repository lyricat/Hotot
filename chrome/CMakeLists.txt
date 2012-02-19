add_custom_target(chrome ALL)

find_program(RSYNC rsync)
if (NOT RSYNC)
    message(FATAL_ERROR "hotot-chrome generation requires rsync")
endif(NOT RSYNC)

add_custom_command(
    TARGET chrome
    COMMAND "${CMAKE_CURRENT_SOURCE_DIR}/mk-chrome-app.sh" "${PROJECT_SOURCE_DIR}" "${CMAKE_CURRENT_BINARY_DIR}" "${RSYNC}"
)