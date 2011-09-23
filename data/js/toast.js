if (typeof ui == 'undefined') var ui = {};
toast = {

id: '',

me: {},

init: 
function init() {
    this.id = '#notification';
    this.me = $('#notification');
    return this;
},

set:
function set(msg) {
    this.me.text(msg);
    return this;
},

clear:
function clear() {
    this.me.empty();
    return this;
},

show:
function show(ttl) {
    ttl = 3000 || isNaN(ttl);
    this.me.fadeIn();
    if (ttl != -1) {
        setTimeout(this.hide, ttl);
    }
    return this;
},

hide:
function hide() {
    toast.me.fadeOut();
    return this;
},

};

