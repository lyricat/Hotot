if (typeof ui == 'undefined') var ui = {};
ui.RetweetTabs = {

current: null,

init:
function init() {
    $('.retweet_tabs_btn').click(
    function (event) {
        ui.RetweetTabs.current = $(this).attr('href');
        var pagename = ui.RetweetTabs.current + '_sub_block';
        utility.Console.out(pagename);
        $('.retweet_tabs_btn').not(this).removeClass('selected');
        $(this).addClass('selected');
        $('.retweet_tabs_page').not(pagename).hide();
        $(pagename).show();
        return false;
    });
    $('#btn_retweeted_by_me').click();
},

};
