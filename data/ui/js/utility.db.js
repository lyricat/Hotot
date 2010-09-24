if (typeof utility == 'undefined') var utility = {};
utility.DB = {

cache: null,

init:
function init () {
    utility.DB.cache = window.openDatabase('hotot_cache', '', 'Cache of Hotot', 10);

    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('CREATE TABLE "TweetCache" ("id" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "json" TEXT NOT NULL  check(typeof("json") = \'text\') )', []);    
    });

    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('CREATE TABLE "UserCache" ("id" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "screen_name" CHAR(64) NOT NULL , "json" TEXT NOT NULL )', []);    
    });
},

dump_tweets:
function dump_tweets(json_obj) {
    var dump_single_tweet = function (tweet_obj) {
        var user = typeof tweet_obj.user != 'undefined'? 
            tweet_obj.user: tweet_obj.sender;

        utility.DB.cache.transaction(function (tx) {
            tx.executeSql('INSERT INTO UserCache VALUES (?, ?, ?)', [user.id, user.screen_name, JSON.stringify(tweet_obj)]);
        });
        utility.DB.cache.transaction(function (tx) {
            tx.executeSql('INSERT INTO TweetCache VALUES (?, ?)', [tweet_obj.id, JSON.stringify(tweet_obj)]);
        });
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

get_tweet:
function get_tweet(key, callback) {
    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('SELECT id, json FROM TweetCache WHERE id=?', [key], 
            function(tx, rs) {callback(tx,rs);});
    });
},

get_user:
function get_user(screen_name, callback) {
    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('SELECT id, screen_name, json FROM UserCache WHERE screen_name=?', [screen_name], 
            function(tx, rs) {callback(tx,rs);});
    });
},

search_user:
function search_user(query, callback) {
    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('SELECT id, screen_name, json FROM UserCache WHERE screen_name LIKE \'%'+query+'%\'', [], 
            function(tx, rs) {callback(tx,rs);});
    });
},

get_screen_names_starts_with:
function get_users_starts_with(starts, callback) {
    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('SELECT screen_name FROM UserCache WHERE screen_name LIKE \''+starts+'%\'', [], 
            function(tx, rs) {callback(tx,rs);});
    });
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

