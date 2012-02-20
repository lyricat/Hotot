if (typeof daemon == 'undefined') var daemon = {};
daemon = {

    time: 0,

    running: false,

    use_streaming: false,

    timer: null,

    timer_interval: 120000,

    home_queue: [],

    home_last_time: 0,

    poll_views: [],

    push_views: [],

    init: function init() {},

    start: function start() {
        daemon.running = true;
        daemon.time = 0;
        daemon.work();
    },

    stop: function stop() {
        daemon.running = false;
        daemon.abort_push();
    },

    work: function work() {
        if (lib.twitterapi.use_oauth && lib.twitterapi.api_base.indexOf('https://api.twitter.com/') != - 1) {
            daemon.use_streaming = true;
        }
        if (daemon.running) {
            daemon.poll();
            daemon.push();
        }
        daemon.time += 120;
        if (daemon.time == 3600) { // reset timer per hour
            daemon.time = 0;
        }
        ui.Slider.save_state();
        conf.save_prefs(conf.current_name);
        daemon.timer = setTimeout(daemon.work, daemon.timer_interval);
    },

    poll: function poll() {
        var step = 0;
        for (var i = 0; i < daemon.poll_views.length; i += 1) {
            var view = daemon.poll_views[i];
            if (!view.use_auto_update) {
                continue;
            }
            var interval = view.interval;
            if (daemon.time % (Math.ceil(interval / 60) * 60) == 0) {
                view.load();
                step += 1;
            }
        }
        for (var i = 0; i < daemon.push_views.length; i += 1) {
            var view = daemon.push_views[i];
            if (!view.use_auto_update) {
                continue;
            }
            var interval = view.interval;
            if (daemon.use_streaming && lib.twitterapi.watch_user_streams.is_running) {
                // poll push_views per 15 minutes when the Steaming xhr works
                // poll them as normal if Streaming xhr is not running or the user stream is disabled.
                interval = 900;
            }
            if (daemon.time % (Math.ceil(interval / 120) * 120) == 0) {
                hotot_log('poll as push', view.name);
                view.load();
                step += 1;
            }
        }
        if (step != 0) {
            toast.set('Updated ' + step + ' page(s) on schedule.').show();
        }
    },

    abort_push: function abort_push() {
        lib.twitterapi.abort_watch_user_streams();
    },

    push: function push() {
        if (lib.twitterapi.watch_user_streams.is_running) {
            if (daemon.home_queue.length > 0) {
                hotot_log('daemon push, timeout', daemon.home_queue.length);
                ui.Main.views.home.load_success(daemon.home_queue);
                daemon.home_queue.splice(0, daemon.home_queue.length);
            }
            return;
        }
        function on_ret(ret) {
            if (ret.direct_message) {
                if (ret.direct_message.recipient_screen_name == globals.myself.screen_name || ret.direct_message.sender_screen_name == globals.myself.screen_name) {
                    if (ui.Main.views.messages.use_auto_update) {
                        ui.Main.views.messages.load_success([ret.direct_message]);
                    }
                }
                return;
            }
            if (ret['delete'] && ret['delete']['status']) {
                id = "#home-" + ret['delete']['status'].id_str;
                $(id).addClass('deleted');
                return;
            }
            if (ret.text && ret.user) {
                // ignore retweets of me
                if (ret.hasOwnProperty('retweeted_status') && ret.user.screen_name == globals.myself.screen_name) {
                    return;
                }
                var now = Date.now();
                if (now - daemon.home_last_time > 1000) {
                    hotot_log('daemon push', 1);
                    if (ui.Main.views.home.use_auto_update) {
                        ui.Main.views.home.load_success([ret]);
                    }
                } else {
                    daemon.home_queue.push(ret);
                    if (128 < daemon.home_queue.length) {
                        hotot_log('daemon push, batch', daemon.home_queue.length);
                        if (ui.Main.views.home.use_auto_update) {
                            ui.Main.views.home.load_success(daemon.home_queue);
                        }
                        daemon.home_queue.splice(0, daemon.home_queue.length);
                    }
                }
                // mentions
                if (ret.entities) {
                    if (ui.Main.views.mentions && ui.Main.views.mentions.use_auto_update) {
                        var user_mentions = ret.entities.user_mentions;
                        for (var i = 0, l = user_mentions.length; i < l; i += 1) {
                            if (user_mentions[i].screen_name == globals.myself.screen_name) {
                                ui.Main.views.mentions.load_success([ret]);
                            }
                        }
                    }
                }
                daemon.home_last_time = now;
                return;
            }
        }
        lib.twitterapi.watch_user_streams(on_ret);
    },

    register_poll_view: function register_poll_view(v, interval) {
        if (daemon.poll_views.indexOf(v) == - 1) {
            daemon.poll_views.push(v);
            return true;
        }
        return false;
    },

    register_push_view: function register_push_view(v, token) {
        if (daemon.push_views.indexOf(v) == - 1) {
            daemon.push_views.push(v);
            return true;
        }
        return false;
    },

    unregister_poll_view: function unregister_poll_view(v) {
        var idx = daemon.poll_views.indexOf(v)
        if (idx != - 1) {
            daemon.poll_views.splice(idx, 1);
            return true;
        }
        return false;
    },

    unregister_push_view: function unregister_push_view(v) {
        var idx = daemon.push_views.indexOf(v)
        if (idx != - 1) {
            daemon.push_views.splice(idx, 1);
            return true;
        }
        return false;
    },

    update_all: function update_all() {
        for (var i = 0; i < daemon.poll_views.length; i += 1) {
            daemon.poll_views[i].load();
        }
        for (var i = 0; i < daemon.push_views.length; i += 1) {
            daemon.push_views[i].load();
        }
    }

};

