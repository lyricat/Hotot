if (typeof(widget) == 'undefined') widget = {}
function WidgetListView(obj, params) {
    /*
     * .listview > ul.listview_container > li.listview_item * n
     * */
    var self = this;
    self._me = null;
   
    self._item_class = ['listview_item']

    self._container = null;

    self._additem_func = null;

    self._removeitem_func = null;

    self._modifyitem_func = null;

    self.init = function init(obj, params) {
        self._me = $(obj);
        self._container = self._me.children('.listview_container');
        if (typeof(params) != 'undefined') {
            for (var k in params) {
                switch (k) {
                case 'item_class':
                    self._item_class = self._item_class.concat(params.item_class);
                break;
                case 'additem':
                    self._additem_func = params.additem;
                break;
                case 'removeitem':
                    self._removeitem_func = params.removeitem;
                break;
                case 'modifyitem':
                    self._modifyitem_func = params.modifyitem;
                break;
                }
            }
        }
    };

    self.create = function create(){
        // bind events
    };

    self.additem = function additem(id, item) {
        // add item to view
        if (self._additem_func) {
            if (self._additem_func(id, item) == true) {
                self._container.append(
                    id == null? '<li class="'+self._item_class+'">'
                        :'<li class="'+self._item_class+'" id="'+id+'">'+item+'</li>');
            }
        } else {
            self._container.append(
                id == null? '<li class="'+self._item_class+'">'
                    :'<li class="'+self._item_class+'" id="'+id+'">'+item+'</li>');
        }
    };

    self.removeitem = function removeitem(id) {
        // remove id from view 
        if (self._removeitem_func) {
            if (self._removeitem_func(id) == true) {
                self._container.find(id).remove();
            }
        } else {
            self._container.find(id).remove();
        }
    };

    self.modifyitem = function modifyitem(id, str) {
        // modify current item in view
        if (self._modifyitem_func) {
            if (self._modifyitem_func(id) == true) {
                self._container.find(id).html(str);
            }
        } else {
            self._container.find(id).html(str);
        }
    };

    self.clear = function clear() {
        self._container.empty();
    };

    self.update = function update() {
        
    };

    self.loadmore = function loadmore() {
        
    };
    
    self.init(obj, params);
}

widget.ListView = WidgetListView;


