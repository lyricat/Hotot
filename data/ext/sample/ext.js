if (typeof ext == 'undefined') var ext = {};
ext = {

ADD_TWEETS_LISTENER: 0x01,
// callback(tweets, pagename);

ADD_TWEETS_LISTENER_AFTER: 0x02,
// callback(tweets, pagename);

FORM_TWEET_LISTENER: 0x03,
// callback(tweet, pagename);

FORM_TWEET_LISTENER_AFTER: 0x04,
// callback(tweet, pagename);

// listeners: {listener_type: [callbacks ... ], ... };
listeners: {
      ADD_TWEET_LISTENER: []
    , ADD_TWEETS_LISTENER_AFTER: []
    , FORM_TWEET_LISTENER: []
    , FORM_TWEET_LISTENER_AFTER: []
    , FORM_TWEET_TEXT_LISTENER: []
    , FORM_TWEET_TEXT_LISTENER_AFTER: []
},

init: 
function init() {
    var ui_template_form_tweet = ui.Template.form_tweet;
    ui.Template.form_tweet = function (tweet_obj, pagename) {
        var cbs = ext.listeners[FORM_TWEET_LISTENER];
        var cbs_after = ext.listeners[FORM_TWEET_LISTENER_AFTER];
        for (var i = 0; i < cbs.length; i += ) {
            cbs[i](tweet_obj, pagename);
        }
        
        ui_template_form_tweet(tweet_obj, pagename);

        for (var i = 0; i < cbs_after.length; i += ) {
            cbs_after[i](tweet_obj, pagename);
        }
    };

    var ui_template_form_text = ui.Template.form_text;
    ui.Template.form_text = function (text) {
        var cbs = ext.listeners[FORM_TWEET_TEXT_LISTENER];
        var cbs_after = ext.listeners[FORM_TWEET_TEXT_LISTENER_AFTER];
        for (var i = 0; i < cbs.length; i += ) {
            cbs[i](text);
        }
        
        ui_template_form_text(text);

        for (var i = 0; i < cbs_after.length; i += ) {
            cbs_after[i](text);
        }
    };

},

notify:
function notify(type){
    
},

register_listener:
function register_listener(type, callback) {
    if (listeners.hasOwnProperty(type)) {
        if (! (callback in listeners[type])) {
            listeners[type].push(callback);
        }
    }
},

unregister_listener:
function unregister_listener(type, callback) {
    if (listeners.hasOwnProperty(type)) {
        var idx = listeners[type].indexOf(callback);
        if (idx != -1) {
            listeners[type].splice(idx, 1);
        }
    }
},

};
