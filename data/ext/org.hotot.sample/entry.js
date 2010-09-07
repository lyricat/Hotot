if (typeof ext == 'undefined') var ext = {};
ext.Sample = {

id: 'org.hotot.sample',

name: 'Sample',

description: 'Only A Sample Extention.',

version: '0.1',

author: 'Shellex Wai',

url: 'http://hotot.org',

init:
function init () {
    ext.register_listener(ext.ADD_TWEETS_LISTENER_AFTER,
    function (tweets, container) {
        // just for debug.
        utility.Console.out(
            'Update ['+container.pagename+'], '+ tweets.length +' items');
    });
},

}

