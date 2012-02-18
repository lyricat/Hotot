if (typeof ui == 'undefined') var ui = {};
ui.ImageUploader = {
services : {
    'img.ly': {
          url: 'http://img.ly/api/2/upload.json'
    },
    'twitpic.com': {
          url: 'http://api.twitpic.com/2/upload.json'
        , key: 'de89b69c11e1ac0f874ec5266c5c4f46'
    },
    'lockerz.com': {
          url: 'http://api.plixi.com/api/upload.aspx'
        , key: 'a3beab3a-d1ae-46c0-a4ab-5ac73d8eb43a'
    },
    'twitter.com': {
          url: 'https://upload.twitter.com/1/update_with_media.json'
    }
},

MODE_PY: 0,

MODE_HTML5: 1,

mode: 1,

service_name: '',

me: null,

file: null,

filename: '',

init:
function init() {
    ui.ImageUploader.me = $('#imageuploader_dlg');
    $('#imageuploader_upload_btn').click(function () {
        if (ui.ImageUploader.mode == ui.ImageUploader.MODE_PY) {
            if (ui.ImageUploader.filename == '') {
                toast.set('Please select a photo.').show();
            } else {
                ui.ImageUploader.upload(ui.ImageUploader.filename);
            }
        } else {
            if (ui.ImageUploader.file == null) {
                var fileselector = ui.ImageUploader.me.find('.fileselector').get(0);
                if (fileselector.files.length == 0) {
                    toast.set('Please select a photo.').show();
                } else {
                    ui.ImageUploader.upload(fileselector.files[0]); 
                }
            } else {
                ui.ImageUploader.upload(ui.ImageUploader.file); 
            }
        }
    });

    ui.ImageUploader.me.find('.pyfileselector').click(function () {
        hotot_action('action/choose_file/ui.ImageUploader.pyload');
    });

    var all_service_buttons = ui.ImageUploader.me.find('.service');
    ui.ImageUploader.me.find('.service').click(function () {
        all_service_buttons.removeClass('selected');
        $(this).addClass('selected');
        ui.ImageUploader.service_name = $(this).attr('href').substring(1);
    });

    ui.ImageUploader.me.find('.dragarea').bind('dragover', function () {
        return false;    
    }).bind('dragend', function () {
        return false;
    }).bind('drop', function (ev) {
        ui.ImageUploader.file = ev.originalEvent.dataTransfer.files[0]; 
        if (! ui.FormChecker.test_file_image(ui.ImageUploader.file)) {
            toast.set(ui.FormChecker.ERR_STR_FILE_IS_NOT_IMAGE).show(3);
            return false;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            ui.ImageUploader.me.find('.preview')
                .css('background-image', 'url('+e.target.result+')');
        }
        reader.readAsDataURL(ui.ImageUploader.file);
        return false;
    });
},

pyload:
function pyload(filename) {
    ui.ImageUploader.me.find('.preview')
        .css('background-image', 'url("file://' + filename + '")');
    ui.ImageUploader.filename = filename;
    ui.ImageUploader.mode = ui.ImageUploader.MODE_PY;
},

pyupload:
function pyupload(filename) {
    if (filename == '' || filename == 'None') {
        toast.set('Please choose an image.').show();
        return;
    }

    var signed_params = jsOAuth.form_signed_params(
              'https://api.twitter.com/1/account/verify_credentials.json'
            , jsOAuth.access_token
            , 'GET'
            , {}
            , true);
    var auth_str = 'OAuth realm="http://api.twitter.com/"'
    + ', oauth_consumer_key="'+signed_params.oauth_consumer_key+'"'
    + ', oauth_signature_method="'+signed_params.oauth_signature_method+'"'
    + ', oauth_token="'+signed_params.oauth_token+'"'
    + ', oauth_timestamp="'+signed_params.oauth_timestamp+'"'
    + ', oauth_nonce="'+ signed_params.oauth_nonce +'"'
    + ', oauth_version="'+signed_params.oauth_version+'"'
    + ', oauth_signature="'
        + encodeURIComponent(signed_params.oauth_signature)+'"';

    var headers = {'X-Verify-Credentials-Authorization': auth_str
        , 'X-Auth-Service-Provider': 'https://api.twitter.com/1/account/verify_credentials.json'};
    var msg = ui.ImageUploader.me.find('.message').val();
    var service_name = ui.ImageUploader.service_name;
    var params = {'message': msg};
    switch (service_name) {
    case 'twitpic.com' :
        params['key'] = ui.ImageUploader.services[service_name].key;
    break;
    case 'plixi.com' :
        params['isoauth'] = 'true';
        params['response_format'] = 'JSON';
        params['api_key'] = ui.ImageUploader.services[service_name].key;
    break;
    }

    toast.set('Uploading ... ').show();
    lib.network.do_request(
        'POST'
        , ui.ImageUploader.services[service_name].url
        , params 
        , headers
        , [['media', ui.ImageUploader.filename]] 
        , ui.ImageUploader.success
        , ui.ImageUploader.fail
        );
},

upload:
function upload(file) {
    if (! ui.FormChecker.test_file_image(file)) {
        toast.set(ui.FormChecker.ERR_STR_FILE_IS_NOT_IMAGE).show(3);
        return false;
    }
    // form params
    var msg = ui.ImageUploader.me.find('.message').val();
    var service_name = ui.ImageUploader.service_name;
    var params = {'message': msg};
    switch (service_name) {
    case 'twitpic.com' :
        params['key'] = ui.ImageUploader.services[service_name].key;
    break;
    case 'lockerz.com' :
        params['isoauth'] = 'true';
        params['response_format'] = 'JSON';
        params['api_key'] = ui.ImageUploader.services[service_name].key;
    break;
    }

    toast.set('Uploading ... ').show();
    ui.ImageUploader.upload_image(
          ui.ImageUploader.services[service_name].url
        , params
        , file
        , ui.ImageUploader.success
        , ui.ImageUploader.fail);
},

upload_image:
function upload_image(url, params, file, success, fail) {
    if (ui.ImageUploader.service_name === 'twitter.com') {
        ui.ImageUploader.upload_image_official(params, file, success, fail);
    } else {
        ui.ImageUploader.upload_image_oauth_echo(url, params, file, success, fail);
    }
},

upload_image_official:
function upload_image_official(params, file, success, fail) {
    if (ui.ImageUploader.mode == ui.ImageUploader.MODE_HTML5) {
        var reader = new FileReader();
        reader.onload = function (e) {
            if (params['message'].length === 0) {
                params['message'] = 'I have uploaded a photo.'
            }
            lib.twitterapi.update_with_media(params['message'], 
                null, file, e.target.result, success, fail);
        }
        reader.readAsArrayBuffer(file);
    } else {
        lib.twitterapi.update_with_media_filename(params['message'],
            null, file, success, fail);
    }
},

upload_image_oauth_echo:
function upload_image_oauth_echo(url, params, file, success, fail) {
    var signed_params = jsOAuth.form_signed_params(
              'https://api.twitter.com/1/account/verify_credentials.json'
            , jsOAuth.access_token
            , 'GET'
            , {}
            , true);
    var auth_str = 'OAuth realm="http://api.twitter.com/"'
    + ', oauth_consumer_key="'+signed_params.oauth_consumer_key+'"'
    + ', oauth_signature_method="'+signed_params.oauth_signature_method+'"'
    + ', oauth_token="'+signed_params.oauth_token+'"'
    + ', oauth_timestamp="'+signed_params.oauth_timestamp+'"'
    + ', oauth_nonce="'+ signed_params.oauth_nonce +'"'
    + ', oauth_version="'+signed_params.oauth_version+'"'
    + ', oauth_signature="'
        + encodeURIComponent(signed_params.oauth_signature)+'"';

    var headers = {'X-Verify-Credentials-Authorization': auth_str
        , 'X-Auth-Service-Provider': 'https://api.twitter.com/1/account/verify_credentials.json'};

    if (ui.ImageUploader.mode == ui.ImageUploader.MODE_HTML5) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var result = e.target.result;
            var ret = lib.network.encode_multipart_formdata(
                params, file, 'media', result);
            $.extend(headers, ret[0]);
            lib.network.do_request(
                'POST'
                , url
                , params 
                , headers
                , ret[1]
                , success
                , fail);
        }
        reader.readAsArrayBuffer(file);
    } else {
        lib.network.do_request(
            'POST'
            , url
            , params 
            , headers
            , [['media', ui.ImageUploader.filename]] 
            , ui.ImageUploader.success
            , ui.ImageUploader.fail
            );
    }
},

success:
function success(result) {
    globals.imageuploader_dialog.close();
    toast.set('Uploading Successfully!').show();
    if (ui.ImageUploader.service_name == 'twitter.com') {
        ui.Main.add_tweets(ui.Main.views['home'], [result], false, true);
    } else {
        ui.StatusBox.open();
        var url = ''; var text = '';
        switch (ui.ImageUploader.service_name) {
        case 'lockerz.com':
            url = result.MediaUrl;
            text = ui.ImageUploader.me.find('.message').val();
        break;
        default:
            url = result.url;
            text = result.text;
        break;
        }
        ui.StatusBox.append_status_text(text + ' '+ url);
        ui.ImageUploader.file = null;
        ui.ImageUploader.me.find('.message').val('');
        ui.ImageUploader.me.find('.preview').css('background-image', 'none');
    }
},

fail:
function fail(result) {
    ui.ImageUploader.file = null;
    toast.set('Failed!').show();
    ui.ImageUploader.me.find('.message').val('');
    ui.ImageUploader.me.find('.preview').css('background-image', 'none');
},

show:
function show() {
    ui.ImageUploader.me.find('.service').removeClass('selected');
    ui.ImageUploader.me.find('.service[href="#'
        + ui.ImageUploader.service_name 
        + '"]').addClass('selected');
    if (util.is_native_platform()) {
        ui.ImageUploader.me.find('.pyfileselector').show();
        ui.ImageUploader.me.find('.fileselector').hide();
    } else {
        ui.ImageUploader.me.find('.pyfileselector').hide();
        ui.ImageUploader.me.find('.fileselector').show();
    }
    globals.imageuploader_dialog.open();
},

hide:
function hide() {

}

}
