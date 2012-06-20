var layout_opts = {
        closable:                   true
    ,   resizable:                  true
    ,   slidable:                   true
    ,   enableCursorHotkey:         false
    ,   paneClass:                  'ui-layout-pane'
    ,   north__slidable:            false
    ,   north__closable:            true
    ,   north__size:                70
    ,   north__showOverflowOnHover: true
    ,   north__spacing_open :       0
    ,   north__spacing_closed:      0
    ,   north__initClosed:          true
    ,   south__size:                0
    ,   south__spacing_open:        0
    ,   south__spacing_closed:      0
    ,   south__initClosed:          true
    ,   south__showOverflowOnHover: true
    ,   north__paneSelector:        '#header'
    ,   center__paneSelector:       '#center'
    ,   south__paneSelector:        '#bottom'
};

function change_theme(theme_name, theme_path) {
    $('#hotot_theme').attr('href', theme_path + '/style.css');
    $.getJSON(theme_path + '/info.json',
    function (hotot_theme_info) {
        $('#prefs_theme_name').text(hotot_theme_info.name);
        $('#prefs_theme_author').text(hotot_theme_info.author);
        $('#prefs_theme_web').text(hotot_theme_info.web)
            .attr('href', hotot_theme_info.web);
        $('#prefs_theme_desc').text(hotot_theme_info.description);
        $('#prefs_theme_preview').attr('src', theme_path+'/preview.png');
    });
}

function update_tweet_block_width() {
    var view_width = $(window).width();
    ui.Slider.column_num = parseInt(view_width / 400) || 1;
    if (ui.Slider.tweet_blocks.length < ui.Slider.column_num) {
        ui.Slider.column_num = ui.Slider.tweet_blocks.length;
    }
    globals.tweet_block_width = parseInt(view_width / ui.Slider.column_num);
    if (view_width > 1280) {
        globals.tweet_block_width -= 1;
    }
    if (ui.Slider.column_num != 0) {
        $('#main_page_slider').show();
        $('#indication_light').show();
        $('#empty_view_hint').hide();
        $('.view_title:gt('+ui.Slider.column_num+')').hide();
        $('.view_title:lt('+ui.Slider.column_num+')').show();
        $('.tweetview').width(globals.tweet_block_width);
        $('.tweetview:eq('+(ui.Slider.column_num - 1)+')').width(
            view_width - (ui.Slider.column_num-1) * globals.tweet_block_width);
        $('.view_title').width(globals.tweet_block_width-1);
        $('.view_title:eq('+(ui.Slider.column_num - 1)+')').width(
            view_width - (ui.Slider.column_num-1) * globals.tweet_block_width - 1).show();
    } else {
        $('#main_page_slider').hide();
        $('#indication_light').hide();
        $('#empty_view_hint').fadeIn();
        $('.view_title').hide();
    }

    // no_stick indicators
    var idrs = $('#indicator_btns').children('.no_stick');
    $('#indicator_btns').children('.no_stick:eq(0)')
        .css('margin-left', (($(window).width()-(idrs.length+1) * 40)/2) + 'px');
    $('#indicator_btns').children('.no_stick:gt(0)')
        .css('margin-left', '0px');

    // adjust width of compose button
    if (view_width < 800) {
        $('#indicator_compose_btn').removeClass('with_label');
    } else {
        $('#indicator_compose_btn').addClass('with_label');
    }

    // adjust width of compose box
    var status_box_w = $(window).width() * 0.6;
    if (status_box_w < 550) {       // 550, max-width of #status_box
        if (status_box_w < 400) {   // 400, min-width of #status_box
            status_box_w = 400;
        }
    } else {
        status_box_w = 550;
    }
    $('#status_box').width(status_box_w);
    // recalculate scrollbar layout
    for (var k in ui.Main.views) {
        ui.Main.views[k].scrollbar.recalculate_layout();
    }
}

function hotot_action(uri) {
    if (util.is_native_platform()) {
        alert('hotot:' + uri);
    }
}

function quit() {
    conf.save_settings(function () {
        if (conf.current_name.length != 0) {
            if (globals.signed_in) {
                ui.Slider.save_state();
            }
            conf.save_prefs(conf.current_name, function(){
                if (!util.is_native_platform()) {
                    if (conf.vars.platform === 'Chrome') {
                        chrome.tabs.getCurrent(function (tab) {
                            chrome.tabs.remove(tab.id);
                        });
                    } else {
                        // pass
                    }
                } else {
                    hotot_action('system/quit');
                }
            });
        } else {
            if (!util.is_native_platform()) {
                if (conf.vars.platform === 'Chrome') {
                    chrome.tabs.getCurrent(function (tab) {
                        chrome.tabs.remove(tab.id);
                    });
                } else {
                    // pass
                }
            } else {
                hotot_action('system/quit');
            }
        }
    });
}
$(window).unload(function() {
    quit();
});
function open_people(screen_name, additional_opts, in_background) {
    // @TODO check this user if exists or not
    toast.set('Lookup @'+screen_name+'... ').show();
    var name = 'people_'+screen_name;
    var title = '@' + screen_name + '\'s Profile';
    ui.Slider.add(name
        , {title: title, icon:'image/ic_people.png'}
        , $.extend({   'type': 'people', 'title': title
            , 'load': ui.PeopleView.load_timeline_full
            , 'loadmore': ui.PeopleView.loadmore_timeline
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_tweet
            , 'init': ui.PeopleView.init_view
            , 'destroy': ui.PeopleView.destroy_view
            , 'header_html': ui.Template.common_column_header_t
            , 'header_html_ex': ui.Template.people_vcard_t
            , 'method': 'poll'
            , 'interval': 120
            , 'item_type': 'id'
            , 'is_trim': true
            , 'screen_name': screen_name
        }, additional_opts));
    ui.Main.views[name].load();
    if (in_background != true) {
        ui.Slider.slide_to(name);
    }
}

function open_list(screen_name, slug, additional_opts, in_background) {
    // @TODO check this list if exists or not
    toast.set('Lookup @'+screen_name+'/'+slug+'... ').show();
    var name = 'list_'+screen_name+'_'+slug;
    var title = 'List @' + screen_name + '/'+slug;
    ui.Slider.add(name
        , {title: title, icon:'image/ic_list.png'}
        , $.extend({   'type': 'list', 'title': title
            , 'load': ui.ListView.load_timeline_full
            , 'loadmore': ui.ListView.loadmore_timeline
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_tweet
            , 'init': ui.ListView.init_view
            , 'destroy': ui.ListView.destroy_view
            , 'header_html': ui.Template.common_column_header_t
            , 'header_html_ex': ui.Template.list_vcard_t
            , 'method': 'poll'
            , 'interval': 120
            , 'item_type': 'id'
            , 'is_trim': true
            , 'screen_name': screen_name
            , 'slug': slug
        }, additional_opts));
    ui.Main.views[name].load();
    if (in_background != true) {
        ui.Slider.slide_to(name);
    }
}

function open_search(query, additional_opts, in_background) {
    toast.set('Lookup "'+ query +'"... ').show();
    var name = 'search_'+ util.generate_uuid();
    var title = 'Search Result of "' + query + '"';
    ui.Slider.add(name
        , {title: title, icon:'image/ic_search.png'}
        , $.extend({ 'type': 'saved_search', 'title': title
            , 'load': ui.SearchView.load_tweet
            , 'loadmore': ui.SearchView.loadmore_tweet
            , 'load_success': ui.SearchView.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.SearchView.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_search
            , 'destroy': ui.SearchView.destroy_view
            , 'header_html': ui.Template.common_column_header_t
            , 'method': 'poll'
            , 'interval': 120
            , 'item_type': 'phoenix_search'
            , 'is_trim': true
            , 'query': query
        }, additional_opts));
    ui.Main.views[name].load();
    if (in_background != true) {
        ui.Slider.slide_to(name);
    }
}

function update_status(text) {
    globals.twitterClient.update_status(text, null,
        function (result) {
            hotot_notify('Notice', 'Sent a status:' + text, null , 'content');
        },
        function (xhr, textStatus, errorThrown) {
        });
}

function reply_tweet(tid, text) {
    globals.twitterClient.update_status(text, tid,
        function (result) {
            hotot_notify('Notice', 'Reply a status:' + text, null , 'content');
        },
        function (xhr, textStatus, errorThrown) {
        });
}

function send_tweet(text) {

}

function send_dm(screen_name) {

}

function navigate_action(uri) {
    if (util.is_native_platform()) {
        window.location.href = uri;
    } else {
        window.open(uri);
    }
}

function hotot_notify(title, summary, image, type) {
    notification.push(title, summary, image, type);
}

function hotot_log(label, content) {
    if (conf.settings.use_verbose_mode) {
        if (util.is_native_platform()) {
            hotot_action('action/log/' + encodeURIComponent(label)
                + '/' + encodeURIComponent(content));
        } else if (conf.vars.platform == 'Chrome') {
            console.log('[' + label + '] ' + content);
        }
    }
}
function unread_alert(count) {
    var sp = 0;
    var proc = function (){
        sp ^= 1;
        document.title = '('+(sp?globals.unread_count:' ! ')+')' + _('hotot') + ' | ' + conf.current_name;
        globals.unread_alert_timer = setTimeout(proc, 2000);
    }
    clearTimeout(globals.unread_alert_timer);
    if (count == 0) {
        globals.unread_count = 0;
        document.title = _('hotot') + ' | ' + conf.current_name;
        if (util.is_native_platform()) {
            hotot_action('system/unread_alert/0');
        }
    } else {
        globals.unread_count += count;
        if (util.is_native_platform()) {
            hotot_action('system/unread_alert/'+globals.unread_count);
        } else {
            proc();
        }
    }
}

/*
    = startup process =
    - document.ready -> init() -> db.init() -> daemon.init()
        -> conf.init() -> ext.init() -> set loading flags
    - native web container init -> on_load_finish() -> wait for loading flags being setted -> ext.init_exts() -> finish
*/

function init(callback) {
    hotot_log('init', 'init()');
    // twitter client
    globals.network = new lib.Network();
    globals.twitterClient = new lib.twitter.Client();
    globals.twitterClient.network = globals.network;
    globals.twitterClient.oauth = new lib.OAuth();
    globals.twitterClient.oauth.network = globals.network;
    var procs = [];
    procs.push(function() {
        db.init(function () {
            $(window).dequeue('_page_init');
        });
    });
    procs.push(function() {
        daemon.init();
        $(window).dequeue('_page_init');
    });
    procs.push(function() {
        conf.init(function () {
            $(window).dequeue('_page_init');
        });
    });
    procs.push(function() {
        ext.init();
        $(window).dequeue('_page_init');
    });
    procs.push(function() {
        on_load_finish();
        $(window).dequeue('_page_init');
    });

    $(window).queue('_page_init', procs);
    $(window).dequeue('_page_init');
}

function init_dialogs() {
    hotot_log('init', 'init_dialogs()');
    globals.oauth_dialog = new widget.Dialog('#oauth_dlg');
    globals.oauth_dialog.resize(350, 400);
    globals.oauth_dialog.create();

    globals.profile_dialog = new widget.Dialog('#profile_dlg');
    globals.profile_dialog.resize(500, 450);
    globals.profile_dialog.create();

    globals.list_attr_dialog = new widget.Dialog('#list_attr_dlg');
    globals.list_attr_dialog.resize(500, 330);
    globals.list_attr_dialog.create();

    globals.add_to_list_dialog = new widget.Dialog('#add_to_list_dlg');
    globals.add_to_list_dialog.resize(400, 500);
    globals.add_to_list_dialog.create();

    globals.prefs_dialog = new widget.Dialog('#prefs_dlg');
    globals.prefs_dialog.resize(600, 600);
    globals.prefs_dialog.create();

    globals.imageuploader_dialog = new widget.Dialog('#imageuploader_dlg');
    globals.imageuploader_dialog.resize(600, 600);
    globals.imageuploader_dialog.create();

    globals.imagepreview_dialog = new widget.Dialog('#imagepreview_dlg');
    globals.imagepreview_dialog.resize(1800, 1800);
    globals.imagepreview_dialog.create();

    globals.error_dialog= new widget.Dialog('#error_dlg');
    globals.error_dialog.resize(500, 400);
    globals.error_dialog.create();

    globals.about_dialog = new widget.Dialog('#about_dlg');
    globals.about_dialog.resize(500, 500);
    globals.about_dialog.create();

    globals.kismet_dialog = new widget.Dialog('#kismet_dialog');
    globals.kismet_dialog.resize(600, 500);
    globals.kismet_dialog.create();

    globals.compose_dialog = new widget.Dialog('#status_box');
    globals.compose_dialog.resize(600, 'auto');
    globals.compose_dialog.create();
}

function init_ui() {
    init_hotkey();
    kismet.init();
    notification.init();
    toast.init();
    ui.Slider.init();
    ui.Template.init();
    ui.Header.init();
    ui.StatusBox.init();
    ui.Main.init();
    ui.Welcome.init();
    ui.HomeTabs.init();
    ui.MentionTabs.init();
    ui.RetweetView.init();
    ui.DMTabs.init();
    ui.PeopleView.init();
    ui.ListView.init();
    ui.SearchView.init();
    ui.PinDlg.init();
    ui.PrefsDlg.init();
    ui.ProfileDlg.init();
    ui.ListAttrDlg.init();
    ui.KismetDlg.init();
    ui.ExtsDlg.init();
    ui.ErrorDlg.init();
    ui.ImageUploader.init();
    ui.AboutDlg.init();
    ui.Finder.init();
    ui.ActionMenu.init();
    ui.ContextMenu.init();
    ui.Previewer = new widget.Previewer('#previewer');
    init_dialogs();

    widget.Scrollbar.register();

    globals.ratelimit_bubble = new widget.Bubble('#ratelimit_bubble', '#btn_my_profile');
    globals.ratelimit_bubble.create();
    globals.ratelimit_bubble.set_content("0");
}

function init_hotkey() {
    hotkey.init();
    // Application
    // <Ctrl> + q to quit
    hotkey.register("<C-q>", "*", function () {
        quit();
    });
    // '?' to open help & about dialog
    hotkey.register("?", "g", function () {
        globals.about_dialog.open();
    });
    // 'r' to reload timeline
    hotkey.register("r", function () {
        toast.set('Loading Tweets...').show(-1);
        daemon.update_all();
    });
    // 'c' to compose
    hotkey.register("c",
    function () { 
        ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
        ui.StatusBox.set_status_text('');
        ui.StatusBox.open();
    });
    // Navigation
    hotkey.register(hotkey.calculate(38), "D", function () {
        ui.Main.move_by_offset(-50);
        return false;
    });
    hotkey.register(hotkey.calculate(40), "D", function () {
        ui.Main.move_by_offset(50);
        return false;
    });
    // page up/down @TODO 500px is not accurate
    hotkey.register(hotkey.calculate(33), "D", function () {
        ui.Main.move_by_offset(-500);
        return false;
    });
    hotkey.register(hotkey.calculate(34), "D", function () {
        ui.Main.move_by_offset(500);
        return false;
    });
    hotkey.register(hotkey.calculate(36), "D", function () {
        ui.Main.move_to_tweet("top");
        return false;
    });
    hotkey.register(hotkey.calculate(35), "D", function () {
        ui.Main.move_to_tweet("bottom");
        return false;
    });
    // 'h' to slide to prev tab
    hotkey.register("h", ui.Slider.slide_to_prev);
    // 'l' to slide to next tab
    hotkey.register("l", ui.Slider.slide_to_next);
    // 'k' to move to prev tweet
    hotkey.register("k", function () {
        ui.Main.move_to_tweet("prev");
    });
    // 'j' to move to next tweet
    hotkey.register("j", function () {
        ui.Main.move_to_tweet("next");
    });
    // 'g' then 'g' to move to top
    hotkey.register("gg", function () {
        ui.Main.move_to_tweet("top");
    });
    // shift + 'g' to move to bottom
    hotkey.register("G", function () {
        ui.Main.move_to_tweet("bottom");
    });
    // 'g' then 'h' to go home
    hotkey.register("gh", function () {
        ui.Slider.slide_to('home');
    });
    // 'g' then 'm' to go mentions
    hotkey.register("gm", function () {
        ui.Slider.slide_to('mentions');
    });
    // 'g' then 'd' to go messages
    hotkey.register("gd", function () {
        ui.Slider.slide_to('messages');
    });
    // 'g' then 'r' to go retweets
    hotkey.register("gr", function () {
        ui.Slider.slide_to('retweets');
    });
    // 'g' then 's' to go search
    hotkey.register("gs", function () {
        ui.Slider.slide_to('search');
    });

    // Actions, prefix 'a'
    // 'a' then 'r' to reply
    hotkey.register("ar", function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_reply_click(null, ui.Main.selected_tweet_id, null);
            }
        }
    });
    // 'a' then 'q' to quote
    hotkey.register("aq", function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_rt_click(null, ui.Main.selected_tweet_id, null);
            }
        }
    });
    // 'a' then 's' to favorite/un-fav
    hotkey.register("as", function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_fav_click(this, ui.Main.active_tweet_id, event);
            }
        }
    });

    // 'a' then 'a' to reply all
    hotkey.register("aa", function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_reply_all_click(null, ui.Main.selected_tweet_id, null);
            }
        }
    });

    // 'a' then <Shift>+'r' to retweet/undo-retweet
    hotkey.register("aR", function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_retweet_click(this, ui.Main.active_tweet_id, event);
            }
        }
    });
    // 'a' then 'd' to delete
    hotkey.register("ad", function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_del_click(this, ui.Main.active_tweet_id, event);
            }
        }
    });
    // 'a' then 'm' to send msg
    hotkey.register("am", function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_dm_click(this, ui.Main.active_tweet_id, event);
            }
        }
    });
    // 'a' then 'u' to open people of current selected tweet
    hotkey.register("au", function () {
        ui.Main.on_open_people_btn_click(null, ui.Main.selected_tweet_id, null);
    });
    // 'a' then 'o' to open first link of the selected tweet
    hotkey.register("ao", function () {
        ui.Main.on_open_link_btn_click(null, ui.Main.selected_tweet_id, null);
    });
    // 'a' then 'f' to open finder
    hotkey.register("af", function () {
        ui.Finder.show();
    });

    // 'z' then 'c' to fold/un-fold conversation
    hotkey.register("zc", function () {
        if (ui.Main.selected_tweet_id != null) {
            var btn = $(ui.Main.selected_tweet_id)
                .find('.btn_tweet_thread:first')
            if (btn.is(':visible')) {
                btn.click();
            }
        }
    });

    // 't' then 'x' to close current view
    hotkey.register("tx", function () {
        if (ui.Slider.current != "home" && ui.Slider.current != "mentions" && ui.Slider.current != "search") {
            ui.Main.destroy_view(ui.Main.views[ui.Slider.current])
        }
    });
    // :)
    hotkey.register("#@!^&", function(){
        $('.profile_img_wrapper').css('background-image', 'url(image/ic48_profile_image.png)');
    });
	hotkey.register("MIRROR", "gm", function(){
		if ($('body').css('-webkit-transform') != 'none') {
        	$('body').css('-webkit-transform', 'none');
		} else {
        	$('body').css('-webkit-transform', 'rotateY(180deg)');
		}
    });
}

function overlay_variables(vars) {
    conf.vars.platform = vars.platform;
    hotot_log('init', 'overlay_variables()');
    if (util.is_native_platform()) {
        // native variables
        conf.vars.wrapper = vars.wrapper;
        conf.vars.conf_dir = vars.conf_dir;
        conf.vars.cache_dir = vars.cache_dir;
        conf.vars.avatar_cache_dir = vars.avatar_cache_dir;
        conf.settings.font_list = vars.extra_fonts;
        conf.vars.extra_themes = vars.extra_themes
        ext.extras = vars.extra_exts;
        i18n.locale = vars.locale;
    }
}

function on_load_finish() {
    // if native_platform
    //      wait until the webview is ready.
    if (util.is_native_platform() && globals.load_flags == 0) {
        setTimeout(on_load_finish, 100);
    } else {
        hotot_log('init', 'on_load_finish()');
        globals.load_flags = 1;
        // 1. load builtins & extra extensions
        var procs = [];
        procs.push(function () {
            hotot_log('init', 'on_load_finish() -> ext.load_builtin_exts();');
            ext.load_builtin_exts(function () {
                $(window).dequeue('_on_load_finish');
            });
        });
        procs.push(function() {
            hotot_log('init', 'on_load_finish() -> ext.load_exts();');
            ext.load_exts('extra', ext.extras, function () {
                $(window).dequeue('_on_load_finish');
            });
        });
        // init enabled extensions
        procs.push(function () {
            hotot_log('init', 'on_load_finish() -> ext.init_exts();');
            ext.init_exts();
            $(window).dequeue('_on_load_finish');
        });

        // 2. push settings to native platform
        if (util.is_native_platform()) {
            procs.push(function () {
                hotot_log('init', 'on_load_finish() -> push settings');
                hotot_action('system/load_settings/'
                    + encodeURIComponent(JSON.stringify(conf.settings)))
                globals.load_flags = 2;
                $(window).dequeue('_on_load_finish');
                $('#tbox_status_speech').hide();
            });
        } else {
            procs.push(function () {
                hotot_log('init', 'on_load_finish() -> push settings');
                $(window).width(conf.settings.size_w);
                $(window).height(conf.settings.size_h);
                globals.load_flags = 2;
                $(window).dequeue('_on_load_finish');
            });
        }
        // 3. i18n
        procs.push(function() {
            hotot_log('init', 'on_load_finish() -> i18n.init()');
            i18n.init(function () {
                $(window).dequeue('_on_load_finish');
            });
        });
        // 4. init_ui();
        procs.push(function() {
            hotot_log('init', 'on_load_finish() -> init_ui()');
            init_ui();
            $(window).dequeue('_on_load_finish');
        });
        // 5. platform relatd ui staffs
        procs.push(function() {
            // @TODO DND image uploading in native platform
            // is disabled for conflicting with HTML5 DND
            if (util.is_native_platform()) {
                $('#tbox_status').attr('placeholder', 'Share something new ...');
                $('#imageuploader_dlg .drag_hint').hide();
            } else {
                $('#imageuploader_dlg .preview_hint').hide();
            }
            $(window).dequeue('_on_load_finish');
        });
        // 6. finish, hide loading prompt
        procs.push(function () {
            $('#welcome_page_loading').fadeOut(function () {
                hotot_log('init', 'done!');
                $('#welcome_page_main').fadeIn();
                ui.Welcome.load_daily_hint();
                ui.Welcome.load_profiles_info();
                if ($('#profile_avatar_list a').length == 1) {
                    $('#profile_avatar_list a:first').click();
                } else {
                    $('#profile_avatar_list a:eq(1)').click();
                }
                $(window).dequeue('_on_load_finish');
                if (conf.settings.sign_in_automatically) {
                    ui.Welcome.go.addClass('loading');
                    setTimeout(function () {
                        ui.Welcome.go.trigger('click');
                    }, 2000);
                }
            });
            });
        // 7. run track code
        procs.push(function () {
            if (conf.settings.use_anonymous_stat) {
               track({
                   'platform': conf.vars.platform,
                   'version': conf.vars.version,
                   'autologin': conf.settings.sign_in_automatically,
                   'lang': window.navigator.language,
                   'localeDate': new Date().toString()
               });
            }
            $(window).dequeue('_on_load_finish');
        });
        $(window).queue('_on_load_finish', procs);
        $(window).dequeue('_on_load_finish');
    }
}

function track(vars) {
    var url = 'http://stat.hotot.org/?';
    var arr = [];
    for (var k in vars) {
        arr.push(k + '=' + vars[k]);
    }
    url += arr.join('&');
    new Image().src = url;
    return;
}

function syncMyself() {
    // sync block users
    syncBlockingUsers();
    // sync my lists
    syncMyLists();
    // @TODO sync following users
    db.get_screen_names(
    function (tx, rs) {
        globals.conversant = [];
        for (var i = 0, l = rs.rows.length; i < l; i += 1) { 
            globals.conversant.push(rs.rows.item(i).screen_name)
        }
    });
}

function syncBlockingUsers () {
    var proc = function (result) {
        globals.blocking_ids = globals.blocking_ids.concat(result.ids)
        if (result.next_cursor_str !== '0') {
            globals.twitterClient.get_blocking_ids(result.next_cursor_str, proc);
        }
    }
    globals.twitterClient.get_blocking_ids(-1, 
        function (result) {
            globals.blocking_ids = []; 
            proc(result);
        }, 
        function () {}
    );
}

function syncMyLists () {
    var proc = function (result) {
        globals.my_lists = globals.my_lists.concat(result.lists)
        if (result.next_cursor_str !== '0') {
            globals.twitterClient.get_user_lists(
                globals.myself.screen_name,
                result.next_cursor_str,
                proc);
        }
    }
    globals.twitterClient.get_user_lists(
        globals.myself.screen_name, -1,
        function (result) {
            globals.my_lists = []; 
            proc(result);
        }, 
        function () {}
    );
}

var globals = {
      tweet_block_width: 600
    , max_status_len: 140
    , tweet_font_size: 10
    , tweet_font: ''
    , myself: {}
    , signed_in: false
    , load_flags: 0
    , ratelimit_bubble: null
    , unread_alert_timer: null
    , unread_count: null
    , blocking_ids: []
    , my_lists: []
    , conversant: []
};

jQuery(function($) {
    globals.layout = $("#container").layout(layout_opts);
    globals.layout.close("west");
    globals.layout.close("south");

    $(document).keyup(
    function (event) {
        if (! ui.ActionMenu.is_hide) {
            return ui.ActionMenu.handle_keyup(event.keyCode);
        }
        return true;
    });

    $(document).click(
    function (event) {
        if (event.button == 0) {
            ui.ContextMenu.hide();
        }
    });

    document.getElementById('indication').onmousewheel = function (event) {
        if (event.wheelDelta < 0){
            ui.Slider.slide_to_next(true);
        } else {
            ui.Slider.slide_to_prev(true);
        }
        return true;
    };

    document.body.onmousewheel = function (event) {
        if (event.wheelDeltaY < -50 || event.wheelDeltaY > 50){
            return true;
        }
        if (event.wheelDeltaX && event.wheelDeltaX < -100){
            ui.Slider.slide_to_next(true);
        } else if (event.wheelDeltaX && event.wheelDeltaX > 100){
            ui.Slider.slide_to_prev(true);
        }
    };
    $(window).bind('focus click', function () {
        unread_alert(0);
    });
    $('.card').live('click', function () {
        unread_alert(0);
    });

    var on_resize = function () {
        update_tweet_block_width();
        if (globals.load_flags) {
            if (globals.load_flags == 2) {
                conf.settings.size_w = $(window).width();
                conf.settings.size_h = $(window).height();
                conf.save_settings()
                if (ui.Slider.column_num != 0) {
                    if (ui.Slider.current.length == 0) {
                        ui.Slider.slide_to(ui.Slider.tweet_blocks[0]);
                    } else {
                        ui.Slider.slide_to(ui.Slider.current);
                    }
                }
            }
        }
    }
    var resize_timer = false
    $(window).resize(function () {
        if (resize_timer !== false)
            clearTimeout(resize_timer);
        resize_timer = setTimeout(on_resize, 200);
    });

    $("#count").hover(
    function () {
        $("#count > ul").show();
    },
    function () {
        $("#count > ul").hide();
    });

    jQuery.fx.interval = 50;

    init();

    update_tweet_block_width();
});

