var hotkey = hotkey || {}
hotkey = {
// key shortcuts map:   index = f(keyCode, isShift, isCtrl)
//                      value = [null, proc] or [next_key_val, proc]
map: [],
waiting_key: -1,
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
    console.log(idx);
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
        if (value != null && value[0] == idx) {
            value[1](event);
        }
        hotkey.waiting_key = -1;
    }
},

register:
function register(idx1, idx2, callback) {
    console.log(idx1);
    if (idx2 == null) {
        hotkey.map[idx1] = [null, callback];
    } else {
        hotkey.map[idx1] = [idx2, callback];
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

