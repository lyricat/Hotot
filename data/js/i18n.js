var i18n = {
default_locale: 'en',

locale: 'en',

dict: {},

init:
function init(callback) {
    if (conf.vars.platform == 'Chrome') {
        i18n.locale =  window.navigator.language.replace('-', '_');
        i18n.trans_html();
        callback();
    } else {
        $.getJSON('_locales/' + i18n.locale + '/messages.json',
        function (result) {
            hotot_log('i18n', 'use locale: '+i18n.locale);
            i18n.load_dict(result);
            i18n.trans_html();
            callback();
        }).error(function(){
            hotot_log('i18n', 'use default locale: '+i18n.default_locale);
            $.getJSON('_locales/en/messages.json',
            function (result) {
                i18n.load_dict(result);
                i18n.trans_html();
                callback();
            });
        });
    }
},

load_dict:
function load_dict(new_dict) {
    i18n.dict = new_dict;
},

get_message:
function get_message(msg) {
    if (conf.vars.platform == 'Chrome') {
        return chrome.i18n.getMessage(msg);
    } else {
        if (i18n.dict != null && i18n.dict.hasOwnProperty(msg)) {
            return i18n.dict[msg].message;
        } else {
            return '';
        }
    }
},

trans_html:
function trans_html() {
    $('*[data-i18n-text]').each(function(idx, obj) {
        var obj = $(obj);
        var msg = i18n.get_message(obj.attr('data-i18n-text'));
        if (msg) {
            obj.text(msg);
        }
    });
    $('*[data-i18n-title]').each(function(idx, obj) {
        var obj = $(obj);
        var msg = i18n.get_message(obj.attr('data-i18n-title'));
        if (msg) {
            obj.attr('title', msg);
        }
    });
    $('*[data-i18n-value]').each(function(idx, obj) {
        var obj = $(obj);
        var msg = i18n.get_message(obj.attr('data-i18n-value'));
        if (msg) {
            obj.val(msg);
        }
    });
},
};

function _(msg) {
    var ret = i18n.get_message(msg);
    if (ret) {
        return ret;
    } else {
        return msg;
    }
}    


