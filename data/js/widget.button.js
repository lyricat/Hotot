if (typeof(widget) == 'undefined') widget = {}
function WidgetButton(obj) {
    var self = this;
    self._me = null;
    self._hlight_1 = null;
    self._hlight_2 = null;
    
    self._height = 20;
    self._width = -1;
    self._label_text = '';
    self._bg_color = '#fff';
    self._fg_color = '#000';
    self._icon = '';

    self.init = function init(obj) {
        if (typeof (obj) == 'string') {
            self._me = $(obj);
        } else {
            self._me = obj;
        }        
        self._label_text = self._me.text();
        self.apply_attrs();
    };

    self.apply_attrs = function apply_attrs() {
        var attrs = ['fg_color', 'bg_color', 'icon', 'height', 'width'];
        for (var i = 0; i < attrs.length; i += 1) {
            var a = attrs[i];
            if (typeof(self._me.attr(a)) != 'undefined') {
                self['_' + a] = self._me.attr(a);
            }
        }
    };

    self.create = function create() {
        self._me.html('<div class="hotot_widget_button_inner"><span class="hotot_widget_button_label">'
            + self._label_text + '</span><span class="hotot_widget_button_hlight_1"></span><span class="hotot_widget_button_hlight_2"></span></div>');
        self._me.attr('href','javascript:void(0)');
        
        self._inner = self._me.find('.hotot_widget_button_inner');
        self._label = self._me.find('.hotot_widget_button_label');
        self._hlight_1 = self._me.find('.hotot_widget_button_hlight_1');
        self._hlight_2 = self._me.find('.hotot_widget_button_hlight_2');
        
        self.render();
    }

    self.render = function render() {
        self._me.css({
              'height': self._height + 'px'
            , 'outline': 'none'
            , 'min-width': '60px'
            , 'display': 'inline-block'
            , 'border-radius': (self._height / 2) + 'px'
            , '-webkit-box-shadow': 'rgba(0,0,0,0.9) 0px 1px 3px'
            , 'font-size': '12px'
            , 'line-height': (self._height - 2) +'px'
            , 'text-align': 'center'
            , 'text-decoration': 'none'
            , 'color': self._fg_color
            , 'cursor': 'pointer'
        });

        self._inner.css({
              'position': 'relative'
            , 'padding': '0 10px'
            , 'height': '100%'
            , 'min-width': '60px'
            , 'display': 'inline-block'
            , 'border-radius': (self._height / 2) + 'px'
            , 'background-color': self._bg_color
            , 'background-image': 'url('+self._icon+')'
            , 'background-repeat': 'no-repeat'
            , 'background-position': 'center center'

        });

        if (self._icon && self._label_text != '') {
            self._inner.css({
                  'padding-left': '25px'
                , 'background-position': '5px center'
            });
        }
        if (self._width != -1) {
            var w = self._width 
            if (self._icon) {
                w -= 25; 
            }
            var cls = {'width': w + 'px', 'min-width': 0};
            self._inner.css(cls);
            self._me.css(cls);
        }

        self._hlight_1.css({
              'content': '" "'
            , 'display': 'block'
            , 'background': '-webkit-gradient(linear, left top, left bottom , from(rgba(117, 117, 117, 0.15)), to(rgba(94, 94, 94, 0.15)))'
            , 'border': '1px rgba(255, 255, 255, 0.1) solid'
            , 'border-top-left-radius': (self._height / 2) + 'px'
            , 'border-top-right-radius': (self._height / 2) + 'px'
            , 'border-bottom': 'none'
            , 'position': 'absolute'
            , 'bottom': '50%'
            , 'left': '1px'
            , 'right': '1px'
            , 'top': '1px'
        });

        self._hlight_2.css({
              'content': '" "'
            , 'display': 'block'
            , 'background': 'rgba(0, 0, 0, 0.15)'
            , 'border': 'none'
            , 'border-bottom-left-radius': (self._height / 2) + 'px'
            , 'border-bottom-right-radius': (self._height / 2) + 'px'
            , 'border-top': 'none'
            , 'position': 'absolute'
            , 'bottom': '1px'
            , 'left': '1px'
            , 'right': '1px'
            , 'top': '50%'
        });
        // bind events
        self._me.click(function (event) {
            if (self.on_clicked != null) {
                self.on_clicked(self, event);
            }
            self._on_clicked(event);
        }) .hover(function (event) {
            self._on_hover_over(event);     
        }, function (event) {
            self._on_hover_out(event);  
        }).mousedown(function (event) {
            self._on_mousedown(event); 
        }).mouseup(function (event) {
            self._on_mouseup(event); 
        }).blur(function (event) {
            self._on_mouseup(event); 
        });
    };

    self.set_attr = function set_attr(attr_name, attr_value) {
        self['_'+attr_name] = attr_value;
    };

    self.set_attrs = function set_attrs(dict) {
        for (var key in dict) {
            self['_'+key] = dict[key];
        }
    };

    self.set_label = function set_label(text) {
        self._label_text = text;
        self._label.text(self._label_text);
    };

    self.get_label = function get_label() {
        return self._label_text;
    }

    self.click = function click() {
        self._me.click();
    }

    self.print = function print() {
        console.log("self._me: " + self._me);
    };

    self._on_clicked = function _on_clicked(event) {};
    
    self._on_mousedown = function _on_mousedown(event) {
        self._me.css('-webkit-box-shadow', 'rgba(0,0,0,0.5) 0px 1px 1px');
    };
    
    self._on_mouseup = function _on_mouseup(event) {
        self._me.css('-webkit-box-shadow', 'rgba(0,0,0,0.9) 0px 1px 3px');
    };

    self._on_hover_over = function _on_hover_over(event) {
        self._hlight_1.css('background', '-webkit-gradient(linear, left top, left bottom , from(rgba(117, 117, 117, 0.1)), to(rgba(94, 94, 94, 0.1)))');
        self._hlight_2.css('background', 'rgba(0, 0, 0, 0.1)');
    };
    
    self._on_hover_out = function _on_hover_out(event) {
        self._hlight_1.css('background', '-webkit-gradient(linear, left top, left bottom , from(rgba(117, 117, 117, 0.15)), to(rgba(94, 94, 94, 0.15)))');
        self._hlight_2.css('background', 'rgba(0, 0, 0, 0.15)');
    };

    self.init(obj);
}

widget.Button = WidgetButton;

