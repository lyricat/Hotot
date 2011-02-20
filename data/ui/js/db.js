if (typeof db == 'undefined') var db = {};
db = {

cache: null,

MAX_TWEET_CACHE_SIZE: 10240,

MAX_USER_CACHE_SIZE: 512,

version: 2,

default_settings: {
      // update interval:
      'consumer_key': 'SCEdx4ZEOO68QDCTC7FFUQ'
    , 'consumer_secret': '2IBoGkVrpwOo7UZhjkYYekw0ciXG1WHpsqQtUqZCSw'
      // proxy:
    , 'use_http_proxy': false
    , 'http_proxy_host': ''
    , 'http_proxy_port': 0
      // System:
    , 'shortcut_summon_hotot': '<Alt>C'
    , 'size_w': 500
    , 'size_h': 550

},

default_prefs: {
    'twitter': {
          'remember_password': false
        , 'default_username':''
        , 'default_password':''
          // Appearance:
        , 'font_family_used': 'Droid Sans Fallback, WenQuanYi Micro Hei, Sans, Microsoft Yahei, Simhei, Simsun'
        , 'font_size': 12
        , 'use_native_notify': true
        , 'use_hover_box': true
        , 'use_preload_conversation': true
          // Appearance > Notification:
        , 'use_home_timeline_notify': true
        , 'use_home_timeline_notify_type': 'count'
        , 'use_home_timeline_notify_sound': true
        , 'use_mentions_notify': true
        , 'use_mentions_notify_type': 'content'
        , 'use_mentions_notify_sound': true
        , 'use_direct_messages_inbox_notify': true
        , 'use_direct_messages_inbox_notify_type': 'content'
        , 'use_direct_messages_inbox_notify_sound': true
          // api url:
        , 'api_base': 'https://api.twitter.com/1/'
        , 'sign_api_base': 'https://api.twitter.com/'
        , 'use_same_sign_api_base': true
        , 'oauth_base': 'https://api.twitter.com/oauth/'
        , 'sign_oauth_base': 'https://api.twitter.com/oauth/'
        , 'use_same_sign_oauth_base': true
        , 'search_api_base': 'http://search.twitter.com/'
          // others:
        , 'exts_enabled': ["org.hotot.imagepreview", "org.hotot.gmap", "org.hotot.translate", "org.hotot.imageupload"]
      }
    , 'identi.ca': {
    
      }
},

init:
function init () {
    db.database = window.openDatabase('hotot.cache', '', 'Cache of Hotot', 10);
    db.get_version(function (version) {
        var db_version = parseInt(version);
        if (db_version != db.version) {
            db.create_database();
        }
    });
},

create_database:
function create_database() {
    db.database.transaction(function (tx) {
    var procs = [
    function() {
        tx.executeSql('DROP TABLE IF EXISTS "Info"', [],
        function () {
            $(window).dequeue('_database');
        });
    },
    function () {
        tx.executeSql('DROP TABLE IF EXISTS "TweetCache"', [],
        function () {
            $(window).dequeue('_database');
        });
    },
    function () {
            tx.executeSql('DROP TABLE IF EXISTS "UserCache"', [],
            function () {
                $(window).dequeue('_database');
            });
    },
    function () {
            tx.executeSql('DROP TABLE IF EXISTS "Profile"', [],
            function () {
                $(window).dequeue('_database');
            });
    },
    function () {
            tx.executeSql('CREATE TABLE IF NOT EXISTS "Info" ("key" CHAR(256) PRIMARY KEY  NOT NULL  UNIQUE , "value" TEXT NOT NULL )', [],
            function () {
                $(window).dequeue('_database');
            });    
    },
    function () {
            tx.executeSql('CREATE TABLE IF NOT EXISTS "TweetCache" ("id" CHAR(256) PRIMARY KEY  NOT NULL  UNIQUE , "status" NCHAR(140) NOT NULL, "json" TEXT NOT NULL )', [],
            function () {
                $(window).dequeue('_database');
            });    
    },
    function () {
            tx.executeSql('CREATE TABLE IF NOT EXISTS "UserCache" ("id" CHAR(256) PRIMARY KEY  NOT NULL  UNIQUE , "screen_name" CHAR(64) NOT NULL , "json" TEXT NOT NULL )', [],
            function () {
                $(window).dequeue('_database');
            });    
    },
    function () {
            tx.executeSql('CREATE TABLE IF NOT EXISTS "Profile" ("name" CHAR(256) PRIMARY KEY  NOT NULL  UNIQUE , "protocol" CHAR(64) NOT NULL , "preferences" TEXT NOT NULL )', [],
            function () {
                $(window).dequeue('_database');
            });    
    },
    function () {
        tx.executeSql('INSERT or REPLACE INTO Info VALUES("version", ?)', [db.version], 
        function () {
            $(window).dequeue('_database');
        });
    }
    ];

    $(window).queue('_database', procs);
    $(window).dequeue('_database');
    });
},

dump_users:
function dump_users(json_obj) {
    var dump_single_user = function (tx, user) {
        tx.executeSql('INSERT or REPLACE INTO UserCache VALUES (?, ?, ?)', [user.id_str, user.screen_name, JSON.stringify(user)],
        function (tx, rs) {},
        function (tx, error) {
            console.out('INSERT ERROR: '+ error.code + ','+ error.message);
        });
    };
    // dump users
    db.database.transaction(function (tx) {
        for (var i = 0; i < json_obj.length; i += 1) {
            var user = json_obj[i];
            dump_single_user(tx, user);
        }
    });
},

dump_tweets:
function dump_tweets(json_obj) {
    var dump_single_user = function (tx, user) {
        tx.executeSql('INSERT or REPLACE INTO UserCache VALUES (?, ?, ?)', [user.id_str, user.screen_name, JSON.stringify(user)],
        function (tx, rs) {},
        function (tx, error) {
            console.out('INSERT ERROR: '+ error.code + ','+ error.message);
        });
    };
    var dump_single_tweet = function (tx, tweet_obj) {
        tx.executeSql('INSERT or REPLACE INTO TweetCache VALUES (?, ?, ?)', [tweet_obj.id_str, tweet_obj.text, JSON.stringify(tweet_obj)],
        function (tx, rs) {},
        function (tx, error) {
            console.out('INSERT ERROR: '+ error.code + ','+ error.message);
        });
    };

    // dump tweets
    db.database.transaction(function (tx) {
        for (var i = 0; i < json_obj.length; i += 1) {
            var tweet_obj = json_obj[i];
            if (tweet_obj.hasOwnProperty('retweeted_status')) {
                dump_single_tweet(tx, tweet_obj['retweeted_status']);
            }
            dump_single_tweet(tx, tweet_obj);
        }
    });
    // dump users
    db.database.transaction(function (tx) {
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
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT * FROM sqlite_master WHERE type="table" and name="Info"',[],
        function (tx, rs){
            if (rs.rows.length == 0) {
                callback(-1);
            } else {
                tx.executeSql('SELECT key, value FROM Info WHERE key="version"', [], 
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
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT id, status, json FROM TweetCache WHERE id=?', [key], 
            function(tx, rs) {callback(tx,rs);});
    });
},

get_user:
function get_user(screen_name, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT id, screen_name, json FROM UserCache WHERE screen_name=?', [screen_name], 
            function(tx, rs) {callback(tx,rs);});
    });
},

search_user:
function search_user(query, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT id, screen_name, json FROM UserCache WHERE screen_name LIKE \'%'+query+'%\'', [], 
            function(tx, rs) {callback(tx,rs);});
    });
},

get_screen_names_starts_with:
function get_users_starts_with(starts, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT screen_name FROM UserCache WHERE screen_name LIKE \''+starts+'%\'', [], 
            function(tx, rs) {callback(tx,rs);});
    });
},

reduce_user_cache:
function reduce_user_cache(limit, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('DELETE FROM UserCache WHERE id in (SELECT id FROM TweetCache ORDER BY id limit ?)', [limit], callback);
    });
},

reduce_tweet_cache:
function reduce_tweet_cache(limit, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('DELETE FROM TweetCache WHERE id in (SELECT id FROM TweetCache ORDER BY id limit ?)', [limit], callback);
    });
},

get_tweet_cache_size:
function get_tweet_cache_size(callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT count(*) FROM TweetCache', [],
        function (tx, rs) {
            callback(rs.rows.item(0)['count(*)']);
        });
    });
},

get_user_cache_size:
function get_user_cache_size(callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT count(*) FROM UserCache', [],
        function (tx, rs) {
            callback(rs.rows.item(0)['count(*)']);
        });
    });
},

save_profile_prefs:
function save_profile_prefs(name, json, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('UPDATE Profile SET preferences=? WHERE name=?', [name, json], 
        function (tx, rs) {
            callback(true);
        },
        function (tx, error) {
            callback(false);
        }); 
    });
},

load_profile_prefs:
function load_profile_prefs(name, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT preferences FROM Profile WHERE name=?', [name], 
        function (tx, rs) {
            if (rs.rows.length == 0) {
                callback('{}');
            } else {
                callback(rs.rows.item(0).preferences);
            }
        }); 
    });
},

add_profile:
function add_profile(name, protocol, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('INSERT or REPLACE INTO Profile VALUES(?, ?, ?)', [name, protocol, db.get_default_prefs(protocol)], 
        function (tx, rs) {
            callback(true);
        }, 
        function (tx, error) {
            callback(false);
        }); 
    });
},

remove_profile:
function remove_profile(name, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('DELETE FROM Profile WHERE name=?', [name], 
        function (tx, rs) {
            callback(true);
        },
        function (tx, error) {
            callback(false);
        }); 
    });
},

modify_profile:
function remove_profile(name, profile, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('UPDATE Profile SET name=?, protocol=?, preferences=?', [profile.name, profile.protocol, profile.preferences], 
        function (tx, rs) {
            callback(true);
        },
        function (tx, error) {
            callback(false);
        }); 
    });
},

get_default_prefs:
function get_default_prefs(name) {
    if (name == 'twitter') {
        return db.default_prefs['twitter'];
    } else if (name == 'identi.ca') {
        //@TODO identi.ca's default_prefs
        return db.default_prefs['twitter'];
    } else {
        return '';
    }
},

get_profile:
function get_profile(name, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT * FROM Profile WHERE name=? ', [name], 
        function (tx, rs) {
            if (rs.rows.length == 0) {
                callback('', '', '');
            } else {
                callback(rs.rows.item(0).name
                    , rs.rows.item(0).protocol
                    , rs.rows.item(0).preferences);
            }
        }); 
    });
},


};

