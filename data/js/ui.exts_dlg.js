if (typeof ui == 'undefined') var ui = {};
ui.ExtsDlg = {

id: '',

init:
function init () {
    ui.ExtsDlg.id = '#prefs_exts';
},

load_ext_list:
function load_ext_list() {
    var exts_list = $('#prefs_exts > ul').empty();
    for (var ext_id in ext.exts_info) {
        var info = ext.exts_info[ext_id];
        var li = $('<li class="mochi_list_item" ext_id="'
            + ext_id + '">'
            + '<input type="checkbox" class="mochi_toggle widget"/>'
            + (info.has_options ? '<a href="javascript:void(0);" class="value option"></a>': '')
            + '<label class="label">' + info.name + '</label>'
            + '</li>');
        /*
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
        */
        exts_list.append(li);
    }

    var prefs = conf.get_current_profile().preferences;
    $('#prefs_exts .mochi_list_item').each(
    function (idx, obj) {
        var id = $(obj).attr('ext_id');
        var exists = (prefs.exts_enabled.indexOf(id) != -1);
        ui.ExtsDlg.enable_ext_item(obj, exists);
    });
    ui.ExtsDlg.bind_exts_btns();
},

enable_ext_item:
function enable_ext_item(item, enable) {
    $(item).find('.widget')
        .attr('checked', enable).prop('checked', enable)
},

bind_exts_btns:
function bind_exts_btns() {
    var prefs = conf.get_current_profile().preferences;
    $('#prefs_exts .widget').click(
    function (event) {
        var item = $(this).parent().get(0);
        var id = $(item).attr('ext_id');
        var enable = $(this).prop('checked');
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
    $('#prefs_exts .option').click(
    function (event) {
        var item = $(this).parent().get(0);
        var id = $(item).attr('ext_id');
        ext.config_ext(id);
        return false;
    });
}

}
    
