if (typeof ui == 'undefined') var ui = {};
ui.Template = {

schemes: {
    'white' : '#fff',
    'orange': '#ffebc3',
    'blue'  : '#d0d9ff',
    'green' : '#daffd1',
},

reg_link: new RegExp('([a-zA-Z]+:\\/\\/[a-zA-Z0-9_\\-%./\\+!\\?=&:;~`@]*)', 'g'),

reg_user: new RegExp('(^|\\s)@(\\w+)', 'g'),

reg_hash_tag: new RegExp('#([^\\s]+)', 'g'),

tweet_t: 
'<li id="{%TWEET_ID%}" class="tweet">\
    <div class="profile_img_wrapper">\
        <img src="{%PROFILE_IMG%}" onerror="void(0);">\
    </div>\
    <div class="tweet_body" style="background-color:{%SCHEME%};">\
        <div id="{%USER_ID%}" class="who"><a class="who_href" href="javascript:void(0);">{%SCREEN_NAME%}</a>:</div>\
        <div class="text">{%TEXT%}</div>\
        <ul class="tweet_ctrl">\
            <li><a class="tweet_reply tweet_ctrl_btn" title="Reply this tweet." href="javascript:void(0);"></a></li>\
            <li><a class="tweet_rt tweet_ctrl_btn" title="RT this tweet." href="javascript:void(0);"></a></li>\
            <li><a class="tweet_retweet tweet_ctrl_btn" title="Official retweet this tweet." href="javascript:void(0);"></a></li>\
            <li class="tweet_more_menu_trigger"><a class="tweet_more tweet_ctrl_btn" href="javascript:void(0);"></a>\
                <ul class="tweet_more_menu">\
                <li>\
                    <a class="tweet_reply_all tweet_ctrl_menu_btn"\
                        href="javascript:void(0);">Reply All</a>\
                </li>\
                <li>\
                    <a class="tweet_dm tweet_ctrl_menu_btn"\
                        href="javascript:void(0);">Send Message</a>\
                </li>\
                <li>\
                    <a class="tweet_fav tweet_ctrl_menu_btn"\
                        href="javascript:void(0);">Love it!</a>\
                </li>\
                </ul>\
            </li>\
        </ul>\
        <div class="tweet_meta">\
            <div class="tweet_source">via: {%SOURCE%}</div>\
            <div class="tweet_thread_info" style="display:{%IN_REPLY%}">\
                <a class="btn_tweet_thread" href="javascript:void(0);"></a>\
                {%REPLY_TEXT%}\
            </div>\
        </div>\
    </div>\
    <span class="shape"></span>\
    <span class="shape_mask" style="border-right-color:{%SCHEME%};"></span>\
    <ul class="tweet_thread" style="border-right-color:{%SCHEME%};">\
        <div class="tweet_thread_hint">Loading...</div>\
    </ul>\
</li>',

dm_t: 
'<li id="{%TWEET_ID%}" class="tweet">\
    <div class="profile_img_wrapper">\
        <img src="{%PROFILE_IMG%}" >\
    </div>\
    <div class="tweet_body" style="background-color:{%SCHEME%};">\
        <div id="{%USER_ID%}" class="who"><a class="who_href" href="javascript:void(0);">{%SCREEN_NAME%}</a>:</div>\
        <div class="text">{%TEXT%}</div>\
    </div>\
    <ul class="tweet_ctrl">\
        <li><a class="tweet_dm tweet_ctrl_btn" href="javascript:void(0);"></a></li>\
    </ul>\
    <span class="shape"></span>\
    <span class="shape_mask" style="border-right-color:{%SCHEME%};"></span>\
</li>',

form_dm:
function form_dm(dm_obj, pagename) {
    var id = dm_obj.id;
    var screen_name = dm_obj.sender.screen_name;
    var profile_img = dm_obj.sender.profile_image_url;
    var text = ui.Template.form_text(dm_obj.text);
    var ret = '';
    var user_id = dm_obj.sender.id;
    var scheme = ui.Template.schemes['white'];
    if (text.indexOf(globals.myself.screen_name) != -1) {
        scheme = ui.Template.schemes['orange'];
    }
    ret = ui.Template.dm_t.replace(/{%TWEET_ID%}/g, pagename+'-'+id);
    ret = ret.replace(/{%USER_ID%}/g
        , pagename+'-'+id+'-'+ user_id);
    ret = ret.replace(/{%SCREEN_NAME%}/g, screen_name);
    ret = ret.replace(/{%PROFILE_IMG%}/g, profile_img);
    ret = ret.replace(/{%TEXT%}/g, text);
    ret = ret.replace(/{%SCHEME%}/g, scheme);
    return ret;
},

form_tweet:
function form_tweet (tweet_obj, pagename) {
    var retweeted_name = '';
    if (tweet_obj.hasOwnProperty('retweeted_status')) {
        tweet_obj = tweet_obj['retweeted_status'];
        retweeted_name = tweet_obj['user']['screen_name'];
    }
    var id = tweet_obj.id;
    var user_id = tweet_obj.user.id;
    var screen_name = tweet_obj.user.screen_name;
    var reply_name = tweet_obj.in_reply_to_screen_name;
    var reply_id = tweet_obj.in_reply_to_status_id;    
    var profile_img = tweet_obj.user.profile_image_url;
    var text = ui.Template.form_text(tweet_obj.text);
    var source = tweet_obj.source;
    var ret = '';
    var scheme = ui.Template.schemes['white'];
    var reply_str = (reply_id != null) ?
        'reply to <a href="http://twitter.com/'
            + reply_name + '">'
            + reply_name + '</a> '
        : '';
    if (text.indexOf(globals.myself.screen_name) != -1) {
        scheme = ui.Template.schemes['orange'];
    }
    if (retweeted_name != '') {
        scheme = ui.Template.schemes['blue'];
    }
    ret = ui.Template.tweet_t.replace(/{%TWEET_ID%}/g, pagename+'-'+id);
    ret = ret.replace(/{%USER_ID%}/g
        , pagename+'-'+id+'-'+ user_id);
    ret = ret.replace(/{%SCREEN_NAME%}/g, screen_name);
    ret = ret.replace(/{%PROFILE_IMG%}/g, profile_img);
    ret = ret.replace(/{%TEXT%}/g, text);
    ret = ret.replace(/{%SOURCE%}/g, source);
    ret = ret.replace(/{%SCHEME%}/g, scheme);

    ret = ret.replace(/{%IN_REPLY%}/g, 
        (reply_id != null && pagename.split('-').length < 2) ? 'block' : 'none');
    ret = ret.replace(/{%REPLY_TEXT%}/g, reply_str);
    return ret;
},

form_text:
function form_text(text) {
    text = text.replace(ui.Template.reg_link, '<a href="$1">$1</a>');
    text = text.replace(ui.Template.reg_user
        , '$1<a href="http://www.twitter.com/$2">@$2</a>');
    return text;
},

}
