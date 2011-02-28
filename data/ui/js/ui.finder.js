if (typeof ui == 'undefined') var ui = {};
ui.Finder = {

id: '',

current_pos: -1,

matched_ids: [],

init: 
function init() {
    ui.Finder.id = '#finder_bar';
    ui.Finder.tbox = '#tbox_finder';
    $(ui.Finder.tbox).keyup(
    function (event) {
        if (event.keyCode == 13) { // Enter to search 
            if (ui.Finder.current_pos == -1) {
                var query = $(ui.Finder.tbox).val();
                if (query.length == 0) 
                    return;
                ui.Finder.search(query);
                ui.Main.get_current_container(ui.Slider.current)
                    .children('.card').show(); 
            } else {
                ui.Finder.next_result();
            }
        } else if (event.keyCode == 27) { //ESC to close
            $('#btn_finder_close').click();
            return false;
        } else {
            var query = $(ui.Finder.tbox).val();
            if (query.length == 0) 
                return;
            ui.Finder.search(query);
        }
    });
    $('#btn_finder_next').click(
    function (event) {
        ui.Finder.next_result();
    });
    $('#btn_finder_prev').click(
    function (event) {
        ui.Finder.prev_result();
    });
    $('#btn_finder_close').click(
    function (event) {
        ui.Finder.clear();
        ui.Finder.hide();
    });
    return this;
},

search:
function search(query) {
    var current = ui.Slider.current;
    var tweets = $(current + '_tweet_block > ul > .card');
    ui.Finder.finding = true;
    ui.Finder.matched_ids = [];
    tweets.each(
    function(idx, obj) {
        var tweet_li = $(obj);
        if (tweet_li.find('.text').text().toLowerCase().indexOf(query.toLowerCase()) != -1
            || tweet_li.find('.who').text().toLowerCase().indexOf(query.toLowerCase()) != -1) {
            ui.Finder.matched_ids.push('#'+tweet_li.attr('id'));
        }
    });
    if (ui.Finder.matched_ids.length == 0) {
        ui.Finder.current_pos = -1;
        $('#finder_matched_info').addClass('notfound');
    } else {
        ui.Finder.current_pos = 0;
        $('#finder_matched_info').removeClass('notfound')
    }
    $('#finder_matched_info').text((ui.Finder.current_pos+1)
        + ' of '
        + ui.Finder.matched_ids.length);
    return this;
},

next_result:
function next_result() {
    ui.Finder.current_pos += 1;
    if (ui.Finder.current_pos >= ui.Finder.matched_ids.length) {
        ui.Finder.current_pos = 0;
    }
    if (ui.Finder.matched_ids.length != 0) {
        ui.Main.move_to_tweet(ui.Finder.matched_ids[ui.Finder.current_pos]);
    }
    $('#finder_matched_info').text((ui.Finder.current_pos+1)
        + ' of '
        + ui.Finder.matched_ids.length);
},

prev_result:
function prev_result() {
    ui.Finder.current_pos -= 1;
    if (ui.Finder.current_pos < 0) {
        ui.Finder.current_pos = ui.matched_ids.length - 1;
    }
    if (ui.Finder.matched_ids.length != 0) {
        ui.Main.move_to_tweet(ui.Finder.matched_ids[ui.Finder.current_pos]);
    }
    $('#finder_matched_info').text((ui.Finder.current_pos+1)
        + ' of '
        + ui.Finder.matched_ids.length);
},

clear:
function clear() {
    $(ui.Finder.tbox).val('');
    ui.Finder.matched_ids = [];
    ui.Finder.current_pos = -1;
    return this;
},

show:
function show() {
    $(ui.Finder.id)
        .css('background', $('#header').css('background'))
        .css('top', ($(header).height() + 6)+'px')
        .show();
    $(ui.Finder.tbox).focus();
    return this;
},

hide:
function hide() {
    ui.Finder.finding = false;
    $(ui.Finder.id).hide();
    $(ui.Finder.tbox).blur();
    return this;
},

};

