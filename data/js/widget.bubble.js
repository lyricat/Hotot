if (typeof(widget) == 'undefined') widget = {}
function WidgetBubble(obj, target) {
    /* .bubble 
     * .bubble > .bubble_container > .bubble_body
     * */

    var self = this;
    self._me = null;
    self._target = null;
    self._body = null;
    WidgetBubble.TOP_LEFT = 0;
    WidgetBubble.TOP = 1;
    WidgetBubble.TOP_RIGHT = 2;
    WidgetBubble.LEFT = 3;
    WidgetBubble.RIGHT = 4;
    WidgetBubble.BOTTOM_LEFT = 5;
    WidgetBubble.BOTTOM = 6;
    WidgetBubble.BOTTOM_RIGHT = 7;
    
    WidgetBubble.ALIGN_LEFT = 0;
    WidgetBubble.ALIGN_RIGHT = 1;
    WidgetBubble.ALIGN_TOP = 2;
    WidgetBubble.ALIGN_BOTTOM = 3;
    WidgetBubble.ALIGN_CENTER = 4;

    self._default_bubble_html = '<div id="{%ID%}" target="{%TARGET%}" class="bubble"><div class="bubble_container"><div class="bubble_body"></div></div></div>'

    self.init = function init(obj, target) {
        self.build_default_bubble(obj, target);
        self._me = $(obj);
        self._target = $(target);
        self._body = self._me.find('.bubble_body');
    };

    self.build_default_bubble=function build_default_bubble(id, target_id) {
        var html = self._default_bubble_html;
        html = html.replace('{%ID%}', id.substring(1));
        html = html.replace('{%TARGET%}', target_id);
        $('body').append(html);
    };

    self.create = function create() {
        self._me.mouseout(function(){self._me.hide();})
    };

    self.cal_align = function cal_align(pos, align) {
        if (pos == WidgetBubble.TOP || pos == WidgetBubble.BOTTOM) {
            ret = self._target.offset().left;
            switch (align) {
            case WidgetBubble.ALIGN_CENTER:
                ret -= (self._me.width() - self._target.width()) / 2;
            break;
            case WidgetBubble.ALIGN_RIGHT:
                ret -= (self._me.width() - self._target.width());
            break;
            default : break; //default WidgetBubble.ALIGN_LEFT
            }
        } else {
            ret = self._target.offset().top;
            switch (align) {
            case WidgetBubble.ALIGN_CENTER:
                ret -= (self._me.height() - self._target.height()) / 2;
            break;
            case WidgetBubble.ALIGN_BOTTOM:
                ret -= (self._me.height() - self._target.height());
            break;
            default : break; //default WidgetBubble.ALIGN_TOP
            }
        }
        return ret;
    };

    self.place = function place(pos, align) {
        var offset = self._target.offset();
        var th = self._target.height(); var tw = self._target.width();
        var bub_x = offset.left; var bub_y = offset.top;
        
        switch (pos) {
        case WidgetBubble.TOP:
            bub_y -= self._me.height() - 5;
            bub_x = self.cal_align(pos, align);
        break;
        case WidgetBubble.LEFT:
            bub_x -= self._me.width() - 5;
            bub_y = self.cal_align(pos, align);
        break;
        case WidgetBubble.RIGHT:
            bub_x += self._target.width() + 5;
            bub_y = self.cal_align(pos, align);
        break;
        case WidgetBubble.BOTTOM:
            bub_y += self._target.height() + 5;
            bub_x = self.cal_align(pos, align);
        break;
        default:
        break;
        }
        self._x = bub_x; self._y = bub_y;
    };

    self.show = function show() {
        self._me.css({'left': self._x + 'px', 'top': self._y + 'px'});
        self._me.show();
    };

    self.hide = function hide() {
        self._me.hide();
    };

    self.destroy = function destroy() {
        self._me.unbind();
        self._me.remove();
        delete self;
    };

    self.set_content = function set_content(content) {
        self._body.html(content);
    };
    
    self.set_styles = function set_styles(styles) {
        self._body.css(styles);
    };

    self.set_order = function set_order(index) {
        self._me.css('z-index', index);
    };
    self.init(obj, target);
}

widget.Bubble = WidgetBubble;



