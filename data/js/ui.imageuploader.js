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
},

service_name: '',

me: null,

file: null,

init:
function init() {
    ui.ImageUploader.me = $('#imageuploader_dlg');
    $('#imageuploader_upload_btn').click(function () {
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
    });

    var all_service_buttons = ui.ImageUploader.me.find('.service');
    ui.ImageUploader.me.find('.service').click(function () {
        all_service_buttons.removeClass('selected');
        $(this).addClass('selected');
        ui.ImageUploader.service_name = $(this).attr('href').substring(1);
    });
    ui.ImageUploader.service_name = 
        ui.ImageUploader.me.find('.service.selected')
            .attr('href').substring(1);

    ui.ImageUploader.me.find('.dragarea').bind('dragover', function () {
        return false;    
    }).bind('dragend', function () {
        return false;
    }).bind('drop', function (ev) {
        ui.ImageUploader.file = ev.originalEvent.dataTransfer.files[0]; 
        var reader = new FileReader();
        reader.onload = function (e) {
            ui.ImageUploader.me.find('.preview')
                .css('background-image', 'url('+e.target.result+')');
        }
        reader.readAsDataURL(ui.ImageUploader.file);
        return false;
    });
},

upload:
function upload(file) {
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
    case 'lockerz.com' :
        params['isoauth'] = 'true';
        params['response_format'] = 'JSON';
        params['api_key'] = ui.ImageUploader.services[service_name].key;
    break;
    }

    toast.set('Uploading ... ').show();
    var reader = new FileReader();
    reader.onload = function (e) {
        var result = e.target.result;
        var ret = lib.network.encode_multipart_formdata(params,file, result);
        $.extend(headers, ret[0]);
        lib.network.do_request(
            'POST'
            , ui.ImageUploader.services[service_name].url
            , params 
            , headers
            , ret[1]
            , ui.ImageUploader.success
            , ui.ImageUploader.fail
            );
    }
    reader.readAsArrayBuffer(file);
},

success:
function success(result) {
    globals.imageuploader_dialog.close();
    toast.set('Uploading Successfully!').show();
    ui.StatusBox.open();
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
},

fail:
function fail(result) {
    ui.ImageUploader.file = null;
    toast.set('Failed!').show();
    ui.ImageUploader.me.find('.message').val('');
    ui.ImageUploader.me.find('.preview').css('background-image', 'none');
},

}
