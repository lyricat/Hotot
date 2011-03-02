var i18n = {
default_locale: 'en',

locale: 'en',

dict: {},

init:
function init(callback) {
    $.getJSON('../_locales/' + i18n.locale + '/message.json',
    function (result) {
        i18n.load_dict(result);
        i18n.trans_html();
        callback();
    });
},

load_dict:
function load_dict(new_dict) {
    i18n.dict = new_dict;
},

get_msg:
function get_msg(msg) {
    if (i18n.dict == null) {
        return msg;
    }
    if (msg in i18n.dict) {
        return i18n.dict[msg];
    } else {
        return msg;
    }
},

trans_html:
function trans_html() {
    $('*[data-i18n-text]').each(function(idx, obj) {
        var obj = $(obj);
        obj.text(i18n.get_msg(obj.text()));
    });
    $('*[data-i18n-title]').each(function(idx, obj) {
        var obj = $(obj);
        obj.attr('title', i18n.get_msg(obj.attr('title')));
    });
    $('*[data-i18n-value]').each(function(idx, obj) {
        var obj = $(obj);
        obj.val(i18n.get_msg(obj.val()));
    });
},
};

function _(msg) {
    return i18n.get_msg(msg);
}    


