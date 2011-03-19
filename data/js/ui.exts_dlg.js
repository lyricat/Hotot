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
    ext_arr = [];
    for (var ext_id in ext.exts_info) {
        var info = ext.exts_info[ext_id];
        ext_arr.push('<li id="ext_' + ext_id + '" class="ext_item"">'
            + '<div class="ext_icon_wrap">'
                + '<img class="ext_icon" src="'+info.icon+'"/></div>'
            + '<div class="ext_item_body">'
                + '<span class="ext_name">'+info.name+'</span> - Version  <span>'+ info.version + '</span><br/>'
                + '<span>Author:</span> <span>'+info.author+'</span><br/>'
                + '<span>Website:</span> <a class="ext_url" href="'+info.url+'">'+info.url+'</a><br/>'
                + '<p class="ext_description">' + info.description.replace(/\n/g, '<br/>') + '</p>'
                + '<div class="ext_ctrl"><a href="javascript:void(0);" class="enable_btn">Enable</a> '
                + (info.has_options?' <a href="javascript:void(0);" class="options_btn">Options</a>': '')
            + '</div></div></li>');
    }
    $('#exts_container > ul').html(ext_arr.join(''));

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
        $(item).find('.enable_btn').text("Disable").addClass('disable');
    } else {
        $(item).addClass('disabled');
        $(item).find('.enable_btn').text("Enable").removeClass('disable');
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

},

}
    
