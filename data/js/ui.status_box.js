// ui.status_box.js - contains the logic for the status update dialog box

if (typeof ui == 'undefined') var ui = {};
ui.StatusBox = {

reply_to_id: null,

MODE_TWEET: 0,

MODE_REPLY: 1,

MODE_DM: 2,

MODE_IMG: 3,

POS_BEGIN: 0,

POS_END: -1,

current_mode: 0,

isClosed: true,

reg_fake_dots: null,

last_sent_text: '',

short_url_base: 'http://api.bit.ly/v3/shorten?login=shellex&apiKey=R_81c9ac2c7aa64b6d311ff19d48030d6c&format=json&longUrl=',

get_status_len:
function get_status_len(status_text) {
    var rep_url = function (url) {
        if (url.length > 20) {
            return '01234567890123456789';
        } else {
            return url;
        }
    }
    return status_text.replace(ui.Template.reg_link_g, rep_url).length
},

// This inits all jquery events for the status update dialog box
init:
function init () {
    $('#btn_update').click(function(event){
        ui.StatusBox.formalize();
        var status_text = $.trim($('#tbox_status').attr('value'));
        if (ui.StatusBox.get_status_len(status_text) > 140 && ui.StatusBox.current_mode === ui.StatusBox.MODE_DM) {
            toast.set(
                _('status_is_over_140_characters')).show();
            return;
        }

        if (ui.StatusBox.get_status_len(status_text) > 140) {
            if (!conf.get_current_profile().preferences.auto_longer_tweet) {
                toast.set(_('status_is_over_140_characters')).show();
            } else {
                toast.set('hotot I have super power to compress ...').show();
                globals.network.do_request('POST',
                    'http://hotot.in/create.json',
                    {
                        'text': status_text,
                        'name': globals.myself.screen_name,
                        'avatar': globals.myself.profile_image_url
                    },
                    {},
                    null,
                    function (result) {
                        if (result && result.text) {
                            ui.StatusBox.update_status(result.text);
                        }
                    },
                    function () {
                        toast.set('but I failed :( ...').show();
                    });
            }
            return ;
        }
        if (status_text.length != 0) {
            if (ui.StatusBox.current_mode == ui.StatusBox.MODE_DM) {
                ui.StatusBox.post_message(status_text);
            } else if(ui.StatusBox.current_mode==ui.StatusBox.MODE_IMG){
                ui.StatusBox.post_image(status_text);
            } else {
                if (ui.StatusBox.last_sent_text == status_text) {
                    toast.set(
                        'Oops! You\'ve already tweeted that..').show();
                } else {
                    ui.StatusBox.update_status(status_text);
                }
            }
        }
    });

    $('#btn_shorturl').click(function () {
        ui.StatusBox.on_btn_short_url_clicked;
    });

    $('#btn_clear').click(function (event) {
        $('#tbox_status').attr('value', '');
        ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
        ui.reply_to_id = null;
        ui.StatusBox.move_cursor(ui.StatusBox.POS_BEGIN);
        ui.StatusBox.update_status_len();
        ui.StatusBox.resetSize();
        $('#status_smiley').hide();
        $('#tbox_status').show();
    });

    var toggle_mode = new widget.Button('#toggle_mode');
    toggle_mode.on_clicked = function (event) {
        ui.StatusBox.change_mode(ui.StatusBox.MODE_DM);
        $('#tbox_dm_target').focus();
    };
    toggle_mode.create();

    $('#btn_smiley').click(function () {
        $('#tbox_status').hide();
        $('#status_smiley').show();
    });

    $('#status_smiley .close_btn').click(function () {
        $('#status_smiley').hide();
        $('#tbox_status').show();
    });

    $('#status_smiley .smiley').click(function () {
        $('#status_smiley').hide();
        $('#tbox_status').show();
        ui.StatusBox.append_status_text(' ' + $(this).text());
        return false;
    });

    $('#btn_imageuploader').click(function () {
        if (globals.twitterClient.use_oauth) {
            if (util.is_native_platform()) {
                ui.ImageUploader.mode = ui.ImageUploader.MODE_PY;
            } else {
                ui.ImageUploader.mode = ui.ImageUploader.MODE_HTML5;
            }
            ui.ImageUploader.show();
        } else {
            title = 'Error !'
            content = '<p data-i18n-text="basic_auth_not_supported">Basic Auth is not supported, please use OAuth to upload images.</p>'
            widget.DialogManager.alert(title, content);
        }
        return false;
    });

    $('#btn_save_draft').click(function () {
        if ($.trim($('#tbox_status').val()).length == 0) {
            return false;
        }
        var draft = {
            'mode': ui.StatusBox.current_mode,
            'text': $('#tbox_status').val()
        };
        if (ui.StatusBox.current_mode == ui.StatusBox.MODE_REPLY) {
            draft.reply_to_id = ui.StatusBox.reply_to_id;
            draft.recipient = encodeURIComponent($('#status_box .who').text());
            draft.reply_text = encodeURIComponent($('#status_box .quote').text())
        } else if (ui.StatusBox.current_mode == ui.StatusBox.MODE_DM) {
            draft.recipient =encodeURIComponent($('#tbox_dm_target').val());
        }
        ui.StatusBox.save_draft(draft);
        ui.StatusBox.reset();
    });

    $('#tbox_status').keyup(
    function (event) {
        ui.StatusBox.update_status_len();
    });

    $('#tbox_status').keydown(
    function (event) {
        // shortcut binding Ctrl+Enter or Command+Enter(Mac)
        if (navigator.platform.indexOf('Mac') != -1) {
            if (event.metaKey && event.keyCode === 13) {
                $('#btn_update').click();
            }
        } else {
            if (event.ctrlKey && event.keyCode === 13) {
                $('#btn_update').click();
                return false;
            }
        }

        if (event.keyCode == 27) { // esc
            ui.StatusBox.close();
        }
    });

    $('#tbox_status').blur(function (event) {
        ui.StatusBox.update_status_len();
        ui.StatusBox.formalize();
    });

    $('#status_box').bind('dragover', function () {
        return false;
    }).bind('dragend', function () {
        return false;
    }).bind('drop', function (ev) {
        ui.StatusBox.file = ev.originalEvent.dataTransfer.files[0];

        if (! ui.FormChecker.test_file_image(ui.StatusBox.file)) {
            toast.set(ui.FormChecker.ERR_STR_FILE_IS_NOT_IMAGE).show(3);
            return false;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            $('#status_image_preview')
                .css('background-image', 'url('+e.target.result+')');
        }
        reader.readAsDataURL(ui.StatusBox.file);
        ui.StatusBox.change_mode(ui.StatusBox.MODE_IMG);
        return false;
    });

    $('#status_image_preview_wrapper .close_btn').click(function () {
        ui.StatusBox.file = null;
        $('#status_image_preview').css('background-image', 'none');
        $('#tbox_status').val('');
        ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
    });

    $('#tbox_status_speech').bind('focus', function (event) {
        event.stopPropagation();
    });

    $('#tbox_status_speech').bind('webkitspeechchange', function() {
        var a = document.getElementById('tbox_status');
        a.value += a.value + this.value;

        document.getElementById('tbox_status_speech').value='';

        this.blur();
        a.focus();

        ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
    });

    $('#tbox_dm_target').click(
    function (event) {
        return false;
    });

    $('#status_len').text('0/' + globals.max_status_len);

    $('#status_box').click(function (event) {
        event.stopPropagation();
    });

    $('#status_box .dialog_close_btn').unbind().click(function(){
        ui.StatusBox.close();
        return false;
    });

    ui.StatusBox.reg_fake_dots = new RegExp('(\\.\\.\\.)|(。。。)', 'g');
    ui.StatusBox.reg_fake_dots2 = new RegExp('(…\\.+)|(…。+)', 'g');

    // setup autocomplete for user name
    widget.autocomplete.connect($('#tbox_status'));
    widget.autocomplete.connect($('#tbox_dm_target'));

},

resetSize:
function resetSize () {
    $('#tbox_status_wrapper').height(160);
},

on_btn_short_url_clicked:
function on_btn_short_url_clicked(event) {
    var procs = [];
    var urls = [];
    var _requset = function (i) {
        var req_url = ui.StatusBox.short_url_base + urls[i];
        procs.push(function () {
            globals.network.do_request('GET',
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

formalize:
function formalize() {
    /*
     * TODO: customization
     * the following implementation is ugly and unpredictable
     *
    var text = $('#tbox_status').val();
    text = text.replace(ui.StatusBox.reg_fake_dots, '…');
    text = text.replace(ui.StatusBox.reg_fake_dots2, '……');
    text = text.replace('<3', '♥');
    text = text.replace('“', '「');
    text = text.replace('”', '」');
    text = text.replace('‘', '『');
    text = text.replace('’', '』');
    $('#tbox_status').val(text);
    */
},

change_mode:
function change_mode(mode) {
    if (mode == ui.StatusBox.MODE_DM) {
        $('#status_box').removeClass('reply_mode').addClass('dm_mode');
        $('#tbox_dm_target').show();
        $('#status_info').show();
    } else if (mode == ui.StatusBox.MODE_REPLY){
        $('#status_box').removeClass('dm_mode').addClass('reply_mode');
        $('#status_info').show();
        $('#tbox_dm_target').hide();
    } else if (mode == ui.StatusBox.MODE_IMG) {
        $('#tbox_status_wrapper').css('margin-left', '155px');
        $('#status_image_preview_wrapper').show();
    } else {
        $('#status_box').removeClass('dm_mode').removeClass('reply_mode');
        $('#tbox_dm_target').hide();
        $('#status_info').hide();
        $('#tbox_status_wrapper').css('margin-left', '0px');
        $('#status_image_preview_wrapper').hide();
    }
    ui.StatusBox.current_mode = mode;
},

update_status:
function update_status(status_text) {
    if (status_text.length != 0) {
        toast.set(_('updating_dots')).show(-1);
        var draft = {
            'mode': ui.StatusBox.MODE_TWEET,
            'text': status_text
        };
        if (ui.StatusBox.current_mode == ui.StatusBox.MODE_REPLY) {
            draft.mode = ui.StatusBox.MODE_REPLY;
            draft.reply_to_id = ui.StatusBox.reply_to_id;
            draft.recipient = encodeURIComponent($('#status_box .who').text());
            draft.reply_text = encodeURIComponent($('#status_box .quote').text());
        }
        ui.StatusBox.reset();

        globals.twitterClient.update_status(status_text
            , draft.reply_to_id
            , function (result) {
                ui.StatusBox.last_sent_text = status_text;
                ui.StatusBox.update_status_cb(result);
            }, function (xhr, textStatus, errorThrown) {
                toast.set('Update failed! Saved as a draft.').show(3);
                ui.StatusBox.last_sent_text = '';
                ui.StatusBox.save_draft(draft);
            });
        ui.StatusBox.close('slide');
    }
    return this;
},

update_status_cb:
function update_status_cb(result) {
    toast.set(_('update_successfully')).show();
    ui.StatusBox.file = null;
    $('#status_image_preview').css('background-image', 'none');
    ui.Main.add_tweets(ui.Main.views['home'], [result], false, true);
    return this;
},

update_status_len:
function update_status_len() {
    var status_len = ui.StatusBox.get_status_len($('#tbox_status').val());
    if (status_len > globals.max_status_len)
        $('#status_len').css('color', '#cc0000');
    else
        $('#status_len').css('color', '#aaa');
    $('#status_len').text(status_len + '/' + globals.max_status_len);
},

post_message:
function post_message(message_text) {
    if (message_text.length != 0) {
        var name = $.trim($('#tbox_dm_target').val());
        var draft = {
            'mode': ui.StatusBox.MODE_DM,
            'text': message_text,
            'recipient': encodeURIComponent(name)
        };
        ui.StatusBox.reset();
        if (name == '') {
            toast.set(_('please_enter_the_recipient')).show(-1);
        } else {
            if (name[0] == '@') name = name.substring(1);
            toast.set(_('posting_dots')).show(-1);
            globals.twitterClient.new_direct_messages(
                  message_text
                , null
                , name
                , ui.StatusBox.post_message_cb
                , function (xhr, textStatus, errorThrown) {
                    toast.set('Post failed! Saved as a draft.').show(3);
                    ui.StatusBox.save_draft(draft);
                });
            ui.StatusBox.close('slide');
        }
    }
},

post_message_cb:
function post_message_cb(result) {
    ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
    toast.set(_('post_successfully')).show();
    $('#tbox_status').val('');
    $('#status_info').hide();
    return this;
},

post_image:
function post_image(msg) {
    var params = {'message': msg};
    switch (ui.ImageUploader.service_name) {
    case 'twitpic.com' :
        params['key'] = ui.ImageUploader.services['twitpic.com'].key;
    break;
    case 'lockerz.com' :
        params['isoauth'] = 'true';
        params['response_format'] = 'JSON';
        params['api_key'] = ui.ImageUploader.services['lockerz.com'].key;
    break;
    }
    toast.set('Uploading ... ').show();
    ui.ImageUploader.upload_image(
          ui.ImageUploader.services[ui.ImageUploader.service_name].url
        , params
        , ui.StatusBox.file
        , ui.StatusBox.post_image_cb
        , function () {
            toast.set('Failed!').show();
            $('#status_image_preview').css('background-image', 'none');
            $('#tbox_status').val('');
            ui.StatusBox.file = null;
            ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
        });
},

post_image_cb:
function post_image_cb(result) {
    toast.set('Uploading Successfully!').show();
    if (ui.ImageUploader.service_name === 'twitter.com') {
        ui.StatusBox.reset();
        ui.Main.add_tweets(ui.Main.views['home'], [result], false, true);
    } else {
        var text = result.text + ' '+ result.url;
        $('#tbox_status').val(text);
        ui.StatusBox.update_status(text);
    }
    return this;
},

save_draft:
function save_draft(draft) {
    $('#status_drafts ul').append(ui.Template.form_status_draft(draft));
    $('#status_drafts .btn_draft_clear').unbind().click(function() {
        $(this).parent().remove();
        var count = $('#status_drafts li').length;
        $('#status_drafts summary').text(_('drafts') + '(' + count + ')');
        if (count == 0) {
            $('#status_drafts').hide();
        }
    });
    $('#status_drafts .text').unbind().click(function() {
        var li = $(this).parent();
        var mode = parseInt(li.attr('mode'));
        ui.StatusBox.change_mode(mode);
        ui.StatusBox.set_status_text($(this).text().replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
        switch (mode){
        case ui.StatusBox.MODE_REPLY:
            ui.StatusBox.reply_to_id = li.attr('reply_to_id')
            ui.StatusBox.set_reply_info(decodeURIComponent(li.attr('recipient')), decodeURIComponent(li.attr('reply_text')));
        case ui.StatusBox.MODE_IMG:
        break;
        case ui.StatusBox.MODE_DM:
            ui.StatusBox.set_dm_target(decodeURIComponent(li.attr('recipient')));
        break;
        default:
        break;
        }
        li.remove();
        var count = $('#status_drafts li').length;
        $('#status_drafts summary').text('Drafts ('+count+')');
        if (count == 0) {
            $('#status_drafts').hide();
        }

        ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
    });
    var count = $('#status_drafts li').length;
    $('#status_drafts summary').text('Drafts ('+count+')');
    $('#status_drafts').show();
},

append_status_text:
function append_status_text(text) {
    var orig = $('#tbox_status').attr('value');
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

reset:
function reset() {
    ui.StatusBox.change_mode(ui.StatusBox.MODE_TWEET);
    $('#status_info').hide();
    $('#status_image_preview').css('background-image', 'none');
    $('#tbox_status').val('');
    ui.StatusBox.file = null;
    ui.StatusBox.reply_to_id = null;
    ui.StatusBox.resetSize();
},

set_status_text:
function set_status_text(text) {
    $('#tbox_status').val(text);
    $('#tbox_status').removeClass('hint_style');
},

set_reply_info:
function set_reply_info(name, text) {
    $('#status_box .quote').text(text);
    $('#status_box .who').text(name);
},

set_dm_target:
function set_dm_target(screen_name) {
    $('#tbox_dm_target').val(screen_name);
},

open:
function open(callback) {
    globals.compose_dialog.open('fade', function () {
        ui.StatusBox.move_cursor(ui.StatusBox.POS_END);
        if (callback && typeof (callback) === 'function') {
            callback();
        }
        ui.StatusBox.isClosed = false;
    });
},

close:
function close(method) {
    globals.compose_dialog.close(method);
    $('#tbox_status').blur();
    ui.StatusBox.isClosed = true;
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
}

};



