if (typeof ui == 'undefined') var ui = {};
ui.ExtsDlg = {

me: {},

id: '',

mask: {},

is_show: false,

is_change: false,

init:
function init () {
    ui.ExtsDlg.id = '#exts_dlg';
    ui.ExtsDlg.me = $('#exts_dlg');
    ui.ExtsDlg.mask = $('#dialog_mask');

    $(ui.ExtsDlg.id).find('.dialog_close_btn').click(
    function (event) {
        ui.DialogHelper.close(ui.ExtsDlg);
    });

    var btn_exts_close = new widget.Button('#btn_exts_close');
    btn_exts_close.on_clicked = function (event) {
        ui.DialogHelper.close(ui.ExtsDlg);
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
    $('#exts_container .ext_item').each(
    function (idx, obj) {
        var id = $(obj).attr('id').substring(4);
        var exists = (ext.exts_enabled.indexOf(id) != -1);
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
    $('#exts_container .enable_btn').click(
    function (event) {
        var item = $(this).parents('.ext_item').get(0);
        var id = $(item).attr('id').substring(4);
        var enable = !$(this).hasClass('disable');
        ext.exts_info[id].enable = enable;
        if (enable) {
            ext.exts_enabled.push(id)
            ext.exts_info[id].extension.load();
        } else {
            ext.exts_enabled.splice(ext.exts_enabled.indexOf(id), 1);
            ext.exts_info[id].extension.unload();
        }
        ui.ExtsDlg.enable_ext_item(item, enable);
    });
    $('#exts_container .options_btn').click(
    function (event) {
        var item = $(this).parents('.ext_item').get(0);
        var id = $(item).attr('id').substring(4);
        ext.exts_info[id].extension.options();
    });

},

hide:
function hide () {
    hotot_action('exts/save_enabled/'
        + encodeURIComponent(JSON.stringify(ext.exts_enabled)));
    ui.ExtsDlg.me.hide();
    ui.ExtsDlg.is_show = false;
    return this;
},

show:
function show () {
    ui.ExtsDlg.load_ext_list();
    ui.ExtsDlg.me.show();
    ui.ExtsDlg.is_show = true;
    return this;
},
}
    
