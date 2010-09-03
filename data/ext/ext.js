if (typeof ext == 'undefined') var ext = {};
ext = {

ADD_TWEETS_LISTENER: 0x01,
// callback(tweets, pagename);

ADD_TWEETS_LISTENER_AFTER: 0x02,
// callback(tweets, pagename);

FORM_TWEET_LISTENER: 0x03,
// callback(tweet, pagename);

FORM_TWEET_LISTENER_AFTER: 0x04,
// callback(tweet, pagename, result_html);

FORM_TWEET_TEXT_LISTENER: 0x05,
// callback(text);

FORM_TWEET_TEXT_LISTENER_AFTER: 0x06,
// callback(text);

// listeners: {listener_type: [callbacks ... ], ... };
listeners: {
},

init: 
function init() {
    // listeners: {listener_type: [callbacks ... ], ... };
    for (var i = 0x01; i < 0xff; i += 0x01) {
        ext.listeners[i] = [];
    }

    var ui_main_add_tweets = ui.Main.add_tweets;
    ui.Main.add_tweets= function (tweet_obj, container) {
        var cbs = ext.listeners[ext.ADD_TWEETS_LISTENER];
        var cbs_after = ext.listeners[ext.ADD_TWEETS_LISTENER_AFTER];
        for (var i = 0; i < cbs.length; i += 1) {
            cbs[i](tweet_obj, container);
        }
        
        ret = ui_main_add_tweets(tweet_obj, container);

        for (var i = 0; i < cbs_after.length; i += 1) {
            cbs_after[i](tweet_obj, container);
        }
        return ret;
    };

    var ui_template_form_tweet = ui.Template.form_tweet;
    ui.Template.form_tweet = function (tweet_obj, pagename) {
        var cbs = ext.listeners[ext.FORM_TWEET_LISTENER];
        var cbs_after = ext.listeners[ext.FORM_TWEET_LISTENER_AFTER];
        for (var i = 0; i < cbs.length; i += 1) {
            cbs[i](tweet_obj, pagename);
        }
        
        result_html = ui_template_form_tweet(tweet_obj, pagename);

        for (var i = 0; i < cbs_after.length; i += 1) {
            cbs_after[i](tweet_obj, pagename, result_html);
        }
        return result_html;
    };

    var ui_template_form_text = ui.Template.form_text;
    ui.Template.form_text = function (text) {
        var cbs = ext.listeners[ext.FORM_TWEET_TEXT_LISTENER];
        var cbs_after = ext.listeners[ext.FORM_TWEET_TEXT_LISTENER_AFTER];
        for (var i = 0; i < cbs.length; i += 1) {
            cbs[i](text);
        }
        
        text = ui_template_form_text(text);

        for (var i = 0; i < cbs_after.length; i += 1) {
            text = cbs_after[i](text);
        }
        return text;
    };

},

notify:
function notify(type){
    
},

register_listener:
function register_listener(type, callback) {
    if (ext.listeners.hasOwnProperty(type)) {
        if (! (callback in ext.listeners[type])) {
            ext.listeners[type].push(callback);
        }
    }
},

unregister_listener:
function unregister_listener(type, callback) {
    if (ext.listeners.hasOwnProperty(type)) {
        var idx = ext.listeners[type].indexOf(callback);
        if (idx != -1) {
            ext.listeners[type].splice(idx, 1);
        }
    }
},

};
