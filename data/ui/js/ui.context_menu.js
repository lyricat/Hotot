ui = ui || {};
ui.ContextMenu = {

is_hide: true,

init:
function init() {
    $('#context_menuitem_web_search').click(
    function (event) {
        navigate_action('http://google.com/search?sourceid=chrome&ie=UTF-8&q='+ui.ContextMenu.selected_string);
    });

    $('#context_menuitem_twitter_search').click(
    function (event) {
        ui.SearchTabs.do_search(
            $.trim(ui.ContextMenu.selected_string));
    });
    
    $('body').get(0).oncontextmenu = function (event) {
        ui.ContextMenu.selected_string 
            = $.trim(document.getSelection().toString());

        $('#context_menu').css(
            {'left':event.clientX, 'top':event.clientY}
        );
        $('#context_menu li').hide();
        var all_hide_flag = true;
        $('#context_menu a').each(
        function (idx, item) {
            var select_only = $(item).hasClass('select_only');
            if (ui.ContextMenu.selected_string.length != 0
                && $(item).hasClass('select_only')) {
                var display_str = ui.ContextMenu.selected_string;
                if (ui.ContextMenu.selected_string.length > 24) {
                    display_str = ui.ContextMenu.selected_string.substring(
                        0, 24) + ' ... ';
                }
                $('#context_menuitem_web_search').html(
                    'Search \'<strong>'+ display_str
                    + '</strong>\' in Google');
                $('#context_menuitem_twitter_search').html(
                    'Search \'<strong>'+ display_str 
                    +'</strong>\' in Twitter');
                $(item).parent().show();
                all_hide_flag = false;
            }
        });
        if (all_hide_flag) {
            $('#context_menu').hide();
        } else {
            $('#context_menu').show();
        }

        event.preventDefault()
        return ;
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
