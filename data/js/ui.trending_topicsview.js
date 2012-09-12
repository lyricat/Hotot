if (typeof ui == 'undefined') var ui = {};
ui.TrendingTopicsView = {

woeid: null,
city: null,

init:
function init() {
    var btns = new widget.RadioGroup('#trend_topics_radio_group');
    btns.on_clicked = function (btn, event) {
        // activate another sub page.
        ui.TrendingTopicsView.current = $(btn).attr('href');
        toast.set("Loading Tweets...").show(-1);
    };
    btns.create();
},

init_view:
function init_view(view) {
    var toggle = view._header.find('.trending_topics_view_toggle');
    var sub_view_btns = toggle.find('.radio_group_btn');
    sub_view_btns.click(function (event) {
        var pagename = $(this).attr('href').substring(1);
        sub_view_btns.removeClass('selected');
        $(this).addClass('selected');
        ui.TrendingTopicsView.switch_sub_view(view, pagename);
    });
    if (ui.TrendingTopicsView.city) {
        $('.trending_topics_local').html('Local (' + ui.TrendingTopicsView.city + ')');
    }
},


switch_sub_view:
function switch_sub_view(view, name) {
    switch (name) {
    case 'trending_topics_local':
        view._load = ui.TrendingTopicsView.get_trending_topics_local;
    break;
    case 'trending_topics_worldwide':
        view._load = ui.TrendingTopicsView.get_trending_topics_worldwide;
    break;
    default: break;
    }
    view.clear();
    view.load();
}

};
