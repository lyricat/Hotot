var kismet = {
/* rule: {
        name: Name,
        disabled: 0,
        field: 0|1|2,       //'name|text|source',
        type: 0|1,          // 0: text, 1: regexp
        method: 0|1|2|3     // 0: eq, 1: in, 2: startswith, 3: endswith
        pattern: Text       
        actions: [0,1,2,3]     //['drop', 'notify', 'mask', 'archive'],
        archive_name: '',
  }
 * */
rules: [],

procs: [],

archive_names: [],

init:
function init() {
    kismet.procs = [
        kismet.drop, kismet.notify, kismet.mask, kismet.archive
    ];
    kismet.rules = [
        /*
        { name: 'Rule #1', disabled: 1, field: 0, type: 0, method: 0
        , pattern: 'shellex', actions:[0,1], archive_name:'', order: 0},
        { name: 'Rule #2', disabled: 1, field: 1, type: 1, method: 0
        , pattern: '.*FuckGFW.*', actions:[0], archive_name:'', order: 0},
        { name: 'Rule #3', disabled: 1, field: 2, type: 0, method: 0
        , pattern: 'foursquare', actions:[0,3], archive_name:'Location', order: 0},
        */
    ];
},

load:
function load() {
     kismet.rules = conf.get_current_profile().preferences.kismet_rules;  
},

save:
function save() {
    conf.get_current_profile().preferences.kismet_rules = kismet.rules;
    conf.save_prefs(conf.current_name);
},

get_field_value:
function get_field_value(field_code, tweet) {
    if (field_code == 0) {
        return (tweet.user != undefined)?tweet.user.screen_name
            :tweet.sender.screen_name;
    } else if (field_code == 1) {
        return tweet.text;
    } else {
        return tweet.source;
    }
},

filter:
function filter(tweets) {
    for (var i = 0, l = tweets.length; i < l; i += 1) {
        var tweet = tweets[i];
        var last_drop = false;
        var already_drop = false;
        for (var j = 0; j < kismet.rules.length; j += 1) {
            if (kismet.rules[j].disabled == 1) {break;}
            var rule = kismet.rules[j];
            var field_value = kismet.get_field_value(rule.field, tweet);
            var ret = false;
            if (rule.type == 0) { // plain text
                var check = null;
                switch (rule.method) {
                case 0:
                    ret = rule.pattern == field_value;
                break;
                case 1: 
                    hotot_log(kismet.rules[j].pattern, field_value);
                    ret = field_value.indexOf(rule.pattern) != -1;
                break;
                case 2: 
                    ret = field_value.indexOf(rule.pattern) == 0;
                break;
                case 3: 
                    ret = field_value.indexOf(rule.pattern) == field_value.length - rule.pattern.length;
                break;
                default : break;
                }
            } else { // regexp
                //@TODO 
            }
            if (ret) {
                for (var k = 0; k < rule.actions.length; k += 1) {
                    var act = rule.actions[k];
                    if (act == 0) {
                        last_drop = true;
                    } else {
                        kismet.procs[act](tweets, i);
                    }
                }
                if (last_drop && !already_drop) { 
                    l -= 1;
                    already_drop = true;
                    kismet.drop(tweets, i);
                }
            }
        }
    }
},

drop:
function drop(tweets, i) {
    tweets.splice(i, 1);
},

notify:
function notify(tweets, i) {
    var user = tweets[i].hasOwnProperty('user')? tweets[i].user:tweets[i].sender;
    hotot_notify(user.screen_name, tweets[i].text
        , user.profile_image_url , 'content');
},

mask:
function mask(tweets, i) {
    hotot_log('Kismet', 'do mask');
},

archive:
function notify(tweets, i) {
    hotot_log('Kismet', 'do archive');
},
};


