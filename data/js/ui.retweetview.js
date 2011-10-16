if (typeof ui == 'undefined') var ui = {};
ui.RetweetView = {

current: null,

init:
function init() {
    var btns = new widget.RadioGroup('#retweets_radio_group');
    btns.on_clicked = function (btn, event) {
        // activate another sub page.
        ui.RetweetView.current = $(btn).attr('href');
        var pagename = ui.RetweetView.current + '_sub_block';
        $('#retweets_tweet_block .tweet_sub_block').not(pagename).hide();
        $(pagename).show();
        toast.set("Loading Tweets...").show(-1);
        daemon.update_retweets();
    };
    btns.create();
    ui.RetweetView.current = '#retweeted_to_me';
    $(ui.RetweetView.current + '_sub_block').show();
},

init_view:
function init_view(view) {
    var toggle = view._header.find('.retweets_view_toggle');
    var sub_view_btns = toggle.find('.radio_group_btn');
    sub_view_btns.click(function (event) {
        var pagename = $(this).attr('href').substring(1);
        sub_view_btns.removeClass('selected');
        $(this).addClass('selected');
        ui.RetweetView.switch_sub_view(view, pagename);
    });
},
 
destroy_view:
function destroy_view(view) {
    // unbind
    view._header.find('.radio_group_btn').unbind();
    // remove slide, view and DOM
    ui.Slider.remove(view.name);
},

switch_sub_view:
function switch_sub_view(view, name) {
    switch (name) {
    case 'retweeted_to_me':
        view.former = ui.Template.form_tweet;
        view._load = ui.RetweetView.load_retweeted_to_me;
        view._loadmore = ui.RetweetView.loadmore_retweeted_to_me;
    break;
    case 'retweeted_by_me':
        view.former = ui.Template.form_tweet;
        view._load = ui.RetweetView.load_retweeted_by_me;
        view._loadmore = ui.RetweetView.loadmore_retweeted_bt_me;
    break;
    case 'retweets_of_me':
        view.former = ui.Template.form_retweeted_by;
        view._load = ui.RetweetView.load_retweets_of_me;
        view._loadmore = ui.RetweetView.loadmore_retweets_of_me;
    break;
    default: break;
    }
    view.clear();
    view.load();
},


load_retweeted_to_me:
function load_retweeted_to_me(view, success, fail) {
    lib.twitterapi.get_retweeted_to_me(
        view.since_id , null, conf.vars.items_per_request, success);
},

loadmore_retweeted_to_me:
function loadmore_retweeted_to_me(view, success, fail) {
    lib.twitterapi.get_retweeted_to_me(
        view.since_id , view.max_id, conf.vars.items_per_request, success);
},

load_retweeted_by_me:
function load_retweeted_by_me(view, success, fail) {
    lib.twitterapi.get_retweeted_by_me(
        view.since_id , null, conf.vars.items_per_request, success);
},

loadmore_retweeted_by_me:
function loadmore_retweeted_by_me(view, success, fail) {
    lib.twitterapi.get_retweeted_by_me(
        view.since_id , view.max_id, conf.vars.items_per_request, success);
},

load_retweets_of_me:
function load_retweets_of_me(view, success, fail) {
    lib.twitterapi.get_retweets_of_me(
        view.since_id , null, conf.vars.items_per_request, success);
},

loadmore_retweets_of_me:
function load(view, success, fail) {
    lib.twitterapi.get_retweets_of_me(
        view.since_id , view.max_id, conf.vars.items_per_request, success);
},

};
