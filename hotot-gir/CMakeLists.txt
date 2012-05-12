set(hotot_gir_SRCS
    __init__.py
    agent.py
    config.py
    dbusservice.py
    notification.py
    hotot.py
    i18n.py
    inspector.py
    utils.py
    view.py
    xhotkey.py
)

foreach(pyfile ${hotot_gir_SRCS})
    PYTHON_INSTALL(${pyfile} ${PYTHON_SITE_PACKAGES_INSTALL_DIR}/hotot)
endforeach(pyfile ${hotot_gir_SRCS})
