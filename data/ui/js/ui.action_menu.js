if (typeof ui == 'undefined') var ui = {};
ui.ActionMenu = {

is_hide: true,

btns: [],

selected_idx: 0,

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
        return false;
    }
    if (key_code == 13 || key_code == 9) {
        var trigger_btn = ui.ActionMenu.btns[ui.ActionMenu.selected_idx]
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
        var trigger_btn = ui.ActionMenu.btns[
            $(this).parent().prevAll('li').length
        ];
        $(trigger_btn).click();
        ui.ActionMenu.hide();
        return false;
    });
},

generate:
function generate() {
    ui.ActionMenu.btns = [];
    var tweet_dom_id = ui.Main.actived_tweet_id;
    var btns = $(tweet_dom_id +' .tweet_ctrl:first').find('.tweet_ctrl_btn');
    var menu_btns = $(tweet_dom_id +' .tweet_more_menu:first').find('.tweet_ctrl_menu_btn');
    var arr = [];
    var idx = 0;

    var form_items = function (btn_arr) {
        for (var i = 0; i < btn_arr.length; i += 1 ) {
            if ($(btn_arr[i]).attr('title') ==''
                || $(btn_arr[i]).css('display') == 'none') 
                continue;
            arr.push(
                '<li><a href="javascript:void(0);" class="action_menu_item">'
                + $(btn_arr[i]).attr('title') 
                + '</a></li>');
            ui.ActionMenu.btns[idx] = btn_arr[i];
            idx +=1;
        }
    }
    form_items(btns);
    form_items(menu_btns);
    $('#action_menu > ul').html(arr.join(''));
    $('#action_menu .action_menu_item:first').addClass('selected');
    ui.ActionMenu.selected_idx = 0;
    ui.ActionMenu.bind_action();
},

show:
function show() {
    if (ui.Main.actived_tweet_id == null)
        return;
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
