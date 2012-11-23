ui = ui || {};
ui.ContextMenu = {

is_hide: true,

editable_element: null,
event_element: null,

init:
function init() {
    $('#context_menuitem_copy').click(
    function (event) {
        if (!util.is_native_platform()) {
            if (conf.vars.platform === 'Chrome') {
                toast.set('Copied!').show(-1);
                var sandbox = $('#sandbox').val(ui.ContextMenu.selected_string).select();
                document.execCommand('copy');
                sandbox.val('');
            } else {
                // pass
            }
        } else {
            hotot_action('action/set_clipboard_text/' + ui.ContextMenu.selected_string);
        }
        if (ui.ContextMenu.event_element) {
            $(ui.ContextMenu.event_element).focus();
        }
    });

    $('#context_menuitem_paste').click(
    function (event) {
        var element = ui.ContextMenu.editable_element;
        if (element) {
            element.focus();
            hotot_action('action/paste_clipboard_text');
        }
    });

    $('#context_menuitem_web_search').click(
    function (event) {
        navigate_action('http://www.google.com/search?sourceid=chrome&ie=UTF-8&q='+ui.ContextMenu.selected_string);
    });

    $('#context_menuitem_twitter_search').click(
    function (event) {
        ui.SearchView.do_search(ui.Main.views.search, $.trim(ui.ContextMenu.selected_string));
    });
    
    $('body').get(0).oncontextmenu = function (event) {
        ui.ContextMenu.event_element = event.target;

        ui.ContextMenu.selected_string 
            = $.trim(document.getSelection().toString());

        $('#context_menu').css(
            {'left':event.clientX, 'top':event.clientY}
        );
        $('#context_menu li').hide();
        var all_hide_flag = true;
        $('#context_menu a').each(
        function (idx, item) {
            if ($(item).hasClass('native_only')) {
                if (!util.is_native_platform()) {
                    return;
                }
            }
            if ($(item).hasClass('select_only')) {
                var display_str = ui.ContextMenu.selected_string;
                if (display_str.length != 0) {
                    if (display_str.length > 24) {
                        display_str = display_str.substring(0, 24) + ' ... ';
                    }
                    if (!$(item).attr("text-template")) {
                        $(item).attr("text-template", $(item).text());
                    }
                    var content = $(item).attr("text-template").split("@");
                    if (content.length > 1) {
                        $(item).text(content[0]).append($('<strong></strong>').text("'" + display_str + "'"));
                        if (content[1]) {
                            $(item).append(document.createTextNode(content[1]));
                        }
                    }
                } else {
                    return;
                }
            }
            if ($(item).hasClass('editable_only')) {
                var element = event.target;
                ui.ContextMenu.editable_element = null;
                if (element.tagName != "INPUT" && element.tagName != "TEXTAREA") {
                    return;
                } else if (element.tagName == "INPUT" && element.type != 'text') { 
                    return;
                } else if (element.readOnly) {
                    return;
                }
                ui.ContextMenu.editable_element = element;
            }
            $(item).parent().show();
            all_hide_flag = false;
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
}

};
