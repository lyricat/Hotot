if (typeof ui == 'undefined') var ui = {};
ui.Header = {

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
        $('#hotot_menu').hide();
        $('#exts_menu').hide();
        globals.ratelimit_bubble.hide();
    });

    $('#hotot_menu').mouseleave(
    function (event) {
        $('#hotot_menu').hide();
    });
    $('#btn_hotot').click(
    function (event) {
        $('#exts_menu').hide();
        $('#hotot_menu').toggle();
    });

    $('#exts_menu').mouseleave(
    function (event) {
        $('#exts_menu').hide();
    });
    $('#btn_exts_menu').click(
    function (event) {
        $('#hotot_menu').hide();
        if ($('#exts_menu > li').length == 1) {
            $('#exts_menu_empty_hint').show();
        } else if (1 < $('#exts_menu > li').length) {
            $('#exts_menu_empty_hint').hide();
        }
        $('#exts_menu').toggle();
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

};


