if (typeof ui == 'undefined') var ui = {};
ui.PeopleView = {

relation_map: { 
      0: 'Hey, it\'s YOU!'
    , 1: '&infin; You are friends.'
    , 2: '&ni; You are followed by them.'
    , 3: '&isin; You are following.'
    , 4: '&empty; You are not following each other.'
},

init:
function init() {
},

init_view:
function init_view(view) {
    var vcard = view._header.find('.people_vcard');
    var vcard_profile_btns = vcard.find('.radio_group_btn');
    vcard_profile_btns.click(function (event) {
        var pagename = '.' + $(this).attr('href').substring(1);
        vcard_profile_btns.removeClass('selected');
        $(this).addClass('selected');
        vcard.find('.vcard_tabs_page').hide();
        vcard.find(pagename).show();
        return false;
    });
    var toggle = view._header.find('.people_view_toggle');
    var sub_view_btns = toggle.find('.radio_group_btn');
    sub_view_btns.click(function (event) {
        var pagename = $(this).attr('href').substring(1);
        if (pagename == 'list') {
            toggle.find('.lists_memu').toggle();
        } else {
            sub_view_btns.removeClass('selected');
            $(this).addClass('selected');
            ui.PeopleView.switch_sub_view(view, pagename);
        }
        return false;
    });

    vcard.find('.vcard_follow').click('click',
    function (event) {
        var _this = this;
        if ($(this).hasClass('unfo')) {
            toast.set(_("Unfollow @") + view.screen_name + " ...").show();
            lib.twitterapi.destroy_friendships(view.screen_name,
            function () {
                toast.set(
                    _("Unfollow @")+ view.screen_name+" Successfully!").show();
                $(_this).text(_("Follow")).removeClass('unfo');
            });
        } else {
            toast.set(_("Follow @") + view.screen_name + " ...").show();
            lib.twitterapi.create_friendships(view.screen_name,
            function () {
                toast.set(
                    _("Follow @")+ view.screen_name+" Successfully!").show();
                $(_this).text(_("Unfollow")).addClass('unfo');
            });
        }
    });

    vcard.find('.vcard_edit').click(
    function (event) { 
        ui.ProfileDlg.request_profile();    
        globals.profile_dialog.open();
    });

    var people_action_more_memu = vcard.find('.people_action_more_memu');
    vcard.find('.people_action_more_trigger').mouseleave(function () {
        people_action_more_memu.hide();
    });

    vcard.find('.vcard_more').click(function () {
        people_action_more_memu.toggle();
    });

    vcard.find('.mention_menu_item').click(
    function (event) {
        ui.StatusBox.set_status_text('@' + view.screen_name+' ');
        ui.StatusBox.open(
        function() {
            ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
            ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
        });
        people_action_more_memu.hide();
        return false;
    });

    vcard.find('.add_to_list_menu_item').click(
    function (event) {
        ui.AddToListDlg.load();
        globals.add_to_list_dialog.open(); 
    });

    vcard.find('.block_menu_item').click(
    function (event) {
        if (!confirm("Are you sure you want to block @"+view.screen_name+"?!\n"))
            return;
        toast.set("Block @" + view.screen_name + " ...").show();
        lib.twitterapi.create_blocks(view.screen_name,
        function () {
            toast.set(
                "Block @"+ view.screen_name+" Successfully!").show();
        });
        people_action_more_memu.hide();
    });

    vcard.find('.unblock_menu_item').click(
    function (event) {
        toast.set("Unblock @" + view.screen_name + " ...").show();
        lib.twitterapi.create_blocks(view.screen_name,
        function () {
            toast.set(
                "Unblock @"+ view.screen_name+" Successfully").show();
        });
        people_action_more_memu.hide();
    });

    vcard.find('.report_spam_menu_item').click(
    function (event) {
        if(!confirm('Are you sure you want to BLOCK them and REPORT for SPAM?')) 
            return;
        toast.set("Report @" + view.screen_name + " for spam...").show();
        lib.twitterapi.create_blocks(view.screen_name,
        function () {
            toast.set(
                "Report @"+ view.screen_name+" for Spam Successfully").show();
        });
        people_action_more_memu.hide();
    });

    var lists_memu = toggle.find('.lists_memu');
    toggle.find('.people_view_list_trigger').mouseleave(function () {
        lists_memu.hide();
    });

    lists_memu.find('.user_lists_menu_item').click(function () {
        view.is_trim = false;
        view.item_type = 'cursor';
        view.cursor = '';
        view.former = ui.Template.form_list;
        view._load = ui.PeopleView.load_lists;
        view._loadmore = ui.PeopleView.loadmore_lists;
        view._load_success = ui.Main.load_list_success;
        view._loadmore_success = ui.Main.loadmore_list_success;
        lists_memu.hide();
        sub_view_btns.removeClass('selected');
        $('.people_view_list_btn').addClass('selected');
        view.clear();
        view.load();
        return false;
    });

    lists_memu.find('.listed_lists_menu_item').click(function () {
        view.is_trim = false;
        view.item_type = 'cursor';
        view.cursor = '';
        view.former = ui.Template.form_list;
        view._load = ui.PeopleView.load_listed_lists;
        view._loadmore = ui.PeopleView.loadmore_listed_lists;
        view._load_success = ui.Main.load_list_success;
        view._loadmore_success = ui.Main.loadmore_list_success;
        lists_memu.hide();
        sub_view_btns.removeClass('selected');
        $('.people_view_list_btn').addClass('selected');
        view.clear();
        view.load();
        return false;
    });
    
    lists_memu.find('.create_list_menu_item').click(function () {
        ui.ListAttrDlg.load(globals.myself.screen_name,'', '', 'public');
        globals.list_attr_dialog.open(); 
        lists_memu.hide();
        return false;
    });
    
},
    
destroy_view:
function destroy_view(view) {
    // unbind
    var vcard = view._header.find('.people_vcard');
    vcard.find('.button').unbind();
    vcard.find('.radio_group_btn').unbind();
    // remove slide, view and DOM
    ui.Slider.remove(view.name);
},

switch_sub_view:
function switch_sub_view(view, name) {
    switch (name) {
    case 'tweet':
        view.is_trim = true;
        view.item_type = 'id';
        view.since_id = 1;
        view.former = ui.Template.form_tweet;
        view._load = ui.PeopleView.load_timeline;
        view._loadmore = ui.PeopleView.loadmore_timeline;
        view._load_success = ui.Main.load_tweet_success;
        view._loadmore_success = ui.Main.loadmore_tweet_success;
    break;
    case 'fav':
        view.is_trim = false;
        view.item_type = 'page';
        view.page = 1;
        view.former = ui.Template.form_tweet;
        view._load = ui.PeopleView.load_fav;
        view._loadmore = ui.PeopleView.loadmore_fav;
        view._load_success = ui.Main.load_tweet_success;
        view._loadmore_success = ui.Main.loadmore_tweet_success;
    break;
    case 'friend':
        view.is_trim = false;
        view.item_type = 'cursor';
        view.cursor = '';
        view.former = ui.Template.form_people;
        view._load = ui.PeopleView.load_friend;
        view._loadmore = ui.PeopleView.loadmore_friend;
        view._load_success = ui.Main.load_people_success;
        view._loadmore_success = ui.Main.loadmore_people_success;
    break;
    case 'follower':
        view.is_trim = false;
        view.item_type = 'cursor';
        view.cursor = '';
        view.former = ui.Template.form_people;
        view._load = ui.PeopleView.load_follower;
        view._loadmore = ui.PeopleView.loadmore_follower;
        view._load_success = ui.Main.load_people_success;
        view._loadmore_success = ui.Main.loadmore_people_success;
    break;
    default: break;
    }
    view.clear();
    view.load();
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

render_people_view:
function render_people_view(self, user_obj, proc) {
    var btn_follow = self._header.find('.vcard_follow');
    var btn_edit = self._header.find('.vcard_edit');
    var btn_block = self._header.find('.vcard_block');
    var btn_unblock = self._header.find('.vcard_unblock');
    var btn_request = self._header.find('.people_request_btn');
    var request_hint = self._header.find('.people_request_hint');
    var toggle_btns = self._header.find('.people_view_toggle');
    btn_follow.show();
    ui.Template.fill_people_vcard(user_obj, self._header);
    db.dump_users([user_obj]);
    self._header.find('.create_list_menu_item').hide();
    if (user_obj.screen_name == globals.myself.screen_name) {
        btn_edit.show();
        btn_follow.hide();
        btn_block.hide();
        btn_unblock.hide();
        self._header.find('.create_list_menu_item').show();
        proc();
        self.protected_user = false;
    } else {
        if (user_obj.protected && !user_obj.following) {
            // not friend and user protect his tweets,
            // then hide follow btn.
            btn_follow.hide();
            // and display request box.
            toggle_btns.hide();
            request_hint.show();
            btn_request.attr('href'
                , conf.get_current_profile().preferences.base_url 
                    + user_obj.screen_name);
            self.protected_user = true;
        } else {
            btn_follow.html(_("Follow"));
            btn_follow.removeClass('unfo');
            proc();
            self.protected_user = false;
        }
    }
    ui.PeopleView.get_relationship(user_obj.screen_name
        , function (rel) {
            self._header.find('.relation').html(
                ui.PeopleView.relation_map[rel]
            );
            if (rel == 1 || rel == 3) {
                btn_follow.html(_("Unfollow"));
                btn_follow.addClass('unfo');
            }
    });
},

load_timeline:
function load_timeline(view, success, fail) {
    var render_proc = function (user_obj) {
        ui.Slider.set_icon(view.name, user_obj.profile_image_url);
        ui.PeopleView.render_people_view(view, user_obj 
            , function () {
                lib.twitterapi.get_user_timeline(null, view.screen_name
                    , 1, null, conf.vars.items_per_request, success);
            });
    }
    lib.twitterapi.show_user(view.screen_name, render_proc);
},

loadmore_timeline:
function loadmore_people(self, success, fail) {
    if (self.protected_user) {
        self._footer.hide();
        return;
    }
    lib.twitterapi.get_user_timeline(null
        , self.screen_name
        , 1 
        , self.max_id, 20, success);
},

load_fav:
function load_fav(view, success, fail) {
    lib.twitterapi.get_favorites(view.screen_name, 1, success);
},

loadmore_fav:
function loadmore_fav(view, success, fail) {
    lib.twitterapi.get_favorites(view.screen_name, view.page, success);
},

load_follower:
function load_follower(view, success, fail) {
    lib.twitterapi.get_user_followers(view.screen_name, -1, success);
},

loadmore_follower:
function loadmore_follower(view, success, fail) {
    lib.twitterapi.get_user_followers(view.screen_name, view.cursor, success);
},

load_friend:
function load_friend(view, success, fail) {
    lib.twitterapi.get_user_friends(view.screen_name, -1, success);
},

loadmore_friend:
function loadmore_friend(view, success, fail) {
    lib.twitterapi.get_user_friends(view.screen_name, view.cursor, success);
},

load_lists:
function load_lists(view, success, fail) {
    lib.twitterapi.get_user_lists(view.screen_name, -1, success);
},

loadmore_lists:
function loadmore_lists(view, success, fail) {
    lib.twitterapi.get_user_lists(view.screen_name, view.cursor, success);
},

load_listed_lists:
function load_listed_lists(view, success, fail) {
    lib.twitterapi.get_user_listed_lists(view.screen_name, -1, success);
},

loadmore_listed_lists:
function loadmore_listed_lists(view, success, fail) {
    lib.twitterapi.get_user_listed_lists(view.screen_name, view.cursor, success);
},

};
