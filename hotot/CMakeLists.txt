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

python_install_module(hotot ${hotot_SRCS})
