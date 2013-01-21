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

python_install_module(${HOTOT_PY_NAME} ${hotot_gir_SRCS})
