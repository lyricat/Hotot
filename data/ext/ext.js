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
listeners: {},

ext_infos: {},

ext_enabled: [], // @TODO

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

init_exts:
function init_exts() {
    for (var key in ext) {
        // Extension package MUST be Capital
        // and MUST have two methods named 'load' and 'unload'
        if (65 <= key.charCodeAt(0) 
            && key.charCodeAt(0) <= 90
            && typeof  ext[key].load != 'undefined' 
            && typeof  ext[key].unload != 'undefined') {

            var extension = ext[key];
            utility.Console.out('[i]Init Extension: ' + extension.name);

            if (typeof extension.icon == 'undefined') {
                icon = 'imgs/ic64_ext.png';
            } else {
                icon = '../ext/' + extension.id + '/' + extension.icon;
            }

            ext.ext_infos[extension.id] = {
                  name: extension.name
                , description: extension.description
                , version: extension.version
                , author: extension.author
                , url: extension.url
                , icon: icon
                , extension: extension
            };

            // @TODO Issue 31
            if (ext.ext_enabled.indexOf(extension.id) != -1) {
                extension.load();
                ext.ext_infos[extension.id]['enable'] = true;
            } else {
                ext.ext_infos[extension.id]['enable'] = false;
            }
            /*
            extension.load();
            */
        }
    }
},

load_exts:
function load_exts(exts) {
    procs = [];
    var _load = function (idx) {
        var path = exts[i];
        procs.push(function () {
            $.getScript(path,
            function () {
                utility.Console.out('[i]Load Extension: ' + path);
                $(window).dequeue('_load_exts');
            });
        });    
    };

    for (var i = 0; i < exts.length; i += 1) {
        _load(i)
    }
    procs.push(function () { ext.init_exts(); });
    $(window).queue('_load_exts', procs);
    $(window).dequeue('_load_exts');
},

notify:
function notify(type){
    // #TODO
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
