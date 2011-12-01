var kismet = {

    ERROR: -1,

    OP_ATOM:0,
//unary operator
    OP_NOT: 1,      // !
//binary operator
    OP_EQ:  2,      // == 
    OP_NEQ: 3,      // !=
    OP_TEQ: 4,      // ===
    OP_GT:  5,      // >
    OP_LT:  6,      // <
    OP_GE:  7,      // >=
    OP_LE:  8,      // <=
//string operator
    OP_STR_HAS: 11,
    OP_STR_STARTSWITH: 12,
    OP_STR_ENDSWITH: 13,
//re operator
    OP_REG_TEST: 14,
// misc
    OP_HASH_HAS: 15,
    OP_MENTION_HAS: 16,
    OP_HAS_GEO: 17,
    OP_HAS_LINK: 18,

    ACT_DROP: 100,
    ACT_NOTIFY: 101,
    ACT_MASK: 102,
    ACT_ARCHIVE: 103,
    ACT_REPLY: 104,
    ACT_QUOTE: 105,
    
    TYPE_WORD: 200,
    TYPE_STR: 201,
    TYPE_RE: 202,
    TYPE_LBRA: 203,
    TYPE_RBRA: 204,
    TYPE_COLON: 205,

    act_code_map: [],

    MASK_TEXT: '******** Masked Text Field ********',

    reserved_words: ['has', 'name', 'tag', 'via', 'do', 'mention'],

    mute_list: {},

    rules: [],

    enforcers: [],

/* 
   condition express:
    cond_exp := [op, arg_list]
    op := OP_BLAH
   
   action express:
    act_exp := [act, arg_list]
    act := ACT_BLAH
 */

/*
    enforcer = {
        name: name,
        cond: [cond_exp, cond_exp ... cond_exp]
        action: [act_exp, act_exp ... act_exp]
    } 

    text:
    $rule := $field $field $field ...
    $field := $word | $field_key:$word
    $field_key := via | name | mention | tag | has | do 
    $word := "[all char]+" | [all char without \s, \\ and : ]+ 
                | /[all char]+/i*
    
 */
init:
function init() {
    kismet.mute_list = {
        'name': [],
        'word': [],
        'source': [],
    }
    kismet.act_code_map = [kismet.ACT_DROP, kismet.ACT_NOTIFY, kismet.ACT_MASK, kismet.ACT_ARCHIVE, kismet.ACT_REPLY, kismet.ACT_QUOTE];
},

load:
function load() {
    var active_profile = conf.get_current_profile();
    // load mute list
    kismet.mute_list = active_profile.preferences.kismet_mute_list;
    if (!kismet.mute_list || kismet.mute_list.constructor != Object) {
        kismet.mute_list = {'name': [], 'word': [], 'source':[]};
    }
    // load rules
    kismet.rules = active_profile.preferences.kismet_rules;
    if (kismet.rules.constructor != Array) {
        kismet.rules = [];
    }
    kismet.enforcers = [];
    for (var i = 0; i < kismet.rules.length; i += 1) {
        kismet.update_rule(kismet.rules[i]);
    }
},

save:
function save() {
    if (typeof conf != 'undefined') {
        conf.get_current_profile().preferences.kismet_rules = kismet.rules;
        conf.get_current_profile().preferences.kismet_mute_list = kismet.mute_list;
        conf.save_prefs(conf.current_name);
    }
},

update_rule:
function update_rule(rule) {
    var notfound = true;
    for (var i = 0; i < kismet.rules.length; i += 1) {
        if (kismet.rules[i].name == rule.name) {
            kismet.rules[i] = rule;
            notfound = false;
            break;
        }
    }
    if (notfound) {
        kismet.rules.push(rule);
    }
    notfound = true;
    var rule_cc = kismet.compile(rule.data);
    rule_cc.name = rule.name;
    for (var i = 0; i < kismet.enforcers.length; i += 1) {
        if (kismet.enforcers[i].name == rule_cc.name) {
            kismet.enforcers[i] = rule_cc;
            notfound = false;
            break;
        }
    }
    if (notfound) {
        kismet.enforcers.push(rule_cc);
    }
},

remove_rule:
function remove_rule(name) {
    for (var i = 0; i < kismet.rules.length; i += 1) {
        if (kismet.rules[i].name == name) {
            kismet.rules.splice(i, 1);
            break;
        }
    }        
    for (var i = 0; i < kismet.enforcers.length; i += 1) {
        if (kismet.enforcers[i].name == name) {
            kismet.enforcers.splice(i, 1);
            break;
        }
    }  
},

update_mute_list:
function update_mute_list(field, value) {
    if (kismet.mute_list[field].indexOf(value) == -1) {
        kismet.mute_list[field].push(value);
    }
},

eval_bool_exp:
function eval_bool_exp (exp, incoming) {
    if (!exp) return false;
    if (exp[0] === kismet.OP_ATOM) {
        return exp[1];
    }
    var t0 = null; var t1 = null;
    var vholder = null;
    var arg0 = exp[1] || false;
    var arg1 = exp[2] || false;
    // console.log('eval:', exp[0],':', arg0,',' ,arg1)
    if (arg0.constructor == String && arg0[0] == '$') {
        t0 = kismet.get_holder_value(arg0, incoming);
    } else {
        t0 = arg0;
    } 
    if (arg1.constructor == String && arg1[0] == '$') {
        t1 = kismet.get_holder_value(arg1, incoming);
    } else {
        t1 = arg1;
    }
    // console.log('eval:', exp[0],':', t0,',' ,t1)
    switch (exp[0]) {
    case kismet.OP_NOT:
        return (!t0);
    break;
    case kismet.OP_EQ:
        return (t1 == t0); 
    break;
    case kismet.OP_NEQ:
        return (t1 != t0); 
    break;
    case kismet.OP_TEQ:
        return (t1 === t0); 
    break;
    case kismet.OP_GT:
        return (t0 > t1);
    break;
    case kismet.OP_LT:
        return (t0 < t1);
    break;
    case kismet.OP_GE:
        return (t0 >= t1);
    break;
    case kismet.OP_LE:
        return (t0 <= t1);
    break;
    case kismet.OP_STR_HAS:
        return (t0.indexOf(t1) != -1);
    break;
    case kismet.OP_STR_STARTSWITH:
        return (t0.indexOf(t1) == 0);
    break;
    case kismet.OP_STR_ENDSWITH:
        return (t0.lastIndexOf(t1) == (t0.length - t1.length));
    break;
    case kismet.OP_REG_TEST:
        return t0.test(t1);
    break;
    case kismet.OP_HASH_HAS:
        if (t1.constructor == RegExp)
            return (t0.filter(function(x) {return t1.test(x)}).length!=0);
        else 
            return (t0.indexOf(t1) != -1);
    break;
    case kismet.OP_MENTION_HAS:
        if (t1.constructor == RegExp)
            return (t0.filter(function(x) {return t1.test(x)}).length!=0);
        else
            return (t0.indexOf(t1) != -1);
    break;
    case kismet.OP_HAS_GEO:
        return (t0);
    break;
    case kismet.OP_HAS_LINK:
        return (t0.length != 0);
    break;
    }
    return false;
},

eval_cond:
function eval_cond(cond, incoming) {
    if (cond.length == 1) {
        return kismet.eval_bool_exp(cond[0], incoming);
    } else {
        return cond.reduce(function (a, b) {
            return kismet.eval_bool_exp(a, incoming) && kismet.eval_bool_exp(b, incoming);
        });
    }
},

do_action:
function do_action(rule, incoming) {
    var ret = true;
    for (var i = 0; i < rule.action.length; i += 1) {
        var act = rule.action[i];
        switch (act[0]) {
        case kismet.ACT_DROP:
            kismet.do_drop(rule, act,  incoming);
            ret = false;
        break;
        case kismet.ACT_MASK:
            kismet.do_mask(rule, act, incoming);
        break;
        case kismet.ACT_NOTIFY:
            kismet.do_notify(rule, act, incoming);
        break;
        case kismet.ACT_ARCHIVE:
            kismet.do_archive(rule, act, incoming);
        break;
        case kismet.ACT_REPLY:
            kismet.do_reply(rule, act, incoming);
        break;
        case kismet.ACT_QUOTE:
            kismet.do_quote(rule, act, incoming);
        break;
        }
    }
    return ret;
},

do_drop:
function do_drop(rule, act, incoming) {
    console.log('[ACT]', 'Drop the incoming!');
},

do_notify:
function do_notify(rule, act, incoming) {
    var user = incoming.hasOwnProperty('user')? 
            incoming.user: incoming.sender;
    hotot_notify(user.screen_name, incoming.text
        , user.profile_image_url , 'content');
},

do_archive:
function do_archive(rule, act, incoming) {
    console.log('[ACT]','Archive the incoming!');
    var formal_name = encodeBase64(rule.name).replace(/=/g, '_');
    if (!ui.Main.views.hasOwnProperty('kismet_' + formal_name)) {
        ui.Slider.add('kismet_'+ formal_name, 
          {title:'Kismet # ' + rule.name, icon:'image/ic_archive.png'}
        , { 'type':'tweet', 'title': 'Kismet # '+ rule.name
            , 'load': null 
            , 'loadmore': null
            , 'load_success': ui.Main.load_tweet_success
            , 'load_fail': null
            , 'loadmore_success': null
            , 'loadmore_fail': null
            , 'former': ui.Template.form_tweet
            , 'destroy': function destroy(view) {
                ui.Slider.remove(view.name);
            }
            , 'method': 'poll'
            , 'interval': -1
            , 'item_type': 'id'
        });
        ui.Slider.slide_to(ui.Slider.current);
    }
    ui.Main.views['kismet_' + formal_name].load_success([incoming]);
},

do_reply:
function do_reply(rule, act, incoming) {
    console.log('[ACT]', 'Make a response!');
    var user = incoming.hasOwnProperty('user')? 
            incoming.user: incoming.sender;
    if (typeof globals != 'undefined' &&
        user.screen_name != globals.myself.screen_name) {
        reply_tweet(incoming.id_str, '@'+user.screen_name + ' ' + act[1]); 
    }
},

do_quote:
function do_quote(rule, act, incoming) {
    console.log('[ACT]', 'Make a quote!');
    var user = incoming.hasOwnProperty('user')? 
            incoming.user: incoming.sender;
    if (typeof globals != 'undefined' &&
        user.screen_name != globals.myself.screen_name) {
        update_status(act[1] + ' RT @' + user.screen_name + ':'+ incoming.text); 
    }
},

do_mask:
function do_mask(rule, act, incoming) {
    incoming.text = kismet.MASK_TEXT;
    console.log('[ACT]', 'Mask the incoming!');
},

filter_proc:
function filter_proc(single) {
    var ret = true;
    var user = single.hasOwnProperty('user')? single.user:
                single.hasOwnProperty('sender')?single.sender: null;
    // check mute_list
    for (var i = 0; i < kismet.mute_list.name.length; i += 1) {
        if (user && user.screen_name === kismet.mute_list.name[i]) {
            return false;
        }
    }
    for (var i = 0; i < kismet.mute_list.source.length; i += 1) {
        if (single.source && single.source.replace(/<.*?>/g, '') === kismet.mute_list.source[i]) {
            return false;
        }
    }
    for (var i = 0; i < kismet.mute_list.word.length; i += 1) {
        if (single.text && single.text.indexOf(kismet.mute_list.word[i]) !== -1) {
            return false;
        }
    }
    // check rules
    for (var i = 0; i < kismet.enforcers.length; i += 1) {
        if (kismet.eval_cond(kismet.enforcers[i].cond, single)) {
            console.log('Match rule #' + i +' "'+kismet.enforcers[i].name+'" @', single);
            ret = kismet.do_action(kismet.enforcers[i], single);
            if (!ret) break;
        }
    } 
    return ret;
},

filter:
function filter(incoming) {
    return incoming.filter(kismet.filter_proc);
},

get_holder_value:
function get_holder_value(name, tweet) {
    var user = tweet.hasOwnProperty('user')? tweet.user:
                tweet.hasOwnProperty('sender')?tweet.sender: null;
    switch(name) {
    case '$NAME':
        return user?user.screen_name:'';
    break;
    case '$TEXT':
        return tweet.text;
    break;
    case '$SOURCE':
        if (tweet.source)
            return tweet.source.replace(/<.*?>/g, '');
        else
            return '';
    break;
    case '$HASHTAGS':
        if (tweet.entities && tweet.entities.hashtags)
            return tweet.entities.hashtags.map(function (t) {return t.text});
        else
            return [];
    break;
    case '$MENIONS':
        if (tweet.entities && tweet.entities.user_mentions)
            return tweet.entities.user_mentions.map(function(t){return t.screen_name});
        else
            return [];
    break;
    case '$LINKS':
        if (tweet.entities && tweet.entities.urls)
            return tweet.entities.urls.map(function(t){return t.expanded_url});
        else
            return [];
    break;
    case '$GEO':
        return tweet.geo;
    break;
    default:
        return name;
    break;
    }
},

process_action:
function process_action(tokens, pos) {
    switch (tokens[pos][1]) {
    case 'drop':
        kismet.action_string_array.push('DROP the tweet');
        return [[kismet.ACT_DROP], 3];
    break;
    case 'mask':
        kismet.action_string_array.push('MASK the tweet');
        return [[kismet.ACT_MASK], 3];
    break;
    case 'notify':
        kismet.action_string_array.push('NOTIFY me');
        return [[kismet.ACT_NOTIFY], 3];
    break;
    case 'archive':
        kismet.action_string_array.push('ARCHIVE the tweet');
        return [[kismet.ACT_ARCHIVE], 3];
    break;
    case 'reply':
        if (tokens.length < pos + 3 || 
            (tokens[pos + 1][0] != kismet.TYPE_LBRA && 
            tokens[pos + 3][0] != kismet.TYPE_RBRA && 
            tokens[pos + 2][0] != kismet.TYPE_STR)) {
            return [kismet.ERROR, 3];
        }
        kismet.action_string_array.push('REPLY the tweet');
        return [[kismet.ACT_REPLY, tokens[pos + 2][1]], 6];
    break;
    case 'quote':
        if (tokens.length < pos + 3 || 
            (tokens[pos + 1][0] != kismet.TYPE_LBRA && 
            tokens[pos + 3][0] != kismet.TYPE_RBRA && 
            tokens[pos + 2][0] != kismet.TYPE_STR)) {
            return [kismet.ERROR, 3];
        }
        kismet.action_string_array.push('QUOTE the tweet');
        return [[kismet.ACT_QUOTE, tokens[pos + 2][1]], 6];
    break;
    default:
        return [kismet.ERROR, 3];
    break;
    }
},

process_has:
function process_has(tokens, pos) {
    switch (tokens[pos][1]) {
    case 'map':
    case 'geo':
        kismet.cond_string_array.push('HAS geo info');
        return [[kismet.OP_HAS_GEO], 3];
    break;
    case 'link':
    case 'url':
        kismet.cond_string_array.push('HAS link');
        return [[kismet.OP_HAS_LINK], 3];
    break;
    default:
        return [kismet.ERROR, 3];
    break;
    }
},

process_field:
function process_field(tokens, pos) {
    var first = tokens[pos], second = null, third = null;
    if (pos + 2 >= tokens.length) {
        kismet.cond_string_array.push('CONTAINS ' + first[1]);
        return [[kismet.OP_STR_HAS, '$TEXT', first[1]], 1];
    }
    if (tokens[pos + 1][0] != kismet.TYPE_COLON) {
        return [kismet.ERROR, 1];
    }
    if (tokens[pos + 2][0] != kismet.TYPE_WORD &&
        tokens[pos + 2][0] != kismet.TYPE_STR &&
        tokens[pos + 2][0] != kismet.TYPE_RE) {
        return [kismet.ERROR, 3];
    }
    second = tokens[pos + 2];
    switch (first[1]) {
    case 'via':
        if (second[0] == kismet.TYPE_RE) {
            kismet.cond_string_array.push('COMES FROM /'+second[1]+'/'+second[2]);
            return [[kismet.OP_REG_TEST, new RegExp(second[1],second[2]), '$SOURCE'], 3];
        } else {
            kismet.cond_string_array.push('COMES FROM ' + second[1]);
            return [[kismet.OP_TEQ, '$SOURCE', second[1]], 3];
        }
    break;
    case 'do':
        return kismet.process_action(tokens, pos + 2);
    break;
    case 'tag':
        if (second[0] == kismet.TYPE_RE) {
            kismet.cond_string_array.push('TAGGED @' + second[1]);
            return [[kismet.OP_HASH_HAS, '$HASHTAGS', new RegExp(second[1],second[2])], 3];
        } else {
            kismet.cond_string_array.push('TAGGED AS #' + second[1]);
            return [[kismet.OP_HASH_HAS, '$HASHTAGS', second[1]], 3];
        }
    break;
    case 'name':
        if (second[0] == kismet.TYPE_RE) {
            kismet.cond_string_array.push('SENT BY @/'+second[1]+'/'+second[2]);
            return [[kismet.OP_REG_TEST, new RegExp(second[1],second[2]), '$NAME'], 3];
        } else {
            kismet.cond_string_array.push('SENT BY @' + second[1]);
            return [[kismet.OP_TEQ, '$NAME', second[1]], 3];
        }
    break;
    case 'mention':
        if (second[0] == kismet.TYPE_RE) {
            kismet.cond_string_array.push('MENIONS @' + second[1]);
            return [[kismet.OP_MENTION_HAS, '$MENIONS', new RegExp(second[1],second[2])], 3];
        } else {
            kismet.cond_string_array.push('MENIONS @' + second[1]);
            return [[kismet.OP_MENTION_HAS, '$MENIONS', second[1]], 3];
        }
    break;
    case 'has':
        return kismet.process_has(val);
    break;
    default:
        return [kismet.ERROR, 3];
    break;
    }
},

recognize_string:
function recognize_string(str, pos) {
    var ch = str[pos];
    var last = ch;
    while (pos < str.length) {
        last = ch;
        ch = str[pos];
        if (ch === '"' && last != '\\') {
            break;
        }
        pos += 1;
    }
    return pos;
},

recognize_re:
function recognize_re(str, pos) {
    var ch = str[pos];
    var last = ch;
    while (pos < str.length) {
        last = ch;
        ch = str[pos];
        if (ch === '/' && last != '\\') {
            break;
        }
        pos += 1;
    }
    return pos; 
},

recognize_keyword:
function recognize_keyword(str, pos) {
    var ch = str[pos];
    var last = ch;
    while (pos < str.length) {
        last = ch;
        ch = str[pos];
        if (/[\s:()]/.test(ch)) {
            break;
        }
        pos += 1;
    }
    return pos; 
},

read_tokens:
function read_tokens(str) {
    // @TODO 
    var token_list = [];
    var pos = 0, end_pos = 0;
    var ch = str[0];
    while (pos < str.length) {
        ch = str[pos];
        if (ch === '"') {
            end_pos = kismet.recognize_string(str, pos + 1);
            token = [kismet.TYPE_STR, str.slice(pos + 1, end_pos)];
            token_list.push(token);
            pos = end_pos + 1;
        } else if (ch === '/') {
            end_pos = kismet.recognize_re(str, pos+1);
            var flag = (/[a-z]/.test(str[end_pos+1]))?str[end_pos+1]:'';
            token = [kismet.TYPE_RE, str.slice(pos + 1, end_pos), flag];
            token_list.push(token);
            pos = end_pos + 1;
            if (flag.length != 0) pos += 1;
        } else if (ch === ' ') {
            pos += 1;
        } else if (/[a-zA-Z]/.test(ch)) {
            end_pos = kismet.recognize_keyword(str, pos);
            token = [kismet.TYPE_WORD, str.slice(pos, end_pos)];
            token_list.push(token);
            pos = end_pos;
        } else if (ch === '(') {
            token_list.push([kismet.TYPE_LBRA, '(']); 
            pos += 1;
        } else if (ch === ')') {
            token_list.push([kismet.TYPE_RBRA, ')']); 
            pos += 1;
        } else if (ch === ':') {
            token_list.push([kismet.TYPE_COLON, ':']); 
            pos += 1;
        } else {
            pos += 1;
        }
    }
    return token_list;
    return str.split(/\s/).filter(function (x) {return x.length != 0;} )
},

compile:
function compile(str) {
    var tokens = kismet.read_tokens(str);
    var field_key = null;
    var field_value = null;
    var inst = null;
    var rule = {name: '', cond: [], action: []};
    var i = 0;
    var token = null;
    kismet.rule_string = '';
    kismet.action_string_array = [];
    kismet.cond_string_array = [];
    while (i < tokens.length) {
        token = tokens[i];
        inst = null;
        switch (token[0]) {
        case kismet.TYPE_WORD:
            if (kismet.reserved_words.indexOf(token[1]) == -1) {
                kismet.cond_string_array.push('CONTAINS ' + token[1]);
                inst = [kismet.OP_STR_HAS, "$TEXT", token[1]];
                i += 1;
            } else {
                ret = kismet.process_field(tokens, i);
                if (ret != kismet.ERROR)
                    inst = ret[0];
                i += ret[1];
            }
        break;
        case kismet.TYPE_STR:
            kismet.cond_string_array.push('CONTAINS ' + token[1]);
            inst = [kismet.OP_STR_HAS, "$TEXT", token[1]];
            i += 1;
        break;
        case kismet.TYPE_RE:
            kismet.cond_string_array.push('MATCH /'+token[1]+'/'+token[2]);
            inst = [kismet.OP_REG_TEST, new RegExp(token[1], token[2]), '$TEXT'];
            i += 1;
        break;
        default:
            i += 1;
        break;
        }
        if (inst != null) {
            if (kismet.act_code_map.indexOf(inst[0]) != -1) {
                rule.action.push(inst);
            } else {
                rule.cond.push(inst);
            }
        }
    }
    // generate docs
    if (kismet.action_string_array.length == 0) {
        kismet.action_string_array.push('Drop the tweet');
    }
    if (kismet.cond_string_array.length == 0) {
        return kismet.ERROR;
    }
    kismet.rule_string = kismet.action_string_array.join(' and ')
        + ' if it '
        + kismet.cond_string_array.join(' and ');
    // console.log('Compile:', rule)
    return rule;
},

};


