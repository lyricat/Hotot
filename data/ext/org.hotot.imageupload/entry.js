ext = ext || {};
ext.HototImageUpload = {
id: 'org.hotot.imageupload',

name: 'Hotot Image Uploader',

description: 'To upload picture to social photo sharing services.',

version: '1.0',

author: 'Shellex Wai',

url: 'http://hotot.org',

icon: 'icon.png',

select_filename: '',

services : {
    'img.ly': {
          url: 'http://img.ly/api/2/upload.json'
    },
    'twitpic.com': {
          url: 'http://api.twitpic.com/2/upload.json'
        , key: 'de89b69c11e1ac0f874ec5266c5c4f46'
    },
    'plixi.com': {
          url: 'http://api.plixi.com/api/upload.aspx'
        , key: 'a3beab3a-d1ae-46c0-a4ab-5ac73d8eb43a'
    },
},

on_ext_btn_clicked:
function on_btn_upload_clicked(event) {
    if (lib.twitterapi.use_oauth) {
        title = 'Upload image to ...'
        content = '<p>\
            <label>Upload to </label>\
            <select id="ext_hotot_upload_image_services" title="Choose a service." style="width: 120px" class="dark">\
                <option value="img.ly" default="1">img.ly</option>\
                <option value="twitpic.com">twitpic.com</option>\
                <option value="plixi.com">plixi.com</option>\
            </select>\
            <a id="ext_btn_hotot_upload_image_brow" href="javascript:void(0);" class="button dark" onclick="ext.HototImageUpload.on_btn_brow_clicked();">Choose an image\
            <span class="placeholder"></span>\
            </a></p><p>\
            <div style="float:left;height:100px;width:100px;">\
            <label >Preview:<label><br/>\
            <img id="ext_hotot_upload_image_prev" style="max-height:100px;max-width:100px;"/>\
            </div>\
            <div style="margin-left:110px;">\
            <label >Add a message<label><br/>\
            <textarea id="ext_hotot_upload_image_message"class="dark"></textarea>\
            </div></p>';

        ui.CommonDlg.reset(); 
        ui.CommonDlg.set_title('Upload Image');
        ui.CommonDlg.set_content(content);
        ui.CommonDlg.add_button('ext_btn_hotot_upload_image_upload'
            , 'Upload', 'Click to upload.'
            , ext.HototImageUpload.on_btn_upload_clicked);
        ui.DialogHelper.open(ui.CommonDlg);
    } else {
        title = 'Error !'
        content = '<p>Basic Auth is not supported, Please use OAuth to upload images.</p>'
        ui.MessageDlg.set_text(title, content); 
        ui.DialogHelper.open(ui.MessageDlg);
    }
},

on_btn_upload_clicked:
function on_btn_upload_clicked(event) {
    if (ext.HototImageUpload.select_filename == ''
        || ext.HototImageUpload.select_filename == 'None') {
        ui.Notification.set('Please choose an image.').show();
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
    var msg = $('#ext_hotot_upload_image_message').attr('value');
    var service_name = $('#ext_hotot_upload_image_services').attr('value');
    ext.HototImageUpload.sel_service_name = service_name;
    var params = {'message': msg};
    switch (service_name) {
    case 'twitpic.com' :
        params['key'] = ext.HototImageUpload.services[service_name].key;
    break;
    case 'plixi.com' :
        params['isoauth'] = 'true';
        params['response_format'] = 'JSON';
        params['api_key'] = ext.HototImageUpload.services[service_name].key;
    break;
    }

    ui.Notification.set('Uploading ... ').show();
    lib.network.do_request(
        'POST'
        , ext.HototImageUpload.services[service_name].url
        , params 
        , headers
        , [['media', ext.HototImageUpload.select_filename]] 
        , ext.HototImageUpload.success
        , ext.HototImageUpload.fail
        );
},

on_btn_brow_clicked:
function on_btn_brow_clicked(event) {
    hotot_action('action/choose_file/ext.HototImageUpload.select_finish');
},

select_finish:
function select_finish(filename) {
    $('#ext_hotot_upload_image_prev').attr('src', 'file://'+filename);
    ext.HototImageUpload.select_filename = filename;
},

success:
function success(result) {
    ui.DialogHelper.close(ui.CommonDlg);
    
    var service_name = $('#ext_hotot_upload_image_services').attr('value');
    ui.Notification.set('Uploading Successfully!').show();
    ui.StatusBox.open();
    switch (ext.HototImageUpload.sel_service_name) {
    case 'plixi.com':
        url = result.MediaUrl;
        text = $('#ext_hotot_upload_image_message').attr('value');
    break;
    default:
        url = result.url;
        text = result.text;
    break;
    }
    ui.StatusBox.append_status_text(text + ' '+ url);
    ext.HototImageUpload.select_filename = '';
},

fail:
function fail(result) {
    ui.MessageDlg.set_text('Upload Fail!', '<p>'+result+'</p>');
    ui.DialogHelper.open(ui.MessageDlg);
    ext.HototImageUpload.select_filename = '';
},

load:
function load() {
    ext.add_exts_menuitem('ext_btn_hotot_upload_image'
        , ext.HototImageUpload.id+'/ic16_upload.png'
        , 'Upload Images ...'
        , ext.HototImageUpload.on_ext_btn_clicked);
},

unload:
function unload() {
    ext.remove_exts_menuitem('ext_btn_hotot_upload_image');
},

}
