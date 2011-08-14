var hotkey = hotkey || {}
hotkey = {
// key shortcuts map:
//     value = [key_val_seq, proc]
map: [],
matched: [], // matched proc 
iqueue: [],
state: 0,

// mod key definition
shiftKey: 1,
ctrlKey: 2,
altKey: 4,

init:
function init() {
},

crack:
function crack(event) {
    if (event.keyCode == 27) { //ESC, clear input queue
        hotkey.state = 0;
        hotkey.iqueue.splice(0, hotkey.iqueue.length);
        return;
    }
    var idx = hotkey.calculate(event.keyCode, event.shiftKey?hotkey.shiftKey:null, event.ctrlKey?hotkey.ctrlKey:null, event.altKey?hotkey.altKey:null); 
    hotkey.iqueue.push(idx);
    if (hotkey.state == 0) { // new input
        hotkey.state = 1;
        hotkey.matched = hotkey.map.filter(function (x) {
            return x[0][0] == idx;
        });
    } else {
        var current_idx = hotkey.iqueue.length - 1;
        hotkey.matched = hotkey.matched.filter(function (x) {
            return x[0][current_idx] == idx; 
        });
    }
    if (hotkey.matched.length == 0) {
        hotkey.state = 0;
        hotkey.iqueue.splice(0, hotkey.iqueue.length);
    }
    if (hotkey.matched.length == 1 
        && hotkey.matched[0][0].length == hotkey.iqueue.length) {
        hotkey.state = 0;
        hotkey.iqueue.splice(0, hotkey.iqueue.length);
        hotkey.matched[0][1](event);
    }
},

register:
function register(idxs, callback) {
    if (typeof idxs == 'number') {
        hotkey.map.push([[idxs], callback]);
    } else if (typeof idxs == 'object' && idxs.constructor == Array){
        hotkey.map.push([idxs, callback]);
    } else {
        return -1;
    }
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
},
    
};

