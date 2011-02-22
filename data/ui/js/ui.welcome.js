if (typeof ui == 'undefined') var ui = {};
ui.Welcome = {

me: {},

id: '',

sign_opts: {
      'remember_password': false
    , 'default_username': ''
    , 'default_password': ''
},

profiles: [],

selected_service: 'twitter',

selected_profile: 'default',

btn_basic_auth_sign_in: null,

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

            $('.service_tabs_btn')
                .not(this).removeClass('selected');
            $(this).addClass('selected');
        }
    });
    $('.service_tabs_btn:first').click();

    ui.Welcome.btn_basic_auth_sign_in 
        = new widget.Button('#btn_basic_auth_sign_in');
    ui.Welcome.btn_basic_auth_sign_in.on_clicked = function (event) {
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
    };
    ui.Welcome.btn_basic_auth_sign_in.create();

    $('#chk_remember_password').click(
    function (event) {
        ui.Welcome.sign_opts.remember_password = $(this).attr('checked');
    });
    
    ui.Welcome.btn_oauth_sign_in 
        = new widget.Button('#btn_oauth_sign_in')
    ui.Welcome.btn_oauth_sign_in.on_clicked = function(event) {
        lib.twitterapi.use_oauth = true;
        ui.Notification.set(_("Begin to OAuth ...")).show();
        if (jsOAuth.access_token == ''
            || jsOAuth.access_token.constructor != Object) { 
        // access_token is not existed
        // then get a new one.
            jsOAuth.get_request_token(
            function (result) {
                if (result == '') {
                    ui.Notification
                        .set('Connection Error, Try later!').show();
                } else {
                    ui.PinDlg.set_auth_url(jsOAuth.get_auth_url());
                    ui.DialogHelper.open(ui.PinDlg);
                }
            }); 
        } else {
        // access_token is existed
        // then test it
        // console.out('[i]access_token: ' + jsOAuth.access_token);
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
    };
    ui.Welcome.btn_oauth_sign_in.set_attrs({
          'icon': 'imgs/ic16_twitter.png'
        , 'bg_color': '#c0fbfd'
        , 'fg_color': '#1b7aa3'
    })
    ui.Welcome.btn_oauth_sign_in.create();

    var btn_welcome_create_profile 
        = new widget.Button('#btn_welcome_create_profile');
    btn_welcome_create_profile.on_clicked = function (event) {
        var cb = "ui.Notification.set('New profile has been created!').show();";
        var prefix = $.trim($('#tbox_new_profile_name').val());
        if (prefix.length == 0 ) {
            ui.Notification.set(_("Please entry a profile prefix!")).show();
            return;
        }
        if (prefix.indexOf('@') != -1) {
            ui.Notification.set(_("Charactor `@` is not allow in profile prefix!")).show();
            return;
        }
        db.add_profile(prefix, ui.Welcome.selected_service,
        function () {
            ui.Notification.set('New profile has been created!').show();
        });
    };
    btn_welcome_create_profile.create();
    
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

    ui.Welcome.show();
    return this;
},

load_profiles_info:
function load_profiles_info() {
    $('#profile_avator_list a').unbind('click');
    $('#profile_avator_list li').not('.new_profile_item').remove();

    for (var name in conf.profiles) {
        var protocol = conf.profiles[name].protocol;
        var prefs = conf.profiles[name].preferences;
        $('#profile_avator_list').prepend(
            '<li><a title="'+name+'" href="'+name+'" class="'+protocol+'"></a></li>');
    }
    $('#profile_avator_list a').click(
    function (event) {
        var profile_name = $(this).attr('href');
        ui.Welcome.selected_profile = profile_name;
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
        }
        $('#tbox_basic_auth_username').val(
            conf.profiles[profile_name].preferences.default_username);
        $('#tbox_basic_auth_password').val(
            conf.profiles[profile_name].preferences.default_password);
        $('#profile_avator_list a').not(this).removeClass('selected');
        $(this).addClass('selected');

        conf.apply_prefs(profile_name);
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
    ui.Welcome.load_profiles_info();
    this.me.show();
    return this;
},

}


