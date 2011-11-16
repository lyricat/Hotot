var _hotot_tab = null;
function tab_change_handler(tab) {
    if (tab.url == chrome.extension.getURL("index.html")) {
        if (_hotot_tab) {
            if (tab.id != _hotot_tab.id) {
                // Duplicate
                chrome.tabs.remove(tab.id);
                show_hotot_tab();
            }
        } else {
            _hotot_tab = tab;
        } 
    }
}
function share_page(info, tab) {
    _share_with_hotot(tab.title + ' ' + info.pageUrl);
}
function share_selection(info, tab) {
    _share_with_hotot(info.selectionText);
}
function share_link(info, tab) {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
    _share_with_hotot(info.linkUrl);
}
function get_active_window() {
    var ret = null;
    var v = chrome.extension.getViews();
    for (var i = 0; i < v.length; i++) {
        ret = v[i];
        if (ret.location.href == _hotot_tab.url){
            return ret;
        }
    }
    return null;
}
function show_hotot_tab() {
    if (_hotot_tab) {
        var proc = function (c) {
                c.focused || chrome.windows.update(c.id, {
                    focused: true
                });
            };
        chrome.tabs.get(_hotot_tab.id, function (c) {
            _hotot_tab = c;
            chrome.windows.get(c.windowId, proc)
        });
        chrome.tabs.update(_hotot_tab.id, {
            selected: true
        })
    }
};
function _share_with_hotot(str) {
    var _do_share = function () {
        var win = get_active_window();
        var _test_proc = function () {
            if (win.globals && win.globals.myself) {
                win.ui.StatusBox.change_mode(win.ui.StatusBox.MODE_TWEET);
                win.ui.StatusBox.set_status_text(str);
                win.ui.StatusBox.open();
            } else {
                setTimeout(_test_proc, 500);
            }
        };
        _test_proc()
    };
    if (_hotot_tab && _hotot_tab.id) {
        show_hotot_tab(); 
        _do_share();
    } else {
        chrome.tabs.create({
            url: "index.html"
        }, function () {
            setTimeout(function () {
                _do_share();
            }, 500)
        });
    }
}

var contexts = ["page","selection","link"];
chrome.contextMenus.create({"title": "Share Page with Hotot",
    "contexts":["page"], "onclick": share_page});
chrome.contextMenus.create({"title": "Share Selection with Hotot",
    "contexts":["selection"], "onclick": share_selection});
chrome.contextMenus.create({"title": "Share Link with Hotot",
    "contexts":["link"], "onclick": share_link});
chrome.tabs.onCreated.addListener(function (tab) {
    tab_change_handler(tab);
});
chrome.tabs.onUpdated.addListener(function (id, info, tab) {
    tab_change_handler(tab);
});


