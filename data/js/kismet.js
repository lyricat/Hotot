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

enforcer: {},

procs: {},

archive_names: [],

mask_text: '******** Masked Text Field ********',

init:
function init() {
    kismet.procs = {
        drop: kismet.drop, 
        notify: kismet.notify, 
        mask: kismet.mask, 
        archive: kismet.archive
    };
    kismet.rules = [];
    kismet.enforcer = {
        drop: [],
        notify: [],
        mask: [],
        archive: [],
    };
},

load:
function load() {
     kismet.rules = conf.get_current_profile().preferences.kismet_rules;  
     kismet.update_rules();
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
            :((tweet.sender != undefined)?tweet.sender.screen_name
                :tweet.from_user);
    } else if (field_code == 1) {
        return tweet.text;
    } else {
        return (tweet.source != undefined)?tweet.source:'';
    }
},

filter:
function filter(tweets, action) {
    for (var i = 0, l = tweets.length; i < l; i += 1) {
        var tweet = tweets[i];
        for (var j = 0; j < kismet.enforcer[action].length; j += 1) {
            var rule = kismet.enforcer[action][j];
            if (rule.disabled == 1) {
                continue;
            }
            var field_value = kismet.get_field_value(rule.field, tweet);
            var ret = false;
            if (rule.type == 0) { // plain text
                var check = null;
                switch (rule.method) {
                case 0:
                    ret = rule.pattern == field_value;
                break;
                case 1: 
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
                ret = rule.pattern.test(field_value);
            }
            if (ret) {
                kismet.procs[action](tweets, i);
                if (action == 'drop') { l -= 1; }
            }
        }
    }
},

update_rules: 
function update_rules() {
    kismet.enforcer = {
        drop: [],
        notify: [],
        mask: [],
        archive: [],
    };
    for (var i = 0; i < kismet.rules.length; i += 1) {
        var rule = $.extend(true, {}, kismet.rules[i]);
        if (rule.type == 1) {
            rule.pattern = new RegExp(rule.pattern, 'i');   
        }
        for (var j = 0; j < rule.actions.length; j += 1) {
            switch (rule.actions[j]) {
            case 0:
                kismet.enforcer.drop.push(rule);
            break;
            case 1:
                kismet.enforcer.notify.push(rule);
            break;
            case 2:
                kismet.enforcer.mask.push(rule);
            break;
            case 3:
                kismet.enforcer.archive.push(rule);
            break;
            default: break;
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
    var tweet = $.extend(true, {}, tweets[i]);
    tweets[i].text = kismet.mask_text;
    db.dump_tweets([tweet]);
},

archive:
function notify(tweets, i) {
    hotot_log('Kismet', 'do archive');
},
};


