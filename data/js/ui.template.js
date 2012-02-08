if (typeof ui == 'undefined') var ui = {};
ui.Template = {

reg_vaild_preceding_chars: '(?:[^-\\/"\':!=a-zA-Z0-9_]|^)',

reg_cn_chars: '[\u4E00-\u9FA5]|[\uEF30-\uFFA0]',

reg_url_path_chars: '[a-zA-Z0-9!\\*\';:=\\+\\$/%#\\[\\]\\?\\-_,~\\(\\)&\\.`@]',

reg_url_proto_chars: '([a-zA-Z]+:\\/\\/|www\\.)',

reg_user_name_chars: '[@＠](\\w+)',

reg_list_name_template: '[@＠](\\w+/[a-z0-9_{%LATIN_CHARS%}{%NONLATIN_CHARS%}]+)',

// from https://si0.twimg.com/a/1310750171/javascripts/phoenix.bundle.js
reg_hash_tag_latin_chars: 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþ\\303\\277',
reg_hash_tag_nonlatin_chars: '\u0400-\u04ff\u0500-\u0527\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\u30a1-\u30fa\uff66-\uff9e\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3400-\u4dbf\u4e00-\u9fff\ua700-\ub73f\ub740-\ub81f\uf800-\ufa1f\u3005',
reg_hash_tag_template: '(^|\\s)[#＃]([a-z0-9_{%LATIN_CHARS%}{%NONLATIN_CHARS%}]*)',

reg_hash_tag: null,

reg_is_rtl: new RegExp('[\u0600-\u06ff]|[\ufe70-\ufeff]|[\ufb50-\ufdff]|[\u0590-\u05ff]'),

tweet_t: 
'<li id="{%ID%}" tweet_id="{%TWEET_ID%}" class="card {%SCHEME%} {%FAV_CLASS%}" type="tweet"  retweet_id="{%RETWEET_ID%}" reply_id="{%REPLY_ID%}" in_thread="{%IN_THREAD%}" reply_name="{%REPLY_NAME%}" screen_name="{%SCREEN_NAME%}" retweetable="{%RETWEETABLE%}" deletable="{%DELETABLE%}">\
    <div class="tweet_color_label" style="background-color:{%COLOR_LABEL%}"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="tweet_fav_indicator"></div>\
    <div class="tweet_retweet_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}\n\n{%DESCRIPTION%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <ul class="tweet_bar">\
        <li>\
        <a class="tweet_bar_btn tweet_reply_btn" title="Reply this tweet" href="#reply" data-i18n-title="reply"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_fav_btn" title="Fav/Un-fav this tweet" href="#fav" data-i18n-title="fav_or_unfav"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_retweet_btn" title="Official retweet/un-retweet this tweet" href="#retweet" data-i18n-title="retweet"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_more_menu_trigger" href="#more"></a>\
        </li>\
    </ul>\
    <div class="card_body">\
        <div class="who {%RETWEET_MARK%}">\
        <a class="who_href" href="#{%SCREEN_NAME%}" title="{%USER_NAME%}\n\n{%DESCRIPTION%}">\
            {%SCREEN_NAME%}\
        </a>\
        </div>\
        <div class="text" alt="{%ALT%}" style="font-size:{%TWEET_FONT_SIZE%}px">{%TEXT%}</div>\
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

trending_topic_t:
'<li id="{%ID%}" class="card" type="trending_topic">\
    <div class="card_body">\
        <a class="hash_href trending_topic" href="{%ID%}">{%ID%}</a>\
    </div>\
    <span class="shape"></span>\
    <span class="shape_mask"></span>\
</li>',

retweeted_by_t: 
'<li id="{%ID%}" tweet_id="{%TWEET_ID%}" class="card {%SCHEME%} {%FAV_CLASS%}" type="tweet"  retweet_id="{%RETWEET_ID%}" reply_id="{%REPLY_ID%}" reply_name="{%REPLY_NAME%}" screen_name="{%SCREEN_NAME%}" retweetable="{%RETWEETABLE%}" deletable="{%DELETABLE%}">\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="tweet_fav_indicator"></div>\
    <div class="tweet_retweet_indicator"></div>\
    <div class="profile_img_wrapper" title="{%USER_NAME%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <ul class="tweet_bar">\
        <li>\
        <a class="tweet_bar_btn tweet_reply_btn" title="Reply this tweet" href="#reply" data-i18n-title="reply"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_fav_btn" title="Fav/Un-fav this tweet" href="#fav" data-i18n-title="fav_or_unfav"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_retweet_btn" title="Official retweet/un-retweet this tweet" href="#retweet" data-i18n-title="retweet"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_more_menu_trigger" href="#more"></a>\
        </li>\
    </ul>\
    <div class="card_body">\
        <div class="who {%RETWEET_MARK%}">\
        <a class="who_href" href="#{%SCREEN_NAME%}" title="{%USER_NAME%}">\
            {%SCREEN_NAME%}\
        </a>\
        </div>\
        <div class="text" alt="{%ALT%}" style="font-size:{%TWEET_FONT_SIZE%}px">{%TEXT%}</div>\
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
                {%TRANS_Retweeted_by%}: <a class="show" href="javascript:void(0)" title="{%TRANS_Click_to_show_retweeters%}"  tweet_id="{%TWEET_ID%}">{%TRANS_Show_retweeters%}</a>\
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
    <div class="profile_img_wrapper" title="{%USER_NAME%}\n\n{%DESCRIPTION%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <ul class="tweet_bar">\
        <li>\
        <a class="tweet_bar_btn tweet_dm_reply_btn" title="Reply them" href="#reply_dm" data-i18n-title="reply"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_dm_delete_btn" title="Delete" href="#delete" data-i18n-title="delete"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_more_menu_trigger" href="#more"></a>\
        </li>\
    </ul>\
    <div class="card_body">\
        <div class="who">\
        <a class="who_href" href="#{%SCREEN_NAME%}" title="{%USER_NAME%}\n\n{%DESCRIPTION%}">\
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
    <ul class="tweet_bar">\
        <li>\
        <a class="tweet_bar_btn tweet_reply_btn" title="Reply this tweet" href="#reply" data-i18n-title="reply"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_fav_btn" title="Fav/Un-fav this tweet" href="#fav" data-i18n-title="fav_or_unfav"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_retweet_btn" title="Official retweet/un-retweet this tweet" href="#retweet" data-i18n-title="retweet"></a>\
        </li><li>\
        <a class="tweet_bar_btn tweet_more_menu_trigger" href="#more"></a>\
        </li>\
    </ul>\
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
    <ul class="tweet_bar">\
        <li>\
        <a class="tweet_bar_btn follow_btn" title="Follow them" href="#follow" data-i18n-title="follow"></a>\
        </li><li>\
        <a class="tweet_bar_btn unfollow_btn" title="Unfollow them" href="#unfollow" data-i18n-title="unfollow"></a>\
        </li>\
    </ul>\
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
    <a target="_blank" class="profile_img_wrapper"></a>\
    <div class="vcard_body">\
        <center>\
        <ul class="people_vcard_radio_group radio_group"> \
            <li><a class="radio_group_btn selected" href="#people_vcard_info_page">{%TRANS_info%}</a> \
            </li><li><a class="radio_group_btn" href="#people_vcard_stat_page">{%TRANS_stat%}</a> \
            </li></ul>\
        </center>\
        <div class="vcard_tabs_pages">\
        <table class="people_vcard_info_page vcard_tabs_page radio_group_page" border="0" cellpadding="0" cellspacing="0"> \
            <tr><td>{%TRANS_name%}: </td><td> \
                <a class="screen_name" target="_blank" href="#"></a> \
                (<span class="name"></span>) </td> \
            </tr> \
            <tr><td>{%TRANS_bio%}: </td> \
                <td><span class="bio"></span></td> \
            </tr> \
            <tr><td>{%TRANS_web%}: </td> \
                <td><a class="web" target="_blank" href="#" class="link"></a></td> \
            </tr> \
            <tr><td>{%TRANS_location%}: </td> \
                <td><span class="location"></span></td> \
            </tr> \
        </table> \
        <table class="people_vcard_stat_page vcard_tabs_page radio_group_page"> \
            <tr><td>{%TRANS_join%}: </td> \
                <td><span class="join"></span></td> \
            </tr> \
            <tr><td>{%TRANS_tweet_cnt%}: </td> \
                <td><span class="tweet_cnt"></span> \
                (<span class="tweet_per_day_cnt"></span> per day)</td> \
            </tr> \
            <tr><td>{%TRANS_follower_cnt%}: </td> \
                <td><span class="follower_cnt"></span></td> \
            </tr> \
            <tr><td>{%TRANS_friend_cnt%}: </td> \
                <td><span class="friend_cnt"></span></td> \
            </tr> \
            <tr><td>{%TRANS_listed_cnt%}: </td> \
                <td><span class="listed_cnt"></span></td> \
            </tr> \
            <tr><td>{%TRANS_relation%}: </td> \
                <td><span class="relation"></span></td> \
            </tr> \
        </table> \
        </div><!-- vcard tabs pages --> \
    </div> <!-- vcard body --> \
    <div class="vcard_ctrl"> \
        <ul class="vcard_action_btns"> \
        <li><a class="vcard_follow button" \
                href="javascript:void(0);" >{%TRANS_follow%}</a> \
        </li><li> \
            <a class="vcard_edit button" \
                href="javascript:void(0);" style="display:none;">{%TRANS_edit%}</a>\
        </li><li class="people_action_more_trigger"> \
            <a class="vcard_more button" \
                href="javascript:void(0);">{%TRANS_more_actions%} &#x25BE;</a> \
            <ul class="people_action_more_memu hotot_menu">\
                <li><a class="mention_menu_item" \
                    title="Mention them"\
                    href="javascript:void(0);">{%TRANS_mention_them%}</a>\
                </li><li><a class="message_menu_item" \
                    title="Send Message to them"\
                    href="javascript:void(0);">{%TRANS_message_them%}</a>\
                </li><li style="display:none;"><a class="add_to_list_menu_item" \
                    title="Add them to a list"\
                    href="javascript:void(0);">{%TRANS_add_to_list%}</a>\
                </li><li class="separator"><span></span>\
                </li><li><a class="block_menu_item" \
                    title="Block"\
                    href="javascript:void(0);">{%TRANS_block%}</a>\
                </li><li><a class="unblock_menu_item"\
                    href="javascript:void(0);" \
                    title="Unblock">{%TRANS_unblock%}</a>\
                </li><li><a class="report_spam_menu_item" \
                    href="javascript:void(0);" \
                    title="Report Spam">{%TRANS_report_spam%}</a>\
                </li>\
            </ul>\
        </li> \
        </ul> \
    </div><!-- #people_vcard_ctrl --> \
</div> <!-- vcard --> \
<div class="people_view_toggle"> \
    <ol class="people_view_toggle_btns radio_group"> \
        <li><a class="people_view_tweet_btn radio_group_btn selected" href="#tweet">{%TRANS_tweets%}</a> \
        </li><li> \
        <a class="people_view_fav_btn radio_group_btn" href="#fav">{%TRANS_favs%}</a> \
        </li><li> \
        <a class="people_view_follower_btn radio_group_btn" href="#follower">{%TRANS_followers%}</a> \
        </li><li> \
        <a class="people_view_friend_btn radio_group_btn" href="#friend">{%TRANS_friends%}</a> \
        </li><li class="people_view_list_trigger"> \
        <a class="people_view_list_btn radio_group_btn" href="#list">{%TRANS_lists%} &#x25BE;\
        </a> \
        <ul class="lists_memu hotot_menu">\
            <li><a class="user_lists_menu_item" \
                title="Lists of Them"\
                href="javascript:void(0);">{%TRANS_lists_of_them%}</a>\
            </li><li><a class="listed_lists_menu_item"\
                href="javascript:void(0);" \
                title="All Lists following Them">{%TRANS_lists_following_them%}</a>\
            </li><li><a class="create_list_menu_item" \
                href="javascript:void(0);" \
                title="Create A List">{%TRANS_create_a_list%}</a>\
            </li>\
        </ul>\
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

list_t:
'<li id="{%LIST_ID%}" class="list_card card normal" type="list" following={%FOLLOWING%} screen_name={%SCREEN_NAME%} slug={%SLUG%}>\
    <div class="tweet_active_indicator"></div>\
    <div class="tweet_selected_indicator"></div>\
    <div class="profile_img_wrapper" title="@{%USER_NAME%}/{%SLUG%}" style="background-image: url({%PROFILE_IMG%})">\
    </div>\
    <ul class="tweet_bar">\
        <li>\
        <a class="tweet_bar_btn follow_btn" title="Follow them" href="#follow" data-i18n-title="follow"></a>\
        </li><li>\
        <a class="tweet_bar_btn unfollow_btn" title="Unfollow them" href="#unfollow" data-i18n-title="unfollow"></a>\
        </li>\
    </ul>\
    <div class="card_body">\
        <div id="{%USER_ID%}" class="who">\
        <a class="list_href" href="#{%SCREEN_NAME%}/{%SLUG%}" title="{%USER_NAME%}/{%SLUG%}">\
            @{%SCREEN_NAME%}/{%SLUG%}\
        </a>\
        </div>\
        <div class="text" style="font-style:italic font-size:{%TWEET_FONT_SIZE%}px">{%DESCRIPTION%}</div>\
    </div>\
    <span class="shape"></span>\
    <span class="shape_mask"></span>\
</li>',

list_vcard_t:
'<div class="header_frame"><div class="list_vcard vcard">\
    <a target="_blank" class="profile_img_wrapper"></a>\
    <div class="vcard_body">\
        <div class="vcard_tabs_pages">\
        <table border="0" cellpadding="0" cellspacing="0" class="vcard_tabs_page" style="display:block;"> \
            <tr><td>Name: </td><td> \
                <a class="name" target="_blank" href="#"></a></td> \
            </tr> \
            <tr><td>Owner: </td> \
                <td><a class="owner" target="_blank" href="#"></a></td> \
            </tr> \
            <tr><td>Description: </td> \
                <td><span class="description"></span></td> \
            </tr> \
        </table> \
        </div>\
    </div> <!-- vcard body --> \
    <div class="vcard_ctrl"> \
        <ul class="vcard_action_btns"> \
        <li><a class="vcard_follow button" \
                href="javascript:void(0);" >Follow</a> \
        </li><li> \
            <a class="vcard_delete button" \
                href="javascript:void(0);">Delete</a> \
        </li><li> \
            <a class="vcard_edit button" \
                href="javascript:void(0);" style="display:none;">Edit</a>\
        </li> \
        </ul> \
    </div><!-- #list_vcard_ctrl --> \
</div> <!-- vcard --> \
<div class="list_view_toggle"> \
    <ol class="list_view_toggle_btns radio_group"> \
        <li><a class="list_view_tweet_btn radio_group_btn selected" href="#tweet">Tweets</a> \
        </li><li> \
        <a class="list_view_follower_btn radio_group_btn" href="#follower">Followers</a> \
        </li><li> \
        <a class="list_view_following_btn radio_group_btn" href="#following">Following</a> \
        </li> \
    </ol> \
</div> \
<div class="list_lock_hint"> \
    <h1>Them has protected his/her list.</span></h1> \
    <p>Only the owner can access this list.</p> \
</div></div>',


search_header_t: 
'<div class="header_frame"> \
    <div class="search_box"> \
    <input class="search_entry entry" type="text" placeholder="Type and press enter to search."/> \
    <a href="#" class="search_entry_clear_btn"></a>\
    <div class="search_people_result"> \
        <span>One user matched: </span> <span class="search_people_inner"></span>\
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

trending_topics_header_t:
'<div class="header_frame"><div class="trending_topics_view_toggle"> \
    <ol class="trending_topics_view_toggle_btns radio_group">\
        <li><a class="trending_topics_local radio_group_btn selected" \
            href="#trending_topics_local">Local</a>\
        </li><li> \
            <a class="trending_topics_worldwide radio_group_btn"\
            href="#trending_topics_worldwide">Worldwide</a>\
        </li>\
    </ol> \
</div></div>',

view_t:
'<div id="{%ID%}" \
    name="{%NAME%}" class="listview {%CLASS%} {%ROLE%}"> \
    <div class="listview_header"><div class="header_content">{%HEADER%}</div></div> \
    <ul class="listview_body"></ul> \
    <div class="listview_footer"> \
        <div class="load_more_info"><img src="image/ani_loading_bar_gray.gif"/></div> \
    </div> \
</div>',

indicator_t:
    '<div class="{%STICK%} {%ROLE%}" name="{%TARGET%}"><a class="indicator_btn" href="#{%TARGET%}" title="{%TITLE%}"><img class="icon"/><span class="icon" style="background-image:url({%ICON%})"></span></a><span class="shape"></span></div>',

kismet_rule_t:
'<li><a class="kismet_rule" name="{%NAME%}" type="{%TYPE%}" method="{%METHOD%}"\
    disabled="{%DISABLED%}" field="{%FIELD%}" pattern="{%PATTERN%}"     \
    actions="{%ACTIONS%}" {%ADDITION%} href="#">{%NAME%}</a></li>',

status_draft_t:
'<li mode="{%MODE%}" reply_to_id="{%REPLY_TO_ID%}" reply_text="{%REPLY_TEXT%}" recipient="{%RECIPIENT%}"><a class="text">{%TEXT%}</a><a class="btn_draft_clear" href="#"></a></li>',

preview_link_reg: {
'img.ly': {
    reg: new RegExp('http:\\/\\/img.ly\\/([a-zA-Z0-9_\\-]+)','g'),
    base: 'http://img.ly/show/thumb/'
},
'twitpic.com': {
    reg: new RegExp('http:\\/\\/twitpic.com\\/([a-zA-Z0-9_\\-]+)','g'),
    base: 'http://twitpic.com/show/thumb/'
},
'twitgoo.com': {
    reg: new RegExp('http:\\/\\/twitgoo.com\\/([a-zA-Z0-9_\\-]+)','g'),
    base: 'http://twitgoo.com/show/thumb/'
},
'yfrog.com': {
    reg: new RegExp('http:\\/\\/yfrog.com\\/([a-zA-Z0-9_\\-]+)','g'),
    tail: '.th.jpg'
},
'moby.to': {
    reg: new RegExp('http:\\/\\/moby.to\\/([a-zA-Z0-9_\\-]+)','g'),
    tail: ':thumbnail'
},
'instagr.am': {
    reg: new RegExp('http:\\/\\/instagr.am\\/p\\/([a-zA-Z0-9_\\-]+)\\/?','g'),
    tail: 'media?size=m'
},
'plixi.com': {
    reg: new RegExp('http:\\/\\/plixi.com\\/p\\/([a-zA-Z0-9_\\-]+)','g'),
    base: 'http://api.plixi.com/api/tpapi.svc/imagefromurl?size=thumbnail&url='
},
'picplz.com': {
    reg: new RegExp('http:\\/\\/picplz.com\\/([a-zA-Z0-9_\\-]+)','g'), 
    tail: '/thumb/' 
},
'raw': {
    reg: new RegExp('[a-zA-Z0-9]+:\\/\\/.+\\/.+\\.(jpg|png|gif)', 'gi')
},

'youtube.com': {
    reg: new RegExp('href="(http:\\/\\/(www.)?youtube.com\\/watch\\?v\\=([A-Za-z0-9_\\-]+))','g'),
    base: 'http://img.youtube.com/vi/',
    tail: '/default.jpg',
},

},

init:
function init() {
    ui.Template.reg_url = ''//ui.Template.reg_vaild_preceding_chars
    + '('
        + ui.Template.reg_url_proto_chars 
        + ui.Template.reg_url_path_chars
    + '+)';

    ui.Template.reg_user = new RegExp('(^|\\s|"|“|'
            + ui.Template.reg_cn_chars + ')'
        + ui.Template.reg_user_name_chars, 'g');

    ui.Template.reg_list = new RegExp('(^|\\s|'
            + ui.Template.reg_cn_chars + ')'
        + ui.Template.reg_list_name_template
            .replace(/{%LATIN_CHARS%}/g, ui.Template.reg_hash_tag_latin_chars)
            .replace(/{%NONLATIN_CHARS%}/g, ui.Template.reg_hash_tag_nonlatin_chars) 
    , 'ig');

    ui.Template.reg_link = new RegExp(ui.Template.reg_url);

    ui.Template.reg_link_g = new RegExp(ui.Template.reg_url, 'g');
        
    ui.Template.reg_hash_tag = new RegExp(ui.Template.reg_hash_tag_template
        .replace(new RegExp('{%LATIN_CHARS%}', 'g'), ui.Template.reg_hash_tag_latin_chars)
        .replace(new RegExp('{%NONLATIN_CHARS%}', 'g'), ui.Template.reg_hash_tag_nonlatin_chars)
    , 'ig');

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
        , TWEET_BASE_URL: '', IN_THREAD: ''
        , COLOR_LABEL: ''
    };

    ui.Template.trending_topic_m = {
        ID:''
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
        , TRANS_Click_to_show_retweeters:''
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

    ui.Template.list_m = {
          LIST_ID:'', SCREEN_NAME:'', SLUG:'', NAME:'', MODE:''
        , DESCRIPTION:'', PROFILE_IMG:'', FOLLOWING:'', TWEET_FONT_SIZE:''
    };

    ui.Template.view_m = {
        ID:'', CLASS:'tweetview', NAME: '', CAN_CLOSE: '', ROLE: ''
    };

    ui.Template.indicator_m = {
        TARGET: '', TITLE: '', ICON: '', ROLE: ''
    };

    ui.Template.kismet_rule_m = {
          TYPE:'', DISABLED:'', FIELD:'', PATTERN:''
        , METHOD:'', ACTIONS: '', ADDITION: '', NAME: ''
    };

    ui.Template.status_draft_m = {
          MODE:'', TEXT:'', REPLY_TO_ID: '', REPLY_TEXT: ''
        , RECIPIENT: ''
    };

    ui.Template.people_vcard_m = {
          TRANS_info: _('info'), TRANS_stat: _('stat')
        , TRANS_name: _('name'), TRANS_bio: _('bio')
        , TRANS_web: _('web'), TRANS_location: _('location')
        , TRANS_join: _('join'), TRANS_tweet_cnt: _('tweet_cnt')
        , TRANS_tweet_cnt: _('tweet_cnt')
        , TRANS_follower_cnt: _('follower_cnt')
        , TRANS_friend_cnt: _('friend_cnt')
        , TRANS_listed_cnt: _('listed_cnt')
        , TRANS_relation: _('relation')
        , TRANS_edit: _('edit')
        , TRANS_follow: _('follow'), TRANS_more_actions: _('more_actions')
        , TRANS_mention_them: _('mention_them')
        , TRANS_message_them: _('send_message_to_them')
        , TRANS_add_to_list: _('add_to_list')
        , TRANS_block: _('block')
        , TRANS_unblock: _('unblock')
        , TRANS_report_spam: _('report_spam')
        , TRANS_tweets: _('tweets'), TRANS_favs: _('favs')
        , TRANS_followers: _('followers'), TRANS_friends: _('friends')
        , TRANS_lists: _('lists'), TRANS_lists_of_them: _('lists_of_them')
        , TRANS_lists_following_them: _('lists_following_them')
        , TRANS_create_a_list: _('create_a_list')
    }

    ui.Template.people_vcard_t = ui.Template.render(ui.Template.people_vcard_t, ui.Template.people_vcard_m);

},

form_dm:
function form_dm(dm_obj, pagename) {
    var timestamp = Date.parse(dm_obj.created_at);
    var created_at = new Date();
    created_at.setTime(timestamp);
    var created_at_str = ui.Template.format_time(created_at);
    var text = ui.Template.form_text(dm_obj);

    var m = ui.Template.message_m;
    m.ID = pagename + '-' + dm_obj.id_str;
    m.TWEET_ID = dm_obj.id_str;
    m.SCREEN_NAME = dm_obj.sender.screen_name;
    m.USER_NAME = dm_obj.sender.name;
    m.DESCRIPTION = dm_obj.sender.description;
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
    var reply_id = tweet_obj.hasOwnProperty('in_reply_to_status_id_str')
            ? tweet_obj.in_reply_to_status_id_str:tweet_obj.in_reply_to_status_id;    
    var reply_str = (reply_id != null) ?
        _('reply_to') + ' <a class="who_href" href="#'
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
    if (tweet_obj.entities && tweet_obj.entities.user_mentions) {
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
        retweet_str = _('retweeted_by') +  ' <a class="who_href" href="#'
            + retweet_name + '">'
            + retweet_name + '</a>, ';
    }

    var alt_text = tweet_obj.text;
    if (tweet_obj.entities && tweet_obj.entities.urls) {
        var urls = null;
        if (tweet_obj.entities.media) {
            urls = tweet_obj.entities.urls.concat(tweet_obj.entities.media);
        } else {
            urls = tweet_obj.entities.urls;
        }
        for (var i = 0, l = urls.length; i < l; i += 1) {
            var url = urls[i];
            if (url.url && url.expanded_url) {
              tweet_obj.text = tweet_obj.text.replace(url.url, url.expanded_url);
            }
        }
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
    m.DESCRIPTION = tweet_obj.user.description;
    m.PROFILE_IMG = tweet_obj.user.profile_image_url;
    m.TEXT = ui.Template.form_text(tweet_obj);
    m.ALT = ui.Template.convert_chars(alt_text);
    m.SOURCE = tweet_obj.source.replace('href', 'target="_blank" href');
    m.SCHEME = scheme;
    
    m.IN_REPLY = (reply_id != null && pagename.split('-').length < 2) ? 'block' : 'none';
    m.RETWEETABLE = (tweet_obj.user.protected || scheme == 'me' )? 'false':'true';
    
    m.COLOR_LABEL = kismet.get_user_color(tweet_obj.user.screen_name);

    m.REPLY_TEXT = reply_str;
    m.RETWEET_TEXT = retweet_str;
    m.RETWEET_MARK = retweet_name != ''? 'retweet_mark': '';
    m.SHORT_TIMESTAMP = created_at_short_str;
    m.TIMESTAMP = created_at_str;
    m.FAV_CLASS = tweet_obj.favorited? 'faved': '';
    m.DELETABLE = scheme == 'me'? 'true': 'false';
    m.TWEET_FONT_SIZE = globals.tweet_font_size;
    m.STATUS_INDICATOR = ui.Template.form_status_indicators(tweet_obj);
    m.TRANS_Delete = _('delete');
    m.TRANS_Delete_this_tweet = _('delete_this_tweet');
    m.TRANS_Loading = _('loading_dots');
    m.TRANS_Official_retweet_this_tweet = _('official_retweet_this_tweet');
    m.TRANS_Reply_All = _('reply_all');
    m.TRANS_Reply_this_tweet = _('reply_this_tweet');
    m.TRANS_RT_this_tweet = _('rt_this_tweet');
    m.TRANS_Send_Message = _('send_message');
    m.TRANS_Send_Message_to_them = _('send_message_to_them');
    m.TRANS_via = _('via');
    m.TRANS_View_more_conversation = _('view_more_conversation');
    m.TWEET_BASE_URL = conf.current_name.split('@')[1] == 'twitter'?'https://twitter.com/' + tweet_obj.user.screen_name + '/status':'https://identi.ca/notice';
    var msg = ui.Template.render(ui.Template.tweet_t, m);

    if (tweet_obj.entities && tweet_obj.entities.user_mentions) {
        for (var i = 0, l = tweet_obj.entities.user_mentions.length; i < l; i+=1)
        {
            var screen_name = tweet_obj.entities.user_mentions[i].screen_name;
            var name = tweet_obj.entities.user_mentions[i].name.replace(/"/g, '&quot;');
            var reg_ulink = new RegExp('>(' + screen_name + ')<', 'ig');
            msg = msg.replace(reg_ulink, ' title="' + name + '">$1<')
        }
    }

    return msg;
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
    var reply_id = tweet_obj.hasOwnProperty('in_reply_to_status_id_str')
            ? tweet_obj.in_reply_to_status_id_str:tweet_obj.in_reply_to_status_id;    
    var reply_str = (reply_id != null) ?
        _('reply to') + ' <a class="who_href" href="#'
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
    if (tweet_obj.entities && tweet_obj.entities.user_mentions) {
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
        retweet_str = _('retweeted_by') +  ' <a class="who_href" href="#'
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
    m.TEXT = ui.Template.form_text(tweet_obj);
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
    m.TRANS_Delete = _('delete');
    m.TRANS_Delete_this_tweet = _('delete_this_tweet');
    m.TRANS_Loading = _('loading_dots');
    m.TRANS_Official_retweet_this_tweet = _('official_retweet_this_tweet');
    m.TRANS_Reply_All = _('reply_All');
    m.TRANS_Reply_this_tweet = _('reply_this_tweet');
    m.TRANS_RT_this_tweet = _('rt_this_tweet');
    m.TRANS_Send_Message = _('send_message');
    m.TRANS_Send_Message_to_them = _('send_message_to_them');
    m.TRANS_via = _('via');
    m.TRANS_View_more_conversation = _('view_more_conversation');
    m.TRANS_Retweeted_by = _('retweeted_by');
    m.TRANS_Show_retweeters = _('click_to_show');
    m.TRANS_Click_to_show_retweeters = _('click_to_show_retweeters');
    m.TWEET_BASE_URL = conf.current_name.split('@')[1] == 'twitter'?'https://twitter.com/' + tweet_obj.user.screen_name + '/status':'https://identi.ca/notice';

    return ui.Template.render(ui.Template.retweeted_by_t, m);
},

form_search:
function form_search(tweet_obj, pagename) {
    if (tweet_obj.user != undefined) {
        return ui.Template.form_tweet(tweet_obj, pagename);
    }
    var id = tweet_obj.id_str;
    var source = tweet_obj.source.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '');
    var timestamp = Date.parse(tweet_obj.created_at);
    var created_at = new Date();
    created_at.setTime(timestamp);
    var created_at_str = ui.Template.format_time(created_at);
    var created_at_short_str = created_at.toTimeString().split(' ')[0];
    if (created_at.toDateString() != new Date().toDateString()){
        created_at_short_str = created_at.getFullYear() + '-' + (created_at.getMonth()+1) + '-' +  created_at.getDate() + ' ' + created_at_short_str;
    }
    var text = ui.Template.form_text(tweet_obj);
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
    m.TRANS_via = _('via');
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

form_list:
function form_people(list_obj, pagename) {
    var m = ui.Template.list_m;
    m.LIST_ID = pagename + '-' + list_obj.id_str;
    m.SCREEN_NAME = list_obj.user.screen_name;
    m.SLUG = list_obj.slug;
    m.NAME = list_obj.name;
    m.MODE = list_obj.mode;
    m.DESCRIPTION = list_obj.description;
    m.PROFILE_IMG = list_obj.user.profile_image_url;
    m.FOLLOWING = list_obj.following;
    m.TWEET_FONT_SIZE = globals.tweet_font_size;
    return ui.Template.render(ui.Template.list_t, m);
},

form_view:
function form_view(name, title, cls) {
    var m = ui.Template.view_m;
    m.ID = name + '_tweetview';
    m.NAME = name;
    m.CLASS = cls;
    if (name == 'home') {
        m.CAN_CLOSE = 'none';
    } else {
        m.CAN_CLOSE = 'block';
    }
    if (ui.Slider.system_views.hasOwnProperty(name)) {
        m.ROLE = 'system_view';
    } else {
        m.ROLE = 'custom_view';
    }
    return ui.Template.render(ui.Template.view_t, m);
},

form_indicator:
function form_indicator(target, title, icon) {
    var m = ui.Template.indicator_m;
    m.TARGET = target
    m.TITLE = title;
    m.ICON = icon;
    if (ui.Slider.system_views.hasOwnProperty(target)) {
        m.ROLE = 'system_view';
    } else {
        m.ROLE = 'custom_view';
    }
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

form_status_draft:
function form_status_draft(draft) {
    var m = ui.Template.status_draft_m;
    m.MODE = draft.mode;
    m.TEXT = draft.text;
    if (m.MODE == ui.StatusBox.MODE_REPLY) {
        m.REPLY_TO_ID = draft.reply_to_id;
        m.REPLY_TEXT = draft.reply_text;
    } else if (m.MODE == ui.StatusBox.MODE_DM) {
        m.RECIPIENT = draft.recipient;
    } else if (m.MODE == ui.StatusBox.MODE_IMG) {
        
    }
    return ui.Template.render(ui.Template.status_draft_t, m);
},

fill_people_vcard:
function fill_people_vcard(user_obj, vcard_container) {
    var created_at = new Date(Date.parse(user_obj.created_at));
    var now = new Date();
    var differ = Math.floor((now-created_at)/(1000 * 60 * 60 * 24));

    var created_at_str = ui.Template.format_time(created_at);
    
    vcard_container.find('.profile_img_wrapper')
        .attr('href', user_obj.profile_image_url.replace(/_normal/, ''))
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
    vcard_container.find('.listed_cnt').text(user_obj.listed_count);
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

fill_list_vcard:
function fill_list_vcard(view) {
    var vcard_container = view._header;
    vcard_container.find('.profile_img_wrapper')
        .attr('style', 'background-image:url('
            + lib.twitterapi.get_user_profile_image(view.screen_name, 'normal') + ');');
    vcard_container.find('.name')
        .attr('href', conf.get_current_profile().preferences.base_url + view.screen_name + '/' + view.slug)
        .text(view.slug);
    vcard_container.find('.owner')
        .attr('href', conf.get_current_profile().preferences.base_url + view.screen_name)
        .text(view.screen_name);
    vcard_container.find('.description').text('');
},

convert_chars:
function convert_chars(text) {
    text = text.replace(/"/g, '&#34;');
    text = text.replace(/'/g, '&#39;');
    text = text.replace(/\$/g, '&#36;');
    return text;
},

form_text:
function form_text(tweet) {
    var text = ui.Template.convert_chars(tweet.text);
    text = text.replace(ui.Template.reg_link_g, ' <a href="$1" target="_blank">$1</a>');
    text = text.replace(/href="www/g, 'href="http://www');
    text = text.replace(ui.Template.reg_list
        , '$1@<a class="list_href" href="#$2">$2</a>');
    text = text.replace(ui.Template.reg_user
        , '$1@<a class="who_href" href="#$2">$2</a>');
    text = text.replace(ui.Template.reg_hash_tag
        , '$1<a class="hash_href" href="#$2">#$2</a>');
    text = text.replace(/[\r\n]\s+[\r\n]/g, '\n\n');
    text = text.replace(/\n/g, '<br/>');
    if (ui.Template.reg_is_rtl.test(text)) {
        text = '<div align="right" dir="rtl">' + text + '</div>';
    }
    if (conf.get_current_profile().preferences.use_media_preview) {
        text += ui.Template.form_preview(tweet);
    }
    return text;
},

form_media:
function form_media(href, src) {
    return '<a href="'+href+'" target="_blank"><img src="'+ src +'" /></a>'
},

form_preview:
function form_preview(tweet) {
    var html_arr = [];
    var link_reg = ui.Template.preview_link_reg;
    for (var pvd_name in link_reg) {
        var match = link_reg[pvd_name].reg.exec(tweet.text);
        while (match != null) {
            switch (pvd_name) {
            case 'img.ly':
            case 'twitpic.com':  
            case 'twitgoo.com':
                html_arr.push(
                    ui.Template.form_media(
                        match[0], link_reg[pvd_name].base + match[1]));
            break;
            case 'yfrog.com':
            case 'moby.to':
            case 'instagr.am':
            case 'picplz.com':
                html_arr.push(
                    ui.Template.form_media(
                        match[0], match[0] + link_reg[pvd_name].tail));
            break;
            case 'plixi.com':
                html_arr.push(
                    ui.Template.form_media(
                        match[0], link_reg[pvd_name].base +match[0]));
            break;
            case 'raw':
                html_arr.push(
                    ui.Template.form_media(
                        match[0], match[0]));
            break;
            case 'youtube.com':
                html_arr.push(
                    ui.Template.form_media(
                        match[0], link_reg[pvd_name].base + match[2] + link_reg[pvd_name].tail));
            break;
            }
            match = link_reg[pvd_name].reg.exec(tweet.text);
        }
    }
    // twitter official picture service
    if (tweet.entities && tweet.entities.media) {
        for (var i = 0; i < tweet.entities.media.length; i += 1) {
            var media = tweet.entities.media[i];
            if (media.expanded_url && media.media_url) {
                html_arr.push(
                    ui.Template.form_media(
                        tweet.entities.media[i].expanded_url,
                        tweet.entities.media[i].media_url + ':thumb'
                        ));
            }
        }
    }
    if (html_arr.length != 0) {
        return '<p class="media_preview">'+ html_arr.join('')+'</p>';
    }
    return '';
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
