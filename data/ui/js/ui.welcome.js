if (typeof ui == 'undefined') var ui = {};
ui.Welcome = {

me: {},

id: '',

sign_opts: {
      'remember_password': false
    , 'default_username': ''
    , 'default_password': ''
},

profiles_info: [],

init:
function init () {
    ui.Welcome.id = '#welcome_page';
    ui.Welcome.me = $('#welcome_page');

    $('.service_tabs_btn').click(
    function (event) {
        var page_name = $(this).attr('href');
        $('.service_tabs_btn')
            .not(this).removeClass('selected');
        $(this).addClass('selected');
        $('.service_tabs_page').not(page_name).hide();
        $(page_name).show();
        ui.Welcome.selected_service = $(this).attr('service');
        
        hotot_action('system/select_protocol/'
            + encodeURIComponent(ui.Welcome.selected_service));
    });
    $('.service_tabs_btn:first').click();

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
        
    $('#btn_welcome_about').click(
    function (event) {
        ui.DialogHelper.open(ui.AboutDlg);
    });
    return this;
},

load_profiles_info:
function load_profiles_info(profiles_info) {
    ui.Welcome.profiles_info = profiles_info;
    for (var name in profiles_info ) {
        var profile = profiles_info[name];
        if (name == 'default') {
            continue;
        }
        var type = name.split('@')[1];
        $('#profile_avator_list').prepend(
            '<li><a title="'+name+'" href="'+name+'" class="'+type+'"></a></li>');
    }
    $('#profile_avator_list a').click(
    function (event) {
        var profile_name = $(this).attr('href');                    
        default_username = '';
        default_password = '';
        access_token = '';
        if (profile_name == 'default') {
            // @TODO clear 
            $('.service_tabs_page, .service_tabs_btn').show();
            $('#profile_title').text('New Profile');
            $('.service_tabs_btn:first').click();

        } else {
            var type = profile_name.split('@')[1];
            $('#btn_service_'+ type).click();
            
            $('#btn_service_' + type).show();
            $('.service_tabs_btn').not('#btn_service_' + type).hide();

            $('#service_page_' + type).show();
            $('.service_tabs_page').not('#service_page_' + type).hide();

            $('#profile_title').text(profile_name)

            default_username
                = ui.Welcome.profiles_info[profile_name].username;
            default_password
                = ui.Welcome.profiles_info[profile_name].password;
            access_token 
                = ui.Welcome.profiles_info[profile_name].access_token;
        }

        $('#tbox_basic_auth_username').attr('value', default_username);
        $('#tbox_basic_auth_password').attr('value', default_password);
        jsOAuth.access_token = access_token;

        $('#profile_avator_list a').not(this).removeClass('selected');
        $(this).addClass('selected');

        hotot_action('system/select_profile/'
            + encodeURIComponent(profile_name));
        ui.Welcome.selected_profile = profile_name;
        return false;
    });
     
    $('#profile_avator_list a:first').click();
},

authenticate_pass:
function authenticate_pass(result) {
    globals.myself = result;
    setTimeout(function () {
        $('#btn_my_profile').css('background-image', 'url('+globals.myself.profile_image_url+')');
    }, 500);

    ui.Notification.set('Authentication OK!').show();
    ui.DialogHelper.close(ui.PinDlg);
    ui.Welcome.hide();
    ui.Main.show();
    globals.layout.open('north');
    globals.layout.open('south');

    ui.Welcome.selected_profile = result.screen_name + '@' + ui.Welcome.selected_service;
    hotot_action('system/sign_in/'
        + encodeURIComponent(ui.Welcome.selected_profile));    
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


