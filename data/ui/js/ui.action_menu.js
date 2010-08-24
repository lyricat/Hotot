if (typeof ui == 'undefined') var ui = {};
ui.ActionMenu = {

is_hide: true,

btns: [],

selected_idx: 0,

selected_id: '',

init:
function init() {
},

handle_keyup:
function handle_keyup(key_code) {
    if (key_code == 38 || key_code == 40 
        || key_code == 74 || key_code == 75) { 
        var items = $('#action_menu').find('.action_menu_item');
        items.eq(ui.ActionMenu.selected_idx).removeClass('selected');
        
        if (key_code == 38||key_code==75) ui.ActionMenu.selected_idx -= 1;
        if (key_code == 40||key_code==74) ui.ActionMenu.selected_idx += 1;
        if (ui.ActionMenu.selected_idx == -1 ) {
            ui.ActionMenu.selected_idx = items.length - 1;
        } 
        if (ui.ActionMenu.selected_idx == items.length) {
            ui.ActionMenu.selected_idx = 0;
        } 
        items.eq(ui.ActionMenu.selected_idx).addClass('selected');
        ui.ActionMenu.selected_id
            = items.eq(ui.ActionMenu.selected_idx).attr('id');
        return false;
    }
    if (key_code == 13 || key_code == 9) {
        var trigger_btn = ui.ActionMenu.btns[ui.ActionMenu.selected_id]
        $(trigger_btn).click();
        ui.ActionMenu.hide();
        return false;
    }
    if (key_code == 65 || key_code == 27) {
        ui.ActionMenu.hide();
        return false;
    }
},


bind_action:
function bind_action() {
    $('#action_menu .action_menu_item').click(
    function (event) {
        var trigger_btn = ui.ActionMenu.btns[$(this).attr('id')]
        $(trigger_btn).click();
        ui.ActionMenu.hide();
        return false;
    });
},

generate:
function generate() {
    ui.ActionMenu.btns = [];
    var tweet_dom_id = ui.Main.actived_tweet_id;
    var btns = $(tweet_dom_id).find('.tweet_ctrl_btn')
    var menu_btns = $(tweet_dom_id).find('.tweet_ctrl_menu_btn');
    var arr = [];
    var idx = 0;
    for (var i = 0; i < btns.length; i += 1, idx +=1 ) {
        if ($(btns[i]).attr('title') ==''
            || $(btns[i]).css('display') == 'none') 
            continue;
        var id = 'action_menu_item_' + idx;
        arr.push('<li><a id="' 
            + id
            + '" href="javascript:void(0);" class="action_menu_item">'
            + $(btns[i]).attr('title') 
            + '</a></li>');
        ui.ActionMenu.btns[id] = btns[i];
    }
    for (var i = 0; i < menu_btns.length; i += 1, idx +=1 ) {
        if ($(menu_btns[i]).attr('title') ==''
            || $(menu_btns[i]).css('display') == 'none') 
            continue;
        var id = 'action_menu_item_' + idx;
        arr.push('<li><a id="' 
            + id
            + '" href="javascript:void(0);" class="action_menu_item">'
            + $(menu_btns[i]).attr('title') 
            + '</a></li>');
        ui.ActionMenu.btns[id] = menu_btns[i];
    }
    $('#action_menu > ul').html(arr.join(''));
    $('#action_menu .action_menu_item:first').addClass('selected');
    ui.ActionMenu.selected_idx = 0;
    ui.ActionMenu.selected_id = 'action_menu_item_0';
    ui.ActionMenu.bind_action();
},

show:
function show() {
    ui.ActionMenu.generate();
    $('#action_menu').show().focus();
    ui.ActionMenu.is_hide = false;
},

hide:
function hide() {
    $('#action_menu').hide();
    ui.ActionMenu.is_hide = true;
},

toggle:
function toggle() {
    if (ui.ActionMenu.is_hide)
        ui.ActionMenu.show();
    else
        ui.ActionMenu.hide();
    ui.ActionMenu.is_hide = !ui.ActionMenu.is_hide;
},

};
