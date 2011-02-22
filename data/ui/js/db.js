if (typeof db == 'undefined') var db = {};
db = {

cache: null,

MAX_TWEET_CACHE_SIZE: 10240,

MAX_USER_CACHE_SIZE: 512,

version: 2,

init:
function init (callback) {
    db.database = window.openDatabase('hotot.cache', '', 'Cache of Hotot', 10);
    db.get_version(function (version) {
        var db_version = parseInt(version);
        if (db_version != db.version) {
            db.create_database(callback);
        } else {
            if (typeof (callback) != 'undefined') {
                callback();
            }
        }
    });
},

create_database:
function create_database(callback) {
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
            tx.executeSql('CREATE TABLE IF NOT EXISTS "Profile" ("name" CHAR(256) PRIMARY KEY  NOT NULL UNIQUE , "protocol" CHAR(64) NOT NULL , "preferences" TEXT NOT NULL, "order" INTEGER DEFAULT 0)', [],
            function () {
                $(window).dequeue('_database');
            });    
    },
    function () {
        tx.executeSql('INSERT or REPLACE INTO Info VALUES("version", ?)', [db.version], 
        function () {
            $(window).dequeue('_database');
        });
    },
    function () {
        if (typeof (callback) != 'undefined') {
            callback();
        }    
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

save_option:
function save_option(key, value, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('INSERT or REPLACE INTO Info VALUES(?, ?)', [key, value], 
        function (tx, rs) {
            callback(true);
        },
        function (tx, error) {
            callback(false);
        }); 
    });
},

load_option:
function load_option(key, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT key, value FROM Info WHERE key=?', [key], 
        function (tx, rs) {
            callback(rs.rows.item(0).value);
        },
        function (tx, error) {
            callback(null);
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
function add_profile(prefix, protocol, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('INSERT or REPLACE INTO Profile VALUES(?, ?, ?, ?)', [prefix+'@'+protocol, protocol, JSON.stringify(conf.get_default_prefs(protocol)), 0], 
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
function modify_profile(name, profile, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('UPDATE Profile SET "name"=?, "protocol"=?, "preferences"=?, "order"=? WHERE "name"=?', [profile.name, profile.protocol, profile.preferences, profile.order, name], 
        function (tx, rs) {
            callback(true);
        },
        function (tx, error) {
            callback(error);
        }); 
    });
},

get_profile:
function get_profile(name, callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT * FROM Profile WHERE name=?', [name], 
        function (tx, rs) {
            if (rs.rows.length == 0) {
                callback({});
            } else {
                callback({'name': rs.rows.item(0).name
                        , 'protocol': rs.rows.item(0).protocol
                        , 'preferences': rs.rows.item(0).preferences
                        , 'order': rs.rows.item(0).order});
            }
        }); 
    });
},

get_all_profiles:
function get_all_profiles(callback) {
    db.database.transaction(function (tx) {
        tx.executeSql('SELECT * FROM "Profile" ORDER BY "Profile"."order"', [], 
        function (tx, rs) {
            if (rs.rows.length == 0) {
                callback('[]');
            } else {
                var profs = [];
                for (var i = 0; i < rs.rows.length; i += 1) {
                    profs.push({'name': rs.rows.item(0).name
                        , 'protocol': rs.rows.item(0).protocol
                        , 'preferences': rs.rows.item(0).preferences
                        , 'order': rs.rows.item(0).order});
                }
                callback(profs);
            }
        }); 
    });
},

};

