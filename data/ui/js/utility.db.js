if (typeof utility == 'undefined') var utility = {};
utility.DB = {

USER_CACHE: '#user_cache',

TWEET_CACHE: '#tweet_cache',

init:
function init () {
    
},

dump_tweets:
function dump_tweets(json_obj) {
    if (json_obj.constructor == Array) { 
        for (var i = 0; i < json_obj.length; i += 1) {
            var tweet_obj = json_obj[i]
            if (tweet_obj.hasOwnProperty('retweeted_status')) {
                tweet_obj = tweet_obj['retweeted_status'];
            }
            var user = typeof tweet_obj.user != 'undefined'? tweet_obj.user: tweet_obj.sender;
            $(utility.DB.USER_CACHE).data(user.id.toString(), user);
            $(utility.DB.TWEET_CACHE).data(tweet_obj.id.toString(), tweet_obj);
        }
    } else {
        var user = json_obj.user? json_obj.user: json_obj.sender;
        $(utility.DB.USER_CACHE).data(user.id.toString(), user);
        $(utility.DB.TWEET_CACHE).data(json_obj.id.toString(), json_obj);
    }
},

set:
function set(db_name, key, value) {
    return $(db_name).data(key, value)
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



