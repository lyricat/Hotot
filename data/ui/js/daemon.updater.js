if (typeof daemon == 'undefined') var daemon = {};
daemon.Updater = {

interval: 120,

running: false,

watch_pages: {
      '#home_timeline': {
          watch: true 
        , proc : function () {daemon.Updater.update_home_timeline();}
    }
    , '#mentions':  {
          watch: true
        , proc : function () {daemon.Updater.update_mentions();}
    }
    , '#direct_messages': {
          watch: false
        , proc : function () {daemon.Updater.update_direct_messages();}
    }
    , '#favorites': {
          watch: false
        , proc : function () {daemon.Updater.update_favorites();}
    }
    , '#people': {
          watch: false
        , proc : function () {daemon.Updater.update_people();}
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
            if (daemon.Updater.watch_pages[pagename].watch) {
                setTimeout(daemon.Updater.watch_pages[pagename].proc
                    , (step + 1) * 5000);
                step += 1;
            }
        }
        ui.Notification.set('Update '+ step +' page(s) on schedule.').show();
    }
    setTimeout(daemon.Updater.work
        , daemon.Updater.interval * 1000);
},

update_home_timeline:
function update_home_timeline() {
    lib.twitterapi.get_home_timeline(
        ui.Main.block_info['#home_timeline'].since_id
        , null, 20, 
        function (result) {
            ui.Main.load_tweets_cb(result, '#home_timeline');
        });
},

update_mentions:
function update_mentions() {
    lib.twitterapi.get_mentions(
        ui.Main.block_info['#mentions'].since_id
        , null, 20, 
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
        , null, 20, 
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
        '#people_follower': ui.PeopleTabs.load_people_follower,
        '#people_friend': ui.PeopleTabs.load_people_friend
    };

    $('#people_request_hint').hide();
    
    if (ui.Main.block_info['#people'].screen_name == '') 
        return;
    
    var render_proc = function (user_obj) {
        ui.PeopleTabs.render_people_page(user_obj
            , ui.PeopleTabs.current
            , proc_map[ui.PeopleTabs.current]);
    }

    if (force) {
        lib.twitterapi.show_user(
              ui.Main.block_info['#people'].screen_name
            , render_proc
        );
    } else {
        db.get_user(ui.Main.block_info['#people'].screen_name
            , function (tx, rs) {
                if (rs.rows.length == 0) {
                    lib.twitterapi.show_user(
                          ui.Main.block_info['#people'].screen_name
                        , render_proc
                    );
                } else {
                    render_proc(JSON.parse(rs.rows.item(0).json));
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
        since_id , null, 20, 
        function (result) {
            ui.Main.load_tweets_cb(result, pagename);
        });
},

update_search:
function update_search() {
    $('#search_tweet_block > ul').html('');
    var query = ui.Main.block_info['#search'].query;
    var page = ui.Main.block_info['#search'].page;
    if (query == '') 
        return;
    lib.twitterapi.search(query, 1,
    function (result) {
        var tweets = [];
        if (result.constructor == Object 
            && typeof result.results != 'undefined') {
            tweets = result.results;
        }
        if (tweets.length == 0) {
            $('#search_no_result_hint').show();
            $('#search_query_keywords').text(query);
        } else {
            $('#search_no_result_hint').hide();
            $('#search_tweet_block .tweet_block_bottom').show();
            ui.Main.load_tweets_cb(tweets, '#search');
        }
    });
},
};

