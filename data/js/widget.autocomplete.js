// widget.autocomplete.js - user name autocomplete

if (typeof(widget) == 'undefined') widget = {}
function WidgetAutoComplete(obj) {
    var self = this;
    self._me = null;
    self._inDetecting = false;
    self.inputText = '';
    self.timer = null;

    self.init = function init(obj) {
        self._me = obj;
        self.candidate = $('<ul class="autocomplete"></ul>');
        self.candidate.insertAfter(self._me);
        self._me.bind('keydown', self.onKeyDown);
    };

    self.onKeyDown = function onKeyDown(event) {
        var key_code = event.keyCode;
        
        clearInterval(self.timer);
        if (key_code == 13) {
            if (self._inDetecting) {
                // Do username autocompletion because user pressed enter.
                var selectedItem = self.candidate.children('.selected');
                if (selectedItem.length != 0) {
                    // At this point self.inputText is the part of the
                    // user name that already has been typed (but with
                    // some strange casing).  selectedItem.text() is
                    // the username to be autocompleted.
                    self.replaceName(
                        selectedItem.text(), self.inputText.length 
                    );
                }
                self.stopDetecting();
                return false;
            }
        }
        
        if (event.keyCode == 27) { // esc
            self.candidate.hide();
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
            self.candidate.stop().transition({scrollTop: target.get(0).offsetTop - self.candidate.get(0).offsetTop}); 
            current.removeClass('selected');
            return false;
        }

        if ((key_code <= 90 && 65 <= key_code)
            || (48 <= key_code && key_code <= 57)
            || 95 == key_code || key_code == 8) {
            self.detect(event);
        }
        if (key_code === 229) { // for imeKey
            self.timer = setInterval(function () {
                self.detect(event)
            }, 500);
        }
    };

    self.startDetecting = function startDetect() { 
        self._inDetecting = true;
        self.candidate.css({
            'width': self._me.width() + 'px', 'left':self._me.get(0).offsetLeft+'px'});
        self.candidate.slideDown('fast');
    };

    self.stopDetecting = function stopDetect() {
        self._inDetecting = false;
        self.inputText = '';
        self.candidate.slideUp('fast');
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
            self.inputText = rearText.substring(atIdx + 1, curPos);
            if (event.keyCode !== 229) {
                self.inputText += String.fromCharCode(event.keyCode);
            }
        }
        if (self.inputText.match(/^[\S]+$/g) == null) {
            return;
        }
        // start 
        if (!self._inDetecting) {
            self.startDetecting();
        }

        var handleResult = function (result_list) {
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
                // Do username autocompletion because user clicked
                // a name from the list

                // self.inputText is the part of the name that has 
                // already be entered. $(this).text() is the username
                // to be autocompleted.
                self.replaceName($(this).text(), self.inputText.length);
                self.stopDetecting();
            });
            if (self.candidate.children('.selected').length === 0){
                self.candidate.children('li:first').addClass('selected');
            } 
        }
        handleResult(self.quickFilter(self.inputText));
        // self.filter(self.inputText, handleResult);
    };

    // This function does the actual autocomplete for user names.
    // 'append' is the part that is to be added to the part that
    // has already been typed
    self.competeName = function competeName(append) {
        var text = self._me.val();
        var curPos = self.getCursorPos();
        self._me.val(
            text.substr(0, curPos)
                + append + text.substring(curPos));
        self._me.get(0).selectionStart = curPos + append.length;
        self._me.get(0).selectionEnd = curPos + append.length;
    };

    // This function replaces the last nChars of the text of the
    // calling window by name. This keeps the casing of name intact
    // (see #371)
    self.replaceName = function(name, nChars) {
        var text = self._me.val();  // the current text
        var curPos = self.getCursorPos();  // location of the cursor
        var namePos = curPos - nChars;  // location for autocompleted name

        self._me.val(
            text.substr(0, namePos)
                + name + text.substring(curPos));
       
        // Not sure what the following lines do; I just copied and
        // adapted them from competeName.
 
        self._me.get(0).selectionStart = namePos + name.length;
        self._me.get(0).selectionEnd = namePos + name.length;
    }

    self.filter = function filter(text, callback) {
        db.get_screen_names_starts_with(text,
        function (tx, rs) {
            var result_list = []
            for (var i = 0, l = rs.rows.length; i < l; i += 1) { 
                result_list.push(rs.rows.item(i).screen_name)
            }
            callback(result_list);
        });
    };

    self.quickFilter = function quickFilter(text) {
        var result_list = globals.conversant.filter(
            function (x) {
                return x.toLowerCase().indexOf(text.toLowerCase()) === 0;
            });
        return result_list;
    };

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

    self.hide = function hide() {
        self.candidate.hide();
    }

    self.init(obj);
}

widget.autocomplete = WidgetAutoComplete;
widget.autocomplete.connect = function bind(obj) {
    return new widget.autocomplete(obj);
}
