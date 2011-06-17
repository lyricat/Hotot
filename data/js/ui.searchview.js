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
        ui.SearchView.do_search(view, $.trim(search_entry.val()));    
    });
    search_entry.keypress(function (ev) {
        if (ev.keyCode == 13) {
            ui.SearchView.do_search(view, $.trim(search_entry.val()));    
        }
    });
},
    
destroy_people_view:
function destroy_people_view(view) {
    // unbind
    view._header.find('.search_btn, .search_entry').unbind();
    // remove slide, view and DOM
    ui.Slider.remove(view.name);
},

load_search_success:
function load_search_success(view, json) {
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

loadmore_search_success:
function loadmore_search_success(view, json) {
    var tweets = [];
    if (json.constructor == Object && typeof json.results != 'undefined') {
        tweets = json.results;
    }
    ui.Slider.set_unread(view.name);
    return ui.Main.add_tweets(view, tweets);
},

do_search:
function do_search(view, query) {
    view.query = query;
    view.clear();
    view.load();
},

};

