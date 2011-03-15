if (typeof(widget) == 'undefined') widget = {}
function WidgetButton(obj) {
    var self = this;
    self._me = null;

    self._sensitive = true;

    self.init = function init(obj) {
        if (typeof (obj) == 'string') {
            self._me = $(obj);
        } else {
            self._me = obj;
        }        
    };

    self.create = function create() {
        // bind events
        self._me.click(function (event) {
            if (self._sensitive) {
                if (self.on_clicked != null) {
                    self.on_clicked(self, event);
                }
                self._on_clicked(event);
            }
        });
    };

    self.set_label = function set_label(text) {
        self._me.text(text);
    };

    self.get_label = function get_label() {
        return self._me.text();
    };

    self.set_sensitive = function set_sensitive(val) {
        self._sensitive = val;
        if (self._sensitive) {
            self._me.removeClass('disabled');
        } else {
            self._me.addClass('disabled');
        }
    };

    self.click = function click() {
        self._me.click();
    }

    self._on_clicked = function _on_clicked(event) {};
    
    self.init(obj);
}

widget.Button = WidgetButton;

