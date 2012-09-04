// org.hotot.expandurls - hotot extension to expand shortened urls (refs #368)
// Copyright (C) 2012, Johan Vervloet
// You can redistribute and/or modify this file under the terms of the
// GNU Lesser General Public License.

if (typeof ext == 'undefined') var ext = {};
ext.ExpandUrls = {

id: 'org.hotot.expandurls',

name: 'Expand shortened urls (on hover)',

description: 'When you hover over a short url, the original long url is shown.',

version: '0.1',

author: 'Johan Vervloet',

url: 'http://johanv.org',

// Configuration of service for getting long url
// (TODO: make it changeable via configuration dialog)
longurl_service:
    {
        name: 'longurlplease',
        // TODO: make q-param below configurable
        service_url: 'https://longurlplease.appspot.com/api/v1.1?q=',
        short_url_regexp: /(https?:\/\/)?(tinyurl\.com|goo\.gl|is\.gd|ur1\.ca|bit\.ly)\/[A-Za-z0-9]+/g,
        // Twitter has its own url shortener, t.co. If you add t.co to the
        // short_url_regexp, t.co-urls are effectively found. But if you 
        // leave away out t.co, everything still works. 
        // I do not understand; it is probably some hotot magic :-)
        // But hey, it works. No worries.
    },

// I will register the function below with ADD_TWEETS_LISTENER_AFTER. When I 
// find a short URL, I will replace the short url by a long url in the
// html already displayed. 
// TODO: I think there is a message cache somewhere, and it would probably
// be better to save the expanded URLS in the cache, instead of looking them
// up each time again. On the other hand, the cache should be invalidated
// each time this extension is enabled or diabled.

on_add_tweets:
function on_add_tweets(tweets, view) {
    // scan all tweets for shortened urls.
    for (var i = 0, l = tweets.length; i < l; ++i)
    {
        var the_regexp = ext.ExpandUrls.longurl_service.short_url_regexp;
        var match = the_regexp.exec(tweets[i].text);
        // loop through all matches
        while (match != null)
        {
            var req_url=ext.ExpandUrls.longurl_service.service_url 
                + encodeURIComponent(match[0]);

            // call longurlplease.
            // I just did something similar as in the shorturl extension
            globals.network.do_request('GET',
                req_url,
                {},
                {},
                [],
                function (results) {
                    // longurlplease returns a key-value pair, where the key is
                    // the short url, and the value the long url. 
                    // Because I submitted only one url, the result is only
                    // one key-value-pair as well. So strictly spoken, the
                    // for loop is not necessary.
                    for(var index in results)
                    {
                        // Log what has been found
                        hotot_log('ExpandUrls', index + ' : ' + results[index]);

                        //$("a[href='"+index+"']").html(results[index]);
                        $("a[href='"+index+"']").attr('href', results[index]);
                    }
                },
                function () {}
            );

            match = the_regexp.exec(tweets[i].text);
        }
    }
},

enable:
function enable() {
    ext.register_listener(ext.ADD_TWEETS_LISTENER_AFTER
        , ext.ExpandUrls.on_add_tweets);
},

disable:
function disable() {
    ext.unregister_listener(ext.ADD_TWEETS_LISTENER_AFTER
        , ext.ExpandUrls.on_add_tweets);
}

}

