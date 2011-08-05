if (typeof ui == 'undefined') var ui = {};
ui.ListView = {


init:
function init() {
},

init_view:
function init_view(view) {
    var vcard = view._header.find('.list_vcard');
    var vcard_profile_btns = vcard.find('.radio_group_btn');
    vcard_profile_btns.click(function (event) {
        var pagename = '.' + $(this).attr('href').substring(1);
        vcard_profile_btns.removeClass('selected');
        $(this).addClass('selected');
        vcard.find('.vcard_tabs_page').hide();
        vcard.find(pagename).show();
    });
    var toggle = view._header.find('.list_view_toggle');
    var sub_view_btns = toggle.find('.radio_group_btn');
    sub_view_btns.click(function (event) {
        var pagename = $(this).attr('href').substring(1);
        sub_view_btns.removeClass('selected');
        $(this).addClass('selected');
        ui.ListView.switch_sub_view(view, pagename);
    });

    vcard.find('.vcard_follow').click('click',
    function (event) {
        var _this = this;
        if ($(this).hasClass('unfo')) {
            toast.set("Unfollow @" + view.screen_name + " ...").show();
            lib.twitterapi.destroy_friendships(view.screen_name,
            function () {
                toast.set(
                    "Unfollow @"+ view.screen_name+" Successfully!").show();
                $(_this).text('Follow').removeClass('unfo');
            });
        } else {
            toast.set("Follow @" + view.screen_name + " ...").show();
            lib.twitterapi.create_friendships(view.screen_name,
            function () {
                toast.set(
                    "Follow @"+ view.screen_name+" Successfully!").show();
                $(_this).text('Unfollow').addClass('unfo');
            });
        }
    });
},
    
destroy_view:
function destroy_view(view) {
    // unbind
    var vcard = view._header.find('.list_vcard');
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
        view._load = ui.ListView.load_timeline;
        view._loadmore = ui.ListView.loadmore_timeline;
        view._load_success = ui.Main.load_tweet_success;
        view._loadmore_success = ui.Main.loadmore_tweet_success;
    break;
    case 'following':
        view.is_trim = false;
        view.item_type = 'cursor';
        view.cursor = '';
        view.former = ui.Template.form_people;
        view._load = ui.ListView.load_following;
        view._loadmore = ui.ListView.loadmore_following;
        view._load_success = ui.Main.load_people_success;
        view._loadmore_success = ui.Main.loadmore_people_success;
    break;
    case 'follower':
        view.is_trim = false;
        view.item_type = 'cursor';
        view.cursor = '';
        view.former = ui.Template.form_people;
        view._load = ui.ListView.load_follower;
        view._loadmore = ui.ListView.loadmore_follower;
        view._load_success = ui.Main.load_people_success;
        view._loadmore_success = ui.Main.loadmore_people_success;
    break;
    default: break;
    }
    view.clear();
    view.load();
},

render_list_view:
function render_list_view(view) {
    var btn_follow = view._header.find('.vcard_follow');
    var btn_edit = view._header.find('.vcard_edit');
    var btn_delete = view._header.find('.vcard_delete');
    var toggle_btns = view._header.find('.list_view_toggle');
    if (view.screen_name == globals.myself.screen_name) {
        btn_follow.hide();
        btn_edit.show();
        btn_delete.show();
    } else {
        btn_follow.show();
    }
    // @TODO
    btn_follow.hide();
    btn_edit.hide();
    btn_delete.hide();

    ui.Template.fill_list_vcard(view);
},

load_timeline:
function load_timeline(view, success, fail) {
    ui.ListView.render_list_view(view);
    lib.twitterapi.get_list_statuses(view.screen_name, view.slug, 1, null, success);
},

loadmore_timeline:
function loadmore_people(view, success, fail) {
    lib.twitterapi.get_list_statuses(view.screen_name, view.slug, 1, view.max_id, success);
},

load_follower:
function load_follower(view, success, fail) {
    lib.twitterapi.get_list_subscribers(view.screen_name, view.slug, -1, success);
},

loadmore_follower:
function loadmore_follower(view, success, fail) {
    lib.twitterapi.get_list_subscribers(view.screen_name, view.slug, view.cursor, success);
},

load_following:
function load_following(view, success, fail) {
    lib.twitterapi.get_list_members(view.screen_name, view.slug, -1, success);
},

loadmore_following:
function loadmore_following(view, success, fail) {
    lib.twitterapi.get_list_members(view.screen_name, view.slug, view.cursor, success);
},

};
