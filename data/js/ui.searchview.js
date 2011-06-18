if (typeof ui == 'undefined') var ui = {};
ui.SearchView = {
init:
function init() {
},

init_search_view:
function init_search_view(view) {
    var search_btn = view._header.find('.search_btn'); 
    var search_entry = view._header.find('.search_entry');
    search_btn.click(function () {
        ui.SearchView.do_search(view, search_entry.val());    
    });
    search_entry.keypress(function (ev) {
        if (ev.keyCode == 13) {
            ui.SearchView.do_search(view, search_entry.val());    
        }
    });
    var toggle = view._header.find('.search_view_toggle');
    var sub_view_btns = toggle.find('.radio_group_btn');
    sub_view_btns.click(function (event) {
        var pagename = $(this).attr('href').substring(1);
        sub_view_btns.removeClass('selected');
        $(this).addClass('selected');
        ui.SearchView.switch_sub_view(view, pagename);
    });},
    
destroy_people_view:
function destroy_people_view(view) {
    // unbind
    view._header.find('.search_btn, .search_entry').unbind();
    // remove slide, view and DOM
    ui.Slider.remove(view.name);
},

switch_sub_view:
function switch_sub_view(view, name) {
    switch (name) {
    case 'tweet':
        view.former = ui.Template.form_search;
        view._load = ui.SearchView.load_tweet
        view._loadmore = ui.SearchView.loadmore_tweet;
        view._load_success = ui.SearchView.load_tweet_success;
        view._loadmore_success = ui.SearchView.loadmore_tweet_success;
    break;
    case 'people':
        view.former = ui.Template.form_people;
        view._load = ui.SearchView.load_people;
        view._loadmore = ui.SearchView.loadmore_people;
        view._load_success = ui.SearchView.load_people_success;
        view._loadmore_success = ui.SearchView.loadmore_people_success;
    break;
    default: break;
    }
    var search_entry = view._header.find('.search_entry');
    ui.SearchView.do_search(view, search_entry.val());    
},

load_tweet:
function load_tweet(view, success, fail) {
    lib.twitterapi.search(view.query, 1, success);   
    lib.twitterapi.show_user(view.query,
    function (user) {
        view._header.find('.search_people_result').show();
        view._header.find('.search_people_inner').html(
            '<a href=\'javascript:open_people("'+user.screen_name+'")\'>'+user.screen_name+'</a>'
        );
    }, function (xhr, textStatus, errorThrown) {
        view._header.find('.search_people_result').show();
    });
},

loadmore_tweet:
function loadmore_tweet(view, success, fail) {
    lib.twitterapi.search(view.query, view.page, success);   
},

load_people:
function load_people(view, success, fail) {
    lib.twitterapi.search_user(view.query, 1, success, fail);   
},

loadmore_people:
function loadmore_people(view, success, fail) {
    lib.twitterapi.search_user(view.query, view.page, success, fail);   
},

load_tweet_success:
function load_tweet_success(view, json) {
    var tweets = [];
    if (json.constructor == Object && typeof json.results != 'undefined') {
        tweets = json.results;
    }
    ui.Slider.set_unread(view.name);
    if (tweets.length == 0) {
        view._header.find('.search_no_result_hint').show();
        view._header.find('.keywords').text(decodeURIComponent(json.query));
        return 0;
    } else {
        view._header.find('.search_no_result_hint').hide();
        return ui.Main.add_tweets(view, tweets);
    }
},

loadmore_tweet_success:
function loadmore_tweet_success(view, json) {
    var tweets = [];
    if (json.constructor == Object && typeof json.results != 'undefined') {
        tweets = json.results;
    }
    ui.Slider.set_unread(view.name);
    return ui.Main.add_tweets(view, tweets);
},

load_people_success:
function load_people_success(view, json) {
    ui.Slider.set_unread(view.name);
    return ui.Main.add_people(view, json);
},

loadmore_people_success:
function loadmore_people_success(view, json) {
    ui.Slider.set_unread(view.name);
    return ui.Main.add_people(view, json);
},

do_search:
function do_search(view, query) {
    view.query = $.trim(query);
    if (view.query.length == 0) return;
    view.clear();
    view.load();
},

};

