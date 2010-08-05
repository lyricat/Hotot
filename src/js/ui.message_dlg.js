if (typeof ui == 'undefined') var ui = {};
ui.MessageDlg = {

me: {},

id: '',

mask: {},

init:
function init () {
    ui.MessageDlg.id = '#message_dlg';
    ui.MessageDlg.me = $('#message_dlg');
    ui.MessageDlg.mask = $('#dialog_mask');
    // bind events
    $(ui.MessageDlg.me).parent().children('.dialog_close_btn').click(
    function (event) {
        ui.MessageDlg.hide();
    });

    $('#btn_message_ok').click(
    function (event) {
        ui.MessageDlg.hide();
    });

    return this;
},

set_text:
function set_text(title, content) {
    $('#message_dlg_title').html(title);
    $('#message_dlg_text').html(content);
},

hide:
function hide () {
    this.mask.fadeOut();
    this.me.parent().hide();
    return this;
},

show:
function show () {
    this.me.parent().show();
    this.mask.fadeIn();
    return this;
},

}


