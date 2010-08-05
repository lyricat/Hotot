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
                // utility.Console.out('Going to update ' + pagename);
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
    lib.twitterapi.get_direct_messages(
         ui.Main.block_info['#direct_messages'].since_id
        , null, 20, 
        function (result) {
            ui.Main.load_tweets_cb(result, '#direct_messages');
        });
},

update_favorites:
function update_favorites() {
    $('#favorites_tweet_block > ul').html('');
    lib.twitterapi.get_favorites(globals.my_id, 1, 
        function (result) {
            ui.Main.load_tweets_cb(result, '#favorites');
        });
},

};

