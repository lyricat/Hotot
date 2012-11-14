if (typeof conf == 'undefined') var conf = {};
conf = {

vars: {
      'platform': 'Linux'
    , 'wrapper': 'unknown'
    , 'version': '0.9.8.9'
    , 'codename': 'Ada'
    , 'consumer_key': 'SCEdx4ZEOO68QDCTC7FFUQ'
    , 'consumer_secret': '2IBoGkVrpwOo7UZhjkYYekw0ciXG1WHpsqQtUqZCSw'
    , 'column_max_width': 400
    , 'items_per_request': 50
    , 'trim_bound': 100
    , 'builtin_themes': ['New Hope', 'Classic', 'Iron Heart', 'Bare']
    , 'extra_themes': []
},

default_settings: {
      // Globals:
      'use_verbose_mode': false
      // Globals -> proxy:
    , 'proxy_type': 'none'
    , 'proxy_host': ''
    , 'proxy_port': 0
    , 'proxy_auth': false
    , 'proxy_auth_name': ''
    , 'proxy_auth_password': ''
    , 'use_anonymous_stat': true
    , 'shortcut_summon_hotot': '<Alt>C'
    , 'size_w': 500
    , 'size_h': 550
    , 'context_menu_integration': true
    , 'close_to_exit': false
    , 'sign_in_automatically': false
    , 'starts_minimized': false
    , 'font_list': ['Arial', 'Wide', 'Narrow', 'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas', 'Corsiva', 'Courier New', 'Droid Sans', 'Droid Serif', 'Syncopate', 'Times New Roman']
    , 'use_default_reply_all': false
    , 'pos_x': 0
    , 'pos_y': 0
},

default_prefs: {
    'twitter': {
          // Account:
          'remember_password': false
        , 'default_username':''
        , 'default_password':''
        , 'access_token': ''
          // Look & Feels:
        , 'lang': 'auto'
        , 'theme': 'New Hope'
        , 'theme_path': 'theme/New Hope'
        , 'use_custom_font': false
        , 'custom_font': ''
        , 'font_size': 11
        , 'line_height': 1.4
        , 'enable_animation': true
        , 'enable_gpu_acceleration': true 
          // Behaviors
        , 'auto_longer_tweet': true
        , 'use_preload_conversation': true
        , 'use_alt_retweet': false
        , 'use_alt_reply': false
        , 'use_media_preview': true
        , 'show_relative_timestamp': true
        , 'filter_nsfw_media': false
        , 'use_deleted_mark': false
        , 'default_picture_service': 'twitter.com'
        , 'use_readlater_serv': false
        , 'readlater_service': 'pocket'
        , 'readlater_username': ''
        , 'readlater_password': ''
          // Advanced:
        , 'api_base': 'https://api.twitter.com/1/'
        , 'sign_api_base': 'https://api.twitter.com/1/'
        , 'use_same_sign_api_base': true
        , 'oauth_base': 'https://api.twitter.com/oauth/'
        , 'sign_oauth_base': 'https://api.twitter.com/oauth/'
        , 'use_same_sign_oauth_base': true
        , 'search_api_base2': 'https://twitter.com/phoenix_search.phoenix'
        , 'upload_api_base': 'https://upload.twitter.com/1/'
          // extensions and others
        , 'exts_enabled': ["org.hotot.imagepreview", "org.hotot.gmap", "org.hotot.translate", "org.hotot.imageupload", "org.hotot.videopreview", "org.hotot.shorturl", "org.hotot.cfw"]
        , 'kismet_rules': []
        , 'kismet_mute_list': {'name': [], 'word': [], 'source':[]}
        , 'kismet_colored_user_map': {}
        , 'base_url': 'https://twitter.com/'
        , 'slider_state': null
        , 'views_lastest_id': {}
        , 'welcome_background': ''
        , 'profile_avatar': '' 
      }
    , 'identica': {
          // Account:
          'remember_password': false
        , 'default_username':''
        , 'default_password':''
        , 'access_token': ''
          // Look & Feels:
        , 'lang': 'auto'
        , 'theme': 'New Hope'
        , 'theme_path': 'theme/New Hope'
        , 'use_custom_font': false
        , 'custom_font': ''
        , 'font_size': 11
        , 'line_height': 1.4
        , 'enable_animation': true
        , 'enable_gpu_acceleration': true
          // Behaviors
        , 'auto_longer_tweet': true
        , 'use_preload_conversation': true
        , 'use_alt_retweet': false
        , 'use_alt_reply': false
        , 'use_media_preview': true
        , 'show_relative_timestamp': true
        , 'use_deleted_mark': false
        , 'default_picture_service': 'twitter.com'
        , 'use_readlater_serv': false
        , 'readlater_service': 'pocket'
        , 'readlater_username': ''
        , 'readlater_password': ''
          // Advanced:
        , 'api_base': 'https://identi.ca/api/'
        , 'sign_api_base': 'https://identi.ca/api/'
        , 'use_same_sign_api_base': true
        , 'oauth_base': 'https://identi.ca/api/oauth/'
        , 'sign_oauth_base': 'https://identi.ca/api/oauth/'
        , 'use_same_sign_oauth_base': true
        , 'search_api_base2': 'https://identi.ca/api/'
        , 'upload_api_base': 'https://identi.ca/api/'
          // extensions:
        , 'exts_enabled': ["org.hotot.imagepreview", "org.hotot.gmap", "org.hotot.translate", "org.hotot.imageupload", "org.hotot.videopreview", "org.hotot.shorturl", "org.hotot.cfw"]
        , 'kismet_rules': []
        , 'kismet_mute_list': {'name': [], 'word': [], 'source':[]}
        , 'kismet_colored_user_map': {}
        , 'base_url': 'https://identi.ca/'
        , 'slider_state': null
        , 'views_lastest_id': {}
        , 'welcome_background': ''
        , 'profile_avatar': '' 
      }
},

profiles: {},

settings: {},

current_name: '',

OS_MAC: false,

OS_WINDOWS: false,

OS_LINUX: false,

init:
function init(callback) {
    conf.reload(callback);
    var platform = navigator.platform;
    conf.OS_WINDOWS = (platform.indexOf('Win') != -1);
    conf.OS_MAC = (platform.indexOf('Mac') != -1);
    conf.OS_LINUX = (platform.indexOf('Linux') != -1);
},

reload:
function reload(callback) {
    procs = [];
    procs.push(function () {
        conf.load_settings(function () {
            $(window).dequeue('_conf_init');
        });
    });
    procs.push(function () {
        db.get_all_profiles(function (profiles) {
            for (var i = 0, l = profiles.length; i < l; i += 1) {
                var name = profiles[i].name;
                var protocol = profiles[i].protocol;
                var prefs = JSON.parse(profiles[i].preferences);
                conf.profiles[name] = profiles[i];
                conf.profiles[name].preferences 
                    = conf.normalize_prefs(protocol, prefs);
            }
            $(window).dequeue('_conf_init');
        });
    })
    if (typeof (callback) != 'undefined') {
        procs.push(function() {
            callback();
            $(window).dequeue('_conf_init');
        });
    }  
    $(window).queue('_conf_init', procs);
    $(window).dequeue('_conf_init');
},

get_default_prefs:
function get_default_prefs(protocol) {
    if (protocol == 'twitter') {
        return conf.default_prefs['twitter'];
    } else if (protocol == 'identica') {
        return conf.default_prefs['identica'];
    } else {
        return '';
    }
},

load_native_options:
function load_native_options(options) {
    hotot_action('system/load_native_options'); 
},

get_current_profile:
function get_current_profile() {
    return conf.profiles[conf.current_name];
},

save_settings:
function save_settings(callback) {
    db.save_option('settings', JSON.stringify(conf.settings), function(result){
        if (typeof (callback) != 'undefined') {
            callback();
        }
    });
},

load_settings:
function load_settings(callback) {
    db.load_option('settings', 
    function(settings) {
        conf.settings = conf.normalize_settings(JSON.parse(settings));
        conf.apply_settings();
        if (typeof (callback) != 'undefined') {
            callback();
        }
    });
},

save_prefs:
function save_prefs(name, callback) {
    var profile = {};
    profile.name = conf.profiles[name].name;
    profile.protocol = conf.profiles[name].protocol;
    profile.preferences = JSON.stringify(conf.profiles[name].preferences);
    profile.order = conf.profiles[name].order;

    db.modify_profile(name, profile, function(result) {
        if (typeof (callback) != 'undefined') {
            callback();
        }   
    });
},

load_prefs:
function load_prefs(name, callback) {
    db.get_profile(name, 
    function(profile) {
        profile.preferences = JSON.parse(profile.preferences);
        conf.profiles[name] = profile;
        if (typeof (callback) != 'undefined') {
            callback();
        }
    });
},

apply_settings:
function apply_settings() {
    $('.version').text(conf.vars.version 
        + ' (' + conf.vars.codename + ')');
    if (conf.vars.platform === 'Chrome') {
        chrome.extension.sendRequest(
            {'enableContextMenu':conf.settings.context_menu_integration},
            function (resp) {}
        );
    }
    globals.twitterClient.oauth.key = localStorage.consumer_key || conf.vars.consumer_key;
    globals.twitterClient.oauth.secret = localStorage.consumer_secret || conf.vars.consumer_secret;
},

apply_prefs:
function apply_prefs(name, full) {
    var active_profile = conf.profiles[name];
    var prefs = active_profile.preferences;
    conf.current_name = name;

    if (full == true) {
        i18n.change(prefs.lang);
        change_theme(prefs.theme, prefs.theme_path);
        globals.tweet_font_size = prefs.font_size;
        globals.tweet_line_height = prefs.line_height;
        $('.card_body > .text').css({'font-size': prefs.font_size + 'pt', 'line-height': prefs.line_height});
        ui.Main.use_preload_conversation = prefs.use_preload_conversation;
        for (var id in ext.exts_info) {
            ext.disable_ext(id);
            if (prefs.exts_enabled.indexOf(id) != -1) {
                ext.enable_ext(id);
            }
        }
        ui.ImageUploader.service_name = prefs.default_picture_service;
    }
    var fonts = conf.get_default_font_settings();
    $('body').css('font-family', fonts[0]);
    if (prefs.use_custom_font) {
        $('.listview, .dialog_block p, .card').css('font-family', prefs.custom_font);
        globals.tweet_font = prefs.custom_font;
    } else {
        $('.listview, .dialog_block p, .card').css('font-family', fonts[1]);
        globals.tweet_font = fonts[1];
    }
    // animation
    $.fx.off = !prefs.enable_animation;
    if ($.fx.off || !prefs.enable_gpu_acceleration) {
        $.fn.transition = $.fn.animate;
    }

    globals.twitterClient.api_base = prefs.api_base;
    globals.twitterClient.sign_api_base = prefs.sign_api_base;
    globals.twitterClient.search_api_base2 = prefs.search_api_base2;
    globals.twitterClient.upload_api_base = prefs.upload_api_base;
    globals.twitterClient.use_same_sign_api_base = prefs.use_same_sign_api_base;
    var oauth = globals.twitterClient.oauth;
    oauth.oauth_base = prefs.oauth_base;
    oauth.sign_oauth_base = prefs.sign_oauth_base;
    oauth.use_same_sign_oauth_base = prefs.use_same_sign_oauth_base;
   
    oauth.access_token = prefs.access_token;
    oauth.key = prefs.consumer_key || oauth.key;
    oauth.secret = prefs.consumer_secret || oauth.secret;
    // read later
    globals.readLaterServ.init(prefs.readlater_username, prefs.readlater_password);
    if (prefs.use_readlater_serv) {
        $('#tweet_readlater_btn').parent().show();
    } else {
        $('#tweet_readlater_btn').parent().hide();
    }
},

load_token:
function load_token(name) {
    return conf.profiles[name].preferences.access_token;
},

save_token:
function save_token(name, token) {
    conf.profiles[name].preferences.access_token = token;
    conf.save_prefs(name);
},

clear_token:
function clear_token(name) {
    conf.profiles[name].preferences.access_token = '';
    conf.save_prefs(name);
},

normalize_prefs:
function normalize_prefs(protocol, prefs) {
    var default_prefs = conf.get_default_prefs(protocol);
    for (var k in default_prefs) {
        if (!prefs.hasOwnProperty(k)) {
            prefs[k] = default_prefs[k];
        }
    }
    for (var k in prefs) {
        if (!default_prefs.hasOwnProperty(k)) {
            delete prefs['k'];
        } 
    }
    return prefs;
},

normalize_settings:
function normalize_settings(settings) {
    for (var k in conf.default_settings) {
        if (!(k in settings)) {
            settings[k] = conf.default_settings[k];
        }
    }
    for (var k in settings) {
        if (!(k in conf.default_settings)) {
            delete settings['k'];
        } 
    }
    return settings;
},

get_default_font_settings:
function get_default_font_settings () {
    var platform = navigator.platform;
    if (conf.OS_WINDOWS) {
        return ['\'Segoe UI\', \'Microsoft YaHei\', sans-serif', 'Verdana, \'Microsoft YaHei\', sans-serif'];
    } else if (conf.OS_MAC) {
        return ['\'Helvetica Neue\', \'Hiragino Sans GB\', sans-serif', '\'Lucida Grande\', \'Hiragino Sans GB\', sans-serif'];
    } else {
        return ['\'Helvetica Neue\', \'Hiragino Sans GB\', \'Droid Sans Fallback\', \'WenQuanYi Micro Hei\', sans-serif', '\'Droid Sans Fallback\', \'WenQuanYi Micro Hei\', Simhei, Simsun, sans-serif'];
    }
}

};

var daily_hints = [
      'Press "C" to compose quickly'
    , 'Press "R" will reload current page'
    , 'Wanna quit hotot? try <Ctrl>+Q'
    , 'I can act like VIM!'
    , 'Need more columns? Try to extend my window'
    , 'Need fewer columns? Try to resize my window to a small size'
    , 'Go to "STAT" page, You\'ll see how addicted to twitter you are'
    , 'This is a ALPHA version, full of bugs, and features'
    , 'すっかり冷え込んだ日にはホットミルクとラブレターが恋しい'
    , 'My only fear of death is comin\' back to this bitch reincarnated'
    , 'FACT: features are bugs, but beautifully dressed'
    , 'Hotot is a kind of rabbit, but I really love Cats :)'
];
