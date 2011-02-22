if (typeof conf == 'undefined') var conf = {};
conf = {

default_settings: {
      // Globals:
      'use_verbose_mode': true
    , 'consumer_key': 'SCEdx4ZEOO68QDCTC7FFUQ'
    , 'consumer_secret': '2IBoGkVrpwOo7UZhjkYYekw0ciXG1WHpsqQtUqZCSw'
      // Globals -> proxy:
    , 'use_http_proxy': false
    , 'http_proxy_host': ''
    , 'http_proxy_port': 0
    , 'shortcut_summon_hotot': '<Alt>C'
    , 'size_w': 500
    , 'size_h': 550
    , 'use_ubuntu_indicator': true
    , 'platform': 'Linux'
    , 'version': '0.9.6'
    , 'codename': 'Ada'
},

default_prefs: {
    'twitter': {
          // Account:
          'remember_password': false
        , 'default_username':''
        , 'default_password':''
        , 'access_token': ''
          // Look & Feels:
        , 'use_custom_font': false
        , 'custom_font': ''
        , 'font_family_list': ['Arial', 'Wide', 'Narrow', 'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas', 'Corsiva', 'Courier New', 'Droid Sans', 'Droid Serif', 'Syncopate', 'Times New Roman']
        , 'font_family_used': 'Droid Sans Fallback, WenQuanYi Micro Hei, Sans, Microsoft Yahei, Simhei, Simsun'
        , 'font_size': 12
        , 'use_native_notify': true
        , 'use_hover_box': true
        , 'use_preload_conversation': true
          // Update:
        , 'use_home_timeline_notify': true
        , 'use_home_timeline_notify_type': 'count'
        , 'use_home_timeline_notify_sound': true
        , 'use_mentions_notify': true
        , 'use_mentions_notify_type': 'content'
        , 'use_mentions_notify_sound': true
        , 'use_direct_messages_inbox_notify': true
        , 'use_direct_messages_inbox_notify_type': 'content'
        , 'use_direct_messages_inbox_notify_sound': true
          // Advanced:
        , 'api_base': 'https://api.twitter.com/1/'
        , 'sign_api_base': 'https://api.twitter.com/'
        , 'use_same_sign_api_base': true
        , 'oauth_base': 'https://api.twitter.com/oauth/'
        , 'sign_oauth_base': 'https://api.twitter.com/oauth/'
        , 'use_same_sign_oauth_base': true
        , 'search_api_base': 'http://search.twitter.com/'
          // extensions:
        , 'exts_enabled': ["org.hotot.imagepreview", "org.hotot.gmap", "org.hotot.translate", "org.hotot.imageupload"]
      }
    , 'identi.ca': {
    
      }
},

profiles: {},

settings: {},

current_name: '',

init:
function init(callback) {
    conf.reload(callback);
},

reload:
function reload(callback) {
    conf.settings = conf.default_settings;
    conf.load_settings()
    db.get_all_profiles(function (profiles) {
        for (var i = 0; i < profiles.length; i += 1) {
        var name = profiles[i].name;
        var protocol = profiles[i].protocol;
        var prefs = JSON.parse(profiles[i].preferences);
        conf.profiles[name] = profiles[i];
        conf.profiles[name].preferences 
            = conf.normalize_prefs(protocol, prefs);
        }
        if (typeof (callback) != 'undefined') {
            callback();
        }    
    }); 
},

get_default_prefs:
function get_default_prefs(protocol) {
    if (protocol == 'twitter') {
        return conf.default_prefs['twitter'];
    } else if (protocol == 'identica') {
        //@TODO identi.ca's default_prefs
        return conf.default_prefs['twitter'];
    } else {
        return '';
    }
},

get_current_profile:
function get_current_profile() {
    return conf.profiles[conf.current_name];
},

save_settings:
function save_settings() {
    db.save_option('settings', JSON.stringify(conf.settings), function(){});
},

load_settings:
function load_settings() {
    db.load_option('settings', 
    function(settings) {
        conf.settings = conf.normalize_settings(JSON.parse(settings));
        conf.apply_settings();
    });
},

save_prefs:
function save_prefs(name) {
    var profile = {};
    profile.name = conf.profiles[name].name;
    profile.protocol = conf.profiles[name].protocol;
    profile.preferences = JSON.stringify(conf.profiles[name].preferences);
    profile.order = conf.profiles[name].order;
    db.modify_profile(name, profile, function(result) {});
},

load_prefs:
function load_prefs(name) {
    db.get_profile(name, 
    function(profile) {
        conf.profiles[name] = JSON.parse(profile.preferences);
    });
},

apply_settings:
function apply_settings() {
    $('.version').text(conf.settings.version 
        + ' (' + conf.settings.codename + ')');
    jsOAuth.key = conf.settings.consumer_key;
    jsOAuth.secret = conf.settings.consumer_secret;
    // @TODO other settings should applied by python
    var native_platform = ['Linux', 'Windows', 'Mac']
    if (native_platform.indexOf(conf.settings.platform) != -1) {
        hotot_action('system/load_settings/'
            + encodeURIComponent(JSON.stringify(conf.settings)));
    }
},

apply_prefs:
function apply_prefs(name) {
    var active_profile = conf.profiles[name];
    var prefs = active_profile.preferences;
    conf.current_name = name;
    ext.exts_enabled = prefs.exts_enabled; 
    // notification
    ui.Main.block_info['#home_timeline'].use_notify 
        = prefs.use_home_timeline_notify; 
    ui.Main.block_info['#home_timeline'].use_notify_type
        = prefs.use_home_timeline_notify_type;
    ui.Main.block_info['#home_timeline'].use_notify_sound
        = prefs.use_home_timeline_notify_sound;
    ui.Main.block_info['#mentions'].use_notify
        = prefs.use_mentions_notify;
    ui.Main.block_info['#mentions'].use_notify_type
        = prefs.use_mentions_notify_type;
    ui.Main.block_info['#mentions'].use_notify_sound
        = prefs.use_mentions_notify_sound;
    ui.Main.block_info['#direct_messages_inbox'].use_notify
        = prefs.use_direct_messages_inbox_notify;
    ui.Main.block_info['#direct_messages_inbox'].use_notify_type
        = prefs.use_direct_messages_inbox_notify_type;
    ui.Main.block_info['#direct_messages_inbox'].use_notify_sound
        = prefs.use_direct_messages_inbox_notify_sound;
    
    $('#chk_remember_password').attr('checked', prefs.remember_password);
    $('body').css('font-family', prefs.custom_font + ' ' + prefs.font_family_used);
    globals.tweet_font_size = prefs.font_size;
    ui.StatusBox.use_hover_box = prefs.use_hover_box;
    ui.Main.use_preload_conversation = prefs.use_preload_conversation;

    lib.twitterapi.api_base = prefs.api_base;
    lib.twitterapi.sign_api_base = prefs.sign_api_base;
    lib.twitterapi.search_api_base = prefs.search_api_base;
    lib.twitterapi.use_same_sign_api_base = prefs.use_same_sign_api_base;
    jsOAuth.oauth_base = prefs.oauth_base;
    jsOAuth.sign_oauth_base = prefs.sign_oauth_base;
    jsOAuth.use_same_sign_oauth_base = prefs.use_same_sign_oauth_base;
   
    jsOAuth.access_token = prefs.access_token;
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

normalize_prefs:
function normalize_prefs(protocol, prefs) {
    var default_prefs = conf.get_default_prefs(protocol);
    for (var k in default_prefs) {
        if (!(k in prefs)) {
            prefs[k] = default_prefs[k];
        }
    }
    for (var k in prefs) {
        if (!(k in default_prefs)) {
            delete prefs['k'];
        } 
    }
    return prefs;
},

normalize_settings:
function normalize_settings() {
    for (var k in conf.default_settings) {
        if (!(k in conf.settings)) {
            conf.settings[k] = conf.default_settings[k];
        }
    }
    for (var k in conf.settings) {
        if (!(k in conf.default_settings)) {
            delete conf.settings['k'];
        } 
    }
    return conf.settings;
    
},

}
