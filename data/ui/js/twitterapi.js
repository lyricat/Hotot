if (!lib) var lib = {}

lib.twitterapi = {

use_oauth: false,

username: '',

password: '',

api_base: 'https://api.twitter.com/',

sign_api_base: 'https://api.twitter.com/',

search_api_base: 'http://search.twitter.com/',

use_same_sign_api_base: true,

py_request: true,

source: 'Hotot',

success_task_table: {},

error_task_table: {},

error_handle:
function error_handle(xhr, textStatus, errorThrown) {
    return;
},

generate_uuid:
function generate_uuid() {
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
},

normalize_result:
function normalize_result(result) {
    if (result.constructor == String)
        eval('result='+result)
    return result;
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
            , lib.twitterapi.py_request && method == 'POST');
        if (method == 'GET') {
            url = url + '?' + signed_params;
            params = {};
        } else {
            params = signed_params
        }
        lib.twitterapi.do_requset(
            method
            , url
            , params
            , headers
            , [] 
            , on_success
            , on_error
            );
    } else {
        headers['Authorization']= lib.twitterapi.basic_auth();
        lib.twitterapi.do_requset(
            method
            , url
            , params
            , headers
            , on_success
            , on_error
            );
    }
},

do_requset:
function do_requset(req_method, req_url, req_params, req_headers, req_files,on_success, on_error) {
    if (!req_headers) req_headers = {};
    if (lib.twitterapi.py_request) {
        var task_uuid = lib.twitterapi.generate_uuid();
        lib.twitterapi.success_task_table[task_uuid] = on_success;
        lib.twitterapi.error_task_table[task_uuid] = on_error;
        hotot_action('request/' +
            encodeURIComponent(utility.DB.json(
                { uuid: task_uuid
                , method: req_method
                , url: req_url
                , params: req_params
                , files: req_files
                , headers: req_headers })));
    } else {
        jQuery.ajaxQueue({    
            type: req_method,
            url: req_url,
            data: req_params,
            beforeSend: 
            function(xhr) {
                for (var k in req_headers) {
                    xhr.setRequestHeader(k, req_headers[k]);
                }
            },
            success: 
            function(result) {
                if ( on_success != null) {
                    result = lib.twitterapi.normalize_result(result);
                    on_success(result);
                }
            },
            error: 
            function (result) {
                if ( on_error != null) {
                    result = lib.twitterapi.normalize_result(result);
                    on_error(result);
                }
            }
        }); 
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
    var url = lib.twitterapi.api_base + 'favorites.json';
    var params={
        'id': id,
        'page': page,
    };
    lib.twitterapi.get(url, params, on_success);
    return;
},

get_direct_messages:
function get_direct_messages(since_id, max_id, count, on_success) {
    var url = lib.twitterapi.api_base + 'direct_messages.json';
    var params={
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
        'screen_name': screen_name,
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
function show_friendships(source, target, on_success) {
    var url = lib.twitterapi.api_base + 'friendships/exists.json';
    var params={
        'user_a': source,
        'user_b': target,
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
    lib.twitterapi.do_requset('GET', url, {}, {}, [], on_success,
    function(result) {
    });
},

};
