if (typeof ui == 'undefined') var ui = {};
ui.PrefsDlg = {

id: '',

init:
function init () {
    ui.PrefsDlg.id = '#prefs_dlg';

    var btns = new widget.RadioGroup('#prefs_dlg_btns');
    btns.on_clicked = function (btn, event) {
        var page_name = btn.attr('href');
        $(ui.PrefsDlg.id +' .prefs_dlg_page').not(page_name).hide();
        $(page_name).show();
    };
    btns.create();
    $('#btn_prefs_global').click();

    var btn_regain_token = new widget.Button('#btn_regain_token');
    btn_regain_token.on_clicked = function (event) {
        jsOAuth.access_token = null;
        jsOAuth.get_request_token(
            function (result) {
                ui.PinDlg.set_auth_url(jsOAuth.get_auth_url());
                globals.oauth_dialog.open();
            }); 
    };
    btn_regain_token.create();

    $('#sel_prefs_theme').bind('change', function () {
        change_theme($(this).val(), $(this).children('option[value="'+$(this).val()+'"]').attr('path'));
    });
    
    $('#sel_prefs_lang').bind('change', function () {
        i18n.change($(this).val());
    });

    $('#sel_prefs_font_family, #tbox_prefs_font_size, #tbox_prefs_custom_font, #rdo_use_custom_font, #rdo_use_system_font').bind('click change keypress blur',
    function (event) {
        ui.PrefsDlg.update_font_preview();
    });

    $('#tbox_prefs_font_size, #tbox_prefs_http_proxy_port').blur(
    function (event) {
        ui.FormChecker.test_int_value(this);
    });
    $('#tbox_prefs_font_size').keypress(
    function (event) {
        if (event.keyCode == 13){
            ui.PrefsDlg.update_font_preview();
        }
    });

    $('#chk_prefs_use_same_sign_api_base').click(
    function (event) {
        $('#tbox_prefs_sign_api_base').attr('disabled', $(this).prop('checked'));
    });

    $('#chk_prefs_use_same_sign_oauth_base').click(
    function (event) {
        $('#tbox_prefs_sign_oauth_base').attr('disabled', $(this).prop('checked'));
    });
    
    $('#chk_prefs_use_http_proxy').click(
    function (event) {
        $('#tbox_prefs_http_proxy_host, #tbox_prefs_http_proxy_port, #chk_prefs_use_http_proxy_auth').attr('disabled', !$(this).prop('checked'));
        if (! $('#chk_prefs_use_http_proxy_auth').attr('disabled')) { 
            $('#tbox_prefs_http_proxy_auth_name, #tbox_prefs_http_proxy_auth_password').attr('disabled', !$('#chk_prefs_use_http_proxy_auth').prop('checked'));
        } else {
            $('#tbox_prefs_http_proxy_auth_name, #tbox_prefs_http_proxy_auth_password').attr('disabled', true);
        }
    });

    $('#chk_prefs_use_http_proxy_auth').click(
    function (event) {
        $('#tbox_prefs_http_proxy_auth_name, #tbox_prefs_http_proxy_auth_password').attr('disabled', !$(this).prop('checked'));
    });

    var btn_prefs_ok = new widget.Button('#btn_prefs_ok');
    btn_prefs_ok.on_clicked = function (event) {
        var err = ui.FormChecker.check_config_error(
            ui.PrefsDlg.id + ' input');
        if ( err.count != 0 ) {
            toast.set("There are "+err.count+" errors in your changes. Abort...").show();
            widget.DialogManager.alert(
                  'Oops, some mistakes in your information.'
                , "<p>There are something wrong in what your changes.<br/>Please check errors in the options below:<br/> - "
                + err.error_values.join('<br/> - ') + '</p>');
        } else {
            ui.PrefsDlg.save_settings();
            ui.PrefsDlg.save_prefs();
            globals.prefs_dialog.close();
        }
    };
    btn_prefs_ok.create();

    var btn_prefs_cancel = new widget.Button('#btn_prefs_cancel');
    btn_prefs_cancel.on_clicked = function (event) {
        globals.prefs_dialog.close();
    };
    btn_prefs_cancel.create();

    var btn_prefs_restore_defaults 
        = new widget.Button('#btn_prefs_restore_defaults');
    btn_prefs_restore_defaults.on_clicked = function (event) {
        if (confirm("Restore defaults will erases all changes you make.\n Are you sure you want to continue?!\n"))
            ui.PrefsDlg.restore_defaults();
    };
    btn_prefs_restore_defaults.create();

    return this;
},

load_settings:
function load_settings() {
    // Globals
    $('#chk_prefs_use_verbose_mode').prop('checked'
        , conf.settings.use_verbose_mode);
    $('#chk_prefs_use_ubuntu_indicator').prop('checked'
        , conf.settings.use_ubuntu_indicator);
    $('#chk_prefs_close_to_exit').prop('checked'
        , conf.settings.close_to_exit);
    $('#chk_prefs_sign_in_automatically').prop('checked'
        , conf.settings.sign_in_automatically);        
    $('#tbox_prefs_shortcut_summon_hotot').attr('value'
        , conf.settings.shortcut_summon_hotot);
    // proxy
    if (util.is_native_platform()) {
        $('#chk_prefs_use_http_proxy').prop('checked'
            , conf.settings.use_http_proxy);
        $('#tbox_prefs_http_proxy_host').val(conf.settings.http_proxy_host);
        $('#tbox_prefs_http_proxy_port').val(conf.settings.http_proxy_port);
        if (! conf.settings.use_http_proxy) {
            $('#tbox_prefs_http_proxy_host, #tbox_prefs_http_proxy_port, #chk_prefs_use_http_proxy_auth, #tbox_prefs_http_proxy_auth_name, #tbox_prefs_http_proxy_auth_password').attr('disabled', true);
        }
        $('#chk_prefs_use_http_proxy_auth').prop('checked'
            , conf.settings.use_http_proxy_auth);
        $('#tbox_prefs_http_proxy_auth_name').val(conf.settings.http_proxy_auth_name);
        $('#tbox_prefs_http_proxy_auth_password').val(conf.settings.http_proxy_auth_password);
        if (! conf.settings.use_http_proxy_auth) {
            $('#tbox_prefs_http_proxy_auth_name, #tbox_prefs_http_proxy_auth_password').attr('disabled', true);
        }
    } else {
        $('#label_prefs_use_http_proxy').text('Sorry, HTTP proxy doesn\'t work in this platform.');
        $('#chk_prefs_use_http_proxy, #tbox_prefs_http_proxy_host, #tbox_prefs_http_proxy_port, #chk_prefs_use_http_proxy_auth, #tbox_prefs_http_proxy_auth_name, #tbox_prefs_http_proxy_auth_password').attr('disabled', true);
    }
},

save_settings:
function save_settings() {
    // Globals
    conf.settings.use_verbose_mode 
        = $('#chk_prefs_use_verbose_mode').prop('checked');
    conf.settings.use_ubuntu_indicator 
        = $('#chk_prefs_use_ubuntu_indicator').prop('checked');
    conf.settings.close_to_exit 
        = $('#chk_prefs_close_to_exit').prop('checked');
    conf.settings.sign_in_automatically 
        = $('#chk_prefs_sign_in_automatically').prop('checked');
    conf.settings.shortcut_summon_hotot 
        = $('#tbox_prefs_shortcut_summon_hotot').val();
    // proxy
    if (util.is_native_platform()) {
        conf.settings.use_http_proxy
            = $('#chk_prefs_use_http_proxy').prop('checked');
        conf.settings.http_proxy_host 
            = $('#tbox_prefs_http_proxy_host').val();
        conf.settings.http_proxy_port 
            = parseInt($('#tbox_prefs_http_proxy_port').val());
        conf.settings.use_http_proxy_auth
            = $('#chk_prefs_use_http_proxy_auth').prop('checked');
        conf.settings.http_proxy_auth_name
            = $('#tbox_prefs_http_proxy_auth_name').val();
        conf.settings.http_proxy_auth_password
            = $('#tbox_prefs_http_proxy_auth_password').val();
        if (isNaN(conf.settings.http_proxy_port)) {
            conf.settings.http_proxy_port = 0;
        }
    }
    // save
    conf.save_settings();
},

load_prefs:
function load_prefs() {
    var prefs = conf.get_current_profile().preferences;
    // Account
    $('#chk_prefs_remember_password').prop('checked'
        , prefs.remember_password);

    // Appearance
    $('#sel_prefs_lang').val(prefs.lang);

    var theme_list = $('#sel_prefs_theme').empty();
    for (var i = 0, l = conf.vars.builtin_themes.length; i < l; i += 1) {
        var theme_name = conf.vars.builtin_themes[i];
        $('<option/>').attr({'value': theme_name, 'path': 'theme/' + theme_name}).text(theme_name).appendTo(theme_list);
    }
    for (var i = 0, l = conf.vars.extra_themes.length; i < l; i += 1) {
        var theme_name = conf.vars.extra_themes[i].substring(conf.vars.extra_themes[i].lastIndexOf('/') + 1);
        $('<option/>').attr({'value': theme_name, 'path': conf.vars.extra_themes[i]}).text(theme_name).appendTo(theme_list);
    }
    theme_list.val(prefs.theme);
    theme_list = null;
    
    var ff_list = $('#sel_prefs_font_family').empty();
    for (var i = 0, l = conf.settings.font_list.length; i < l; i += 1) {
        var ff_name = conf.settings.font_list[i];
        $('<option/>').attr('value', ff_name).text(ff_name).appendTo(ff_list);
    }
    ff_list.val(prefs.font_family_used);
    ff_list = null;
    
    $('#tbox_prefs_custom_font').val(prefs.custom_font);    
    $('#tbox_prefs_font_size').val(prefs.font_size);    
    if (prefs.use_custom_font) {
        $('#rdo_use_custom_font').prop('checked', prefs.use_custom_font);
    }
    switch (prefs.effects_level) {
    case 0: $('#rdo_effects_level_low').prop('checked', true); break;
    case 1: $('#rdo_effects_level_normal').prop('checked', true); break;
    case 2: $('#rdo_effects_level_extra').prop('checked', true); break;
    default: $('#rdo_effects_level_normal').prop('checked', true); break;
    }  
    ui.PrefsDlg.update_font_preview();
    $('#chk_prefs_use_native_notify').prop('checked'
        , prefs.use_native_notify);
    $('#chk_prefs_use_preload_conversation').prop('checked'
        , prefs.use_preload_conversation);
    $('#chk_prefs_use_alt_retweet').prop('checked'
        , prefs.use_alt_retweet);
    $('#chk_prefs_use_alt_reply').prop('checked'
        , prefs.use_alt_reply);
    $('#chk_prefs_use_media_preview').prop('checked'
        , prefs.use_media_preview);
    
    $('#sel_prefs_default_picture_service').val(prefs.default_picture_service);

    // Advanced
    $('#tbox_prefs_api_base').val(prefs.api_base);
    $('#tbox_prefs_sign_api_base').val(prefs.sign_api_base);
    $('#tbox_prefs_search_api_base2').val(prefs.search_api_base2);
    $('#tbox_prefs_upload_api_base').val(prefs.upload_api_base);
    $('#tbox_prefs_oauth_base').val(prefs.oauth_base);
    $('#tbox_prefs_sign_oauth_base').val(prefs.sign_oauth_base);
    $('#chk_prefs_use_same_sign_api_base').prop('checked'
        , prefs.use_same_sign_api_base);
    $('#chk_prefs_use_same_sign_oauth_base').prop('checked'
        , prefs.use_same_sign_oauth_base);
    if (prefs.use_same_sign_api_base) {
        $('#tbox_prefs_sign_api_base').attr('disabled', true);
    }
    if (prefs.use_same_sign_oauth_base) {
        $('#tbox_prefs_sign_oauth_base').attr('disabled', true);
    }
},

save_prefs:
function save_prefs() {
    var prefs = conf.get_current_profile().preferences;
    // Account
    prefs['remember_password']
        = $('#chk_prefs_remember_password').prop('checked');
    // Looks & Feels
    prefs['lang'] = $('#sel_prefs_lang').val();

    prefs['theme'] = $('#sel_prefs_theme').val();
    prefs['theme_path'] = $('#sel_prefs_theme').children('option[value="'+$('#sel_prefs_theme').val()+'"]').attr('path');
    prefs['custom_font'] = $('#tbox_prefs_custom_font').val();
    prefs['font_family_used'] = $('#sel_prefs_font_family').val();
    prefs['font_size'] = $('#tbox_prefs_font_size').val();
    if (prefs['font_size'] == '') {
        prefs['font_size'] = 12;
    }
    prefs['use_custom_font'] = $('#rdo_use_custom_font').prop('checked');
    prefs['effects_level'] 
        = parseInt($('input:radio[name="effects"]:checked').val());
    // behaviors
    prefs['use_native_notify']
        = $('#chk_prefs_use_native_notify').prop('checked');
    prefs['use_preload_conversation']
        = $('#chk_prefs_use_preload_conversation').prop('checked'); 
    prefs['use_alt_retweet']
        = $('#chk_prefs_use_alt_retweet').prop('checked'); 
    prefs['use_alt_reply']
        = $('#chk_prefs_use_alt_reply').prop('checked'); 
    prefs['use_media_preview']
        = $('#chk_prefs_use_media_preview').prop('checked'); 
    prefs['default_picture_service'] = $('#sel_prefs_default_picture_service').val();

    // Advanced
    prefs['api_base']
        = $('#tbox_prefs_api_base').attr('value');
    prefs['sign_api_base'] 
        = $('#tbox_prefs_sign_api_base').attr('value');
    prefs['search_api_base2'] 
        = $('#tbox_prefs_search_api_base2').attr('value');
    prefs['upload_api_base']
        = $('#tbox_prefs_upload_api_base').attr('value');
    prefs['oauth_base'] 
        = $('#tbox_prefs_oauth_base').attr('value');    
    prefs['sign_oauth_base'] 
        = $('#tbox_prefs_sign_oauth_base').attr('value');
    prefs['use_same_sign_api_base']
        = $('#chk_prefs_use_same_sign_api_base').prop('checked');
    prefs['use_same_sign_oauth_base']
        = $('#chk_prefs_use_same_sign_oauth_base').prop('checked');
    // apply & save
    conf.apply_prefs(conf.current_name);
    conf.save_prefs(conf.current_name);
},

restore_defaults:
function restore_defaults() {
    conf.get_current_profile().preferences 
        = conf.get_default_prefs(conf.get_current_profile().protocol);
    conf.settings = conf.default_settings;
    ui.PrefsDlg.load_settings(conf.settings);
    ui.PrefsDlg.load_prefs();
},

update_font_preview:
function update_font_preview() {
    $('#prefs_font_preview')
        .css('font-family'
            , $('#rdo_use_custom_font').prop('checked')
                ? $('#tbox_prefs_custom_font').val() 
                    :$('#sel_prefs_font_family').attr('value'))
        .css('font-size'
            , $('#tbox_prefs_font_size').attr('value') + 'px');
}

}
