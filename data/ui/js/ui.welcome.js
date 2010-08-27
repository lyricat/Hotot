if (typeof ui == 'undefined') var ui = {};
ui.Welcome = {

me: {},

id: '',

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
        ui.Notification.set('Sign in ...').show();
        
        hotot_action('config/set_opt/default_username/' + lib.twitterapi.username);
        if ($('#chk_remember_password').attr('checked') == true) {
            setTimeout(function () {
            hotot_action('config/set_opt/default_password/' + lib.twitterapi.password);
            }, 200);
        } else {
            setTimeout(function () {
            hotot_action('config/set_opt/default_password/');
            }, 200);
        }
        setTimeout(function () {
            hotot_action('config/dumps');
        }, 400);

        // verify ...
        lib.twitterapi.verify(
        function (result) {
            globals.myself = result;
            $('#my_profile_img').attr('src'
                , globals.myself.profile_image_url);
            ui.Welcome.hide();
            ui.Main.show();
            globals.layout.open('north');
            globals.layout.open('south');
        });
    });

    $('#chk_remember_password').click(
    function (event) {
        var remember_password = $(this).attr('checked')
        var flag = (remember_password != true)? 'False':'True';
        hotot_action('config/set_opt/remember_password/' + flag);

        setTimeout(function () {
            hotot_action('config/dumps');
        }, 200);
    });
    
    $('#btn_oauth_sign_in').click(
    function(event) {
        lib.twitterapi.use_oauth = true;
        ui.Notification.set('Begin to OAuth ...').show();
        if (jsOAuth.access_token == null) { 
        // access_token is not existed
        // then get a new one.
            jsOAuth.get_request_token(
            function (result) {
                ui.PinDlg.set_auth_url(jsOAuth.get_auth_url());
                ui.PinDlg.show();
            }); 
        } else {
        // access_token is existed
        // then test it
        // utility.Console.out('[i]access_token: ' + jsOAuth.access_token);
            lib.twitterapi.verify(
            function (result) { 
            // access_token is valid
            // change to main page
                globals.myself = result;
                $('#my_profile_img').attr('src'
                    , globals.myself.profile_image_url);

                ui.Notification.set('Authentication OK!').show();
                utility.Console.out('[i]: test pass! '+ result);
                ui.PinDlg.hide();
                ui.Welcome.hide();
                ui.Main.show();
                globals.layout.open('north');
                globals.layout.open('south');
            });
        }
    });
    
    $('#btn_welcome_prefs').click(
    function (event) {
        ui.PrefsDlg.show();
    });
    
    $('#btn_welcome_about').click(
    function (event) {
        ui.AboutDlg.show();
    });
    return this;
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


