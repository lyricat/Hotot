if (typeof(lib) == 'undefined') var lib = {};
if (typeof(lib.twitter) == 'undefined') lib.twitter = {};

function TwitterClient() {
    var self = this;
    self.use_oauth = false;
    self.username = '';
    self.password = '';
    self.api_base = 'https://api.twitter.com/';
    self.sign_api_base = 'https://api.twitter.com/';
    self.search_api_base2 = 'https://twitter.com/phoenix_search.phoenix';
    self.upload_api_base = 'https://upload.twitter.com/1/';

    self.use_same_sign_api_base = true;
    self.source = 'Hotot';

    self.oauth = null;
    self.network = null;

    self.default_error_method = 'notify';

    self.http_code_msg_table = {
        0: 'Lost connection with server.',
        400: 'Bad Request: The request was invalid.',
        401: 'Server cannot authenticate you. Please check your username/password and API base.',
        403: {
            'update': 'Twitter does not allow to update duplicate status :(',
            'retweet': 'You have already retweeted this tweet, or it is protected.',
            'fav': 'You have already marked this tweet as favorite.',
            'unknown': 'Twitter refuse your request.'
        },
        404: 'The URL you request does not exist. Please check your API Base/OAuth Base/Search Base.',
        500: 'Server is broken. Please try again later.',
        502: 'Server is down or being upgraded. Please try again later.',
        503: 'Server is overcapacity. Please try again later.'
    };

    self.default_error_handler = function default_error_handler(url, xhr, textStatus, errorThrown) {
        var msg = '';
        var tech_info = '';
        if (xhr.status in self.http_code_msg_table) {
            if (xhr.status != 403) {
                msg = self.http_code_msg_table[xhr.status];
            } else {
                if (url.indexOf('favorites/create/') !== - 1) {
                    msg = self.http_code_msg_table[403]['fav'];
                } else if (url.indexOf('statuses/retweet/') !== - 1) {
                    msg = self.http_code_msg_table[403]['retweet'];
                } else if (url.indexOf('statuses/update.json') !== - 1) {
                    msg = self.http_code_msg_table[403]['update'];
                } else {
                    msg = self.http_code_msg_table[403]['unknown'];
                }
            }
            tech_info = 'HTTP Code:' + xhr.status + '\nDetails:' + xhr.statusText + '\nURL:' + url;
        } else {
            msg = 'Unknow Error';
            tech_info = 'HTTP Code:' + xhr.status + '\nReason:' + xhr.statusText + '\nURL:' + url;
        }
        switch (self.default_error_method) {
        case 'notify':
            hotot_notify('Ooops, An Error Occurred!', msg + '\n' + tech_info, null, 'content');
            break;
        case 'dialog':
            ui.ErrorDlg.alert('Ooops, An Error Occurred!', msg, tech_info);
            break;
        case 'toast':
            toast.set('Error #' + xhr.status + ': ' + msg);
            break;
        default:
            break;
        }
        hotot_log('Error #' + xhr.status + ',' + xhr.statusText, msg + ' ' + url);
        return;
    };

    self.success_handler = function success_handler(data, textStatus, xhr) {
        self.ratelimit_limit = xhr.getResponseHeader('X-RateLimit-Limit');
        self.ratelimit_remaning = xhr.getResponseHeader('X-RateLimit-Remaining');
        self.ratelimit_reset = xhr.getResponseHeader('X-RateLimit-Reset');
        if (self.ratelimit_limit == null) {
            return;
        }
        var html = '<span>' + _('my_power') + ': {%REMANING%}/{%LIMIT%} - <span style="color:{%STATUS_COLOR%}">{%STATUS%}</span></span><br><span>' + _('reset_time') + ': {%RESET_TIME%}</span>';
        html = html.replace('{%REMANING%}', self.ratelimit_remaning);
        html = html.replace('{%LIMIT%}', self.ratelimit_limit);
        var d = new Date();
        d.setTime(self.ratelimit_reset * 1000);
        html = html.replace('{%RESET_TIME%}', d.toLocaleTimeString());
        var k = self.ratelimit_remaning / self.ratelimit_limit;
        html = html.replace('{%STATUS%}', k < 0.25 ? _('nearly_dead') : k < 0.5 ? _('weakness') : k < 0.75 ? _('fine') : _('powerfull'));
        html = html.replace('{%STATUS_COLOR%}', k < 0.25 ? '#f33': k < 0.5 ? 'yellow': k < 0.75 ? 'lightgreen': '#0f3');
        globals.ratelimit_bubble.set_content(html);
    };

    self.basic_auth = function basic_auth() {
        return 'Basic ' + encodeBase64(
        self.username + ':' + self.password);
    };

    self.get = function get(ajax_url, ajax_params, on_success, on_error) {
        self.do_ajax('GET', ajax_url, ajax_params, {
            'X-PHX': 'true'
        },
        function(result, textStatus, xhr) {
            self.success_handler(result, textStatus, xhr);
            on_success(result, textStatus, xhr);
        },
        function(xhr, textStatus, errorThrown) {
            if (on_error == undefined || on_error == null) {
                self.default_error_handler(ajax_url, xhr, textStatus, errorThrown);
            } else {
                on_error(xhr, textStatus, errorThrown);
            }
        });
    };

    self.post = function post(ajax_url, ajax_params, on_success, on_error) {
        self.do_ajax('POST', ajax_url, ajax_params, {},
        function(result, textStatus, xhr) {
            self.success_handler(result, textStatus, xhr);
            on_success(result, textStatus, xhr);
        },
        function(xhr, textStatus, errorThrown) {
            if (on_error == undefined || on_error == null) {
                self.default_error_handler(ajax_url, xhr, textStatus, errorThrown);
            } else {
                on_error(xhr, textStatus, errorThrown);
            }
        });
    };

    self.do_ajax = function do_ajax(method, url, params, headers, on_success, on_error) {
        params['source'] = self.source;
        sign_url = self.use_same_sign_api_base ? url: url.replace(self.api_base, self.sign_api_base);

        if (self.use_oauth) {
            var signed_params = self.oauth.form_signed_params(
            sign_url, self.oauth.access_token, method, params, self.network.py_request && method == 'POST');
            if (method == 'GET') {
                url = url + '?' + signed_params;
                params = {};
            } else {
                params = signed_params
            }
            self.network.do_request(
            method, url, params, headers, null, on_success, on_error);
        } else {
            if (method == 'GET') {
                arr = []
                for (var k in params) {
                    arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
                }
                url = url + '?' + arr.join('&');
                params = {};
            }
            headers['Authorization'] = self.basic_auth();
            self.network.do_request(
            method, url, params, headers, null, on_success, on_error);
        }
    };

    self.update_status = function update_status(text, reply_to_id, on_success, on_error) {
        var url = self.api_base + 'statuses/update.json';
        var params = {
            'status': text,
            'include_entities': '1'
        };
        if (reply_to_id) {
            params['in_reply_to_status_id'] = reply_to_id;
        }
        self.post(url, params, on_success, on_error);
    };

    self.update_with_media = function update_with_media(text, reply_to_id, file, file_data, on_success, on_error) {
        var url = self.upload_api_base + 'statuses/update_with_media.json';
        var signed_params = self.oauth.form_signed_params(
        url, self.oauth.access_token, 'POST', {},
        true);
        var params = {
            'status': text,
            'include_entities': '1'
        };
        if (reply_to_id) {
            params['in_reply_to_status_id'] = reply_to_id;
        }
        $.extend(params, signed_params);

        var auth_str = 'OAuth oauth_consumer_key="' + signed_params.oauth_consumer_key + '"' + ', oauth_signature_method="' + signed_params.oauth_signature_method + '"' + ', oauth_token="' + signed_params.oauth_token + '"' + ', oauth_timestamp="' + signed_params.oauth_timestamp + '"' + ', oauth_nonce="' + signed_params.oauth_nonce + '"' + ', oauth_version="' + signed_params.oauth_version + '"' + ', oauth_signature="' + encodeURIComponent(signed_params.oauth_signature) + '"';
        var headers = {
            'Authorization': auth_str
        };
        var form_data = self.network.encode_multipart_formdata(
        params, file, 'media[]', file_data);
        $.extend(headers, form_data[0]);

        self.network.do_request('POST', url, signed_params, headers, form_data[1] // body
        , on_success, on_error);
    },

    self.update_with_media_filename = function update_with_media_filename(text, reply_to_id, filename, on_success, on_error) {
        var url = self.upload_api_base + 'statuses/update_with_media.json';
        var signed_params = self.oauth.form_signed_params(
        url, self.oauth.access_token, 'POST', {},
        true);
        var params = {
            'status': text,
            'include_entities': '1'
        };
        if (reply_to_id) {
            params['in_reply_to_status_id'] = reply_to_id;
        }
        $.extend(params, signed_params);

        var auth_str = 'OAuth oauth_consumer_key="' + signed_params.oauth_consumer_key + '"' + ', oauth_signature_method="' + signed_params.oauth_signature_method + '"' + ', oauth_token="' + signed_params.oauth_token + '"' + ', oauth_timestamp="' + signed_params.oauth_timestamp + '"' + ', oauth_nonce="' + signed_params.oauth_nonce + '"' + ', oauth_version="' + signed_params.oauth_version + '"' + ', oauth_signature="' + encodeURIComponent(signed_params.oauth_signature) + '"';
        var headers = {
            'Authorization': auth_str
        };

        self.network.do_request('POST', url, params, headers, [['media', filename]], on_success, on_error);
    };

    self.retweet_status = function retweet_status(retweet_id, on_success) {
        var url = self.api_base + 'statuses/retweet/' + retweet_id + '.json';
        self.post(url, {},
        on_success);
    };

    self.destroy_status = function destroy_status(retweet_id, on_success) {
        var url = self.api_base + 'statuses/destroy/' + retweet_id + '.json';
        self.post(url, {},
        on_success);
    };

    self.new_direct_messages = function new_direct_messages(text, user_id, screen_name, on_success, on_error) {
        var url = self.api_base + 'direct_messages/new.json';
        var params = {
            'text': text,
            'screen_name': screen_name
        };
        if (user_id != null) params['user_id'] = user_id;
        self.post(url, params, on_success, on_error);
    };

    self.destroy_direct_messages = function destroy_direct_messages(id, on_success) {
        var url = self.api_base + 'direct_messages/destroy/' + id + '.json';
        self.post(url, {},
        on_success);
    };

    self.create_favorite = function create_favorite(fav_id, on_success) {
        var url = self.api_base + 'favorites/create/' + fav_id + '.json';
        self.post(url, {},
        on_success);
    };

    self.destroy_favorite = function destroy_favorite(fav_id, on_success) {
        var url = self.api_base + 'favorites/destroy/' + fav_id + '.json';
        self.post(url, {},
        on_success);
    };

    self.get_home_timeline = function get_home_timeline(since_id, max_id, count, on_success) {
        var url = self.api_base + 'statuses/home_timeline.json';
        var params = {
            'include_entities': '1',
            'page': '0',
            'count': count
        };
        if (since_id != null) params['since_id'] = since_id;
        if (max_id != null) params['max_id'] = max_id;

        self.get(url, params, on_success);
        return;
    };

    self.get_mentions = function get_mentions(since_id, max_id, count, on_success) {
        var url = self.api_base + 'statuses/mentions.json';
        var params = {
            'include_entities': '1',
            'include_rts': '1',
            'page': '0',
            'count': count
        };
        if (since_id != null) params['since_id'] = since_id;
        if (max_id != null) params['max_id'] = max_id;
        self.get(url, params, on_success);
        return;
    };

    self.get_favorites = function get_favorites(id, page, on_success) {
        var url = self.api_base + 'favorites/' + id + '.json';
        var params = {
            'include_entities': '1',
            'page': page
        };
        self.get(url, params, on_success);
        return;
    };

    self.get_trending_topics = function get_trending_topics(woeid, on_success) {
        var url = self.api_base + 'trends/' + woeid + '.json';
        var params = {};
        self.get(url, params, on_success);
        return;
    };

    self.get_direct_messages = function get_direct_messages(since_id, max_id, count, on_success) {
        var url = self.api_base + 'direct_messages.json';
        var params = {
            'include_entities': '1',
            'page': '0',
            'count': count
        };
        if (since_id != null) params['since_id'] = since_id;
        if (max_id != null) params['max_id'] = max_id;
        self.get(url, params, on_success);
        return;
    };

    self.get_sent_direct_messages = function get_sent_direct_messages(since_id, max_id, count, on_success) {
        var url = self.api_base + 'direct_messages/sent.json';
        var params = {
            'include_entities': '1',
            'page': '0',
            'count': count
        };
        if (since_id != null) params['since_id'] = since_id;
        if (max_id != null) params['max_id'] = max_id;
        self.get(url, params, on_success);
        return;
    };

    self.get_retweeted_by_me = function get_retweeted_by_me(since_id, max_id, count, on_success) {
        var url = self.api_base + 'statuses/retweeted_by_me.json';
        var params = {
            'include_entities': '1',
            'page': '0',
            'count': count
        };
        if (since_id != null) params['since_id'] = since_id;
        if (max_id != null) params['max_id'] = max_id;
        self.get(url, params, on_success);
        return;
    };

    self.get_retweeted_to_me = function get_retweeted_to_me(since_id, max_id, count, on_success) {
        var url = self.api_base + 'statuses/retweeted_to_me.json';
        var params = {
            'include_entities': '1',
            'page': '0',
            'count': count
        };
        if (since_id != null) params['since_id'] = since_id;
        if (max_id != null) params['max_id'] = max_id;
        self.get(url, params, on_success);
        return;
    };

    self.get_retweets_of_me = function get_retweets_of_me(since_id, max_id, count, on_success) {
        var url = self.api_base + 'statuses/retweets_of_me.json';
        var params = {
            'include_entities': '1',
            'page': '0',
            'count': count
        };
        if (since_id != null) params['since_id'] = since_id;
        if (max_id != null) params['max_id'] = max_id;
        self.get(url, params, on_success);
        return;
    };

    self.get_retweeted_by_whom = function get_retweeted_by_whom(tweet_id, count, on_success) {
        var url = self.api_base + 'statuses/' + tweet_id + '/retweeted_by.json';
        var params = {
            'count': count
        };
        self.get(url, params, on_success);
        return;
    };

    self.get_user_timeline = function get_user_timeline(user_id, screen_name, since_id, max_id, count, on_success, on_error) {
        var url = self.api_base + 'statuses/user_timeline.json';
        var params = {
            'include_entities': '1',
            'include_rts': '1',
            'page': '0',
            'count': count
        };
        if (since_id != null) params['since_id'] = since_id;
        if (max_id != null) params['max_id'] = max_id;
        if (user_id != null) params['user_id'] = user_id;
        if (screen_name != null) params['screen_name'] = screen_name;
        self.get(url, params, on_success, on_error);
        return;
    };

    self.show_status = function show_status(id, on_success, on_error) {
        var url = self.api_base + 'statuses/show/' + id + '.json';
        var params = {
            'include_entities': '1'
        };
        self.get(url, params, on_success, on_error);
    };

    self.show_user = function show_user(screen_name, on_success, on_error) {
        var url = self.api_base + 'users/show.json';
        var params = {
            'include_entities': '1',
            'screen_name': screen_name
        };
        self.get(url, params, on_success, on_error);
    };

    self.search_user = function search_user(query, page, on_success, on_error) {
        var url = self.api_base + 'users/search.json';
        var params = {
            'q': query,
            'page': page,
            'per_page': 20,
            'include_entities': '1'
        };
        self.get(url, params, on_success, on_error);
    };

    self.get_user_friends = function get_user_friends(screen_name, cursor, on_success) {
        var url = self.api_base + 'statuses/friends.json';
        var params = {
            'include_entities': '1',
            'screen_name': screen_name,
            'cursor': cursor
        };
        self.get(url, params, on_success);
    };

    self.get_user_followers = function get_user_followers(screen_name, cursor, on_success) {
        var url = self.api_base + 'statuses/followers.json';
        var params = {
            'include_entities': '1',
            'screen_name': screen_name,
            'cursor': cursor
        };
        self.get(url, params, on_success);
    };

    self.get_user_friends_ids = function get_user_friends_ids(screen_name, cursor, on_success) {
        var url = self.api_base + 'friends/ids.json';
        var params = {
            'screen_name': screen_name,
            'cursor': cursor
        };
        self.get(url, params, on_success);
    };

    self.get_user_profile_image = function get_user_profile_image(screen_name, size) {
        var url = self.api_base + 'users/profile_image/twitter.json' + '?size=' + size + '&screen_name=' + screen_name + '&rnd=' + Math.random();
        return url;
    };

    self.update_profile_image = function update_profile_image(file, file_data, on_success) {
        var url = self.api_base + 'account/update_profile_image.json';
        var signed_params = self.oauth.form_signed_params(
        url, self.oauth.access_token, 'POST', {},
        true);
        var auth_str = 'OAuth oauth_consumer_key="' + signed_params.oauth_consumer_key + '"' + ', oauth_signature_method="' + signed_params.oauth_signature_method + '"' + ', oauth_token="' + signed_params.oauth_token + '"' + ', oauth_timestamp="' + signed_params.oauth_timestamp + '"' + ', oauth_nonce="' + signed_params.oauth_nonce + '"' + ', oauth_version="' + signed_params.oauth_version + '"' + ', oauth_signature="' + encodeURIComponent(signed_params.oauth_signature) + '"';

        var headers = {
            'Authorization': auth_str
        };

        var form_data = self.network.encode_multipart_formdata(
        signed_params, file, 'image', file_data);

        $.extend(headers, form_data[0]);
        self.network.do_request('POST', url, signed_params, headers, form_data[1] // body
        , on_success, null);
        //self.post(url, params, on_success);
    };

    self.update_profile = function update_profile(name, website, location, description, on_success) {
        var url = self.api_base + 'account/update_profile.json';
        var params = {
            'name': name,
            'website': website,
            'location': location,
            'description': description
        };
        self.post(url, params, on_success);
    };

    self.exists_friendships = function exists_friendships(source, target, on_success) {
        var url = self.api_base + 'friendships/exists.json';
        var params = {
            'user_a': source,
            'user_b': target
        };
        self.get(url, params, on_success);
    };

    self.show_friendships = function show_friendships(source, target, on_success) {
        var url = self.api_base + 'friendships/show.json';
        var params = {
            'source_screen_name': source,
            'target_screen_name': target
        };
        self.get(url, params, on_success);
    };

    self.create_friendships = function create_friendships(screen_name, on_success) {
        var url = self.api_base + 'friendships/create.json';
        var params = {
            'screen_name': screen_name,
            'follow': 'true'
        };
        self.post(url, params, on_success);
    };

    self.destroy_friendships = function destroy_friendships(screen_name, on_success) {
        var url = self.api_base + 'friendships/destroy.json';
        var params = {
            'screen_name': screen_name
        };
        self.post(url, params, on_success);
    };

    self.create_blocks = function create_blocks(screen_name, on_success) {
        var url = self.api_base + 'blocks/create.json';
        var params = {
            'screen_name': screen_name,
            'follow': 'true'
        };
        self.post(url, params, on_success);
    };

    self.destroy_blocks = function destroy_blocks(screen_name, on_success) {
        var url = self.api_base + 'blocks/destroy.json';
        var params = {
            'screen_name': screen_name
        };
        self.post(url, params, on_success);
    };

    self.get_user_listed_lists = function get_listed_lists(screen_name, cursor, on_success) {
        var url = self.api_base + 'lists/memberships.json';
        var params = {
            'screen_name': screen_name,
            'cursor': cursor
        };
        self.get(url, params, on_success);
    };

    self.get_user_lists = function get_user_lists(screen_name, cursor, on_success) {
        var url = self.api_base + 'lists.json';
        var params = {
            'screen_name': screen_name,
            'cursor': cursor
        };
        self.get(url, params, on_success);
    };

    self.get_list_statuses = function get_list_statuses(owner_screen_name, slug, since_id, max_id, on_success, on_error) {
        var url = self.api_base + 'lists/statuses.json';
        var params = {
            'include_entities': '1',
            'owner_screen_name': owner_screen_name,
            'slug': slug
        };
        if (since_id != null) params['since_id'] = since_id;
        if (max_id != null) params['max_id'] = max_id;
        self.get(url, params, on_success, on_error);
    };

    self.get_list_subscribers = function get_list_subscribers(owner_screen_name, slug, cursor, on_success) {
        var url = self.api_base + 'lists/subscribers.json';
        var params = {
            'include_entities': '1',
            'owner_screen_name': owner_screen_name,
            'slug': slug,
            'cursor': cursor
        };
        self.get(url, params, on_success);
    };

    self.get_list_members = function get_list_members(owner_screen_name, slug, cursor, on_success) {
        var url = self.api_base + 'lists/members.json';
        var params = {
            'include_entities': '1',
            'owner_screen_name': owner_screen_name,
            'slug': slug,
            'cursor': cursor
        };
        self.get(url, params, on_success);
    };

    self.create_list_member = function create_list_member(owner_screen_name, slug, screen_name, on_success) {
        var url = self.api_base + 'lists/members/create.json';
        var params = {
            'owner_screen_name': owner_screen_name,
            'slug': slug,
            'screen_name': screen_name
        };
        self.post(url, params, on_success);
    };

    self.destroy_list_member = function destroy_list_member(owner_screen_name, slug, screen_name, on_success) {
        var url = self.api_base + 'lists/members/destroy.json';
        var params = {
            'owner_screen_name': owner_screen_name,
            'slug': slug,
            'screen_name': screen_name
        };
        self.post(url, params, on_success);
    };

    self.create_list_subscriber = function create_list_subscriber(owner_screen_name, slug, on_success) {
        var url = self.api_base + 'lists/subscribers/create.json';
        var params = {
            'owner_screen_name': owner_screen_name,
            'slug': slug
        };
        self.post(url, params, on_success);
    };

    self.destroy_list_subscriber = function destroy_list_subscriber(owner_screen_name, slug, on_success) {
        var url = self.api_base + 'lists/subscribers/destroy.json';
        var params = {
            'owner_screen_name': owner_screen_name,
            'slug': slug
        };
        self.post(url, params, on_success);
    };

    self.create_list = function create_list(slug, description, mode, on_success) {
        var url = self.api_base + 'lists/create.json';
        var params = {
            'name': slug,
            'mode': mode,
            'description': description
        };
        self.post(url, params, on_success);
    };

    self.destroy_list = function destroy_list(owner_screen_name, slug, on_success) {
        var url = self.api_base + 'lists/destroy.json';
        var params = {
            'owner_screen_name': owner_screen_name,
            'slug': slug
        };
        self.post(url, params, on_success);
    };

    self.update_list = function update_list(owner_screen_name, slug, description, mode, on_success) {
        var url = self.api_base + 'lists/update.json';
        var params = {
            'owner_screen_name': owner_screen_name,
            'slug': slug,
            'mode': mode,
            'description': description
        };
        self.post(url, params, on_success);
    };

    self.verify = function verify(on_success, on_error) {
        var url = self.api_base + 'account/verify_credentials.json';
        self.get(url, {},
        on_success, on_error);
    };

    self.create_saved_search = function create_saved_search(query, on_success, on_error) {
        var url = self.api_base + 'saved_searches/create.json';
        self.post(url, {
            'query': query
        },
        on_success, on_error);
        return;
    };

    self.destroy_saved_search = function create_saved_search(id, on_success, on_error) {
        var url = self.api_base + 'saved_searches/destroy/' + id + '.json';
        self.post(url, {},
        on_success, on_error);
        return;
    };

    self.get_saved_searches = function get_saved_searches(on_success, on_error) {
        var url = self.api_base + 'saved_searches.json';
        self.get(url, {},
        on_success, on_error);
        return;
    };

    self.search = function search(query, page, since_id, max_id, on_success, on_error) {
        var url = self.search_api_base2;
        if (url == 'https://twitter.com/phoenix_search.phoenix') {
            var params = {
                'q': query
            };
            params['format'] = 'phoenix';
            params['include_entities'] = 'true';
            if (since_id != null) params['since_id'] = since_id;
            if (max_id != null) params['max_id'] = max_id;
            _page = [];
            _page.push('rpp=100');
            _page.push('q=' + encodeURI(query));
            if (max_id != null) _page.push('max_id=' + max_id);
            if (page != null) _page.push('page=' + page);
            params['page'] = _page.join('&');
            self.source = '';
            self.get(url, params, on_success, on_error);
            self.source = 'Hotot';
        } else {
            var params = {
                'q': query
            };
            if (since_id != null) params['since_id'] = since_id;
            if (max_id != null) params['max_id'] = max_id;
            if (page != null) params['page'] = page;
            self.source = '';
            self.get(url, params, on_success, on_error);
            self.source = 'Hotot';
        }

    };

    self.abort_watch_user_streams = function abort_watch_user_streams() {};

    self.watch_user_streams = function watch_user_streams(callback) {
        if (!self.use_oauth || watch_user_streams.is_running || watch_user_streams.disable || self.api_base.indexOf('https://api.twitter.com/') < 0) {
            return;
        }
        if (!watch_user_streams.times) {
            watch_user_streams.times = 0;
        }
        watch_user_streams.times += 1;
        watch_user_streams.is_running = true;
        watch_user_streams.last_text_length = 0;

        var empty_tester = new RegExp('^[\n\r\t ]*$', 'g');
        var url = 'https://userstream.twitter.com/2/user.json';
        var sign_url = url;
        var params = {
            'with': 'followings'
        };

        var signed_params = self.oauth.form_signed_params(
        sign_url, self.oauth.access_token, 'GET', params, false);
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
        xhr.onreadystatechange = function() {
            newText = xhr.responseText.substr(watch_user_streams.last_text_length);
            hotot_log('Streams XHR', 'readyState: ' + xhr.readyState + ', status: ' + xhr.status + ', responseText.length: ' + xhr.responseText.length + ', times: ' + watch_user_streams.times + ', createAt: ' + xhr.createAt);
            watch_user_streams.last_text_length = xhr.responseText.length;
            // limit xhr.responseText length & abort 
            if (xhr.responseText.length > 500000) {
                hotot_log('Streams Rec', xhr.responseText.length);
                setTimeout(function() {
                    xhr.abort();
                },
                100);
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
                                console.log('Streams callback', e.message, 'j=' + j, line);
                                return;
                            }
                        }
                    }
                }
            }
        }
        xhr.send(null);
        self.abort_watch_user_streams = function() {
            xhr.abort();
        }
    };

    self.add_streaming_filter = function add_streaming_filter(filter, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://stream.twitter.com/1/statuses/filter.json?track=', true);
        xhr.setRequestHeader('Authorization', encodeBase64(':'));
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 3) {
                var obj = null;
                try {
                    obj = JSON.parse(xhr.responseText)
                } catch(e) {}
                if (obj) {
                    hotot_log('Streaming', obj.id_str + "," + obj.user.screen_name + ":" + obj.text)
                }
            }
        }
        params = [];
        for (var k in filter) {
            params.push(k + '=' + encodeURIComponent(filter[k]));
        }
        xhr.send(params.join('&'));
    };
};

lib.twitter.Client = TwitterClient;

