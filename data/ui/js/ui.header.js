if (typeof ui == 'undefined') var ui = {};
ui.Header = {

init:
function init () {
    $('#btn_hotot_wrap').hover(
    function (event) {
        $('#btn_hotot').addClass('hover');
        $('#hotot_menu').show();
    },
    function (event) {
        $('#btn_hotot').removeClass('hover');
        $('#hotot_menu').hide();
    });

    $('#btn_prefs').click(
    function (event) {
        ui.DialogHelper.open(ui.PrefsDlg);
    });
    
    $('#btn_exts').click(
    function (event) {
        ui.DialogHelper.open(ui.ExtsDlg);
    });

    $('#btn_about').click(
    function (event) {
        ui.DialogHelper.open(ui.AboutDlg);
    });

    $('#btn_sign_out').click(
    function (event) {
        globals.layout.close('north');
        globals.layout.close('south');
        ui.Main.hide();
        ui.Welcome.show();
    });
},

};


