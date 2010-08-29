if (typeof ui == 'undefined') var ui = {};
ui.FormChecker= {

check_config_error: 
function check_config_error(widgets) {
    var result = [];
    var count = 0
    $(widgets).each(
    function (idx, widget) {
        if ($(widget).data('error') == true) {
            count += 1;
            result.push($(widget).attr('title'));
        }
    });
    return {'count':count, 'error_values':result};
},

test_int_value:
function test_int_value(widget) {
    var c_val = parseInt($(widget).val());
    if (!isNaN(c_val)) {
        $(widget).removeClass('test_fail');
        $(widget).val(c_val);
        $(widget).data('error', false);
    } else {
        $(widget).addClass('test_fail');
        $(widget).data('error', true);
    }
},

};


