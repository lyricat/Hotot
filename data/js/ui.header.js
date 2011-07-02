if (typeof ui == 'undefined') var ui = {};
ui.Header = {
isHototMenuClosed: true,
init:
function init () {
    $('#btn_my_profile').click(
    function (event) {
        open_people(globals.myself.screen_name); 
    }).mouseenter(function(event) {
        globals.ratelimit_bubble.place(widget.Bubble.BOTTOM
            , widget.Bubble.ALIGN_LEFT);
        globals.ratelimit_bubble.show();
    });

    $('#header').mouseleave(
    function (event) {
        ui.Header.closeHototMenu();
        globals.ratelimit_bubble.hide();
    });

    $('#hotot_menu').mouseleave(
    function (event) {
        ui.Header.closeHototMenu();
    });

    $('#exts_menu_empty_hint').click(
    function (event) {
        ui.ExtsDlg.load_ext_list();
        globals.exts_dialog.open();
    });

    $('#btn_reload').click(
    function(event) {
        daemon.update_all();
    });
    
    $('#btn_prefs').click(
    function (event) {
        ui.PrefsDlg.load_settings(conf.settings);
        ui.PrefsDlg.load_prefs();
        globals.prefs_dialog.open();
    });
     
    $('#btn_exts').click(
    function (event) {
        ui.ExtsDlg.load_ext_list();
        globals.exts_dialog.open();
    });
    
    $('#btn_kismet').click(
    function (event) {
        ui.KismetDlg.load();
        globals.kismet_dialog.open();
    });

    $('#btn_about').click(
    function (event) {
        globals.about_dialog.open();
    });

    $('#btn_sign_out').click(
    function (event) {
        for (var k in ui.Main.views) {
            ui.Slider.remove(ui.Main.views[k].name);
        }
        globals.layout.close('north');
        globals.layout.close('south');
        ui.Main.reset_views();
        ui.Main.hide();
        ui.Welcome.show();
        daemon.stop();
    });
},

openHototMenu:
function openHototMenu() {
    $('#hotot_button').addClass('hlight');
    $('#hotot_menu').show();
    ui.Header.isHototMenuClosed = false;
},

closeHototMenu:
function closeHototMenu() {
    $('#hotot_button').removeClass('hlight');
    $('#hotot_menu').hide();
    ui.Header.isHototMenuClosed = true;
},

};


