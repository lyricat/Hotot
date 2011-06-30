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
'<li id="{%ID%}" tweet_id="{%TWEET_ID%}" class="card {%SCHEME%} {%FAV_CLASS%}" type="tweet"  retweet_id="{%RETWEET_ID%}" reply_id="{%REPLY_ID%}" in_thread="{%IN_THREAD%}" reply_name="{%REPLY_NAME%}" screen_name="{%SCREEN_NAME%}" retweetable="{%RETWEETABLE%}" deletable="{%DELETABLE%}">\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="tweet_fav_indicator"></div>\
    <div class="tweet_retweet_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <div class="card_body">\
        <div class="who {%RETWEET_MARK%}">\
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
                <a class="tweet_link" target="_blank" href="{%TWEET_BASE_URL%}/{%TWEET_ID%}" title="{%TIMESTAMP%}">{%SHORT_TIMESTAMP%}</a>\
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

retweeted_by_t: 
'<li id="{%ID%}" tweet_id="{%TWEET_ID%}" class="card {%SCHEME%} {%FAV_CLASS%}" type="tweet"  retweet_id="{%RETWEET_ID%}" reply_id="{%REPLY_ID%}" reply_name="{%REPLY_NAME%}" screen_name="{%SCREEN_NAME%}" retweetable="{%RETWEETABLE%}" deletable="{%DELETABLE%}">\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="tweet_fav_indicator"></div>\
    <div class="tweet_retweet_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <div class="card_body">\
        <div class="who {%RETWEET_MARK%}">\
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
                <a class="tweet_link" target="_blank" href="{%TWEET_BASE_URL%}/{%TWEET_ID%}" title="{%TIMESTAMP%}">{%SHORT_TIMESTAMP%}</a>\
                </span>\
                {%TRANS_via%}: {%SOURCE%}\
                {%TRANS_Retweeted_by%}: <a class="show" href="javascript:void(0)" tweet_id="{%TWEET_ID%}">{%TRANS_Show_retweeters%}</a>\
            </div>\
            <div class="tweet_retweeters" tweet_id="{%TWEET_ID%}"></div>\
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

message_t: 
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
'<li id="{%ID%}" tweet_id="{%TWEET_ID%}" class="card {%SCHEME%}" type="search" screen_name="{%SCREEN_NAME%}">\
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
                <a class="tweet_link" target="_blank" href="{%TWEET_BASE_URL%}/{%TWEET_ID%}" title="{%TIMESTAMP%}">{%SHORT_TIMESTAMP%}</a>\
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

people_vcard_t:
'<div class="header_frame"><div class="people_vcard vcard">\
    <div class="profile_img_wrapper"></div>\
    <div class="vcard_body">\
        <center>\
        <ul class="people_vcard_radio_group radio_group"> \
            <li><a class="radio_group_btn selected" href="#people_vcard_info_page">INFO</a> \
            </li><li><a class="radio_group_btn" href="#people_vcard_stat_page">STAT</a> \
            </li></ul>\
        </center>\
        <div class="people_vcard_tabs_pages">\
        <table class="people_vcard_info_page vcard_tabs_page radio_group_page" border="0" cellpadding="0" cellspacing="0"> \
            <tr><td>Name: </td><td> \
                <a class="screen_name" target="_blank" href="#"></a> \
                (<span class="name"></span>) </td> \
            </tr> \
            <tr><td>Bio: </td> \
                <td><span class="bio"></span></td> \
            </tr> \
            <tr><td>Web: </td> \
                <td><a class="web" target="_blank" href="#" class="link"></a></td> \
            </tr> \
            <tr><td>Location: </td> \
                <td><span class="location"></span></td> \
            </tr> \
        </table> \
        <table class="people_vcard_stat_page vcard_tabs_page radio_group_page"> \
            <tr><td>Join: </td> \
                <td><span class="join"></span></td> \
            </tr> \
            <tr><td>Tweets: </td> \
                <td><span class="tweet_cnt"></span> \
                (<span class="tweet_per_day_cnt"></span> per day)</td> \
            </tr> \
            <tr><td>Followers: </td> \
                <td><span class="follower_cnt"></span></td> \
            </tr> \
            <tr><td>Friends: </td> \
                <td><span class="friend_cnt"></span></td> \
            </tr> \
            <tr><td>Relation: </td> \
                <td><span class="relation"></span></td> \
            </tr> \
        </table> \
        </div><!-- vcard tabs pages --> \
    </div> <!-- vcard body --> \
    <div class="people_vcard_ctrl"> \
        <ul class="people_vcard_action_btns"> \
        <li><a class="vcard_follow button" \
                href="javascript:void(0);" >Follow</a> \
        </li><li> \
            <a class="vcard_block button" \
                href="javascript:void(0);" >Block</a> \
        </li><li> \
            <a class="vcard_unblock button" \
                href="javascript:void(0);">Unblock</a> \
        </li><li> \
            <a class="vcard_edit button" \
                href="javascript:void(0);" style="display:none;">Edit</a>\
        </li> \
        </ul> \
    </div><!-- #people_vcard_ctrl --> \
</div> <!-- vcard --> \
<div class="people_view_toggle"> \
    <ol class="people_view_toggle_btns radio_group"> \
        <li><a class="people_view_tweet_btn radio_group_btn selected" href="#tweet">Tweets</a> \
        </li><li> \
        <a class="people_view_fav_btn radio_group_btn" href="#fav">Favs</a> \
        </li><li> \
        <a class="people_view_follower_btn radio_group_btn" href="#follower">Followers</a> \
        </li><li> \
        <a class="people_view_friend_btn radio_group_btn" href="#friend">Friends</a> \
        </li> \
    </ol> \
</div> \
<div class="people_request_hint"> \
    <h1>Them has protected his/her tweets.</span></h1> \
    <p>You need to go to twitter.com to send a request before you can start following this person...</p> \
    <div style="text-align:center;"> \
    <a class="people_request_btn button" href="#" target="_blank">Send Request</a> \
    </div> \
</div></div>',

search_header_t: 
'<div class="header_frame"> \
    <input class="search_entry entry" type="text"/><a href="#" class="search_btn button">Search</a> \
    <div class="search_people_result"> \
        <label class="label">One user matched: </label> <span class="search_people_inner"></span>\
    </div>\
    <div class="search_view_toggle">\
        <ol class="search_view_toggle_btns radio_group">\
            <li><a class="search_tweet radio_group_btn selected" \
                href="#tweet">Tweet</a>\
            </li><li> \
                <a class="search_people radio_group_btn"\
                href="#people">People</a>\
            </li> \
        </ol> \
    </div> \
    <div class="search_no_result_hint"> \
        <p><span>Your search</span> - <label class="keywords"></label> - <span>did not match any result.</span></p> \
        <p><span>Suggestions</span>: <br/> \
         - <span>Make sure all words are spelled correctly.</span><br/> \
         - <span>Try different keywords.</span><br/> \
         - <span>Try more general keywords.</span><br/></p> \
    </div> \
</div>',

retweets_header_t:
'<div class="header_frame"><div class="retweets_view_toggle"> \
    <ol class="retweets_view_toggle_btns radio_group">\
        <li><a class="btn_retweeted_to_me radio_group_btn selected" \
            href="#retweeted_to_me">By Others</a>\
        </li><li> \
            <a class="btn_retweeted_by_me radio_group_btn"\
            href="#retweeted_by_me">By Me</a>\
        </li><li> \
            <a class="btn_retweets_of_me radio_group_btn" \
            href="#retweets_of_me">My Tweets, Retweeted</a> \
        </li> \
    </ol> \
</div></div>',

view_t:
'<div id="{%ID%}" \
    name="{%NAME%}" class="listview {%CLASS%}"> \
    <div class="listview_header"><div class="header_title">{%TITLE%}</div><a href="#" style="display:{%CAN_CLOSE%}" class="close_btn ic_close"></a><div class="header_content">{%HEADER%}</div></div> \
    <ul class="listview_body"></ul> \
    <div class="listview_footer"> \
        <div class="load_more_info"><img src="image/ani_loading_bar_gray.gif"/></div> \
    </div> \
</div>',

indicator_t:
    '<li class="{%STICK%}" name="{%TARGET%}"><a class="indicator_btn" href="#{%TARGET%}" title="{%TITLE%}"><span class="icon" style="background-image:url({%ICON%})"></span><img class="icon"/></a><span class="shape"></span></li>',

kismet_rule_t:
'<li><a class="kismet_rule" name="{%NAME%}" type="{%TYPE%}" method="{%METHOD%}"\
    disabled="{%DISABLED%}" field="{%FIELD%}" pattern="{%PATTERN%}"     \
    actions="{%ACTIONS%}" {%ADDITION%} href="#">{%NAME%}</a></li>',

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
          ID:'', TWEET_ID:'', RETWEET_ID:''
        , REPLY_ID:'',SCREEN_NAME:'',REPLY_NAME:'', USER_NAME:''
        , PROFILE_IMG:'', TEXT:'', SOURCE:'', SCHEME:''
        , IN_REPLY:'', RETWEETABLE:'', REPLY_TEXT:'', RETWEET_TEXT:''
        , RETWEET_MARK:'', SHORT_TIMESTAMP:'', TIMESTAMP:'', FAV_CLASS:''
        , DELETABLE:'', TWEET_FONT_SIZE:'', STATUS_INDICATOR:'', TRANS_Delete:''
        , TRANS_Official_retweet_this_tweet:'', TRANS_Reply_All:''
        , TRANS_Reply_this_tweet:'', TRANS_RT_this_tweet:''
        , TRANS_Send_Message:'', TRANS_Send_Message_to_them:''
        , TRANS_via:'', TRANS_View_more_conversation:''
        , TWEET_BASE_URL: '', IN_THREAD: '',
    };

    ui.Template.retweeted_by_m = {
          ID:'', TWEET_ID:'', RETWEET_ID:''
        , REPLY_ID:'',SCREEN_NAME:'',REPLY_NAME:'', USER_NAME:''
        , PROFILE_IMG:'', TEXT:'', SOURCE:'', SCHEME:''
        , IN_REPLY:'', RETWEETABLE:'', REPLY_TEXT:'', RETWEET_TEXT:''
        , RETWEET_MARK:'', SHORT_TIMESTAMP:'', TIMESTAMP:'', FAV_CLASS:''
        , DELETABLE:'', TWEET_FONT_SIZE:'', STATUS_INDICATOR:'', TRANS_Delete:''
        , TRANS_Official_retweet_this_tweet:'', TRANS_Reply_All:''
        , TRANS_Reply_this_tweet:'', TRANS_RT_this_tweet:''
        , TRANS_Send_Message:'', TRANS_Send_Message_to_them:''
        , TRANS_via:'', TRANS_View_more_conversation:''
        , TRANS_retweeted_by:'', TRANS_Show_retweeters:''
        , TWEET_BASE_URL: ''
    };

    ui.Template.message_m = {
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
        , TWEET_BASE_URL: ''
    };

    ui.Template.people_m = {
          USER_ID:'', SCREEN_NAME:'', USER_NAME:'', DESCRIPTION:''
        , PROFILE_IMG:'', FOLLOWING:'', TWEET_FONT_SIZE:''
    };

    ui.Template.view_m = {
        ID:'', CLASS:'tweetview', NAME: '', TITLE: '', CAN_CLOSE: ''
    };

    ui.Template.indicator_m = {
        TARGET: '', TITLE: '', ICON: ''
    };

    ui.Template.kismet_rule_m = {
          TYPE:'', DISABLED:'', FIELD:'', PATTERN:''
        , METHOD:'', ACTIONS: '', ADDITION: '', NAME: ''
    };

},

form_dm:
function form_dm(dm_obj, pagename) {
    var timestamp = Date.parse(dm_obj.created_at);
    var created_at = new Date();
    created_at.setTime(timestamp);
    var created_at_str = ui.Template.format_time(created_at);
    var text = ui.Template.form_text('@'+dm_obj.recipient.screen_name +' ' + dm_obj.text);

    var m = ui.Template.message_m;
    m.ID = pagename + '-' + dm_obj.id_str;
    m.TWEET_ID = dm_obj.id_str;
    m.SCREEN_NAME = dm_obj.sender.screen_name;
    m.USER_NAME = dm_obj.sender.name;
    m.PROFILE_IMG = dm_obj.sender.profile_image_url;
    m.TEXT = text;
    m.SCHEME = 'message';
    m.TIMESTAMP = created_at_str;
    m.TWEET_FONT_SIZE = globals.tweet_font_size;
    m.TRANS_Reply_Them = "Reply Them";
    return ui.Template.render(ui.Template.message_t, m);
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
    var reply_name = tweet_obj.in_reply_to_screen_name;
    var reply_id = tweet_obj.in_reply_to_status_id_str;    
    var reply_str = (reply_id != null) ?
        "reply to " + '<a class="who_href" href="#'
            + reply_name + '">'
            + reply_name + '</a>'
        : '';
    var in_thread = pagename.split('-').length < 2 ? false:true;
    var timestamp = Date.parse(tweet_obj.created_at);
    var created_at = new Date();
    created_at.setTime(timestamp);
    var created_at_str = ui.Template.format_time(created_at);
    var created_at_short_str = created_at.toTimeString().split(' ')[0];
    if (created_at.toDateString() != new Date().toDateString()){
        created_at_short_str = created_at.getFullYear() + '-' + (created_at.getMonth()+1) + '-' +  created_at.getDate() + ' ' + created_at_short_str;
    }

    // choose color scheme
    var scheme = 'normal';
    if (tweet_obj.entities) {
        for (var i = 0, l = tweet_obj.entities.user_mentions.length; i < l; i+=1)
        {
            if (tweet_obj.entities.user_mentions[i].screen_name
                == globals.myself.screen_name)
            {
                scheme = 'mention';
            }
        }
    }
    if (tweet_obj.user.screen_name == globals.myself.screen_name) {
        scheme = 'me';
    }
    if (retweet_name != '') {
        retweet_str = "retweeted by " +  '<a class="who_href" href="#'
            + retweet_name + '">'
            + retweet_name + '</a>, ';
    }

    var m = ui.Template.tweet_m;
    m.ID = pagename+'-'+id;
    m.TWEET_ID = id;
    m.RETWEET_ID = retweet_id;
    m.REPLY_ID = reply_id != null? reply_id:'';
    m.IN_THREAD = in_thread;
    m.SCREEN_NAME = tweet_obj.user.screen_name;
    m.REPLY_NAME = reply_id != null? reply_name: '';
    m.USER_NAME = tweet_obj.user.name;
    m.PROFILE_IMG = tweet_obj.user.profile_image_url;
    m.TEXT = ui.Template.form_text(tweet_obj.text);
    m.SOURCE = tweet_obj.source.replace('href', 'target="_blank" href');
    m.SCHEME = scheme;

    m.IN_REPLY = (reply_id != null && pagename.split('-').length < 2) ? 'block' : 'none';
    m.RETWEETABLE = (tweet_obj.user.protected || scheme == 'me' )? 'false':'true';

    m.REPLY_TEXT = reply_str;
    m.RETWEET_TEXT = retweet_str;
    m.RETWEET_MARK = retweet_name != ''? 'retweet_mark': '';
    m.SHORT_TIMESTAMP = created_at_short_str;
    m.TIMESTAMP = created_at_str;
    m.FAV_CLASS = tweet_obj.favorited? 'faved': '';
    m.DELETABLE = scheme == 'me'? 'true': 'false';
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
    m.TWEET_BASE_URL = conf.current_name.split('@')[1] == 'twitter'?'https://twitter.com/' + tweet_obj.user.screen_name + '/status':'https://identi.ca/notice';
    return ui.Template.render(ui.Template.tweet_t, m);
},

form_retweeted_by:
function form_retweeted_by(tweet_obj, pagename) {
    var retweet_name = '';
    var retweet_str = '';
    var retweet_id = '';
    var id = tweet_obj.id_str;
    if (tweet_obj.hasOwnProperty('retweeted_status')) {
        retweet_name = tweet_obj['user']['screen_name'];
        tweet_obj = tweet_obj['retweeted_status'];
        retweet_id = tweet_obj.id_str;
    }
    var reply_name = tweet_obj.in_reply_to_screen_name;
    var reply_id = tweet_obj.in_reply_to_status_id_str;    
    var reply_str = (reply_id != null) ?
        "reply to " + '<a class="who_href" href="#'
            + reply_name + '">'
            + reply_name + '</a>'
        : '';

    var timestamp = Date.parse(tweet_obj.created_at);
    var created_at = new Date();
    created_at.setTime(timestamp);
    var created_at_str = ui.Template.format_time(created_at);
    var created_at_short_str = created_at.toTimeString().split(' ')[0];
    if (created_at.toDateString() != new Date().toDateString()){
        created_at_short_str = created_at.getFullYear() + '-' + (created_at.getMonth()+1) + '-' +  created_at.getDate() + ' ' + created_at_short_str;
    }

    // choose color scheme
    var scheme = 'normal';
    if (tweet_obj.entities) {
        for (var i = 0, l = tweet_obj.entities.user_mentions.length; i < l; i+=1)
        {
            if (tweet_obj.entities.user_mentions[i].screen_name
                == globals.myself.screen_name)
            {
                scheme = 'mention';
            }
        }
    }
    if (tweet_obj.user.screen_name == globals.myself.screen_name) {
        scheme = 'me';
    }
    if (retweet_name != '') {
        retweet_str = "retweeted by " +  '<a class="who_href" href="#'
            + retweet_name + '">'
            + retweet_name + '</a>, ';
    }

    var m = ui.Template.retweeted_by_m;
    m.ID = pagename+'-'+id;
    m.TWEET_ID = id;
    m.RETWEET_ID = retweet_id;
    m.REPLY_ID = reply_id != null? reply_id:'';
    m.SCREEN_NAME = tweet_obj.user.screen_name;
    m.REPLY_NAME = reply_id != null? reply_name: '';
    m.USER_NAME = tweet_obj.user.name;
    m.PROFILE_IMG = tweet_obj.user.profile_image_url;
    m.TEXT = ui.Template.form_text(tweet_obj.text);
    m.SOURCE = tweet_obj.source.replace('href', 'target="_blank" href');
    m.SCHEME = scheme;

    m.IN_REPLY = (reply_id != null && pagename.split('-').length < 2) ? 'block' : 'none';
    m.RETWEETABLE = (tweet_obj.user.protected || scheme == 'me' )? 'false':'true';

    m.REPLY_TEXT = reply_str;
    m.RETWEET_TEXT = retweet_str;
    m.RETWEET_MARK = retweet_name != ''? 'retweet_mark': '';
    m.SHORT_TIMESTAMP = created_at_short_str;
    m.TIMESTAMP = created_at_str;
    m.FAV_CLASS = tweet_obj.favorited? 'faved': '';
    m.DELETABLE = scheme == 'me'? 'true': 'false';
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
    m.TRANS_Retweeted_by = "by";
    m.TRANS_Show_retweeters = "click to show";
    m.TWEET_BASE_URL = conf.current_name.split('@')[1] == 'twitter'?'https://twitter.com/' + tweet_obj.user.screen_name + '/status':'https://identi.ca/notice';

    return ui.Template.render(ui.Template.retweeted_by_t, m);
},

form_search:
function form_search(tweet_obj, pagename) {
    var id = tweet_obj.id_str;
    var source = tweet_obj.source.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    var timestamp = Date.parse(tweet_obj.created_at);
    var created_at = new Date();
    created_at.setTime(timestamp);
    var created_at_str = ui.Template.format_time(created_at);
    var created_at_short_str = created_at.toTimeString().split(' ')[0];
    if (created_at.toDateString() != new Date().toDateString()){
        created_at_short_str = created_at.getFullYear() + '-' + (created_at.getMonth()+1) + '-' +  created_at.getDate() + ' ' + created_at_short_str;
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
    m.SOURCE = source.replace('href', 'target="_blank" href');
    m.SCHEME = scheme;
    m.SHORT_TIMESTAMP = created_at_short_str;
    m.TIMESTAMP = created_at_str;
    m.TWEET_FONT_SIZE = globals.tweet_font_size;
    m.TRANS_via = 'via';
    m.TWEET_BASE_URL = conf.current_name.split('@')[1] == 'twitter'?'https://twitter.com/' + tweet_obj.from_user + '/status':'https://identi.ca/notice';

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

form_view:
function form_view(name, title, cls) {
    var m = ui.Template.view_m;
    m.ID = name + '_tweetview';
    m.NAME = name;
    m.TITLE = title
    m.CLASS = cls;
    if (name == 'home'||name=='mentions'
        ||name=="messages"||name=="search"||name=='retweets') {
        m.CAN_CLOSE = 'none';
    } else {
        m.CAN_CLOSE = 'block';
    }
    return ui.Template.render(ui.Template.view_t, m);
},

form_indicator:
function form_indicator(target, title, icon) {
    var m = ui.Template.indicator_m;
    m.TARGET = target
    m.TITLE = title;
    m.ICON = icon;
    return ui.Template.render(ui.Template.indicator_t, m);
},

form_kismet_rule:
function form_kismet_rule(rule) {
    var m = ui.Template.kismet_rule_m;
    m.NAME = rule.name;
    m.TYPE = rule.type;
    m.METHOD = rule.method;
    m.PATTERN = rule.pattern;
    m.ACTIONS = rule.actions.join(':');
    m.ADDITION = rule.actions.indexOf(3)!=-1?'archive_name="'+rule.archive_name+'"':'archive_name=""';
    m.FIELD = rule.field;
    m.DISABLED = rule.disabled;
    return ui.Template.render(ui.Template.kismet_rule_t, m);
},

fill_vcard:
function fill_vcard(user_obj, vcard_container) {
    var created_at = new Date(Date.parse(user_obj.created_at));
    var now = new Date();
    var differ = Math.floor((now-created_at)/(1000 * 60 * 60 * 24));

    var created_at_str = ui.Template.format_time(created_at);
    
    vcard_container.find('.profile_img_wrapper')
        .attr('style', 'background-image:url('+user_obj.profile_image_url+');');
    vcard_container.find('.screen_name')
        .attr('href', conf.get_current_profile().preferences.base_url + user_obj.screen_name)
        .text(user_obj.screen_name);
    vcard_container.find('.name').text(user_obj.name);
    vcard_container.find('.tweet_cnt').text(user_obj.statuses_count);
    vcard_container.find('.tweet_per_day_cnt').text(
        Math.round(user_obj.statuses_count / differ * 100)/ 100);
    vcard_container.find('.follower_cnt').text(user_obj.followers_count);
    vcard_container.find('.friend_cnt').text(user_obj.friends_count);
    vcard_container.find('.bio').text('').text(user_obj.description);
    vcard_container.find('.location').text('').text(user_obj.location);
    vcard_container.find('.join').text(created_at_str);
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

format_time:
function format_time(datetime) {
    var str = '';
    try {
        str = decodeURIComponent(escape(datetime.toLocaleTimeString())) + ' ' + decodeURIComponent(escape(datetime.toLocaleDateString()));
    } catch (e) {
        str = datetime.toLocaleTimeString() + ' ' + datetime.toLocaleDateString();
    }
    return str;
},

render:
function render(tpl, map) {
    var text = tpl
    for (var k in map) {
        text = text.replace(new RegExp('{%'+k+'%}', 'g'), map[k]);
    }
    return text;
},

}
