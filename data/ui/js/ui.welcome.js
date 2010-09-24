if (typeof ui == 'undefined') var ui = {};
ui.Welcome = {

me: {},

id: '',

        
sign_opts : {
      'remember_password': false
    , 'default_username': ''
    , 'default_password': ''
},

init:
function init () {
    ui.Welcome.id = '#welcome_page';
    ui.Welcome.me = $('#welcome_page');

    // bind events
    $('#btn_basic_auth_sign_in').click(
    function (event) {  
        lib.twitterapi.username 
            = $('#tbox_basic_auth_username').attr('value');
        lib.twitterapi.password 
            = $('#tbox_basic_auth_password').attr('value');
        lib.twitterapi.use_oauth 
            = false;
        ui.Welcome.sign_opts.remember_password
            = $('#chk_remember_password').attr('checked'); 

        ui.Notification.set('Sign in ...').show();
        if (ui.Welcome.sign_opts.remember_password) {
            ui.Welcome.sign_opts.default_password 
                = lib.twitterapi.password;
        } else {
            ui.Welcome.sign_opts.default_password = '';
        }
        ui.Welcome.sign_opts.default_username 
            = lib.twitterapi.username;
        setTimeout(function () {
            hotot_action('config/set_opts/'
                + encodeURIComponent(
                    JSON.stringify(ui.Welcome.sign_opts)));
        }, 500);
        setTimeout(function () {
            hotot_action('config/dumps');
        }, 1000);

        // verify ...
        lib.twitterapi.verify(
        function (result) {
            if (result.screen_name) {
                ui.Welcome.authenticate_pass(result);
            } else {
                ui.MessageDlg.set_text(ui.MessageDlg.TITLE_STR_ERROR
                    , '<p>Cannot Authenticate You! Please check your username/password and API base</p>');
                ui.DialogHelper.open(ui.MessageDlg);
            }
        });
    });

    $('#chk_remember_password').click(
    function (event) {
        ui.Welcome.sign_opts.remember_password = $(this).attr('checked');
    });
    
    $('#btn_oauth_sign_in').click(
    function(event) {
        lib.twitterapi.use_oauth = true;
        ui.Notification.set('Begin to OAuth ...').show();
        if (jsOAuth.access_token == null
            || jsOAuth.access_token.constructor != Object) { 
        // access_token is not existed
        // then get a new one.
            jsOAuth.get_request_token(
            function (result) {
                ui.PinDlg.set_auth_url(jsOAuth.get_auth_url());
                ui.DialogHelper.open(ui.PinDlg);
            }); 
        } else {
        // access_token is existed
        // then test it
        // utility.Console.out('[i]access_token: ' + jsOAuth.access_token);
            lib.twitterapi.verify(
            function (result) { 
            // access_token is valid
                if (result.screen_name) {
                    ui.Welcome.authenticate_pass(result);
                } else {
                    ui.MessageDlg.set_text(ui.MessageDlg.TITLE_STR_ERROR
                        , '<p>Cannot Authenticate You! Please check your username/password and API base</p>');
                    ui.DialogHelper.open(ui.MessageDlg);
                }
            });
        }
    });
    
    $('#btn_welcome_prefs').click(
    function (event) {
        ui.DialogHelper.open(ui.PrefsDlg);
    });
        
    $('#btn_welcome_exts').click(
    function (event) {
        ui.DialogHelper.open(ui.ExtsDlg);
    });

    $('#btn_welcome_about').click(
    function (event) {
        ui.DialogHelper.open(ui.AboutDlg);
    });
    return this;
},

authenticate_pass:
function authenticate_pass(result) {
    globals.myself = result;
    $('#my_profile_img').attr('src'
        , globals.myself.profile_image_url);
    ui.Notification.set('Authentication OK!').show();
    ui.DialogHelper.close(ui.PinDlg);
    ui.Welcome.hide();
    ui.Main.show();
    globals.layout.open('north');
    globals.layout.open('south');
},

hide:
function hide () {
    this.me.hide();
    return this;
},

show:
function show () {
    this.me.show();
    return this;
},

}


