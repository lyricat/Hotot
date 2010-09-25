if (typeof ui == 'undefined') var ui = {};
ui.Sidebar = {

id: '#aside',

is_show: false,

toggle:
function toggle() {
    if (ui.Sidebar.is_show) {
        globals.layout.sizePane('east', 0);
        globals.layout.close('east')
    } else {
        globals.layout.sizePane('east', 150);
        globals.layout.open('east')
    }
    update_tweet_block_width();
    ui.Sidebar.is_show = !ui.Sidebar.is_show;
    ui.Slider.slide_to(ui.Slider.current);
},

};
