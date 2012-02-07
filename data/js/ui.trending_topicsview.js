if (typeof ui == 'undefined') var ui = {};
ui.TrendingTopicsView = {

init:
function init() {
},

init_view:
function init_view(view) {
    lib.twitterapi.get_trending_topics(ui.TrendingTopicsView.get_trending_topics_success);
},

get_trending_topics_success:
function get_trending_topics_success(json) {
    console.log(JSON.stringify(json));
}

};
