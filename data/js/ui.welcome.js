if (typeof ui == 'undefined') var ui = {};
ui.Welcome = {

me: {},

id: '',

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
        globals.twitterClient.username 
            = $('#tbox_basic_auth_username').attr('value');
        globals.twitterClient.password 
            = $('#tbox_basic_auth_password').attr('value');
        globals.twitterClient.use_oauth 
            = false;
        var cur_profile = conf.get_current_profile();
        cur_profile.preferences.remember_password
            = $('#chk_remember_password').attr('checked'); 
        cur_profile.preferences.default_username
            = globals.twitterClient.username; 
        toast.set(_('sign_in_dots')).show();
        if (cur_profile.preferences.remember_password) {
            cur_profile.preferences.default_password
                = globals.twitterClient.password;
        } else {
            cur_profile.preferences.default_password = '';
        }
        conf.save_prefs(conf.current_name);

        // verify ...
        var old_label = ui.Welcome.btn_basic_auth_sign_in.get_label();
        ui.Welcome.btn_basic_auth_sign_in.set_label(_('sign_in_dots'));
        ui.Welcome.btn_basic_auth_sign_in.set_sensitive(false);

        globals.twitterClient.verify(
        function (result) {
            if (result.screen_name) {
                ui.Welcome.authenticate_pass(result);
            } else if (result == '') {
                ui.ErrorDlg.alert(
                      _('oops_a_network_error_occurs')
                    , _('network_error_please_try_later'), 'None');
            } else {
                ui.ErrorDlg.alert(
                      _('oops_an_api_error_occurs')
                    , _('cannot_authenticate_you_please_check_your_username_or_password_and_api_base')
                    , result.toString());
            }
            ui.Welcome.btn_basic_auth_sign_in.set_label(old_label);
            ui.Welcome.btn_basic_auth_sign_in.set_sensitive(true);
        },
        function (xhr, textStatus, errorThrown) {
            ui.Welcome.btn_basic_auth_sign_in.set_label(old_label);
            ui.Welcome.btn_basic_auth_sign_in.set_sensitive(true);
        });
    };
    ui.Welcome.btn_basic_auth_sign_in.create();

    $('#chk_remember_password').click(
    function (event) {
        var cur_profile = conf.get_current_profile();
        cur_profile.preferences.remember_password = $(this).attr('checked');
    });
    
    ui.Welcome.btn_oauth_sign_in 
        = new widget.Button('#btn_oauth_sign_in')
    ui.Welcome.btn_oauth_sign_in.on_clicked = function(event) {
        globals.twitterClient.use_oauth = true;
        toast.set(_('sign_in_dots')).show();

        var old_label = ui.Welcome.btn_oauth_sign_in.get_label();
        ui.Welcome.btn_oauth_sign_in.set_label(_('sign_in_dots'));
        ui.Welcome.btn_oauth_sign_in.set_sensitive(false);

        if (jsOAuth.access_token == ''
            || jsOAuth.access_token.constructor != Object) { 
        // access_token is not existed
        // then get a new one.
            jsOAuth.get_request_token(
            function (result) {
                if (result == '') {
                    ui.ErrorDlg.alert(
                        _('oops_a_network_error_occurs')
                      , _('network_error_please_try_later'), '');
                } else {
                    ui.PinDlg.set_auth_url(jsOAuth.get_auth_url());
                    globals.oauth_dialog.open();
                }
            }); 
        } else {
        // access_token is existed
        // then test it
            globals.twitterClient.verify(
            function (result) { 
            // access_token is valid
                if (result.screen_name) {
                    ui.Welcome.authenticate_pass(result);
                } else if (result == '') {
                    ui.ErrorDlg.alert(
                          _('oops_a_network_error_occurs')
                        , _('network_error_please_try_later'), '');
                } else {
                    ui.ErrorDlg.alert(
                          _('oops_an_api_error_occurs')
                        , _('cannot_authenticate_you_please_check_your_username_or_password_and_api_base')
                        , result);
                }
                ui.Welcome.btn_oauth_sign_in.set_label(old_label);
                ui.Welcome.btn_oauth_sign_in.set_sensitive(true);
            }, 
            function (xhr, textStatus, errorThrown) {
                ui.Welcome.btn_oauth_sign_in.set_label(old_label);
                ui.Welcome.btn_oauth_sign_in.set_sensitive(true);
            });
        }
    };
    ui.Welcome.btn_oauth_sign_in.create();

    var btn_welcome_create_profile 
        = new widget.Button('#btn_welcome_create_profile');
    btn_welcome_create_profile.on_clicked = function (event) {
        var prefix = $.trim($('#tbox_new_profile_name').val());
        if (prefix.length == 0 ) {
            toast.set(_('please_entry_a_profile_prefix')).show();
            return;
        }
        if (prefix.indexOf('@') != -1) {
            toast.set(_('charactor_at_is_not_allow_in_profile_prefix'))
                .show();
            return;
        }
        db.add_profile(prefix, ui.Welcome.selected_service,
        function (result) {
            if (result != true) {
                toast.set(_('this_profile_may_has_already_exists')).show();
            } else {
                toast.set(_('new_profile_has_been_created')).show();
                conf.reload(function () {
                    ui.Welcome.load_profiles_info();
                    $('#profile_avatar_list a[href="'+prefix+'@'+ui.Welcome.selected_service+'"]').click();
                });
            }
        });
    };
    btn_welcome_create_profile.create();
    
    $('#btn_welcome_prefs').click(
    function (event) {
        ui.PrefsDlg.load_settings(conf.settings);
        ui.PrefsDlg.load_prefs();
        globals.prefs_dialog.open();
    });
        
    $('#btn_welcome_exts').click(
    function (event) {
        $('#profile_avatar_list a.selected').click();
        ui.ExtsDlg.load_ext_list();
        globals.exts_dialog.open();
    });
    
    $('#clean_token_btn').click(
    function (event) {
        if (confirm('The operation will erases the access token of this profile.\n Are you sure you want to continue?!\n')) 
        {
            conf.clean_token(conf.current_name);
            $('#profile_avatar_list a.selected').click();
        }
    });

    $('#btn_welcome_delete_profile').click(
    function (event) {
        if (confirm('The operation will erases all data of this profile.\n Are you sure you want to continue?!\n')) 
        {
            db.remove_profile(ui.Welcome.selected_profile, 
            function (result) {
                if (result) {
                    delete conf.profiles[conf.current_name];
                    ui.Welcome.load_profiles_info();
                    $('#profile_avatar_list a:first').click();
                }        
            });
        }
    });

    $('#btn_welcome_about').click(
    function (event) {
        globals.about_dialog.open();
    });
    return this;
},

load_profiles_info:
function load_profiles_info() {
    $('#profile_avatar_list a').unbind('click');
    $('#profile_avatar_list li').not('.new_profile_item').remove();

    for (var name in conf.profiles) {
        var protocol = conf.profiles[name].protocol;
        var prefs = conf.profiles[name].preferences;
        $('#profile_avatar_list').prepend(
            '<li><a title="'+name+'" href="'+name+'" class="'+protocol+'"></a></li>');
    }
    $('#profile_avatar_list a').click(
    function (event) {
        var profile_name = $(this).attr('href');
        ui.Welcome.selected_profile = profile_name;
        if (profile_name == 'default') {
            $('.service_tabs_btn').show();
            $('.service_tabs_page').not('#service_page_new').hide();
            $('#btn_welcome_prefs, #btn_welcome_delete_profile, #btn_welcome_exts').hide();
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
            $('#btn_welcome_prefs, #btn_welcome_delete_profile, #btn_welcome_exts').show();
            $('#tbox_basic_auth_username').val(
                conf.profiles[profile_name].preferences.default_username);
            $('#tbox_basic_auth_password').val(
                conf.profiles[profile_name].preferences.default_password);
            $('#chk_remember_password').val(
                conf.profiles[profile_name].preferences.remember_password);
            $('#profile_avatar_list a').not(this).removeClass('selected');
            $(this).addClass('selected');
            // apply preferences
            conf.apply_prefs(profile_name);
            if (jsOAuth.access_token == ''
                || jsOAuth.access_token.constructor != Object) {
                $('#access_token_status_hint').css('visibility', 'visible');
                $('#btn_oauth_sign_in').text(_('gain_access_token'));
            } else {
                $('#access_token_status_hint').css('visibility', 'hidden');
                $('#btn_oauth_sign_in').text(_('sign_in_with_twitter'));
            }
        }
        return false;
    });
},

authenticate_pass:
function authenticate_pass(result) {
    globals.myself = result;
    setTimeout(function () {
        $('#btn_my_profile').attr('style', 'background-image: url('+globals.myself.profile_image_url+');');
        }, 100);
    toast.set(_('authentication_ok')).show();
    conf.load_prefs(conf.current_name, function() {
        ui.Welcome.hide();
        ui.Slider.resume_state();
        ui.Main.show();
        globals.layout.open('north');
        kismet.load();
        document.title = _('hotot') + ' | ' + conf.current_name;
        hotot_action('system/sign_in');    
        setTimeout(function () {
            ui.Slider.slide_to('home');
        }, 1000);
    });
},

load_daily_hint:
function load_daily_hint() {
    if (Date.now() % 3 == 0) {
        var r = parseInt(Math.random() * daily_hints.length);
        $('#daily_hint').empty().append($('<strong/>').text(_('whisper') + ': ')).append(document.createTextNode(daily_hints[r]));
    }
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
}

}


