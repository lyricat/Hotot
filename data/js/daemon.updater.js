if (typeof daemon == 'undefined') var daemon = {};
daemon.Updater = {

time: 0,

running: false,

watch_pages: {
      '#home_timeline': {
          watch: true 
        , proc : function () {daemon.Updater.update_home_timeline();}
        , interval: 60
    }
    , '#mentions':  {
          watch: true
        , proc : function () {daemon.Updater.update_mentions();}
        , interval: 60
    }
    , '#direct_messages': {
          watch: true 
        , proc : function () {daemon.Updater.update_direct_messages();}
        , interval: 120
    }
    , '#favorites': {
          watch: false
        , proc : function () {daemon.Updater.update_favorites();}
    }
    , '#people': {
          watch: false
        , proc : function (force) {daemon.Updater.update_people(force);}
    }
    , '#retweets': {
          watch: false
        , proc : function () {daemon.Updater.update_retweets();}
    }
    , '#search': {
          watch: false
        , proc : function () {daemon.Updater.update_search();}
    }
},

init: 
function init() {
},

start: 
function start() {
    daemon.Updater.running = true;
    daemon.Updater.time = 0;
    daemon.Updater.work();
},

stop:
function stop() {
    daemon.Updater.running = false;
},

work:
function work() {
    if (daemon.Updater.running) {
        var step = 0;
        for (var pagename in daemon.Updater.watch_pages) {
            if (daemon.Updater.watch_pages[pagename].watch 
                && daemon.Updater.time 
                    % daemon.Updater.watch_pages[pagename].interval == 0) {
                var container = ui.Main.get_current_container(pagename);
                var info = container.nextAll('.tweet_block_bottom')
                    .children('.load_more_info');
                container.nextAll('.tweet_block_bottom').show();
                info.html('<img src="image/ani_loading_bar_gray.gif"/>');
                daemon.Updater.watch_pages[pagename].proc();
                step += 1;
            }
        }
        if (step != 0) {
            toast.set('Update '+ step +' page(s) on schedule.').show();
        }
    }
    daemon.Updater.time += 1;
    if (daemon.Updater.time == 3600) {
        daemon.Updater.time = 0;
    }
    setTimeout(daemon.Updater.work, 1000);
},

update_home_timeline:
function update_home_timeline() {
    lib.twitterapi.get_home_timeline(
        ui.Main.block_info['#home_timeline'].since_id
        , null, conf.vars.items_per_request, 
        function (result) {
            ui.Main.load_tweets_cb(result, '#home_timeline');
        });
},

update_mentions:
function update_mentions() {
    lib.twitterapi.get_mentions(
        ui.Main.block_info['#mentions'].since_id
        , null, conf.vars.items_per_request, 
        function (result) {
            ui.Main.load_tweets_cb(result, '#mentions');
        });
},

update_direct_messages:
function update_direct_messages() {
    var proc_map = {
        '#direct_messages_inbox': lib.twitterapi.get_direct_messages,
        '#direct_messages_outbox': lib.twitterapi.get_sent_direct_messages,
    };
    var pagename = ui.DMTabs.current;
    proc_map[pagename](
         ui.Main.block_info[pagename].since_id
        , null, conf.vars.items_per_request, 
        function (result) {
            ui.Main.load_tweets_cb(result, pagename);
        });
},

update_favorites:
function update_favorites() {
    $('#favorites_tweet_block > ul').html('');
    lib.twitterapi.get_favorites(globals.myself.id, 1, 
        function (result) {
            ui.Main.load_tweets_cb(result, '#favorites');
        });
},

update_people:
function update_people(force) {
    var proc_map = {
        '#people_tweet': ui.PeopleTabs.load_people_timeline,
        '#people_fav': ui.PeopleTabs.load_people_fav,
        '#people_followers': ui.PeopleTabs.load_people_followers,
        '#people_friends': ui.PeopleTabs.load_people_friends
    };

    $('#people_request_hint').hide();
    
    if (ui.Main.block_info['#people'].screen_name == '') {
        $('#people_no_result_hint .keywords').text('');
        $('#search_no_result_hint').show();
        return;
    } 
    
    var render_proc = function (user_obj) {
        ui.PeopleTabs.render_people_page(user_obj
            , ui.PeopleTabs.current
            , proc_map[ui.PeopleTabs.current]);
    }
    
    if (true) {
        lib.twitterapi.show_user(
              ui.Main.block_info['#people'].screen_name
            , render_proc
        );
    } else {
        db.get_user(ui.Main.block_info['#people'].screen_name
            , function (user) {
                if (!user) {
                    lib.twitterapi.show_user(
                          ui.Main.block_info['#people'].screen_name
                        , render_proc
                    );
                } else {
                    render_proc(user);
                }
            }
        );
    }
},

update_retweets:
function update_retweets() {
    var proc_map = {
        '#retweeted_by_me': lib.twitterapi.get_retweeted_by_me,
        '#retweeted_to_me': lib.twitterapi.get_retweeted_to_me,
        '#retweets_of_me': lib.twitterapi.get_retweets_of_me,
    };
    var pagename = ui.RetweetTabs.current;
    var since_id = ui.Main.block_info[pagename].since_id;
    proc_map[pagename](
        since_id , null, conf.vars.items_per_request, 
        function (result) {
            ui.Main.load_tweets_cb(result, pagename);
        });
},

update_search:
function update_search() {
    $('#search_tweet_block > ul').html('');
    var query = ui.Main.block_info['#search'].query;
    var page = ui.Main.block_info['#search'].page;
    if (query == '') {
        $('#search_no_result_hint .keywords').text('');
        $('#search_no_result_hint').show();
        return;
    }
    lib.twitterapi.search(query, 1,
    function (result) {
        var tweets = [];
        if (result.constructor == Object 
            && typeof result.results != 'undefined') {
            tweets = result.results;
        }
        if (tweets.length == 0) {
            $('#search_tweet_block .tweet_block_bottom').hide();
            $('#search_no_result_hint .keywords').text(query);
            $('#search_no_result_hint').show();
        } else {
            $('#search_no_result_hint').hide();
            ui.Main.load_tweets_cb(tweets, '#search');
        }
    });
},
};

