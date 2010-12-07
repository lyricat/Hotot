if (typeof utility == 'undefined') var utility = {};
utility.DB = {

cache: null,

MAX_TWEET_CACHE_SIZE: 10240,

MAX_USER_CACHE_SIZE: 512,

cache_version: 1,

init:
function init () {
    utility.DB.cache = window.openDatabase('hotot.cache', '', 'Cache of Hotot', 10);
    utility.DB.get_version(function (version) {
        var db_cache_version = parseInt(version);
        if (db_cache_version != utility.DB.cache_version) {
            utility.DB.create_cache();
        }
    });
},

create_cache:
function create_cache() {
    utility.DB.cache.transaction(function (tx) {
    var procs = [
    function() {
        tx.executeSql('DROP TABLE IF EXISTS "CacheInfo"', [],
        function () {
            $(window).dequeue('_cache');
        });
    },
    function () {
        tx.executeSql('DROP TABLE IF EXISTS "TweetCache"', [],
        function () {
            $(window).dequeue('_cache');
        });
    },
    function () {
            tx.executeSql('DROP TABLE IF EXISTS "UserCache"', [],
            function () {
                $(window).dequeue('_cache');
            });
    },
    function () {
            tx.executeSql('CREATE TABLE IF NOT EXISTS "CacheInfo" ("key" CHAR(256) PRIMARY KEY  NOT NULL  UNIQUE , "value" TEXT NOT NULL )', [],
            function () {
                $(window).dequeue('_cache');
            });    
    },
    function () {
            tx.executeSql('CREATE TABLE IF NOT EXISTS "TweetCache" ("id" CHAR(256) PRIMARY KEY  NOT NULL  UNIQUE , "status" NCHAR(140) NOT NULL, "json" TEXT NOT NULL )', [],
            function () {
                $(window).dequeue('_cache');
            });    
    },
    function () {
            tx.executeSql('CREATE TABLE IF NOT EXISTS "UserCache" ("id" CHAR(256) PRIMARY KEY  NOT NULL  UNIQUE , "screen_name" CHAR(64) NOT NULL , "json" TEXT NOT NULL )', [],
            function () {
                $(window).dequeue('_cache');
            });    
    },
    function () {
        tx.executeSql('INSERT or REPLACE INTO CacheInfo VALUES("version", ?)', [utility.DB.cache_version], 
        function () {
            $(window).dequeue('_cache');
        });
    }
    ];

    $(window).queue('_cache', procs);
    $(window).dequeue('_cache');
    });
},

dump_tweets:
function dump_tweets(json_obj) {
    var dump_single_user = function (tx, user) {
        tx.executeSql('INSERT or REPLACE INTO UserCache VALUES (?, ?, ?)', [user.id_str, user.screen_name, JSON.stringify(user)],
        function (tx, rs) {},
        function (tx, error) {
            utility.Console.out('INSERT ERROR: '+ error.code + ','+ error.message);
        });
    };
    var dump_single_tweet = function (tx, tweet_obj) {
        tx.executeSql('INSERT or REPLACE INTO TweetCache VALUES (?, ?, ?)', [tweet_obj.id_str, tweet_obj.text, JSON.stringify(tweet_obj)],
        function (tx, rs) {},
        function (tx, error) {
            utility.Console.out('INSERT ERROR: '+ error.code + ','+ error.message);
        });
    };

    // dump tweets
    utility.DB.cache.transaction(function (tx) {
        for (var i = 0; i < json_obj.length; i += 1) {
            var tweet_obj = json_obj[i];
            if (tweet_obj.hasOwnProperty('retweeted_status')) {
                dump_single_tweet(tx, tweet_obj['retweeted_status']);
            }
            dump_single_tweet(tx, tweet_obj);
        }
    });
    // dump users
    utility.DB.cache.transaction(function (tx) {
        for (var i = 0; i < json_obj.length; i += 1) {
            var tweet_obj = json_obj[i];
            var user = typeof tweet_obj.user != 'undefined'
                ? tweet_obj.user: tweet_obj.sender;
            dump_single_user(tx, user);
        }
    });
},

get_version:
function get_version(callback) {
    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('SELECT * FROM sqlite_master WHERE type="table" and name="CacheInfo"',[],
        function (tx, rs){
            if (rs.rows.length == 0) {
                callback(-1);
            } else {
                tx.executeSql('SELECT key, value FROM CacheInfo WHERE key="version"', [], 
                function(tx, rs) {
                    callback(rs.rows.item(0).value);
                }, 
                function (tx, err) {
                    callback(-2);
                });
            }
        });
    });
},


get_tweet:
function get_tweet(key, callback) {
    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('SELECT id, status, json FROM TweetCache WHERE id=?', [key], 
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

reduce_cache:
function reduce_cache(limit, callback) {
    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('DELETE FROM UserCache WHERE id in (SELECT id FROM TweetCache limit ?)', [limit], callback);
    });
},

reduce_cache:
function reduce_cache(limit, callback) {
    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('DELETE FROM TweetCache WHERE id in (SELECT id FROM TweetCache limit ?)', [limit], callback);
    });
},

get_tweet_cache_size:
function get_tweet_cache_size(callback) {
    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('SELECT count(*) FROM TweetCache', [],
        function (tx, rs) {
            callback(rs.rows.item(0)['count(*)']);
        });
    });
},

get_user_cache_size:
function get_user_cache_size(callback) {
    utility.DB.cache.transaction(function (tx) {
        tx.executeSql('SELECT count(*) FROM UserCache', [],
        function (tx, rs) {
            callback(rs.rows.item(0)['count(*)']);
        });
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

};

