if (typeof ui == 'undefined') var ui = {};
ui.ProfileDlg = {

id: '',

is_change: false,

init:
function init () {
    ui.ProfileDlg.id = '#profile_dlg';

    var btn_profile_update = new widget.Button('#btn_profile_update');
    btn_profile_update.on_clicked = function (event) {
        var err = ui.FormChecker.check_config_error(
            ui.ProfileDlg.id + ' input');
        if ( err.count != 0 ) {
            toast.set("There are "+err.count+" errors in your change. Abort...").show();
            widget.DialogManager.alert(
                  'Oops, some mistakes in your information.'
                , "<p>There are something wrong in what your changes.<br/>Please check errors in the options below:<br/> - "
                + err.error_values.join('<br/> - ') + '</p>');
        } else {
            if (ui.ProfileDlg.is_change) {
                ui.ProfileDlg.update_profile();
            } else {
                globals.profile_dialog.close();
            }
        }
        return false;
    };
    btn_profile_update.create();

    $('#btn_change_profile_avatar').change(function () {
        var file = $('#btn_change_profile_avatar').get(0).files[0];
        if (! ui.FormChecker.test_file_size_bound(file, 700 * 1000)) {
            toast.set('Your picture must be less than 700 kb in size.').show(3);
            return false;
        } 
        if (! ui.FormChecker.test_file_image(file)) {
            toast.set(ui.FormChecker.ERR_STR_FILE_IS_NOT_IMAGE).show(3);
            return false;
        }
        ui.ProfileDlg.update_avatar(file);
        toast.set('Uploading new avatar ...').show(3);
        return false;
    });

    $('#tbox_profile_name').keyup(
    function(event){
        ui.ProfileDlg.limit_test(this, 20);
        return false;
    });
    $('#tbox_profile_location').keyup(
    function(event){
        ui.ProfileDlg.limit_test(this, 100);
        return false;
    });
    $('#tbox_profile_website').keyup(
    function(event){
        ui.ProfileDlg.limit_test(this, 30);
        return false;
    });
    $('#tbox_profile_bio').keyup(
    function(event){
        ui.ProfileDlg.limit_test(this, 160);
        return false;
    });
},

limit_test:
function limit_test(widget, limit) {
    ui.ProfileDlg.is_change = true;
    ui.FormChecker.test_text_len_limit(widget, limit);
},

update_profile:
function update_profile() {
    var name = $('#tbox_profile_name').val();
    var website = $('#tbox_profile_website').val();
    var location = $('#tbox_profile_location').val();
    var bio = $('#tbox_profile_bio').val();

    toast.set("Update profile ...").show();
    globals.twitterClient.update_profile(name, website, location, bio,
    function (result) {
        toast.set("Update profile successfully!").show();
        globals.myself = result;
        globals.profile_dialog.close();
    });
},

request_profile:
function request_profile() {
    $('#profile_avatar').css('background-image', 'url('+globals.twitterClient.get_user_profile_image(
            globals.myself.screen_name, 'bigger')+')');
    $('#tbox_profile_name').val(globals.myself.name);
    $('#tbox_profile_website').val(globals.myself.url);
    $('#tbox_profile_location').val(globals.myself.location);
    $('#tbox_profile_bio').val(globals.myself.description);
},

update_avatar:
function update_avatar(file) {
    var reader = new FileReader();
    // if I send base64 encoded image, it'll tell me the image is too large... fuck you, Twitter!
    reader.onload = function (e) {
        var result = e.target.result;
        //result = result.substring(result.indexOf('base64,')+7);
        globals.twitterClient.update_profile_image(file, result,
        function (ret){
            globals.myself = ret;
            var reader_new = new FileReader();
            reader_new.onload = function (e) {
                $('#profile_avatar').css('background-image', 
                    'url('+e.target.result+')');
            }
            reader_new.readAsDataURL(file);
            toast.set('Uploading new avatar ... Done!').show(3);
        });
    }
    reader.readAsArrayBuffer(file);
    //reader.readAsDataURL(file);
}

}
    
