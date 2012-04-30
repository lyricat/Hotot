if (typeof ui == 'undefined') var ui = {};
ui.PinDlg = {

id: '',

init:
function init () {
    ui.PinDlg.id = '#oauth_dlg';

    $('#btn_oauth_pin_ok').click(
    function (event) {
        var pin_code = $.trim($('#tbox_oauth_pin').attr('value'));
        if (pin_code == '') 
            return
        toast.set("Authorizing ... ").show();
        globals.twitterClient.oauth.get_access_token(pin_code,
        function (result) {
            toast.set("Authentication OK!").show();
            // get a new access_token, dump it to disk.
            conf.save_token(conf.current_name, globals.twitterClient.oauth.access_token);
            // change to main view
            globals.oauth_dialog.close();
            $('#profile_avatar_list a.selected').click();
            ui.Welcome.go.click();
        },
        function (xhr, textStatus, errorThrown) {
            globals.oauth_dialog.close();
            on_twitterapi_error(xhr, textStatus, errorThrown);
        });
    });

    $('#btn_oauth_pin_cancel').click(
    function (event) {
        ui.Welcome.go.removeClass('loading');
        globals.oauth_dialog.close();
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
    globals.oauth_dialog.close();
    return this;
},

show:
function show () {
    globals.oauth_dialog.open();
},

set_auth_url:
function set_auth_url(url) {
    $('#btn_oauth_user_auth').attr('href', url);
    $('#tbox_oauth_auth_url').attr('value', url);
}

}


