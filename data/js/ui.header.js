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

    $('#btn_my_profile').mouseleave(
    function (event) {
        ui.Header.closeHototMenu();
        globals.ratelimit_bubble.hide();
    });

    $('#hotot_menu').mouseleave(
    function (event) {
        ui.Header.closeHototMenu();
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
    
    $('#btn_kismet').click(
    function (event) {
        ui.KismetDlg.reload();
        globals.kismet_dialog.open();
    });

    $('#btn_about').click(
    function (event) {
        globals.about_dialog.open();
    });

    $('#btn_sign_out').click(
    function (event) {
        ui.Slider.save_state();
        conf.save_prefs(conf.current_name, function() {
            for (var k in ui.Main.views) {
                ui.Slider.remove(ui.Main.views[k].name, true);
            }
            globals.layout.close('north');
            globals.layout.close('south');
            ui.Main.hide();
            ui.Welcome.show();
            daemon.stop();
        });
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

closeAll:
function closeAll() {
    ui.Slider.closeSliderMenu();
    ui.Header.closeHototMenu();
    ui.Main.closeTweetMoreMenu();
}

};


