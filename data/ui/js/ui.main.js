if (typeof ui == 'undefined') var ui = {};
ui.Main = {

me: {},

id: '',

since_id: 1,

max_id: null,

selected_tweet_id: null,

active_tweet_id: null,

use_preload_conversation: true,

// info of blocks. all pages use as containers to display tweets.
block_info: {
},

init:
function init () {
    this.id = '#main_page';
    this.me = $('#main_page');
    this.reset_block_info();

    $('.tweet_block').scroll(
    function (event) {
        if (this.scrollTop + this.clientHeight == this.scrollHeight) {
            $(ui.Slider.current + '_tweet_block >ul')
                .children('.tweet:hidden:lt(20)').show();
        }
        if (this.scrollTop == 0) {
            ui.Main.compress_page($(ui.Slider.current + '_tweet_block >ul'))
        }
        // hide tweet menu
        $('#tweet_bar').hide();
    });

    $('.btn_load_more').click(
    function(event) {
        ui.Notification.set(_("Loading Tweets...")).show(-1);
        ui.Main.load_more_tweets();
    });

    $('#people_vcard .vcard_follow').click(
    function (event) {
        var screen_name = ui.Main.block_info['#people'].screen_name;
        var _this = this;
        if ($(this).hasClass('unfo')) {
            ui.Notification.set(_("Unfollow @") + screen_name + _(" ...")).show();
            lib.twitterapi.destroy_friendships(screen_name,
            function () {
                ui.Notification.set(
                    _("Unfollow @")+ screen_name+_(" Successfully!")).show();
                $(_this).text('Follow').removeClass('unfo');
            });
        } else {
            ui.Notification.set(_("Follow @") + screen_name + _(" ...")).show();
            lib.twitterapi.create_friendships(screen_name,
            function () {
                ui.Notification.set(
                    _("Follow @")+ screen_name+_(" Successfully!")).show();
                $(_this).text('Unfollow').addClass('unfo');
            });
        }
    });

    $('#people_vcard .vcard_block').click(
    function (event) {
        var screen_name = ui.Main.block_info['#people'].screen_name;
        if (!confirm(_("Are you sure you want to block @")+screen_name+_("?!\n")))
            return;
        ui.Notification.set(_("Block @") + screen_name + _(" ...")).show();
        lib.twitterapi.create_blocks(screen_name,
        function () {
            ui.Notification.set(
                _("Block @")+ screen_name+_(" Successfully!")).show();
        });
    });

    $('#people_vcard .vcard_unblock').click(
    function (event) {
        var screen_name = ui.Main.block_info['#people'].screen_name;
        ui.Notification.set(_("Unblock @") + screen_name + _(" ...")).show();
        lib.twitterapi.create_blocks(screen_name,
        function () {
            ui.Notification.set(
                _("Unblock @")+ screen_name+_(" Successfully")).show();
        });
    });

    $('#tbox_people_entry').keypress(
    function (event) {
        if (event.keyCode == 13)
            $('#btn_people_entry').click();
    });
    $('#btn_people_entry').click(
    function (event) {
        ui.Main.reset_people_page(null
            , $.trim($('#tbox_people_entry').attr('value')));
        daemon.Updater.update_people();
    });

    $('#tbox_search_entry').keypress(
    function (event) {
        if (event.keyCode == 13)
            $('#btn_search_entry').click();
    });
    $('#btn_search_entry').click(
    function (event) {
        ui.Main.reset_search_page(
            $.trim($('#tbox_search_entry').attr('value')));
        daemon.Updater.update_search();
    });

    //tweet bar
    // -- more menu --
    $('#tweet_bar .tweet_more_menu_trigger').hover(
    function (event) {
        $('#tweet_more_menu').show();
    },
    function (event) {
        $('#tweet_more_menu').hide();
    });

    $('#tweet_bar .tweet_reply').click(
    function (event) {
        ui.Main.on_reply_click(this, ui.Main.active_tweet_id, event);
        return false;
    });

    $('#tweet_bar .tweet_rt').click(
    function (event) {
        ui.Main.on_rt_click(this, ui.Main.active_tweet_id, event);
        return false;
    });

    $('#tweet_bar .tweet_retweet').click(
    function (event) {
        ui.Main.on_retweet_click(this, ui.Main.active_tweet_id, event);
    });

    $('#tweet_bar .tweet_fav').click(
    function (event) {
        ui.Main.on_fav_click(this, ui.Main.active_tweet_id, event);
    });

    $('#tweet_bar .tweet_reply_all').click(
    function (event) {
        ui.Main.on_reply_all_click(this, ui.Main.active_tweet_id, event);
        return false;
    });

    $('#tweet_bar .tweet_dm').click(
    function (event) {
        ui.Main.on_dm_click(this, ui.Main.active_tweet_id, event);
        return false;
    });

    $('#tweet_bar .tweet_del').click(
    function (event) {
        ui.Main.on_del_click(this, ui.Main.active_tweet_id, event);
    });

    $('#tweet_bar .tweet_dm_reply').click(
    function (event) {
        ui.Main.on_dm_click(this, ui.Main.active_tweet_id, event);
        return false;
    });
    
},

reset_block_info:
function reset_block_info() {
    ui.Main.block_info = {
    '#home_timeline': {
          since_id: 1, max_id: null
        , api_proc: lib.twitterapi.get_home_timeline
        , is_sub: false
        , selected_tweet_id: null
        , use_notify: true
        , use_notify_sound: true
        , use_notify_type: 'count'
    },
    '#mentions': {
          since_id: 1, max_id: null
        , api_proc: lib.twitterapi.get_mentions
        , is_sub: false
        , selected_tweet_id: null
        , use_notify: true
        , use_notify_sound: true
        , use_notify_type: 'content'
    },
    '#direct_messages_inbox': {
          since_id: 1, max_id: null 
        , api_proc: lib.twitterapi.get_direct_messages
        , is_sub: false
        , selected_tweet_id: null
        , use_notify: true
        , use_notify_sound: true
        , use_notify_type: 'count'
    },
    '#direct_messages_outbox': {
          since_id: 1, max_id: null 
        , api_proc: lib.twitterapi.get_sent_direct_messages
        , is_sub: false
        , selected_tweet_id: null
        , use_notify: false 
        , use_notify_sound: false
        , use_notify_type: 'count'
    },
    '#favorites': { page: 1
        , api_proc: lib.twitterapi.get_favorites
        , selected_tweet_id: null
        , use_notify: false 
        , use_notify_sound: false
        , use_notify_type: 'count'
    },
    '#retweeted_to_me': {
          since_id: 1, max_id: null
        , api_proc: lib.twitterapi.get_retweeted_to_me
        , is_sub: true
        , selected_tweet_id: null
        , use_notify: false 
        , use_notify_sound: false
        , use_notify_type: 'count'
    },
    '#retweeted_by_me': {
          since_id: 1, max_id: null
        , api_proc: lib.twitterapi.get_retweeted_by_me
        , is_sub: true
        , selected_tweet_id: null
        , use_notify: false 
        , use_notify_sound: false
        , use_notify_type: 'count'
    },
    '#retweets_of_me': {
          since_id: 1, max_id: null
        , api_proc: lib.twitterapi.get_retweets_of_me
        , is_sub: true
        , selected_tweet_id: null
        , use_notify: false 
        , use_notify_sound: false
        , use_notify_type: 'count'
    },
    '#people': {
          id: null, screen_name: '' 
        , since_id: 1, max_id: null
        , api_proc: lib.twitterapi.get_user_timeline
        , is_sub: false
        , selected_tweet_id: null
        , use_notify: false 
        , use_notify_sound: false
        , use_notify_type: 'count'
    },
    '#search': { 
          query: '', page: 1
        , api_proc: lib.twitterapi.search 
        , selected_tweet_id: null
        , use_notify: false 
        , use_notify_sound: false
        , use_notify_type: 'count'
    },
    };
},

hide:
function hide () {
    daemon.Updater.stop();
    ui.StatusBox.hide();
    globals.in_main_view = false;
    this.me.hide();
},

show:
function show () {
    daemon.Updater.start();
    $('.tweet').remove();
    ui.StatusBox.show();
    globals.in_main_view = true;
    this.me.show();
},

reset_people_page:
function reset_people_page(id, screen_name) {
    ui.Main.block_info['#people'].id = id;
    ui.Main.block_info['#people'].screen_name = screen_name;
    ui.Main.block_info['#people'].since_id = 1;
    ui.Main.block_info['#people'].max_id = null;
    $('#people_tweet_block > ul').html('');
},

reset_search_page:
function reset_search_page(query) {
    ui.Main.block_info['#search'].query = query;
    ui.Main.block_info['#search'].page = 1;
    $('#search_tweet_block > ul').html('');
},

load_tweets:
function load_tweets () {
    var pagename = ui.Slider.current;
    daemon.Updater.watch_pages[pagename].proc();
},

load_more_tweets:
function load_more_tweets () {
    var pagename = ui.Slider.current;
    if (pagename == '#retweets')
        pagename = ui.RetweetTabs.current;
    if (pagename == '#direct_messages')
        pagename = ui.DMTabs.current;

    var proc = ui.Main.block_info[pagename].api_proc;

    switch (pagename){
    case '#favorites':
        proc(globals.myself.id, ui.Main.block_info[pagename].page, 
        function (result) {
            ui.Main.load_more_tweets_cb(result, pagename);
        });
    break;
    case '#search':
        proc(ui.Main.block_info[pagename].query
            , ui.Main.block_info[pagename].page, 
            function (result) {
                result = result.results;
                ui.Main.load_more_tweets_cb(result, pagename);
            })
        break;
    case '#people':
        proc(ui.Main.block_info[pagename].id
            , ui.Main.block_info[pagename].screen_name
            , 1, ui.Main.block_info[pagename].max_id
            , 20, 
        function (result) {
            ui.Main.load_more_tweets_cb(result, pagename);
        });
    break;
    default:
        proc(1, ui.Main.block_info[pagename].max_id, 20,
        function (result) {
            ui.Main.load_more_tweets_cb(result, pagename);
        });
    break;
    } 
},

load_tweets_cb:
function load_tweets_cb(result, pagename) {
    var json_obj = result;
    var container = null;
    // tweets in retweets page shoul be display in sub blocks
    // and use the name of subpage as pagename.
    // others display in normal blocks.
    if (pagename.indexOf('#retweet') == 0
        || pagename.indexOf('#direct_messages') == 0) {
        container = $(pagename + '_sub_block > ul');
    } else {
        container = $(pagename + '_tweet_block > ul');
    }
    container.pagename = pagename.substring(1);

    // resume position if timeline is not on the top
    container.resume_pos = (container.parent().get(0).scrollTop != 0);
    var tweet_count = ui.Main.add_tweets(result, container);
 
    if (tweet_count != 0 ) {
        // favorites page have differet mechanism to display more tweets.
        if (pagename == '#favorites' || pagename == '#search') {
            ui.Main.block_info[pagename].page += 1; 
        } else {
            ui.Main.block_info[pagename].since_id 
                = json_obj[0].id_str;  
            var last_id = json_obj[tweet_count - 1].id_str;
            if (ui.Main.block_info[pagename].max_id == null)
                ui.Main.block_info[pagename].max_id = last_id - 1;
        }
        if (ui.Main.block_info[pagename].use_notify) {
            switch (ui.Main.block_info[pagename].use_notify_type) {
            case 'count':
                hotot_action('system/notify/count/'
                    + encodeURIComponent(_("Update page ")+pagename)
                    + '/'+encodeURIComponent(tweet_count + _(" new items.")));
            break;
            case 'content':
                if (json_obj.length < 5) {
                    for (var i = 0; i < json_obj.length; i += 1) {
                        var user = typeof json_obj[i].sender != 'undefined'
                            ? json_obj[i].sender : json_obj[i].user;
                        hotot_action('system/notify/content/'
                            + encodeURIComponent(user.screen_name) + '/'
                            + encodeURIComponent(json_obj[i].text));
                    }
                } else {
                    hotot_action('system/notify/count/'
                        + encodeURIComponent(_("Update page ")+pagename)
                        + '/'+encodeURIComponent(tweet_count+_(" new items.")));
                }
            break;
            } 
            if (ui.Main.block_info[pagename].use_notify_sound) {
                hotot_action('system/notify_with_sound');
            }
        } 
    }
},

load_more_tweets_cb:
function load_more_tweets_cb(result, pagename) {
    var json_obj = result;
    var container = null;
    // tweets in retweets page shoul be display in sub blocks
    // and use the name of subpage as pagename.
    // others display in normal blocks.
    if (pagename.indexOf('#retweet') == 0
        || pagename.indexOf('#direct_messages') == 0) { 
        container = $(pagename + '_sub_block > ul');
    } else {
        container = $(pagename + '_tweet_block > ul');
    }
    container.pagename = pagename.substring(1);
    // never resume position after loading more tweet
    container.resume_pos = false;
    var tweet_count = ui.Main.add_tweets(json_obj, container);

    if (tweet_count != 0) {
        if (pagename == '#favorites'
            || pagename == '#search') {
            ui.Main.block_info[pagename].page += 1; 
        } else {
            ui.Main.block_info[pagename].max_id 
                = json_obj[tweet_count - 1].id_str - 1;  
            var first_id = json_obj[0].id_str;
            if (ui.Main.block_info[pagename].since_id == 1)
                ui.Main.block_info[pagename].since_id = first_id;
        }
    }
},

add_tweets:
function add_tweets(json_obj, container) {
/* Add one or more tweets to a specifed container.
 * - Choose a template-filled function which correspond to the json_obj and
 *   Add it to the container in order of tweets' id (in order of post time).
 *   ** Note that as some tweets was retweeted by users, whose appearance is
 *   different, include timestamp, text, screen_name, etc. However, the DOM
 *   id of them are the original id and they have a new DOM attribute
 *   'retweet_id' which should be used to handle retweeted tweets by Hotot.
 *
 * - Argument container is the jQuery object where the json_obj will be add.
 *   The container.pagename indicate the pagename of the container. If the
 *   tweet in a thread, the container.pagename should be assigned with the
 *   id of the lastest tweet.
 */
    var form_proc = ui.Template.form_tweet;
    if (container.pagename.indexOf('direct_messages') == 0)
        form_proc = ui.Template.form_dm
    if (container.pagename == 'search')
        form_proc = ui.Template.form_search

    var sort_tweets = function (tweets) {
        /* sort tweets in order of id. smaller first.
         * */
        tweets.sort(function (a, b) {
            return a.id_str > b.id_str; 
        });
        return tweets;
    };

    var get_next_tweet_dom = function (current) {
        /* return the next tweet DOM of current. 
         * if current is null, return the first tweet DOM
         * if no tweet at the next position, return null
         * */
        var next_one = null;
        if (current == null) {
            next_one = container.find('.tweet:first');
        } else {
            next_one = $(current).next('.tweet');
        }
        if (next_one.length == 0) next_one = null;
        return next_one;
    };
    
    var insert_tweet = function (tweet) {
        /* insert this tweet into a correct position.
         * in the order of id.
         * and drop duplicate tweets who has same id.
         * */
        var this_one = tweet;
        var next_one = get_next_tweet_dom(null);
        var this_one_html = form_proc(this_one, container.pagename);
        while (true) {
            if (next_one == null) {
                // insert to end of container 
                container.append(this_one_html);
                return true;
            } else {
                var next_one_id 
                    = ui.Main.normalize_id($(next_one).attr('id'));
                var cmp_ret = util.compare_id(next_one_id, this_one.id_str);
                if (cmp_ret == 1) {         //next_one_id < this.id_str
                    $(next_one).before(this_one_html);
                    return true;
                } else if (cmp_ret == 0) { //next_one_id == this.id_str
                    // simply drop the duplicate tweet.
                    return false;
                } else {                //next_one_id > this.id_str
                    next_one = get_next_tweet_dom(next_one);
                }
            }
        }
    };

    var new_tweets_height = 0;
    // insert tweets.
    if (1 < json_obj.length) {
        json_obj = sort_tweets(json_obj);
    }
    for (var i = 0; i < json_obj.length; i += 1) {
        if (! insert_tweet(json_obj[i])) {
            // remove the duplicate tweet from json_obj
            json_obj.splice(i, 1);
        } else {
            var dom_id = container.pagename+'-'+json_obj[i].id_str;
            if (ui.Main.use_preload_conversation) {
                var thread_container = $($(
                    '#'+dom_id+' .tweet_thread')[0]);
                thread_container.pagename = dom_id;
                ui.Main.preload_thread(
                    json_obj[i], thread_container);
                new_tweets_height += $('#'+dom_id).get(0).clientHeight * 2;
            } else {
                new_tweets_height += $('#'+dom_id).get(0).clientHeight;
            }
        }
    }

    // if timeline is not on the top
    // resume to the postion before new tweets were added
    // offset = N* (clientHeight + border-width)
    if (container.resume_pos) {
        container.parent().get(0).scrollTop 
            += new_tweets_height + json_obj.length;
    }

    if (container.parent().get(0).scrollTop < 100) {
        ui.Main.trim_page(container);
        ui.Main.compress_page(container);
    }

    // dumps to cache
    if (container.pagename != 'search') {
        db.get_tweet_cache_size(function (size) {
            if (db.MAX_TWEET_CACHE_SIZE < size) {
                ui.Notification.set(_("Reducing ... ")).show(-1);
                db.reduce_tweet_cache(
                    parseInt(db.MAX_TWEET_CACHE_SIZE*2/3)
                , function () {
                    ui.Notification.set(_("Reduce Successfully!")).show();
                    db.dump_tweets(json_obj);
                })
            } else {
                db.dump_tweets(json_obj);
            }
        });
    }
    // bind events
    ui.Main.bind_tweets_action(json_obj, container.pagename);
    ui.Notification.hide();
    return json_obj.length;
},

trim_page:
function trim_page(container) {
    container.children('.tweet:gt('+globals.trim_bound+')').remove();
},

compress_page:
function compress_page(container) {
    container.children('.tweet:gt(20)').hide();
},

bind_tweets_action:
function bind_tweets_action(tweets_obj, pagename) {
    var bind_sigle_action = function (tweet_obj) {
        var id = '#' + pagename + '-' + tweet_obj.id_str;
        $(id).click(
        function (event) {
            $(ui.Main.selected_tweet_id).removeClass('selected');
            ui.Main.set_selected_tweet_id(id);
            $(ui.Main.selected_tweet_id).addClass('selected');
            ui.Main.set_tweet_bar(id);
        });
        $(id).hover(
        function (event) {
            ui.Main.set_active_tweet_id(id);
            $(id).addClass('active');
            ui.Main.set_tweet_bar(id);
        },
        function (event) {
            $(id).removeClass('active');
        });

        $(id).find('.btn_tweet_thread').click(
        function (event) {
            ui.Main.on_expander_click(this, event);
        });

        $(id).find('.btn_tweet_thread_more').click(
        function (event) {
            ui.Main.on_thread_more_click(this, event);
        });
    };
    for (var i = 0; i < tweets_obj.length; i += 1) {
        bind_sigle_action(tweets_obj[i]);
    }
},

on_reply_click:
function on_reply_click(btn, li_id, event) {
    var li = $(li_id);
    var id = li.attr('retweet_id') == ''? 
        ui.Main.normalize_id(li.attr('id')): li.attr('retweet_id');
    db.get_tweet(id, 
    function (tx, rs) {
        var row = rs.rows.item(0);
        var id = row.id;
        var tweet_obj = JSON.parse(row.json);
        ui.StatusBox.reply_to_id = id;
        ui.StatusBox.set_status_info('<span class="info_hint">REPLY TO</span> '+ tweet_obj.user.screen_name + ':"' + tweet_obj.text + '"');
        ui.StatusBox.append_status_text('@' + tweet_obj.user.screen_name + ' ');
        ui.StatusBox.open(
        function() {
            ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
            ui.StatusBox.change_mode(ui.StatusBox.MODE_REPLY);
        });
    });
},

on_rt_click:
function on_rt_click(btn, li_id, event) {
    var li = $(li_id);
    var id = li.attr('retweet_id') == ''? 
        ui.Main.normalize_id(li.attr('id')): li.attr('retweet_id');

    db.get_tweet(id, 
    function (tx, rs) {
        var row = rs.rows.item(0);
        var id = row.id;
        var tweet_obj = JSON.parse(row.json);

        ui.StatusBox.set_status_text(_("RT @") + tweet_obj.user.screen_name
            + ': ' + tweet_obj.text + ' ');
        ui.StatusBox.open(
        function() {
            ui.StatusBox.move_cursor(ui.StatusBox.POS_BEGIN);
            ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
        });
    });
},

on_retweet_click:
function on_retweet_click(btn, li_id, event) {
    var li = $(li_id);
    var id = li.attr('retweet_id') == ''? 
        ui.Main.normalize_id(li.attr('id')): li.attr('retweet_id');

    if ($(btn).hasClass('retweeted')) {
        var rt_id = li.attr('my_retweet_id')
        ui.Notification.set(_("Undo Retweeting ...")).show(-1);
        lib.twitterapi.destroy_status(rt_id, 
        function (result) {
            ui.Notification.set(_("Undo Successfully!")).show();
            $(btn).removeClass('retweeted').attr('title', 'Official retweet this tweet.');
        });
    } else {
        ui.Notification.set(_("Retweeting ...")).show(-1);
        lib.twitterapi.retweet_status(id, 
        function (result) {
            ui.Notification.set(_("Retweet Successfully!")).show();
            li.attr('my_retweet_id', result.id_str);
            $(btn).addClass('retweeted').attr('title', _("Undo retweet."));
        });
    }
},

on_reply_all_click:
function on_reply_all_click(btn, li_id, event) {
    var li = $(li_id);
    var id = li.attr('retweet_id') == ''? 
        ui.Main.normalize_id(li.attr('id')): li.attr('retweet_id');
    db.get_tweet(id, 
    function (tx, rs) {
        var row = rs.rows.item(0);
        var id = row.id;
        var tweet_obj = JSON.parse(row.json);

        var who_names = [ '@' + tweet_obj.user.screen_name];
        var text = tweet_obj.text;

        var match = ui.Template.reg_user.exec(text);
        while (match != null ) {
            if (match[2] != globals.myself.screen_name) {
                var name = '@' + match[2];
                if (who_names.indexOf(name) == -1)
                    who_names.push(name);
            }
            match = ui.Template.reg_user.exec(text);
        }
        ui.StatusBox.reply_to_id = id;
        ui.StatusBox.set_status_info('<span class="info_hint">REPLY TO</span>  ' + text);
        ui.StatusBox.append_status_text(who_names.join(' ') + ' ');
        ui.StatusBox.open(
        function() {
            ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
            ui.StatusBox.change_mode(ui.StatusBox.MODE_REPLY);
        });
    });

},

on_dm_click:
function on_dm_click(btn, li_id, event) {
    var li = $(li_id);
    var id = ui.Main.normalize_id(li.attr('id'));
    db.get_tweet(id, 
    function (tx, rs) {
        var row = rs.rows.item(0);
        var id = row.id;
        var tweet_obj = JSON.parse(row.json);

        var user = typeof tweet_obj.sender != 'undefined'? tweet_obj.sender 
            : tweet_obj.user;

        ui.StatusBox.set_dm_target(user.screen_name);
        ui.StatusBox.open(function () {
            ui.StatusBox.change_mode(ui.StatusBox.MODE_DM);
            ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
        });
    });
},

on_del_click:
function on_del_click(btn, li_id, event) {
    var li = $(li_id);
    var id = li.attr('retweet_id') == ''? 
        ui.Main.normalize_id(li.attr('id')): li.attr('retweet_id');

    ui.Notification.set('Destroy ...').show(-1);
    lib.twitterapi.destroy_status(id, 
    function (result) {
        li.remove();
        ui.Notification.set('Destroy Successfully!').show();
    });
},

on_fav_click:
function on_fav_click(btn, li_id, event) {
    var li = $(li_id);
    var id = li.attr('retweet_id') == ''? 
        ui.Main.normalize_id(li.attr('id')): li.attr('retweet_id');
    if ($(li).hasClass('fav')) {
        ui.Notification.set('un-favorite this tweet ...').show(-1);
        lib.twitterapi.destroy_favorite(id, 
        function (result) {
            ui.Notification.set('Successfully!').show();
            $(btn).text('Fav');
            $(li).removeClass('fav');
        });
    } else {
        ui.Notification.set('favorite this tweet ...').show(-1);
        lib.twitterapi.create_favorite(id, 
        function (result) {
            ui.Notification.set('Successfully!').show();
            $(btn).text('Un-Fav');
            $(li).addClass('fav');
        });
    }
},

on_thread_more_click:
function on_thread_more_click(btn, event) {
    var li = ui.Main.ctrl_btn_to_li(btn);
    var id = li.attr('retweet_id') == ''? 
        ui.Main.normalize_id(li.attr('id')): li.attr('retweet_id');

    var thread_container = $(li.find('.tweet_thread')[0]);
    thread_container.pagename = li.attr('id');

    db.get_tweet(id, 
    function (tx, rs) {
        var row = rs.rows.item(0);
        var id = row.id;
        var orig_tweet_obj = JSON.parse(row.json);

        li.find('.tweet_thread_hint').show();
        ui.Main.load_thread_proc(
        orig_tweet_obj.in_reply_to_status_id_str
        , thread_container
        , function () {
            li.find('.tweet_thread_hint').fadeOut();
            $(btn).hide();
        });
    });
},

on_expander_click:
function on_expander_click(btn, event) {
    var li = ui.Main.ctrl_btn_to_li(btn);
    var id = li.attr('retweet_id') == ''? 
        ui.Main.normalize_id(li.attr('id')): li.attr('retweet_id');

    var thread_container = $(li.find('.tweet_thread')[0]);
    thread_container.pagename = li.attr('id');

    db.get_tweet(id, 
    function (tx, rs) {
        var row = rs.rows.item(0);
        var id = row.id;
        var orig_tweet_obj = JSON.parse(row.json);

        thread_container.parent().toggle();
        if ($(btn).hasClass('expand')) {
            $(btn).removeClass('expand');
        } else {
            $(btn).addClass('expand');
            if (thread_container.children('.tweet').length == 0) {
                li.find('.tweet_thread_hint').show();
                li.find('.btn_tweet_thread_more').hide();
                ui.Main.load_thread_proc(
                  orig_tweet_obj.in_reply_to_status_id_str
                , thread_container
                , function () {
                    li.find('.tweet_thread_hint').fadeOut();
                });
            }
        }
    });
},

load_thread_proc:
function load_thread_proc(tweet_id, thread_container, on_finish) {
    var load_thread_proc_cb = function (prev_tweet_obj) {
        thread_container.resume_pos = true;
        var count=ui.Main.add_tweets([prev_tweet_obj], thread_container);
        // load the prev tweet in the thread.
        var reply_id = prev_tweet_obj.in_reply_to_status_id_str;
        if (reply_id == null) { // end of thread.
            on_finish();
            return ;
        } else { 
            ui.Main.load_thread_proc(reply_id, thread_container, on_finish);
        }
    }

    db.get_tweet(tweet_id,
    function (tx, rs) {
        if (rs.rows.length == 0) {
            lib.twitterapi.show_status(tweet_id,
            function (result) {
                load_thread_proc_cb(result);
            });
        } else {
            load_thread_proc_cb(JSON.parse(rs.rows.item(0).json));
        }
    });
},

preload_thread:
function preload_thread(tweet_obj, thread_container) {

    var id = tweet_obj.in_reply_to_status_id_str;
    if (id == null) {
        return;
    }
    if (2 < thread_container.pagename.split('-').length) {
        return;
    }
    db.get_tweet(id, 
    function (tx, rs) {
        if (rs.rows.length != 0) {
            var prev_tweet_obj = JSON.parse(rs.rows.item(0).json);
            var li = $(thread_container.parents('.tweet')[0]);
            ui.Main.add_tweets([prev_tweet_obj], thread_container);
            
            li.find('.btn_tweet_thread').addClass('expand');
            li.find('.tweet_thread_hint').hide();
            if (prev_tweet_obj.in_reply_to_status_id == null) {
                li.find('.btn_tweet_thread_more').hide();
            }
            thread_container.parent().show();
        }
    }); 
},

move_to_tweet:
function move_to_tweet(pos) {
    var target = null;
    if (ui.Main.selected_tweet_id == null) {
        ui.Main.selected_tweet_id = '#' + $(ui.Slider.current
            +'_tweet_block .tweet:first').attr('id');
    }
    var current = $(ui.Main.selected_tweet_id);

    if (current.length == 0) {
        return;
    }

    var container = $(current.parents('.tweet_block').get(0));
    if (pos == 'top') {
        target = container.find('.tweet:first');
    } else if (pos == 'bottom') {
        container.find('.tweet').show();
        target = container.find('.tweet:last');
    } else if (pos == 'next') {
        target = current.next('.tweet');
    } else if (pos == 'prev') {
        target = current.prev('.tweet');
    } else if (pos == 'orig') {
        target = current;
    } else {
    
    }

    if (target.length == 0) {
        target = current;
    }
    container.stop().animate(
        {scrollTop: target.get(0).offsetTop - current.height()}
        , 300);
    current.removeClass('selected');
    target.addClass('selected');
    ui.Main.set_selected_tweet_id('#'+ target.attr('id'));
    target.focus();
},

set_selected_tweet_id:
function set_selected_tweet_id(id) {
    var block_name = ui.Slider.current;
    if (ui.Slider.current == '#retweets') {
        block_name = ui.RetweetTabs.current;
    } else if (ui.Slider.current == '#direct_messages') {
        block_name = ui.DMTabs.current;
    }
    ui.Main.selected_tweet_id = id;
    ui.Main.block_info[block_name].selected_tweet_id = id;
},


set_active_tweet_id:
function set_active_tweet_id(id) {
    ui.Main.active_tweet_id = id;
},

set_tweet_bar: 
function set_tweet_bar(li_id) {
    var offset_y = $(li_id).attr('offsetTop')
        - $(ui.Slider.current + '_tweet_block').attr('scrollTop');
    $('#tweet_bar').css('top', offset_y + 'px');
    $('#tweet_bar').css('display','block');

    switch ($(li_id).attr('type')) {
    case 'tweet':
        $('#tweet_bar .tweet_dm_reply').parent().hide();
        $('#tweet_bar .tweet_bar_btn:not(.tweet_dm_reply)').parent().show();
    break;
    case 'message':
        $('#tweet_bar .tweet_dm_reply').parent().show();
        $('#tweet_bar .tweet_bar_btn:not(.tweet_dm_reply)').parent().hide();
    break;
    case 'search':
        $('#tweet_bar').hide();
    break;
    default: break;
    }

    if ($(li_id).attr('deletable') == 'true') {
        $('#tweet_bar .tweet_del').parent().show();
    } else {
        $('#tweet_bar .tweet_del').parent().hide();
    }
    if ($(li_id).attr('retweetable') == 'true') {
        $('#tweet_bar .tweet_retweet').parent().show();
    } else {
        $('#tweet_bar .tweet_retweet').parent().hide();
    }

},

filter:
function filter(query){
    var current = ui.Slider.current;
    var tweets = $(current + '_tweet_block .tweet');
    tweets.each(
    function(idx, tweet) {
        if ($(tweet).find('.text').text().indexOf(query) != -1
            || $(tweet).find('.who').text().indexOf(query) != -1) {
            $(tweet).show()
        } else {
            $(tweet).hide();
        }
    });
}, 

ctrl_btn_to_li:
function ctrl_btn_to_li(btn) {
    return $($(btn).parents('.tweet')[0]);
},

normalize_id:
function normalize_id(id) {
    var arr = id.split('-');
    return arr[arr.length - 1];
},

normalize_user_id:
function normalize_user_id(id) {
    var arr = id.split('-');
    return arr[arr.length - 1];
},

};


