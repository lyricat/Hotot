if (typeof ui == 'undefined') var ui = {};
ui.SearchTabs = {

search_btn: null,

search_entry: null,

init:
function init() {
    ui.SearchTabs.search_entry = $('#tbox_search_entry');

    $('#tbox_search_entry').keypress(
    function (event) {
        if (event.keyCode == 13) {
            ui.SearchTabs.do_search(
                $.trim(ui.SearchTabs.search_entry.attr('value')));
        }
    });
    var search_btn 
        = new widget.Button('#btn_search_entry');
    search_btn.on_clicked = function (event) {
        ui.SearchTabs.do_search(
            $.trim(ui.SearchTabs.search_entry.attr('value')));
    };
    search_btn.create();
},

do_search:
function do_search(query) {
    ui.Main.block_info['#search'].query = query;
    ui.Main.block_info['#search'].page = 1;
    $('#search_tweet_block > ul').html('');
    daemon.Updater.update_search();
},

};

