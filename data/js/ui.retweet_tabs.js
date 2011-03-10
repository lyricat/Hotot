if (typeof ui == 'undefined') var ui = {};
ui.RetweetTabs = {

current: null,

init:
function init() {
    var btns = new widget.RadioGroup('#retweets_radio_group');
    btns.on_clicked = function (btn, event) {
        // activate another sub page.
        ui.RetweetTabs.current = $(btn).attr('href');
        var pagename = ui.RetweetTabs.current + '_sub_block';
        $('#retweets_tweet_block .tweet_sub_block').not(pagename).hide();
        $(pagename).show();
        ui.Notification.set("Loading Tweets...").show(-1);
        daemon.Updater.update_retweets();
    };
    btns.create();
    ui.RetweetTabs.current = '#retweeted_to_me';
    $(ui.RetweetTabs.current + '_sub_block').show();
},

};
