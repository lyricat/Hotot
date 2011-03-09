if (typeof ui == 'undefined') var ui = {};
ui.Slider = {

me: {},

id: '',

current: '',

column_num: 1,

tweet_blocks: {
    '#home_timeline': 0, 
    '#mentions': 1,
    '#direct_messages':2,
    '#retweets': 3,
    '#people': 4,
    '#search': 5,
},

tweet_blocks_seq: [
    '#home_timeline', 
    '#mentions',
    '#direct_messages',
    '#retweets',
    '#people',
    '#search',
],

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
},

slide_to:
function slide_to(id) {
/* = 3 columns as example = 
 * idx:         0   1   2   3   4   5
 * fixed_idx:   0   1   2   3   3   3
 * page_ofst:   0   0   1   2   3   3
 * displayed:  012 012 123 234 345 335
 */
    var idx = ui.Slider.tweet_blocks[id];
    var width = globals.tweet_block_width;
    ui.Slider.current = id;

    var fixed_idx = idx + ui.Slider.column_num < 6 
        ? idx: 6 - ui.Slider.column_num; 
    var page_offset = (fixed_idx == idx 
            && 0 <= fixed_idx - parseInt(ui.Slider.column_num/2))
        ? fixed_idx - parseInt(ui.Slider.column_num/2) : fixed_idx;

    // slide page
    ui.Slider.me.stop().animate(
        {marginLeft:'-'+ page_offset* width +'px'}, 500);

    // change current page style
    $('.tweet_block').removeClass('current');
    $(ui.Slider.current + '_tweet_block').addClass('current');

    // get displayed pages
    ui.Slider.displayed = [];
    for (var i = 0; i < ui.Slider.column_num; i += 1)
    {
        ui.Slider.displayed.push(ui.Slider.tweet_blocks_seq[i + page_offset]);
    }

    // change indicators style
    var all_btns = $('#indication').find('.idx_btn');
    var cur_sel = $.map(ui.Slider.displayed, function (item) {
        return $('#idx_btn_' + item.substring(1));
    });
    $('#indication_light').stop().animate(
          { 'left': (cur_sel[0].parent().attr('offsetLeft') + 1) + 'px',
            'width': (
                  cur_sel[cur_sel.length - 1].parent().attr('offsetLeft') 
                + cur_sel[cur_sel.length - 1].parent().width()
                - cur_sel[0].parent().attr('offsetLeft')  
                ) + 'px'
          }
        , 200 
        , function () {
            // remove selected style from the pre ones
            if (all_btns) {
                all_btns.removeClass('selected');
                all_btns.removeClass('current');
                all_btns.next('.shape').hide();
            }
            // add selected style to displayed pages' indicator
            $.each(cur_sel, function (i, obj) {
                if (obj.attr('href') == ui.Slider.current) {
                    obj.next('.shape').show();
                    obj.addClass('current');
                }
                obj.addClass('selected');
                obj.removeClass('unread');
            });
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
        prev_id = '#search';
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


