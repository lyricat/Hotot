if (typeof ui == 'undefined') var ui = {};
ui.StatusBox = {

reply_to_id: null,

MODE_TWEET: 0,

MODE_REPLY: 1,

MODE_DM: 2,

POS_BEGIN: 0,

POS_END: -1,

current_mode: 0,

close_timeout: 30000,

open_timeout: 700,

is_closed: false,

auto_complete_hlight_idx: 0,

auto_complete_selected: '',

is_detecting_name: false,

use_hover_box: true,

short_url_base: 'http://api.bit.ly/v3/shorten?login=shellex&apiKey=R_81c9ac2c7aa64b6d311ff19d48030d6c&format=json&longUrl=',
// @BUG (webkit for linux)
// keyup and keydown will fire twice in Chrome
// keydown will fire twice in WebkitGtk.
// @WORKAROUND use the flag to ignore the first one.
keydown_twice_flag: 0,

init:
function init () {
    ui.StatusBox.btn_update = new widget.Button('#btn_update');
    ui.StatusBox.btn_update.on_clicked = function(event){
        var status_text = $.trim($('#tbox_status').attr('value'));
        if (status_text.length > 140) {
            toast.set(
                _('status_is_over_140_characters')).show();
            return;
        }
        if (status_text.length != 0) {
            if (ui.StatusBox.current_mode == ui.StatusBox.MODE_DM) {
                ui.StatusBox.post_message(status_text);
            } else {
                ui.StatusBox.update_status(status_text);
            }
        }
    };
    ui.StatusBox.btn_update.create();

    var btn_shorturl = new widget.Button('#btn_shorturl');
    btn_shorturl.on_clicked = ui.StatusBox.on_btn_short_url_clicked;
    btn_shorturl.create();

    var btn_clear = new widget.Button('#btn_clear'); 
    btn_clear.on_clicked = function (event) {
        $('#tbox_status').attr('value', '');
        ui.StatusBox.move_cursor(ui.StatusBox.POS_BEGIN);
    };
    btn_clear.create();

    var toggle_mode = new widget.Button('#toggle_mode');
    toggle_mode.on_clicked = function (event) {
        ui.StatusBox.change_mode(ui.StatusBox.MODE_DM);
    };
    toggle_mode.create();

    $('#btn_clear_status_info').click(
    function (event) {
        $(this).parent().hide();
        $('#status_info_text').text('');
        ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
        ui.reply_to_id = null;
    });

    $('#tbox_status').keydown(
    function (event) {
        ui.StatusBox.update_status_len();

        var key_code = event.keyCode;
        
        // @WORKAROUND ignore the duplicate keydown event in WebkitGtk
        // However, if ignore all keydown event will cause some bugs
        // if user use IM to compose status text. 
        // for example, 
        // backspace doesn't work, can't type english characters, etc. 
        // so i only ignore event associate with program's behaviors.
        if (event.ctrlKey && key_code == 13) {
            ui.StatusBox.keydown_twice_flag += 1;
            if (ui.StatusBox.keydown_twice_flag % 2 == 0 
                && util.is_native_platform()) 
                return false;
            // shortcut binding Ctrl+Enter
            $('#btn_update').click();
            return false;
        } 

        if (key_code == 13) {
            if (! ui.StatusBox.is_detecting_name)
                return ;
            var append = ui.StatusBox.auto_complete_selected
                .substring(ui.StatusBox.get_screen_name().length - 1); 
            ui.StatusBox.insert_status_text(append, null);
            return false;
        }
        if (key_code == 38 || key_code == 40) {         
            if (ui.StatusBox.is_detecting_name)
                return false;
        }
        
    });
    
    $('#tbox_status').keypress(
    function (event) {
        if (event.keyCode == 64) { //@
            ui.StatusBox.start_screen_name_detect();
        }
        if (event.keyCode == 32) { // space
            ui.StatusBox.stop_screen_name_detect();
        }
        ui.StatusBox.update_status_len();
    });
     
    $('#tbox_status').keyup(
    function (event) {
        if (event.keyCode == 27) { //ESC to close
            ui.StatusBox.close();
            return false;
        }

        if (event.keyCode == 13) {
            if (ui.StatusBox.is_detecting_name) {
                ui.StatusBox.stop_screen_name_detect();
                return false;
            }
        }

        if (event.keyCode == 38 || event.keyCode == 40) { 
        // up or down
            if (! ui.StatusBox.is_detecting_name)
                return true;
            var screen_name_list = $('#screen_name_auto_complete');
            var items = screen_name_list.find('li');
            var item = items.eq(ui.StatusBox.auto_complete_hlight_idx);
            item.removeClass('hlight');
            
            if (event.keyCode == 38) 
                ui.StatusBox.auto_complete_hlight_idx -= 1;
            if (event.keyCode == 40) 
                ui.StatusBox.auto_complete_hlight_idx += 1;

            if (ui.StatusBox.auto_complete_hlight_idx == -1 ) {
                ui.StatusBox.auto_complete_hlight_idx = items.length - 1;
            } 
            if (ui.StatusBox.auto_complete_hlight_idx == items.length) {
                ui.StatusBox.auto_complete_hlight_idx = 0;
            } 

            item = items.eq(ui.StatusBox.auto_complete_hlight_idx);
            item.addClass('hlight');

            screen_name_list.stop().animate({scrollTop: item.get(0).offsetTop - screen_name_list.get(0).offsetTop}); 
            ui.StatusBox.auto_complete_selected = item.text();
            return false;
        } 
        ui.StatusBox.auto_complete_hlight_idx = 0;
        ui.StatusBox.auto_complete(event);

        ui.StatusBox.update_status_len();
    });
    
    $('#tbox_status').focus(
    function (event) {
        ui.StatusBox.update_status_len();
    }).change(
    function (event) {
        ui.StatusBox.update_status_len();
    });

    $('#tbox_dm_target').click(
    function (event) {
        return false;
    })
    $('#status_len').html('0/' + globals.max_status_len);      

    $('#status_box').click(function () {
        return false;    
    })

    ui.StatusBox.close(); 
},

on_btn_short_url_clicked:
function on_btn_short_url_clicked(event) {
    var procs = [];
    var urls = [];
    var _requset = function (i) {
        var req_url = ui.StatusBox.short_url_base + urls[i];
        procs.push(function () {
            lib.network.do_request('GET',
            req_url, 
            {},
            {},
            [],
            function (results) {
                var text = $('#tbox_status').val();
                text = text.replace(urls[i], results.data.url);
                $('#tbox_status').val(text);
                $(window).dequeue('_short_url');
            },
            function () {}
            );
        });
    };
    var match = ui.Template.reg_link_g.exec($('#tbox_status').val());
    while (match != null) {
        urls.push(match[1]);
        match = ui.Template.reg_link_g.exec($('#tbox_status').val());
    }
    for (var i = 0, l = urls.length; i < l; i += 1) {
        _requset(i);
    }
    $(window).queue('_short_url', procs);
    $(window).dequeue('_short_url');
},

lazy_close:
function lazy_close() {
    window.clearTimeout(ui.StatusBox.close_countdown_timer);
    ui.StatusBox.close_countdown_timer = window.setTimeout(
        ui.StatusBox.close, ui.StatusBox.close_timeout);
},

change_mode:
function change_mode(mode) {
    if (mode == ui.StatusBox.MODE_DM) {
        $('#status_box').removeClass('reply_mode').addClass('dm_mode');
        $('#dm_target').show();
        $('#status_info').show();
        $('#status_info_text').html('<span class="info_hint">'
            + _('compose_messages_to') + '</span>');
    } else if (mode == ui.StatusBox.MODE_REPLY){
        $('#status_box').removeClass('dm_mode').addClass('reply_mode');
        $('#status_info').show();
        $('#dm_target').hide();
    } else {
        $('#status_box').removeClass('dm_mode').removeClass('reply_mode');
        $('#dm_target').hide();
        $('#status_info').hide();
    }
    ui.StatusBox.current_mode = mode;
},

update_status:
function update_status(status_text) {
    if (status_text.length != 0) {
        toast.set(_('updating_dots')).show(-1);
        lib.twitterapi.update_status(status_text
            , ui.StatusBox.reply_to_id
            , ui.StatusBox.update_status_cb);
    }
    return this;
},

update_status_cb:
function update_status_cb(result) {
    ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
    toast.set(_('update_successfully')).show();
    $('#status_info').hide();
    $('#tbox_status').val(''); 
    ui.StatusBox.reply_to_id = null;
    ui.StatusBox.close();
    ui.Main.add_tweets(ui.Main.views['home'], [result], false, true);
    return this;
},

update_status_len:
function update_status_len() {
    var status_len = $('#tbox_status').attr('value').length;
    if (status_len > globals.max_status_len)
        $('#status_len').css('color', '#cc0000');
    else
        $('#status_len').css('color', '#aaa');
    $('#status_len').html(status_len + '/' + globals.max_status_len);
    return this;
},

post_message:
function post_message(message_text) {
    if (message_text.length != 0) {
        var name = $.trim($('#tbox_dm_target').val());
        if (name == '') {
            toast.set(_('please_enter_the_recipient')).show(-1);
        } else {
            if (name[0] == '@') name = name.substring(1);
            toast.set(_('posting_dots')).show(-1);
            lib.twitterapi.new_direct_messages(
                  message_text
                , null
                , name
                , ui.StatusBox.post_message_cb);
        }
    }
},

post_message_cb:
function post_message_cb(result) {
    ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
    toast.set(_('post_successfully')).show();
    $('#tbox_status').val(''); 
    $('#status_info').hide();
    ui.StatusBox.close();
    return this;
},


append_status_text:
function append_status_text(text) {
    var orig = $.trim($('#tbox_status').attr('value'));
    if (orig.length == 0) {
        $('#tbox_status').val(text);
    } else {
        $('#tbox_status').val(orig + text);
    }
    $('#tbox_status').removeClass('hint_style');
},

insert_status_text:
function insert_status_text(text, pos) {
    if (pos == null) {
        pos = $('#tbox_status').get(0).selectionStart;
    } else {
        $('#tbox_status').get(0).selectionStart = pos;
    }
    $('#tbox_status').val(
        $('#tbox_status').val().substr(0, pos)
        + text 
        + $('#tbox_status').val().substring(pos));
},

set_status_text:
function set_status_text(text) {
    $('#tbox_status').attr('value', text);
    $('#tbox_status').removeClass('hint_style');
},

set_status_info:
function set_status_info(info) {
    $('#status_info_text').html(info);
},

set_dm_target:
function set_dm_target(screen_name) {
    $('#tbox_dm_target').val(screen_name);
},

auto_complete:
function auto_complete(event) {
    if (! ui.StatusBox.is_detecting_name)
        return;
    var key_code = event.keyCode;
    if ((key_code <= 90 && 65 <= key_code)
        || (48 <= key_code && key_code <= 57)
        || 95 == key_code || key_code == 8) {
        var name = ui.StatusBox.get_screen_name().substring(1);
        if (name == '') {
            $('#screen_name_auto_complete').html('').hide();
        } else {
            db.get_screen_names_starts_with(name,
            function (tx, rs) {
                var result_list = []
                for (var i = 0, l = rs.rows.length; i < l; i += 1) { 
                    result_list.push(rs.rows.item(i).screen_name)
                }
                var str = '<li>'+result_list.join('</li><li>')+'</li>';
                $('#screen_name_auto_complete').html(str).show();
                $('#screen_name_auto_complete > li').unbind('click');
                $('#screen_name_auto_complete > li').click(
                function (event) {
                    var append = $(this).text().substring(ui.StatusBox.get_screen_name().length - 1); 
                    ui.StatusBox.insert_status_text(append, null);
                    ui.StatusBox.stop_screen_name_detect();
                });

                $('#screen_name_auto_complete li:first').addClass('hlight');
                ui.StatusBox.auto_complete_selected 
                    = $('#screen_name_auto_complete li:first').text();
            });
        }
    } 
},

get_screen_name:
function get_screen_name() {
    var current_pos = ui.StatusBox.get_cursor_pos();
    var screen_name = $('#tbox_status').val().substring(
        ui.StatusBox.screen_name_start_pos, current_pos);
    return screen_name;
},

start_screen_name_detect:
function start_screen_name_detect() {
    ui.StatusBox.screen_name_start_pos = ui.StatusBox.get_cursor_pos();
    ui.StatusBox.is_detecting_name = true;
},

stop_screen_name_detect:
function stop_screen_name_detect() {
    ui.StatusBox.is_detecting_name = false;
    $('#screen_name_auto_complete').hide();
},

show:
function show() {
    $('#status_box').show()
},

hide:
function hide() {
    $('#status_box').hide()
},

close:
function close() {
    $('#tbox_status').animate({ 
            height: "0px", 
        }
        , 100
        , 'linear'
        , function () {
            ui.StatusBox.hide();
            ui.Main.views[ui.Slider.current].focus();
        });
    ui.StatusBox.stop_screen_name_detect();
    $('#indicator_compose_btn').removeClass('hlight');
    ui.StatusBox.is_closed = true;
},

open:
function open(on_finish) {
    window.clearTimeout(ui.StatusBox.close_countdown_timer);    
    $('#tbox_status').animate({ 
            height: "150px", 
        }
        , 100
        , 'linear'
        , function () {
            ui.StatusBox.show();
            $('#tbox_status').focus();
            if (on_finish) {
                on_finish();
            }
        });
    $('#indicator_compose_btn').addClass('hlight');
    ui.StatusBox.is_closed = false;
},

move_cursor:
function move_cursor(pos) {
    if (typeof pos == 'undefined')
        return;
    if (pos == ui.StatusBox.POS_END) 
        pos = $('#tbox_status').attr('value').length;

    $('#tbox_status').focus();
    var box = $('#tbox_status').get(0);
        if(box.setSelectionRange) {
        // others
                box.setSelectionRange(pos, pos);
        } else if (box.createTextRange) {
        // IE
                var range = box.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
        }
},

get_cursor_pos:
function get_cursor_pos(){
    var pos = 0;
    var box = $('#tbox_status').get(0);
    $('#tbox_status').focus();
        if (document.selection) {
        // IE
            var sel = document.selection.createRange();
            sel.moveStart('character', -box.value.length);
            pos = sel.text.length;
        } else if (box.selectionStart || box.selectionStart == '0') {
        // others
            pos = box.selectionStart;
        }
    return pos;
},

};



