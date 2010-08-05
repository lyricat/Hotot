if (typeof ui == 'undefined') var ui = {};
ui.AboutDlg = {

me: {},

id: '',

mask: {},

init:
function init () {
    ui.AboutDlg.id = '#about_dlg';
    ui.AboutDlg.me = $('#about_dlg');
    ui.AboutDlg.mask = $('#dialog_mask');
    // bind events
    $(ui.AboutDlg.me).parent().children('.dialog_close_btn').click(
    function (event) {
        ui.AboutDlg.hide();
    });

    $('#btn_about_ok').click(
    function (event) {
        ui.AboutDlg.hide();
    });

    return this;
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


