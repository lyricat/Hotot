if (typeof ui == 'undefined') var ui = {};
ui.Filter = {

id: '',

in_filter: false,

init: 
function init() {
    ui.Filter.id = '#filter_bar';
    ui.Filter.tbox = '#tbox_filter';
    $(ui.Filter.tbox).keyup(
    function (event) {
        if (event.keyCode == 13) { // Enter to apply
            ui.Filter.apply();
        }
        if (event.keyCode == 27) { //ESC to close
            $('#btn_filter_close').click();
            return false;
        }
    });
    $('#btn_filter_close').click(
    function (event) {
        if (ui.Filter.in_filter) {
            ui.Filter.clear();
            ui.Filter.apply();
        }
        ui.Filter.hide();
    });
    return this;
},

apply:
function apply() {
    var query = $(ui.Filter.tbox).val();
    ui.Main.filter(query);
    if (query != '') {
        ui.Filter.in_filter = true;
    } else {
        ui.Filter.in_filter = false;
    }
    return this;
},

clear:
function clear() {
    $(ui.Filter.tbox).val('');
    return this;
},

show:
function show() {
    $(ui.Filter.id)
    .css('background', $('#header').css('background'))
    .css('top', ($(header).height() + 5)+'px')
    .show();
    $(ui.Filter.tbox).focus();
    return this;
},

hide:
function hide() {
    $(ui.Filter.id).hide();
    $(ui.Filter.tbox).blur();
    return this;
},

};

