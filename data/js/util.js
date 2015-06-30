window.util = {

native_platform: ['Linux', 'Windows', 'Mac'],

compare_id:
function compare_id(id1, id2) {
    if (id1.length < id2.length) {
        return -1;
    } else if (id2.length < id1.length) {
        return 1;
    } else {
        if (id1 == id2) 
            return 0;
        else 
            return id1 < id2? -1: 1;
    }
},

generate_uuid:
function generate_uuid() {
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
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
        for (var i = 0, l = pairs.length; i < l; i += 1) {
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
},

cache_avatar:
function cache_avatar(user_obj) {
    db.get_user(user_obj.screen_name, function (exists_user) {
        var imgurl = util.big_avatar(user_obj.profile_image_url_https);
        var imgname = imgurl.substring(imgurl.lastIndexOf('/')+1);
        var avatar_file = user_obj.screen_name + '_' + imgname;
        hotot_action('action/save_avatar/'
            + encodeURIComponent(imgurl) + '/'
            + encodeURIComponent(avatar_file));     
    });
},

get_avatar:
function get_avatar(screen_name, callback) {
    if (util.is_native_platform()) {
        db.get_user(screen_name, function (user) {
            var imgurl = util.big_avatar(user.profile_image_url_https);
            var avatar_file = user.screen_name + '_' + imgurl.substring(imgurl.lastIndexOf('/')+1);
            callback(conf.vars.avatar_cache_dir + '/' + avatar_file);
        });
    } else {
        db.get_user(screen_name, function (user) {
            callback(util.big_avatar(user.profile_image_url_https));
        }); 
    }
},

concat:
function concat(arr, lst) {
    for (var i = 0; i < lst.length; i += 1) {
        arr.push(lst[i]);
    }
    return arr;
},

big_avatar: 
function big_avatar(url){
    return String(url).replace('normal','bigger');
}

};


