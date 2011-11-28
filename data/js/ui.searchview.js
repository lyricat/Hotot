if (typeof ui == 'undefined') var ui = {};
ui.SearchView = {
init:
function init() {

},

init_view:
function init_search_view(view) {
    var search_entry = view._header.find('.search_entry');
    search_entry.keypress(function (ev) {
        if (ev.keyCode == 13) {
            ui.SearchView.do_search(view, search_entry.val());    
        }
    });
    view._header.find('.search_entry_clear_btn').click(function () {
        search_entry.val('');
        ui.SearchView.clear(view);    
    });
    var toggle = view._header.find('.search_view_toggle');
    var sub_view_btns = toggle.find('.radio_group_btn');
    sub_view_btns.click(function (event) {
        var pagename = $(this).attr('href').substring(1);
        sub_view_btns.removeClass('selected');
        $(this).addClass('selected');
        ui.SearchView.switch_sub_view(view, pagename);
    });

    widget.autocomplete.connect(search_entry);
},
    
destroy_view:
function destroy_view(view) {
    // unbind
    view._header.find('.search_btn, .search_entry').unbind();
    // remove slide, view and DOM
    ui.Slider.remove(view.name);
},

switch_sub_view:
function switch_sub_view(view, name) {
    switch (name) {
    case 'tweet':
        view.item_type = 'phoenix_search';
        view.since_id = 1;
        view.former = ui.Template.form_search;
        view._load = ui.SearchView.load_tweet
        view._loadmore = ui.SearchView.loadmore_tweet;
        view._load_success = ui.SearchView.load_tweet_success;
        view._loadmore_success = ui.SearchView.loadmore_tweet_success;
    break;
    case 'people':
        view.item_type = 'page';
        view.page = 1;
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
    /* sample response
    "max_id": 84559462639222784,
    "since_id": 0,
    "previous_page": "?page=1&max_id=84559462639222784&q=hotot",
    "refresh_url": "?since_id=84559462639222784&q=hotot",
    "next_page": "?page=3&max_id=84559462639222784&q=hotot",
    */
    if ($.trim(view.query).length == 0) {
        success([]);
        return;
    }
    view.page = 1;
    view.since_id = null;
    lib.twitterapi.search(view.query, view.page, view.since_id, null, success);
    lib.twitterapi.show_user(view.query,
    function (user) {
        view._header.find('.search_people_result').show();
        view._header.find('.search_people_inner').empty().append($('<a/>').text(user.screen_name).attr('href','javascript:open_people("'+user.screen_name+'")'));
    }, function (xhr, textStatus, errorThrown) {
        view._header.find('.search_people_result').hide();
    });
},

loadmore_tweet:
function loadmore_tweet(view, success, fail) {
    if (!view.page) view.page = 1;
    lib.twitterapi.search(view.query, view.page + 1, null, view.max_id, success);   
},

load_people:
function load_people(view, success, fail) {
    if ($.trim(view.query).length == 0) {
        success([]);
        return;
    }
    lib.twitterapi.search_user(view.query, 1, success, fail);   
},

loadmore_people:
function loadmore_people(view, success, fail) {
    lib.twitterapi.search_user(view.query, view.page, success, fail);   
},

load_tweet_success:
function load_tweet_success(view, json) {
    var tweets = [];
    if (json.constructor == Object && (json.results != undefined || json.statuses != undefined)) {
        tweets = json.results || json.statuses;
    }
    ui.Slider.set_unread(view.name);
    if (tweets.length == 0) {
        view._header.find('.search_no_result_hint').show();
        view._header.find('.keywords').text(
            decodeURIComponent(json.query));
        return 0;
    } else {
        view._header.find('.search_no_result_hint').hide();
        return ui.Main.add_tweets(view, tweets);
    }
},

loadmore_tweet_success:
function loadmore_tweet_success(view, json) {
    if (view.page) view.page += 1;
    var tweets = [];
    if (json.constructor == Object && (json.results != undefined || json.statuses != undefined)) {
        tweets = json.results || json.statuses;
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
    view.max_id = null;
    view.clear();
    view.load();
},

clear:
function clear(view) {
    view._header.find('.search_people_result').hide();
    view.query = ''; 
    view.clear();
},

};

