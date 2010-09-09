if (typeof ui == 'undefined') var ui = {};
ui.RetweetTabs = {

current: null,

init:
function init() {
    $('#retweets_tweet_block .tweet_tabs_btn').click(
    function (event) {
        if (! $(this).hasClass('selected')) {
            // activate another sub page.
            ui.RetweetTabs.current = $(this).attr('href');
            var pagename = ui.RetweetTabs.current + '_sub_block';
            $('.tweet_tabs_btn').not(this).removeClass('selected');
            $(this).addClass('selected');
            $('.tweet_tabs_page').not(pagename).hide();
            $(pagename).show();
            daemon.Updater.update_retweets();
        }
        return false;
    });
    ui.RetweetTabs.current = '#retweeted_to_me';
    $(ui.RetweetTabs.current + '_sub_block').show();
},

};
