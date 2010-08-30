if (typeof ui == 'undefined') var ui = {};
ui.PinDlg = {

me: {},

id: '',

mask: {},

is_show: false,

init:
function init () {
    ui.PinDlg.id = '#oauth_dlg';
    ui.PinDlg.me = $('#oauth_dlg');
    ui.PinDlg.mask = $('#dialog_mask');
    // bind events
    $(ui.PinDlg.me).parent().children('.dialog_close_btn').click(
    function (event) {
        ui.DialogHelper.close(ui.PinDlg);
    });

    $('#btn_oauth_pin_ok').click(
    function (event) {
        var pin_code = $.trim($('#tbox_oauth_pin').attr('value'));
        if (pin_code == '') 
            return
        jsOAuth.get_access_token(pin_code,
        function (result) {
            ui.Notification.set('Authentication OK!')
            // get a new access_token, dump it to disk.
            hotot_action(
                'token/dump/'
                +encodeURIComponent(utility.DB.json(jsOAuth.access_token)));
            // change to main view
            ui.DialogHelper.close(ui.PinDlg);
        },
        function (xhr, textStatus, errorThrown) {
            ui.DialogHelper.close(ui.PinDlg);
            on_twitterapi_error(xhr, textStatus, errorThrown);
        });
    });

    $('#btn_oauth_pin_cancel').click(
    function (event) {
        ui.DialogHelper.close(ui.PinDlg);
    });

    $('#btn_oauth_user_auth').click(
    function (event) {
        navigate_action($(this).attr('href'));
        return false;
    });

    return this;
},

hide:
function hide () {
    this.me.parent().hide();
    this.is_show = false;
    return this;
},

show:
function show () {
    this.me.parent().show();
    this.is_show = true;
    return this;
},

set_auth_url:
function set_auth_url(url) {
    $('#btn_oauth_user_auth').attr('href', url);
    $('#tbox_oauth_auth_url').attr('value', url);
},

}


