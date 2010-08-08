if (typeof utility == 'undefined') var utility = {};
utility.DB = {

init:
function init () {
    
},

dump_tweets:
function dump_tweets(tweets_obj) {
    for (var i = 0; i < tweets_obj.length; i += 1) {
        $('#cache').data(tweets_obj[i].id.toString(), tweets_obj[i]);
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



