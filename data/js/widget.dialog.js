if (typeof(widget) == 'undefined') widget = {}
function WidgetDialog(obj) {
    /* .dialog 
     * .dialog > .dialog_bar
     * .dialog > .dialog_bar > .dialog_close_btn
     * .dialog > .dialog_header
     * .dialog > .dialog_body
     * .dialog > .dialog_footer
     * */

    var self = this;
    self._me = null;

    self._mouse_x = 0;
    self._mouse_y = 0;

    self._header_h = 60;
    self._footer_h = 60;

    self.init = function init(obj) {
        if (typeof (obj) == 'string') {
            self._me = $(obj);
        } else {
            self._me = obj;
        }
        self._bar = self._me.find('.dialog_bar');
        self._header = self._me.find('.dialog_header');
        self._body = self._me.find('.dialog_body');
        self._footer = self._me.find('.dialog_footer');
        self._close_btn = self._me.find('.dialog_close_btn');
        self._me_h = self._me.height();
        self._header_h = parseInt(self._header.css('height'))
            + parseInt(self._header.css('padding-top'))
            + parseInt(self._header.css('padding-bottom'))+1;
        self._footer_h = parseInt(self._footer.css('height')) 
            + parseInt(self._footer.css('padding-top'))
            + parseInt(self._footer.css('padding-bottom'))+1;
    };

    self.create = function create() {
        self._close_btn.click(function () {
            self.close();    
        });
        self._bar
            .attr('draggable', 'true')
            .mousedown(function () {
                widget.DialogManager.set_above(self);
            })
            .bind('dragstart', function(event) {
                self._mouse_x = event.offsetX;
                self._mouse_y = event.offsetY;

                event.originalEvent.dropEffect = 'none';
                event.originalEvent.effectAllowed = 'none';
                var img = document.createElement('img');
                img.width = 0;
                img.height = 0;
                event.originalEvent.dataTransfer.setDragImage(
                    img, 0, 0);
                return true;
            })
            .bind('dragend', function(event) {
                self.move(self._me_x + (event.offsetX-self._mouse_x)
                    , self._me_y + (event.offsetY-self._mouse_y))
                event.stopPropagation();
                return false;
            });
        
    };

    self.render = function render() {
    
    };

    self.move = function move(x, y) {
        self._me_x = x;
        self._me_y = y;
        self._me.css({'left': (x) + 'px', 'top': (y) + 'px'});
    };

    self.resize = function resize(w, h) {
        self._me_w = w; self._me_h = h;
        self._me.css({'width': w, 'height': h}); 
        var body_h = self._me_h - self._header_h - self._footer_h;
        self._body.css({'height': (body_h - 40) + 'px'});
        // 42px = dialog_body.padding + border_num
    };

    self.place = function place(where) {
        var x = 0;
        var y = 0;
        switch (where){
        case widget.DialogManager.CENTER:
            x = $(window).width()/2 - self._me_w / 2;
            y = $(window).height()/2 - self._me_h/2;
        break;
        case widget.DialogManager.LEFT_TOP:
            x = 0;
            y = 0;
        break;
        case widget.DialogManager.TOP:
            x = 0;
            y = $(window).height()/2 - self._me_h/2;
        break;
        default:
        break;
        }
        self.move(x, y);
    };

    self.relocate = function relocate() {
        self.place(widget.DialogManager.CENTER);
    };

    self.open = function open(with_mask) {
        if (with_mask) {
            $('#dialog_mask').show();
        }
        self.place(widget.DialogManager.CENTER);
        self._me.show();
        widget.DialogManager.push(self);
    };
    
    self.close = function close() {
        self._me.hide();
        widget.DialogManager.pop(self);
    };

    self.destory = function destory() {
        self._me.remove();
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
    if (this.dialog_stack.length != 0) {
        this.dialog_stack[this.dialog_stack.length-1]
            ._me.css('-webkit-box-shadow'
                , '0px 0px 5px #000');
    }
    dialog._me.css('-webkit-box-shadow', '0px 0px 8px #000');
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

};



