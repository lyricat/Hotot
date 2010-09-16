if (typeof ext == 'undefined') var ext = {};
ext.Sample = {

id: 'org.hotot.sample',

name: 'Sample',

description: 'Only A Sample Extention.',

version: '1.0',

author: 'Shellex Wai',

url: 'http://hotot.org',

on_add_tweets:
function on_add_tweets(tweets, container) {
    // just for debug.
    utility.Console.out(
        'Update ['+container.pagename+'], '+ tweets.length +' items');
},

load:
function load () {
    ext.register_listener(ext.ADD_TWEETS_LISTENER_AFTER
        , ext.Sample.on_add_tweets);
},

unload:
function unload() {
    ext.unregister_listener(ext.ADD_TWEETS_LISTENER_AFTER
        , ext.Sample.on_add_tweets);
},

}

