/*
 * A JavaScript implementation for twitter's OAuth
 * Version 1.0 Copyright Shellex Wai<5h3ll3x@gmail.com> 2009 - 2010.
 * Distributed under the LGPLv3
 * See http://oauth.net/ for details.
 */

if (!lib) var lib = {}
lib.OAuth = function OAuth(argument) {
    var self = this;
    self.oauth_base = 'https://api.twitter.com/oauth/';

    self.sign_oauth_base = 'https://api.twitter.com/oauth/';

    self.use_same_sign_oauth_base = false;

    self.request_token_url = 'request_token';

    self.access_token_url = 'access_token';

    self.user_auth_url = 'authorize';

    self.key = '';

    self.secret = '';

    self.request_token = null;

    self.access_token = null;

    self.network = null;

    self.quote = function quote(text) {
        text = encodeURIComponent(text);
        text = text.replace(/\!/g, "%21");
        text = text.replace(/\*/g, "%2A");
        text = text.replace(/\'/g, "%27");
        text = text.replace(/\(/g, "%28");
        text = text.replace(/\)/g, "%29");
        return text;
    };

    self.timestamp = function timestamp() {
        var t = (new Date()).getTime();
        return Math.floor(t / 1000);
    };

    self.nonce = function nonce(length) {
        return Math.random().toString().substring(2);
    };

    self.normalize_params = function normalize_params(params) {
        var sortable = [];
        // params_list = [ [key, value] ... ]
        var params_list = [];
        for (var k in params) {
            params_list.push([k, params[k]]);
        }
        // do sort
        params_list.sort(function(a, b) {
            if (a[0] < b[0]) return - 1;
            if (a[0] > b[0]) return 1;
            return 0;
        });
        //encode each key-value pair
        for (var i = 0, l = params_list.length; i < l; i += 1) {
            var pair = params_list[i];
            sortable.push(self.quote(pair[0]) + '=' + self.quote(pair[1]));
        }
        return sortable.join('&');
    };

    self.form_signed_url = function form_signed_url(url, token, method, params) {
        url = url + '?' + self.form_signed_params(url, token, method, params)
        return url;
    };

    self.form_signed_params = function form_signed_params(url, token, method, addition_params, use_dict) {
        var kwargs = {
            'oauth_consumer_key': self.key,
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_version': '1.0',
            'oauth_timestamp': self.timestamp(),
            'oauth_nonce': self.nonce()
        };

        if (addition_params != null) {
            kwargs = jQuery.extend(kwargs, addition_params)
        }

        var service_key = self.secret + '&';
        if (token != null) {
            kwargs['oauth_token'] = token['oauth_token']
            service_key = service_key + self.quote(
            token['oauth_token_secret']);
        } else {
            kwargs['oauth_callback'] = 'oob';
        }

        // normalize_params
        var params = self.normalize_params(kwargs);
        var message = self.quote(method) + '&' + self.quote(url) + '&' + self.quote(params);

        // sign
        var b64pad = '=';
        var signature = b64_hmac_sha1(service_key, message);
        kwargs['oauth_signature'] = signature + b64pad;
        if (use_dict) {
            return kwargs;
        } else {
            return self.normalize_params(kwargs);
        }
    };

    self.get_request_token = function get_request_token(on_success, on_error) {
        /*
    self.form_signed_url(self.request_token_url, null, 'GET', null),
    */
        sign_base = self.use_same_sign_oauth_base ? self.oauth_base: self.sign_oauth_base;
        self.network.do_request('GET', self.oauth_base + self.request_token_url + '?' + self.form_signed_params(
        sign_base + self.request_token_url, null, 'GET', null), {},
        {},
        [], function(result) {
            var token_info = result;
            self.request_token = util.unserialize_dict(token_info)
            if (on_success != null) {
                on_success(result);
            }
        }, function(result) {
            if (on_error != null) {
                on_error(result);
            }
        });
    };

    self.get_auth_url = function get_auth_url() {
        return self.oauth_base + self.user_auth_url + '?oauth_token' + '=' + self.request_token['oauth_token'];
    };

    self.get_access_token = function get_access_token(pin, on_success, on_error) {
        if (self.request_token == {}) {
            return;
        }
        sign_base = self.use_same_sign_oauth_base ? self.oauth_base: self.sign_oauth_base;

        var addition_params = {
            'oauth_verifier': pin
        };
        var params = self.form_signed_params(
        sign_base + self.access_token_url, self.request_token, 'GET', addition_params);
        self.network.do_request('GET', self.oauth_base + self.access_token_url + '?' + params, {},
        {},
        [], function(result) {
            var token_info = result;
            self.access_token = util.unserialize_dict(token_info)
            if (on_success != null) on_success(result);
        },
        function(xhr) {
            if (on_error != null) on_error(xhr);
        });
    };

};

