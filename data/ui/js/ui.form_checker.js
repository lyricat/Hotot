if (typeof ui == 'undefined') var ui = {};
ui.FormChecker= {

ERR_STR_NOT_INT: 'The value should be a integer.',
ERR_STR_INT_OUT_OF_RANGE: 'The value should be between ',
ERR_STR_TEXT_TOO_LONG: 'Too many charactors in this widget',

check_config_error: 
function check_config_error(widgets) {
    var result = [];
    var count = 0
    $(widgets).each(
    function (idx, widget) {
        if ($(widget).data('error') == true) {
            count += 1;
            result.push($(widget).attr('title') 
                + ': ' + $(widget).data('error_str') );
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
        $(widget).data('error_str', ui.FormChecker.ERR_STR_NOT_INT);
    }
},

test_int_range:
function test_int_bound(widget, min, max) {
    var c_val = parseInt($(widget).val());
    if (isNaN(c_val)) {
        $(widget).addClass('test_fail');
        $(widget).data('error', true);
        $(widget).data('error_str', ui.FormChecker.ERR_STR_NOT_INT);
    } else {
        $(widget).val(c_val);
        if (min < c_val && c_val < max) {
            $(widget).removeClass('test_fail');
            $(widget).data('error', false);
        } else {
            $(widget).addClass('test_fail');
            $(widget).data('error', true);
            $(widget).data('error_str'
                , ui.FormChecker.ERR_STR_INT_OUT_OF_RANGE 
                    + min +' and ' + max);
        }
    }
},

test_text_len_limit:
function test_text_len_limit(widget, max_len) {
    if ($(widget).val().length < max_len) {
        $(widget).removeClass('test_fail');
        $(widget).data('error', false);
    } else {
        $(widget).addClass('test_fail');
        $(widget).data('error', true);
        $(widget).data('error_str', ui.FormChecker.ERR_STR_TEXT_TOO_LONG);
    }
},
};


