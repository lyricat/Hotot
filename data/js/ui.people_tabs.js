if (typeof ui == 'undefined') var ui = {};
ui.PeopleTabs = {

current: null,

relation_map: { 
      0: 'Hey, it\'s YOU!'
    , 1: '&infin; You are friends.'
    , 2: '&ni; You are followed by them.'
    , 3: '&isin; You are following.'
    , 4: '&empty; You are not following each other.'
},

init:
function init() {
    var btns = new widget.RadioGroup('#people_radio_group');
    btns.on_clicked = function (btn, event) {
        // activate another sub page.
        ui.PeopleTabs.current = $(btn).attr('href');
        var pagename = ui.PeopleTabs.current + '_sub_block';
        $('#people_tweet_block .tweet_sub_block').not(pagename).hide();
        $(pagename).show();
        if (ui.Main.block_info['#people'].screen_name != '') {
            toast.set("Loading ...").show(-1);
            daemon.Updater.update_people();
        }
    };
    btns.create();
    ui.PeopleTabs.current = '#people_tweet';
    $(ui.PeopleTabs.current + '_sub_block').show();

    // vcard
    var vcard_btns = new widget.RadioGroup('#people_vcard_radio_group');
    vcard_btns.on_clicked = function (btn, event) {
        // activate another sub page.
        var pagename = $(btn).attr('href');
        $('#people_vcard_tabs_pages .vcard_tabs_page')
            .not(pagename).hide();
        $(pagename).show();
    };
    vcard_btns.create();
    $('#people_vcard_info_page').show();

    $('#people_vcard .vcard_follow').click(
    function (event) {
        var screen_name = ui.Main.block_info['#people'].screen_name;
        var _this = this;
        if ($(this).hasClass('unfo')) {
            toast.set("Unfollow @" + screen_name + " ...").show();
            lib.twitterapi.destroy_friendships(screen_name,
            function () {
                toast.set(
                    "Unfollow @"+ screen_name+" Successfully!").show();
                $(_this).text('Follow').removeClass('unfo');
            });
        } else {
            toast.set("Follow @" + screen_name + " ...").show();
            lib.twitterapi.create_friendships(screen_name,
            function () {
                toast.set(
                    "Follow @"+ screen_name+" Successfully!").show();
                $(_this).text('Unfollow').addClass('unfo');
            });
        }
    });

    $('#people_vcard .vcard_block').click(
    function (event) {
        var screen_name = ui.Main.block_info['#people'].screen_name;
        if (!confirm("Are you sure you want to block @"+screen_name+"?!\n"))
            return;
        toast.set("Block @" + screen_name + " ...").show();
        lib.twitterapi.create_blocks(screen_name,
        function () {
            toast.set(
                "Block @"+ screen_name+" Successfully!").show();
        });
    });

    $('#people_vcard .vcard_unblock').click(
    function (event) {
        var screen_name = ui.Main.block_info['#people'].screen_name;
        toast.set("Unblock @" + screen_name + " ...").show();
        lib.twitterapi.create_blocks(screen_name,
        function () {
            toast.set(
                "Unblock @"+ screen_name+" Successfully").show();
        });
    });

    $('#people_vcard .vcard_edit').click(
    function (event) { 
        ui.ProfileDlg.request_profile();    
        globals.profile_dialog.open();
    });

    $('#tbox_people_entry').keypress(
    function (event) {
        if (event.keyCode == 13)
            ui.PeopleTabs.btn_people_entry.click();
    });

    ui.PeopleTabs.btn_people_entry 
        = new widget.Button('#btn_people_entry');
    ui.PeopleTabs.btn_people_entry.on_clicked = function (event) {
        ui.PeopleTabs.set_people(
            $.trim($('#tbox_people_entry').attr('value')));
        var infos = $('#people_tweet_block .load_more_info');
        infos.html('<img src="image/ani_loading_bar_gray.gif"/>');
        daemon.Updater.update_people();
    };
    ui.PeopleTabs.btn_people_entry.create();
    
    var btn_people_request = new widget.Button('#btn_people_request');
    btn_people_request.on_clicked = function(event) {
        window.location.href = 'http://twitter.com/' + ui.Main.block_info['#people'].screen_name;
    };
    btn_people_request.create();
},

set_people:
function set_people(screen_name) {
    if (screen_name == globals.myself.screen_name) {
        $('#people_vcard_action_btns .vcard_edit').parent().show();
        $('#people_vcard_action_btns .button')
            .not('.vcard_edit').parent().hide();
    } else {
        $('#people_vcard_action_btns .vcard_edit').parent().hide();
        $('#people_vcard_action_btns .button')
            .not('.vcard_edit').parent().show();
    }
    ui.Main.block_info['#people'].screen_name = screen_name;
    ui.Main.block_info['#people_tweet'].since_id = 1;
    ui.Main.block_info['#people_tweet'].max_id = null;
    ui.Main.block_info['#people_fav'].since_id = 1;
    ui.Main.block_info['#people_fav'].max_id = null;
    $('#tbox_people_entry').val(screen_name);
    $('#people_tweet_block .tweet_sub_block').find('ul').html(''); 
},

get_relationship:
function get_relationship(screen_name, callback) {
    if (screen_name == globals.myself.screen_name) {
        callback(0);
    } else {
        lib.twitterapi.show_friendships(
              screen_name
            , globals.myself.screen_name
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

render_people_page:
function render_people_page(user_obj, pagename, proc) {
    var container = $('#people_vcard'); 
    var btn_follow = container.find('.vcard_follow');
    btn_follow.show();
    ui.Template.fill_vcard(user_obj, container);
    ui.Slider.slide_to('#people');
    
    db.dump_users([user_obj]);
    if (user_obj.following || user_obj.screen_name == globals.myself.screen_name) {
        proc();
        $('#people_tweet_block .tweet_block_bottom').show();
    } else {
        if (user_obj.protected) {
            // not friend and user protect his tweets,
            // then hide follow btn.
            btn_follow.hide();
            // and display request box.
            $('#people_request_hint').show();
            $('#people_tweet_block .tweet_block_bottom').hide();
            $('#request_screen_name').text(user_obj.screen_name)
        } else {
            btn_follow.html('Follow');
            btn_follow.removeClass('unfo');
            proc();
            $('#people_tweet_block .tweet_block_bottom').show();
        }
    }
    ui.PeopleTabs.get_relationship(user_obj.screen_name
        , function (rel) {
            $('#people_vcard .relation').html(
                ui.PeopleTabs.relation_map[rel]
            );
            if (rel == 1 || rel == 3) {
                btn_follow.html('Unfollow');
                btn_follow.addClass('unfo');
            }
        });
    $('#people_vcard').show();
    $('#people_entry').css('border-bottom', '0');
    $('#people_radio_group_wrapper').show();
},


load_people_timeline:
function load_people_timeline() {
    lib.twitterapi.get_user_timeline(ui.Main.block_info['#people'].id
        , ui.Main.block_info['#people'].screen_name
        , ui.Main.block_info['#people_tweet'].since_id, null, 20,
    function (result) {
        ui.Main.load_tweets_cb(result, '#people_tweet');
    });
},

load_people_fav:
function load_people_fav() {
    lib.twitterapi.get_favorites(
        ui.Main.block_info['#people'].screen_name, 1,
    function (result) {
        ui.Main.load_tweets_cb(result, '#people_fav');
    });
},

load_people_followers:
function load_people_followers() {
    lib.twitterapi.get_user_followers(
          ui.Main.block_info['#people'].screen_name
        , -1, 
    function (result) {
        ui.Main.load_tweets_cb(result, '#people_followers');
    });
},

load_people_friends:
function load_people_friends() {
    lib.twitterapi.get_user_friends(
          ui.Main.block_info['#people'].screen_name
        , -1,
    function (result) {
        ui.Main.load_tweets_cb(result, '#people_friends');
    });
},

};
