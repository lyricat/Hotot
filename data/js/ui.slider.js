if (typeof ui == 'undefined') var ui = {};
ui.Slider = {

me: {},

id: '',

current: '',

column_num: 1,

tweet_blocks: [],

displayed: [],

isSliderMenuClosed: true,

isViewSettingMenuClosed: true,

state: null,

FLOAT_ICON: 1,

BOARD_ICON: 2,

system_views: {'home':0, 'mentions':0, 'messages':0, 'retweets':0, 'favs':0, 'search':0},

init:
function init () {
    this.id = '#main_page_slider';
    this.me = $('#main_page_slider');
    
    $('#indication').find('.shape').click(
    function (event) {
        $(this).parent().children('.idx_btn').click();
    });

    $('#indication .indicator_btn').live('click', function (ev) {
        var view_name = $(this).attr('href').substring(1);
        if (view_name == 'add') {
            if (ui.Slider.isSliderMenuClosed) {
                ui.Header.closeAll();
                ui.Slider.openSliderMenu();
            } else {
                ui.Slider.closeSliderMenu();
            }
        } else if (view_name == 'compose') {
            if (ui.StatusBox.isClosed) {
                ui.StatusBox.open();
            } else {
                ui.StatusBox.close();
            }
        } else if (view_name == 'hotot') {
            if (ui.Header.isHototMenuClosed) {
                ui.Header.closeAll();
                ui.Header.openHototMenu();
            } else {
                ui.Header.closeHototMenu();
            }
        } else {
            if (ui.Slider.current == view_name) {
                ui.Main.move_to_tweet('top');
            } else { 
                ui.Slider.slide_to(view_name);
                if (view_name === 'search') {
                    setTimeout(function () {
                    $('#search_tweetview .search_entry').focus();
                    }, 1000);
                }
            }
        }
        return false;
    });

    $('#slider_menu a').click(function(){
        var name = $(this).attr('href').substring(1);
        var ret = null;
        switch (name) {
        case 'people':
            ret = widget.DialogManager.prompt('Input a screenname:', 
                'form @screenname',
                function (ret) {
                    ret = $.trim(ret);
                    if (ret.length !== 0) {
                        if (ret[0] == '@') ret = ret.substring(1);
                        open_people(ret, {});
                    }
                });
        break;
        case 'list':
            ret = widget.DialogManager.prompt('Input a List name:',
                'form: @screenname/slug',
                function (ret) {
                    ret = $.trim(ret);
                    if (ret.length !== 0) {
                        if (ret[0] == '@') ret = ret.substring(1);
                        open_list(ret.substring(0, ret.indexOf('/')),
                            ret.substring(ret.indexOf('/')+1), {});
                    }
                });
        break;
        default:
            if (ui.Slider.addDefaultView(name, {}) == true) {
                $(this).addClass('checked');
                if (name != 'search') {
                    ui.Main.views[name].load();
                }
            }
        break;
        }
        ui.Slider.slide_to(name);
        ui.Slider.closeSliderMenu();
        return false;
    });
    $('#slider_menu').mouseleave(
    function (event) {
        ui.Slider.closeSliderMenu();
    });

    $('#view_title_bar .close_btn').click(function () {
        var name = $(this).parent().attr('name');
        ui.Main.views[name].destroy();
        return false;
    });
    
    $('#view_title_bar .setting_btn').click(function () {
        if (ui.Slider.isViewSettingMenuClosed) {
            ui.Header.closeAll();
            var name = $(this).parent().attr('name');
            ui.Slider.openViewSettingMenu(ui.Main.views[name], $(this));
            ui.Slider.settingView = ui.Main.views[name];
        } else {
            ui.Slider.closeViewSettingMenu();
            ui.Slider.settingView = null;
        }
        return false;
    });

    $('#view_setting_menu').mouseleave(
    function (event) {
        ui.Slider.closeViewSettingMenu();
        ui.Slider.settingView = null;
    });

    $('#view_setting_menuitem_notify').click(function () {
        if (ui.Slider.settingView != null) {
            ui.Slider.settingView.use_notify 
                = !ui.Slider.settingView.use_notify; 
            ui.Slider.state.views[ui.Slider.settingView.name].use_notify
                = ui.Slider.settingView.use_notify;
            if (ui.Slider.settingView.use_notify) {
                $(this).addClass('checked');
            } else {
                $(this).removeClass('checked');
            }
        }
        return false;
    });

    $('#view_setting_menuitem_auto_update').click(function () {
        if (ui.Slider.settingView != null) {
            ui.Slider.settingView.use_auto_update 
                = !ui.Slider.settingView.use_auto_update;
            ui.Slider.state.views[ui.Slider.settingView.name].use_auto_update
                = ui.Slider.settingView.use_auto_update;
            if (ui.Slider.settingView.use_auto_update) {
                $(this).addClass('checked');
            } else {
                $(this).removeClass('checked');
            }
        }
        return false;
    });

    $('#view_setting_menuitem_sound').click(function () {
        if (ui.Slider.settingView != null) {
            ui.Slider.settingView.use_notify_sound 
                = !ui.Slider.settingView.use_notify_sound;
            ui.Slider.state.views[ui.Slider.settingView.name].use_notify_sound
                = ui.Slider.settingView.use_notify_sound;
            if (ui.Slider.settingView.use_notify_sound) {
                $(this).addClass('checked');
            } else {
                $(this).removeClass('checked');
            }
        }
        return false;
    });

    ui.Slider.view_titles = $('.view_title');
},

save_state:
function save_state() {
    conf.get_current_profile().preferences.slider_state = {
        order: ui.Slider.tweet_blocks.slice(),
        views: ui.Slider.state.views
    };
},

resume_state:
function resume_state() {
    ui.Slider.state = conf.get_current_profile().preferences.slider_state;
    if (ui.Slider.state == null) {
        ui.Slider.state = {order: [], views: {}};
        ui.Slider.addDefaultView('search', {});
        ui.Slider.addDefaultView('home', {});
        ui.Slider.addDefaultView('mentions', {});
        ui.Slider.addDefaultView('messages', {});
    } else {
        for (var i = 0; i < ui.Slider.state.order.length; i += 1) {
            var name = ui.Slider.state.order[i];
            // @TODO remove unavailable name in 'order'
            if (ui.Slider.state.views.hasOwnProperty(name)) {
                var opts = ui.Slider.state.views[name];
                switch (opts.type) {
                case 'tweet':
                    ui.Slider.addDefaultView(name, opts);
                break;
                case 'people':
                    open_people(opts.screen_name, opts, true);
                break;
                case 'list':
                    open_list(opts.screen_name, opts.slug, opts, true);
                break;
                case 'saved_search':
                    open_search(opts.query, opts, true);
                break;
                }
            }
        }
    }
    if (ui.Slider.column_num != 0) {
        if (ui.Slider.current.length == 0) {
            ui.Slider.slide_to(ui.Slider.tweet_blocks[0]);
        } else {
            ui.Slider.slide_to(ui.Slider.current);
        }
    }
},

add:
function add(name, indicator_opts, view_opts) {
    if (ui.Slider.tweet_blocks.indexOf(name) == -1) {
        ui.Slider.add_view(name, view_opts);
        ui.Slider.add_indicator(name, indicator_opts);
        update_tweet_block_width();            
        switch (view_opts.type) {
        case 'tweet':
            ui.Slider.state.views[name] = {
                  type: view_opts.type
                , use_notify: view_opts.use_notify
                , use_notify_sound: view_opts.use_notify_sound
                , use_auto_update: view_opts.use_auto_update };
        break;
        case 'people':
            ui.Slider.state.views[name] = {
                  type: view_opts.type
                , screen_name: view_opts.screen_name
                , use_notify: view_opts.use_notify
                , use_notify_sound: view_opts.use_notify_sound
                , use_auto_update: view_opts.use_auto_update };
        break;
        case 'list':
            ui.Slider.state.views[name] = {
                  type: view_opts.type
                , screen_name: view_opts.screen_name
                , slug: view_opts.slug
                , use_notify: view_opts.use_notify
                , use_notify_sound: view_opts.use_notify_sound
                , use_auto_update: view_opts.use_auto_update };
        break;
        case 'saved_search':
            ui.Slider.state.views[name] = {
                  type: view_opts.type
                , query: view_opts.query
                , use_notify: view_opts.use_notify
                , use_notify_sound: view_opts.use_notify_sound
                , use_auto_update: view_opts.use_auto_update };
        break;
        }
        $('#' + name + '_tweetview')[0].ontouchstart = function (e) {
            event.preventDefault();
            if (this.start === 1 || !event.touches.length) return;
            this.start = 1;
            var touch = event.touches[0];
            this.startX = touch.pageX;
            this.startY = touch.pageY;
        }
        $('#' + name + '_tweetview')[0].ontouchmove = function (e) {
            event.preventDefault();
            if (this.start !== 1 || !event.touches.length) {
                return;
            }
            var touch = event.touches[0];
            this.scrollTop += this.startY - touch.pageY;
            this.startX = touch.pageX;
            this.startY = touch.pageY;
        }
        $('#' + name + '_tweetview')[0].ontouchend = function (e) {
            this.start = 0;
        }
        // @TODO needn't save prefs in each time to add view on startup
        ui.Slider.save_state();
        conf.save_prefs(conf.current_name);
    } else {
        ui.Slider.slide_to(name);
    }
},

add_indicator:
function add_indicator(name, opts) {
    // create & add indicator_btns
    var html = ui.Template.form_indicator(name, opts.title, opts.icon);
    var btn = null;
    if (name == 'search') {
        html = html.replace('{%STICK%}', 'stick_right');
        btn = $(html);
        btn.insertBefore($('#indicator_add_btn').parent());
        ui.Slider.tweet_blocks.splice(ui.Slider.tweet_blocks.length, 0, 'search');
    } else {
        html = html.replace('{%STICK%}', 'no_stick');
        btn = $(html);
        if ($('#search_tweetview').length == 0) {
            btn.insertBefore($('#indicator_add_btn').parent());
            ui.Slider.tweet_blocks.splice(ui.Slider.tweet_blocks.length, 0, name);  
        } else {
            btn.insertBefore($('#indicator_add_btn').parent());
            ui.Slider.tweet_blocks.splice(ui.Slider.tweet_blocks.length - 1, 0, name);
        }
    }
    btn.bind('dragstart', ui.Slider.indicator_btn_drag_start);
    btn.bind('dragenter', ui.Slider.indicator_btn_drag_enter);
    btn.bind('dragleave', ui.Slider.indicator_btn_drag_leave);
    btn.bind('dragover', ui.Slider.indicator_btn_drag_over);
    btn.bind('drop', ui.Slider.indicator_btn_drop);
    btn.bind('dragend', ui.Slider.indicator_btn_drag_end);
},

add_view:
function add_view(name, opts) {
    // create & add view
    // bind ListView to DOM
    // register at daemon or streaming listener (optional) 
    if (name == 'search') {
        $('#main_page_slider').append(ui.Template.form_view(name, opts.title, 'tweetview'));
    } else {
        if ($('#search_tweetview').length == 0) {
            $('#main_page_slider').append(ui.Template.form_view(name, opts.title, 'tweetview'));
        } else {
            $(ui.Template.form_view(name, opts.title, 'tweetview'))
                .insertBefore($('#search_tweetview'));
        }
    }
    // add to ui.Main.views
    var v = new widget.ListView('#'+name+'_tweetview', name, opts);
    ui.Main.views[name] = v;
    // add to daemon
    if (opts.method == 'poll') { 
        if (opts.interval == 0) {
            ui.Main.views[name].load();
        } else if (0 < opts.interval){
            daemon.register_poll_view(v);   
        }
    } else if (opts.method == 'push') {
        daemon.register_push_view(v);
    } else {
        // nothing to do
    }
},

remove:
function remove(name, not_save_state) {
    if (ui.Slider.tweet_blocks.indexOf(name) != -1) {
        var prev = 'home';
        if (name == ui.Slider.current) {
            prev = ui.Slider.tweet_blocks[ui.Slider.get_page_pos(name) + 1];
            if (!prev) {
                prev = ui.Slider.tweet_blocks[ui.Slider.get_page_pos(name) - 1];
            }
        } else {
            ui.Slider.slide_to(ui.Slider.current);
        }
        ui.Slider.remove_indicator(name);
        ui.Slider.remove_view(name);
        update_tweet_block_width();            
        delete ui.Slider.state.views[name];
        if (prev) { 
            ui.Slider.slide_to(prev);
        } else {
            if (ui.Slider.column_num != 0) {
                ui.Slider.slide_to('home');
            }
        }
    }
    if (not_save_state != true) {
        ui.Slider.save_state();
        conf.save_prefs(conf.current_name);
    }
},

remove_view:
function remove_view(name) {
    var v = ui.Main.views[name];
    // remove from daemon
    daemon.unregister_poll_view(v);
    daemon.unregister_push_view(v);
    // remove from DOM
    $('#'+v.name+'_tweetview').remove();
    // remove from ui.Main.views
    delete ui.Main.views[name];
    v.clear();
},

remove_indicator:
function remove_indicator(name) {
    var idx = ui.Slider.tweet_blocks.indexOf(name);
    ui.Slider.tweet_blocks.splice(idx, 1);
    var btn = $('#indicator_btns > div[name="'+name+'"]');
    btn.unbind();
    btn.remove();
},

slide_to:
function slide_to(id) {
/* = 3 columns as example = 
 * idx:         0   1   2   3   4   5
 * fixed_idx:   0   1   2   3   3   3
 * page_ofst:   0   0   1   2   3   3
 * displayed:  012 012 123 234 345 335
 */
    var idx = ui.Slider.get_page_pos(id);
    if (idx == -1) {
        return;
    }
    var width = globals.tweet_block_width;
    var max_col_num = ui.Slider.tweet_blocks.length;
    ui.Slider.current = id;

    var fixed_idx = idx + ui.Slider.column_num < max_col_num
        ? idx: max_col_num - ui.Slider.column_num; 
    var page_offset = (fixed_idx == idx 
            && 0 <= fixed_idx - parseInt(ui.Slider.column_num/2))
        ? fixed_idx - parseInt(ui.Slider.column_num/2) : fixed_idx;

    $('#main_page_slider').css('width', max_col_num + '00%');
    // slide page
    if (conf.get_current_profile()) {
        if (conf.get_current_profile().preferences.effects_level != 0) {
            ui.Slider.me.stop().animate(
                {marginLeft: (0 - page_offset * width) +'px'}
                , 500
                , function () {
                    $('#main_page_slider').css('width', 'auto');
                }
            );
        } else {
            ui.Slider.me.css('marginLeft', (0 - page_offset * width) +'px');
            $('#main_page_slider').css('width', 'auto');
        }
    }

    // get displayed pages
    ui.Slider.displayed = [];
    for (var i = 0; i < ui.Slider.column_num; i += 1)
    {
        if (i + page_offset < 0) { continue; }
        ui.Slider.displayed.push(ui.Slider.tweet_blocks[i + page_offset]);
    }
    // update view title
    for (var i = 0; i < ui.Slider.column_num; i += 1) {
        var view_title = $(ui.Slider.view_titles[i]);
        view_title.attr('name', ui.Slider.displayed[i])
        view_title.children('.title')
            .text(ui.Main.views[ui.Slider.displayed[i]].title);
        if (ui.Slider.displayed[i] == 'home' || ui.Slider.displayed[i] == 'mentions' || ui.Slider.displayed[i] == 'search') {
            view_title.children('.close_btn').show();
        } else {
            view_title.children('.close_btn').show();
        }
    }
     
    // change indicators style
    var all_btns = $('#indication').find('.indicator_btn');
    var cur_sel = $.map(ui.Slider.displayed, function (item) {
        return $('#indication .indicator_btn[href="#'+item+'"]');
    });
    if (cur_sel.length == 0) return;
    $('#indication_light').stop().animate(
          { 'left': (cur_sel[0].parent().get(0).offsetLeft + 1) + 'px',
            'width': (
                  cur_sel[cur_sel.length - 1].parent().get(0).offsetLeft 
                + cur_sel[cur_sel.length - 1].parent().width()
                - cur_sel[0].parent().get(0).offsetLeft  
                ) + 'px'
          }
        , 200 
        , function () {
            // remove selected style from the pre ones
            if (all_btns) {
                all_btns.removeClass('selected');
                all_btns.removeClass('current');
                all_btns.next('.shape').hide();
            }
            // add selected style to displayed pages' indicator
            $.each(cur_sel, function (i, obj) {
                if (obj.attr('href') == '#'+ui.Slider.current) {
                    obj.next('.shape').show();
                    obj.addClass('current');
                }
                obj.addClass('selected');
                obj.removeClass('unread');
            });
        }
    );    
    $(ui.Main.selected_tweet_id).removeClass('selected'); 
    ui.Main.selected_tweet_id = null;
    $('#tweet_bar').hide();
},

get_page_pos:
function get_page_pos(id) {
    for (var i = 0; i < ui.Slider.tweet_blocks.length; i += 1) {
        if (ui.Slider.tweet_blocks[i] == id) {
            return i;
        }
    }
    return -1;
},

slide_to_prev:
function slide_to_prev(no_loop) {
    var prev_id = '';
    var idx = ui.Slider.get_page_pos(ui.Slider.current);
    if (idx != 0) {
        prev_id = ui.Slider.tweet_blocks[idx - 1];
    } else {
        if (no_loop == true) {
            return ;
        }
        prev_id = ui.Slider.tweet_blocks[ui.Slider.tweet_blocks.length-1];
    }
    ui.Slider.slide_to(prev_id);
},

slide_to_next:
function slide_to_next(no_loop) {
    var next_id = '';
    var idx = ui.Slider.get_page_pos(ui.Slider.current);
    if (idx != ui.Slider.tweet_blocks.length - 1) {
        next_id = ui.Slider.tweet_blocks[idx + 1];
    } else {
        if (no_loop == true) {
            return ;
        }
        next_id = ui.Slider.tweet_blocks[0];
    }
    ui.Slider.slide_to(next_id);
},

set_icon:
function set_icon(name, icon, style) {
    var btn = $('#indication .indicator_btn[href="#'+name+'"]');
    var img_icon = btn.children('.icon');
    img_icon.show();
    img_icon.attr('src', icon);
    if (style == ui.Slider.FLOAT_ICON) {
        img_icon.addClass('float')
    }
    if (style == ui.Slider.BOARD_ICON) {
        img_icon.addClass('board')
    }
},

set_icon_alt:
function set_icon_alt(name, icon) {
    var btn = $('#indication .indicator_btn[href="#'+name+'"]');
    var span_icon = btn.children('.icon_alt');
    span_icon.show();
    span_icon.css('background-image', 'url('+icon+')');
},

set_unread:
function set_unread(name) {
    var btn = $('#indication .indicator_btn[href="#'+name+'"]');
    if (!btn.hasClass('selected')) {
        btn.addClass('unread');
    }
},

mark_read:
function mark_read(name) {
    var btn = $('#indication .indicator_btn[href="#'+name+'"]');
    btn.removeClass('unread');
},

openSliderMenu:
function openSliderMenu() {
    $('#indicator_add_btn').addClass('hlight');
    $('#slider_menu').css({'left': ($('#indicator_add_btn').offset().left)+'px'}).show();
    $('#slider_menu a').each(function (i, n) {
        if (ui.Main.views.hasOwnProperty($(n).attr('href').substring(1))) {
            $(n).addClass('checked');
        } else {
            $(n).removeClass('checked');
        }
    });
    ui.Slider.isSliderMenuClosed = false;
},

closeSliderMenu:
function closeSliderMenu() {
    $('#indicator_add_btn').removeClass('hlight');
    $('#slider_menu').hide();
    ui.Slider.isSliderMenuClosed = true;
},

openViewSettingMenu:
function openViewSettingMenu(view, btn) {
    $('#view_setting_menu').css({'left': (btn.offset().left)+'px', 'top': (btn.offset().top+btn.height())+'px'}).show();
    $('#view_setting_menu a').each(function (i, n) {
        var key = $(n).attr('href').substring(1);
        if (view.hasOwnProperty(key) && view[key] == true) {
            $(n).addClass('checked');
        } else {
            $(n).removeClass('checked');
        }
    });
    ui.Slider.isViewSettingMenuClosed = false;
},

closeViewSettingMenu:
function closeViewSettingMenu() {
    $('#view_setting_menu').hide();
    ui.Slider.isViewSettingMenuClosed = true;
},

indicator_btn_drag_start:
function indicator_btn_drag_start(ev) {
    var my_name = $(this).attr('name');
    if (my_name == 'search') {
        return false;
    }
    $(this).css('opacity', '0.5');
    ev.originalEvent.dataTransfer.effectAllowed = 'move';
    ev.originalEvent.dataTransfer.setData('text/html', my_name);
    return true;
},

indicator_btn_drag_enter:
function indicator_btn_drag_enter(ev) {
    $(this).addClass('over');
},

indicator_btn_drag_leave:
function indicator_btn_drag_leave(ev) {
    $(this).removeClass('over');
},

indicator_btn_drag_end:
function indicator_btn_drag_end(ev) {
    $('#indicator_btns > div').removeClass('over');
    $(this).css('opacity', '1');
    return false;
},

indicator_btn_drag_over:
function indicator_btn_drag_over(ev) {
    if (ev.originalEvent.preventDefault) {
        ev.originalEvent.preventDefault(); 
    }
    ev.originalEvent.dataTransfer.dropEffect = 'move';
    return false;
},

indicator_btn_drop:
function indicator_btn_drop(ev) {
    if (ev.originalEvent.stopPropagation) {
        ev.originalEvent.stopPropagation(); 
    } 
    var src_name = ev.originalEvent.dataTransfer.getData('text/html');
    var my_name = $(this).attr('name');
    if (my_name == 'search'
        || ui.Slider.tweet_blocks.indexOf(my_name) == -1
        || ui.Slider.tweet_blocks.indexOf(src_name) == -1) { 
        return false;
    }
    if (my_name != src_name) {
        // reorder indicator_btn
        ui.Slider.swap_indicator(src_name, my_name);
        // reorder views
        ui.Slider.swap_view(src_name, my_name);
        // reorder ui.Slider.tweet_blocks
        var src_idx = ui.Slider.tweet_blocks.indexOf(src_name);
        var dst_idx = ui.Slider.tweet_blocks.indexOf(my_name);
        ui.Slider.tweet_blocks.splice(src_idx, 1, my_name);
        ui.Slider.tweet_blocks.splice(dst_idx, 1, src_name);
        // update
        ui.Slider.slide_to(src_name);
        update_tweet_block_width();
    }
    return false;
},

swap_indicator:
function swap_indicator(src_name, dst_name) {
    var dst_wrapper = $('#indicator_btns>div[name="'+dst_name+'"]');
    var src_wrapper = $('#indicator_btns>div[name="'+src_name+'"]');
    var src_former = src_wrapper.prev()
    if (src_former.attr('name') == dst_name) {
        dst_wrapper = dst_wrapper.detach();
        dst_wrapper.insertAfter(src_wrapper);
    } else {
        src_wrapper = src_wrapper.detach();
        src_wrapper.insertAfter(dst_wrapper);
        dst_wrapper.detach();
        dst_wrapper.insertAfter(src_former);
    }
},

swap_view:
function swap_view(src_name, dst_name) {
    var dst_wrapper = $('#main_page_slider > .tweetview[name="'+dst_name+'"]');
    var src_wrapper = $('#main_page_slider > .tweetview[name="'+src_name+'"]');
    var src_former = src_wrapper.prev()
    if (src_former.length != 0 && src_former.attr('name') == dst_name) {
        dst_wrapper = dst_wrapper.detach();
        dst_wrapper.insertAfter(src_wrapper);
    } else {
        src_wrapper = src_wrapper.detach();
        src_wrapper.insertAfter(dst_wrapper);
        dst_wrapper.detach();
        if (src_former.length == 0) {
            src_wrapper.parent().prepend(dst_wrapper);
        } else {
            dst_wrapper.insertAfter(src_former);
        }
    }
},

addDefaultView:
function addDefaultView(name, opts) {
    if (ui.Main.views.hasOwnProperty(name)) {
        return false;
    }
    switch (name) {
    case 'search':
    ui.Slider.add('search'
        , {title: _('search'), icon:'image/ic_search.png'}
        , $.extend({ 'type':'tweet', 'title': _('search')
            , 'load': ui.SearchView.load_tweet
            , 'loadmore': ui.SearchView.loadmore_tweet
            , 'load_success': ui.SearchView.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.SearchView.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_search
            , 'init': ui.SearchView.init_view
            , 'destroy': ui.SearchView.destroy_view            
            , 'header_html': ui.Template.search_header_t
            , 'method': 'poll'
            , 'interval': 240
            , 'item_type': 'phoenix_search'
            , 'is_trim': false
            , 'use_auto_update': true
        }, opts));
    break;
    case 'home':
    ui.Slider.add('home'
        , { title: _('home_timeline'), icon:'image/ic_home.png'}
        , $.extend({ 'type':'tweet', 'title': _('home_timeline')
            , 'load': ui.Main.load_home
            , 'loadmore': ui.Main.loadmore_home
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_tweet
            , 'destroy': ui.Main.destroy_view            
            , 'method': 'push'
            , 'interval': 60
            , 'item_type': 'id'
            , 'use_notify': false
        }, opts));
    break;
    case 'mentions':
    ui.Slider.add('mentions'
        , {title: _('mentions'),icon:'image/ic_mention.png'}
        , $.extend({ 'type':'tweet', 'title': _('mentions')
            , 'load': ui.Main.load_mentions
            , 'loadmore': ui.Main.loadmore_mentions
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_tweet
            , 'destroy': ui.Main.destroy_view            
            , 'method': 'push'
            , 'interval': 60
            , 'item_type': 'id'
            , 'use_notify': true
        }, opts));
    break;
    case 'messages':
    ui.Slider.add('messages'
        , {title: _('messages'), icon:'image/ic_dm.png'}
        , $.extend({ 'type':'tweet', 'title': _('messages')
            , 'load': ui.Main.load_messages
            , 'loadmore': ui.Main.loadmore_messages
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'former': ui.Template.form_dm
            , 'destroy': ui.Main.destroy_view            
            , 'method': 'push'
            , 'interval': 120
            , 'item_type': 'id'
            , 'use_notify': true
        }, opts));
    break;
    case 'retweets':
    ui.Slider.add('retweets'
        , {title: _('retweets'), icon:'image/ic_retweet.png'}
        , $.extend({ 'type':'tweet', 'title': _('retweets')
            , 'load': ui.RetweetView.load_retweeted_to_me 
            , 'loadmore': ui.RetweetView.loadmore_retweeted_to_me
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'init': ui.RetweetView.init_view
            , 'destroy': ui.RetweetView.destroy_view            
            , 'header_html': ui.Template.retweets_header_t
            , 'former': ui.Template.form_tweet
            , 'method': 'poll'
            , 'interval': 120
            , 'item_type': 'id'
        }, opts));
    break;
    case 'favs':
    ui.Slider.add('favs'
        , {title: _('favs'), icon:'image/ic_fav.png'}
        , $.extend({ 'type':'tweet', 'title': _('my_favs')
            , 'load': ui.PeopleView.load_fav
            , 'loadmore': ui.PeopleView.loadmore_fav
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': ui.Main.loadmore_tweet_success
            , 'loadmore_fail': null
            , 'init': function (view) {
                    view.screen_name = globals.myself.screen_name; 
                    view.load();
                }
            , 'destroy': function (view) {
                    ui.Slider.remove(view.name);
                }            
            , 'former': ui.Template.form_tweet
            , 'method': 'poll'
            , 'interval': 360
            , 'item_type': 'page'
            , 'is_trim': false
        }, opts));
    break;
    case 'trending_topics':
    ui.Slider.add('trending_topics'
        , {title: _('trending_topics'), icon:'image/ic_list.png'}
        , $.extend({ 'type':'tweet', 'title': _('trending_topics')
            , '_load': ui.TrendingTopicsView.get_trending_topics_local
            , '_load_success': ui.TrendingTopicsView.get_trending_topics_success
            , 'init': ui.TrendingTopicsView.init_view
            , 'destroy': function (view) {
                    ui.Slider.remove(view.name);
                }
            , 'header_html': ui.Template.trending_topics_header_t
            , 'former': ui.Template.form_tweet
            , 'method': 'poll'
            , 'interval': 360
            , 'item_type': 'page'
            , 'is_trim': false
        }, opts));
    break;
    default: break;
    }
    return true;
}

};


