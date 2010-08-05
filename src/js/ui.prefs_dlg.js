if (typeof ui == 'undefined') var ui = {};
ui.PrefsDlg = {

me: {},

id: '',

mask: {},

init:
function init () {
    ui.PrefsDlg.id = '#prefs_dlg';
    ui.PrefsDlg.me = $('#prefs_dlg');
    ui.PrefsDlg.mask = $('#dialog_mask');
    $('.prefs_tabs_btn').click(
    function (event) {
        var page_name = $(this).attr('href');
        $('.prefs_tabs_btn').not(this).removeClass('selected');
        $('.prefs_tabs_page').not(page_name).hide();
        $(page_name).show();
        $(this).addClass('selected');
    });
    $('#btn_prefs_account').click()

    $(ui.PrefsDlg.me).parent().children('.dialog_close_btn').click(
    function (event) {
        ui.PrefsDlg.hide();
    });

    $('#btn_regain_token').click(
    function (event) {
        jsOAuth.access_token = null;
        jsOAuth.get_request_token(
            function (result) {
                ui.PrefsDlg.hide();
                ui.PinDlg.set_auth_url(jsOAuth.get_auth_url());
                ui.PinDlg.show();
            }); 
    });

    $('#btn_prefs_ok').click(
    function (event) {
        ui.PrefsDlg.save_prefs();
        ui.PrefsDlg.hide();
    });

    $('#btn_prefs_cancel').click(
    function (event) {
        ui.PrefsDlg.hide();
    });
    return this;
},

request_prefs:
function request_prefs() {
    hotot_action('system/push_prefs');
},

request_prefs_cb:
function request_prefs_cb(prefs_obj) {
    $('#chk_prefs_remember_password').attr('checked'
        , prefs_obj['remember_password']);
    $('#tbox_prefs_consumer_key').attr('value'
        , prefs_obj['consumer_key']);
    $('#tbox_prefs_consumer_secret').attr('value'
        , prefs_obj['consumer_secret']);    
    $('#tbox_prefs_shortcut_summon_hotot').attr('value'
        , prefs_obj['shortcut_summon_hotot']);
    $('#chk_prefs_use_native_notify').attr('checked'
        , prefs_obj['use_native_notify']);
    $('#chk_prefs_use_native_input').attr('checked'
        , prefs_obj['use_native_input']);
    $('#tbox_prefs_api_base').attr('value'
        , prefs_obj['api_base']);
},

save_prefs:
function save_prefs() {
    var prefs_obj = {};
    prefs_obj['remember_password']
        = $('#chk_prefs_remember_password').attr('checked');
    prefs_obj['consumer_key']
        = $('#tbox_prefs_consumer_key').attr('value'); 
    prefs_obj['consumer_secret']
        = $('#tbox_prefs_consumer_secret').attr('value');
    prefs_obj['shortcut_summon_hotot']
        = $('#tbox_prefs_shortcut_summon_hotot').attr('value');
    prefs_obj['use_native_notify']
        = $('#chk_prefs_use_native_notify').attr('checked');
    prefs_obj['use_native_input']
        = $('#chk_prefs_use_native_input').attr('checked');
    prefs_obj['api_base']
        = $('#tbox_prefs_api_base').attr('value');
    var arr = []
    for (var name in prefs_obj) {
        arr.push(name+'='+prefs_obj[name]);
    }
    hotot_action('system/save_prefs/' + encodeBase64(arr.join('&')));
},

hide:
function hide () {
    this.mask.fadeOut();
    this.me.parent().hide();
    return this;
},

show:
function show () {
    this.request_prefs();
    this.me.parent().show();
    this.mask.fadeIn();
    return this;
},

}


