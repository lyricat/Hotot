if (typeof ui == 'undefined') var ui = {};
ui.Template = {

reg_vaild_preceding_chars: '(?:[^-\\/"\':!=a-zA-Z0-9_]|^)',

reg_cn_chars: '[\u4E00-\u9FA5]|[\uEF30-\uFFA0]',

reg_url_path_chars: '[a-zA-Z0-9!\\*\';:=\\+\\$/%#\\[\\]\\?\\-_,~\\(\\)&\\.`@]',

reg_url_proto_chars: '([a-zA-Z]+:\\/\\/|www\\.)',

reg_user_name_chars: '[@＠](\\w+)',

reg_hash_tag: new RegExp('(^|\\s)[#＃](\\w+)', 'g'),

reg_is_rtl: new RegExp('[\u0600-\u06ff]|[\ufe70-\ufeff]|[\ufb50-\ufdff]|[\u0590-\u05ff]'),

tweet_t: 
'<li id="{%TWEET_ID%}" class="tweet {%SCHEME%} {%FAV_CLASS%}" type="tweet"  retweet_id="{%RETWEET_ID%}" retweetable="{%RETWEETABLE%}" deletable="{%DELETABLE%}">\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="tweet_fav_indicator"></div>\
    <div class="tweet_retweet_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <div class="tweet_body">\
        <div id="{%USER_ID%}" class="who {%RETWEET_MARK%}">\
        <a class="who_href" href="hotot:action/user/{%SCREEN_NAME%}" title="{%USER_NAME%}">\
            {%SCREEN_NAME%}\
        </a>\
        </div>\
        <div class="text" style="font-size:{%TWEET_FONT_SIZE%}px">{%TEXT%}</div>\
        <div class="tweet_meta">\
            <div class="tweet_thread_info" style="display:{%IN_REPLY%}">\
                <a class="btn_tweet_thread" href="javascript:void(0);"></a>\
                {%REPLY_TEXT%}\
            </div>\
            <div class="tweet_source"> \
                {%RETWEET_TEXT%} \
                <span class="tweet_timestamp">\
                <a class="tweet_link" href="http://twitter.com/{%SCREEN_NAME%}/status/{%ORIG_TWEET_ID%}" title="{%TIMESTAMP%}">{%SHORT_TIMESTAMP%}</a>\
                </span>\
                {%TRANS_via%}: {%SOURCE%}</div>\
            <div class="status_bar">{%STATUS_INDICATOR%}</div>\
        </div>\
    </div>\
    <span class="shape"></span>\
    <span class="shape_mask"></span>\
    <div class="tweet_thread_wrapper">\
        <div class="tweet_thread_hint">{%TRANS_Loading%}</div>\
        <ul class="tweet_thread"></ul>\
        <a class="btn_tweet_thread_more">{%TRANS_View_more_conversation%}</a>\
    </div>\
</li>',

dm_t: 
'<li id="{%TWEET_ID%}" class="tweet {%SCHEME%}" type="message">\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <div class="tweet_body">\
        <div id="{%USER_ID%}" class="who">\
        <a class="who_href" href="hotot:action/user/{%SCREEN_NAME%}" title="{%USER_NAME%}">\
            {%SCREEN_NAME%}\
        </a>\
        </div>\
        <div class="text" style="font-size:{%TWEET_FONT_SIZE%}px">{%TEXT%}</div>\
        <div class="tweet_meta">\
            <div class="tweet_source"> \
                <span class="tweet_timestamp">\
                <a class="tweet_link" href="http://twitter.com/{%SCREEN_NAME%}/status/{%ORIG_TWEET_ID%}" title="{%TIMESTAMP%}">{%SHORT_TIMESTAMP%}</a>\
                </span>\
            </div>\
        </div>\
    </div>\
    <span class="shape"></span>\
    <span class="shape_mask"></span>\
</li>',

search_t:
'<li id="{%TWEET_ID%}" class="tweet {%SCHEME%}" type="search">\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <div class="tweet_body">\
        <div id="{%USER_ID%}" class="who">\
        <a class="who_href" href="hotot:action/user/{%SCREEN_NAME%}" title="{%USER_NAME%}">\
            {%SCREEN_NAME%}\
        </a>\
        </div>\
        <div class="text" style="font-size:{%TWEET_FONT_SIZE%}px">{%TEXT%}</div>\
        <div class="tweet_meta">\
            <div class="tweet_source"> \
                <span class="tweet_timestamp">\
                <a class="tweet_link" href="http://twitter.com/{%SCREEN_NAME%}/status/{%ORIG_TWEET_ID%}" title="{%TIMESTAMP%}">{%SHORT_TIMESTAMP%}</a>\
                </span>\
                {%TRANS_via%}: {%SOURCE%}</div>\
        </div>\
    </div>\
    <span class="shape"></span>\
    <span class="shape_mask"></span>\
</li>',

init:
function init() {
    ui.Template.reg_url = ui.Template.reg_vaild_preceding_chars
    + '('
        + ui.Template.reg_url_proto_chars 
        + ui.Template.reg_url_path_chars
    + '+)';

    ui.Template.reg_user = new RegExp('(^|\\s|'
            + ui.Template.reg_cn_chars + ')'
        + ui.Template.reg_user_name_chars, 'g'),

    ui.Template.reg_link = new RegExp(ui.Template.reg_url);

    ui.Template.reg_link_g = new RegExp(ui.Template.reg_url, 'g');
},

form_dm:
function form_dm(dm_obj, pagename) {
    var id = dm_obj.id_str;
    var timestamp = Date.parse(dm_obj.created_at);
    var create_at = new Date();
    create_at.setTime(timestamp);
    var screen_name = dm_obj.sender.screen_name;
    var recipient_screen_name = dm_obj.recipient.screen_name;
    var user_name = dm_obj.sender.name;
    var profile_img = dm_obj.sender.profile_image_url;
    var text = ui.Template.form_text('@'+recipient_screen_name +' ' + dm_obj.text);
    var ret = '';
    var user_id = dm_obj.sender.id;
    var scheme = 'message';

    var create_at_str = decodeURIComponent(escape(create_at.toLocaleTimeString()))
	+ ' ' + decodeURIComponent(escape(create_at.toLocaleDateString()));
    var create_at_short_str = create_at.toTimeString().split(' ')[0];
    if (create_at.toDateString() != new Date().toDateString()){
        create_at_short_str = create_at.getFullYear() + '-' + (create_at.getMonth()+1) + '-' +  create_at.getDate() + ' ' + create_at_short_str;
    }

    ret = ui.Template.dm_t.replace(/{%TWEET_ID%}/g, pagename+'-'+id);
    ret = ret.replace(/{%USER_ID%}/g
        , pagename+'-'+id+'-'+ user_id);
    ret = ret.replace(/{%SCREEN_NAME%}/g, screen_name);
    ret = ret.replace(/{%USER_NAME%}/g, user_name);
    ret = ret.replace(/{%PROFILE_IMG%}/g, profile_img);
    ret = ret.replace(/{%TEXT%}/g, text);
    ret = ret.replace(/{%SCHEME%}/g, scheme);
    ret = ret.replace(/{%SHORT_TIMESTAMP%}/g, create_at_short_str);
    ret = ret.replace(/{%TIMESTAMP%}/g, create_at_str);
    ret = ret.replace(/{%TWEET_FONT_SIZE%}/g, globals.tweet_font_size);
    ret = ret.replace(/{%TRANS_Reply_Them%}/g, _("Reply Them."));
    return ret;
},

form_tweet:
function form_tweet (tweet_obj, pagename) {
    var retweet_name = '';
    var retweet_str = '';
    var retweet_id = '';
    var id = tweet_obj.id_str;
    if (tweet_obj.hasOwnProperty('retweeted_status')) {
        retweet_name = tweet_obj['user']['screen_name'];
        tweet_obj = tweet_obj['retweeted_status'];
        retweet_id = tweet_obj.id_str;
    }
    var timestamp = Date.parse(tweet_obj.created_at);
    var create_at = new Date();
    create_at.setTime(timestamp);
    var user_id = tweet_obj.user.id;
    var screen_name = tweet_obj.user.screen_name;
    var user_name = tweet_obj.user.name;
    var reply_name = tweet_obj.in_reply_to_screen_name;
    var reply_id = tweet_obj.in_reply_to_status_id_str;    
    var profile_img = tweet_obj.user.profile_image_url;
    var text = ui.Template.form_text(tweet_obj.text);
    var favorited = tweet_obj.favorited;
    var source = tweet_obj.source;
    var protected_user = tweet_obj.user.protected;
    var is_self = (screen_name == globals.myself.screen_name);
    var ret = '';
    var scheme = 'normal';

    var reply_str = (reply_id != null) ?
        _("reply to ") + '<a href="hotot:action/user/'
            + reply_name + '">'
            + reply_name + '</a>'
        : '';
    var create_at_str = decodeURIComponent(escape(create_at.toLocaleTimeString()))
	+ ' ' + decodeURIComponent(escape(create_at.toLocaleDateString()));
    var create_at_short_str = create_at.toTimeString().split(' ')[0];
    if (create_at.toDateString() != new Date().toDateString()){
        create_at_short_str = create_at.getFullYear() + '-' + (create_at.getMonth()+1) + '-' +  create_at.getDate() + ' ' + create_at_short_str;
    }

    // choose color scheme
    if (text.indexOf(globals.myself.screen_name) != -1) {
        scheme = 'mention';
    }
    if (is_self) {
        scheme = 'me';
    }
    if (retweet_name != '') {
        retweet_str = _("retweeted by ") +  '<a href="hotot:action/user/'
            + retweet_name + '">'
            + retweet_name + '</a>, ';
    }

    ret = ui.Template.tweet_t.replace(/{%TWEET_ID%}/g, pagename+'-'+id);
    ret = ret.replace(/{%ORIG_TWEET_ID%}/g, id);
    ret = ret.replace(/{%USER_ID%}/g, pagename+'-'+id+'-'+ user_id);
    ret = ret.replace(/{%RETWEET_ID%}/g, retweet_id);
    ret = ret.replace(/{%SCREEN_NAME%}/g, screen_name);
    ret = ret.replace(/{%USER_NAME%}/g, user_name);
    ret = ret.replace(/{%PROFILE_IMG%}/g, profile_img);
    ret = ret.replace(/{%TEXT%}/g, text);
    ret = ret.replace(/{%SOURCE%}/g, source);
    ret = ret.replace(/{%SCHEME%}/g, scheme);

    ret = ret.replace(/{%IN_REPLY%}/g, 
        (reply_id != null && pagename.split('-').length < 2) ? 'block' : 'none');
    ret = ret.replace(/{%RETWEETABLE%}/g, 
        (protected_user || is_self )? 'false':'true');

    ret = ret.replace(/{%REPLY_TEXT%}/g, reply_str);
    ret = ret.replace(/{%RETWEET_TEXT%}/g, retweet_str);
    ret = ret.replace(/{%RETWEET_MARK%}/g,
        retweet_name != ''? 'retweet_mark': '');
    ret = ret.replace(/{%SHORT_TIMESTAMP%}/g, create_at_short_str);
    ret = ret.replace(/{%TIMESTAMP%}/g, create_at_str);
    ret = ret.replace(/{%FAV_CLASS%}/g, favorited? 'fav': '');
    ret = ret.replace(/{%DELETABLE%}/g, is_self? 'true': 'false');
    ret = ret.replace(/{%TWEET_FONT_SIZE%}/g, globals.tweet_font_size);
    ret = ret.replace(/{%STATUS_INDICATOR%}/g, ui.Template.form_status_indicators(tweet_obj));
    ret = ret.replace(/{%TRANS_Delete%}/g, _("Delete"));
    ret = ret.replace(/{%TRANS_Delete_this_tweet%}/g, _("Delete this tweet"));
    ret = ret.replace(/{%TRANS_Loading%}/g, _("Loading..."));
    ret = ret.replace(/{%TRANS_Official_retweet_this_tweet%}/g, _("Official retweet this tweet."));
    ret = ret.replace(/{%TRANS_Reply_All%}/g, _("Reply All"));
    ret = ret.replace(/{%TRANS_Reply_this_tweet%}/g, _("Reply this tweet."));
    ret = ret.replace(/{%TRANS_RT_this_tweet%}/g,_("RT this tweet."));
    ret = ret.replace(/{%TRANS_Send_Message%}/g, _("Send message"));
    ret = ret.replace(/{%TRANS_Send_Message_to_them%}/g, _("Send message to them"));
    ret = ret.replace(/{%TRANS_via%}/g, _("via"));
    ret = ret.replace(/{%TRANS_View_more_conversation%}/g, _("view more conversation"));
    return ret;
},

form_search:
function form_search(tweet_obj, pagename) {
    var id = tweet_obj.id_str;
    var timestamp = Date.parse(tweet_obj.created_at);
    var create_at = new Date();
    create_at.setTime(timestamp);
    var user_id = tweet_obj.from_user_id;
    var screen_name = tweet_obj.from_user;
    var user_name = tweet_obj.from_user_name;
    var profile_img = tweet_obj.profile_image_url;
    var text = ui.Template.form_text(tweet_obj.text);
    var source = tweet_obj.source.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    var is_self = (screen_name == globals.myself.screen_name);
    var ret = '';
    var scheme = 'normal';

    var create_at_str = decodeURIComponent(escape(create_at.toLocaleTimeString()))
	+ ' ' + decodeURIComponent(escape(create_at.toLocaleDateString()));
    var create_at_short_str = create_at.toTimeString().split(' ')[0];
    if (create_at.toDateString() != new Date().toDateString()){
        create_at_short_str = create_at.getFullYear() + '-' + (create_at.getMonth()+1) + '-' +  create_at.getDate() + ' ' + create_at_short_str;
    }
    // choose color scheme
    if (text.indexOf(globals.myself.screen_name) != -1) {
        scheme = 'mention';
    }
    if (is_self) {
        scheme = 'me';
    }

    ret = ui.Template.search_t.replace(/{%TWEET_ID%}/g, pagename+'-'+id);
    ret = ret.replace(/{%ORIG_TWEET_ID%}/g, id);
    ret = ret.replace(/{%USER_ID%}/g, pagename+'-'+id+'-'+ user_id);
    ret = ret.replace(/{%SCREEN_NAME%}/g, screen_name);
    ret = ret.replace(/{%USER_NAME%}/g, user_name);
    ret = ret.replace(/{%PROFILE_IMG%}/g, profile_img);
    ret = ret.replace(/{%TEXT%}/g, text);
    ret = ret.replace(/{%SOURCE%}/g, source);
    ret = ret.replace(/{%SCHEME%}/g, scheme);
    ret = ret.replace(/{%SHORT_TIMESTAMP%}/g, create_at_short_str);
    ret = ret.replace(/{%TIMESTAMP%}/g, create_at_str);
    ret = ret.replace(/{%TWEET_FONT_SIZE%}/g, globals.tweet_font_size);
    ret = ret.replace(/{%TRANS_via%}/g, _("via"));
    return ret;
},

fill_vcard:
function fill_vcard(user_obj, vcard_container) {
    var create_at = new Date(Date.parse(user_obj.created_at));
    var now = new Date();
    var differ = Math.floor((now-create_at)/(1000 * 60 * 60 * 24));

    var create_at_str = decodeURIComponent(escape(create_at.toLocaleTimeString()))
	+ ' ' + decodeURIComponent(escape(create_at.toLocaleDateString()));
    
    vcard_container.find('.profile_img_wrapper')
        .attr('style', 'background-image:url('+user_obj.profile_image_url+');');
    vcard_container.find('.screen_name')
        .html(user_obj.screen_name)
        .attr('href', 'http://twitter.com/'+user_obj.screen_name);
    vcard_container.find('.name').text(user_obj.name);
    vcard_container.find('.tweet_cnt').text(user_obj.statuses_count);
    vcard_container.find('.tweet_per_day_cnt').text(
        Math.round(user_obj.statuses_count / differ * 100)/ 100);
    vcard_container.find('.follower_cnt').text(user_obj.followers_count);
    vcard_container.find('.friend_cnt').text(user_obj.friends_count);
    vcard_container.find('.bio').text('').text(user_obj.description);
    vcard_container.find('.location').text('').text(user_obj.location);
    vcard_container.find('.join').text(create_at_str);
    if (user_obj.url) {
        vcard_container.find('.web').text(user_obj.url)
        vcard_container.find('.web').attr('href', user_obj.url);
    } else {
        vcard_container.find('.web').text('')
        vcard_container.find('.web').attr('href', '#');
    }
    vcard_container.find('.relation').html(
        user_obj.following? '&radic; Following': '&empty; Not follow' );
},

form_text:
function form_text(text) {
    text = text.replace(/"/g, '&#34;');
    text = text.replace(/'/g, '&#39;');
    text = text.replace(/\$/g, '$$$');
    text = text.replace(ui.Template.reg_link_g, ' <a href="$1">$1</a>');
    text = text.replace(/href="www/g, 'href="http://www');
    text = text.replace(ui.Template.reg_user
        , '$1@<a href="hotot:action/user/$2">$2</a>');
    text = text.replace(ui.Template.reg_hash_tag
        , '$1<a href="hotot:action/search/#$2">#$2</a>');
    text = text.replace(/[\r\n]\s+[\r\n]/g, '\n\n\n');
    text = text.replace(/\n/g, '<br/>');
    if (ui.Template.reg_is_rtl.test(text)) {
        text = '<div align="right" dir="rtl">' + text + '</div>';
    }
    return text;
},

form_status_indicators:
function form_status_indicators(tweet) {
     
},

}
