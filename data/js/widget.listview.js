if (typeof(widget) == 'undefined') widget = {}
function WidgetListView(id, name, params) {
    /* 
     * .listview > .listview_header
     * .listview > ul.listview_body > li.listview_item * n
     * .listview > .listview_footer
     * */
    var self = this;
    self._me = null;

    self.name = '';
    self.item_type = '';

    self._item_class = ['listview_item'];

    self._body = null;

    self._load = null;
    self._loadmore = null;
    self._load_success = null;
    self._load_fail = null;
    self._loadmore_success = null;
    self._loadmore_fail = null;
    self._init = null;
    self._destory = null;
    self._last_load_more_time = Date.now();
    self.former = null;
    self.method = '';
    self.header_html = '';
    self.header_html_ex = '';
    self.type = '';
    self.title = 'New Page';
    self.interval = 0;
    self.resume_pos = false;
    self.incoming_num = 0;
    self.is_trim = true;

    self.since_id = null;
    self.max_id = null;
    self.page = 1;
    self.cursor = '';
    self.screen_name = '';
    self.slug = '';
    self.query = '';

    self.use_notify = false;
    self.use_notify_sound = false;
    self.use_auto_update = true;

    self.init = function init(id, name, params) {
        self._me = $(id);
        self.name = name;
        self._body = self._me.find('.listview_body');
        self._header = self._me.find('.listview_header');
        self._footer = self._me.find('.listview_footer');
        self._content = self._me.find('.listview_content');
        self.scrollbar = new widget.Scrollbar(self._me.find('.scrollbar_track'), self._me.find('.scrollbar_content'))
        if (navigator.platform === 'iPad') {
            self.scrollbar.disable()
        }

        // notification
        var prefs = conf.profiles[conf.current_name].preferences;
        var name_mapping = {
            'home': 'home_timeline',
            'mentions': 'mentions',
            'messages': 'direct_messages_inbox'
        };
        switch (name) {
            case 'home':
            case 'mentions':
            case 'messages':
                var mname = name_mapping[name];
                self.use_notify = prefs['use_' + mname + '_notify'];
                self.use_notify_sound = prefs['use_' + mname + '_notify_sound'];
        }

        if (typeof(params) != 'undefined') {
            for (var k in params) {
                switch (k) {
                /*
                case 'class':
                    if (Array.prototype.hasOwnProperty('concat')) {
                        self._class = self._class.concat(params.class);
                    } else {
                        util.concat(self._class, params.class);
                    }
                break;
                */
                case 'item_class':
                    if (Array.prototype.hasOwnProperty('concat')) {
                        self._item_class = self._item_class.concat(params.item_class);
                    } else {
                        util.concat(self._item_class, params.item_class);
                    }
                break;
                case 'load':
                    self._load = params.load;
                break;
                case 'loadmore':
                    self._loadmore = params.loadmore;
                break;
                case 'load_success':
                    self._load_success = params.load_success;
                break;
                case 'loadmore_success':
                    self._loadmore_success = params.loadmore_success;
                break;
                case 'load_fail':
                    self._load_fail = params.load_fail;
                break;
                case 'loadmore_fail':
                    self._loadmore_fail = params.loadmore_fail;
                break;
                case 'init':
                    self._init = params.init;
                break;
                case 'destroy':
                    self._destory = params.destroy;
                break;
                default:
                    if (self.hasOwnProperty(k)) {
                        self[k] = params[k];
                    }
                break;
                }
            }
        }
        self.create();
        if (self._init != null) {
            self._init(self);
        }
        // mochi widget
        self._header.find(".mochi_toggle").click(
            function(){
                $(this).attr("checked", this.checked);
            }
        );
        self._header.find(".mochi_button_group_item").click(
            function(){
                var a = $(this).attr("name");
                self._header.find(".mochi_button_group_item[name="+a+"]").not(this).removeClass("selected");
                self._header.find(this).addClass("selected");
            }
        );
        ui.Slider.bind_common_settings(self);
    };

    self.create = function create(){
        self._content.scroll(
        function (event) {
            if (this.scrollTop != 0) {
                self.resume_pos = true;
            } else {
                self.resume_pos = false;
            }

            if (this.scrollTop < 30) {
                widget.ListView.compress_page(self);
                self.scrollbar.recalculate_layout();
            } else if (this.scrollTop + this.clientHeight + 30 > this.scrollHeight) {
                self._body.children('.card:hidden:lt(20)').show();
                self.scrollbar.recalculate_layout();
                // load more automaticly
                if (this.scrollTop + this.clientHeight + 30 > this.scrollHeight) {
                    var now = Date.now();
                    self.resume_pos = false;
                    if (1000 <= now - self._last_load_more_time) {
                        self._last_load_more_time = now;
                        self.loadmore();
                    }
                }
            }
            // hide tweet bar
            ui.Main.closeTweetMoreMenu();
        });
        self._header.children('.header_content').html(self.header_html+self.header_html_ex);
    };

    self.destroy = function destroy() {
        self._body.find('a').unbind();
        self._body.find('.card').unbind().remove();
        if (self._destory != null) {
            self._destory(self);
        }
        for (var k in self) {
            self[k] = null;
        }
        if (self.scrollbar) {
            self.scrollbar.destroy()
        }
        self = null;
    };

    self.load = function load() {
        if (self._load != null) {
            self._footer.show();
            self._load(self, self.load_success, self.load_fail);
        }
        self.update_timestamp();
    };

    self.loadmore = function loadmore() {
        if (self._loadmore != null) {
            self._footer.show();
            self._loadmore(self, self.loadmore_success, self.loadmore_fail);
        }
        self.update_timestamp();
    };

    self.load_success = function load_success(json) {
        if (self == null) return;
        self._footer.hide();
        if (json.hasOwnProperty('length') && json.length == 0) { return; }
        var tweets = json;
        if (self.item_type == 'phoenix_search') {
            if (json.statuses)
                tweets = json.statuses;
        }
        if (tweets.hasOwnProperty('length')) {
            for (var i = 0, l = tweets.length; i < l; i+= 1) {
                if (!tweets[i].hasOwnProperty('id_str') && tweets[i].hasOwnProperty('id')) {
                    tweets[i].id_str = tweets[i].id.toString();
                }
            }
        }

        // load callback
        var count = self._load_success(self, json);
        if (count == 0) { 
            return; 
        }

        // keep timeline status
        // @TODO move the code below to respective views
        if (self.item_type == 'cursor') {       // friedns or followers
            self.cursor = json.next_cursor_str;
        } else if (self.item_type == 'page') {  //fav, 
            self.page = self.page + 1;
        } else if (self.item_type == 'search'){ 
            if (json.max_id_str){
                self.max_id = json.max_id_str;
            }
            if (json.page){
                self.page = json.page;
            }
        } else {    // other
            self.since_id = tweets[0].id_str;
            if (self.max_id == null) {
                self.max_id = tweets[count - 1].id_str;
            }
        }
        // thread container doesn't have a property '_me'
        if (self.hasOwnProperty('_me') && self._content.get(0).scrollTop < 100) {
            if (self.is_trim) {
                widget.ListView.trim_page(self);
            }
            widget.ListView.compress_page(self);
        }
        self.scrollbar.recalculate_layout();
    };
    
    self.load_fail = function load_fail(json) {
        self._footer.hide();
        if (self._load_fail != null) {
            self._load_fail(self, json)
        }
    };
    
    self.loadmore_success = function loadmore_success(json) {
        if (self == null) return;
        self._footer.hide();
        if (json.length == 0) { return; }
        var tweets = json;
        if (self.item_type == 'phoenix_search') {
            tweets = json.statuses;
        }
        for (var i = 0, l = tweets.length; i < l; i+= 1) {
            if (!tweets[i].hasOwnProperty('id_str')) {
                tweets[i].id_str = tweets[i].id.toString();
            }
        }
        // load callback
        var count = self._loadmore_success(self, json);

        // keep timeline status
        if (self.item_type == 'cursor') {        // friends or followers
            self.cursor = json.next_cursor_str;
        } else if (self.item_type == 'page') { // fav, 
            self.page = self.page + 1;
        } else if (self.item_type == 'search'){
            if (json.max_id_str){
                self.max_id = json.max_id_str;
            }
            if (json.page){
                self.page = json.page;
            }
        } else {    // other
            if (count == 0) { return; }
            self.max_id = tweets[count - 1].id_str;
            if (self.since_id == null) {
                self.since_id = tweets[0].id_str;
            }
        }
        self.scrollbar.recalculate_layout();
    };
    
    self.loadmore_fail = function loadmore_fail(json) {
        self._footer.hide();
        if (self._loadmore_fail != null) {
            self._loadmore_fail(self, json);
        }
    };

    self.clear = function clear() {
        self._body.find('.card').unbind();
        self._body.find('.card a').unbind();
        self._body.empty();
        self.scrollbar.recalculate_layout();
    };

    self.update_timestamp = function () {
        var prefs = conf.profiles[conf.current_name].preferences;
        if(prefs.show_relative_timestamp) {
            var now = moment();
            //Update relative timestamp, update first 20 tweets
            self._content.find('.tweet_update_timestamp:lt(20)').each(function () {
                var a = $(this);
                var m = moment(a.attr("title"));

                // only update DOM created today
                if(now.diff(m, "days") === 0) {
                    a.text(ui.Template.to_short_time_string(m));
                    //console.log(ui.Template.to_short_time_string(m));
                }
            });
        }
    };

    self.init(id, name, params);
}

widget.ListView = WidgetListView;

widget.ListView.trim_page = function trim_page(view) {
    var cards = view._body.children('.card:gt('+conf.vars.trim_bound+')');
    cards.find('.a').unbind();
    cards.find('.card').unbind();
    cards.unbind();
    cards.remove();
    // reset self.max_id 
    if (view.item_type == 'id') {        
        view.max_id = view._body.children('.card:last').attr('tweet_id');
    }
};

widget.ListView.compress_page = function compress_page(view) {
    view._body.children('.card:visible').filter(':gt(20)').hide();
};



