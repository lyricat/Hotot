if (typeof ui == 'undefined') var ui = {};
ui.ListAttrDlg = {

id: '',

is_change: false,

init:
function init () {
    ui.ListAttrDlg.id = '#list_attr_dlg';

    var btn_list_attr_update =new widget.Button('#btn_list_attr_update');
    btn_list_attr_update.on_clicked = function (event) {
        var err = ui.FormChecker.check_config_error(
            ui.ListAttrDlg.id + ' input');
        if ( err.count != 0 ) {
            toast.set("There are "+err.count+" errors in your change. Abort...").show();
            widget.DialogManager.alert(
                  'Oops, some mistakes in your information.'
                , "<p>There are something wrong in what your changes.<br/>Please check errors in the options below:<br/> - "
                + err.error_values.join('<br/> - ') + '</p>');
        } else {
            if (ui.ListAttrDlg.is_change) {
                ui.ListAttrDlg.update();
            } else {
                globals.list_attr_dialog.close();
            }
        }
    };
    btn_list_attr_update.create();

    $('#list_attr_slug').keyup(
    function(event){
        ui.ListAttrDlg.limit_test(this, 20);
        return false;
    });
    $('#list_attr_desc').keyup(
    function(event){
        ui.ListAttrDlg.limit_test(this, 100);
        return false;
    });
},

limit_test:
function limit_test(widget, limit) {
    ui.ListAttrDlg.is_change = true;
    ui.FormChecker.test_text_len_limit(widget, limit);
},

update:
function update() {
    var slug = $('#list_attr_slug').val();
    var description = $('#list_attr_desc').val();
    var mode = $('input[name="list_attr_privacy"]').val();

    if (ui.ListAttrDlg.create_new) {
        toast.set("Create List ...").show();
        globals.twitterClient.create_list(slug, description, mode,
            function (result) {
                toast.set("Create List successfully!").show();
                globals.list_attr_dialog.close();
            });
    } else {
        toast.set("Update List ...").show();
        globals.twitterClient.update_list(ui.ListAttrDlg.owner, slug
            , description, mode,
            function (result) {
                toast.set("Update List successfully!").show();
                globals.list_attr_dialog.close();
            });
    }
},

load:
function load(screen_name, slug, desc, mode) {
    if (slug == '') {
        ui.ListAttrDlg.create_new = true;
    } else {
        ui.ListAttrDlg.create_new = false;
    }
    ui.ListAttrDlg.owner = screen_name;
    $('#list_attr_slug').val(slug);
    $('#list_attr_desc').val(desc);
    if (mode == 'public') {
        $('#list_attr_privacy_public').attr('checked', true);
    } else {
        $('#list_attr_privacy_private').attr('checked', true);
    }
},

request:
function request() {

}

}
    
