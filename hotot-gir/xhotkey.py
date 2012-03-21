'''
@author: Xu Zhen
@license: LGPLv3+

usage:

import xhotkey

def func(event):
    print event["key"], event["modifiers"]

x = xhotkey.XHotKey()
x.start()
key, modifiers = x.parse("<Alt><Ctrl><Shift>A")
x.bind(key, modifiers, func)
x.unbind(key, modifiers, func)
key, modifiers = x.parse("<Control><B>")
x.bind(key, modifiers, func)
x.bind(key, modifiers, func)
x.bind(key, modifiers, func)
x.unbind(key, modifiers, func)
x.unbind(key, modifiers)
x.stop()
'''

import Xlib.display
import Xlib.XK
import Xlib.X
import re
import time
import threading
import traceback
import sys

class XHotKey(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.display = Xlib.display.Display()
        self.root = self.display.screen().root
        mask = Xlib.X.LockMask | Xlib.X.Mod2Mask | Xlib.X.Mod3Mask | Xlib.X.Mod5Mask
        self.ignore_masks = [x for x in xrange(mask+1) if not (x & ~mask)]
        self.mask = Xlib.X.ShiftMask | Xlib.X.ControlMask | Xlib.X.Mod1Mask | Xlib.X.Mod4Mask
        self.registry = {}

    def run(self):
        self.running = True
        while self.running:
            pending_events = self.display.pending_events()
            if pending_events == 0:
                time.sleep(0.1)
                continue
            event = self.display.next_event()
            if event.type != Xlib.X.KeyPress:
                continue
            keycode = event.detail
            modifiers = event.state & self.mask
            k = str(keycode) + "-" + str(modifiers)
            if k not in self.registry:
                continue
            callbacks = self.registry[k]
            for callback in callbacks:
                try:
                    callback({"keycode":keycode, "modifiers":modifiers})
                except:
                    print "Exception:"
                    traceback.print_exc(file=sys.stdout)

    def stop(self):
        self.running = False

    def parse(self, keysdesc):
        mod_names = {
            "Shift": Xlib.X.ShiftMask,
            "Ctrl": Xlib.X.ControlMask,
            "Control": Xlib.X.ControlMask,
            "Alt": Xlib.X.Mod1Mask,
            "Mod1": Xlib.X.Mod1Mask,
            "Winkey": Xlib.X.Mod4Mask,
            "Win": Xlib.X.Mod4Mask,
            "Mod4": Xlib.X.Mod4Mask,
        }
        keys = re.split("<|><|>", keysdesc)
        modifiers = 0
        keycode = 0
        for k in keys:
            if k == "":
                continue
            kc = k.capitalize()
            if kc in mod_names:
                modifiers |= mod_names[kc]
            else:
                if keycode != 0:
                    return None, None
                if hasattr(Xlib.XK, "XK_" + k):
                    keysym = getattr(Xlib.XK, "XK_" + k)
                elif hasattr(Xlib.XK, "XK_" + kc):
                    keysym = getattr(Xlib.XK, "XK_" + kc)
                elif hasattr(Xlib.XK, "XK_" + kc.lower()):
                    keysym = getattr(Xlib.XK, "XK_" + kc.lower())
                else:
                    return None, None
                keycode = self.display.keysym_to_keycode(keysym)
        if keycode == 0:
            return None, None
        return keycode, modifiers

    def bind(self, keycode, modifiers, callback):
        if keycode == None or modifiers == None or callback == None:
            return False
        k = str(keycode) + "-" + str(modifiers)
        if k not in self.registry:
            mode = Xlib.X.GrabModeAsync
            for mask in self.ignore_masks:
                self.root.grab_key(keycode, modifiers | mask, False, mode, mode)
            self.registry[k] = []
        self.registry[k].append(callback)
        return True

    def unbind(self, keycode, modifiers, callback = None):
        k = str(keycode) + "-" + str(modifiers)
        if k not in self.registry:
            return False
        if callback is None:
            del self.registry[k]
            for mask in self.ignore_masks:
                self.root.ungrab_key(keycode, modifiers | mask)
            return True
        else:
            callbacks = self.registry[k]
            if callback in callbacks:
                callbacks.remove(callback)
                if len(callbacks) == 0:
                    del self.registry[k]
                    for mask in self.ignore_masks:
                        self.root.ungrab_key(keycode, modifiers | mask)
                return True
            else:
                return False

    def clear(self):
        for k in self.registry:
            key = k.split("-")
            for mask in self.ignore_masks:
                self.root.ungrab_key(int(key[0]), int(k[1]) | mask)
        self.registry.clear()
