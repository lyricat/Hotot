if (typeof ui == 'undefined') var ui = {};
ui.DMTabs = {

current: null,

init:
function init() {
    var btns = new widget.RadioGroup('#dm_radio_group');
    btns.on_clicked = function (btn, event) {
        ui.DMTabs.current = $(btn).attr('href');
        var page_name = ui.DMTabs.current + '_sub_block';
        $('#direct_messages_tweet_block .tweet_sub_block').not(page_name).hide();
        $(page_name).show();
        ui.Notification.set("Loading Tweets...").show(-1);
        daemon.Updater.update_direct_messages();
    };
    btns.create();
    ui.DMTabs.current = '#direct_messages_inbox';
    $(ui.DMTabs.current + '_sub_block').show();

},

};
