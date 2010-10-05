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
function update_people() {
    $('#people_request_hint').hide();
    var load_people_tl = function () {
        lib.twitterapi.get_user_timeline(
            ui.Main.block_info['#people'].id,
            ui.Main.block_info['#people'].screen_name,
            ui.Main.block_info['#people'].since_id, null, 20,
        function (result) {
            $('#people_tweet_block .tweet_block_bottom').show();
            ui.Slider.slide_to('#people');
            ui.Main.load_tweets_cb(result, '#people');
        });
    };
    

    if (ui.Main.block_info['#people'].screen_name == '') 
        return;
    lib.twitterapi.show_user(
        ui.Main.block_info['#people'].screen_name, 
    function (user_obj) {
        var container = $('#people_vcard'); 
        var btn_follow = container.find('.vcard_follow');
        btn_follow.show();
        ui.Template.fill_vcard(user_obj, container);

        if (user_obj.following) {
            btn_follow.html('Unfollow');
            btn_follow.addClass('unfo');
            load_people_tl();
        } else {
            if (user_obj.protected) {
                // not friend and user protect his tweets,
                // then hide follow btn.
                btn_follow.hide();
                // and display request box.
                $('#people_request_hint').show();
                $('#people_tweet_block .tweet_block_bottom').hide();
                $('#btn_people_request').attr('href'
                    , 'http://twitter.com/' + user_obj.screen_name)
                $('#request_screen_name').text(user_obj.screen_name)
            } else {
                btn_follow.html('Follow');
                btn_follow.removeClass('unfo');
                load_people_tl();
            }
        }
        $('#people_vcard').show();
        $('#people_entry').css('border-bottom', '0')
    });
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

