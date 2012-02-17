ext = ext || {};
ext.HototStat = {
id: 'org.hotot.stat',

name: 'Hotot User Stat',

description: '...',

version: '1.0',

author: 'Shellex Wai',

url: 'http://hotot.org',

icon: 'icon.png',

select_filename: '',

stat_dialog: null,

user_stat_info: {},

home_stat_info: {},

rt_reg: new RegExp('RT\\s*@(\\w+)', 'g'),

current: '#ext_hototstat_home',

header_html: 
'<ul id="ext_hototstat_btns" class="radio_group">\
    <li><a id="ext_hototstat_home_btn"\
        href="#ext_hototstat_home" \
        class="radio_group_btn selected"\
        >HomeTimeline Statistic</a>\
    </li><li><a id="ext_hototstat_user_btn"\
        href="#ext_hototstat_user" \
        class="radio_group_btn"\
        >User Statistic</a>\
    </li><li><a id="ext_hototstat_relation_btn"\
        href="#ext_hototstat_relation" \
        class="radio_group_btn"\
        >Relation Viewer</a>\
    </li>\
</ul>',

body_html:
'<div id="ext_hototstat_home" class="dialog_block" style="text-align:center">\
    <iframe width="600" align="center" height="1800" class="summary_frame" frameborder="0" scrolling="no" src="ext/org.hotot.stat/summary.html"></iframe>\
</div>\
<div id="ext_hototstat_user" class="dialog_block" style="text-align:center;display:none">\
    <div style="padding: 10px 20px;">\
        <input class="screen_name_tbox entry" type="text" placeholder="Type a screen name here and click `Update`">\
    </div>\
    <iframe width="600" align="center" height="1800" class="summary_frame" frameborder="0" scrolling="no" src="ext/org.hotot.stat/summary.html"></iframe>\
</div>\
<div id="ext_hototstat_relation" class="dialog_block" style="display:none">\
    <div style="padding: 10px 20px;">\
        <div style="margin-bottom: 10px;">\
        <input class="screen_name1_tbox entry" type="text" placeholder="Type the first screen name here.">\
        </div><div style="margin-bottom: 10px;">\
        <input class="screen_name2_tbox entry" type="text" placeholder="Type the second screen name here.">\
        </div>\
        <div>Then, press update button</div>\
    </div>\
    <div style="padding: 10px 20px; font-size: 20px;" class="relation_result"></div>\
</div>',

on_ext_btn_clicked:
function on_ext_btn_clicked(event) {
    ext.HototStat.stat_dialog.open();
},

update_stat_frame:
function update_stat_frame(arg) {
    if (arg == 'user') {
        var si = ext.HototStat.user_stat_info;
        var frame_win =  $('#ext_hototstat_user .summary_frame').get(0).contentWindow;
        frame_win.user.update_tweet([
            ['Mentions', si.summary.mention_count]
            , ['Retweets', si.summary.retweet_count]
            , ['Quotes', si.summary.quote_count]
            , ['Soliloquiz', si.summary.soliloquize_count]
            ]);
        frame_win.user.update_stat({
            'hour_stat': si.summary_hour_stat
            , 'day_stat': si.summary_day_stat
        });
        var top_talkers = [];
        for (var k in si.all_talkers) {
            top_talkers.push([k, si.all_talkers[k]]);
        }
        top_talkers.sort(function(a,b){return a[1]>b[1]?-1:1;});
        top_talkers = top_talkers.slice(0, 8);
        frame_win.user.update_top_talkers(top_talkers);

        var top_rt_users = [];
        for (var k in si.all_rt_users) {
            top_rt_users.push([k, si.all_rt_users[k]]);
        }
        top_rt_users.sort(function(a,b){return a[1]>b[1]?-1:1;});
        top_rt_users = top_rt_users.slice(0, 8);
        frame_win.user.update_top_rt_users(top_rt_users);

        var top_clients = [];
        for (var k in si.all_clients) {
            top_clients.push([k, si.all_clients[k]]);
        }
        top_clients.sort(function(a,b){return a[1]>b[1]?-1:1;});
        top_clients = top_clients.slice(0, 8);
        frame_win.user.update_top_clients(top_clients);

        frame_win.user.update_follower_trend(si.all_follower_stream);
    } else {
        var si = ext.HototStat.home_stat_info;
        var frame_win =  $('#ext_hototstat_home .summary_frame').get(0).contentWindow;
        var top_speakers = [];
        for (var k in si.all_speakers) {
            top_speakers.push([k, si.all_speakers[k]]);
        }
        top_speakers.sort(function(a,b){return a[1]>b[1]?-1:1;});
        top_speakers = top_speakers.slice(0, 8);
        frame_win.home.update_top_speakers(top_speakers);
    }
},

fetch_user_tweets:
function fetch_user_tweets(screen_name, callback) {
    var frame_win =  $('#ext_hototstat_user .summary_frame').get(0).contentWindow;
    var procs = [];
    var last_id = null;
    frame_win.start();
    var fetch_proc = function () {
        frame_win.progress_set_label('Loading: '
            + ext.HototStat.user_stat_info.summary.total_count);
        lib.twitterapi.get_user_timeline(null, screen_name, null,
            last_id, 200,
            function (tweets) {
                if (tweets.length != 0) {
                    for (var i = 0; i < tweets.length; i += 1) {
                        ext.HototStat.handle_user_tweet(tweets[i]);
                    }
                    last_id = tweets[tweets.length - 1].id_str;
                } else {
                    ui.toast.set("No tweet available, abort.").show();
                }
                setTimeout(function () {
                    $(window).dequeue('_ext_stat_fetch');
                }, 1000);
            }, function (xhr, txt, exp) {
                setTimeout(function () {
                    $(window).dequeue('_ext_stat_fetch');
                }, 1000);
            });
    }
    for (var i = 0; i < 3; i += 1) {
        procs.push(function () {fetch_proc();});
    }
    procs.push(function () {
        callback();
        frame_win.done('user');
    });
    $(window).queue('_ext_stat_fetch', procs);
    $(window).dequeue('_ext_stat_fetch');
},

fetch_home_tweets:
function fetch_home_tweets(callback) {
    var frame_win =  $('#ext_hototstat_home .summary_frame').get(0).contentWindow;
    var procs = [];
    var last_id = null;
    frame_win.start();
    var fetch_proc = function () {
        frame_win.progress_set_label('Loading: '
            + ext.HototStat.home_stat_info.summary.total_count + '/1000');
        lib.twitterapi.get_home_timeline(null,
            last_id, 100,
            function (tweets) {
                if (tweets.length != 0) {
                    for (var i = 0; i < tweets.length; i += 1) {
                        ext.HototStat.handle_home_tweet(tweets[i]);
                    }
                    last_id = tweets[tweets.length - 1].id_str;
                } else {
                    toast.set("No tweet available, abort.").show();
                }
                setTimeout(function () {
                    $(window).dequeue('_ext_stat_fetch');
                }, 1000);
            }, function (xhr, txt, exp) {
                setTimeout(function () {
                    $(window).dequeue('_ext_stat_fetch');
                }, 1000);
            });
    }
    for (var i = 0; i < 10; i += 1) {
        procs.push(function () {fetch_proc();});
    }
    procs.push(function () {
        callback();
        frame_win.done('home');
    });
    $(window).queue('_ext_stat_fetch', procs);
    $(window).dequeue('_ext_stat_fetch');
},


get_relationship:
function get_relationship(screen_name1, screen_name2, callback) {
    if (screen_name1 == screen_name2) {
        callback(0)
    } else {
        lib.twitterapi.show_friendships(
              screen_name2
            , screen_name1
            , function (result) {
                var relation = 0;
                var source = result.relationship.source;
                if (source.following && source.followed_by) {
                    relation = 1;
                } else if (source.following && !source.followed_by) {
                    relation = 2;
                } else if (!source.following && source.followed_by) {
                    relation = 3;
                } else {
                    relation = 4;
                }
                callback(relation);
            }
        );
    }
},

on_btn_update_clicked:
function on_btn_update_clicked(event) {
    if (ext.HototStat.current == '#ext_hototstat_user') {
        ext.HototStat.reset();
        var screen_name=$('#ext_hototstat_user .screen_name_tbox').val();
        ext.HototStat.fetch_user_tweets(screen_name, 
            function () {
                ext.HototStat.update_stat_frame('user');
            });
    } else if (ext.HototStat.current == '#ext_hototstat_home'){
        ext.HototStat.reset();
        ext.HototStat.fetch_home_tweets( 
            function () {
                ext.HototStat.update_stat_frame('home');
            });
    } else {
        var screen_name1=$('#ext_hototstat_relation .screen_name1_tbox').val();
        var screen_name2=$('#ext_hototstat_relation .screen_name2_tbox').val();
        ext.HototStat.get_relationship(screen_name1, screen_name2, 
            function (relation) {
                switch (relation) {
                case 0: result = screen_name1 + ' and ' + screen_name2
                        + ' are the same person. You are kidding, pal.';
                break;
                case 1: result = screen_name1 + ' and ' + screen_name2
                        + ' are friends.';
                break;
                case 2: result = screen_name2 + ' is following ' 
                        + screen_name1 + ', but ' + screen_name1 
                        + ' doesn\'t follow back.';
                break;
                case 3: result = screen_name1 + ' is following ' 
                        + screen_name2 + ', but ' + screen_name2 
                        + ' doesn\'t follow back.';
                break;
                case 4: result = screen_name1 + ' and ' + screen_name2
                        + ' are not following each other yet..';
                break;
                default:break;
                }
                $('#ext_hototstat_relation .relation_result').text(result);
            });
    }
},

on_btn_close_clicked:
function on_btn_close_clicked(event) {
    ext.HototStat.stat_dialog.close();
},

reset:
function reset() {
    ext.HototStat.user_stat_info = {
        summary: {
              total_count:0
            , mention_count:0
            , retweet_count:0
            , quote_count:0
            , soliloquize_count:0
        }, 
        summary_hour_stat: [
              0,0,0,0,0,0
            , 0,0,0,0,0,0
            , 0,0,0,0,0,0
            , 0,0,0,0,0,0
        ],
        summary_day_stat: [
              0,0,0,0,0,0
            , 0,0,0,0,0,0
            , 0,0,0,0,0,0
            , 0,0,0,0,0,0
            , 0,0,0,0,0,0
            , 0
        ],
        all_talkers: {},
        all_rt_users: {},
        all_clients: {},
        all_follower_stream: [],
        relation: {
              mention_map:{}
        }
    };

    ext.HototStat.home_stat_info = {
        summary: {
              total_count:0
            , mention_count:0
            , retweet_count:0
            , quote_count:0
            , soliloquize_count:0
        }, 
        all_speakers: {},  
    };
},

handle_home_tweet:
function handle_home_tweet(tweet_obj) {
    if (!tweet_obj.hasOwnProperty('user')) {
        return;
    }
    var home_stat_info = ext.HototStat.home_stat_info;
    home_stat_info.summary.total_count += 1;
    var name = tweet_obj.user.screen_name;
    if (name in home_stat_info.all_speakers) {
        home_stat_info.all_speakers[name] += 1;
    } else {
        home_stat_info.all_speakers[name] = 1;
    }
},

handle_user_tweet:
function handle_user_tweet(tweet_obj) {
    if (!tweet_obj.hasOwnProperty('user')) {
        return;
    }

    // summary of tweets
    var user_stat_info = ext.HototStat.user_stat_info;
    user_stat_info.summary.total_count += 1;
    if (tweet_obj.text.indexOf(' RT') != -1) {
        user_stat_info.summary.quote_count += 1;
    } 
    if (tweet_obj.text.indexOf('@') == -1) {
        user_stat_info.summary.soliloquize_count += 1;
    } else {
        user_stat_info.summary.mention_count += 1;
    }
    if (tweet_obj.hasOwnProperty('retweeted_status')) {
        user_stat_info.summary.retweet_count += 1;
    }
    // summary of tweets per hours/day
    var time = new Date();
    time.setTime(Date.parse(tweet_obj.created_at));
    user_stat_info.summary_hour_stat[time.getHours() - 1] += 1;
    user_stat_info.summary_day_stat[time.getDay() - 1] += 1;
    // summary of top 10 talkers and clients
    if (tweet_obj.entities) {
        for (var i = 0; i < tweet_obj.entities.user_mentions.length; i+=1) {
            var mention_name = tweet_obj.entities.user_mentions[i].screen_name;
            if (mention_name in user_stat_info.all_talkers) {
                user_stat_info.all_talkers[mention_name] += 1;
            } else {
                user_stat_info.all_talkers[mention_name] = 1;
            }
        }
    }
    var client_name = tweet_obj.source.replace(/<.*?>/g, '');
    client_name.replace('</a>', '');
    if (client_name in user_stat_info.all_clients) {
        user_stat_info.all_clients[client_name] += 1;
    } else {
        user_stat_info.all_clients[client_name] = 1;
    }
    var m = ext.HototStat.rt_reg.exec(tweet_obj.text);
    while (m != null) {
        if (m[1] in user_stat_info.all_rt_users) {
            user_stat_info.all_rt_users[m[1]] += 1;
        } else {
            user_stat_info.all_rt_users[m[1]] = 1;
        }
        m = ext.HototStat.rt_reg.exec(tweet_obj.text);
    }
    // follower stream
    user_stat_info.all_follower_stream.push(tweet_obj.user.followers_count);
},

enable:
function enable() {
    ext.add_exts_menuitem('ext_btn_hotot_stat_image'
        , ext.HototStat.id+'/16.png'
        , 'View Tweet Stat ...'
        , ext.HototStat.on_ext_btn_clicked);
    // create stat dialog
    var title = 'Tweet Stat ...'
    ext.HototStat.stat_dialog 
        = widget.DialogManager.build_dialog('#ext_imagestat_dialog'
            , title, ext.HototStat.header_html, ext.HototStat.body_html
            , [{  id:'#ext_hototstat_close_btn', label: 'Close'
                , click: ext.HototStat.on_btn_close_clicked
               }, {
                  id: '#ext_hototstat_update_btn', label: 'Uplate'
                , click: ext.HototStat.on_btn_update_clicked
              }]
        );
    ext.HototStat.stat_dialog.set_styles('header', {'padding': '10px'})
    ext.HototStat.stat_dialog.set_styles('body', {'padding': '0px','background-color':'white'})
    ext.HototStat.stat_dialog.resize(700, 500);
    
    var radio_group_btns = new widget.RadioGroup('#ext_hototstat_btns');
    radio_group_btns.on_clicked = function (btn, event) {
        $('#ext_imagestat_dialog .dialog_block').hide();
        $(btn.attr('href')).show();
        ext.HototStat.current = btn.attr('href');
    };
    radio_group_btns.create();

    ext.HototStat.reset();
},

disable:
function disable() {
    ext.remove_exts_menuitem('ext_btn_hotot_stat_image');
    if (ext.HototStat.stat_dialog) {
        ext.HototStat.stat_dialog.destroy();
    }
}

}
