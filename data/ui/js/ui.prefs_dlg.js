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

    $(ui.PrefsDlg.id +' .dlg_tabs_btn').click(
    function (event) {
        var page_name = $(this).attr('href');
        $(ui.PrefsDlg.id +' .dlg_tabs_btn')
            .not(this).removeClass('selected');
        $(ui.PrefsDlg.id +' .dlg_tabs_page').not(page_name).hide();
        $(page_name).show();
        $(this).addClass('selected');
    });
    $('#btn_prefs_global').click()

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

    $('#sel_prefs_font_family').change(
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
    }).blur(
    function (event) {
        ui.PrefsDlg.update_font_preview();
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
            ui.Notification.set(_("There are ")+err.count+_(" errors in your change. Abort...")).show();
            ui.MessageDlg.set_text(
                ui.MessageDlg.TITLE_STR_ERROR,
                _("<p>There are something wrong in what your changes.<br/>Please check errors in the options below:<br/> - ")
                + err.error_values.join('<br/> - ') + '</p>');
            ui.DialogHelper.open(ui.MessageDlg);
        } else {
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
        if (confirm(_("Restore defaults will erases all changes you make.\n Are you sure you want to continue?!\n")))
            ui.PrefsDlg.restore_defaults();
    };
    btn_prefs_restore_defaults.create();

    return this;
},

request_prefs:
function request_prefs() {
    hotot_action('config/push_prefs');
},

request_prefs_cb:
function request_prefs_cb(prefs_obj) {
    // Globals
    $('#chk_prefs_use_verbose_mode').attr('checked'
        , prefs_obj['use_verbose_mode']);
    $('#chk_prefs_use_ubuntu_indicator').attr('checked'
        , prefs_obj['use_ubuntu_indicator']);

    // Account
    $('#chk_prefs_remember_password').attr('checked'
        , prefs_obj['remember_password']);
    
    // System
    $('#tbox_prefs_shortcut_summon_hotot').attr('value'
        , prefs_obj['shortcut_summon_hotot']);

    // Appearance
    var options_arr = []; var selected_idx = 0;
    for (var i = 0; i < prefs_obj['font_family_list'].length; i += 1) {
        var ff_name = prefs_obj['font_family_list'][i];
        options_arr.push('<option value="'
            + ff_name + '">' + ff_name + '</option>');
        if (ff_name == prefs_obj['font_family_used']) {
            selected_idx = i;
        }
    }
    $('#sel_prefs_font_family').html(options_arr.join(''))
    $('#sel_prefs_font_family').attr('selectedIndex', selected_idx);
    $('#tbox_prefs_font_size').attr('value', prefs_obj['font_size']);    
    ui.PrefsDlg.update_font_preview()

    var pages = ['home_timeline', 'mentions', 'direct_messages_inbox']
    for (var i = 0; i < pages.length; i += 1) {
        $('#chk_prefs_use_'+pages[i]+'_notify').attr('checked'
            , prefs_obj['use_'+pages[i]+'_notify']);
        $('#sel_prefs_use_'+pages[i]+'_notify_type').val(
            prefs_obj['use_'+pages[i]+'_notify_type']);
        $('#chk_prefs_use_'+pages[i]+'_notify_sound').attr('checked'
            , prefs_obj['use_'+pages[i]+'_notify_sound']);
    }

    $('#chk_prefs_use_native_notify').attr('checked'
        , prefs_obj['use_native_notify']);
    $('#chk_prefs_use_native_input').attr('checked'
        , prefs_obj['use_native_input']);
    $('#chk_prefs_use_hover_box').attr('checked'
        , prefs_obj['use_hover_box']);
    $('#chk_prefs_use_preload_conversation').attr('checked'
        , prefs_obj['use_preload_conversation']);

    // Networks
    $('#tbox_prefs_api_base').attr('value'
        , prefs_obj['api_base']);
    $('#tbox_prefs_sign_api_base').attr('value'
        , prefs_obj['sign_api_base']);
    $('#tbox_prefs_search_api_base').attr('value'
        , prefs_obj['search_api_base']);
    $('#tbox_prefs_oauth_base').attr('value'
        , prefs_obj['oauth_base']);
    $('#tbox_prefs_sign_oauth_base').attr('value'
        , prefs_obj['sign_oauth_base']);

    $('#chk_prefs_use_same_sign_api_base').attr('checked'
        , prefs_obj['use_same_sign_api_base']);
    $('#chk_prefs_use_same_sign_oauth_base').attr('checked'
        , prefs_obj['use_same_sign_oauth_base']);
    if (prefs_obj['use_same_sign_api_base']) {
        $('#tbox_prefs_sign_api_base').attr('disabled', true);
    }
    if (prefs_obj['use_same_sign_oauth_base']) {
        $('#tbox_prefs_sign_oauth_base').attr('disabled', true);
    }

    $('#chk_prefs_use_http_proxy').attr('checked'
        , prefs_obj['use_http_proxy']);
    $('#tbox_prefs_http_proxy_host').attr('value'
        , prefs_obj['http_proxy_host']);
    $('#tbox_prefs_http_proxy_port').attr('value'
        , prefs_obj['http_proxy_port']);
    if (! prefs_obj['use_http_proxy']) {
        $('#tbox_prefs_http_proxy_host').attr('disabled', true);
        $('#tbox_prefs_http_proxy_port').attr('disabled', true);
    }
},

save_prefs:
function save_prefs() {
    var sys_prefs_obj = {};
    sys_prefs_obj['use_verbose_mode'] 
        = $('#chk_prefs_use_verbose_mode').attr('checked');
    sys_prefs_obj['use_ubuntu_indicator'] 
        = $('#chk_prefs_use_ubuntu_indicator').attr('checked');

    var prefs_obj = {};
    prefs_obj['remember_password']
        = $('#chk_prefs_remember_password').attr('checked');
    
    prefs_obj['shortcut_summon_hotot']
        = $('#tbox_prefs_shortcut_summon_hotot').attr('value');

    prefs_obj['font_family_used'] = $('#sel_prefs_font_family').attr('value');
    prefs_obj['font_size'] = $('#tbox_prefs_font_size').attr('value');
    if (prefs_obj['font_size'] == '') prefs_obj['font_size'] = 12;

    var pages = ['home_timeline', 'mentions', 'direct_messages_inbox']
    for (var i = 0; i < pages.length; i += 1) {
        prefs_obj['use_'+pages[i]+'_notify']
            = $('#chk_prefs_use_'+pages[i]+'_notify').attr('checked');
        prefs_obj['use_'+pages[i]+'_notify_type']
            = $('#sel_prefs_use_'+pages[i]+'_notify_type').val();
        prefs_obj['use_'+pages[i]+'_notify_sound']
            = $('#chk_prefs_use_'+pages[i]+'_notify_sound').attr('checked');
    }

    prefs_obj['use_native_notify']
        = $('#chk_prefs_use_native_notify').attr('checked');
    prefs_obj['use_native_input']
        = $('#chk_prefs_use_native_input').attr('checked');
    prefs_obj['use_hover_box']
        = $('#chk_prefs_use_hover_box').attr('checked');   
    prefs_obj['use_preload_conversation']
        = $('#chk_prefs_use_preload_conversation').attr('checked');  
    
    prefs_obj['api_base']
        = $('#tbox_prefs_api_base').attr('value');
    prefs_obj['sign_api_base'] 
        = $('#tbox_prefs_sign_api_base').attr('value');
    prefs_obj['search_api_base'] 
        = $('#tbox_prefs_search_api_base').attr('value');
    prefs_obj['oauth_base'] 
        = $('#tbox_prefs_oauth_base').attr('value');    
    prefs_obj['sign_oauth_base'] 
        = $('#tbox_prefs_sign_oauth_base').attr('value');
    prefs_obj['use_same_sign_api_base']
        = $('#chk_prefs_use_same_sign_api_base').attr('checked');
    prefs_obj['use_same_sign_oauth_base']
        = $('#chk_prefs_use_same_sign_oauth_base').attr('checked');

    prefs_obj['use_http_proxy']
        = $('#chk_prefs_use_http_proxy').attr('checked');
    prefs_obj['http_proxy_host']
        = $('#tbox_prefs_http_proxy_host').attr('value');
    prefs_obj['http_proxy_port'] 
        = $('#tbox_prefs_http_proxy_port').attr('value');
    if (prefs_obj['http_proxy_port']=='') prefs_obj['http_proxy_port']=0;

    hotot_action('config/save_sys_prefs/'
        + encodeURIComponent(JSON.stringify(sys_prefs_obj)));
    hotot_action('config/save_prefs/'
        + encodeURIComponent(JSON.stringify(prefs_obj)));
},

restore_defaults:
function restore_defaults() {
    hotot_action('config/restore_defaults');
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
    ui.PrefsDlg.request_prefs();
    ui.PrefsDlg.me.show();
    ui.PrefsDlg.is_show = true;
    return ui.PrefsDlg;
},

}


