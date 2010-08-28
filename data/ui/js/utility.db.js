if (typeof utility == 'undefined') var utility = {};
utility.DB = {

USER_CACHE: '#user_cache',

TWEET_CACHE: '#tweet_cache',

auto_complete_list: ['shellex', 'basic', 'linux', 'mac', 'windows', 'hao123', '4sq'],

init:
function init () {
    
},

dump_tweets:
function dump_tweets(json_obj) {
    var dump_single_tweet = function (tweet_obj) {
        var user = typeof tweet_obj.user != 'undefined'? 
            tweet_obj.user: tweet_obj.sender;
        var old_user = utility.DB.get(utility.DB.USER_CACHE
            , user.id.toString());
        if (utility.DB.auto_complete_list.indexOf(user.screen_name)==-1) {
            utility.DB.auto_complete_list.push(user.screen_name);
        }
        $(utility.DB.USER_CACHE).data(user.id.toString(), user);
        $(utility.DB.TWEET_CACHE).data(tweet_obj.id.toString(), tweet_obj);
    };

    if (json_obj.constructor == Array) { 
        for (var i = 0; i < json_obj.length; i += 1) {
            var tweet_obj = json_obj[i]
            if (tweet_obj.hasOwnProperty('retweeted_status')) {
                dump_single_tweet(tweet_obj['retweeted_status']);
            }
            dump_single_tweet(tweet_obj);
        }
    } else {
        dump_single_tweet(json_obj);
    }
},

set:
function set(db_name, key, value) {
    if (db_name == utility.DB.USER_CACHE) {
        var old_user = utility.DB.get(utility.DB.USER_CACHE
            , user.id.toString());
        if (utility.DB.auto_complete_list.indexOf(user.screen_name)==-1) {
            utility.DB.auto_complete_list.push(user.screen_name);
        }
        utility.DB.auto_complete_list.push(user.screen_name);
    } else {
        $(db_name).data(key, value)
    }
},

get:
function get(db_name, key) {
    return $(db_name).data(key);
},

remove:
function remove(db_name, key) {
    return $(db_name).removeData(key);
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

json:
function json(obj) {
    var ret = null;
    switch (obj.constructor) {
    case Array: {
        var arr = obj.map(
        function (val) {
            if (typeof val == 'undefined'){
                val = 'undefined';
            } else if (val == null) {
                val = 'null';
            } else if (val.constructor == Boolean 
                || val.constructor == Number
                || val.constructor == String 
                || val.constructor == Array 
                || val.constructor == Object) {
                val = utility.DB.json(val)
            } else if (val.constructor == Function) {
                continue;
            }
            return val;
        });
        ret = '[' + arr.join(',') + ']';
    }
    break;
    case Object: {      
        var arr = [];
        for (var key in obj) {
            var val = obj[key];
            if (typeof val == 'undefined'){
                val = 'undefined';
            } else if (val == null) {
                val = 'null';
            } else if (val.constructor == Boolean 
                || val.constructor == Number
                || val.constructor == Array 
                || val.constructor == String
                || val.constructor == Object
                ) {
                val = utility.DB.json(val);
            } else if (val.constructor == Function) {
                continue;
            }
            arr.push(utility.DB.json(key) + ':' + val);
        }
        ret = '{' + arr.join(',') + '}';
    }
    break;
    case Boolean :
    case Number :
        ret = obj.toString();
    break;
    case String :
        ret = obj.toString();
        ret = ret.replace(/\\/g, '\\\\');
        ret = ret.replace(/\n/g, '\\n');
        ret = ret.replace(/\r/g, '\\r');
        ret = ret.replace(/\t/g, '\\t');
        ret = ret.replace(/\"/g, '\\"');
        ret = '"' + ret + '"';
    break;
    }
    return ret;
},

};

