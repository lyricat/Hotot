if (typeof(widget) == 'undefined') widget = {}
function WidgetAutoComplete(obj) {
    var self = this;
    self._me = null;
    self._inDetecting = false;
    self.inputText = '';

    self.init = function init(obj) {
        self._me = obj;
        self.candidate = $('<ul class="autocomplete"></ul>');
        self.candidate.insertAfter(self._me);
        self._me.bind('keydown', self.onKeyDown);
    };

    self.onKeyDown = function onKeyDown(event) {
        var key_code = event.keyCode;
        
        if (key_code == 13) {
            if (self._inDetecting) {
                var selectedItem = self.candidate.children('.selected');
                if (selectedItem.length != 0) {
                    self.competeName(
                        selectedItem.text().substring(self.inputText.length)
                    );
                }
                self.stopDetecting();
                return false;
            }
        }

        if (key_code == 32) {
            if (self._inDetecting) {
                self.stopDetecting();
            }
            return;
        }

        if (key_code == 38 || key_code == 40) { 
            var current = self.candidate.children('.selected');
            var target = null; 
            if (key_code == 38) {
                target = current.prev();
                if (target.length == 0) {
                    target = self.candidate.children('li:last-child');
                }
            } else {
                target = current.next();
                if (target.length == 0) {
                    target = self.candidate.children('li:first-child');
                }
            }
            target.addClass('selected');
            self.candidate.stop().animate({scrollTop: target.get(0).offsetTop - self.candidate.get(0).offsetTop}); 
            current.removeClass('selected');
            return false;
        }

        if ((key_code <= 90 && 65 <= key_code)
            || (48 <= key_code && key_code <= 57)
            || 95 == key_code || key_code == 8) {
            self.detect(event);
        }

    };

    self.startDetecting = function startDetect() { 
        self._inDetecting = true;
        self.candidate.css({
            'width': self._me.width() + 'px', 'left':self._me.get(0).offsetLeft+'px'});
        self.candidate.slideDown();
    };

    self.stopDetecting = function stopDetect() {
        self._inDetecting = false;
        self.inputText = '';
        self.candidate.slideUp();
    };

    self.detect = function detect(event) {
        var text = self._me.val();
        // scan for '@' character
        var curPos = self.getCursorPos();
        var rearText = text.substring(0, curPos);
        var atIdx = rearText.lastIndexOf('@');
        if (atIdx == -1 || atIdx == curPos) {
            self.stopDetecting();
            return; 
        }
        // get the text after '@'
        if (event.keyCode == 8) {
            self.inputText = rearText.substring(atIdx + 1, curPos - 1) 
        } else {
            self.inputText = rearText.substring(atIdx + 1, curPos) 
                + String.fromCharCode(event.keyCode);
        }
        if (self.inputText.match(/^[\S]+$/g) == null) {
            return;
        }
        // start 
        if (!self._inDetecting) {
            self.startDetecting();
        }
        self.filter(self.inputText, function (result_list) {
            if (result_list.length == 0) {
                self.candidate.hide();
                return;
            }
            self.candidate.children('li').unbind('click');
            self.candidate.empty();
            for (var i = 0, l = result_list.length; i < l; i++) {
                self.candidate.append($('<li/>').text(result_list[i]));
            }
            self.candidate.show();
            self.candidate.children('li').click(function (event) {
                var append = $(this).text().substring(self.inputText.length); 
                self.competeName(append);
                self.stopDetecting();
            });
            self.candidate.children('li:first').addClass('selected');
        });
    };

    self.competeName = function competeName(append) {
        var text = self._me.val();
        var curPos = self.getCursorPos();
        self._me.val(
            text.substr(0, curPos)
                + append + text.substring(curPos));
    };

    self.filter = function filter(text, callback) {
        db.get_screen_names_starts_with(text,
        function (tx, rs) {
            var result_list = []
            for (var i = 0, l = rs.rows.length; i < l; i += 1) { 
                result_list.push(rs.rows.item(i).screen_name)
            }
            callback(result_list);
        });
    }

    self.getCursorPos = function getCursorPos(){
        var pos = 0;
        var box = self._me.get(0);
        self._me.focus();
        if (document.selection) {
        // IE
            var sel = document.selection.createRange();
            sel.moveStart('character', -box.value.length);
            pos = sel.text.length;
        } else if (box.selectionStart || box.selectionStart == '0') {
        // others
            pos = box.selectionStart;
        }
        return pos;
    },

    self.init(obj);
}

widget.autocomplete = WidgetAutoComplete;
widget.autocomplete.connect = function bind(obj) {
    return new widget.autocomplete(obj);
}
