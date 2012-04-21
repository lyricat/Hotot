(function() {
  var Scrollbar, root, _ref;

  Scrollbar = (function() {

    function Scrollbar(track, content, margin) {
      if (typeof track !== 'string') {
        this.track = $(track);
      } else {
        this.track = track;
      }
      if (typeof track !== 'string') {
        this.content = $(content);
      } else {
        this.content = content;
      }
      this.disabled = false;
      this.margin = margin;
      this.handle = this.track.find('.scrollbar_handle');
      this.content_height = 0;
      this.handle_height = 0;
      if (this.track.length === 0 && this.content.length === 0 && this.handle.length === 0) {
        return null;
      }
      this.recalculate_layout();
      this.bind();
    }

    Scrollbar.prototype.disable = function() {
      this.disabled = true;
      this.content.css({
        'overflow-y': 'auto',
        'overflow-x': 'hidden'
      });
      return this.track.hide();
    };

    Scrollbar.prototype.enable = function() {
      this.disabled = false;
      this.content.css({
        'overflow-y': 'hidden',
        'overflow-x': 'hidden'
      });
      return this.track.show();
    };

    Scrollbar.prototype.recalculate_layout = function() {
      var pos;
      if (this.disabled) return;
      this.content_height = this.content.height();
      this.track.css('height', (this.content_height - (this.track.outerHeight(true) - this.track.outerHeight())) + 'px');
      this.track_height = this.track.height();
      if (this.content.get(0).scrollHeight <= this.content_height) {
        this.hide();
      } else {
        this.show();
        this.handle.css('height', (this.track_height * this.content_height / this.content.get(0).scrollHeight) + 'px');
      }
      this.handle_height = this.handle.height();
      pos = this.content.get(0).scrollTop * (this.track_height - this.handle_height) / this.content.get(0).scrollHeight;
      this.handle.css('top', pos + 'px');
    };

    Scrollbar.prototype.on_wheel = function(ev) {
      var delta, offsetY;
      if (this.disabled) return;
      if (event.wheelDeltaY > 1 || event.wheelDeltaY < -1) {
        if (event.wheelDelta) delta = event.wheelDelta / 2.5;
        offsetY = this.content.get(0).offsetTop - delta;
        this.scroll(offsetY);
        return false;
      } else {
        return true;
      }
    };

    Scrollbar.prototype.activate = function() {
      this.on_active = true;
      return this.track.addClass('active');
    };

    Scrollbar.prototype.deactivate = function() {
      this.on_active = false;
      return this.track.removeClass('active');
    };

    Scrollbar.prototype.show = function() {
      return this.track.show();
    };

    Scrollbar.prototype.hide = function() {
      return this.track.hide();
    };

    Scrollbar.prototype.scroll_to = function(pos) {
      return this.content.get(0).scrollTop = pos;
    };

    Scrollbar.prototype.scroll = function(offset) {
      var pos;
      pos = this.content_pos_check(this.content.get(0).scrollTop + offset);
      return this.content.get(0).scrollTop = pos;
    };

    Scrollbar.prototype.scroll_by_handle = function(pos) {
      this.handle.css('top', pos + 'px');
      return this.content.get(0).scrollTop = pos * this.content.get(0).scrollHeight / (this.track_height - this.handle_height);
    };

    Scrollbar.prototype.handle_pos_check = function(pos) {
      if (pos < 0) pos = 0;
      if (pos > this.track_height - this.handle_height) {
        pos = this.track_height - this.handle_height;
      }
      return pos;
    };

    Scrollbar.prototype.content_pos_check = function(pos) {
      if (pos < 0) pos = 0;
      if (pos > this.content.get(0).scrollHeight) {
        pos = this.content.get(0).scrollHeight;
      }
      return pos;
    };

    Scrollbar.prototype.bind = function() {
      var _this = this;
      this.handle.mousedown(function(ev) {
        _this.activate();
        _this.track_scroll_y = ev.clientY - _this.track.get(0).offsetTop - _this.handle.get(0).offsetTop;
        root._active_scrollbar = _this;
        return false;
      }).mouseup(function(ev) {
        return _this.deactivate();
      });
      this.track.mousedown(function(ev) {
        var pos;
        _this.activate();
        pos = _this.handle_pos_check(ev.clientY - _this.track.offset().top - _this.handle_height * 0.5);
        _this.scroll_by_handle(pos);
        return false;
      }).mouseup(function(ev) {
        return _this.deactivate();
      });
      this.content.on('mousewheel', function(ev) {
        return _this.on_wheel(ev);
      });
      this.content.on('DOMMouseScroll', function(ev) {
        return _this.on_wheel(ev);
      });
      return this.content.scroll(function(ev) {
        var pos;
        if (!_this.on_active && !_this.disabled) {
          pos = _this.content.get(0).scrollTop * (_this.track_height - _this.handle_height) / _this.content.get(0).scrollHeight;
          return _this.handle.css('top', pos + 'px');
        }
      });
    };

    Scrollbar.prototype.destory = function() {
      this.track.off();
      this.track = null;
      this.handle.off();
      this.handle = null;
      this.content.off();
      return this.content = null;
    };

    return Scrollbar;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.widget = (_ref = root.widget) != null ? _ref : {};

  root.widget.Scrollbar = Scrollbar;

  root.widget.Scrollbar.register = function() {
    var _this = this;
    $(document).mousemove(function(ev) {
      var pos, sb;
      if (root._active_scrollbar) {
        sb = root._active_scrollbar;
        if (sb.on_active && !sb.disabled && sb.track_scroll_y) {
          pos = sb.handle_pos_check(ev.clientY - sb.track.get(0).offsetTop - sb.track_scroll_y);
          sb.scroll_by_handle(pos);
        }
        return false;
      }
    }).mouseup(function(ev) {
      var sb;
      if (root._active_scrollbar) {
        sb = root._active_scrollbar;
        return sb.deactivate();
      }
    });
  };

  root._active_scrollbar = null;

}).call(this);
