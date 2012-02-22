set(hotot_SRCS
    __init__.py
    agent.py
    config.py
    gtknotification.py
    hotot.py
    i18n.py
    utils.py
    view.py
)

foreach(pyfile ${hotot_SRCS})
    PYTHON_INSTALL(${pyfile} ${PYTHON_SITE_PACKAGES_INSTALL_DIR}/hotot)
endforeach(pyfile ${hotot_SRCS})
