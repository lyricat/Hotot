if (typeof ui == 'undefined') var ui = {};
ui.TrendingTopicsView = {

init:
function init() {
},

init_view:
function init_view(view) {
},

get_trending_topics:
function get_trending_topics(view, success, fail) {
    lib.twitterapi.get_trending_topics(success);
    return 10;
},

get_trending_topics_success:
function get_trending_topics_success(self, json) {
    var trend_list = json[0].trends;
    for (trend_name in trend_list) {
        self._body.append(trend_list[trend_name].name);
        self._body.append('<br/>');
    }
}

};
