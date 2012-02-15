if (typeof ui == 'undefined') var ui = {};
ui.AboutDlg = {

init:
function init () {
    var btns = new widget.RadioGroup('#about_dlg_btns');
    btns.on_clicked = function (btn, event) {
        var page_name = $(btn).attr('href');
        $('#about_dlg .about_dlg_page').not(page_name).hide();
        $(page_name).show();
    };
    btns.create();
    $(btns.buttons[0]).click();

    var btn_about_ok = new widget.Button('#btn_about_ok');
    btn_about_ok.on_clicked = function (event) {
        globals.about_dialog.close();
    };
    btn_about_ok.create();
}

}


