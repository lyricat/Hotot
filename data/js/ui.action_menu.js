if (typeof ui == 'undefined') var ui = {};
ui.ActionMenu = {

is_hide: true,

btns: {},

selected_idx: 0,

me: null,

init:
function init() {
    ui.ActionMenu.me = $('#action_menu');
    var container = $('#action_menu > ul');
    // generate trigger btns
    var form_items = function (btn_arr) {
        for (var i = 0, l = btn_arr.length; i < l; i += 1 ) {
            var btn = $(btn_arr[i]);
            var new_id = 'act_menu_' + btn.attr('id');
            if (btn.attr('title') =='') 
                continue;
            container.append(
                '<li><a id="'
                + new_id
                + '" href="javascript:void(0);" class="action_menu_item">'
                + btn.attr('title') 
                + '</a></li>');
            ui.ActionMenu.btns[new_id] = btn;
        }
    }
    form_items($('.tweet_bar_btn:not(#tweet_more_menu_btn)'));
    form_items($('.tweet_more_menu_btn'));
    // generate expander trigger btn
    container.append('<li><a id="act_menu_expander" href="javascript:void(0);" class="action_menu_item">Expand/Collapse</a></li>');
    ui.ActionMenu.btns['act_menu_expander'] = null;
    //bind mouse click event
    ui.ActionMenu.me.find('.action_menu_item').click(
        function (event) {
            var btn = ui.ActionMenu.btns[$(this).attr('id')];
            if (btn != null) {
                btn.click();
                ui.ActionMenu.hide();
            }
        }
    );
},

handle_keyup:
function handle_keyup(key_code) {
    var get_next_li = function (curr, direction) {
        var next_li = direction? curr.next('li'): curr.prev('li');
        while (next_li.css('display') == 'none') {
            next_li = direction? next_li.next('li'): next_li.prev('li');
            if (next_li.length == 0) {
                return null; 
            }
        }
        return next_li.length == 0? null : next_li;
    }

    var prev_sel = ui.ActionMenu.me.find('.action_menu_item.selected');
    var dist_li = null;
    var current = ui.ActionMenu.me.find('.action_menu_item.selected');
    if (key_code == 38 || key_code == 40 
        || key_code == 74 || key_code == 75) { 
        prev_sel.removeClass('selected');
        if (key_code == 38||key_code==75) {  // Up
            dist_li = get_next_li(prev_sel.parent(), false);
        } else if (key_code == 40||key_code==74) { // Down
            dist_li = get_next_li(prev_sel.parent(), true);
        }
        if (dist_li == null) {
            current = ui.ActionMenu.me.find('.action_menu_item:first');
        } else {
            current = dist_li.children('.action_menu_item');
        }
        current.addClass('selected');
        return false;
    }
    // Enter or Tab, invoke and hide menu.
    if (key_code == 13 || key_code == 9) {
        ui.Main.active_tweet_id = ui.Main.selected_tweet_id;

        var btn = ui.ActionMenu.btns[current.attr('id')];
        btn.click();
        ui.ActionMenu.hide();
        return false;
    }
    // Esc, hide menu.
    if (key_code == 65 || key_code == 27) {
        ui.ActionMenu.hide();
        return false;
    }
},

sync:
function sync() {
    // display tweets
    db.get_tweet(ui.Main.normalize_id(ui.Main.selected_tweet_id), 
    function (tx, rs) {
        var row = rs.rows.item(0);
        var id = row.id;
        var tweet_obj = JSON.parse(row.json);
        var user = typeof tweet_obj.sender != 'undefined'? tweet_obj.sender 
            : tweet_obj.user;
        $('#action_menu_info').empty().append($('<span class="info_hint"/>').text(user.screen_name + ':'))
            .append(document.createTextNode('"' + tweet_obj.text + '"'));
    });
    // reset 
    ui.ActionMenu.me.find('.action_menu_item.selected').removeClass('selected');

    var tweet_dom_id = ui.Main.selected_tweet_id;
    ui.Main.set_tweet_bar(tweet_dom_id);

    for (var k in ui.ActionMenu.btns) {
        var trigger_btn = $('#'+k);
        var btn = ui.ActionMenu.btns[k];
        if (btn == null) {
            trigger_btn.parent().css('display', 'none');
        } else {
            trigger_btn.parent().css('display'
                , btn.parent().css('display') == 'none'?'none':'block'); 
        }
    }
    
    // re-bind expander trigger_btn
    if ($(tweet_dom_id + ' .tweet_thread_info').length != 0
        && $(tweet_dom_id + ' .tweet_thread_info:first').css('display') != 'none') {
        var btn_expander = $(tweet_dom_id + ' .tweet_thread_info:first').children('.btn_tweet_thread');
        ui.ActionMenu.btns['act_menu_expander'] = btn_expander;
        $('#act_menu_expander').parent().show();
    } else {
        $('#act_menu_expander').parent().hide();
    }
    
    $('#action_menu .action_menu_item:first').addClass('selected');
},

show:
function show() {
    if (ui.Main.selected_tweet_id == null)
        return;
    ui.ActionMenu.sync();
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
}

};
