#
# This is a simple demo to test qt4 + openssl + mingw + cmake for Windows on Linux.
# License : MIT-LICENSE
#
if(WIN32)
	#We haven't built Qt with debug support, so no point setting debug flags.
	set(CMAKE_BUILD_TYPE "Release")
	ADD_DEFINITIONS(${QT_DEFINITIONS})
	SET_PROPERTY(DIRECTORY APPEND PROPERTY COMPILE_DEFINITIONS_RELEASE QT_NO_DEBUG)

	#set the default pathes, should be changed to match your setup.
	set(WIN32_BASE /usr/i686-w64-mingw32)
	set(QT_BASE ${WIN32_BASE}/sys-root/mingw)
	set(APP_ICON_RC ${CMAKE_CURRENT_SOURCE_DIR}/qt/win32_icon.rc)

	set(MINGW_PREFIX "i686-w64-mingw32-")

	# set "sane" default cxxflags for windows, the -mwindows so it wouldn't open a command dos window.
	set(CMAKE_CXX_FLAGS_RELEASE  "${CMAKE_CXX_FLAGS_RELEASE} -march=pentium4 -mtune=pentium4 -mwindows -O2")
	# we need -static-libgcc otherwise we'll link against libgcc_s_sjlj-1.dll.
	SET(CMAKE_SHARED_LIBRARY_LINK_CXX_FLAGS "-Wl,--no-undefined -static-libgcc -Wl,-O1 -Wl,--as-needed -Wl,--sort-common -s")

	#you should NOT mess with things below this line.

	#set mingw defaults
	set(CMAKE_CXX_COMPILER ${MINGW_PREFIX}g++)
	set(CMAKE_AR           ${MINGW_PREFIX}ar)
	set(CMAKE_RANLIB       ${MINGW_PREFIX}ranlib)
	set(CMAKE_LINKER       ${MINGW_PREFIX}ld)
	set(CMAKE_STRIP        ${MINGW_PREFIX}strip)

	set(CMAKE_EXECUTABLE_SUFFIX ".exe") # if we don't do this, it'll output executables without the .exe suffix

	# add an icon to the exe if we set one.
	if(APP_ICON_RC)
		set(WIN32_ICON_O ${CMAKE_CURRENT_BINARY_DIR}/_app_icon.o)
		ADD_CUSTOM_COMMAND( OUTPUT ${WIN32_ICON_O}
							COMMAND ${MINGW_PREFIX}windres
								-I${CMAKE_CURRENT_SOURCE_DIR}
								-o${WIN32_ICON_O}
								-i${APP_ICON_RC}
							)
	endif()
	foreach(module QtCore QtGui QtSvg QtNetwork QtScript QtHelp QtWebKit QtTest QtXml QtSql QtCLucene)
		string(TOUPPER "${module}" umod)
#		if(QT_USE_${module})
			set(QT_${umod}_LIBRARY ${QT_BASE}/lib/${module}4.dll)
			set(QT_LIBRARIES ${QT_LIBRARIES} ${QT_${umod}_LIBRARY})
#		endif()
	endforeach()
	set(QT_INCLUDES ${QT_BASE}/include/)

	message("Building For   : Win32")
	if(NOT IS_DIRECTORY ${QT_BASE}/lib)
		message("Error : ${QT_BASE} doesn't exist, won't be able to link against Qt4.")
	endif()
else() #include Qt4 defaults for linux
	include(${QT_USE_FILE})
endif()
