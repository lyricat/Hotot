if (typeof ui == 'undefined') var ui = {};
ui.Slider = {

me: {},

id: '',

current: '',

tweet_blocks: {
    '#home_timeline': 0, 
    '#mentions': 1,
    '#direct_messages':2,
    '#retweets': 3,
    '#people': 4,
    '#search': 5,
},

init:
function init () {
    this.id = '#main_page_slider';
    this.me = $('#main_page_slider');

    $('#indication').find('.idx_btn').click(
    function (event) {
        if ($(this).attr('href') != ui.Slider.current) {
            ui.Slider.slide_to($(this).attr('href'));
        } else {
            ui.Main.move_to_tweet('top')
        }
    });
    $('#indication').find('.shape').click(
    function (event) {
        $(this).parent().children('.idx_btn').click();
    });

    $('#idx_btn_home_timeline').click();
    $('#idx_btn_home_timeline').parent().children('.shape').show();

    $('#indication > ul >li').hover(
    function () {
        $(this).children('.shape').show();
    },
    function () {
        if (!$(this).children('.idx_btn').hasClass('selected'))
            $(this).children('.shape').hide();
    });
},

slide_to:
function slide_to(id) {

    var idx = ui.Slider.tweet_blocks[id];
    var width = globals.tweet_block_width;
    this.me.stop().animate({marginLeft:'-'+ idx * width +'px'}, 500);
    this.current = id;

    var prev_sel = $('#indication').find('.selected');
    var cur_sel = $('#idx_btn_' + id.substring(1));
    $('#indication_light').stop().animate(
          {'left': (cur_sel.parent().attr('offsetLeft') + 1) + 'px'}
        , 200 
        , function () {
            if (prev_sel) {
                prev_sel.removeClass('selected');
                prev_sel.next('.shape').hide();
            }
            cur_sel.next('.shape').show();
            cur_sel.addClass('selected');
            cur_sel.removeClass('unread');
        }
    );

    $(ui.Main.selected_tweet_id).removeClass('active');

    var first_one = $(ui.Slider.current + '_tweet_block .card:first');
    if (first_one.length != 0) {
        var block_name = ui.Slider.current;
        if (ui.Slider.current == '#retweets') {
            block_name = ui.RetweetTabs.current;
        } else if (ui.Slider.current == '#direct_messages') {
            block_name = ui.DMTabs.current;
        }
        ui.Main.selected_tweet_id = ui.Main.block_info[block_name].selected_tweet_id;
    } else {
        ui.Main.selected_tweet_id = null;
    }

    $('#tweet_bar').hide();
},

slide_to_prev:
function slide_to_prev() {
    var prev_id = '';
    var idx = ui.Slider.tweet_blocks[ui.Slider.current];
    if (idx == 0) {
        prev_id = '#people';
    } else {
        for (var k in ui.Slider.tweet_blocks) {
            if (ui.Slider.tweet_blocks[k] == idx - 1) {
                prev_id = k;
                break;
            }
        }
    }
    ui.Slider.slide_to(prev_id);
},

slide_to_next:
function slide_to_next() {
    var next_id = '';
    var idx = ui.Slider.tweet_blocks[ui.Slider.current];
    if (idx == 5) {
        next_id = '#home_timeline';
    } else {
        for (var k in ui.Slider.tweet_blocks) {
            if (ui.Slider.tweet_blocks[k] == idx + 1) {
                next_id = k;
                break;
            }
        }
    }
    ui.Slider.slide_to(next_id);
},

set_unread:
function set_unread(pagename) {
    for (var k in ui.Slider.tweet_blocks) {
        if (ui.Slider.current != k && pagename.indexOf(k) == 0) {
            var btn = $('#idx_btn_' + k.substring(1));
            btn.addClass('unread');
            return;
        }
    }
},

};


