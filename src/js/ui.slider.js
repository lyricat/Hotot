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
    '#retweets_to_me': 4,
},

init:
function init () {
    this.id = '#main_page_slider';
    this.me = $('#main_page_slider');

    $('#indication').find('.idx_btn').click(
    function (event) {
        var prev_sel = $('#indication').find('.selected');
        if (prev_sel)
            prev_sel.removeClass('selected');
        ui.Slider.slide_to($(this).attr('href'));
        $(this).addClass('selected');
    });
    $('#idx_btn_home').click();
    $('#idx_btn_home').parent().children('.shape').show();

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
},

};


