if (typeof ui == 'undefined') var ui = {};
ui.Header = {

init:
function init () {
    $('#btn_prefs').click(
    function (event) {
        ui.PrefsDlg.show();
    });
    
    $('#btn_about').click(
    function (event) {
        ui.AboutDlg.show();
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


