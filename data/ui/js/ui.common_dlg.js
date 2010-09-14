if (typeof ui == 'undefined') var ui = {};
ui.CommonDlg = {

me: {},

id: '',

mask: {},

is_show: false,

TITLE_STR_ERROR: 'Ooops, an Error occurred!',

init:
function init () {
    ui.CommonDlg.id = '#common_dlg';
    ui.CommonDlg.me = $('#common_dlg');
    ui.CommonDlg.mask = $('#dialog_mask');
    // bind events
    $(ui.CommonDlg.me).parent().children('.dialog_close_btn').click(
    function (event) {
        ui.DialogHelper.close(ui.CommonDlg);
    });

    return this;
},

reset:
function reset() {
    $(ui.CommonDlg.id + ' .common_dlg_title').html('');
    $(ui.CommonDlg.id + ' .common_dlg_body').html('');
    $(ui.CommonDlg.id + ' .dialog_bottom').html('');
    $('#common_dlg_title').css('background-image', 'none');
},

set_icon:
function set_icon(icon) {
    $('#common_dlg_title').css('background-image', 'url('+icon+')');
},

add_button:
function show_button(id, label, title, callback) {
    $(ui.CommonDlg.id + ' .dialog_bottom')
        .append('<a id="'+id+'" class="button" href="javascript:void(0);" title="'+title+'">'+label+'</a>');
    $('#'+id).click(callback);
},

set_title:
function set_title(title) {
    $('#common_dlg_title').html(title);
},

set_content:
function set_content(content) {
    $('#common_dlg_body').html(content);
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


