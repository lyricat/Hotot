/*
 * A JavaScript implementation for twitter's OAuth
 * Version 0.1 Copyright Shellex Wai<5h3ll3x@gmail.com> 2009 - 2010.
 * Distributed under the LGPLv3
 * See http://oauth.net/ for details.
 */

if (!lib) var lib = {}
jsOAuth = {

request_token_url :'https://twitter.com/oauth/request_token',

access_token_url :'https://twitter.com/oauth/access_token',

user_auth_url :'https://twitter.com/oauth/authorize',

key: '',

secret: '',

request_token: null,

access_token: null,

quote:
function quote(text) {
    text = encodeURIComponent(text);
    text = text.replace(/\!/g, "%21");
    text = text.replace(/\*/g, "%2A");
    text = text.replace(/\'/g, "%27");
    text = text.replace(/\(/g, "%28");
    text = text.replace(/\)/g, "%29");
    return text;
},

timestamp: 
function timestamp() {
    var t = (new Date()).getTime();
    return Math.floor(t / 1000);
},

nonce: 
function nonce(length) {
    return Math.random().toString().substring(2);
},

normalize_params:
function normalize_params(params) {
    var sortable = [];
    // params_list = [ [key, value] ... ]
    var params_list = []; 
    for (var k in params) {
        params_list.push([k, params[k]]);
    }
    // do sort
    params_list.sort(function(a, b) {
                          if (a[0] < b[0]) return  -1;
                          if (a[0] > b[0]) return 1;
                          return 0;
                      });
    //encode each key-value pair
    for (var i = 0; i < params_list.length; i += 1) {
        var pair = params_list[i];
        sortable.push(jsOAuth.quote(pair[0]) 
            + '=' + jsOAuth.quote(pair[1]));
    }
    return sortable.join('&');
},

form_signed_url:
function form_signed_url(url, token, method, params) {
    url = url+'?'+ jsOAuth.form_signed_params(url, token, method, params)
    // utility.Console.out('URL:' + url);
    return url;
},
    
form_signed_params:
function form_signed_params(url, token, method, addition_params, use_dict) {
    var kwargs = {
        'oauth_consumer_key': jsOAuth.key,
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_version': '1.0',
        'oauth_timestamp': jsOAuth.timestamp(),
        'oauth_nonce': jsOAuth.nonce(),
    };
    
    if (addition_params != null) {
        kwargs = jQuery.extend(kwargs, addition_params)
    }

    var service_key = jsOAuth.secret + '&';
    if (token != null) {
        kwargs['oauth_token'] = token['oauth_token']
        service_key = service_key + jsOAuth.quote(
            token['oauth_token_secret']);
    }

    // normalize_params
    var params = jsOAuth.normalize_params(kwargs);
    var message = jsOAuth.quote(method) 
        + '&' + jsOAuth.quote(url)
        + '&' + jsOAuth.quote(params);
    // utility.Console.out('Service_key: '+service_key);
    // utility.Console.out('Message: '+message);

    // sign
    var b64pad = '=';
    var signature = b64_hmac_sha1(service_key, message);
    kwargs['oauth_signature'] = signature + b64pad;
    if (use_dict) {
        return kwargs;
    } else {
        return jsOAuth.normalize_params(kwargs);
    }
},

get_request_token:
function get_request_token(on_success) {
    /*
    jsOAuth.form_signed_url(jsOAuth.request_token_url, null, 'GET', null),
    */    
    jQuery.ajax({
        type: 'GET',
        url: jsOAuth.request_token_url, 
        data: jsOAuth.form_signed_params(jsOAuth.request_token_url, null, 'GET', null),
        success: function (result) {
            var token_info = result;
            jsOAuth.request_token = utility.DB.unserialize_dict(token_info)
            // utility.Console.out('[i]req_token: ' + token_info);
            // utility.Console.out('[i]auth_url: ');
            // utility.Console.href_out(jsOAuth.get_auth_url());
            if (on_success!=null) {
                on_success(result);
            }
        },
    });
},

get_auth_url:
function get_auth_url() {
    return jsOAuth.user_auth_url
        +'?oauth_token'
        +'='+jsOAuth.request_token['oauth_token'];
},

get_access_token:
function get_access_token(pin, on_success, on_error) {
    if (jsOAuth.request_token == {}) {
        return ;
    }
    var addition_params = {'oauth_verifier': pin};
    var params = jsOAuth.form_signed_url(jsOAuth.access_token_url, 
        jsOAuth.request_token, 'GET', addition_params);
    jQuery.ajax({
        type: 'GET',
        url: jsOAuth.access_token_url, 
        data: params, 
        success: function (result) {
            var token_info = result;
            jsOAuth.access_token = utility.DB.unserialize_dict(token_info)
            // utility.Console.out('[i]acc_token: ' + token_info);
            if (on_success != null)
                on_success(result);
        },
        error: function (xhr) {
            if (on_error != null) 
                on_error(xhr);
        }
    });
},

verify:
function verify(on_success, on_error) {
    if (this.access_token != null) {
        var params = this.form_signed_params(
            'https://twitter.com/account/verify_credentials.json',
            this.access_token, 'GET', null)
        jQuery.ajax({
            type: 'GET',
            url: 'https://twitter.com/account/verify_credentials.json',
            data: params, 
            success: on_success,
            error: on_error,
        });
    }
},

};
