if (!lib) var lib = {}

lib.twitterapi = {
use_oauth: false,

username: '',

password: '',

api_base: 'http://api.twitter.com/1',

error_handle:
function error_handle(xhr, textStatus, errorThrown) {
    alert(xhr.status);
    return;
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
function get(url, params, on_success) {
    lib.twitterapi.do_ajax('GET', url, params, on_success);
},

post:
function post(url, params, on_success) {
    lib.twitterapi.do_ajax('POST', url, params, on_success);
},

do_ajax:
function do_ajax(method, ajax_url, params, on_success) {
    if (this.use_oauth) {
        var signed_params = jsOAuth.form_signed_params(
            lib.twitterapi.api_base + ajax_url
            , jsOAuth.access_token
            , method
            , params);
        // utility.Console.out('PARAMS:'+signed_params);
        jQuery.ajaxQueue({    
            type: method,
            url: lib.twitterapi.api_base + ajax_url,
            data: signed_params,
            success: 
            function(result) {
                if ( on_success != null) {
                    result = lib.twitterapi.normalize_result(result);
                    on_success(result);
                }
            },
            error:
            function(result) {
                result = lib.twitterapi.normalize_result(result);
                lib.twitterapi.error_handle(result);
            }
        }); 
    } else {
        jQuery.ajaxQueue({    
            type: method,
            url: lib.twitterapi.api_base + ajax_url,
            data: params,
            beforeSend: 
            function(xhr) {
                xhr.setRequestHeader('Authorization', 
                    lib.twitterapi.basic_auth());
            },
            success: 
            function(result) {
                if ( on_success != null)
                    result = lib.twitterapi.normalize_result(result);
                    on_success(result);
            },
            error:
            function(result) {
                result = lib.twitterapi.normalize_result(result);
                lib.twitterapi.error_handle(result);
            }
        }); 
    }
},

update_status:
function update_status(text, reply_to_id, on_success) {
    var url = '/statuses/update.json';
    var params = {
        'status': text,
        'in_reply_to_status_id': reply_to_id,
    };
    lib.twitterapi.post(url, params, on_success);
},

retweet_status:
function retweet_status(retweet_id, on_success) {
    var url = '/statuses/retweet/'+retweet_id+'.json';
    lib.twitterapi.post(url, {}, on_success);
},

destroy_status:
function destroy_status(retweet_id, on_success) {
    var url = '/statuses/destroy/'+retweet_id+'.json';
    lib.twitterapi.post(url, {}, on_success);
},

new_direct_messages:
function new_direct_messages(text, user_id, screen_name, on_success) {
    var url = '/direct_messages/new.json';
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
    var url = '/favorites/create/'+fav_id+'.json';
    lib.twitterapi.post(url, {}, on_success);
},

destroy_favorite:
function destroy_favorite(fav_id, on_success) {
    var url = '/favorites/destroy/'+fav_id+'.json';
    lib.twitterapi.post(url, {}, on_success);
},

get_home_timeline:
function get_home_timeline(since_id, max_id, count, on_success) {
    var url = '/statuses/home_timeline.json';
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
    var url = '/statuses/mentions.json';
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
    var url = '/favorites.json';
    var params={
        'id': id,
        'page': page,
    };
    lib.twitterapi.get(url, params, on_success);
    return;
},

get_direct_messages:
function get_direct_messages(since_id, max_id, count, on_success) {
    var url = '/direct_messages.json';
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
    var url = '/statuses/retweeted_by_me.json';
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
    var url = '/statuses/retweeted_to_me.json';
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
    var url = '/statuses/retweets_of_me.json';
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
    var url = '/statuses/user_timeline.json';
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
    var url = '/statuses/show/'+id+'.json';
    lib.twitterapi.get(url, {}, on_success);
},

show_user:
function show_user(screen_name, on_success) {
    var url = '/users/show.json';
    var params={
        'screen_name': screen_name,
    };
    lib.twitterapi.get(url, params, on_success);
},

get_user_profile_image:
function get_user_profile_image(screen_name, size) {
    var url = '/users/profile_image/twitter.json'
        + '?size='+ size
        + '&screen_name=' + screen_name;
    return lib.twitterapi.api_base + url;
},

update_profile:
function update_profile(name, website, location, description, on_success) {
    var url = '/account/update_profile.json';
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
    var url = '/friendships/exists.json';
    var params={
        'user_a': source,
        'user_b': target,
    };
    lib.twitterapi.get(url, params, on_success);
},

create_friendships:
function create_friendships(screen_name, on_success) {
    var url = '/friendships/create.json';
    var params={
        'screen_name': screen_name,
        'follow': true,
    };
    lib.twitterapi.post(url, params, on_success);
},

destroy_friendships:
function destroy_friendships(screen_name, on_success) {
    var url = '/friendships/destroy.json';
    var params={
        'screen_name': screen_name,
    };
    lib.twitterapi.post(url, params, on_success);
},

create_blocks:
function create_blocks(screen_name, on_success) {
    var url = '/blocks/create.json';
    var params={
        'screen_name': screen_name,
        'follow': true,
    };
    lib.twitterapi.post(url, params, on_success);
},

destroy_blocks:
function destroy_blocks(screen_name, on_success) {
    var url = '/blocks/destroy.json';
    var params={
        'screen_name': screen_name,
    };
    lib.twitterapi.post(url, params, on_success);
},

verify:
function verify(on_success) {
    var url = '/account/verify_credentials.json';
    lib.twitterapi.get(url, {}, on_success);
},

};
