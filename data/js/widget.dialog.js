if (typeof(widget) == 'undefined') widget = {}
function WidgetDialog(obj) {
    /* .dialog 
     * .dialog > .dialog_bar
     * .dialog > .dialog_bar > .dialog_title
     * .dialog > .dialog_bar > .dialog_close_btn
     * .dialog > .dialog_header
     * .dialog > .dialog_body
     * .dialog > .dialog_footer
     * */

    var self = this;
    self._me = null;
    self.BAR_H = 38;
    self._auto_h = false;
    self._auto_w = false;

    self._default_dialog_html = '<div id="{%ID%}" class="dialog"><div class="dialog_bar"><h1 class="dialog_title">Title</h1><a href="javascript: void(0);" class="dialog_close_btn"></a></div><div class="dialog_container"><div class="dialog_header"></div><div class="dialog_body"></div><div class="dialog_footer"></div></div></div>'

    self._mouse_x = 0;
    self._mouse_y = 0;

    self._header_h = 60;
    self._footer_h = 60;

    self.destroy_on_close = false;

    self.init = function init(obj) {
        if (typeof (obj) == 'string') {
            if ($(obj).length == 0) {
                self.build_default_dialog(obj);
            }
            self._me = $(obj);
        } else {
            return null;
        }
        self._bar = self._me.find('.dialog_bar');
        self._header = self._me.find('.dialog_header');
        self._body = self._me.find('.dialog_body');
        self._footer = self._me.find('.dialog_footer');
    };

    self.build_default_dialog = function build_default_dialog(id) {
        $('body').append($(
            self._default_dialog_html.replace('{%ID%}', id.substring(1))));
    };

    self.create = function create() {
        self._close_btn = self._me.find('.dialog_close_btn');
        self._close_btn.click(function () {
            self.close();    
        });
        self._me.click(function (event) {    
            widget.DialogManager.set_above(self);
        });
        self._bar
            .mousedown(function (event) {
                widget.DialogManager.set_above(self);

                if (event.button != 0) {
                        return;
                }
                self._drag = true;
                var pos = self._me.position();
                self._offsetX = event.clientX - pos.left;
                self._offsetY = event.clientY - pos.top;
                event.target.style.cursor = "move";

                $('body').css({'-webkit-user-select': 'none'});
            })
            .mouseup(function (event) {
                if (self._drag) {
                    self._drag = false;
                    event.target.style.cursor = null;
                    $('body').css({'-webkit-user-select': ''});
                }
             });
             $(document).mousemove(function (event) {
                 if (self._drag) {
                     self.move(event.clientX - self._offsetX, event.clientY - self._offsetY);
                 }
             });
    };

    self.move = function move(x, y) {
        self._me_x = x;
        self._me_y = y;
        self._me.css({'left': (x) + 'px', 'top': (y) + 'px'});
    };

    self.resize = function resize(w, h) {
        self._me_h = self._me.height();
        self._header_h = parseInt(self._header.css('height'))
            + parseInt(self._header.css('padding-top'))
            + parseInt(self._header.css('padding-bottom'))+1;
        self._footer_h = parseInt(self._footer.css('height')) 
            + parseInt(self._footer.css('padding-top'))
            + parseInt(self._footer.css('padding-bottom'))+1;
        self._me_h = (h == -1? self._me_h: h);
        if (h !== 'auto' && !self._auto_h) {
            self._me.css({'height': self._me_h}); 
            var body_h = self._me_h - self._header_h - self._footer_h;
            var body_padding = parseInt(self._body.css('padding-top'))
                + parseInt(self._body.css('padding-bottom'));
            self._body.css({'height': (body_h - body_padding - self.BAR_H) + 'px'});
        } else {
            self._auto_h = true;
        }
        if (w !== 'auto' && !self._auto_w) {
            self._me_w = (w == -1? self._me_w: w);
            self._me.css({'width': self._me_w}); 
        } else {
            self._auto_w = true;
        }
        // 20px = dialog_body.padding + border_num
    };

    self.callUp = function callUp(method) {
        var x = $(window).width()/2 - self._me.width() / 2;
        var y = $(window).height()/2 - self._me.height() / 2;
        y = y > 100 ? y - y/2.0: y;
        if (method == "off") {
            self.move(x, y);
            self._me.show();
        } else if (method == 'slide') {
            self._me.show();
            self.move(x, $(window).height() + 10);
            self._me.transition({'left': x, 'top': y}, 
                200);
        } else {
            self.move(x, y);
            self._me.fadeIn('fast');
        }
    };

    self.dissipate = function dissipate(method) {
        var clearUp = function () {
            if (self.destroy_on_close) {
                self.destroy();
            } else {
                self._me.hide();
            }
        }
        if (method == 'off') {
            clearUp();
        } else if (method == "slide") {
            var x = $(window).width()/2 - self._me.width() / 2;
            var y = 0 - self._me.height() - 100;
            self._me.transition({'left': x, 'top': y}, 
                200, clearUp
            );
        } else {
            self._me.fadeOut('fast', clearUp);
        }
    };

    self.open = function open(method, callback) {
        if ($(window).width() < self._me_w + 20) {
            self.resize($(window).width() - 20, -1);
        }
        if ($(window).height() < self._me_h + 20) {
            self.resize(-1, $(window).height() - 20);
        }
        self.callUp(method);
        widget.DialogManager.push(self);
        if (callback) {
            callback();
        }
    };
    
    self.close = function close(method) {
        self.dissipate(method);
        widget.DialogManager.pop(self);
    };

    self.destroy = function destroy() {
        self._me.unbind();
        self._bar.unbind();
        self._close_btn.unbind();
        self._me.remove();
        delete self;
    };

    self.set_title = function set_title(title) {
        self._bar.children('.dialog_title').text(title)
    };

    self.set_content = function set_content(place, content) {
        switch (place) {
        case 'header':
            self._header.html(content);
        break;
        case 'body':
            self._body.html(content);
        break;
        case 'footer':
            self._footer.html(content);
        break;
        default: break;
        }
    };
    
    self.set_styles = function set_styles(place, styles) {
        switch (place) {
        case 'header':
            self._header.css(styles);
        break;
        case 'body':
            self._body.css(styles);
        break;
        case 'footer':
            self._footer.css(styles);
        break;
        default: break;
        }
    };

    self.set_order = function set_order(index) {
        self._me.css('z-index', index);
    };
    self.init(obj);
}

widget.Dialog = WidgetDialog;

widget.DialogManager = {
dialog_stack: [],

index_base: 10000,

current_index: 10001,

push:
function push(dialog) {
    dialog.set_order(this.current_index);
    this.dialog_stack.push(dialog);
    this.current_index += 1;
},

pop:
function pop(dialog) {
    this.dialog_stack.slice(this.dialog_stack.indexOf(dialog), 1);
},

set_above:
function set_above(dialog) {
    this.pop(dialog);
    this.push(dialog);
},

alert_footer: '<a href="javascript:void(0)" class="button dialog_close_btn">Close</a>',

alert_header: '<h1 style="font-size: 16px;">{%TITLE%}</h1>',

button_html: '<a href="javascript:void(0)" class="button" id="{%ID%}">{%LABEL%}</a>',

prompt_body: '<div class="dialog_block"><p>{%MESSAGE%}</p><p><input class="entry" type="text"/></p></div>',

prompt_header: '<h1 style="font-size: 16px;">{%TITLE%}</h1>',

alert:
function alert(title, message) {
    var id = '#message_box_' + String(Math.random()).substring(2);
    var message_box = new widget.Dialog(id);
    message_box.set_title('Hotot says:');
    message_box.set_content('header', widget.DialogManager.alert_header.replace('{%TITLE%}', title));
    message_box.set_content('footer', widget.DialogManager.alert_footer);
    message_box.set_content('body', message);
    message_box.set_styles('header', {'height': '30px', 'padding':'10px'});
    message_box.set_styles('footer', {'height': '30px', 'padding':'10px'});
    message_box.resize(400, 250);
    message_box.destroy_on_close = true;
    message_box.create();
    message_box.open();
},

prompt:
function prompt(title, message, callback) {
    var id = '#message_box_' + String(Math.random()).substring(2);
    prompt_dialog = widget.DialogManager.build_dialog(
            id, title, 
            widget.DialogManager.prompt_header.replace('{%TITLE%}', title),
            widget.DialogManager.prompt_body.replace('{%MESSAGE%}', message), 
            [{'id': id+'_ok_btn', label: 'OK', click: 
                function (event) {
                    var ret = $(id).find('.entry').val();
                    if (callback != undefined) {
                        callback(ret);
                        prompt_dialog.destroy();
                    }
                }}]
        );
    prompt_dialog.set_title('Hotot says:');
    prompt_dialog.set_styles('header', {'height': '30px', 'padding':'10px'});
    prompt_dialog.set_styles('footer', {'height': '30px', 'padding':'10px'});
    prompt_dialog.set_styles('body', {'padding':'10px'});
    prompt_dialog.resize(400, 280);
    prompt_dialog.open();
    $(id).find('.entry').keydown(function (ev) {
        if (ev.keyCode === 13) {
            $(id + '_ok_btn').click();
        }
    }).focus();
},

build_dialog:
function dialog(id, title, header_html, body_html, buttons){ 
    var ret = new widget.Dialog(id);
    // add buttons
    var footer_arr = [];
    for (var i = 0, l = buttons.length; i < l; i += 1) {
        footer_arr.push(widget.DialogManager.button_html
            .replace('{%ID%}', buttons[i].id.substring(1))
            .replace('{%LABEL%}', buttons[i].label));
    }
    ret.set_title(title);
    ret.set_content('header', header_html);
    ret.set_content('footer', footer_arr.join(''));
    ret.set_content('body', body_html);
    ret.set_styles('header', {'height': '30px', 'padding':'0px'});
    ret.set_styles('footer', {'height': '30px', 'padding':'10px'});
    // bind button click event
    for (var i = 0, l = buttons.length; i < l; i += 1) {
        var btn = new widget.Button(buttons[i].id);
        btn.on_clicked = buttons[i].click;
        btn.create();
    }
    ret.create();
    return ret;
}
};



