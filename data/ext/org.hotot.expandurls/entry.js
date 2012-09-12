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
// TODO: add configurability
//  - url of the unshortening service
//  - parameters for the api
//  - the way the result has to be interpreted
longurl_service:
    {
        name: 'longurlplease',
        service_url: 'http://api.longurl.org/v2/expand?user-agent=Hotot&format=json&url=',
        // TODO: get short urls from http://api.longurl.org/v2/services
        short_url_regexp: /(https?:\/\/)?(tinyurl\.com|goo\.gl|is\.gd|ur1\.ca|bit\.ly|ow\.ly|b1t\.it)\/[A-Za-z0-9]+/g,
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

            // TODO: find out whether I can use do_request from 
            // lib.network.js with this context thingy :)

            $.ajax({
                url: req_url
                , context: {short_url:match[0]} // definition of 'this' in callback
                , success: function (results) {
                    var long_url = results["long-url"];

                    // Log what has been found
                    hotot_log('ExpandUrls', this.short_url + ' : ' + long_url);

                    // The line below would replace the text of the link
                    // as well.
                    //$("a[href='"+this.short_url+"']").html(long_url);

                    $("a[href='"+this.short_url+"']").attr('href', long_url);

                    // TODO: Change urls without http(s)-prefix as well.
                    // Using a context, this should not be hard to do.
                    // (Only applies to identi.ca, because twitter does this
                    // already with it's t.co shortener)
                }
            });

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

