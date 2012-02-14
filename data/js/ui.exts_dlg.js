if (typeof ui == 'undefined') var ui = {};
ui.ExtsDlg = {

id: '',

init:
function init () {
    ui.ExtsDlg.id = '#exts_dlg';

    var btn_exts_close = new widget.Button('#btn_exts_close');
    btn_exts_close.on_clicked = function (event) {
        globals.exts_dialog.close();
    };
    btn_exts_close.create();

    var filter_btns = new widget.RadioGroup('#exts_filter_btns');
    filter_btns.on_clicked = function (btn, event) {
        var href = btn.attr('href');
        switch (href) {
        case '#all':
            $('#exts_container .ext_item').show();
        break;
        case '#enabled':
            $('#exts_container .ext_item').show();
            $('#exts_container .ext_item.disabled').hide();
        break;
        case '#disabled':
            $('#exts_container .ext_item').hide();
            $('#exts_container .ext_item.disabled').show();
        break;
        }
    };
    filter_btns.create();
},

load_ext_list:
function load_ext_list() {
    var exts_list = $('#exts_container > ul').empty();
    for (var ext_id in ext.exts_info) {
        var info = ext.exts_info[ext_id];
        var li = $('<li class="ext_item"/>').attr('id', 'ext_' + ext_id);
        var div = $('<div class="ext_icon_wrap"/>').appendTo(li);
        $('<img class="ext_icon"/>').attr('src', info.icon).appendTo(div);
        div = $('<div class="ext_item_body"/>').appendTo(li);
        $('<span class="ext_name"/>').text(info.name).appendTo(div);
        $(document.createTextNode(' - ' + _('version') + ' ')).appendTo(div);
        $('<span/>').text(info.version).appendTo(div);
        $('<br/>').appendTo(div);
        $('<span/>').text(_('author') + ': ').appendTo(div);
        $('<span/>').text(info.author).appendTo(div);
        $('<br/>').appendTo(div);
        $('<span/>').text(_('website') + ': ').appendTo(div);
        $('<a class="ext_url"/>').attr('href', info.url).text(info.url).appendTo(div);
        $('<br/>').appendTo(div);
        var d = info.description.split('\n');
        var p = $('<p class="ext_description"/>').appendTo(div);
        $(document.createTextNode(d[0])).appendTo(p);
        for (var i = 1, l = d.length; i < l; i++) {
            $('<br/>').appendTo(p);
            $(document.createTextNode(d[i])).appendTo(p);
        }
        var sdiv = $('<div class="ext_ctrl" style="padding-top: 5px; border-top: 1px #ccc solid">').appendTo(div);
        $('<a href="javascript:void(0);" class="button enable_btn"/>').text(_('enable')).appendTo(sdiv);
        if (info.has_options) {
            $('<a href="javascript:void(0);" class="button options_btn"/>').text(_('options')).appendTo(sdiv);
        }
        exts_list.append(li);
    }

    // @TODO enable enabled ext items cause Issue 31
    /*
    */
    var prefs = conf.get_current_profile().preferences;
    $('#exts_container .ext_item').each(
    function (idx, obj) {
        var id = $(obj).attr('id').substring(4);
        var exists = (prefs.exts_enabled.indexOf(id) != -1);
        ui.ExtsDlg.enable_ext_item(obj, exists);
    });
    ui.ExtsDlg.bind_exts_btns();
},

enable_ext_item:
function enable_ext_item(item, enable) {
    if (enable) {
        $(item).removeClass('disabled');
        $(item).find('.enable_btn')
            .text(_('disable')).addClass('disable');
    } else {
        $(item).addClass('disabled');
        $(item).find('.enable_btn')
            .text(_('enable')).removeClass('disable');
    }
},

bind_exts_btns:
function bind_exts_btns() {
    var prefs = conf.get_current_profile().preferences;
    $('#exts_container .enable_btn').click(
    function (event) {
        var item = $(this).parents('.ext_item').get(0);
        var id = $(item).attr('id').substring(4);
        var enable = !$(this).hasClass('disable');
        ext.exts_info[id].enable = enable;
        if (enable) {
            prefs.exts_enabled.push(id)
            ext.enable_ext(id);
        } else {
            prefs.exts_enabled.splice(prefs.exts_enabled.indexOf(id), 1);
            ext.disable_ext(id);
        }
        ui.ExtsDlg.enable_ext_item(item, enable);
        conf.save_prefs(conf.current_name);
    });
    $('#exts_container .options_btn').click(
    function (event) {
        var item = $(this).parents('.ext_item').get(0);
        var id = $(item).attr('id').substring(4);
        ext.config_ext(id);
        return false;
    });

}

}
    
