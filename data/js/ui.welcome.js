if (typeof ui == 'undefined') var ui = {};
ui.Welcome = {

me: {},

id: '',

profiles: [],

selected_profile: 'default',

init:
function init () {
    ui.Welcome.id = '#welcome_page';
    ui.Welcome.me = $('#welcome_page');

    // bind events

    $('#tbox_basic_auth_password').blur(
    function (event) {
        var cur_profile = conf.get_current_profile();
        if ($(this).val().length == 0) {
            cur_profile.preferences.remember_password = false;
        } else {
            cur_profile.preferences.remember_password = true;
        }
    });

    $('#sign_in_block .service_chooser a').click(function () {
        $('#sign_in_block .service_chooser a').removeClass('selected');
        $(this).addClass('selected');
    });

    ui.Welcome.go = $('#sign_in_block .go');
    ui.Welcome.go.click(function () {
        if (ui.Welcome.selected_profile == 'default') {
            ui.Welcome.create_profile();
        } else {
            if (ui.Welcome.selected_profile.indexOf('@twitter') != -1){
                ui.Welcome.oauth_sign_in();
            } else { // identica
                ui.Welcome.basic_auth_sign_in();
            }
        }
    });
    
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
                    if ($('#profile_avatar_list a').length == 1) {
                        $('#profile_avatar_list a:first').click();
                    } else {
                        $('#profile_avatar_list a:eq(1)').click();
                    }
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

create_profile:
function create_profile () {
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
    var service = $('#sign_in_block .service_chooser a.selected').attr('href').substring(1);
    db.add_profile(prefix, service,
    function (result) {
        if (result != true) {
            toast.set(_('this_profile_may_has_already_exists')).show();
        } else {
            toast.set(_('new_profile_has_been_created')).show();
            conf.reload(function () {
                ui.Welcome.load_profiles_info();
                $('#profile_avatar_list a[href="' + prefix + '@' + service + '"]').click();
            });
        }
    });
},

oauth_sign_in:
function oauth_sign_in(event) {
    globals.twitterClient.use_oauth = true;
    toast.set(_('sign_in_dots')).show();

    ui.Welcome.go.addClass('loading');

    if (globals.twitterClient.oauth.access_token == ''
        || globals.twitterClient.oauth.access_token.constructor != Object) { 
    // access_token is not existed
    // then get a new one.
        globals.twitterClient.oauth.get_request_token(
        function (result) {
            if (result == '') {
                ui.ErrorDlg.alert(
                    _('oops_a_network_error_occurs')
                  , _('network_error_please_try_later'), '');
            } else {
                ui.PinDlg.set_auth_url(globals.twitterClient.oauth.get_auth_url());
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
        }, 
        function (xhr, textStatus, errorThrown) {
            ui.Welcome.go.removeClass('loading');
        });
    }
},

basic_auth_sign_in:
function basic_auth_sign_in(event) {
    globals.twitterClient.username 
        = $('#tbox_basic_auth_username').attr('value');
    globals.twitterClient.password 
        = $('#tbox_basic_auth_password').attr('value');
    globals.twitterClient.use_oauth 
        = false;
    var cur_profile = conf.get_current_profile();
    cur_profile.preferences.remember_password = true;
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
    ui.Welcome.go.addClass('loading');

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
    },
    function (xhr, textStatus, errorThrown) {
        ui.Welcome.go.removeClass('loading');
    });
},

load_profiles_info:
function load_profiles_info() {
    $('#profile_avatar_list a').unbind('click');
    $('#profile_avatar_list li').not('.new_profile_item').remove();

    var profiles = [];
    for (var name in conf.profiles) {
        profiles.push([name, conf.profiles[name]]);
    }
    profiles.sort(function (a, b) {return b[1].order - a[1].order;})
    for (var i = 0; i < profiles.length; i += 1) {
        var name = profiles[i][0];
        var protocol = profiles[i][1].protocol;
        var prefs = profiles[i][1].preferences;
        var str = '<li><a title="'+ name
            + '" href="' + name
            + '" class="' + protocol
            + '" idx="' + (i + 1) + '"';
        if (prefs.profile_avatar.length != 0) {
            str += ' style="background-image: url('
                + prefs.profile_avatar + ')"></a></li>';
        } else {
            str += '></a></li>';
        }
        $('#profile_avatar_list').append(str);
    }
    $('#profile_avatar_list a').click(
    function (event) {
        var profile_name = $(this).attr('href');
        ui.Welcome.selected_profile = profile_name;

        var type = 'default';
        if (profile_name != 'default') {
            type = profile_name.split('@')[1];
        }
        var width_per_page = {'default': 480, 'twitter': 360, 'identica': 460};
        $('#sign_in_block .inner').stop().animate({'width': width_per_page[type]}, 200);
        if (profile_name == 'default') {
            $('#btn_welcome_prefs, #btn_welcome_delete_profile, #btn_welcome_exts').hide();
            $('#sign_in_block .profile_title').text('New Profile');
            $('.service_tabs_page').hide();
            $("#service_page_new").show();
        } else {
            $('#clean_token_btn').css('visibility', 'visibility');
            $("#service_page_new").hide();
            $('#service_page_' + type).show();
            $('.service_tabs_page').not('#service_page_' + type).hide();
            $('#sign_in_block .profile_title').text(profile_name)
            $('#btn_welcome_prefs, #btn_welcome_delete_profile, #btn_welcome_exts').show();
            $('#tbox_basic_auth_username').val(
                conf.profiles[profile_name].preferences.default_username);
            $('#tbox_basic_auth_password').val(
                conf.profiles[profile_name].preferences.default_password);
            // apply preferences
            conf.apply_prefs(profile_name, false);
            if (globals.twitterClient.oauth.access_token == ''
                || globals.twitterClient.oauth.access_token.constructor != Object) {
                $('#access_token_status_hint').css('visibility', 'visible');
                $('#clean_token_btn').css('visibility', 'hidden');
            } else {
                $('#access_token_status_hint').css('visibility', 'hidden');
                $('#clean_token_btn').css('visibility', 'visibility');
            }
        }
        $('#profile_avatar_list a').not(this).removeClass('selected');
        $('#profile_avatar_list li.selected').removeClass('selected');
        $(this).addClass('selected');
        $(this).parent().addClass('selected');

        var offset = parseInt($(this).attr('idx')) * (74 + 7);
        $('#profile_avatar_list').stop().animate(
            {'margin-top': '-' + (offset + 165) + 'px'}, 300);
        return false;
    });
},

authenticate_pass:
function authenticate_pass(result) {
    globals.myself = result;
    // apply preferences
    conf.get_current_profile().preferences.profile_avatar
        = globals.myself.profile_image_url;
    conf.apply_prefs(ui.Welcome.selected_profile, true);
    conf.get_current_profile().order = Date.now();
    conf.save_prefs(conf.current_name);

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
        ui.Welcome.go.removeClass('loading');
        setTimeout(function () {
            ui.Slider.slide_to('home');
        }, 1000);
    });
},

load_daily_hint:
function load_daily_hint() {
    if (Date.now() % 4 != 0) {
        var r = parseInt(Math.random() * daily_hints.length);
        $('#daily_hint').removeAttr('data-i18n-text');
        $('#daily_hint').empty().append($('<strong/>').text(_('whisper') + ': ')).append(document.createTextNode(daily_hints[r]));
    }
},

load_background:
function load_background(url) {
    if (url != '') {
        $('#welcome_page').css({'background-image': 'url("'+url+'")', 'background-size': 'cover'});
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


