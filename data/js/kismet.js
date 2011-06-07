var kismet = {
/* rule: {
 *      "name": NAME,
 *      "fields": ["name", "text", "source"]
 *      "regexp": RegExp
 * }
 * */
filters: {},

init:
function init() {
    kismet.filters = {
        hide: {
            rules:[],
            proc: kismet.do_hide
        },
        drop: {
            rules:[],
            proc: kismet.do_hide
        },
        notify: {
            rules:[],
            proc: kismet.do_hide
        },
    };
    kismet.test()
},

filter:
function filter(type, tweet_objs) {
    var rules = kismet.filters[type].rules;
    var proc = kismet.filters[type].proc;
    var f_name, f_text, f_source;
    for (var i = 0, l = tweet_objs.length; i < l; i += 1) {
        for (var j = 0; j < rules.length; j += 1) {
            var m = tweet_objs[i].text.match(rules[j].regexp);
            if (m) {
                proc(tweet_objs[i]);
            }
        }
    }
},

add_filter:
function add_filter(rule, action) {
    var _rules = kismet.filters[action].rules;
    for (var i = 0, l = _rules.length; i < l; i += 1) {
        if (_rules[i].name == rule.name) {
            return -1;
        }
    }
    _rules.push(rule);
    return 0;
},

test:
function test() {
    kismet.add_filter(
        {name: 'test', fields: ['text'], regexp: /^.+@shellex/}
        , 'hide');
},

remove_filter:
function remove_filter(name) {
    // @TODO
},

do_hide:
function do_hide(tweet_obj) {
    hotot_log('do_hide', tweet_obj.text);
    $(tweet_obj).hide()
},

do_drop:
function do_drop(tweet_obj) {
    hotot_log('do_drop', tweet_obj.id_str);
},

do_notify:
function do_notify(tweet_obj) {
    hotot_log('do_notify', tweet_obj.id_str);
},

};


