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

function change_effects_level(level) {
    $('#effects_level').attr('href', 'css/effects_' + level + '.css');
}

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
    $('.view_title:gt(ui.Slider.column_num)').hide();
    $('.tweetview').width(globals.tweet_block_width);
    $('.tweetview:eq('+(ui.Slider.column_num - 1)+')').width(
        view_width - (ui.Slider.column_num-1) * globals.tweet_block_width);
    $('.view_title').width(globals.tweet_block_width-1);
    $('.view_title:eq('+(ui.Slider.column_num - 1)+')').width(
        view_width - (ui.Slider.column_num-1) * globals.tweet_block_width - 1);

    // no_stick indicators
    var idrs = $('#indicator_btns').children('.no_stick');
    $('#indicator_btns').children('.no_stick:eq(0)')
        .css('margin-left', (($(window).width()-(idrs.length+1) * 40)/2) + 'px');

    // adjust width of compose button
    if (ui.Slider.column_num == 1) {
        $('#indicator_compose_btn').removeClass('with_label');
    } else {
        $('#indicator_compose_btn').addClass('with_label');
    }

    // adjust width of compose box
    var status_box_w = $(window).width()*0.6;
    if (status_box_w < 550) {       // 550, max-width of #status_box
        if (status_box_w < 400) {   // 400, min-width of #status_box
            status_box_w = 400;
        }
    } else {
        status_box_w = 550;
    }
    $('#status_box').width(status_box_w);
}

function hotot_action(uri) {
    if (util.is_native_platform()) {
        alert('hotot:' + uri);
    }
}

function quit() {
    conf.save_settings(function () {
        conf.save_prefs(conf.current_name, function(){
            if (conf.vars.platform == 'Chrome') {
                chrome.tabs.getCurrent(function (tab) {
                    chrome.tabs.remove(tab.id);
                });
            } else {
                hotot_action('system/quit');
            }
        });
    });
}

function open_people(screen_name, additional_opts) {
    // @TODO check this user if exists or not
    toast.set('Lookup @'+screen_name+'... ').show();
    var name = 'people_'+screen_name;
    var title = '@' + screen_name + '\'s Profile';
    ui.Slider.add(name
        , {title: title, icon:'image/ic_people.png'}
        , $.extend({   'type': 'people', 'title': title
            , 'load': ui.PeopleView.load_timeline
            , 'loadmore': ui.PeopleView.loadmore_timeline
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_tweet
            , 'init': ui.PeopleView.init_view
            , 'destroy': ui.PeopleView.destroy_view
            , 'header_html': ui.Template.people_vcard_t
            , 'method': 'poll'
            , 'interval': 120
            , 'item_type': 'id'
            , 'is_trim': true
            , 'screen_name': screen_name
        }, additional_opts));
    ui.Main.views[name].load();
    ui.Slider.slide_to(name);
}

function open_list(screen_name, slug, additional_opts) {
    // @TODO check this list if exists or not
    toast.set('Lookup @'+screen_name+'/'+slug+'... ').show();
    var name = 'list_'+screen_name+'_'+slug;
    var title = 'List @' + screen_name + '/'+slug;
    ui.Slider.add(name
        , {title: title, icon:'image/ic_list.png'}
        , $.extend({   'type': 'list', 'title': title
            , 'load': ui.ListView.load_timeline
            , 'loadmore': ui.ListView.loadmore_timeline
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_tweet
            , 'init': ui.ListView.init_view
            , 'destroy': ui.ListView.destroy_view
            , 'header_html': ui.Template.list_vcard_t
            , 'method': 'poll'
            , 'interval': 120
            , 'item_type': 'id'
            , 'is_trim': true
            , 'screen_name': screen_name
            , 'slug': slug
        }, additional_opts));
    ui.Main.views[name].load();
    ui.Slider.slide_to(name);
}

function update_status(text) {
    lib.twitterapi.update_status(text, null,
        function (result) {
            hotot_notify('Notice', 'Sent a status:' + text, null , 'content');
        },
        function (xhr, textStatus, errorThrown) {
            toast.set('Update failed! Save as draft.').show(3);
            ui.StatusBox.last_sent_text = '';
            ui.StatusBox.save_draft(draft);
        });
}

function reply_tweet(tid, text) {

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
        } else {
            util.console.out('[' + label + '] ' + content);
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
    globals.oauth_dialog.resize(350, 350);
    globals.oauth_dialog.place(widget.DialogManager.CENTER);
    globals.oauth_dialog.create();

    globals.profile_dialog = new widget.Dialog('#profile_dlg');
    globals.profile_dialog.resize(500, 400);
    globals.profile_dialog.place(widget.DialogManager.CENTER);
    globals.profile_dialog.create();

    globals.list_attr_dialog = new widget.Dialog('#list_attr_dlg');
    globals.list_attr_dialog.resize(500, 330);
    globals.list_attr_dialog.place(widget.DialogManager.CENTER);
    globals.list_attr_dialog.create();

    globals.add_to_list_dialog = new widget.Dialog('#add_to_list_dlg');
    globals.add_to_list_dialog.resize(400, 260);
    globals.add_to_list_dialog.place(widget.DialogManager.CENTER);
    globals.add_to_list_dialog.create();

    globals.prefs_dialog = new widget.Dialog('#prefs_dlg');
    globals.prefs_dialog.resize(500, 400);
    globals.prefs_dialog.place(widget.DialogManager.CENTER);
    globals.prefs_dialog.create();

    globals.exts_dialog = new widget.Dialog('#exts_dlg');
    globals.exts_dialog.resize(500, 400);
    globals.exts_dialog.place(widget.DialogManager.CENTER);
    globals.exts_dialog.create();

    globals.imageuploader_dialog = new widget.Dialog('#imageuploader_dlg');
    globals.imageuploader_dialog.resize(600, 600);
    globals.imageuploader_dialog.place(widget.DialogManager.CENTER);
    globals.imageuploader_dialog.create();

    globals.error_dialog= new widget.Dialog('#error_dlg');
    globals.error_dialog.resize(500, 400);
    globals.error_dialog.place(widget.DialogManager.CENTER);
    globals.error_dialog.create();

    globals.about_dialog = new widget.Dialog('#about_dlg');
    globals.about_dialog.resize(500, 400);
    globals.about_dialog.place(widget.DialogManager.CENTER);
    globals.about_dialog.create();

    globals.kismet_dialog = new widget.Dialog('#kismet_dlg');
    globals.kismet_dialog.resize(600, 500);
    globals.kismet_dialog.place(widget.DialogManager.CENTER);
    globals.kismet_dialog.create();
}

function init_ui() {
    util.console.init();
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
    init_dialogs();

    globals.ratelimit_bubble = new widget.Bubble('#ratelimit_bubble', '#btn_my_profile');
    globals.ratelimit_bubble.create();
    globals.ratelimit_bubble.set_content("0");
}

function init_hotkey() {
    hotkey.init();
    // Application
    // 'r' to reload timeline
    var ig = hotkey.calculate(71);
    hotkey.register(hotkey.calculate(82),function () {
        toast.set('Loading Tweets...').show(-1);
        daemon.update_all();
    });
    // 'c' to compose
    hotkey.register(hotkey.calculate(67),
        function () {ui.StatusBox.open();});
    // Navigation
    // 'h' to slide to prev tab
    hotkey.register(hotkey.calculate(72), ui.Slider.slide_to_prev);
    // 'l' to slide to next tab
    hotkey.register(hotkey.calculate(76), ui.Slider.slide_to_next);
    // 'k' to move to prev tweet
    hotkey.register(hotkey.calculate(75), function () {
        ui.Main.move_to_tweet("prev");
    });
    // 'j' to move to next tweet
    hotkey.register(hotkey.calculate(74), function () {
        ui.Main.move_to_tweet("next");
    });
    // 'g' then 'g' to move to top
    hotkey.register([ig ,ig], function () {
        ui.Main.move_to_tweet("top");
    });
    // shift + 'g' to move to bottom
    hotkey.register(hotkey.calculate(71, hotkey.shiftKey), function () {
        ui.Main.move_to_tweet("bottom");
    });
    // 'g' then 'h' to go home
    hotkey.register([ig,hotkey.calculate(72)], function () {
        ui.Slider.slide_to('home');
    });
    // 'g' then 'm' to go mentions
    hotkey.register([ig,hotkey.calculate(77)], function () {
        ui.Slider.slide_to('mentions');
    });
    // 'g' then 'd' to go messages
    hotkey.register([ig,hotkey.calculate(68)], function () {
        ui.Slider.slide_to('messages');
    });
    // 'g' then 'r' to go retweets
    hotkey.register([ig,hotkey.calculate(82)], function () {
        ui.Slider.slide_to('retweets');
    });
    // 'g' then 's' to go search
    hotkey.register([ig,hotkey.calculate(83)], function () {
        ui.Slider.slide_to('search');
    });

    // @TODO Actions, prefix 'a'
    var ia = hotkey.calculate(65);
    // 'a' then 'r' to reply
    hotkey.register([ia, hotkey.calculate(82)], function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_reply_click(null, ui.Main.selected_tweet_id, null);
            }
        }
    });
    // 'a' then 'q' to quote
    hotkey.register([ia, hotkey.calculate(81)], function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_rt_click(null, ui.Main.selected_tweet_id, null);
            }
        }
    });
    // 'a' then 's' to favorite/un-fav
    hotkey.register([ia, hotkey.calculate(83)], function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_fav_click(this, ui.Main.active_tweet_id, event);
            }
        }
    });

    // 'a' then 'a' to reply all
    hotkey.register([ia, ia], function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_reply_all_click(null, ui.Main.selected_tweet_id, null);
            }
        }
    });

    // 'a' then <Shift>+'r' to retweet/undo-retweet
    hotkey.register([ia, hotkey.calculate(82, hotkey.shiftKey)], function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_retweet_click(this, ui.Main.active_tweet_id, ev);
            }
        }
    });
    // 'a' then 'd' to delete
    hotkey.register([ia, hotkey.calculate(68)], function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_del_click(this, ui.Main.active_tweet_id, event);
            }
        }
    });
    // 'a' then 'm' to send msg
    hotkey.register([ia, hotkey.calculate(77)], function() {
        if (ui.Main.selected_tweet_id != null) {
            var current = $(ui.Main.selected_tweet_id);
            if (current.length != 0) {
                ui.Main.on_dm_click(this, ui.Main.active_tweet_id, event);
            }
        }
    });

    // 'z' then 'o' to expand
    var iz = hotkey.calculate(90);
    hotkey.register([iz, hotkey.calculate(79)], function () {
        if (ui.Main.selected_tweet_id != null) {
            var btn = $(ui.Main.selected_tweet_id)
                .find('.btn_tweet_thread:first');
            btn.removeClass('expand');
            btn.click();
        }
    });
    // 'z' then 'c' to expand
    hotkey.register([iz, hotkey.calculate(67)], function () {
        if (ui.Main.selected_tweet_id != null) {
            var btn = $(ui.Main.selected_tweet_id)
                .find('.btn_tweet_thread:first')
            btn.addClass('expand');
            btn.click();
        }
    });
    // :)
    hotkey.register([hotkey.calculate(51, hotkey.shiftKey)
        , hotkey.calculate(50, hotkey.shiftKey)
        , hotkey.calculate(49, hotkey.shiftKey)
        , hotkey.calculate(54, hotkey.shiftKey)
        , hotkey.calculate(55, hotkey.shiftKey)], function(){
            $('.profile_img_wrapper').css('background-image', 'url(image/ic48_profile_image.png)');
        });
}

function overlay_variables(vars) {
    conf.vars.platform = vars.platform;
    hotot_log('init', 'overlay_variables()');
    if (util.is_native_platform()) {
        // native variables
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
        setTimeout(on_load_finish, 1000);
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
        // 5. finish, hide loading prompt
        procs.push(function () {
            $('#welcome_page_loading').fadeOut(function () {
                hotot_log('init', 'done!');
                $('#welcome_page_main').fadeIn();
                ui.Welcome.load_daily_hint();
                ui.Welcome.load_profiles_info();
                $('#profile_avatar_list a:first').click();
                $(window).dequeue('_on_load_finish');
            });
            });
        // 6. run track code
        procs.push(function () {
            if (util.is_native_platform()) {
                track_alt({
                    'platform': conf.vars.platform,
                    'version': conf.vars.version}
                );
            } else {
                track({
                    'platform': conf.vars.platform,
                    'version': conf.vars.version}
                );
            }
            $(window).dequeue('_on_load_finish');
        });
        $(window).queue('_on_load_finish', procs);
        $(window).dequeue('_on_load_finish');
    }
}
function track(vars) {
    var pageTracker = _gat._getTracker("UA-18538886-4");
    pageTracker._setCustomVar(1, 'Platform', vars.platform, 1);
    pageTracker._setCustomVar(2, 'Version', vars.version, 1);
    pageTracker._trackPageview();
    return;
}

function track_alt(vars) {  
    function rand(min, max) {
        return min + Math.floor(Math.random() * (max - min));
    }
    var img = new Image();
    var urchinCode = 'UA-18538886-4';
    var i=1000000000;
    var utmn=rand(i,9999999999);
    var cookie=rand(10000000,99999999);
    var random=rand(i,2147483647);
    var today=(new Date()).getTime();
    var win = window.location;
    var urchinUrl = 'http://www.google-analytics.com/__utm.gif?utmwv=5.2.0'
        + '&utms=6'
        + '&utmn=' + utmn
        + '&utme=' + '8(Platform*Version)9('+vars.platform+'*'+vars.version+')11(1*1)'
        + '&utmcs=UTF-8&utmsr=1280x800&utmsc=24-bit&utmul=en-us&utmje=1&utmfl=11.0 d1'
        + '&utmdt=' + encodeURIComponent(document.title)
        + '&utmhn=' + win.host 
        + '&utmr=-'
        + '&utmp=' + win.pathname 
        + '&utmac=' + urchinCode
        + '&utmcc=__utma%3D' + cookie+'.'+random+'.'+today+'.'+today+'.'
            +today+'.2%3B%2B__utmb%3D'
            +cookie+'%3B%2B__utmc%3D'
            +cookie+'%3B%2B__utmz%3D'
            +cookie+'.'+today
            +'.2.2.utmccn%3D(referral)%7Cutmcsr%3D'
            + win.host + '%7Cutmcct%3D'
            + win.pathname + '%7Cutmcmd%3Dreferral%3B%2B__utmv%3D'
            +cookie+'.-%3B';
    img.src = urchinUrl;
}

var globals = {
      tweet_block_width: 600
    , max_status_len: 140
    , tweet_font_size: 12
    , myself: {}
    , in_main_view: false
    , load_flags: 0
    , ratelimit_bubble: null
    , unread_alert_timer: null
    , unread_count: null
};

jQuery(function($) {
    globals.layout = $("#container").layout(layout_opts);
    globals.layout.close("west");
    globals.layout.close("south");

    $(document).keyup(
    function (event) {
        var focus_input = (event.target.tagName == 'INPUT' || event.target.tagName == 'TEXTAREA');
        if (event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey && !focus_input) {
            if (event.keyCode == 191) {
                // '?' to open help & about dialog
                globals.about_dialog.open();
                return;
            }
        }
        if (event.ctrlKey && !event.shiftKey && !event.altKey && event.keyCode == 81) {
            // <Ctrl> + q to quit
            quit();
        }
        if (focus_input || !globals.in_main_view)
            return
        if (! ui.ActionMenu.is_hide) {
            return ui.ActionMenu.handle_keyup(event.keyCode);
        }
        hotkey.crack(event);
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
            ui.Slider.slide_to_next();
        } else {
            ui.Slider.slide_to_prev();
        }
        return true;
    };

    document.body.onmousewheel = function (event) {
        if (event.wheelDeltaY && (event.wheelDeltaX > 50 || event.wheelDeltaX < 50)){
            return true;
        }
        if (event.wheelDeltaX && event.wheelDeltaX < -90){
            ui.Slider.slide_to_next();
        } else if (event.wheelDeltaX && event.wheelDeltaX > 90){
            ui.Slider.slide_to_prev();
        }
    };
    $('body').focus(function () {
        unread_alert(0);
    });

    $(window).resize(
    function () {
        update_tweet_block_width();
        if (globals.load_flags) {
            if (globals.load_flags == 2) {
                conf.settings.size_w = $(window).width();
                conf.settings.size_h = $(window).height();
                conf.save_settings()
                ui.Slider.slide_to(ui.Slider.current);
            }
        }
    });

    $("#count").hover(
    function () {
        $("#count > ul").show();
    },
    function () {
        $("#count > ul").hide();
    });

    init();

    update_tweet_block_width();
});

