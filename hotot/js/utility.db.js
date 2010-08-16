if (typeof utility == 'undefined') var utility = {};
utility.DB = {

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
            $('#cache').data(tweet_obj.id.toString(), tweet_obj);
        }
    } else {
        $('#cache').data(json_obj.id.toString(), json_obj);
    }
},

set:
function set(name, value) {
    return $('#cache').data(name, value)
},

get:
function get(name) {
    return $('#cache').data(name);
},

remove:
function remove(name) {
    return $('#cache').removeData(name);
},

};



