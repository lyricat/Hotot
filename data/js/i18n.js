var i18n = {
default_locale: window.navigator.language.replace('-', '_'),

locale: window.navigator.language.replace('-', '_'),

forced: false,

dict: {},

init:
function init(callback) {
    i18n.change(i18n.locale, callback);
    return ;
},

change:
function change(code, callback) {
    if (code == 'auto') {
        i18n.forced = false;
        code = i18n.locale;
    } else {
        i18n.forced = true;
    }
    if (i18n.current == code) {
        return;
    }
    i18n.current = code;
    if (conf.vars.platform == 'Chrome' && !i18n.forced) {
        i18n.trans_html();
        if (callback != undefined)
            callback();
    } else {
        $.getJSON('_locales/' + code + '/messages.json',
        function (result) {
            hotot_log('i18n', 'Use locale: ' + code);
            i18n.load_dict(result);
            i18n.trans_html();
            if (callback != undefined)
                callback();
        }).error(function(jqXHR, txt, err){
            hotot_log('i18n', txt);
            hotot_log('i18n', 'Load messages "'+ code +'" failed. Use default locale: '+i18n.default_locale);
            $.getJSON('_locales/en/messages.json',
            function (result) {
                i18n.load_dict(result);
                i18n.trans_html();
                if (callback != undefined)
                    callback();
            });
        });
    }
    if (conf.vars.platform == 'Chrome') {
        $('#tbox_status_speech').attr('lang', i18n.current.replace('_', '-'));
    }
},

load_dict:
function load_dict(new_dict) {
    i18n.dict = new_dict;
},

get_message:
function get_message(msg) {
    if (conf.vars.platform == 'Chrome' && !i18n.forced) {
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
}
};

function _(msg) {
    var ret = i18n.get_message(msg);
    if (ret) {
        return ret;
    } else {
        return msg;
    }
}    


