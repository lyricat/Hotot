if (typeof ui == 'undefined') var ui = {};
ui.Main = {

me: {},

id: '',

since_id: 1,

max_id: null,

block_info: {
    '#home_timeline': {since_id: 1, max_id: null },
    '#mentions': {since_id: 1, max_id: null },
    '#direct_messages': {since_id: 1, max_id: null },
    '#favorites': { page: 1 },
    '#retweets_to_me': {since_id: 1, max_id: null },
},

init:
function init () {
    this.id = '#main_page';
    this.me = $('#main_page');

    $('#btn_reload').click(
    function(event) {
        ui.Notification.set('Loading Tweets...').show(-1);
        ui.Main.load_tweets();    
    });

    $('.btn_load_more').click(
    function(event) {
        ui.Notification.set('Loading Tweets...').show(-1);
        ui.Main.load_more_tweets();
    });
},

hide:
function hide () {
    daemon.Updater.stop();
    this.me.hide();
},

show:
function show () {
    daemon.Updater.start();
    this.me.show();
},

load_tweets:
function load_tweets () {
    var current_block = ui.Slider.current;
    daemon.Updater.watch_pages[current_block].proc();
},

load_more_tweets:
function load_more_tweets () {
    var current_block = ui.Slider.current;
    var proc = null;
    if (ui.Slider.current =='#home_timeline' ) {
        lib.twitterapi.get_home_timeline(
            1, ui.Main.block_info[current_block].max_id
            , 20, ui.Main.load_more_tweets_cb);
    } else if (ui.Slider.current == '#mentions' ) {
        lib.twitterapi.get_mentions(
            1, ui.Main.block_info[current_block].max_id
            , 20, ui.Main.load_more_tweets_cb);
    } else if (ui.Slider.current == '#direct_messages') {
        lib.twitterapi.get_direct_messages(
            1, ui.Main.block_info[current_block].max_id
            , 20, ui.Main.load_more_tweets_cb);
    } else if (ui.Slider.current == '#favorites') {
        lib.twitterapi.get_favorites(globals.my_id
            , ui.Main.block_info[current_block].page
            , ui.Main.load_more_tweets_cb);
    }
},

load_tweets_cb:
function load_tweets_cb(result, pagename) {
    var json_obj = eval(result);
    var tweet_count = ui.Main.add_tweets(result, false, pagename);
    utility.Console.out('Update ['+pagename+'], '+ tweet_count +' items');
    if (tweet_count != 0 ) {
        if (pagename != '#favorites') {
            ui.Main.block_info[pagename].since_id 
                = json_obj[0].id;  
            var last_id = json_obj[tweet_count - 1].id;
            if (ui.Main.block_info[pagename].max_id == null)
                ui.Main.block_info[pagename].max_id = last_id - 1;
        } else {
            ui.Main.block_info[pagename].page += 1; 
        }
        hotot_action('system/notify/'
            + encodeBase64('Update page '+pagename)
            + '/'
            + encodeBase64(tweet_count + ' new items.'))
    }
},

load_more_tweets_cb:
function load_more_tweets_cb(result) {
    var json_obj = eval(result);
    var current_block = ui.Slider.current;
    var tweet_count = ui.Main.add_tweets(json_obj, true, current_block);

    if (tweet_count != 0) {
        if (current_block != '#favorites') {
            ui.Main.block_info[current_block].max_id 
                = json_obj[tweet_count - 1].id - 1;  
            var first_id = json_obj[0].id;
            if (ui.Main.block_info[current_block].since_id == 1)
                ui.Main.block_info[current_block].since_id = first_id;
        } else {
            ui.Main.block_info[current_block].page += 1; 
        }
    }
},

add_tweets:
function add_tweets(json_obj, is_append, pagename) {
    var form_proc = ui.Template.form_tweet
    if (pagename == '#direct_messages')
        form_proc = ui.Template.form_dm
    var buff = [];
    for (var i = 0; i < json_obj.length; i += 1) {
        var tweet_obj = json_obj[i];
        var tweet_li = form_proc(tweet_obj, pagename);
        buff.push(tweet_li);
    }
    // add as DOM 
    var html = buff.join('')
    if ( !is_append ) {
        $(pagename + '_tweet_block > ul').prepend(html);
    } else {
        $(pagename + '_tweet_block > ul').append(html);
    }
    // bind events
    ui.Main.bind_tweets_action(json_obj, pagename);
    ui.Notification.hide();
    return json_obj.length;
},

bind_tweets_action:
function bind_tweets_action(tweets_obj, pagename) {
    for (var i = 0; i < tweets_obj.length; i += 1) {
        var tweet_obj = tweets_obj[i]
        if (tweet_obj.hasOwnProperty('retweeted_status')) {
            tweet_obj = tweet_obj['retweeted_status'];
        }
        var id = pagename + '-' + tweet_obj.id;
        // utility.Console.out(id);
        $(id).find('.tweet_reply').click(
        function (event) {
            ui.Main.on_reply_click(this, event);
        });

        $(id).find('.tweet_rt').click(
        function (event) {
            ui.Main.on_rt_click(this, event);
        });

        $(id).find('.tweet_retweet').click(
        function (event) {
            ui.Main.on_retweet_click(this, event);
        });

        $(id).find('.tweet_more_menu_trigger').hover(
        function (event) {
            $(this).find('.tweet_more_menu').slideDown('fast');
        },
        function (event) {
            $(this).find('.tweet_more_menu').slideUp('fast');
        });

        $(id).find('.tweet_reply_all').click(
        function (event) {
            ui.Main.on_reply_all_click(this, event);
        });

        $(id).find('.tweet_dm').click(
        function (event) {
            ui.Main.on_dm_click(this, event);
        });

        $(id).find('.tweet_fav').click(
        function (event) {
            ui.Main.on_fav_click(this, event);
        });

        $(id).find('.tweet_dm_reply').click(
        function (event) {
            ui.Main.on_dm_click(this, event);
        });
    }
},

on_reply_click:
function on_reply_click(btn, event) {
    var li = ui.Main.ctrl_btn_to_li(btn);
    var who_name = li.find('.who_href').text();
    var text = li.find('.text').text();
    ui.Header.reply_to_id = ui.Main.normalize_id(li.attr('id'));
    ui.Header.change_mode(ui.Header.MODE_REPLY);
    ui.Header.set_status_info('Reply to `'+ text +'`');
    ui.Header.append_status_text('@' + who_name + ' ');
},

on_rt_click:
function on_rt_click(btn, event) {
    var li = ui.Main.ctrl_btn_to_li(btn);
    var text = li.find('.text').text();
    ui.Header.set_status_text('RT '+text);
},

on_retweet_click:
function on_retweet_click(btn, event) {
    var li = ui.Main.ctrl_btn_to_li(btn);
    lib.twitterapi.retweet_status(ui.Main.normalize_id(li.attr('id')), 
    function (result) {
        ui.Notification.set('Retweet Successfully!').show();
    });
    ui.Notification.set('Retweeting ...').show(-1);
},

on_reply_all_click:
function on_reply_all_click(btn, event) {
    var li = $(btn).parents('.tweet');
    var who_names = [ '@' + li.find('.who_href').text() +' '];
    var text = li.find('.text').text();
    var match = ui.Template.reg_user.exec(text);
    while (match != null ) {
        who_names.push('@' + match[2] + ' ');
        match = ui.Template.reg_user.exec(text);
    }
    ui.Header.reply_to_id = ui.Main.normalize_id(li.attr('id'));
    ui.Header.change_mode(ui.Header.MODE_REPLY);
    ui.Header.set_status_info('Reply to `'+text+'`');
    ui.Header.append_status_text(who_names.join(''));
},

on_dm_click:
function on_dm_click(btn, event) {
    var li = $(btn).parents('.tweet');
    var who_name = li.find('.who_href').text();
    var user_id = ui.Main.normalize_user_id(li.find('.who').attr('id'));
    ui.Header.set_status_info('Compose Direct Messages to @'+who_name);
    ui.Header.dm_to_id = user_id;
    ui.Header.dm_to_screen_name = who_name;
    globals.status_hint = globals.dm_hint
    ui.Header.change_mode(ui.Header.MODE_DM);
},

on_fav_click:
function on_fav_click(btn, event) {
    var li = $(btn).parents('.tweet');
    lib.twitterapi.create_favorite(ui.Main.normalize_id(li.attr('id')), 
    function (result) {
        ui.Notification.set('Successfully!').show();
    });
    ui.Notification.set('set it as favorite ...').show(-1);
},

ctrl_btn_to_li:
function ctrl_btn_to_li(btn) {
    return $(btn).parent().parent().parent();
},

normalize_id:
function normalize_id(id) {
    return id.split('-')[1];
},

normalize_user_id:
function normalize_user_id(id) {
    return id.split('-')[2];
}

};


