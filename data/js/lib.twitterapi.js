if (typeof (lib) == 'undefined') var lib = {}

lib.twitterapi = {

use_oauth: false,

username: '',

password: '',

api_base: 'https://api.twitter.com/',

sign_api_base: 'https://api.twitter.com/',

search_api_base2: 'https://twitter.com/phoenix_search.phoenix',

use_same_sign_api_base: true,

source: 'Hotot',

http_code_msg_table : {
      401: 'Server cannot authenticate you. Please check your username/password and API base.'
    , 404: 'The URL you request does not exist. Please check your API Base/OAuth Base/Search Base.'
    , 500: 'Server is broken. Please try again later.'
    , 502: 'Server is down or being upgraded. Please try again later.'
    , 503: 'Server is overcapacity. Please try again later.'
},

default_error_handler:
function default_error_handler(xhr, textStatus, errorThrown) {
    var msg = '';
    var tech_info = '';
    if (xhr.status in lib.twitterapi.http_code_msg_table) {
        msg = lib.twitterapi.http_code_msg_table[xhr.status];
        tech_info = 'HTTP Code:'+ xhr.status + '\nDetails:'+ xhr.statusText;
    } else {
        msg = 'Unknow Error';
        tech_info = 'HTTP Code:' + xhr.status + '\nReason:'+ xhr.statusText;
    }
    try {
        ui.ErrorDlg.alert('Ooops, An API Error Occurred!', msg, tech_info);
    } catch (e) {
        hotot_log('Error:'+xhr.status, xhr.statusText);
    }
    return;
},

success_handler:
function success_handler(data, textStatus, xhr) {
    lib.twitterapi.ratelimit_limit = xhr.getResponseHeader('X-RateLimit-Limit');
    lib.twitterapi.ratelimit_remaning = xhr.getResponseHeader('X-RateLimit-Remaining');
    lib.twitterapi.ratelimit_reset = xhr.getResponseHeader('X-RateLimit-Reset');
    if (lib.twitterapi.ratelimit_limit == null) { return; }
    var html = '<span>'+_('my_power')+': {%REMANING%}/{%LIMIT%} - <span style="color:{%STATUS_COLOR%}">{%STATUS%}</span></span><br><span>'+_('reset_time') +': {%RESET_TIME%}</span>';
    html = html.replace('{%REMANING%}', lib.twitterapi.ratelimit_remaning);
    html = html.replace('{%LIMIT%}', lib.twitterapi.ratelimit_limit);
    var d = new Date();
    d.setTime(lib.twitterapi.ratelimit_reset * 1000);
    html = html.replace('{%RESET_TIME%}', d.toLocaleTimeString());
    var k = lib.twitterapi.ratelimit_remaning / lib.twitterapi.ratelimit_limit;
    html = html.replace('{%STATUS%}', k < 0.25? _('nearly_dead') 
        : k < 0.5? _('weakness'): k < 0.75? _('fine'): _('powerfull'));
    html = html.replace('{%STATUS_COLOR%}', k < 0.25? '#f33' 
        : k < 0.5? 'yellow': k < 0.75? 'lightgreen': '#0f3');
    globals.ratelimit_bubble.set_content(html);
},

basic_auth:
function basic_auth() {
    return 'Basic ' + encodeBase64(
        lib.twitterapi.username + ':' + lib.twitterapi.password);
},

get:
function get(ajax_url, ajax_params, on_success, on_error) {
    lib.twitterapi.do_ajax('GET', ajax_url, ajax_params, {},
        function(result, textStatus, xhr) {
            lib.twitterapi.success_handler(result, textStatus, xhr);
            on_success(result, textStatus, xhr);
        },
        function(xhr, textStatus, errorThrown) {
            if (on_error == undefined || on_error == null) {
                lib.twitterapi.default_error_handler(xhr, textStatus, errorThrown);
            } else {
                on_error(xhr, textStatus, errorThrown);
            }
        }
    );
},

post:
function post(ajax_url, ajax_params, on_success, on_error) {
    lib.twitterapi.do_ajax('POST', ajax_url, ajax_params, {},
        function(result, textStatus, xhr) {
            lib.twitterapi.success_handler(result, textStatus, xhr);
            on_success(result, textStatus, xhr);
        },
        function(xhr, textStatus, errorThrown) {
            if (on_error ==  undefined || on_error == null) {
                lib.twitterapi.default_error_handler(xhr, textStatus, errorThrown);
            } else {
                on_error(xhr, textStatus, errorThrown);
            }
        }
    );
},

do_ajax:
function do_ajax(method, url, params, headers, on_success, on_error){
    params['source'] = lib.twitterapi.source;
    sign_url = lib.twitterapi.use_same_sign_api_base? url
        :url.replace(lib.twitterapi.api_base, lib.twitterapi.sign_api_base);

    if (lib.twitterapi.use_oauth) {
        var signed_params = jsOAuth.form_signed_params(
              sign_url
            , jsOAuth.access_token
            , method
            , params
            , lib.network.py_request && method == 'POST');
        if (method == 'GET') {
            url = url + '?' + signed_params;
            params = {};
        } else {
            params = signed_params
        }
        lib.network.do_request(
            method
            , url
            , params
            , headers
            , null 
            , on_success
            , on_error
            );
    } else {
        if (method == 'GET') {
            arr = []
            for (var k in params) {
                arr.push(encodeURIComponent(k)
                    + '='
                    + encodeURIComponent(params[k]));
            }
            url = url + '?' + arr.join('&');
            params = {};
        }
        headers['Authorization']= lib.twitterapi.basic_auth();
        lib.network.do_request(
            method
            , url
            , params
            , headers
            , null
            , on_success
            , on_error
            );
    }
},

update_status:
function update_status(text, reply_to_id, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/update.json';
    var params = {'status': text, 'include_entities': '1'};
    if (reply_to_id) {
        params['in_reply_to_status_id'] = reply_to_id;
    }
    lib.twitterapi.post(url, params, on_success);
},

retweet_status:
function retweet_status(retweet_id, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/retweet/'+retweet_id+'.json';
    lib.twitterapi.post(url, {}, on_success);
},

destroy_status:
function destroy_status(retweet_id, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/destroy/'+retweet_id+'.json';
    lib.twitterapi.post(url, {}, on_success);
},

new_direct_messages:
function new_direct_messages(text, user_id, screen_name, on_success) {
    var url = lib.twitterapi.api_base + 'direct_messages/new.json';
    var params = {
        'text': text,
        'screen_name': screen_name,
    };
    if (user_id != null)
        params['user_id'] = user_id;
    lib.twitterapi.post(url, params, on_success);
},

destroy_direct_messages:
function destroy_direct_messages(id, on_success) {
    var url = lib.twitterapi.api_base + 'direct_messages/destroy/'+id+'.json';
    lib.twitterapi.post(url, {}, on_success);
},

create_favorite:
function create_favorite(fav_id, on_success) {
    var url = lib.twitterapi.api_base + 'favorites/create/'+fav_id+'.json';
    lib.twitterapi.post(url, {}, on_success);
},

destroy_favorite:
function destroy_favorite(fav_id, on_success) {
    var url = lib.twitterapi.api_base + 'favorites/destroy/'+fav_id+'.json';
    lib.twitterapi.post(url, {}, on_success);
},

get_home_timeline:
function get_home_timeline(since_id, max_id, count, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/home_timeline.json';
    var params={
        'include_entities': '1',
        'page': '0',
        'since_id': since_id,
        'count': count,
    };
    if (max_id != null)
        params['max_id'] = max_id;

    lib.twitterapi.get(url, params, on_success);
    return;
},

get_mentions:
function get_mentions(since_id, max_id, count, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/mentions.json';
    var params={
        'include_entities': '1',
        'page': '0',
        'since_id': since_id,
        'count': count,
    };
    if (max_id != null)
        params['max_id'] = max_id;
    lib.twitterapi.get(url, params, on_success);
    return;
},

get_favorites:
function get_favorites(id, page, on_success) {
    var url = lib.twitterapi.api_base + 'favorites/'+id+'.json';
    var params={
        'include_entities': '1',
        'page': page,
    };
    lib.twitterapi.get(url, params, on_success);
    return;
},

get_direct_messages:
function get_direct_messages(since_id, max_id, count, on_success) {
    var url = lib.twitterapi.api_base + 'direct_messages.json';
    var params={
        'include_entities': '1',
        'page': '0',
        'since_id': since_id,
        'count': count,
    };
    if (max_id != null)
        params['max_id'] = max_id;
    lib.twitterapi.get(url, params, on_success);
    return;
},

get_sent_direct_messages:
function get_sent_direct_messages(since_id, max_id, count, on_success) {
    var url = lib.twitterapi.api_base + 'direct_messages/sent.json';
    var params={
        'include_entities': '1',
        'page': '0',
        'since_id': since_id,
        'count': count,
    };
    if (max_id != null)
        params['max_id'] = max_id;
    lib.twitterapi.get(url, params, on_success);
    return;
},

get_retweeted_by_me:
function get_retweeted_by_me(since_id, max_id, count, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/retweeted_by_me.json';
    var params={
        'include_entities': '1',
        'page': '0',
        'since_id': since_id,
        'count': count,
    };
    if (max_id != null)
        params['max_id'] = max_id;
    lib.twitterapi.get(url, params, on_success);
    return;
},

get_retweeted_to_me:
function get_retweeted_to_me(since_id, max_id, count, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/retweeted_to_me.json';
    var params={
        'include_entities': '1',
        'page': '0',
        'since_id': since_id,
        'count': count,
    };
    if (max_id != null)
        params['max_id'] = max_id;
    lib.twitterapi.get(url, params, on_success);
    return;
},

get_retweets_of_me:
function get_retweets_of_me(since_id, max_id, count, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/retweets_of_me.json';
    var params={
        'include_entities': '1',
        'page': '0',
        'since_id': since_id,
        'count': count,
    };
    if (max_id != null)
        params['max_id'] = max_id;
    lib.twitterapi.get(url, params, on_success);
    return;
},

get_retweeted_by_whom:
function get_retweeted_by_whom(tweet_id, count, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/' + tweet_id + '/retweeted_by.json';
    var params={
        'count': count,
    };
    lib.twitterapi.get(url, params, on_success);
    return;
},

get_user_timeline:
function get_user_timeline(user_id, screen_name, since_id, 
    max_id, count, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/user_timeline.json';
    var params={
        'include_entities': '1',
        'page': '0',
        'since_id': since_id,
        'count': count,
    };
    if (max_id != null)
        params['max_id'] = max_id;
    if (user_id != null) 
        params['user_id'] = user_id;
    if (screen_name!=null)
        params['screen_name'] = screen_name;
    lib.twitterapi.get(url, params, on_success);
    return;
},

show_status:
function show_status(id, on_success, on_error) {
    var url = lib.twitterapi.api_base + 'statuses/show/'+id+'.json';
    lib.twitterapi.get(url, {}, on_success, on_error);
},

show_user:
function show_user(screen_name, on_success, on_error) {
    var url = lib.twitterapi.api_base + 'users/show.json';
    var params={
        'include_entities': '1',
        'screen_name': screen_name,
    };
    lib.twitterapi.get(url, params, on_success, on_error);
},

search_user:
function search_user(query, page, on_success, on_error) {
    var url = lib.twitterapi.api_base + 'users/search.json';
    var params={
        'q': query,
        'page': page,
        'per_page': 20,
        'include_entities': '1',
    };
    lib.twitterapi.get(url, params, on_success, on_error);
},

get_user_friends: 
function get_user_friends(screen_name, cursor, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/friends.json';
    var params = {
        'include_entities': '1',
        'screen_name' : screen_name,
        'cursor': cursor
    };
    lib.twitterapi.get(url, params, on_success);
},

get_user_followers: 
function get_user_followers(screen_name, cursor, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/followers.json';
    var params = {
        'include_entities': '1',
        'screen_name' : screen_name,
        'cursor': cursor
    };
    lib.twitterapi.get(url, params, on_success);
},

get_user_friends_ids:
function get_user_friends_ids(screen_name, cursor, on_success) {
    var url = lib.twitterapi.api_base + 'friends/ids.json';
    var params = {
        'screen_name' : screen_name,
        'cursor': cursor
    };
    lib.twitterapi.get(url, params, on_success);
},

get_user_profile_image:
function get_user_profile_image(screen_name, size) {
    var url = lib.twitterapi.api_base + 'users/profile_image/twitter.json'
        + '?size='+ size
        + '&screen_name=' + screen_name;
    return url;
},

update_profile_image:
function update_profile_image() {
    var url = lib.twitterapi.api_base + 'account/update_profile_image.json'
    var sign_url = lib.twitterapi.use_same_sign_api_base? url
        :url.replace(lib.twitterapi.api_base, lib.twitterapi.sign_api_base);
    var signed_params = jsOAuth.form_signed_params(
          sign_url, jsOAuth.access_token, 'POST', {} , true);
    return [url, signed_params];
},

update_profile:
function update_profile(name, website, location, description, on_success) {
    var url = lib.twitterapi.api_base + 'account/update_profile.json';
    var params={
        'name': name,
        'website': website,
        'location': location,
        'description': description
    };
    lib.twitterapi.post(url, params, on_success);
},

exists_friendships:
function exists_friendships(source, target, on_success) {
    var url = lib.twitterapi.api_base + 'friendships/exists.json';
    var params={
        'user_a': source,
        'user_b': target,
    };
    lib.twitterapi.get(url, params, on_success);
},

show_friendships:
function show_friendships(source, target, on_success) {
    var url = lib.twitterapi.api_base + 'friendships/show.json';
    var params={
        'source_screen_name': source,
        'target_screen_name': target,
    };
    lib.twitterapi.get(url, params, on_success);
},

create_friendships:
function create_friendships(screen_name, on_success) {
    var url = lib.twitterapi.api_base + 'friendships/create.json';
    var params={
        'screen_name': screen_name,
        'follow': 'true',
    };
    lib.twitterapi.post(url, params, on_success);
},

destroy_friendships:
function destroy_friendships(screen_name, on_success) {
    var url = lib.twitterapi.api_base + 'friendships/destroy.json';
    var params={
        'screen_name': screen_name,
    };
    lib.twitterapi.post(url, params, on_success);
},

create_blocks:
function create_blocks(screen_name, on_success) {
    var url = lib.twitterapi.api_base + 'blocks/create.json';
    var params={
        'screen_name': screen_name,
        'follow': 'true',
    };
    lib.twitterapi.post(url, params, on_success);
},

destroy_blocks:
function destroy_blocks(screen_name, on_success) {
    var url = lib.twitterapi.api_base + 'blocks/destroy.json';
    var params={
        'screen_name': screen_name,
    };
    lib.twitterapi.post(url, params, on_success);
},

get_user_listed_lists:
function get_listed_lists(screen_name, cursor, on_success) {
    var url = lib.twitterapi.api_base + 'lists/memberships.json';
    var params = {
        'screen_name' : screen_name,
        'cursor': cursor
    };
    lib.twitterapi.get(url, params, on_success);
},

get_user_lists:
function get_user_lists(screen_name, cursor, on_success) {
    var url = lib.twitterapi.api_base + 'lists.json';
    var params = {
        'screen_name' : screen_name,
        'cursor': cursor
    };
    lib.twitterapi.get(url, params, on_success);
},

get_list_statuses:
function get_list_statuses(owner_screen_name, slug, since_id, max_id, on_success) {
    var url = lib.twitterapi.api_base + 'lists/statuses.json';
    var params = {
        'include_entities': '1',
        'owner_screen_name' : owner_screen_name,
        'slug': slug,
        'since_id': since_id,
    };
    if (max_id != null)
        params['max_id'] = max_id;
    lib.twitterapi.get(url, params, on_success);
},

get_list_subscribers:
function get_list_subscribers(owner_screen_name, slug, cursor, on_success) {
    var url = lib.twitterapi.api_base + 'lists/subscribers.json';
    var params = {
        'include_entities': '1',
        'owner_screen_name' : owner_screen_name,
        'slug': slug,
        'cursor': cursor,
    };
    lib.twitterapi.get(url, params, on_success);
},

get_list_members:
function get_list_members(owner_screen_name, slug, cursor, on_success) {
    var url = lib.twitterapi.api_base + 'lists/members.json';
    var params = {
        'include_entities': '1',
        'owner_screen_name' : owner_screen_name,
        'slug': slug,
        'cursor': cursor,
    };
    lib.twitterapi.get(url, params, on_success);
},

create_list_member:
function create_list_member(owner_screen_name, slug, screen_name, on_success) {
    var url = lib.twitterapi.api_base + 'lists/members/create.json';
    var params = {
        'owner_screen_name' : owner_screen_name,
        'slug': slug,
        'screen_name': screen_name,
    };
    lib.twitterapi.post(url, params, on_success);
},

destroy_list_member:
function destroy_list_member(owner_screen_name, slug, screen_name, on_success) {
    var url = lib.twitterapi.api_base + 'lists/members/destroy.json';
    var params = {
        'owner_screen_name' : owner_screen_name,
        'slug': slug,
        'screen_name': screen_name,
    };
    lib.twitterapi.post(url, params, on_success);
},

create_list_subscriber:
function create_list_subscriber(owner_screen_name, slug, on_success) {
    var url = lib.twitterapi.api_base + 'lists/subscribers/create.json';
    var params = {
        'owner_screen_name' : owner_screen_name,
        'slug': slug,
    };
    lib.twitterapi.post(url, params, on_success);
},

destroy_list_subscriber:
function destroy_list_subscriber(owner_screen_name, slug, on_success) {
    var url = lib.twitterapi.api_base + 'lists/subscribers/destroy.json';
    var params = {
        'owner_screen_name' : owner_screen_name,
        'slug': slug,
    };
    lib.twitterapi.post(url, params, on_success);
},

create_list:
function create_list(slug, description, mode, on_success) {
    var url = lib.twitterapi.api_base + 'lists/create.json';
    var params = {
        'name': slug,
        'mode': mode,
        'description': description
    };
    lib.twitterapi.post(url, params, on_success);
},

destroy_list:
function destroy_list(owner_screen_name, slug, on_success) {
    var url = lib.twitterapi.api_base + 'lists/destroy.json';
    var params = {
        'owner_screen_name' : owner_screen_name,
        'slug': slug,
    };
    lib.twitterapi.post(url, params, on_success);
},

update_list:
function update_list(owner_screen_name, slug, description, mode, on_success) {
    var url = lib.twitterapi.api_base + 'lists/update.json';
    var params = {
        'owner_screen_name' : owner_screen_name,
        'slug': slug,
        'mode': mode,
        'description': description
    };
    lib.twitterapi.post(url, params, on_success);
},

verify:
function verify(on_success) {
    var url = lib.twitterapi.api_base + 'account/verify_credentials.json';
    lib.twitterapi.get(url, {}, on_success);
},

search:
function search(query, page, since_id, max_id, on_success) {
    var url = lib.twitterapi.search_api_base2;
    if (url = 'https://twitter.com/phoenix_search.phoenix'){
        var params={
            'q': query,
        };
        params['format'] = 'phoenix';
        params['include_entities'] = 'true';
        if (since_id != null) params['since_id'] = since_id;
        _page = [];
        _page.push('rpp=100');
        _page.push('q=' + encodeURI(query));
        if (max_id != null) _page.push('max_id=' + max_id);
        if (page != null) _page.push('page=' + page);
        params['page'] = _page.join('&');
        lib.twitterapi.source = '';
        lib.twitterapi.get(url, params, on_success);
        lib.twitterapi.source = 'Hotot';
    } else {
        var params={
            'q': query,
        };
        if (since_id != null) params['since_id'] = since_id;
        if (max_id != null) params['max_id'] = max_id;
        if (page != null) params['page'] = page;
        lib.twitterapi.source = '';
        lib.twitterapi.get(url, params, on_success);
        lib.twitterapi.source = 'Hotot';
    }

},

abort_watch_user_streams:
function abort_watch_user_streams() {
},

watch_user_streams:
function watch_user_streams(callback) {
    if (!lib.twitterapi.use_oauth
      || watch_user_streams.is_running
      || watch_user_streams.disable
      || lib.twitterapi.api_base.indexOf('https://api.twitter.com/') < 0 ) {
        return;
    }
    if (!watch_user_streams.times){
        watch_user_streams.times = 0;
    }
    watch_user_streams.times += 1;
    watch_user_streams.is_running = true;
    watch_user_streams.last_text_length = 0;

    var empty_tester = new RegExp('^[\n\r\t ]*$', 'g');
    var url = 'https://userstream.twitter.com/2/user.json';
    var sign_url = url;
    var params = {'with' : 'followings'};

    var signed_params = jsOAuth.form_signed_params(
                sign_url, jsOAuth.access_token, 'GET', params, false);
    url = url + '?' + signed_params;
    params = {};

    hotot_log('Streams Open', url);

    var xhr = new XMLHttpRequest();
    watch_user_streams.xhr = xhr;
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-User-Agent', 'Hotot 0.9.6');
    xhr.setRequestHeader('User-Agent', 'Hotot 0.9.6');
    xhr.createAt = new Date().toLocaleString();
    xhr.onabort = xhr.onerror = xhr.onload = function() {
        if (xhr.status == 401 || xhr.status == 407) {
            hotot_log('Streams XHR', 'OAuth error');
            watch_user_streams.disable = true;
        }
        if (xhr.status == 420) {
            hotot_log('Streams XHR', '420 error');
            watch_user_streams.is_running = false;
        }
        watch_user_streams.is_running = false;
        hotot_log('Streams Exit', xhr.createAt + ' -> ' + new Date().toLocaleString());
    }
    xhr.onreadystatechange = function () {
        newText = xhr.responseText.substr(watch_user_streams.last_text_length);
        hotot_log('Streams XHR', 'readyState: ' + xhr.readyState
                             + ', status: ' + xhr.status
                             + ', responseText.length: ' + xhr.responseText.length
                             + ', times: ' + watch_user_streams.times
                             + ', createAt: ' + xhr.createAt);
        watch_user_streams.last_text_length = xhr.responseText.length;
        // limit xhr.responseText length & abort 
        if (xhr.responseText.length > 500000) {
            hotot_log('Streams Rec', xhr.responseText.length);
            setTimeout(function(){xhr.abort();}, 100);
        }
        // empty reply, twitter use newline to keep stream alive
        if (empty_tester.test(newText)) {
            hotot_log('Streams XHR', 'res nothing');
            return;
        }
        if (callback) {
            // @TODO the procedure to process tweets can be simpler.
            // because all json objects are complete.
            var lines = newText.split(/[\n\r]/g);
            for (var i = 0; i < lines.length; i += 1) {
                var line = lines[i].split(/({[^\0]+})/gm);
                for (var j = 0; j < line.length; j += 1) {
                    if (!empty_tester.test(line[j])) {
                        try {
                            ret = JSON.parse(line[j]);
                            callback(ret);
                        } catch(e) {
                            console.log('Streams callback', e.message, 'j='+j, line);
                            return;
                        }
                    }
                }
            }
        }
    }
    xhr.send(null);
    lib.twitterapi.abort_watch_user_streams = function() {
        xhr.abort();
    }
},

add_streaming_filter:
function add_streaming_filter(filter, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://stream.twitter.com/1/statuses/filter.json?track=', true);
    xhr.setRequestHeader('Authorization', encodeBase64(
            ':'));
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 3) {
            var obj = null;
            try {
                obj = JSON.parse(xhr.responseText)
            } catch (e) {}
            if (obj) {
                hotot_log('Streaming', obj.id_str+","+obj.user.screen_name+":"+obj.text)
            }
        }
    }
    params=[];
    for (var k in filter) {
        params.push(k+'='+encodeURIComponent(filter[k]));
    }
    xhr.send(params.join('&'));
},
};
