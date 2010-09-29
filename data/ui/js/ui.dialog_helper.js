if (typeof ui == 'undefined') var ui = {};
ui.DialogHelper= {

mask: '#dialog_mask',

dialogs: [],

z_index_base: 1111111,

init:
function init() {
    ui.DialogHelper.dialogs = [
      ui.MessageDlg
    , ui.ProfileDlg
    , ui.PrefsDlg
    , ui.PinDlg
    , ui.AboutDlg
    , ui.ExtsDlg
    , ui.CommonDlg
    ];
},

exists_dialog:
function exists_dialog() {
    var any_dlg_exists = false;
    for (var i = 0; i < ui.DialogHelper.dialogs.length; i += 1) {
        if (ui.DialogHelper.dialogs[i].is_show) {
            any_dlg_exists = true;
            break;
        }
    }
    return any_dlg_exists;
},

open:
function open(dlg) {
    var any_dlg_exists = false;
    for (var i = 0; i < ui.DialogHelper.dialogs.length; i += 1) {
        if (ui.DialogHelper.dialogs[i].id == dlg.id && dlg.is_show) {
            return;
        }
        if (ui.DialogHelper.dialogs[i].is_show) {
            any_dlg_exists = true;
        }
    }
    if (!any_dlg_exists) $(ui.DialogHelper.mask).show();
    var dlg_h = $(dlg.id).height();
    $(dlg.id).css('position', 'absolute');
    $(dlg.id).css('z-index', 1111111);
    $(dlg.id).css('left', '5%');
    $(dlg.id).css('right', '5%');
    $(dlg.id).css('top',  ($(window).height() - dlg_h)/2 + 'px');
    if (dlg_h > $(window).height() * 0.8){
        $(dlg.id).css('bottom', '10%');
    }
    dlg.show();
},

close:
function close(dlg) {
    dlg.hide();
    var any_dlg_exists = false;
    for (var i = 0; i < ui.DialogHelper.dialogs.length; i += 1) {
        if (ui.DialogHelper.dialogs[i].is_show) {
            any_dlg_exists = true;
        }
    }
    if (!any_dlg_exists) $(ui.DialogHelper.mask).hide();
},

};

