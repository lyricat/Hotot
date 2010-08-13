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
        <img src="{%PROFILE_IMG%}" onerror="void(0);"/>\
    </div>\
    <div class="tweet_body" style="background-color:{%SCHEME%};">\
        <div id="{%USER_ID%}" class="who"><a class="who_href" href="hotot:action/user/{%SCREEN_NAME%}">{%SCREEN_NAME%}:</a><span class="tweet_timestamp">{%TIMESTAMP%}</span></div>\
        <div class="text">{%TEXT%}</div>\
        <ul class="tweet_ctrl">\
            <li><a class="tweet_reply tweet_ctrl_btn" title="Reply this tweet." href="javascript:void(0);"></a></li>\
            <li><a class="tweet_rt tweet_ctrl_btn" title="RT this tweet." href="javascript:void(0);"></a></li>\
            <li><a class="tweet_retweet tweet_ctrl_btn" title="Official retweet this tweet." href="javascript:void(0);"></a></li>\
            <li><a class="tweet_fav {%UNFAV_CLASS%} tweet_ctrl_btn" title="{%FAV_TITLE%}" href="javascript:void(0);"></a></li>\
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
            <div class="tweet_source">{%RETWEET_TEXT%} via: {%SOURCE%}</div>\
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
        <div id="{%USER_ID%}" class="who"><a class="who_href" href="hotot:action/user/{%SCREEN_NAME%}">{%SCREEN_NAME%}:</a></div>\
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
    var retweet_name = '';
    if (tweet_obj.hasOwnProperty('retweeted_status')) {
        retweet_name = tweet_obj['user']['screen_name'];
        tweet_obj = tweet_obj['retweeted_status'];
    }
    var id = tweet_obj.id;
    var timestamp = Date.parse(tweet_obj.created_at);
    var create_at = new Date();
    create_at.setTime(timestamp);
    var user_id = tweet_obj.user.id;
    var screen_name = tweet_obj.user.screen_name;
    var reply_name = tweet_obj.in_reply_to_screen_name;
    var reply_id = tweet_obj.in_reply_to_status_id;    
    var profile_img = tweet_obj.user.profile_image_url;
    var text = ui.Template.form_text(tweet_obj.text);
    var favorited = tweet_obj.favorited;
    var source = tweet_obj.source;
    var ret = '';
    var scheme = ui.Template.schemes['white'];

    var reply_str = (reply_id != null) ?
        'reply to <a href="hotot:action/user/'
            + reply_name + '">'
            + reply_name + '</a>'
        : '';
    var retweet_str = (retweet_name != '') ?
        'retweeted by <a href="hotot:action/user/'
            + retweet_name + '">'
            + retweet_name + '</a>, '
        : '';
    var create_at_str = create_at.toLocaleTimeString()
        + ' ' + create_at.toDateString();
    // choose color scheme
    if (text.indexOf(globals.myself.screen_name) != -1) {
        scheme = ui.Template.schemes['green'];
    }
    if (screen_name == globals.myself.screen_name) {
        scheme = ui.Template.schemes['orange'];
    }
    if (retweet_name != '') {
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
    ret = ret.replace(/{%RETWEET_TEXT%}/g, retweet_str);
    ret = ret.replace(/{%TIMESTAMP%}/g, create_at_str);
    ret = ret.replace(/{%FAV_TITLE%}/g, favorited? 'Unfav it.': 'Fav it!');
    ret = ret.replace(/{%UNFAV_CLASS%}/g, favorited? 'unfav': '');
    return ret;
},

fill_vcard:
function fill_vcard(user_obj, vcard_container) {
    vcard_container.find('.profile_img')
        .attr('src', user_obj.profile_image_url);
    vcard_container.find('.screen_name').text(user_obj.screen_name);
    vcard_container.find('.name').text(user_obj.name);
    vcard_container.find('.tweet_cnt').text(user_obj.statuses_count);
    vcard_container.find('.follower_cnt').text(user_obj.followers_count);
    vcard_container.find('.friend_cnt').text(user_obj.friends_count);
    vcard_container.find('.bio').text(user_obj.description);
    vcard_container.find('.location').text(user_obj.location);
    vcard_container.find('.join').text(
        new Date(Date.parse(user_obj.created_at)).toLocaleDateString());
    if (user_obj.url) {
        vcard_container.find('.web').text(user_obj.url)
        vcard_container.find('.web').attr('href', user_obj.url);
    } else {
        vcard_container.find('.web').text('')
        vcard_container.find('.web').attr('href', '#');
    }

    if (user_obj.following) {
        vcard_container.find('.vcard_follow').html('Follow');
    } else {
        vcard_container.find('.vcard_follow').html('Unfollow');
    }
},

form_text:
function form_text(text) {
    text = text.replace(ui.Template.reg_link, '<a href="$1">$1</a>');
    text = text.replace(ui.Template.reg_user
        , '$1<a href="hotot:action/user/$2">@$2</a>');
    return text;
},

}
