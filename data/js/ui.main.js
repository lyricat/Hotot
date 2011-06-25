if (typeof ui == 'undefined') var ui = {};
ui.Main = {

me: {},

active_tweet_id: null,

use_preload_conversation: true,

use_auto_loadmore: false,

// info of blocks. all pages use as containers to display tweets.
views: {
    'home': null,
    'mentions': null,
    'messages': null,
    'search': null
},

init:
function init () {
    this.me = $('#main_page');
    this.reset_views();
    ui.Main.tweet_bar = $('#tweet_bar');

    //tweet bar
    // -- more menu --
    $('#tweet_more_menu_trigger').hover(
    function (event) {
        $('#tweet_more_menu').show();
    },
    function (event) {
        $('#tweet_more_menu').hide();
    });

    $('#tweet_reply_btn').click(
    function (event) {
        ui.Main.on_reply_click(this, ui.Main.active_tweet_id, event);
        return false;
    });

    $('#tweet_rt_btn').click(
    function (event) {
        ui.Main.on_rt_click(this, ui.Main.active_tweet_id, event);
        return false;
    });

    $('#tweet_retweet_btn').click(
    function (event) {
        ui.Main.on_retweet_click(this, ui.Main.active_tweet_id, event);
    });

    $('#tweet_fav_btn').click(
    function (event) {
        ui.Main.on_fav_click(this, ui.Main.active_tweet_id, event);
    });

    $('#tweet_reply_all_btn').click(
    function (event) {
        ui.Main.on_reply_all_click(this, ui.Main.active_tweet_id, event);
        return false;
    });

    $('#tweet_dm_btn').click(
    function (event) {
        ui.Main.on_dm_click(this, ui.Main.active_tweet_id, event);
        return false;
    });

    $('#tweet_del_btn').click(
    function (event) {
        ui.Main.on_del_click(this, ui.Main.active_tweet_id, event);
    });

    $('#tweet_dm_reply_btn').click(
    function (event) {
        ui.Main.on_dm_click(this, ui.Main.active_tweet_id, event);
        return false;
    });
    
    $('#tweet_dm_delete_btn').click(
    function (event) {
        ui.Main.on_dm_delete_click(this, ui.Main.active_tweet_id, event);
        return false;
    });
    
    $('#people_follow_btn').click(
    function (event) {
        ui.Main.on_follow_btn_click(this, ui.Main.active_tweet_id, event);
    });

    $('#people_unfollow_btn').click(
    function (event) {
        ui.Main.on_unfollow_btn_click(this, ui.Main.active_tweet_id, event);
    });
},

reset_views:
function reset_views() {
    ui.Slider.add('search'
        , {title: 'Search', icon:'image/ic_search.png'}
        , { 'type':'tweet', 'title': 'Search'
            , 'load': ui.SearchView.load_tweet
            , 'loadmore': ui.SearchView.loadmore_tweet
            , 'load_success': ui.SearchView.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.SearchView.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_search
            , 'init': ui.SearchView.init_search_view
            , 'destroy': ui.SearchView.destroy_search_view            
            , 'header_html': ui.Template.search_header_t
            , 'method': 'poll'
            , 'interval': -1
            , 'item_type': 'search'
            , 'is_trim': false
        });
    ui.Slider.add('home'
        , { title:'Home Timeline', icon:'image/ic_home.png'}
        , { 'type':'tweet', 'title': 'Home Timeline'
            , 'load': ui.Main.load_home
            , 'loadmore': ui.Main.loadmore_home
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_tweet
            , 'method': 'push'
            , 'interval': 60
            , 'item_type': 'id'
        });
    ui.Slider.add('mentions', {title:'Mentions',icon:'image/ic_mention.png'}
        , { 'type':'tweet', 'title': 'Mentions'
            , 'load': ui.Main.load_mentions
            , 'loadmore': ui.Main.loadmore_mentions
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_tweet
            , 'method': 'push'
            , 'interval': 60
            , 'item_type': 'id'
        });
    ui.Slider.add('messages', {title:'Messages', icon:'image/ic_dm.png'}
        , { 'type':'tweet', 'title': 'Messages'
            , 'load': ui.Main.load_messages
            , 'loadmore': ui.Main.loadmore_messages
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_dm
            , 'method': 'push'
            , 'interval': 120
            , 'item_type': 'id'
        });
    ui.Slider.add('retweets', {title:'Retweets', icon:'image/ic_retweet.png'}
        , { 'type':'tweet', 'title': 'Retweets'
            , 'load': ui.RetweetView.load_retweeted_to_me 
            , 'loadmore': ui.RetweetView.loadmore_retweeted_to_me
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'init': ui.RetweetView.init_view
            , 'header_html': ui.Template.retweets_header_t
            , 'former': ui.Template.form_tweet
            , 'method': 'poll'
            , 'interval': 180
            , 'item_type': 'id'
        });
    return;
},

hide:
function hide () {
    daemon.stop();
    ui.StatusBox.hide();
    globals.in_main_view = false;
    this.me.hide();
},

show:
function show () {
    daemon.start();
    $('.card').remove();
    ui.StatusBox.show();
    globals.in_main_view = true;
    this.me.show();
},

load_home:
function load_home(self, success, fail) {
    lib.twitterapi.get_home_timeline(
        self.since_id, null, conf.vars.items_per_request, 
        success);
},

loadmore_home:
function loadmore_home(self, success, fail) {
    var max_id = self.max_id;
    lib.twitterapi.get_home_timeline(
        1, max_id, conf.vars.items_per_request, 
        success);
},

load_mentions: 
function load_mentions(self, success, fail) {
    var since_id = self.since_id;
    lib.twitterapi.get_mentions(
        since_id, null, conf.vars.items_per_request, 
        success);
},

loadmore_mentions: 
function loadmore_mentions(self, success, fail) {
    var max_id = self.max_id;
    lib.twitterapi.get_mentions(
        1, max_id, conf.vars.items_per_request, 
        success);
},

load_messages: 
function load_messages(self, success, fail) {
    var since_id = self.since_id;
    lib.twitterapi.get_direct_messages(
        since_id, null
        , conf.vars.items_per_request, success);
},

loadmore_messages: 
function loadmore_messages(self, success, fail) {
    var max_id = self.max_id;
    lib.twitterapi.get_direct_messages(
        1, max_id, conf.vars.items_per_request, 
        success);
},

load_tweet_success:
function load_tweet_success(self, json) {
    if (self.changed) {
        ui.Slider.set_unread(self.name);
    }
    ret = ui.Main.add_tweets(self, json, false);
    // 
    var current_profile = conf.get_current_profile();
    var prefs = current_profile.preferences;
    var latest_id = prefs[self.name + '_latest_id'] || "0";
    var last_id = json[json.length - 1].id_str;
    if (util.compare_id(last_id, latest_id) > 0) {
        prefs[self.name + '_latest_id'] = last_id;
        conf.save_prefs(conf.current_name);
    }
    var i = json.length - 1;
    for ( ; i >= 0 ; i -= 1) {
        if (util.compare_id(json[i].id_str, latest_id) <= 0) {
            break;
        }
    }
    ret = json.length - i - 1;
    if (ret == 0) { 
        return ret;
    }
    // notify
    if (ui.Main.views[self.name].use_notify) {
        if (ui.Main.views[self.name].use_notify_type == 'count') {
            hotot_notify('Update page ' + self.name, ret + " new items."
                , null, 'count');
        } else {
            var user = ''; var text = '';
            for (var i = json.length - 1; json.length - 3 <= i && 0 <= i; i -= 1) {
                user = json[i].hasOwnProperty('user') ? json[i].user : json[i].sender;
                text = json[i].text;
                hotot_notify(user.screen_name, text
                    , user.profile_image_url , 'content');
            }
            if (3 < ret) {
                hotot_notify("Update page " + self.name 
                    , "and " + (ret - 2) + " new items remained."
                    , null, 'count');
            }
        }
        if (ui.Main.views[self.name].use_notify_sound) {
            $('#audio_notify').get(0).play();
        }
    }
    return ret;
},

load_people_success:
function load_people_success(self, json) {
    if (self.changed) {
        ui.Slider.set_unread(self.name);
    }
    return ui.Main.add_people(self, json.users);
},

loadmore_tweet_success:
function loadmore_tweet_success(self, json) {
    ui.Slider.set_unread(self.name);
    return ui.Main.add_tweets(self, json, true);
},

loadmore_people_success:
function loadmore_people_success(self, json) {
    ui.Slider.set_unread(self.name);
    return ui.Main.add_people(self, json.users);
},

add_people:
function add_people(self, users) {
    var new_tweets_height = 0;
    var html_arr = [];
    for (var i = 0, l = users.length; i < l; i += 1) {
        html_arr.push(self.former(users[i], self.name));
    }
    self._body.append(html_arr.join('\n'));
    // if timeline is not on the top
    // resume to the postion before new tweets were added
    // offset = N* (clientHeight + border-width)
    // @TODO 
    if (self.hasOwnProperty('_me') && self.resume_pos) {
        self._me.get(0).scrollTop += new_tweets_height + users.length;
    }

    // @TODO dumps to cache
    // bind events
    ui.Main.bind_tweets_action(users, self.name);
    toast.hide();
    return users.length;
},

add_tweets:
function add_tweets(self, json_obj, reversion, ignore_kismet) {
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
    json_obj = ui.Main.unique(json_obj);
    // apply drop filter
    if (ignore_kismet == undefined || ignore_kismet == false) {
        kismet.filter(json_obj, 'drop');
        kismet.filter(json_obj, 'mask');
    }
     
    var new_tweets_height = 0;
    // sort
    // if reversion: small ... large
    // else:         large ... small
    ui.Main.sort(json_obj, reversion);
    
    // insert the isoloated tweets.
    var i = 0;
    var batch_arr = [];
    while (i < json_obj.length) {
        var ret = ui.Main.insert_isolated_tweet(self, json_obj[i], reversion) 
        if (ret[0] == -1) {
            // remove the duplicate tweet from json_obj
            json_obj.splice(i, 1);
        } else if (ret[0] > 0) {
            var dom_id = self.name + '-' + json_obj[i].id_str;
            new_tweets_height += $('#'+dom_id).get(0).clientHeight;
            i += 1;
        } else { // ret[0] == 0
            batch_arr.push(json_obj[i])
            i += 1;
        }
    }
    // insert in batch
    ui.Main.sort(batch_arr, true);
    var batch_html = $.map(batch_arr, function (n, i) {
        return self.former(n, self.name);
    }).join('');
    if (reversion) {
        self._body.append(batch_html);
    } else {
        self._body.prepend(batch_html);
    }
    // calculator the height of remaining tweets
    for (var i = 0; i < batch_arr.length; i += 1) {
        var dom_id = self.name+'-'+batch_arr[i].id_str;
        new_tweets_height += $('#'+dom_id).get(0).clientHeight;
    }
    // prelaad 
    if (ui.Main.use_preload_conversation && self.hasOwnProperty('_me')) {
        for (var i = 0; i < json_obj.length; i += 1) {
            if (json_obj[i].in_reply_to_status_id_str == null) {
                continue;
            }
            var dom_id = self.name + '-' + json_obj[i].id_str;
            var thread_container = $($(
                    '#'+dom_id+' .tweet_thread')[0]);
            var listview = {'name': dom_id
                , 'former': ui.Template.form_tweet
                , '_body': thread_container};
            ui.Main.preload_thread(listview, json_obj[i]);
        }
    } 

    // if timeline is not on the top
    // resume to the postion before new tweets were added
    // offset = N* (clientHeight + border-width)
    if (self.hasOwnProperty('_me') && self.resume_pos) {
        self._me.get(0).scrollTop += new_tweets_height + json_obj.length;
    }

    // cache users' avatars in mentions
    /*
    if (container.pagename == 'mentions') {
        for (var i = 0, l = json_obj.length; i < l; i += 1){                      
            var user = typeof json_obj[i].sender != 'undefined'
                ? json_obj[i].sender : json_obj[i].user;
            util.cache_avatar(user);
        }
    }
    */
    // dumps to cache
    if (self.name != 'search') {
        db.get_tweet_cache_size(function (size) {
            if (db.MAX_TWEET_CACHE_SIZE < size) {
                toast.set("Reducing ... ").show(-1);
                db.reduce_tweet_cache(
                    parseInt(db.MAX_TWEET_CACHE_SIZE*2/3)
                , function () {
                    toast.set("Reduce Successfully!").show();
                    db.dump_tweets(json_obj);
                })
            } else {
                db.dump_tweets(json_obj);
            }
        });
    }
    // apply notify filter
    if (ignore_kismet == undefined) {
        kismet.filter(json_obj, 'notify');
    }
    // bind events
    ui.Main.bind_tweets_action(json_obj, self.name);
    toast.hide();
    return json_obj.length;
},

sort:
function sort(json_obj, reversion) {
    if (1 < json_obj.length) {
        json_obj.sort(function (a, b) {
            if (reversion)  {
                return util.compare_id(b.id_str, a.id_str); 
            } else {
                return util.compare_id(a.id_str, b.id_str); 
            }
        });
    }
},

insert_isolated_tweet:
function insert_isolated_tweet(self, tweet, reversion) {
    /* insert this tweet into a correct position in the order of id.
     * if the tweet is isoloated, then insert it & return [c, html]
     * if the tweet isn't isoloated, then return [0, html]
     * if the tweet is duplicate, return [-1, null]
     * */
    var this_one = tweet;
    var this_one_html = self.former(this_one, self.name);
    var next_one = ui.Main.get_next_tweet_dom(self, null, reversion);
    var c = 0;
    while (true) {
        if (next_one == null) {
            // insert to end of container
            // or the top of the container, 
            // according to argument `reversion`
            if (c != 0) {
                if (reversion) {
                    self._body.prepend(this_one_html);            
                } else {
                    self._body.append(this_one_html);            
                }
            }
            return [c, this_one_html];
        } else {
            var next_one_id = $(next_one).attr('tweet_id');
            var cmp_ret = util.compare_id(next_one_id, this_one.id_str);
            if (cmp_ret == 0) {
                //next_one_id == this.id_str
                return [-1, null];
            } else if (cmp_ret == -1) {
                //next_one_id < this.id_str
                if (reversion) {
                    next_one = ui.Main.get_next_tweet_dom(self, next_one, reversion);
                } else {
                    if (c != 0) { $(next_one).before(this_one_html); }
                    return [c, this_one_html];
                }
            } else {                
                //next_one_id > this.id_str
                if (reversion) {
                    if (c != 0) { $(next_one).after(this_one_html); }
                    return [c, this_one_html];
                } else {
                    next_one = ui.Main.get_next_tweet_dom(self, next_one, reversion);
                }
            }
        }
        c += 1;
    }
},

get_next_tweet_dom:
function get_next_tweet_dom(view, current, reversion) {
    /* return the next/prev brother DOM of current. 
     * if current is null, return the first/last DOM of tweets
     * if no tweet at the next position, return null
     * */
    var next_one = null;
    if (current == null) {
        next_one = reversion? view._body.find('.card:last')
            : view._body.find('.card:first');
    } else {
        next_one = reversion? $(current).prev('.card')
            : $(current).next('.card');
    }
    if (next_one.length == 0) next_one = null;
    return next_one;
},

bind_tweets_action:
function bind_tweets_action(tweets_obj, pagename) {
    var bind_sigle_action = function (tweet_obj) {
        var id = '#' + pagename + '-' + tweet_obj.id_str;
        $(id).click(
        function (event) {
            ui.Main.set_tweet_bar(id);
            if (event.button == 0) {
                ui.StatusBox.close();
                ui.ContextMenu.hide();
            }
            event.stopPropagation();
        });
        $(id).mouseover(function () {
            ui.Main.set_active_tweet_id(id);
            ui.Main.set_tweet_bar(id);
            event.stopPropagation();
        });

        $(id).find('.btn_tweet_thread:first').click(
        function (event) {
            ui.Main.on_expander_click(this, event);
        });

        $(id).find('.btn_tweet_thread_more:first').click(
        function (event) {
            ui.Main.on_thread_more_click(this, event);
        });

        $(id).find('.who_href').click(
        function (event) {
            open_people($(this).attr('href').substring(1));
            return false;
        });

        $(id).find('.hash_href').click(
        function (event) {
            ui.SearchView.do_search($(this).attr('href').substring(1));
            return false;
        });

        $(id).find('.tweet_source a.show').click(
        function (event) {
            var _this = $(this);
            var tweet_id = _this.attr("tweet_id");
            var list = $(".tweet_retweeters[tweet_id='" + tweet_id + "']");
            _this.text("loading...");
            lib.twitterapi.get_retweeted_by_whom(tweet_id, 100, function(result) {
                if (_this == null) {
                    return;
                }
                list.html("<ul></ul>");
                var ul = list.find("ul");
                for (var i = 0, l = result.length; i < l; i++) {
                   var p = result[i];
                   var li = $('<li><a href="#' + p.screen_name + '"><img height="24" width="24" title="@' + p.screen_name + ' (' + p.name + ')" src="' + p.profile_image_url + '"/></a></li>');
                    li.find("a").click(function() {
                        open_people($(this).attr('href').substring(1));
                    });
                    li.appendTo(ul);
                }
                $("<span/>").text(result.length + (result.length==1?" person":" people")).insertBefore(_this);
                _this.remove();
                _this = null;
            });
        });
    };
    for (var i = 0, l = tweets_obj.length; i < l; i += 1) {
        bind_sigle_action(tweets_obj[i]);
    }
},

on_reply_click:
function on_reply_click(btn, li_id, event) {
    var li = $(li_id);
    var id = (li.attr('retweet_id') == '' || li.attr('retweet_id') == undefined) ? li.attr('tweet_id'): li.attr('retweet_id');
    var screen_name = li.attr('screen_name');
    var text = $(li.find('.text')[0]).text();

    ui.StatusBox.reply_to_id = id;
    ui.StatusBox.set_status_info('<span class="info_hint">REPLY TO</span> '+ screen_name + ':"' + text + '"');
    ui.StatusBox.append_status_text('@' + li.attr('screen_name') + ' ');
    ui.StatusBox.open(
    function() {
        ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
        ui.StatusBox.change_mode(ui.StatusBox.MODE_REPLY);
    });
},

on_rt_click:
function on_rt_click(btn, li_id, event) {
    var li = $(li_id);
    var screen_name = li.attr('screen_name');
    var text = $(li.find('.text')[0]).text();

    ui.StatusBox.set_status_text("RT @" + screen_name
        + ': ' + text + ' ');
    ui.StatusBox.open(
    function() {
        ui.StatusBox.move_cursor(ui.StatusBox.POS_BEGIN);
        ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
    });
},

on_retweet_click:
function on_retweet_click(btn, li_id, event) {
    var li = $(li_id);
    var id = (li.attr('retweet_id') == '' || li.attr('retweet_id') == undefined) ? li.attr('tweet_id'): li.attr('retweet_id');
    if ($(btn).hasClass('retweeted')) {
        var rt_id = li.attr('my_retweet_id')
        toast.set(_('undo_retweeting_dots')).show(-1);
        lib.twitterapi.destroy_status(rt_id, 
        function (result) {
            toast.set(_('undo_successfully')).show();
            $(btn).removeClass('retweeted').attr('title', _('retweet this tweet'));
            li.removeClass('retweeted');
        });
    } else {
        toast.set(_('retweeting_dots')).show(-1);
        lib.twitterapi.retweet_status(id, 
        function (result) {
            toast.set(_('retweet_successfully')).show();
            li.attr('my_retweet_id', result.id_str);
            $(btn).addClass('retweeted').attr('title', _('undo_retweet'));
            li.addClass('retweeted');
        });
    }
},

on_reply_all_click:
function on_reply_all_click(btn, li_id, event) {
    var li = $(li_id);
    var id = (li.attr('retweet_id') == '' || li.attr('retweet_id') == undefined) ? li.attr('tweet_id'): li.attr('retweet_id');
    var screen_name = li.attr('screen_name');
    var text = $(li.find('.text')[0]).text();
    // @TODO reduce this process by entities
    var who_names = [ '@' + screen_name];
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
    ui.StatusBox.set_status_info('<span class="info_hint">'+_('reply to')+'</span>  ' + text);
    ui.StatusBox.append_status_text(who_names.join(' ') + ' ');
    ui.StatusBox.open(
    function() {
        ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
        ui.StatusBox.change_mode(ui.StatusBox.MODE_REPLY);
    });

},

on_dm_click:
function on_dm_click(btn, li_id, event) {
    var li = $(li_id);
    var screen_name = (li.attr('screen_name') == '' || li.attr('screen_name') == undefined)
        ?li.attr('sender_screen_name'):li.attr('screen_name');
    ui.StatusBox.set_dm_target(screen_name);
    ui.StatusBox.open(function () {
        ui.StatusBox.change_mode(ui.StatusBox.MODE_DM);
        ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
    });
},

on_del_click:
function on_del_click(btn, li_id, event) {
    var li = $(li_id);
    var id = (li.attr('retweet_id') == '' || li.attr('retweet_id') == undefined) ? li.attr('tweet_id'): li.attr('retweet_id');

    toast.set('Destroy ...').show(-1);
    lib.twitterapi.destroy_status(id, 
    function (result) {
        li.remove();
        toast.set(_('destroy_successfully')).show();
    });
},

on_dm_delete_click:
function on_dm_delete_click(btn, li_id, event) {
    var li = $(li_id);
    var id = li.attr('tweet_id');
    toast.set('Destroy ...').show(-1);
    lib.twitterapi.destroy_direct_messages(id, 
    function (result) {
        li.remove();
        toast.set(_('destroy_successfully')).show();
    });
},


on_fav_click:
function on_fav_click(btn, li_id, event) {
    var li = $(li_id);
    var id = (li.attr('retweet_id') == '' || li.attr('retweet_id') == undefined) ? li.attr('tweet_id'): li.attr('retweet_id');
    if ($(li).hasClass('faved')) {
        toast.set(_('un_favorite_this_tweet_dots')).show(-1);
        lib.twitterapi.destroy_favorite(id, 
        function (result) {
            toast.set(_('successfully')).show();
            $(li).removeClass('faved');
        });
    } else {
        toast.set(_('favorite_this_tweet_dots')).show(-1);
        lib.twitterapi.create_favorite(id, 
        function (result) {
            toast.set(_('Successfully')).show();
            $(li).addClass('faved');
        });
    }
},

on_follow_btn_click:
function on_follow_btn_click(btn, li_id, event) {
    var li = $(li_id);
    var screen_name = li.attr('screen_name');
    toast.set(_('follow_at') + screen_name + ' ' + _('dots')).show();
    lib.twitterapi.create_friendships(screen_name,
    function () {
        toast.set(
            _('follow_at') + screen_name+' '+ _('successfully')).show();
        li.attr('following', 'true');
    });
},

on_unfollow_btn_click:
function on_unfollow_btn_click(btn, li_id, event) {
    var li = $(li_id);
    var screen_name = li.attr('screen_name');
    toast.set(_('unfollow_at') + screen_name + ' '+ _('dots')).show();
    lib.twitterapi.destroy_friendships(screen_name,
    function () {
        toast.set(
            _('unfollow_at') + screen_name+ ' '+ _('successfully')).show();
        li.attr('following', 'false');
    });
},

on_thread_more_click:
function on_thread_more_click(btn, event) {
    var li = ui.Main.ctrl_btn_to_li(btn);
    var id = li.attr('retweet_id') == ''? li.attr('tweet_id'): li.attr('retweet_id');
    var reply_id = li.attr('reply_id');

    var thread_container = $(li.find('.tweet_thread')[0]);
    var listview = {'name': li.attr('id')
        , 'former': ui.Template.form_tweet, '_body': thread_container};
    li.find('.tweet_thread_hint').show();

    ui.Main.load_thread_proc(listview, reply_id, function () {
        li.find('.tweet_thread_hint').fadeOut();
        $(btn).hide();
    });
},

on_expander_click:
function on_expander_click(btn, event) {
    var li = ui.Main.ctrl_btn_to_li(btn);
    var id = li.attr('retweet_id') == ''
        ? li.attr('tweet_id'): li.attr('retweet_id');
    var reply_id = li.attr('reply_id');

    var container = $(li.find('.tweet_thread')[0]);

    container.parent().toggle();
    if ($(btn).hasClass('expand')) {
        $(btn).removeClass('expand');
    } else {
        $(btn).addClass('expand');
        if (container.children('.card').length == 0) {
            li.find('.tweet_thread_hint').show();
            li.find('.btn_tweet_thread_more').hide();

            var listview = {'name': li.attr('id')
                , 'former': ui.Template.form_tweet
                , '_body': container};
            ui.Main.load_thread_proc(listview, reply_id, function () {
                li.find('.tweet_thread_hint').fadeOut();
            });
        }
    }
},

load_thread_proc:
function load_thread_proc(listview, tweet_id, on_finish) {
    var load_thread_proc_cb = function (prev_tweet_obj) {
        //listview.resume_pos = false;
        var count=ui.Main.add_tweets(listview, [prev_tweet_obj], true, true);
        // load the prev tweet in the thread.
        var reply_id = prev_tweet_obj.in_reply_to_status_id_str;
        if (reply_id == null) { // end of thread.
            on_finish();
            return ;
        } else { 
            ui.Main.load_thread_proc(listview, reply_id, on_finish);
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
function preload_thread(listview, tweet_obj) {
    db.get_tweet(tweet_obj.in_reply_to_status_id_str, 
    function (tx, rs) {
        if (rs.rows.length != 0) {
            var prev_tweet_obj = JSON.parse(rs.rows.item(0).json);
            var li = $(listview._body.parents('.card')[0]);
            ui.Main.add_tweets(listview, [prev_tweet_obj], true, true);
            li.find('.btn_tweet_thread').addClass('expand');
            li.find('.tweet_thread_hint').hide();
            if (prev_tweet_obj.in_reply_to_status_id == null) {
                li.find('.btn_tweet_thread_more').hide();
            }
            listview._body.parent().show();
        }
    }); 
},

move_to_tweet:
function move_to_tweet(pos) {
    var target = null;
    var current = null;
    var cur_view = ui.Main.views[ui.Slider.current];
    if (!cur_view.hasOwnProperty('selected_item_id')) {
        cur_view.selected_item_id 
            = '#'+ cur_view._body.find('.card:first').attr('id');
    }
    current = $(cur_view.selected_item_id);
    if (current.length == 0) {
        return;
    }
    var container = cur_view._body;
    if (pos == 'top') {
        target = container.find('.card:first');
    } else if (pos == 'bottom') {
        container.find('.card').show();
        target = container.find('.card:last');
    } else if (pos == 'next') {
        target = current.next('.card');
    } else if (pos == 'prev') {
        target = current.prev('.card');
    } else if (pos == 'orig') {
        target = current;
    } else {
        target = $(pos); 
    }

    if (target.length == 0) {
        target = current;
    }
    cur_view._me.stop().animate(
        {scrollTop: target.get(0).offsetTop - current.height()}, 300);
    current.removeClass('selected');
    target.addClass('selected');
    cur_view.selected_item_id = '#'+ target.attr('id');
    target.focus();
},

set_active_tweet_id:
function set_active_tweet_id(id) {
    ui.Main.active_tweet_id = id;
},

set_tweet_bar: 
function set_tweet_bar(li_id) {
    var li = $(li_id);
    var tweet_block = $(li.parents('.tweetview')[0]);
    // place tweet bar to a correct position
    var offset_top = 0; var offset_right = 0; 
    if (li.attr('in_thread') == 'true') {
        var vc = li.parents('.card')[0];
        offset_top = vc.offsetTop
            - tweet_block.get(0).scrollTop + li.get(0).offsetTop + 5;
        offset_right = ($(window).width() - $('#aside').width())
            - vc.offsetLeft + vc.width + li.get(0).offsetLeft + 25;
    } else {
        offset_top = li.get(0).offsetTop 
            - tweet_block.get(0).scrollTop + 5;
        offset_right = ($(window).width() - $('#aside').width())
            - (li.get(0).offsetLeft + li.width()) + 5;
    }
    $('#tweet_bar').css('top', offset_top + 'px');
    $('#tweet_bar').css('right', offset_right + 'px');
    $('#tweet_bar').show();

    // show different items according type of card
    var group_map = {
          'tweet': [$('#tweet_reply_btn'), $('#tweet_retweet_btn')
            , $('#tweet_more_menu_btn')
            , $('#tweet_rt_btn'), $('#tweet_fav_btn')
            , $('#tweet_reply_all_btn'), $('#tweet_dm_btn')]
        , 'message': [$('#tweet_dm_reply_btn'), $('#tweet_dm_delete_btn'),$('#tweet_more_menu_btn')]
        , 'search': [$('#tweet_reply_btn'), $('#tweet_retweet_btn')
            , $('#tweet_more_menu_btn')
            , $('#tweet_rt_btn'), $('#tweet_fav_btn')
            , $('#tweet_reply_all_btn'), $('#tweet_dm_btn')]
        , 'people': [$('#people_follow_btn'), $('people_unfollow_btn')]
    };

    if (group_map.hasOwnProperty(li.attr('type'))) {
        $('.tweet_bar_btn').parent().hide();
        $('.tweet_more_menu_btn').parent().hide();
        for (var i = 0, l = group_map[li.attr('type')].length; i < l; i += 1) {
            group_map[li.attr('type')][i].parent().show();
        }
    } else {
        $('#tweet_bar').hide();
    } 
    // enable exts
    $('.ext_tweet_more_menu_btn').parent().show();

    // others
    if (li.attr('deletable') == 'true') {
        $('#tweet_del_btn').parent().css('display', 'block');
    } else {
        $('#tweet_del_btn').parent().css('display', 'none');
    }
    if (li.attr('retweetable') == 'true') {
        $('#tweet_retweet_btn').parent().css('display', 'inline-block');
    } else {
        $('#tweet_retweet_btn').parent().css('display', 'none');
    }
    if (li.attr('type') == 'people') {
        if (li.attr('following') == 'true') {
            $('#people_follow_btn').parent().hide();
            $('#people_unfollow_btn').parent().show();
        } else {
            $('#people_follow_btn').parent().show();
            $('#people_unfollow_btn').parent().hide();
        }
    }
    if (li.hasClass('retweeted')) {
        $('#tweet_retweet_btn').addClass('retweeted');
    } else {
        $('#tweet_retweet_btn').removeClass('retweeted');
    }
    if (li.hasClass('faved')) {
        $('#tweet_fav_btn').addClass('faved');
    } else {
        $('#tweet_fav_btn').removeClass('faved');
    }    
    if ($('#tweet_bar li:last').hasClass('separator')) {
        $('#tweet_bar li:last').hide();
    } else {
        $('#tweet_bar li.separator').show();
    }
},

unique:
function unique (items) {
    var o = {}, i, l = items.length, r = [];
    for(i=0; i < l; i += 1)
        o[items[i].id_str] = items[i];
    for(i in o) r.push(o[i]);
    return r;
},


ctrl_btn_to_li:
function ctrl_btn_to_li(btn) {
    return $($(btn).parents('.card')[0]);
},

};


