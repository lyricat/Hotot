if (typeof ui == 'undefined') var ui = {};
ui.HomeTabs = {

current_filter_name: null,

init:
function init() {
    var btns = new widget.RadioGroup('#home_radio_group');
    btns.on_clicked = function (btn, event) {
        ui.HomeTabs.current_filter_name = $(btn).attr('href');
        ui.HomeTabs.apply_filter();
    };
    btns.create();
    ui.HomeTabs.current_filter_name = '#all';
},

get_non_public_tweets:
function get_non_public_tweets(tweets) {
    return $($.grep(tweets, function (obj, i) {    
        return $(obj).attr('reply_name') != ''; 
    }));
},

get_public_tweets:
function get_public_tweets(tweets) {
    return $($.grep(tweets, function (obj, i) {    
        return $(obj).attr('reply_name') == ''; 
    }));
},

apply_filter:
function apply_filter() {
    switch (ui.HomeTabs.current_filter_name) {
    case '#all':
        $('#home_timeline_tweet_block .card:hidden').show();
    break;
    case '#public':
        ui.HomeTabs.get_non_public_tweets(
            $('#home_timeline_tweet_block .card:visible')
        ).hide();
        ui.HomeTabs.get_public_tweets(
            $('#home_timeline_tweet_block .card:hidden')
        ).show();
    break;
    case '#conversation':
        ui.HomeTabs.get_public_tweets(
            $('#home_timeline_tweet_block .card:visible')
        ).hide();
        ui.HomeTabs.get_non_public_tweets(
            $('#home_timeline_tweet_block .card:hidden')
        ).show();
    break;
    default:
    break;
    }
}
};
