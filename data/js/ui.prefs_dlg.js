if (typeof ui == 'undefined') var ui = {};
ui.PrefsDlg = {

me: {},

id: '',

mask: {},

is_show: false,

init:
function init () {
    ui.PrefsDlg.id = '#prefs_dlg';
    ui.PrefsDlg.me = $('#prefs_dlg');
    ui.PrefsDlg.mask = $('#dialog_mask');

    var btns = new widget.RadioGroup('#prefs_dlg_btns');
    btns.on_clicked = function (btn, event) {
        var page_name = btn.attr('href');
        $(ui.PrefsDlg.id +' .prefs_dlg_page').not(page_name).hide();
        $(page_name).show();
    };
    btns.create();
    $('#btn_prefs_global').click();

    $(ui.PrefsDlg.id).find('.dialog_close_btn').click(
    function (event) {
        ui.DialogHelper.close(ui.PrefsDlg);
    });

    var btn_regain_token = new widget.Button('#btn_regain_token');
    btn_regain_token.on_clicked = function (event) {
        jsOAuth.access_token = null;
        jsOAuth.get_request_token(
            function (result) {
                ui.PinDlg.set_auth_url(jsOAuth.get_auth_url());
                ui.DialogHelper.open(ui.PinDlg);
            }); 
    };
    btn_regain_token.create();

    $('#sel_prefs_font_family #tbox_prefs_font_size #tbox_prefs_custom_font').bind('change keypress blur',
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
        $('#tbox_prefs_sign_api_base').attr('disabled', $(this).attr('checked'));
    });

    $('#chk_prefs_use_same_sign_oauth_base').click(
    function (event) {
        $('#tbox_prefs_sign_oauth_base').attr('disabled', $(this).attr('checked'));
    });
    
    $('#chk_prefs_use_http_proxy').click(
    function (event) {
        $('#tbox_prefs_http_proxy_host').attr('disabled', !$(this).attr('checked'));
        $('#tbox_prefs_http_proxy_port').attr('disabled', !$(this).attr('checked'));
    });

    var btn_prefs_ok = new widget.Button('#btn_prefs_ok');
    btn_prefs_ok.on_clicked = function (event) {
        var err = ui.FormChecker.check_config_error(
            ui.PrefsDlg.id + ' input');
        if ( err.count != 0 ) {
            ui.Notification.set("There are "+err.count+" errors in your changes. Abort...").show();
            ui.MessageDlg.set_text(
                ui.MessageDlg.TITLE_STR_ERROR,
                "<p>There are something wrong in what your changes.<br/>Please check errors in the options below:<br/> - "
                + err.error_values.join('<br/> - ') + '</p>');
            ui.DialogHelper.open(ui.MessageDlg);
        } else {
            ui.PrefsDlg.save_settings();
            ui.PrefsDlg.save_prefs();
            ui.DialogHelper.close(ui.PrefsDlg);
        }
    };
    btn_prefs_ok.create();

    var btn_prefs_cancel = new widget.Button('#btn_prefs_cancel');
    btn_prefs_cancel.on_clicked = function (event) {
        ui.DialogHelper.close(ui.PrefsDlg);
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
    $('#chk_prefs_use_verbose_mode').attr('checked'
        , conf.settings.use_verbose_mode);
    $('#chk_prefs_use_ubuntu_indicator').attr('checked'
        , conf.settings.use_ubuntu_indicator);
    $('#tbox_prefs_shortcut_summon_hotot').attr('value'
        , conf.settings.shortcut_summon_hotot);
    // proxy
    if (util.is_native_platform()) {
        $('#chk_prefs_use_http_proxy').attr('checked'
            , conf.settings.use_http_proxy);
        $('#tbox_prefs_http_proxy_host').val(conf.settings.http_proxy_host);
        $('#tbox_prefs_http_proxy_port').val(conf.settings.http_proxy_port);
        if (! conf.settings.use_http_proxy) {
            $('#tbox_prefs_http_proxy_host').attr('disabled', true);
            $('#tbox_prefs_http_proxy_port').attr('disabled', true);
        }
    } else {
        $('#label_prefs_use_http_proxy').text('Sorry, HTTP proxy doesn\'t work in this platform.');
        $('#chk_prefs_use_http_proxy, #chk_prefs_use_http_proxy, #tbox_prefs_http_proxy_port').attr('disabled', true);
    }
},

save_settings:
function save_settings() {
    // Globals
    conf.settings.use_verbose_mode 
        = $('#chk_prefs_use_verbose_mode').attr('checked');
    conf.settings.use_ubuntu_indicator 
        = $('#chk_prefs_use_ubuntu_indicator').attr('checked');
    conf.settings.shortcut_summon_hotot 
        = $('#tbox_prefs_shortcut_summon_hotot').val();
    // proxy
    if (util.is_native_platform()) {
        conf.settings.use_http_proxy
            = $('#chk_prefs_use_http_proxy').attr('checked');
        conf.settings.http_proxy_host 
            = $('#tbox_prefs_http_proxy_host').val();
        conf.settings.http_proxy_port 
            = $('#tbox_prefs_http_proxy_port').val();
        conf.settings.use_http_proxy
            = $('#chk_prefs_use_http_proxy').attr('checked');
        conf.settings.http_proxy_host
            = $('#tbox_prefs_http_proxy_host').attr('value');
        conf.settings.http_proxy_port
            = $('#tbox_prefs_http_proxy_port').attr('value');
        if (conf.settings.http_proxy_port == '') {
            conf.settings.http_proxy_port = 0;
        }
        if (! conf.settings.use_http_proxy) {
            $('#tbox_prefs_http_proxy_host').attr('disabled', true);
            $('#tbox_prefs_http_proxy_port').attr('disabled', true);
        }
    }
    // save
    conf.save_settings();
},

load_prefs:
function load_prefs() {
    var prefs = conf.get_current_profile().preferences;
    // Account
    $('#chk_prefs_remember_password').attr('checked'
        , prefs.remember_password);
    // Appearance
    var options_arr = []; var selected_idx = 0;
    for (var i = 0; i < conf.settings.font_list.length; i += 1) {
        var ff_name = conf.settings.font_list[i];
        options_arr.push('<option value="'
            + ff_name + '">' + ff_name + '</option>');
        if (ff_name == prefs.font_family_used) {
            selected_idx = i;
        }
    }
    $('#tbox_prefs_custom_font').val(prefs.custom_font);    
    $('#sel_prefs_font_family').html(options_arr.join(''))
    $('#sel_prefs_font_family').attr('selectedIndex', selected_idx);
    $('#tbox_prefs_font_size').val(prefs.font_size);    
    ui.PrefsDlg.update_font_preview();
    $('#chk_prefs_use_native_notify').attr('checked'
        , prefs.use_native_notify);
    $('#chk_prefs_use_hover_box').attr('checked'
        , prefs.use_hover_box);
    $('#chk_prefs_use_preload_conversation').attr('checked'
        , prefs.use_preload_conversation);
    // Update
    var pages = ['home_timeline', 'mentions', 'direct_messages_inbox']
    for (var i = 0; i < pages.length; i += 1) {
        $('#chk_prefs_use_'+pages[i]+'_notify').attr('checked'
            , prefs['use_'+pages[i]+'_notify']);
        $('#sel_prefs_use_'+pages[i]+'_notify_type').val(
            prefs['use_'+pages[i]+'_notify_type']);
        $('#chk_prefs_use_'+pages[i]+'_notify_sound').attr('checked'
            , prefs['use_'+pages[i]+'_notify_sound']);
    }
    // Advanced
    $('#tbox_prefs_api_base').val(prefs.api_base);
    $('#tbox_prefs_sign_api_base').val(prefs.sign_api_base);
    $('#tbox_prefs_search_api_base').val(prefs.search_api_base);
    $('#tbox_prefs_oauth_base').val(prefs.oauth_base);
    $('#tbox_prefs_sign_oauth_base').val(prefs.sign_oauth_base);
    $('#chk_prefs_use_same_sign_api_base').attr('checked'
        , prefs.use_same_sign_api_base);
    $('#chk_prefs_use_same_sign_oauth_base').attr('checked'
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
        = $('#chk_prefs_remember_password').attr('checked');
    // Looks & Feels
    prefs['custom_font'] = $('#tbox_prefs_custom_font').val();
    prefs['font_family_used'] = $('#sel_prefs_font_family').val();
    prefs['font_size'] = $('#tbox_prefs_font_size').val();
    if (prefs['font_size'] == '') {
        prefs['font_size'] = 12;
    }
    prefs['use_native_notify']
        = $('#chk_prefs_use_native_notify').attr('checked');
    prefs['use_hover_box']
        = $('#chk_prefs_use_hover_box').attr('checked');   
    prefs['use_preload_conversation']
        = $('#chk_prefs_use_preload_conversation').attr('checked'); 
    // Update
    var pages = ['home_timeline', 'mentions', 'direct_messages_inbox']
    for (var i = 0; i < pages.length; i += 1) {
        prefs['use_'+pages[i]+'_notify']
            = $('#chk_prefs_use_'+pages[i]+'_notify').attr('checked');
        prefs['use_'+pages[i]+'_notify_type']
            = $('#sel_prefs_use_'+pages[i]+'_notify_type').val();
        prefs['use_'+pages[i]+'_notify_sound']
            = $('#chk_prefs_use_'+pages[i]+'_notify_sound').attr('checked');
    }
    // Advanced
    prefs['api_base']
        = $('#tbox_prefs_api_base').attr('value');
    prefs['sign_api_base'] 
        = $('#tbox_prefs_sign_api_base').attr('value');
    prefs['search_api_base'] 
        = $('#tbox_prefs_search_api_base').attr('value');
    prefs['oauth_base'] 
        = $('#tbox_prefs_oauth_base').attr('value');    
    prefs['sign_oauth_base'] 
        = $('#tbox_prefs_sign_oauth_base').attr('value');
    prefs['use_same_sign_api_base']
        = $('#chk_prefs_use_same_sign_api_base').attr('checked');
    prefs['use_same_sign_oauth_base']
        = $('#chk_prefs_use_same_sign_oauth_base').attr('checked');
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
        , $('#sel_prefs_font_family').attr('value'))
    .css('font-size'
        , $('#tbox_prefs_font_size').attr('value') + 'px');
},

hide:
function hide () {
    ui.PrefsDlg.me.hide();
    ui.PrefsDlg.is_show = false;
    return ui.PrefsDlg;
},

show:
function show () {
    ui.PrefsDlg.load_settings(conf.settings);
    ui.PrefsDlg.load_prefs();
    ui.PrefsDlg.me.show();
    ui.PrefsDlg.is_show = true;
    return ui.PrefsDlg;
},

}


