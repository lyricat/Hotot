if (typeof util == 'undefined') var util = {};
util = {

native_platform: ['Linux', 'Windows', 'Mac'],

compare_id:
function compare_id(id1, id2) {
    if (id1.length < id2.length) {
        return 1;
    } else if (id2.length < id1.length) {
        return -1;
    } else {
        if (id1 == id2) 
            return 0;
        else 
            return id1 < id2? 1: -1;
    }
},

unserialize_dict:
function unserialize_dict(str) {
    /* str = urlencode(key1)
     *  + '=' + urlencode(value1)
     *  + '&'
     *  + urlencode(key2) 
     *  + '=' + urlencode(value2)
     *  --> 
     *      {key1: value1, key2: value2 ...} 
     * */
    dict = {}; // return {} if dict is invalid.
    var pairs = str.split('&');
    if (1 < pairs.length) { 
        for (var i = 0; i < pairs.length; i += 1) {
            var pair = pairs[i].split('=');
            dict[decodeURIComponent(pair[0])]
                = decodeURIComponent(pair[1]);
        }
    }
    return dict;
},

serialize_dict:
function serialize_dict(obj) {
    /* {key1: value1, key2: value2 ...}  --> 
     *      str = urlencode(key1)
     *      + '=' + urlencode(value1)
     *      + '&'
     *      + urlencode(key2) 
     *      + '=' + urlencode(value2)
     * */
    var arr = [];
    for (var key in obj) {
        arr.push(encodeURIComponent(key)
            + '='
            + encodeURIComponent(obj[key]));
    }
    return arr.join('&'); 
},

serialize_array:
function serialize_array(arr) {
    var ret = arr.map(
        function (elem) {
            return encodeURIComponent(elem);
        });
    return ret.join('&');
},

is_native_platform:
function is_native_platform() {
    return util.native_platform.indexOf(conf.vars.platform) != -1;
},

trace:
function trace() {
    var callstack = [];
    var i = 0;
    var currentFunction = arguments.callee.caller;
    while (currentFunction) {
        var fn = currentFunction.toString();
        var fname = fn.substring(0, fn.indexOf('\n')) || 'anonymous';
        callstack.push(fname);
        currentFunction = currentFunction.caller;
        if (i == 10) break;
        i+=1;
    }
    hotot_log('TraceBack', '\n-------------\n  ' + callstack.join('\n-------------\n  '));
}

};

