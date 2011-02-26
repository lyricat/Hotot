if (typeof ui == 'undefined') var ui = {};
ui.AboutDlg = {

me: {},

id: '',

mask: {},

is_show: false,

init:
function init () {
    ui.AboutDlg.id = '#about_dlg';
    ui.AboutDlg.me = $('#about_dlg');
    ui.AboutDlg.mask = $('#dialog_mask');
    
    var btns = new widget.RadioGroup('#about_dlg_btns');
    btns.on_clicked = function (btn, event) {
        var page_name = $(btn).attr('href');
        $(ui.AboutDlg.id +' .about_dlg_page').not(page_name).hide();
        $(page_name).show();
    };
    btns.create();
    $(btns.buttons[0]).click();

    // bind events
    $(ui.AboutDlg.id).find('.dialog_close_btn').click(
    function (event) {
        ui.DialogHelper.close(ui.AboutDlg);
    });

    var btn_about_ok = new widget.Button('#btn_about_ok');
    btn_about_ok.on_clicked = function (event) {
        ui.DialogHelper.close(ui.AboutDlg);
    };
    btn_about_ok.create();

    return this;
},

hide:
function hide () {
    this.me.hide();
    this.is_show = false;
    return this;
},

show:
function show () {
    this.me.show();
    this.is_show = true;
    return this;
},

}


