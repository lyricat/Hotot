if (typeof ui == 'undefined') var ui = {};
ui.SearchView = {
since_id: null,
alter_load: null,
alter_load_success: null,
alter_item_type: null,
init:
function init() {
    ui.SearchView.alter_item_type = 'phoenix_search';
    ui.SearchView.alter_load = ui.SearchView.load_tweet;
    ui.SearchView.alter_load_success = ui.SearchView.load_tweet_success;
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
        // clear
        search_entry.val('');
        ui.SearchView.clear(view);    
        // switch to trending view

    });
    var toggle = view._header.find('.search_view_toggle');
    var sub_view_btns = toggle.find('.mochi_button_group_item');
    sub_view_btns.click(function (event) {
        var pagename = $(this).attr('href').substring(1);
        sub_view_btns.removeClass('selected');
        $(this).addClass('selected');
        ui.SearchView.switch_sub_view(view, pagename);
    });

    var saved_searches_more_menu = $('#saved_searches_more_menu');
    $('#saved_searches_more_trigger').mouseleave(function () {
        saved_searches_more_menu.hide();
    });

    $('#saved_searches_btn').click(function () {
        globals.twitterClient.get_saved_searches(function (result) {
            saved_searches_more_menu.find('.saved_search_item').remove();
            var arr = [];
            for (var i = 0; i < result.length; i += 1) {
                arr.push(
                    '<li><a class="saved_search_item" qid="'+result[i].id_str+'" href="javascript:void(0);">'+result[i].query+'</a></li>'
                    );
            }
            saved_searches_more_menu.append(arr.join('\n'));
            saved_searches_more_menu.show();
        }, function () {
            console.log("Error");
        });
    });

    saved_searches_more_menu.find('.saved_search_item').live('click', function () {
        ui.SearchView.do_search(view, $(this).text().trim());
        saved_searches_more_menu.hide();
        return false;
    });

    $('#create_saved_search_btn').click(function () {
        var query = search_entry.val().trim();
        if (query.length == 0) return;
        open_search(query);
        /*
        var query = search_entry.val().trim();
        globals.twitterClient.create_saved_search(query, function () {
            toast.set('Saved Query "'+query+'"').show();
        }, function () {
            console.log("Too more queries");
        });
        */
    });

    widget.autocomplete.connect(search_entry);
    ui.SearchView.clear(view);
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
        view._load_fail = ui.SearchView.load_tweet_fail;
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

    ui.SearchView.alter_item_type = view.item_type;
    ui.SearchView.alter_load = view._load;
    ui.SearchView.alter_load_success = view._load_success;

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
        fail(view, {ignore: true});
        return;
    }
    view.page = 1;
    globals.twitterClient.search(view.query, view.page, view.since_id, null, success);
    if (view.type != 'saved_search') {
        globals.twitterClient.show_user(view.query,
        function (user) {
            view._header.find('.search_people_result').show();
            view._header.find('.search_people_inner').empty().append($('<a/>').text(user.screen_name).attr('href','javascript:open_people("'+user.screen_name+'")'));
        }, function (xhr, textStatus, errorThrown) {
            view._header.find('.search_people_result').hide();
        });
    }
},

loadmore_tweet:
function loadmore_tweet(view, success, fail) {
    if (!view.page) view.page = 1;
    globals.twitterClient.search(view.query, view.page + 1, null, view.max_id, success);   
},

load_people:
function load_people(view, success, fail) {
    if ($.trim(view.query).length == 0) {
        success([]);
        return;
    }
    globals.twitterClient.search_user(view.query, 1, success, fail);   
},

loadmore_people:
function loadmore_people(view, success, fail) {
    globals.twitterClient.search_user(view.query, view.page, success, fail);   
},

load_tweet_success:
function load_tweet_success(view, json) {
    var tweets = [];
    if (json.constructor == Object && (json.results != undefined || json.statuses != undefined)) {
        tweets = json.results || json.statuses;
    }
    if (json.constructor == Object && json.ignore) {
        return 0;
    }
    if (ui.SearchView.since_id != view.since_id) {
        ui.Slider.set_unread(view.name);
        ui.SearchView.since_id = view.since_id;
    }
    if (tweets.length == 0 && view.since_id == null) {
        view._header.find('.search_no_result_hint').show();
        view._header.find('.keywords').text(
            decodeURIComponent(view.query));
        return 0;
    } else {
        view._header.find('.search_no_result_hint').hide();
        return ui.Main.add_tweets(view, tweets);
    }
},

load_tweet_fail:
function load_tweet_fail(view, json) {
    if (json && json.ignore) {
        view._header.find('.search_no_result_hint').hide();
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

    if (!ui.Main.views.hasOwnProperty('search')) {
        ui.Slider.addDefaultView('search', {});
        view = ui.Main.views.search;
    }
    ui.SearchView.clear(view, true);
    if (ui.SearchView.alter_load != null) {
        view.item_type = ui.SearchView.alter_item_type;
        view._load = ui.SearchView.alter_load;
        view._load_success = ui.SearchView.alter_load_success;
    }
    view.query = $.trim(query);
    if (view.query.length == 0) return;
    view.load();
},

clear:
function clear(view, noTrend) {
    view._header.find('.search_people_result').hide();
    ui.SearchView.since_id = null;
    view.max_id = null;
    view.since_id = null;
    view.query = ''; 
    view.clear();
    ui.SearchView.since_id = 0;
    if (noTrend !== true && conf.get_current_profile().protocol === 'twitter') {
        view.item_type = "page";
        view._load = ui.SearchView.get_trending_topics_worldwide;
        view._load_success = ui.SearchView.get_trending_topics_success;
        view.former = ui.Template.form_tweet;
        view.load();
    }
},

get_trending_topics_local:
function get_trending_topics_local(view, success, fail) {
    if (ui.TrendingTopicsView.woeid == null) {
        $.get('http://www.loc4lize.me/localize.json', function(data) {
            ui.TrendingTopicsView.woeid = data.geo.woeid;
            ui.TrendingTopicsView.city = data.geo.city;
            $('.trending_topics_local').html('Local (' + data.geo.city + ')');
            globals.twitterClient.get_trending_topics(ui.TrendingTopicsView.woeid, success);
        });
    } else {
        globals.twitterClient.get_trending_topics(ui.TrendingTopicsView.woeid, success);
    }
    return 1; // There are always trend topics
},

get_trending_topics_worldwide:
function get_trending_topics_worldwide(view, success, fail) {
    globals.twitterClient.get_trending_topics(1, success);
    return 1; // There are always trend topics
},

get_trending_topics_success:
function get_trending_topics_success(self, json) {
    var trend_list = json[0].trends;
    var i = 1;
    for (trend_name in trend_list) {
        var m = ui.Template.trending_topic_m;
        m.ID = i;
        m.NAME = trend_list[trend_name].name;
        self._body.append(ui.Template.render(ui.Template.trending_topic_t, m));
        i++;
    }
    ui.Main.bind_tweet_action(self._body);
}


};

