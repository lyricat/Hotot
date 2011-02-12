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

    $(ui.AboutDlg.id +' .dlg_tabs_btn').click(
    function (event) {
        var page_name = $(this).attr('href');
        $(ui.AboutDlg.id +' .dlg_tabs_btn')
            .not(this).removeClass('selected');
        $(ui.AboutDlg.id +' .dlg_tabs_page').not(page_name).hide();
        $(page_name).show();
        $(this).addClass('selected');
    });
    $(ui.AboutDlg.id +' .dlg_tabs_btn:first').click()
    
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


