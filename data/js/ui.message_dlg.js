if (typeof ui == 'undefined') var ui = {};
ui.MessageDlg = {

id: '',

TITLE_STR_ERROR: 'Ooops, an Error occurred!',

init:
function init () {
    ui.MessageDlg.id = '#message_dlg';

    var btn_message_ok = new widget.Button('#btn_message_ok');
    btn_message_ok.on_clicked = function (event) {
        globals.msg_dialog.close();
    };
    btn_message_ok.create();

    return this;
},

set_text:
function set_text(title, content) {
    $('#message_dlg_title').html(title);
    $('#message_dlg_text').html(content);
},

hide:
function hide () {
    globals.msg_dialog.close();
    return this;
},

show:
function show () {
    globals.msg_dialog.open();
    return this;
},

}


