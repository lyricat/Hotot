if (typeof ui == 'undefined') var ui = {};
ui.CommonDlg = {

id: '',

TITLE_STR_ERROR: 'Ooops, an Error occurred!',

init:
function init () {
    ui.CommonDlg.id = '#common_dlg';
    return this;
},

reset:
function reset() {
    $(ui.CommonDlg.id + ' .common_dlg_title').html('');
    $(ui.CommonDlg.id + ' .common_dlg_body').html('');
    $(ui.CommonDlg.id + ' .dialog_bottom').html('');
    $('#common_dlg_title').css('background-image', 'none');
},

add_button:
function show_button(id, label, title, callback) {
    $(ui.CommonDlg.id + ' .dialog_bottom')
        .append('<a id="'+id+'" class="button dark" href="javascript:void(0);" title="'+title+'">'+label+'<span class="placeholder"></span></a>');
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

}


