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
    dlg.show();
    var dlg_w = $(dlg.id).width();
    var dlg_h = $(dlg.id).height();
    $(dlg.id).parent().css('position', 'absolute');
    $(dlg.id).parent().css('z-index', 1111111);
    $(dlg.id).parent().css('left', ($(window).width()-dlg_w)/2 - 20 + 'px');
    $(dlg.id).parent().css('top', ($(window).height()-dlg_h)/2 - 20 + 'px');
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

