if (typeof ui == 'undefined') var ui = {};
ui.PrefsDlg = {

id: '',

init:
function init () {
    ui.PrefsDlg.id = '#prefs_dlg';

    ui.PrefsDlg.switchPage("#prefs_main");

    $('#prefs_dlg .page_nav').click(function(){
        var page_name = $(this).attr('href');
        if (page_name == "#prefs_main") {
            $('#btn_prefs_back').hide();
        } else {
            $('#btn_prefs_back').show();
        }
        if (page_name == "#prefs_exts") {
            ui.ExtsDlg.load_ext_list();
        }
        ui.PrefsDlg.switchPage(page_name);
        return false;
    });

    $('#sel_prefs_theme').bind('change', function () {
        change_theme($(this).val(), $(this).children('option[value="'+$(this).val()+'"]').attr('path'));
    });

    $('#sel_prefs_lang').bind('change', function () {
        i18n.change($(this).val());
    });

    $('#sel_prefs_sys_font, #range_prefs_font_size, #tbox_prefs_custom_font, #chk_use_custom_font').bind('click change keypress blur',
    function (event) {
        ui.PrefsDlg.update_font_preview();
    });

    $('#sel_prefs_sys_font').change(function (event) {
        var val = $(this).val();
        if (val != 'more') {
            $('#tbox_prefs_custom_font').val(val);
            $(this).val('more');
        }
    });

    $('#chk_use_custom_font').click(function (event) {
        $('#tbox_prefs_custom_font, #sel_prefs_sys_font').attr('disabled', !$(this).prop('checked'));
    });

    $('#range_prefs_font_size, #tbox_prefs_proxy_port').blur(
    function (event) {
        ui.FormChecker.test_int_value(this);
    });
    $('#range_prefs_font_size').change(
    function (event) {
        $('#range_prefs_font_size_st').text($(this).val() + 'px');
        ui.PrefsDlg.update_font_preview();
    });

    $('#chk_prefs_use_same_sign_api_base').click(
    function (event) {
        $('#tbox_prefs_sign_api_base').attr('disabled', $(this).prop('checked'));
    });

    $('#chk_prefs_use_same_sign_oauth_base').click(
    function (event) {
        $('#tbox_prefs_sign_oauth_base').attr('disabled', $(this).prop('checked'));
    });

	if (/python-gtk/.test(conf.vars.wrapper)) {
		$('#sel_prefs_proxy_type option[value="socks"]').remove();
	}

    $('#sel_prefs_proxy_type').change(
	function (event) {
        $('#tbox_prefs_proxy_host, #tbox_prefs_proxy_port, #chk_prefs_proxy_auth').attr('disabled', ! /http|socks/.test($(this).val()));
        if (! $('#chk_prefs_proxy_auth').attr('disabled')) {
            $('#tbox_prefs_proxy_auth_name, #tbox_prefs_proxy_auth_password').attr('disabled', !$('#chk_prefs_proxy_auth').prop('checked'));
        } else {
            $('#tbox_prefs_proxy_auth_name, #tbox_prefs_proxy_auth_password').attr('disabled', true);
        }
    });

    $('#chk_prefs_proxy_auth').click(
    function (event) {
        $('#tbox_prefs_proxy_auth_name, #tbox_prefs_proxy_auth_password').attr('disabled', !$(this).prop('checked'));
    });

    $('#btn_prefs_ok').unbind().click(function (event) {
        var err = ui.FormChecker.check_config_error(
            ui.PrefsDlg.id + ' input');
        if ( err.count != 0 ) {
            toast.set("There are "+err.count+" errors in your changes. Abort...").show();
            widget.DialogManager.alert(
                  'Oops, some mistakes in your information.'
                , "<p>There are something wrong in what your changes.<br/>Please check errors in the options below:<br/> - "
                + err.error_values.join('<br/> - ') + '</p>');
        } else {
            globals.prefs_dialog.close();
            ui.PrefsDlg.save_settings();
            ui.PrefsDlg.save_prefs();
        }
        return false;
    });

    $('#btn_prefs_restore_defaults').click(function (event) {
        if (confirm("Restore defaults will erases all changes you make.\n Are you sure you want to continue?!\n"))
            ui.PrefsDlg.restore_defaults();
    });

    if (util.is_native_platform()) {
        $('#prefs_system').find('.chrome_context_menu').hide()
    } else {
        $('#prefs_system').find('.summon_list, .proxy_list, .proxy_auth_list, .exit_when_close, .starts_minimized').hide();
        $('#prefs_system')
    }

    return this;
},

switchPage:
function switchPage (name) {
    $(ui.PrefsDlg.id + ' .dialog_page').not(name).hide();
    $(name).show();
},

load_settings:
function load_settings() {
    // Globals
    $('#chk_prefs_use_verbose_mode')
        .attr('checked', conf.settings.use_verbose_mode)
        .prop('checked', conf.settings.use_verbose_mode);
    $('#chk_prefs_close_to_exit')
        .attr('checked', conf.settings.close_to_exit)
        .prop('checked', conf.settings.close_to_exit);
    $('#chk_prefs_sign_in_automatically')
        .attr('checked', conf.settings.sign_in_automatically)
        .prop('checked', conf.settings.sign_in_automatically);
    $('#chk_prefs_starts_minimized')
        .attr('checked', conf.settings.starts_minimized)
        .prop('checked', conf.settings.starts_minimized);
    $('#chk_prefs_use_anonymous_stat')
        .attr('checked', conf.settings.use_anonymous_stat)
        .prop('checked', conf.settings.use_anonymous_stat);
    // chrome only
    if (conf.vars.platform === 'Chrome') {
        $('#chk_prefs_context_menu_integration')
            .attr('checked'
                , conf.settings.context_menu_integration)
            .prop('checked'
                , conf.settings.context_menu_integration);
    }
    $('#tbox_prefs_shortcut_summon_hotot').attr('value'
        , conf.settings.shortcut_summon_hotot);
    // proxy
    if (util.is_native_platform()) {
        $('#sel_prefs_proxy_type').val(conf.settings.proxy_type);
        $('#tbox_prefs_proxy_host').val(conf.settings.proxy_host);
        $('#tbox_prefs_proxy_port').val(conf.settings.proxy_port);
        if (! /http|socks/.test(conf.settings.proxy_type)) {
            $('#tbox_prefs_proxy_host, #tbox_prefs_proxy_port, #chk_prefs_proxy_auth, #tbox_prefs_proxy_auth_name, #tbox_prefs_proxy_auth_password').attr('disabled', true);
        }
        $('#chk_prefs_proxy_auth')
            .attr('checked', conf.settings.proxy_auth)
            .prop('checked', conf.settings.proxy_auth);
        $('#tbox_prefs_proxy_auth_name').val(conf.settings.proxy_auth_name);
        $('#tbox_prefs_proxy_auth_password').val(conf.settings.proxy_auth_password);
        if (! conf.settings.proxy_auth) {
            $('#tbox_prefs_proxy_auth_name, #tbox_prefs_proxy_auth_password').attr('disabled', true);
        }
    }
},

save_settings:
function save_settings() {
    // Globals
    conf.settings.use_verbose_mode
        = $('#chk_prefs_use_verbose_mode').prop('checked');
    conf.settings.close_to_exit
        = $('#chk_prefs_close_to_exit').prop('checked');
    conf.settings.sign_in_automatically
        = $('#chk_prefs_sign_in_automatically').prop('checked');
    conf.settings.starts_minimized
        = $('#chk_prefs_starts_minimized').prop('checked');
    conf.settings.use_anonymous_stat
        = $('#chk_prefs_use_anonymous_stat').prop('checked');
    conf.settings.shortcut_summon_hotot
        = $('#tbox_prefs_shortcut_summon_hotot').val();
    // chrome only
    if (conf.vars.platform === 'Chrome') {
        conf.settings.context_menu_integration
            = $('#chk_prefs_context_menu_integration').prop('checked');
    }
    // proxy
    if (util.is_native_platform()) {
        conf.settings.proxy_type
            = $('#sel_prefs_proxy_type').val();
        conf.settings.proxy_host
            = $('#tbox_prefs_proxy_host').val();
        conf.settings.proxy_port
            = parseInt($('#tbox_prefs_proxy_port').val());
        conf.settings.proxy_auth
            = $('#chk_prefs_proxy_auth').prop('checked');
        conf.settings.proxy_auth_name
            = $('#tbox_prefs_proxy_auth_name').val();
        conf.settings.proxy_auth_password
            = $('#tbox_prefs_proxy_auth_password').val();
        if (isNaN(conf.settings.proxy_port)) {
            conf.settings.proxy_port = 0;
        }
    }
    // save
    conf.apply_settings();
    conf.save_settings();
},

load_prefs:
function load_prefs() {
    var prefs = conf.get_current_profile().preferences;
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

    var ff_list = $('#sel_prefs_sys_font').empty();
    for (var i = 0, l = conf.settings.font_list.length; i < l; i += 1) {
        var ff_name = conf.settings.font_list[i];
        $('<option/>').attr('value', ff_name).text(ff_name).appendTo(ff_list);
    }
    $('<option/>').attr('value', 'more').text('...').appendTo(ff_list);
    ff_list.val('more');
    ff_list = null;

    $('#tbox_prefs_custom_font').val(prefs.custom_font);
    $('#range_prefs_font_size').val(prefs.font_size);
    $('#range_prefs_font_size_st').text(prefs.font_size + 'px');
    if (prefs.use_custom_font) {
        $('#chk_use_custom_font')
            .attr('checked', prefs.use_custom_font)
            .prop('checked', prefs.use_custom_font);
    } else {
        $('#sel_prefs_sys_font, #tbox_prefs_custom_font')
            .attr('disabled', true);
    }
    ui.PrefsDlg.update_font_preview();
    $('#chk_prefs_use_preload_conversation')
        .attr('checked', prefs.use_preload_conversation)
        .prop('checked', prefs.use_preload_conversation);
    $('#chk_prefs_use_alt_retweet')
        .attr('checked', prefs.use_alt_retweet)
        .prop('checked', prefs.use_alt_retweet);
    $('#chk_prefs_use_alt_reply')
        .attr('checked', prefs.use_alt_reply)
        .prop('checked', prefs.use_alt_reply);
    $('#chk_prefs_use_media_preview')
        .attr('checked', prefs.use_media_preview)
        .prop('checked', prefs.use_media_preview);
    $('#chk_prefs_use_deleted_mark')
        .attr('checked', prefs.use_deleted_mark)
        .prop('checked', prefs.use_deleted_mark);
    $('#sel_prefs_default_picture_service').val(prefs.default_picture_service);

    // Advanced
    $('#tbox_prefs_api_base').val(prefs.api_base);
    $('#tbox_prefs_sign_api_base').val(prefs.sign_api_base);
    $('#tbox_prefs_search_api_base2').val(prefs.search_api_base2);
    $('#tbox_prefs_upload_api_base').val(prefs.upload_api_base);
    $('#tbox_prefs_oauth_base').val(prefs.oauth_base);
    $('#tbox_prefs_sign_oauth_base').val(prefs.sign_oauth_base);
    $('#chk_prefs_use_same_sign_api_base')
        .attr('checked', prefs.use_same_sign_api_base)
        .prop('checked', prefs.use_same_sign_api_base);
    $('#chk_prefs_use_same_sign_oauth_base')
        .attr('checked', prefs.use_same_sign_oauth_base)
        .prop('checked', prefs.use_same_sign_oauth_base);
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
    // Looks & Feels
    prefs['lang'] = $('#sel_prefs_lang').val();

    prefs['theme'] = $('#sel_prefs_theme').val();
    prefs['theme_path'] = $('#sel_prefs_theme').children('option[value="'+$('#sel_prefs_theme').val()+'"]').attr('path');
    prefs['custom_font'] = $('#tbox_prefs_custom_font').val();
    prefs['font_size'] = $('#range_prefs_font_size').val();
    if (prefs['font_size'] == '') {
        prefs['font_size'] = 12;
    }
    prefs['use_custom_font'] = $('#chk_use_custom_font').prop('checked');
    // behaviors
    prefs['use_preload_conversation']
        = $('#chk_prefs_use_preload_conversation').prop('checked');
    prefs['use_alt_retweet']
        = $('#chk_prefs_use_alt_retweet').prop('checked');
    prefs['use_alt_reply']
        = $('#chk_prefs_use_alt_reply').prop('checked');

    prefs['use_media_preview']
        = $('#chk_prefs_use_media_preview').prop('checked');
    prefs['use_deleted_mark']
        = $('#chk_prefs_use_deleted_mark').prop('checked');
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
    conf.apply_prefs(conf.current_name, true);
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
            , $('#chk_use_custom_font').prop('checked')
                ? $('#tbox_prefs_custom_font').val()
                    : conf.get_default_font_settings())
        .css('font-size'
            , $('#range_prefs_font_size').val() + 'px');
}

}
