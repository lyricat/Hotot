if (typeof ui == 'undefined') var ui = {};
ui.Slider = {

me: {},

id: '',

current: '',

tweet_blocks: {
    '#home_timeline': 0, 
    '#mentions': 1,
    '#direct_messages':2,
    '#favorites': 3,
    '#retweets': 4,
    '#people': 5,
},

init:
function init () {
    this.id = '#main_page_slider';
    this.me = $('#main_page_slider');

    $('#indication').find('.idx_btn').click(
    function (event) {
        ui.Slider.slide_to($(this).attr('href'));
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
    if (prev_sel)
        prev_sel.removeClass('selected');
    $('#idx_btn_' + id.substring(1)).addClass('selected');
},

};


