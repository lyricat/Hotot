if (typeof ui == 'undefined') var ui = {};
ui.MentionTabs = {

current_filter_name: null,

init:
function init() {
    var btns = new widget.RadioGroup('#mention_radio_group');
    btns.on_clicked = function (btn, event) {
        ui.MentionTabs.current_filter_name = $(btn).attr('href');
        ui.MentionTabs.apply_filter();    
    };
    btns.create();
    ui.MentionTabs.current_filter_name = '#all';
},

get_non_reply_tweets:
function get_non_reply_tweets(tweets) {
    return $($.grep(tweets, function (obj, i) {    
        return $(obj).attr('reply_name') != globals.myself.screen_name; 
    }));
},

get_reply_tweets:
function get_reply_tweets(tweets) {
    return $($.grep(tweets, function (obj, i) {    
        return $(obj).attr('reply_name') == globals.myself.screen_name; 
    }));
},

apply_filter:
function apply_filter() {
    switch (ui.HomeTabs.current_filter_name) {
    case '#all':
        $('#mentions_tweet_block .card:hidden:lt(20)').show();
    break;
    case '#reply':
        ui.MentionTabs.get_non_reply_tweets(
            $('#mentions_tweet_block .card:visible')
        ).hide();
        ui.MentionTabs.get_reply_tweets(
            $('#mentions_tweet_block .card:hidden:lt(20)')
        ).show();
    break;
    default:
    break;
    }
}

};
