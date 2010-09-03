if (typeof ext == 'undefined') var ext = {};
ext.Sample = {
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

