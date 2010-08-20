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
                tweet_obj = tweet_obj['retweeted_status'];
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

};



