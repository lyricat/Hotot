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

selected_service: 'twitter',

selected_profile: 'default',

init:
function init () {
    ui.Welcome.id = '#welcome_page';
    ui.Welcome.me = $('#welcome_page');

    // bind events
    $('.service_tabs_btn').click(
    function (event) {
        if (ui.Welcome.selected_profile == 'default') {
            $('.service_tabs_page').not('#service_page_new').hide();
            $('#service_page_new').show();
            
            ui.Welcome.selected_service = $(this).attr('service');
            $('#service_page_new .service_name')
                .text(ui.Welcome.selected_service);
            hotot_action('system/select_protocol/'
                + encodeURIComponent(ui.Welcome.selected_service));

            $('.service_tabs_btn')
                .not(this).removeClass('selected');
            $(this).addClass('selected');
        }
    });
    $('.service_tabs_btn:first').click();

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

        ui.Notification.set(_("Sign in ...")).show();
        if (ui.Welcome.sign_opts.remember_password) {
            ui.Welcome.sign_opts.default_password 
                = lib.twitterapi.password;
        } else {
            ui.Welcome.sign_opts.default_password = '';
        }
        ui.Welcome.sign_opts.default_username 
            = lib.twitterapi.username;
        hotot_action('config/set_opts/'
            + encodeURIComponent(
                JSON.stringify(ui.Welcome.sign_opts)));
        hotot_action('config/dumps');

        // verify ...
        lib.twitterapi.verify(
        function (result) {
            if (result.screen_name) {
                ui.Welcome.authenticate_pass(result);
            } else {
                ui.MessageDlg.set_text(ui.MessageDlg.TITLE_STR_ERROR
                    , _("<p>Cannot Authenticate You! Please check your username/password and API base</p>"));
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
        ui.Notification.set(_("Begin to OAuth ...")).show();
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
                        , _("<p>Cannot Authenticate You! Please check your username/password and API base</p>"));
                    ui.DialogHelper.open(ui.MessageDlg);
                }
            });
        }
    });

    $('#btn_welcome_create_profile').click(
    function (event) {
        var cb = "ui.Notification.set('New profile has been created!').show();";
        var prefix = $.trim($('#tbox_new_profile_name').val());
        var profile_name = prefix + '@' + ui.Welcome.selected_service;
        if (prefix.length == 0 ) {
            ui.Notification.set(_("Please entry a profile name!")).show();
            return;
        }
        if (prefix.indexOf('@') != -1) {
            ui.Notification.set(_("Charactor `@` is not allow in profile name!")).show();
            return;
        }
        hotot_action('system/create_profile/'
            + encodeURIComponent(profile_name)
            + '/'
            + cb);
    })
    
    $('#btn_welcome_prefs').click(
    function (event) {
        ui.DialogHelper.open(ui.PrefsDlg);
    });
    
    $('#btn_welcome_delete_profile').click(
    function (event) {
        if (confirm('Delete profile "'+ui.Welcome.selected_profile+'" will erases all data of this profile.\n Are you sure you want to continue?!\n')) 
        {
            var cb = "\
                $('#profile_avator_list a.selected').parent().remove();\
                $('#profile_avator_list a:first').click();\
            ";
            hotot_action('system/delete_profile/'
                + encodeURIComponent(ui.Welcome.selected_profile)
                + '/' + encodeURIComponent(cb)
            );
        }
    });

    $('#btn_welcome_about').click(
    function (event) {
        ui.DialogHelper.open(ui.AboutDlg);
    });
    return this;
},

load_profiles_info:
function load_profiles_info(profiles_info) {
    $('#profile_avator_list a').unbind('click');
    $('#profile_avator_list li').not('.new_profile_item').remove();

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
        ui.Welcome.selected_profile = profile_name;
        default_username = '';
        default_password = '';
        access_token = '';
        if (profile_name == 'default') {
            $('.service_tabs_btn').show();
            $('.service_tabs_page').not('#service_page_new').hide();
            $('#btn_welcome_prefs, #btn_welcome_delete_profile').hide();
            $('#profile_title').text('New Profile');
            $('.service_tabs_btn:first').click();
            $('#service_page_new').show();
        } else {
            var type = profile_name.split('@')[1];
            
            $('.service_tabs_btn').not('#btn_service_' + type).hide();
            $('#btn_service_' + type).show().addClass('selected');

            $('#service_page_' + type).show();
            $('.service_tabs_page').not('#service_page_' + type).hide();

            $('#profile_title').text(profile_name)
            
            $('#btn_welcome_prefs, #btn_welcome_delete_profile').show();

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

        hotot_action('system/select_protocol/'
            + encodeURIComponent(profile_name.split('@')[1]))
        hotot_action('system/select_profile/'
            + encodeURIComponent(profile_name));
        return false;
    });
     
    $('#profile_avator_list a:first').click();
},

authenticate_pass:
function authenticate_pass(result) {
    globals.myself = result;
    setTimeout(function () {
    $('#btn_my_profile').attr('style', 'background-image: url('+globals.myself.profile_image_url+');');
    }, 100);
    ui.Notification.set(_("Authentication OK!")).show();
    ui.DialogHelper.close(ui.PinDlg);
    ui.Welcome.hide();
    ui.Main.show();
    globals.layout.open('north');
    globals.layout.open('south');

    hotot_action('system/sign_in');    
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


