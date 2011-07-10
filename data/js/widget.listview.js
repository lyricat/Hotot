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
    self.former = null;
    self.method = '';
    self.header_html = '';
    self.type = '';
    self.title = 'New Page';
    self.interval = 0;
    self.resume_pos = false;
    self.changed = false;
    self.is_trim = true;

    self.since_id = 1;
    self.max_id = null;
    self.page = 1;
    self.cursor = '';
    self.screen_name = '';

    self.use_notify = false;
    self.use_notify_type = 'count';
    self.use_notify_sound = true;

    self.init = function init(id, name, params) {
        self._me = $(id);
        self.name = name;
        self._body = self._me.children('.listview_body');
        self._header = self._me.children('.listview_header');
        self._footer = self._me.children('.listview_footer');
        self._close_btn = self._header.find('.close_btn');
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
    };

    self.create = function create(){
        self._me.scroll(
        function (event) {
            if (this.scrollTop != 0) {
                self.resume_pos = true;
            } else {
                self.resume_pos = false;
            }

            if (this.scrollTop < 30) {
                widget.ListView.compress_page(self);
            } else if (this.scrollTop + this.clientHeight + 30 > this.scrollHeight) {
                self._body.children('.card:hidden:lt(20)').show();
                // load more automaticly
                if (this.scrollTop + this.clientHeight + 30 > this.scrollHeight) {

                    self.resume_pos = false;
                    self.loadmore();
                }
            }
            // hide tweet bar
            ui.Main.tweet_bar.hide();
        });
        self._close_btn.click(function () {
            self.destroy();
        });
        self._header.children('.header_content').html(self.header_html);
    };

    self.destroy = function destroy() {
        if (self._destory != null) {
            self._destory(self);
        }
        for (var k in self) {
            self[k] = null;
        }
        self = null;
    };

    self.load = function load() {
        if (self._load != null) {
            self._footer.show();
            self._load(self, self.load_success, self.load_fail);
        }
    };

    self.loadmore = function loadmore() {
        if (self._loadmore != null) {
            self._footer.show();
            self._loadmore(self, self.loadmore_success, self.loadmore_fail);
        }
    };

    self.load_success = function load_success(json) {
        self._footer.hide();
        if (json.length == 0) { return; }
        for (var i = 0, l = json.length; i < l; i+= 1) {
            if (!json[i].hasOwnProperty('id_str')) {
                json[i].id_str = json[i].id.toString();
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
            self.page = json.page + 1; 
        } else if (self.item_type == 'search'){
            self.max_id = json.max_id_str;
            self.page = json.page;
        } else {    // other
            self.since_id = json[count - 1].id_str;
            if (self.max_id == null) {
                self.max_id = json[0].id_str;
            }
        }
        // thread container doesn't have a property '_me'
        if (self.hasOwnProperty('_me') && self._me.get(0).scrollTop < 100) {
            if (self.is_trim) {
                widget.ListView.trim_page(self);
            }
            widget.ListView.compress_page(self);
        }
    };
    
    self.load_fail = function load_fail(json) {
        if (self._load_fail != null) {
            self._load_fail(self, json)
        }
    };
    
    self.loadmore_success = function loadmore_success(json) {
        self._footer.hide();
        if (json.length == 0) { return; }
        for (var i = 0, l = json.length; i < l; i+= 1) {
            if (!json[i].hasOwnProperty('id_str')) {
                json[i].id_str = json[i].id.toString();
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
            self.max_id = json.max_id_str;
            self.page = json.page;
        } else {    // other
            if (count == 0) { return; }
            self.max_id = json[count - 1].id_str;
            if (self.since_id == 1) {
                self.since_id = json[0].id_str;
            }
        }
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



