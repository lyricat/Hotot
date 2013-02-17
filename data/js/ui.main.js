if (typeof ui == 'undefined') var ui = {};
ui.Main = {

me: {},

active_tweet_id: null,

selected_tweet_id: null,

use_preload_conversation: true,

use_auto_loadmore: false,

// info of blocks. all pages use as containers to display tweets.
views: {
},

init:
function init () {
    this.me = $('#main_page');
    //tweet bar
    // -- more menu --
    $('#tweet_alt_retweet_btn').click(
    function (event) {
        ui.Main.on_retweet_click(this, ui.Main.active_tweet_id, event);
        return false;
    });
    $('#tweet_alt_reply_btn').click(
    function (event) {
        ui.Main.on_reply_click(this, ui.Main.active_tweet_id, event);
        return false;
    });
    $('#tweet_rt_btn').click(
    function (event) {
        ui.Main.on_rt_click(this, ui.Main.active_tweet_id, event);
        return false;
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

    $('#tweet_filter_btn').click(
    function (event) {
        var li = $(ui.Main.active_tweet_id);
        var id = (li.attr('retweet_id') == '' || li.attr('retweet_id') == undefined) ? li.attr('tweet_id'): li.attr('retweet_id');
        db.get_tweet(id, function (tx, rs) {
            ui.KismetDlg.load_guide(JSON.parse(rs.rows.item(0).json));
            ui.KismetDlg.guide_dialog.open();
        });
    });

    $('#tweet_set_color_btn').click(
    function (ev) {
        var li = $(ui.Main.active_tweet_id);
        var screen_name = li.attr('screen_name');
        ui.KismetDlg.color_guide_dialog.open();
        $('#kismet_color_guide_dialog').data('screen_name', screen_name);
    });

    $('#tweet_readlater_btn').click(
    function (ev) {
        var text = $(ui.Main.active_tweet_id + ' .card_body').children('.text').text();
        var reg_url = new RegExp('[a-zA-Z]+:\\/\\/(' + ui.Template.reg_url_path_chars_1+'+)');
        var m = text.match(reg_url);
        if (m == null){
            var url = 'http://twitter.com/' + $(ui.Main.active_tweet_id).attr('screen_name') + '/status/' + $(ui.Main.active_tweet_id).attr('tweet_id');
        } else {
            var url = m[1];
        };
        toast.set('Save to ..').show();
        globals.readLaterServ.addItem(
            conf.get_current_profile().preferences.readlater_service,
            url, text,
            function (ret) {
                if (ret.indexOf('200')!=-1 || ret.indexOf('201')!=-1) {
                    toast.set('Saved!').show();
                } else {
                    toast.set('Error Code:' + result).show()
                }
            });        
    });

    $('#tweet_more_menu').mouseleave(function(){
        $(this).hide();
    });

},

hide:
function hide () {
    daemon.stop();
    ui.StatusBox.close();
    globals.signed_in = false;
    this.me.hide();
},

show:
function show () {
    daemon.start();
    globals.signed_in = true;
    this.me.show();
},

load_home:
function load_home(self, success, fail) {
    globals.twitterClient.get_home_timeline(
        self.since_id, null, conf.vars.items_per_request,
        success);
},

loadmore_home:
function loadmore_home(self, success, fail) {
    var max_id = self.max_id;
    globals.twitterClient.get_home_timeline(
        null, max_id, conf.vars.items_per_request,
        success);
},

load_mentions:
function load_mentions(self, success, fail) {
    globals.twitterClient.get_mentions(
        self.since_id, null, conf.vars.items_per_request,
        success);
},

loadmore_mentions:
function loadmore_mentions(self, success, fail) {
    globals.twitterClient.get_mentions(
        null, self.max_id, conf.vars.items_per_request,
        success);
},

load_messages:
function load_messages(self, success, fail) {
    var since_id = self.since_id;
    globals.twitterClient.get_direct_messages(
        since_id, null
        , conf.vars.items_per_request, success);
    globals.twitterClient.get_sent_direct_messages(
        since_id, null
        , conf.vars.items_per_request, success);
},

loadmore_messages:
function loadmore_messages(self, success, fail) {
    globals.twitterClient.get_direct_messages(
        null, self.max_id, conf.vars.items_per_request,
        success);
    globals.twitterClient.get_sent_direct_messages(
        null, self.max_id, conf.vars.items_per_request,
        success);
},

load_tweet_success:
function load_tweet_success(self, json) {
    var ret = ui.Main.add_tweets(self, json, false);
    // in fact, ret equals to json.length
    if (ret == 0) {
        return json.length;
    }

    if (self.incoming_num <= 0) {
        return json.length;
    }
    hotot_log('incoming_num of '+self.name, self.incoming_num);

    ui.Slider.set_unread(self.name);
    // notify
    if (ui.Main.views[self.name].use_notify) {
        var user = ''; var text = '';
        var notify_count = 0
        for (var i = 0; i < self.incoming_num && i <= 3; i += 1) {
            user = json[i].hasOwnProperty('user') ? json[i].user : json[i].sender;
            if (user.screen_name == globals.myself.screen_name)
                continue;
            text = json[i].text;
            hotot_notify(user.screen_name, text, user.profile_image_url , 'content');
            notify_count += 1;
        }
        if (3 < notify_count) {
            hotot_notify("Update page " + self.name
                , "and " + (notify_count - 2) + " new items remained."
                , null, 'count');
        }
        unread_alert(self.incoming_num);
        if (ui.Main.views[self.name].use_notify_sound) {
            $('#audio_notify').get(0).play();
        }
    }
    // push state
    if (util.is_native_platform()) {
        hotot_action('system/incoming/' + self.name + '/'
            + encodeURIComponent(JSON.stringify(json)))
    }
    return json.length;
},

load_people_success:
function load_people_success(self, json) {
    var ret = ui.Main.add_people(self, json.users);
    if (0 < self.incoming_num) {
        ui.Slider.set_unread(self.name);
    }
    return ret;
},

load_list_success:
function load_list_success(self, json) {
    var ret = ui.Main.add_people(self, json);
    if (0 < self.incoming_num) {
        ui.Slider.set_unread(self.name);
    }
    return ret;
},

load_listed_list_success:
function load_listed_list_success(self, json) {
    var ret = ui.Main.add_people(self, json.lists);
    if (0 < self.incoming_num) {
        ui.Slider.set_unread(self.name);
    }
    return ret;
},

loadmore_tweet_success:
function loadmore_tweet_success(self, json) {
    var ret = ui.Main.add_tweets(self, json, true);
    if (0 < self.incoming_num) {
        ui.Slider.set_unread(self.name);
    }
    return ret;
},

loadmore_people_success:
function loadmore_people_success(self, json) {
    var ret = ui.Main.add_people(self, json.users);
    if (0 < self.incoming_num) {
        ui.Slider.set_unread(self.name);
    }
    return ret;
},

loadmore_listed_list_success:
function loadmore_listed_list_success(self, json) {
    var ret = ui.Main.add_people(self, json.lists);
    if (0 < self.incoming_num) {
        ui.Slider.set_unread(self.name);
    }
    return ret;
},

destroy_view:
function destroy_view(view) {
    ui.Slider.remove(view.name);
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
        self._content.get(0).scrollTop += new_tweets_height + users.length;
    }

    // @TODO dumps to cache
    // bind events
    for (var i = 0, l = users.length; i < l; i += 1) {
        ui.Main.bind_tweet_action('#'+self.name + '-' + users[i].id_str );
    }
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
    ui.Main.unique(json_obj);
    // apply kismet filter
    if (ignore_kismet == undefined || ignore_kismet == false) {
        if (self.name.indexOf('kismet_') != 0){
			for(var i=0;i<json_obj.length;i++){
				json_obj[i].column =/^[^-]*/.exec(self.name)[0] ;
			}
            json_obj = kismet.filter(json_obj);
        }
    }

    var new_tweets_height = 0;
    // sort
    // if reversion: large ... small
    // else:         small ... large
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
        return self.former(n, self.name, self.thread_container);
    }).join('');
    if (reversion) {
        self._body.append(batch_html);
    } else {
        self._body.prepend(batch_html);
    }

    // preload
    if (ui.Main.use_preload_conversation && self.hasOwnProperty('_me')) {
        for (var i = 0; i < json_obj.length; i += 1) {
            if (json_obj[i].in_reply_to_status_id_str == null
                && json_obj[i].in_reply_to_status_id == null) {
                continue;
            }
            var dom_id = self.name + '-' + json_obj[i].id_str;
            var thread_container = $($(
                    '#'+dom_id+' .tweet_thread')[0]);
            var listview = {'name': dom_id
                , 'thread_container': true
                , 'former': ui.Template.form_tweet
                , '_body': thread_container};
            ui.Main.preload_thread(listview, json_obj[i]);
        }
    }

    //setTimeout(function () {
        // calculator the height of remaining tweets
        for (var i = 0; i < batch_arr.length; i += 1) {
            var dom_id = self.name+'-'+batch_arr[i].id_str;
            new_tweets_height += $('#'+dom_id).get(0).clientHeight;
        }
        
        // if timeline is not on the top
        // resume to the postion before new tweets were added
        // offset = N* (clientHeight + border-width)
        if (self.hasOwnProperty('_me') && self.resume_pos) {
            /*
            self._me.animate(
                {scrollTop: (self._me.get(0).scrollTop + new_tweets_height + json_obj.length) + 'px'}, 200);
                */
            self._content.get(0).scrollTop += new_tweets_height + json_obj.length;
        }
    //}, 50);

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
    db.dump_tweets(json_obj);

    /*
    if (!reversion && json_obj.length != 0) {
        if (self.item_type == 'cursor') {       // friedns or followers
            self.changed = (self.cursor != json_obj.next_cursor_str);
        } else if (self.item_type == 'id'){     // other
            self.changed = (self.since_id != json_obj[json_obj.length - 1].id_str);
        }
    } else {
        self.changed = false;
    }
    */

    if (!reversion && json_obj.length != 0 && self.item_type == 'id') {
        var current_profile = conf.get_current_profile();
        var prefs = current_profile.preferences;
        if (!prefs.hasOwnProperty('views_lastest_id')) {
            prefs.views_lastest_id = {};
        }
        var latest_id = prefs.views_lastest_id[self.name + '_latest_id'] || "0";
        var last_id = json_obj[json_obj.length - 1].id_str;
        if (util.compare_id(last_id, latest_id) > 0) {
            prefs.views_lastest_id[self.name + '_latest_id'] = last_id;
        }
        self.incoming_num = 0;
        for (var i = json_obj.length - 1; json_obj.length - 3 <= i && 0 <= i; i -= 1, self.incoming_num += 1) {
            if (util.compare_id(json_obj[i].id_str, latest_id) <= 0) {
                break;
            }
        }
    } else {
        self.incoming_num = 0;
    }

    // bind events
    for (var i = 0, l = json_obj.length; i < l; i += 1) {
        ui.Main.bind_tweet_action('#'+self.name +'-'+json_obj[i].id_str);
    }
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
    var this_one_html = self.former(this_one, self.name, self.thread_container);
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

bind_tweet_action:
function bind_tweet_action(id) {
    $(id).click(
    function (event) {
        if (event.button == 0) {
            var id = '#' + this.id;
            $(ui.Main.selected_tweet_id).removeClass('selected');
            ui.Main.selected_tweet_id = id;
            $(id).addClass('selected');
            ui.ContextMenu.hide();
            ui.Main.closeTweetMoreMenu();
        }
        event.stopPropagation();
    }).mouseover(function (event) {
        ui.Main.set_active_tweet_id('#' + this.id);
        event.stopPropagation();
    }).hover(function (event) {
        event.stopPropagation();
        $(this).children('.tweet_bar').show();
        var p = $(event.target).parents('.tweet_thread_wrapper');
        if (p.length > 0) {
            p.siblings('.tweet_bar').hide();
        }
    }, function (event) {
        event.stopPropagation();
        $(this).children('.tweet_bar').hide();
        var p = $(event.target).parents('.tweet_thread_wrapper');
        if (p.length > 0 && $(event.relatedTarget).parents('.card')[0] === p.parents('.card')[0]) {
            p.siblings('.tweet_bar').show();
        }
    });

    if (!util.is_native_platform()) {
        $(id).find('a[target]').click(function (ev) {
            if (ev.which != 1 && ev.which != 2) {
                return;
            }

            var link = $(this).attr('href');
            if (conf.vars.platform === 'Chrome') {
                chrome.tabs.create(
                  { url: link, active: ev.which == 1 },
                  function(){}
                )
                return false;
            }
        });
    }


    $(id).find('a[full_text_id]').unbind().click(function (ev) {
        var full_text_id = $(this).attr('full_text_id');
        globals.network.do_request('GET', 
            'http://hotot.in/tweet/'+full_text_id+'.json', 
            {}, {}, null,
            function (result) {
                if (result && result.full_text) {
                    $(id).find('.text_inner:eq(0) a').unbind();
                    $(id).find('.text_inner:eq(0)').empty();
                    $(id).find('.text_inner:eq(0)').html(
                        ui.Template.form_text_raw(result.full_text)
                    );
                    ui.Main.bind_tweet_text_action(id);
                } 
            },
            function () {
                toast.set('fetch full text failed.').show();
            });
        return false;
    });

    $(id).find('a[direct_url]').click(function () {
        var direct_url = $(this).attr('direct_url');
        if (typeof (direct_url) != 'undefined') {
            ui.Previewer.reload(direct_url);
            ui.Previewer.open();
            return false;
        }
        return false;
    });

    ui.Main.bind_tweet_text_action(id);

    $(id).find('.btn_tweet_thread:first').click(
    function (event) {
        ui.Main.on_expander_click(this, event);
    });

    $(id).find('.btn_tweet_thread_more:first').click(
    function (event) {
        ui.Main.on_thread_more_click(this, event);
    });

    $(id).find('.tweet_source a.show').click(
    function (event) {
        var _this = $(this);
        var tweet_id = _this.attr("tweet_id");
        var list = $(".tweet_retweeters[tweet_id='" + tweet_id + "']");
        _this.text("loading...");
        globals.twitterClient.get_retweeted_by_whom(tweet_id, 100, function(result) {
            if (_this == null) {
                return;
            }
            list.empty();
            var ul = $('<ul/>').appendTo(list);
            for (var i = 0, l = result.length; i < l; i++) {
                var p = result[i];
                var li = $('<li/>');
                var a = $('<a/>').appendTo(li).attr('href', '#' + p.screen_name);
                $('<img height="24" width="24"/>').attr({'title': '@' + p.screen_name + ' (' + p.name + ')', 'src': p.profile_image_url}).appendTo(a);
                a.click(function(event) {
                    if (event.which == 1) {
                        open_people($(this).attr('href').substring(1));
                    } else if (event.which == 2) {
                        open_people($(this).attr('href').substring(1),{},true);
                    }
                });
                li.appendTo(ul);
            }
            $("<span/>").text(result.length + (result.length==1?" person":" people")).insertBefore(_this);
            _this.remove();
            _this = null;
        });
    });

    //tweet bar buttons
    $(id).find('.tweet_more_menu_trigger').click(function(event){
        if (ui.Main.isTweetMoreMenuClosed) {
            ui.Main.openTweetMoreMenu($(id), $(this));
        } else {
            ui.Main.closeTweetMoreMenu();
        }
        return false;
    });

    // type: tweet
    $(id).find('.tweet_reply_btn').click(function(ev) {
        if (conf.get_current_profile().preferences.use_alt_reply) {
            ui.Main.on_reply_all_click(this, ui.Main.active_tweet_id, ev);
        } else {
            ui.Main.on_reply_click(this, ui.Main.active_tweet_id, ev);
        }
        return false;
    }).mouseenter(function (ev) {
        if (conf.get_current_profile().preferences.use_alt_reply) {
            $(this).attr('title', 'Reply All.');
        } else {
            $(this).attr('title', 'Reply this tweet.');
        }
    });

    $(id).find('.tweet_retweet_btn').click(
    function (ev) {
        if (conf.get_current_profile().preferences.use_alt_retweet) {
            ui.Main.on_rt_click(this, ui.Main.active_tweet_id, ev);
        } else {
            ui.Main.on_retweet_click(this, ui.Main.active_tweet_id, ev);
        }
        return false;
    }).mouseenter(function (ev) {
        if (conf.get_current_profile().preferences.use_alt_retweet) {
            $(this).attr('title', 'Quote this tweet.');
        } else {
            $(this).attr('title', 'Retweet/Un-retweet this tweet.');
        }
    });
    $(id).find('.tweet_fav_btn').click(
    function (event) {
        ui.Main.on_fav_click(this, ui.Main.active_tweet_id, event);
        return false;
    });

    // type: message
    $(id).find('.tweet_dm_reply_btn').click(
    function (event) {
        ui.Main.on_dm_click(this, ui.Main.active_tweet_id, event);
        return false;
    });
    $(id).find('.tweet_dm_delete_btn').click(
    function (event) {
        ui.Main.on_dm_delete_click(this, ui.Main.active_tweet_id, event);
        return false;
    });

    // type: people
    $(id).find('.follow_btn').click(
    function (event) {
        ui.Main.on_follow_btn_click(this, ui.Main.active_tweet_id, event);
    });
    $(id).find('.unfollow_btn').click(
    function (event) {
        ui.Main.on_unfollow_btn_click(this, ui.Main.active_tweet_id, event);
    });
},

bind_tweet_text_action:
function bind_tweet_text_action(id) {
    $(id).find('.who_href').click(
    function (event) {
        if (event.which == 1) {
            open_people($(this).attr('href').substring(1));
        }else if (event.which == 2) {
            open_people($(this).attr('href').substring(1), {}, true);
        }
        return false;
    });

    $(id).find('.list_href').click(
    function (event) {
        var target = $(this).attr('href').substring(1).split('/');
        open_list(target[0], target[1]);
        return false;
    });

    $(id).find('.hash_href').click(
    function (event) {
        ui.Slider.addDefaultView('search', {}) || ui.Slider.add('search');
        ui.Main.views.search._header.find('.search_entry').val($(this).attr('href'));
        ui.Main.views.search._header.find('.search_tweet').click();
        return false;
    });
},

unbind_tweet_action:
function unbind_tweet_action(li_id){
    $(li_id + ' a').unbind();
    $(li_id).unbind();
},

on_reply_click:
function on_reply_click(btn, li_id, event) {
    var li = $(li_id);
    var id = (li.attr('retweet_id') == '' || li.attr('retweet_id') == undefined) ? li.attr('tweet_id'): li.attr('retweet_id');
    var screen_name = li.attr('screen_name');
    var text = $(li.find('.text')[0]).text();
    var orig_text = $('#tbox_status').val();

    ui.StatusBox.reply_to_id = id;
    ui.StatusBox.set_reply_info(screen_name, text);
    if (event && event.shiftKey) {
        if (orig_text.indexOf('@'+screen_name) == -1) {
            ui.StatusBox.insert_status_text('@' + li.attr('screen_name') + ' ', null);
        }
    } else {
        ui.StatusBox.set_status_text("@" + screen_name + ' ');
    }
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
    var _text = $(li.find('.text')[0]);
    var text = _text.attr('alt') || _text.text();

    ui.StatusBox.set_status_text(" RT @" + screen_name
        + ': ' + text + ' ');
    ui.StatusBox.open(
    function() {
        ui.StatusBox.move_cursor(ui.StatusBox.POS_BEGIN);
        ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
        ui.StatusBox.update_status_len();
    });
},

on_retweet_click:
function on_retweet_click(btn, li_id, event) {
    var li = $(li_id);
    var id = (li.attr('retweet_id') == '' || li.attr('retweet_id') == undefined) ? li.attr('tweet_id'): li.attr('retweet_id');
    if (li.hasClass('retweeted')) {
        var rt_id = li.attr('my_retweet_id')
        toast.set(_('undo_retweeting_dots')).show(-1);
        globals.twitterClient.destroy_status(rt_id,
        function (result) {
            toast.set(_('undo_successfully')).show();
            li.removeClass('retweeted');
        });
    } else {
        toast.set(_('retweeting_dots')).show(-1);
        globals.twitterClient.retweet_status(id,
        function (result) {
            toast.set(_('retweet_successfully')).show();
            li.attr('my_retweet_id', result.id_str);
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
    var orig_text = $('#tbox_status').val();
    // @TODO reduce this process by entities
    var who_names = [ '@' + screen_name];
    var match = ui.Template.reg_user.exec(text);
    while (match != null ) {
        if (match[2] != globals.myself.screen_name) {
            var name = '@' + match[2];
            if (orig_text.indexOf(name) == -1 && who_names.indexOf(name) == -1) {
                who_names.push(name);
            }
        }
        match = ui.Template.reg_user.exec(text);
    }

    ui.StatusBox.reply_to_id = id;
    ui.StatusBox.set_reply_info(screen_name, text);
    if (event && event.shiftKey) {
        ui.StatusBox.append_status_text(who_names.join(' ') + ' ');
    } else {
        ui.StatusBox.set_status_text(who_names.join(' ') + ' ');
    }
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
    ui.StatusBox.set_status_text('');
    ui.StatusBox.open(
    function () {
        ui.StatusBox.change_mode(ui.StatusBox.MODE_DM);
        ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
    });
},

on_del_click:
function on_del_click(btn, li_id, event) {
    var li = $(li_id);
    var id = (li.attr('retweet_id') == '' || li.attr('retweet_id') == undefined) ? li.attr('tweet_id'): li.attr('retweet_id');

    toast.set('Destroy ...').show(-1);
    if (li.attr('type') === 'message') {
        globals.twitterClient.destroy_direct_messages(id,
        function (result) {
            ui.Main.unbind_tweet_action(li_id);
            li.remove();
            toast.set(_('destroy_successfully')).show();
        });
    } else {
        globals.twitterClient.destroy_status(id,
        function (result) {
            ui.Main.unbind_tweet_action(li_id);
            li.remove();
            toast.set(_('destroy_successfully')).show();
        });
    }
},

on_fav_click:
function on_fav_click(btn, li_id, event) {
    var li = $(li_id);
    var id = (li.attr('retweet_id') == '' || li.attr('retweet_id') == undefined) ? li.attr('tweet_id'): li.attr('retweet_id');
    if (li.hasClass('faved')) {
        toast.set(_('un_favorite_this_tweet_dots')).show(-1);
        globals.twitterClient.destroy_favorite(id,
        function (result) {
            toast.set(_('successfully')).show();
            li.removeClass('faved');
        });
    } else {
        toast.set(_('favorite_this_tweet_dots')).show(-1);
        globals.twitterClient.create_favorite(id,
        function (result) {
            toast.set(_('successfully')).show();
            li.addClass('faved');
        });
    }
},

on_follow_btn_click:
function on_follow_btn_click(btn, li_id, event) {
    var li = $(li_id);
    if (li.attr('type') == 'people') {
        var screen_name = li.attr('screen_name');
        toast.set(_('follow_at') + screen_name + ' ' + _('dots')).show();
        globals.twitterClient.create_friendships(screen_name,
        function () {
            toast.set(
                _('follow_at') + screen_name+' '+ _('successfully')).show();
            li.attr('following', 'true').addClass('following');
        });
    } else if (li.attr('type') == 'list') {
        var screen_name = li.attr('screen_name');
        var slug = li.attr('slug');
        toast.set(_('follow_at') + screen_name + '/' + slug + ' ' + _('dots')).show();
        globals.twitterClient.create_list_subscriber(screen_name, slug,
        function () {
            toast.set(
                _('follow_at') + screen_name + '/' + slug + ' '+ _('successfully')).show();
            li.attr('following', 'true').addClass('following');
        });
    }
},

on_unfollow_btn_click:
function on_unfollow_btn_click(btn, li_id, event) {
    var li = $(li_id);
    if (li.attr('type') == 'people') {
        var screen_name = li.attr('screen_name');
        toast.set(_('unfollow_at') + screen_name + ' '+ _('dots')).show();
        globals.twitterClient.destroy_friendships(screen_name,
        function () {
            toast.set(
                _('unfollow_at') + screen_name+ ' '+ _('successfully')).show();
            li.attr('following', 'false').removeClass('following');
        });
    } else if (li.attr('type') == 'list') {
        var screen_name = li.attr('screen_name');
        var slug = li.attr('slug');
        toast.set(_('unfollow_at') + screen_name + '/' + slug + ' ' + _('dots')).show();
        globals.twitterClient.destroy_list_subscriber(screen_name, slug,
        function () {
            toast.set(
                _('unfollow_at') + screen_name + '/' + slug + ' '+ _('successfully')).show();
            li.attr('following', 'false').removeClass('following');
        });
    }
},

on_open_link_btn_click:
function on_open_link_btn_click(btn, li_id, event) {
    var li = $(li_id);
    var link = li.attr('link');
    if (link.length > 0) window.open(link, '_blank');
},

on_open_people_btn_click:
function on_open_people_btn_click(btn, li_id, event) {
    var li = $(li_id);
    var screen_name = (li.attr('screen_name') == '' || li.attr('screen_name') == undefined)
        ?li.attr('sender_screen_name'):li.attr('screen_name');
    if (screen_name !== undefined && screen_name !== '')
        open_people(screen_name);
},

on_thread_more_click:
function on_thread_more_click(btn, event) {
    var li = ui.Main.ctrl_btn_to_li(btn);
    var id = li.attr('retweet_id') == ''? li.attr('tweet_id'): li.attr('retweet_id');
    var reply_id = li.attr('reply_id');

    var thread_container = $(li.find('.tweet_thread')[0]);
    var listview = {'name': li.attr('id')
        , 'thread_container': true
        , 'former': ui.Template.form_tweet
        , '_body': thread_container};
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

    if ($(btn).hasClass('expand')) {
        $(btn).removeClass('expand');
        container.parent().hide();
    } else {
        $(btn).addClass('expand');
        container.parent().show();
        if (container.children('.card').length == 0) {
            li.find('.tweet_thread_hint').show();
            li.find('.btn_tweet_thread_more').hide();

            var listview = {'name': li.attr('id')
                , 'thread_container': true
                , 'former': ui.Template.form_tweet
                , '_body': container};
            ui.Main.load_thread_proc(listview, reply_id, function () {
                li.find('.tweet_thread_hint').fadeOut();
            }, function (xhr, textStatus, errorThrown) {
                li.find('.tweet_thread_hint').fadeOut();
            });
        }
    }
},

load_thread_proc:
function load_thread_proc(listview, tweet_id, on_finish, on_error) {
    var load_thread_proc_cb = function (prev_tweet_obj) {
        //listview.resume_pos = false;
        var count=ui.Main.add_tweets(listview, [prev_tweet_obj], true, true);
        // load the prev tweet in the thread.
        var reply_id = prev_tweet_obj.hasOwnProperty('in_reply_to_status_id_str') 
            ? prev_tweet_obj.in_reply_to_status_id_str: prev_tweet_obj.in_reply_to_status_id;
        if (reply_id == null) { // end of thread.
            on_finish();
            return ;
        } else {
            reply_id = reply_id.toString();
            ui.Main.load_thread_proc(listview, reply_id, on_finish, on_error);
        }
    }

    db.get_tweet(tweet_id,
    function (tx, rs) {
        if (rs.rows.length == 0) {
            globals.twitterClient.show_status(tweet_id,
            function (result) {
                load_thread_proc_cb(result);
            }, on_error);
        } else {
            load_thread_proc_cb(JSON.parse(rs.rows.item(0).json));
        }
    });
},

preload_thread:
function preload_thread(listview, tweet_obj) {
    var reply_id = tweet_obj.hasOwnProperty('in_reply_to_status_id_str') ? tweet_obj.in_reply_to_status_id_str: tweet_obj.in_reply_to_status_id;
    if (reply_id == null) return;
    reply_id = reply_id.toString();
    db.get_tweet(reply_id,
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
    var cur_view = null;
    if (ui.Main.selected_tweet_id != null) {
        current = $(ui.Main.selected_tweet_id);
    }
    // if we lose current placemarker ...
    if (current == null || current.length == 0) {
        cur_view = ui.Main.views[ui.Slider.current];
        if (!cur_view.hasOwnProperty('selected_item_id')) {
            cur_view.selected_item_id
                = '#'+ cur_view._body.find('.card:first').attr('id');
        }
        current = $(cur_view.selected_item_id);
    } else {
        cur_view= ui.Main.views[current.parents('.listview').attr('name')];
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
        cur_view = ui.Main.views[pos.split('-')[0].substring(1)];
        target = $(pos);
    }
    if (target.length == 0) {
        target = current;
    }
    if (target == null || target.length == 0) {
        // too bad
        return;
    }
    cur_view._content.stop().animate(
        {scrollTop: target.get(0).offsetTop - current.height()}, 300);
    current.removeClass('selected');
    target.addClass('selected');
    ui.Main.selected_tweet_id = '#'+ target.attr('id');
    cur_view.selected_item_id = ui.Main.selected_tweet_id;
    target.focus();
},

move_by_offset:
function move_by_offset(offset) {
    var current = null;
    var cur_view = null;
    if (ui.Main.selected_tweet_id != null) {
        current = $(ui.Main.selected_tweet_id);
    }
    // if we lose current placemarker ...
    if (current == null || current.length == 0) {
        cur_view = ui.Main.views[ui.Slider.current];
        if (!cur_view.hasOwnProperty('selected_item_id')) {
            cur_view.selected_item_id
                = '#'+ cur_view._body.find('.card:first').attr('id');
        }
        current = $(cur_view.selected_item_id);
    } else {
        cur_view= ui.Main.views[current.parents('.listview').attr('name')];
    }
    cur_view._content.get(0).scrollTop += offset;
},

set_active_tweet_id:
function set_active_tweet_id(id) {
    ui.Main.active_tweet_id = id;
},

openTweetMoreMenu:
function openTweetMoreMenu(li, btn) {
    var type = li.attr('type');
    switch(type) {
    case 'people':
    case 'message':
        $('#tweet_more_menu .separator').prevAll().hide();
    break;
    default: // tweet & search
        $('#tweet_more_menu .separator').prevAll().show();
    break;
    }
    // deletable?
    if (li.attr('deletable') === 'true' || li.attr('type') === 'message') {
        $('#tweet_del_btn').parent().css('display', 'block');
    } else {
        $('#tweet_del_btn').parent().css('display', 'none');
    }
    if (type != 'message') {
        // retweet or quote?
        if (conf.get_current_profile().preferences.use_alt_retweet &&
            li.attr('retweetable') == 'true') {
            $('#tweet_alt_retweet_btn').parent().css('display', 'block');
            $('#tweet_rt_btn').parent().css('display', 'none');
        } else {
            $('#tweet_alt_retweet_btn').parent().css('display', 'none');
            $('#tweet_rt_btn').parent().css('display', 'block');
        }
        // reply or reply all
        if (conf.get_current_profile().preferences.use_alt_reply) {
            $('#tweet_alt_reply_btn').parent().css('display', 'block');
            $('#tweet_reply_all_btn').parent().css('display', 'none');
        } else {
            $('#tweet_alt_reply_btn').parent().css('display', 'none');
            $('#tweet_reply_all_btn').parent().css('display', 'block');
        }
    }
    $('#tweet_more_menu').css({'left': (btn.offset().left - 135)+'px', 'top': (btn.offset().top - 42)+'px'}).show();
    ui.Main.isTweetMoreMenuClosed = false;
},

closeTweetMoreMenu:
function closeTweetMoreMenu() {
    $('#tweet_more_menu').hide();
    ui.Main.isTweetMoreMenuClosed = true;
},

unique:
function unique (items) {
    var o = {}, i, l = items.length;;
    for(i=0; i < l; i += 1)
        o[items[i].id_str] = items[i];
    items.splice(0, items.length);
    for(i in o) items.push(o[i]);
    return items;
},


ctrl_btn_to_li:
function ctrl_btn_to_li(btn) {
    return $($(btn).parents('.card')[0]);
},

preview_image:
function preview_image (url) {
    $('#imagepreview_dlg .preview').attr('src', url);
    $('#imagepreview_dlg .orig_btn').attr('href', url);
    globals.imagepreview_dialog.open();
}

};


