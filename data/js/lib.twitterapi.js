if (typeof (lib) == 'undefined') var lib = {}

lib.twitterapi = {

use_oauth: false,

username: '',

password: '',

api_base: 'https://api.twitter.com/',

sign_api_base: 'https://api.twitter.com/',

search_api_base: 'http://search.twitter.com/',

use_same_sign_api_base: true,

source: '',

http_code_msg_table : {
      401: 'Server cannot authenticate you. Please check your username/password and API base.'
    , 404: 'The URL you request does not exist. Please check your API Base/OAuth Base/Search Base.'
    , 500: 'Server is broken. Please try again later.'
    , 502: 'Server is down or being upgraded. Please try again later.'
    , 503: 'Server is overcapacity. Please try again later.'
},

error_handle:
function error_handle(xhr, textStatus, errorThrown) {
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

basic_auth:
function basic_auth() {
    return 'Basic ' + encodeBase64(
        lib.twitterapi.username + ':' + lib.twitterapi.password);
},

get:
function get(ajax_url, ajax_params, on_success) {
    lib.twitterapi.do_ajax('GET', ajax_url, ajax_params, {},
        on_success,
        function(result) {
            lib.twitterapi.error_handle(result);
        }
    );
},

post:
function post(ajax_url, ajax_params, on_success) {
    lib.twitterapi.do_ajax('POST', ajax_url, ajax_params, {},
        on_success,
        function(result) {
            lib.twitterapi.error_handle(result);
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
            , [] 
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
            , []
            , on_success
            , on_error
            );
    }
},

update_status:
function update_status(text, reply_to_id, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/update.json';
    var params = {'status': text};
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
function show_status(id, on_success) {
    var url = lib.twitterapi.api_base + 'statuses/show/'+id+'.json';
    lib.twitterapi.get(url, {}, on_success);
},

show_user:
function show_user(screen_name, on_success) {
    var url = lib.twitterapi.api_base + 'users/show.json';
    var params={
        'include_entities': '1',
        'screen_name': screen_name,
    };
    lib.twitterapi.get(url, params, on_success);
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

verify:
function verify(on_success) {
    var url = lib.twitterapi.api_base + 'account/verify_credentials.json';
    lib.twitterapi.get(url, {}, on_success);
},

search:
function search(query, page, on_success) {
    var url = lib.twitterapi.search_api_base + 'search.json?q='+encodeURIComponent(query)+'&page='+page;
    lib.network.do_request('GET', url, {}, {}, [], on_success,
    function(result) {
    });
},

};
