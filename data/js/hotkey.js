var hotkey = hotkey || {}
hotkey = {
map: [],

// mod key definition
shiftKey: 1,
ctrlKey: 2,
altKey: 4,

init:
function init() {
    $(document).bind("keypress keydown keyup", hotkey.crack);
},

crack:
function crack(event) {
    if (event.keyCode == 27) { //ESC, reset all input queues
        for (var i = 0, i_max = hotkey.map.length; i < i_max; i++) {
            hotkey.map[i].pos = 0;
        }
        return;
    }

    var checkKey = function(map) {
        var matched = true;
        var key = map.seq[map.pos];
		if (typeof key === "string") {
			var modkeys = key.substring(0, key.length - 1);
			if (event.ctrlKey !== (modkeys.indexOf("C") >= 0)
			     || event.altKey !== (modkeys.indexOf("A") >= 0)
				 || key.charCodeAt(key.length - 1) !== event.charCode) {
				matched = false;
			}
        } else {
            var ckey = hotkey.calculate(event.keyCode,
                event.shiftKey?hotkey.shiftKey:null,
                event.ctrlKey?hotkey.ctrlKey:null,
                event.altKey?hotkey.altKey:null);
            if (key !== ckey) {
                matched = false;
            }
        }
        if (matched) {
            map.pos++;
            if (map.pos >= map.seq.length) {
                try {
                    event.preventDefault();
                    map.f(event);
                } catch(ex) {
                }
                map.pos = 0;
            }
        } else {
            map.pos = 0;
        }
    }

    var isFocusOnInput = (/^INPUT$|^TEXTAREA$/.test(event.target.tagName)) && $(event.target).is(':visible');
    var isViewVisible = globals.signed_in;
    var isMenuVisible = $(".hotot_menu:visible").length > 0;

    var etype = event.type[3].toUpperCase();
    for (var i = 0, i_max = hotkey.map.length; i < i_max; i++) {
        var map = hotkey.map[i];
        var flags = map.flags;
        if (flags.indexOf(etype) >= 0) {
            var c = true;
            if (flags.indexOf("*") < 0) {
                if (isFocusOnInput && flags.indexOf("i") < 0) {
                    c = false;
                } else if (!isViewVisible && flags.indexOf("g") < 0) {
                    c = false;
                } else if (isMenuVisible && flags.indexOf("m") < 0) {
                    c = false;
                }
            }
            if (c) {
                checkKey(map);
            } else {
                map.pos = 0;
            }
        }
    }
},

register:
function register(keySeq, flags, callback) {
// flags:
//   "*": call callback function in any cases
//   "i": call callback function, even typing text
//   "g": call callback function, even not login
//   "m": call callback function, even a popup menu showed
//   "U": call callback function at keyup event
//   "D": call callback function at keydown event
//   "P": call callback function at keypress event (default)
    var keys;
    if (typeof keySeq === "string") {
        keys = [];
        for (var i = 0, i_max = keySeq.length; i < i_max; i++) {
            var keyChar = keySeq[i];
            if (keyChar === "<") {
                var p = keySeq.indexOf(">", i + 1);
                if (p == -1) {
                    return false;
                }
                keyChar = keySeq.substring(i + 1, p).replace(/([AC])-/g, "$1");
                i = p;
            }
            keys.push(keyChar);
        }
    } else if (typeof keySeq === "number") {
        keys = [ keySeq ];
    } else if ((keySeq instanceof Array) && typeof keySeq[0] === "number") {
        keys = [].concat(keySeq);
    } else {
        return false;
    }
    if (typeof flags === "function") {
        callback = flags;
        flags = "";
    }
    if (!/[UD]/.test(flags)) {
        flags += "P";
    }
    hotkey.map.push({ seq:keys, f:callback, pos:0, flags:flags });
    return true;
},

calculate:
function calculate(keyCode, modkeys) {
    var idx = keyCode << 3;
    for (var i = 1, i_max = arguments.length; i < i_max; i++) {
        var key = arguments[i];
        if (key === hotkey.shiftKey || key === hotkey.ctrlKey || key === hotkey.altKey) {
            idx |= key;
        }
    }
    return idx;
}

};

