if (typeof(widget) == 'undefined') widget = {}
function WidgetButton(obj) {
    var self = this;
    self._me = null;

    self.init = function init(obj) {
        if (typeof (obj) == 'string') {
            self._me = $(obj);
        } else {
            self._me = obj;
        }        
        self._label_text = self._me.text();
    };

    self.create = function create() {
        self.render();
    }

    self.render = function render() {
        // bind events
        self._me.click(function (event) {
            if (self.on_clicked != null) {
                self.on_clicked(self, event);
            }
            self._on_clicked(event);
        });
    };

    self.set_label = function set_label(text) {
        self._me.text(self.text);
    };

    self.get_label = function get_label() {
        return self._me.text();
    }

    self.click = function click() {
        self._me.click();
    }

    self._on_clicked = function _on_clicked(event) {};
    
    self.init(obj);
}

widget.Button = WidgetButton;

