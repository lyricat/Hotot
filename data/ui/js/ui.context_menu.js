ui = ui || {};
ui.ContextMenu = {

is_hide: true,

init:
function init() {
    $('#context_menuitem_web_search').click(
    function (event) {
        navigate_action('http://google.com/search?sourceid=chrome&ie=UTF-8&q='+ui.ContextMenu.selected_str);
    });

    $('#context_menuitem_twitter_search').click(
    function (event) {
        ui.Main.reset_search_page(
            $.trim(ui.ContextMenu.selected_str));
        daemon.Updater.update_search();
    });

    $('body').get(0).oncontextmenu = function (event) {
        ui.ContextMenu.selected_str 
            = $.trim(document.getSelection().toString());
        if (ui.ContextMenu.selected_str.length != 0) {
            var display_str = ui.ContextMenu.selected_str;
            if (ui.ContextMenu.selected_str.length > 24) {
                display_str = ui.ContextMenu.selected_str.substring(0, 24) + ' ... ';
            }
            $('#context_menu').css(
                {'left':event.clientX, 'top':event.clientY}
            );
            $('#context_menuitem_web_search').html(
                'Search \'<strong>'+ display_str+'</strong>\' in Google');
            $('#context_menuitem_twitter_search').html(
                'Search \'<strong>'+ display_str +'</strong>\' in Twitter');
            ui.ContextMenu.show();
        } else {
            ui.ContextMenu.hide();
        }
        return false;
    }
},

show:
function show() {
    $('#context_menu').show();
    ui.ContextMenu.is_hide = false;
},

hide:
function hide() {
    $('#context_menu').hide();
    ui.ContextMenu.is_hide = true;
},

};
