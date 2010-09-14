ext = ext || {};
ext.HototImageUpload = {
id: 'org.hotot.imageupload',

name: 'Hotot Image Uploader',

description: 'To upload picture to social photo sharing services img.ly.',

version: '1.0',

author: 'Shellex Wai',

url: 'http://hotot.org',

icon: 'icon.png',

select_filename: '',

on_ext_btn_clicked:
function on_btn_upload_clicked(event) {
    if (lib.twitterapi.use_oauth) {
        title = 'Upload image to ...'
        content = '<p>\
            <a id="ext_btn_hotot_upload_image_brow" href="javascript:void(0);" class="button" onclick="ext.HototImageUpload.on_btn_brow_clicked();">Choose an image</a><br/>\
            <span id="ext_hotot_upload_image_path"></span><br/>\
            <label>Add a message<label><br/>\
            <textarea id="ext_hotot_upload_image_message"></textarea>\
            </p>\
            <p><a id="ext_btn_hotot_upload_image_upload" href="javascript:void(0);" class="button" onclick="ext.HototImageUpload.on_btn_upload_clicked();">Upload</a><br/></p>';
    } else {
        title = 'Error !'
        content = '<p>Basic Auth is not supported, Please use OAuth to upload images.</p>'
    }
    ui.MessageDlg.set_text(title, content); 
    ui.DialogHelper.open(ui.MessageDlg);
},

on_btn_upload_clicked:
function on_btn_upload_clicked(event) {
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

    headers = {'X-Verify-Credentials-Authorization': auth_str
        , 'X-Auth-Service-Provider': 'https://api.twitter.com/1/account/verify_credentials.json'};
    msg = $('#ext_hotot_upload_image_message').attr('value');
    
    ui.Notification.set('Uploading ... ').show();
    lib.twitterapi.do_requset(
        'POST'
        , 'http://img.ly/api/2/upload.json' 
        , {'message': msg } 
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
    $('#ext_hotot_upload_image_path').text(filename);
    ext.HototImageUpload.select_filename = filename;
},

success:
function success(result) {
    ui.DialogHelper.close(ui.MessageDlg);
    
    ui.Notification.set('Uploading Successfully!').show();
    ui.StatusBox.open();
    ui.StatusBox.append_status_text(result.text + ' '+ result.url);
},

fail:
function fail(result) {
    ui.MessageDlg.set_text('Upload Fail!', '<p>'+result+'</p>');
    ui.DialogHelper.open(ui.MessageDlg);
},

load:
function load() {
    ext.add_toolbar_button('ext_btn_hotot_upload_image'
        , '../ext/'+ext.HototImageUpload.id+'/ic24_upload.png'
        , 'Upload Images ...'
        , ext.HototImageUpload.on_ext_btn_clicked);
},

unload:
function unload() {
    ext.remove_toolbar_button('ext_btn_hotot_upload_image');
},

}
