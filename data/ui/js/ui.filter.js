if (typeof ui == 'undefined') var ui = {};
ui.Filter = {

id: '',

current_pos: -1,

matched_ids: [],

init: 
function init() {
    ui.Filter.id = '#filter_bar';
    ui.Filter.tbox = '#tbox_filter';
    $(ui.Filter.tbox).keyup(
    function (event) {
        if (event.keyCode == 13) { // Enter to apply
            if (ui.Filter.matched_ids.length == 0) {
                var query = $(ui.Filter.tbox).val();
                ui.Filter.find(query);
            } else {
                ui.Filter.next_result();
            }
        } else if (event.keyCode == 27) { //ESC to close
            $('#btn_filter_close').click();
            return false;
        } else {
            ui.Filter.matched_ids = [];
            ui.Filter.current_pos = -1;
        }
    });
    $('#btn_filter_close').click(
    function (event) {
        ui.Filter.clear();
        ui.Filter.hide();
    });
    return this;
},

find:
function find(query) {
    var current = ui.Slider.current;
    var tweets = $(current + '_tweet_block .card');
    ui.Filter.finding = true;
    ui.Filter.matched_ids = [];
    ui.Filter.current_pos = -1;
    tweets.each(
    function(idx, obj) {
        var tweet_li = $(obj);
        if (tweet_li.find('.text').text().indexOf(query) != -1
            || tweet_li.find('.who').text().indexOf(query) != -1) {
            ui.Filter.matched_ids.push('#'+tweet_li.attr('id'));
        }
    });
    if (ui.Filter.matched_ids.length == 0) {
        ui.Notification.set(query +' not found.').show(2);
    } else {
        container = ui.Main.get_current_container(ui.Slider.current);
        container.children('.card').show(); 
        ui.Main.move_to_tweet(ui.Filter.matched_ids[0]);
    }
    return this;
},

next_result:
function next_result() {
    ui.Filter.current_pos += 1;
    if (ui.Filter.current_pos >= ui.Filter.matched_ids.length) {
        ui.Filter.current_pos = 0;
    }
    if (ui.Filter.matched_ids.length != 0) {
        ui.Main.move_to_tweet(ui.Filter.matched_ids[ui.Filter.current_pos]);
    }
},

prev_result:
function prev_result() {
    ui.Filter.current_pos -= 1;
    if (ui.Filter.current_pos < 0) {
        ui.Filter.current_pos = ui.matched_ids.length - 1;
    }
    if (ui.Filter.matched_ids.length != 0) {
        ui.Main.move_to_tweet(ui.Filter.matched_ids[ui.Filter.current_pos]);
    }
},

clear:
function clear() {
    $(ui.Filter.tbox).val('');
    ui.Filter.matched_ids = [];
    ui.Filter.current_pos = -1;
    return this;
},

show:
function show() {
    $(ui.Filter.id)
        .css('background', $('#header').css('background'))
        .css('top', ($(header).height() + 6)+'px')
        .show();
    $(ui.Filter.tbox).focus();
    return this;
},

hide:
function hide() {
    ui.Filter.finding = false;
    $(ui.Filter.id).hide();
    $(ui.Filter.tbox).blur();
    return this;
},

};

