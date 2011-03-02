if (typeof ui == 'undefined') var ui = {};
ui.DMTabs = {

current: null,

init:
function init() {
    $('#direct_messages_tweet_block .tweet_tabs_btn').click(
    function (event) {
        if (! $(this).hasClass('selected')) {
            // activate another sub page.
            ui.DMTabs.current = $(this).attr('href');
            var pagename = ui.DMTabs.current + '_sub_block';
            $('#direct_messages_tweet_block .tweet_tabs_btn').not(this).removeClass('selected');
            $(this).addClass('selected');
            $('#direct_messages_tweet_block .tweet_tabs_page').not(pagename).hide();
            $(pagename).show();
            ui.Notification.set(_("Loading Tweets...")).show(-1);
            daemon.Updater.update_direct_messages();
        }
        return false;
    });
    ui.DMTabs.current = '#direct_messages_inbox';
    $(ui.DMTabs.current + '_sub_block').show();
},

};
