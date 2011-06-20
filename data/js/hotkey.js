var hotkey = hotkey || {}
hotkey = {
// key shortcuts map:   index = f(keyCode, isShift, isCtrl)
//                      value = [null, proc] or [next_key_val_seq, proc]
map: [],
waiting_key: -1,
next_key_seq_idx : 0,
init:
function init() {
    for (var i = 0; i < 42 * 4; i += 1) {
        hotkey.map[i] = null;
    }
},

crack:
function crack(event) {
    if (event.keyCode == 27) { //ESC
        hotkey.waiting_key = -1;
        return;
    }
    var idx = hotkey.calculate(event.keyCode, event.shiftKey, event.ctrlKey); 
    if (hotkey.waiting_key == -1) {
        var value = hotkey.map[idx];
        if (value != null) {
            if (value[0] == null) {
                value[1](event);
            } else {
                hotkey.waiting_key = idx;
            } 
        }
    } else {
        var value = hotkey.map[hotkey.waiting_key];
        if (value == null) {
            hotkey.waiting_key = -1;
        } else {
            if (idx == value[0][hotkey.next_key_seq_idx]) {
                if (hotkey.next_key_seq_idx == value[0].length - 1) {
                    hotkey.waiting_key = -1;
                    hotkey.next_key_seq_idx = 0;
                    value[1](event);
                } else {
                    hotkey.next_key_seq_idx += 1;    
                }
            } else {
                hotkey.waiting_key = -1;
                hotkey.next_key_seq_idx = 0;
            }
        }
    }
},

register:
function register(idxs, callback) {
    if (typeof idxs == 'number') {
        hotkey.map[idxs] = [null, callback];
    } else if (typeof idxs == 'object' && idxs.constructor == Array){
        if (idxs.length == 0) return -1;
        if (idxs.length == 1) {
            hotkey.map[idxs[0]] = [null, callback];
        } else {
            hotkey.map[idxs[0]] = [idxs.slice(1), callback];
        }
    } else {
        return -1;
    }
},

calculate:
function calculate(keyCode, shiftKey, ctrlKey) {
    var idx = (keyCode - 49)*4;
    if (shiftKey) { idx += 1;}
    if (ctrlKey) { idx += 2;}
    return idx;
},
    
};

