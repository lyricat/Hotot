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
'<li id="{%TWEET_ID%}" class="card {%SCHEME%} {%FAV_CLASS%}" type="tweet"  retweet_id="{%RETWEET_ID%}" reply_id="{%REPLY_ID%}" reply_name="{%REPLY_NAME%}" retweetable="{%RETWEETABLE%}" deletable="{%DELETABLE%}">\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="tweet_fav_indicator"></div>\
    <div class="tweet_retweet_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <div class="card_body">\
        <div id="{%USER_ID%}" class="who {%RETWEET_MARK%}">\
        <a class="who_href" href="#{%SCREEN_NAME%}" title="{%USER_NAME%}">\
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
                <a class="tweet_link" target="_blank" href="http://twitter.com/{%SCREEN_NAME%}/status/{%ORIG_TWEET_ID%}" title="{%TIMESTAMP%}">{%SHORT_TIMESTAMP%}</a>\
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
'<li id="{%ID%}" tweet_id="{%TWEET_ID%}" class="card {%SCHEME%}" type="message" sender_screen_name="{%SCREEN_NAME%}">\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <div class="card_body">\
        <div class="who">\
        <a class="who_href" href="#{%SCREEN_NAME%}" title="{%USER_NAME%}">\
            {%SCREEN_NAME%}\
        </a>\
        </div>\
        <div class="text" style="font-size:{%TWEET_FONT_SIZE%}px">{%TEXT%}</div>\
        <div class="tweet_meta">\
            <div class="tweet_source"> \
                <span class="tweet_timestamp">{%TIMESTAMP%}</span>\
            </div>\
        </div>\
    </div>\
    <span class="shape"></span>\
    <span class="shape_mask"></span>\
</li>',

search_t:
'<li id="{%ID%}" tweet_id="{%TWEET_ID%}" class="card {%SCHEME%}" type="search">\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <div class="card_body">\
        <div class="who">\
        <a class="who_href" href="#{%SCREEN_NAME%}" title="{%USER_NAME%}">\
            {%SCREEN_NAME%}\
        </a>\
        </div>\
        <div class="text" style="font-size:{%TWEET_FONT_SIZE%}px">{%TEXT%}</div>\
        <div class="tweet_meta">\
            <div class="tweet_source"> \
                <span class="tweet_timestamp">\
                <a class="tweet_link" target="_blank" href="http://twitter.com/{%SCREEN_NAME%}/status/{%TWEET_ID%}" title="{%TIMESTAMP%}">{%SHORT_TIMESTAMP%}</a>\
                </span>\
                {%TRANS_via%}: {%SOURCE%}</div>\
        </div>\
    </div>\
    <span class="shape"></span>\
    <span class="shape_mask"></span>\
</li>',

people_t:
'<li id="{%USER_ID%}" class="people_card card normal" type="people" following={%FOLLOWING%} screen_name={%SCREEN_NAME%}>\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <div class="card_body">\
        <div id="{%USER_ID%}" class="who">\
        <a class="who_href" href="#{%SCREEN_NAME%}" title="{%USER_NAME%}">\
            {%SCREEN_NAME%}\
        </a>\
        </div>\
        <div class="text" style="font-style:italic font-size:{%TWEET_FONT_SIZE%}px">{%DESCRIPTION%}</div>\
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
        
    ui.Template.tweet_m = {
          TWEET_ID:'', ORIG_TWEET_ID:'', USER_ID:'', RETWEET_ID:''
        , REPLY_ID:'',SCREEN_NAME:'',REPLY_NAME:'', USER_NAME:''
        , PROFILE_IMG:'', TEXT:'', SOURCE:'', SCHEME:''
        , IN_REPLY:'', RETWEETABLE:'', REPLY_TEXT:'', RETWEET_TEXT:''
        , RETWEET_MARK:'', SHORT_TIMESTAMP:'', TIMESTAMP:'', FAV_CLASS:''
        , DELETABLE:'', TWEET_FONT_SIZE:'', STATUS_INDICATOR:'', TRANS_Delete:''
        , TRANS_Delete_this_tweet:'', TRANS_Loading:''
        , TRANS_Official_retweet_this_tweet:'', TRANS_Reply_All:''
        , TRANS_Reply_this_tweet:'', TRANS_RT_this_tweet:''
        , TRANS_Send_Message:'', TRANS_Send_Message_to_them:''
        , TRANS_via:'', TRANS_View_more_conversation:''
    };

    ui.Template.dm_m = {
          ID:'', TWEET_ID:'', SCREEN_NAME:''
        , USER_NAME:'', PROFILE_IMG:'', TEXT:''
        , SCHEME:'', TIMESTAMP:''
        , TWEET_FONT_SIZE:'', TRANS_Reply_Them:''
    };

    ui.Template.search_m = {
          ID:'', TWEET_ID:'', SCREEN_NAME:''
        , USER_NAME:'', PROFILE_IMG:'', TEXT:'', SOURCE:''
        , SCHEME:'', SHORT_TIMESTAMP:'', TIMESTAMP:''
        , TWEET_FONT_SIZE:'', TRANS_via:''
    };

    ui.Template.people_m = {
          USER_ID:'', SCREEN_NAME:'', USER_NAME:'', DESCRIPTION:''
        , PROFILE_IMG:'', FOLLOWING:'', TWEET_FONT_SIZE:''
    };
},

form_dm:
function form_dm(dm_obj, pagename) {
    var timestamp = Date.parse(dm_obj.created_at);
    var create_at = new Date();
    create_at.setTime(timestamp);
    var create_at_str = decodeURIComponent(escape(create_at.toLocaleTimeString()))
	+ ' ' + decodeURIComponent(escape(create_at.toLocaleDateString()));
    var text = ui.Template.form_text('@'+dm_obj.recipient.screen_name +' ' + dm_obj.text);

    var m = ui.Template.dm_m;
    m.ID = pagename + '-' + dm_obj.id_str;
    m.TWEET_ID = dm_obj.id_str;
    m.SCREEN_NAME = dm_obj.sender.screen_name;
    m.USER_NAME = dm_obj.sender.name;
    m.PROFILE_IMG = dm_obj.sender.profile_image_url;
    m.TEXT = text;
    m.SCHEME = 'message';
    m.TIMESTAMP = create_at_str;
    m.TWEET_FONT_SIZE = globals.tweet_font_size;
    m.TRANS_Reply_Them = "Reply Them";
    return ui.Template.render(ui.Template.dm_t, m);
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
        "reply to " + '<a class="who_href" href="#'
            + reply_name + '">'
            + reply_name + '</a>'
        : '';
    var create_at_str = decodeURIComponent(escape(create_at.toLocaleTimeString()));
	+ ' ' + decodeURIComponent(escape(create_at.toLocaleDateString()));
    var create_at_short_str = create_at.toTimeString().split(' ')[0];
    if (create_at.toDateString() != new Date().toDateString()){
        create_at_short_str = create_at.getFullYear() + '-' + (create_at.getMonth()+1) + '-' +  create_at.getDate() + ' ' + create_at_short_str;
    }

    // choose color scheme
    if (tweet_obj.entities) {
        for (var i = 0; i < tweet_obj.entities.user_mentions.length; i+=1)
        {
            if (tweet_obj.entities.user_mentions[i].screen_name
                == globals.myself.screen_name)
            {
                scheme = 'mention';
            }
        }
    }
    if (is_self) {
        scheme = 'me';
    }
    if (retweet_name != '') {
        retweet_str = "retweeted by " +  '<a class="who_href" href="#'
            + retweet_name + '">'
            + retweet_name + '</a>, ';
    }

    var m = ui.Template.tweet_m;
    m.TWEET_ID = pagename+'-'+id;
    m.ORIG_TWEET_ID = id;
    m.USER_ID = pagename+'-'+id+'-'+ user_id;
    m.RETWEET_ID = retweet_id;
    m.REPLY_ID = reply_id != null? reply_id:'';
    m.SCREEN_NAME = screen_name;
    m.REPLY_NAME = reply_id != null? reply_name: '';
    m.USER_NAME = user_name;
    m.PROFILE_IMG = profile_img;
    m.TEXT = text;
    m.SOURCE = source.replace('href', 'target="_blank" href');
    m.SCHEME = scheme;

    m.IN_REPLY = (reply_id != null && pagename.split('-').length < 2) ? 'block' : 'none';
    m.RETWEETABLE = (protected_user || is_self )? 'false':'true';

    m.REPLY_TEXT = reply_str;
    m.RETWEET_TEXT = retweet_str;
    m.RETWEET_MARK = retweet_name != ''? 'retweet_mark': '';
    m.SHORT_TIMESTAMP = create_at_short_str;
    m.TIMESTAMP = create_at_str;
    m.FAV_CLASS = favorited? 'fav': '';
    m.DELETABLE = is_self? 'true': 'false';
    m.TWEET_FONT_SIZE = globals.tweet_font_size;
    m.STATUS_INDICATOR = ui.Template.form_status_indicators(tweet_obj);
    m.TRANS_Delete = "Delete";
    m.TRANS_Delete_this_tweet = "Delete this tweet";
    m.TRANS_Loading = "Loading...";
    m.TRANS_Official_retweet_this_tweet = "Official retweet this tweet.";
    m.TRANS_Reply_All = "Reply All";
    m.TRANS_Reply_this_tweet = "Reply this tweet.";
    m.TRANS_RT_this_tweet = "RT this tweet.";
    m.TRANS_Send_Message = "Send message";
    m.TRANS_Send_Message_to_them = "Send message to them";
    m.TRANS_via = "via";
    m.TRANS_View_more_conversation = "view more conversation";
    return ui.Template.render(ui.Template.tweet_t, m);
},

form_search:
function form_search(tweet_obj, pagename) {
    var id = tweet_obj.id_str;
    var source = tweet_obj.source.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    var timestamp = Date.parse(tweet_obj.created_at);
    var create_at = new Date();
    create_at.setTime(timestamp);
    var create_at_str = decodeURIComponent(escape(create_at.toLocaleTimeString()))
	+ ' ' + decodeURIComponent(escape(create_at.toLocaleDateString()));
    var create_at_short_str = create_at.toTimeString().split(' ')[0];
    if (create_at.toDateString() != new Date().toDateString()){
        create_at_short_str = create_at.getFullYear() + '-' + (create_at.getMonth()+1) + '-' +  create_at.getDate() + ' ' + create_at_short_str;
    }
    var text = ui.Template.form_text(tweet_obj.text);
    // choose color scheme
    var scheme = 'normal';
    if (text.indexOf(globals.myself.screen_name) != -1) {
        scheme = 'mention';
    }
    if (tweet_obj.from_user == globals.myself.screen_name) {
        scheme = 'me';
    }

    var m = ui.Template.search_m;
    m.ID = pagename + '-' + id;
    m.TWEET_ID = id;
    m.SCREEN_NAME = tweet_obj.from_user;
    m.USER_NAME = tweet_obj.from_user_name;
    m.PROFILE_IMG = tweet_obj.profile_image_url;
    m.TEXT = text;
    // @TODO BUG
    m.SOURCE = source.replace('href', 'target="_blank" href');
    m.SCHEME = scheme;
    m.SHORT_TIMESTAMP = create_at_short_str;
    m.TIMESTAMP = create_at_str;
    m.TWEET_FONT_SIZE = globals.tweet_font_size;
    m.TRANS_via = 'via';
    return ui.Template.render(ui.Template.search_t, m);
},

form_people:
function form_people(user_obj, pagename) {
    var m = ui.Template.people_m;
    m.USER_ID = pagename + '-' + user_obj.id_str;
    m.SCREEN_NAME = user_obj.screen_name;
    m.USER_NAME = user_obj.name;
    m.DESCRIPTION = user_obj.description;
    m.PROFILE_IMG = user_obj.profile_image_url;
    m.FOLLOWING = user_obj.following;
    m.TWEET_FONT_SIZE = globals.tweet_font_size;

    return ui.Template.render(ui.Template.people_t, m);
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
        .attr('href', 'http://twitter.com/'+user_obj.screen_name)
        .text(user_obj.screen_name);
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
},

form_text:
function form_text(text) {
    text = text.replace(/"/g, '&#34;');
    text = text.replace(/'/g, '&#39;');
    text = text.replace(/\$/g, '$$$');
    text = text.replace(ui.Template.reg_link_g, ' <a href="$1" target="_blank">$1</a>');
    text = text.replace(/href="www/g, 'href="http://www');
    text = text.replace(ui.Template.reg_user
        , '$1@<a class="who_href" href="#$2">$2</a>');
    text = text.replace(ui.Template.reg_hash_tag
        , '$1<a class="hash_href" href="#$2">#$2</a>');
    text = text.replace(/[\r\n]\s+[\r\n]/g, '\n\n');
    text = text.replace(/\n/g, '<br/>');
    if (ui.Template.reg_is_rtl.test(text)) {
        text = '<div align="right" dir="rtl">' + text + '</div>';
    }
    return text;
},

form_status_indicators:
function form_status_indicators(tweet) {
     
},

render:
function render(tpl, map) {
    var text = tpl
    // @TODO use jquery-tmpl?
    for (var k in map) {
        text = text.replace(new RegExp('{%'+k+'%}', 'g'), map[k]);
    }
    return text;
},

}
