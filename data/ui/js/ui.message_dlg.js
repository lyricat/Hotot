if (typeof ui == 'undefined') var ui = {};
ui.MessageDlg = {

me: {},

id: '',

mask: {},

is_show: false,

TITLE_STR_ERROR: 'Ooops, an Error occurred!',

init:
function init () {
    ui.MessageDlg.id = '#message_dlg';
    ui.MessageDlg.me = $('#message_dlg');
    ui.MessageDlg.mask = $('#dialog_mask');
    // bind events
    $(ui.MessageDlg.me).parent().children('.dialog_close_btn').click(
    function (event) {
        ui.DialogHelper.close(ui.MessageDlg);
    });

    $('#btn_message_ok').click(
    function (event) {
        ui.DialogHelper.close(ui.MessageDlg);
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
    this.me.parent().hide();
    this.is_show = false;
    return this;
},

show:
function show () {
    this.me.parent().show();
    this.is_show = true;
    return this;
},

}


