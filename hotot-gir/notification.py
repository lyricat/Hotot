# -*- coding: UTF-8 -*-
# vim:set shiftwidth=4 tabstop=4 expandtab textwidth=79:
import os
import utils

try: import i18n
except: from gettext import gettext as _

class Notification:
    def __init__(self):
        from gi.repository import Notify
        Notify.init(_("Hotot Notification"))
        caps = Notify.get_server_caps()
        self.markup = caps and 'body-markup' in caps
        self.notification = Notify.Notification

    def show(self, summary, body, icon_file = None):
        if (icon_file == None or not os.path.isfile(icon_file)):
            icon_file = utils.get_ui_object(os.path.join('image','ic64_hotot.png'))
        n = self.notification.new(self.escape(summary), self.escape(body), icon_file)
        n.set_timeout(5000)
        n.show()

    def escape(self, text):
        if (self.markup):
            text = text.replace('&', '&amp;')
            text = text.replace('<', '&lt;')
            text = text.replace('>', '&gt;')
        return text

