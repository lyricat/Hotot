if (typeof ui == 'undefined') var ui = {};
ui.Finder = {

id: '',

current_pos: -1,

matched_ids: [],

query: '',

init: 
function init() {
    ui.Finder.id = '#finder_bar';
    ui.Finder.tbox = '#tbox_finder';
    $(ui.Finder.tbox).keyup(
    function (event) {
        if (event.keyCode == 13) { // Enter to search 
            var query = $.trim($(ui.Finder.tbox).val());
            if (query.length == 0) 
                return;
            if (ui.Finder.query != query) {
                ui.Finder.search(query);
                ui.Finder.next_result();
            } else {
                ui.Finder.next_result();
            }
        } else if (event.keyCode == 27) { //ESC to close
            $('#btn_finder_close').click();
            return false;
        }
    });
    $('#btn_finder_next').click(
    function (event) {
        ui.Finder.next_result();
        return false;
    });
    $('#btn_finder_prev').click(
    function (event) {
        ui.Finder.prev_result();
        return false;
    });
    $('#btn_finder_close').click(
    function (event) {
        ui.Finder.clear();
        ui.Finder.hide();
        return false;
    });
    return this;
},

search:
function search(query) {
    var tweets = $('#main_page .card:visible');
    ui.Finder.finding = true;
    ui.Finder.query = query;
    ui.Finder.current_pos = 0;
    ui.Finder.matched_ids = [];
    tweets.each(
    function(idx, obj) {
        var tweet_li = $(obj);
        if (query[0] == '@') {
            if ($.trim(tweet_li.find('.who').text()).toLowerCase() == query.substring(1).toLowerCase()) {
                ui.Finder.matched_ids.push('#'+tweet_li.attr('id'));
            }
        } else {
            if (tweet_li.find('.text').text().toLowerCase().indexOf(query.toLowerCase()) != -1) {
                ui.Finder.matched_ids.push('#'+tweet_li.attr('id'));
            }
        }
    });
    return this;
},

next_result:
function next_result() {
    ui.Finder.current_pos += 1;
    if (ui.Finder.current_pos >= ui.Finder.matched_ids.length) {
        ui.Finder.current_pos = 0;
    }
    if (ui.Finder.matched_ids.length != 0) {
        var id = ui.Finder.matched_ids[ui.Finder.current_pos];
        ui.Slider.slide_to(id.split('-')[0].substring(1));
        ui.Main.move_to_tweet(id);
    }
    if (ui.Finder.matched_ids.length == 0) {
        $('#finder_matched_info').text('0 of 0');
    } else {
        $('#finder_matched_info').text((ui.Finder.current_pos+1)
            + ' of '
            + ui.Finder.matched_ids.length);
    }
},

prev_result:
function prev_result() {
    ui.Finder.current_pos -= 1;
    if (ui.Finder.current_pos < 0) {
        ui.Finder.current_pos = ui.Finder.matched_ids.length - 1;
    }
    if (ui.Finder.matched_ids.length != 0) {
        var id = ui.Finder.matched_ids[ui.Finder.current_pos];
        ui.Slider.slide_to(id.split('-')[0].substring(1));
        ui.Main.move_to_tweet(id);
    }
    if (ui.Finder.matched_ids.length == 0) {
        $('#finder_matched_info').text('0 of 0');
    } else {
        $('#finder_matched_info').text((ui.Finder.current_pos+1)
            + ' of '
            + ui.Finder.matched_ids.length);
    }
},

clear:
function clear() {
    $('#finder_matched_info').text('0 of 0');
    $(ui.Finder.tbox).val('');
    ui.Finder.query = '';
    ui.Finder.matched_ids = [];
    ui.Finder.current_pos = 0;
    return this;
},

show:
function show() {
    $(ui.Finder.id).show();
    $(ui.Finder.tbox).focus();
    return this;
},

hide:
function hide() {
    ui.Finder.finding = false;
    $(ui.Finder.id).hide();
    $(ui.Finder.tbox).blur();
    return this;
}

};

