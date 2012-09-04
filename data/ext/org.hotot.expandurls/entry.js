// org.hotot.expandurls - hotot extension to expand shortened urls (refs #368)
// Copyright (C) 2012, Johan Vervloet
// You can redistribute and/or modify this file under the terms of the
// GNU Lesser General Public License.

if (typeof ext == 'undefined') var ext = {};
ext.ExpandUrls = {

id: 'org.hotot.expandurls',

name: 'Expand shortened urls',

description: 'This extension expands urls shortened by a shortening service.',

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
        short_url_regexp: /(https?:\/\/)?(is\.gd|t\.co|ur1\.ca|bit\.ly)\/[A-Za-z0-9]+/g,
    },

// I will register the function below with ADD_TWEETS_LISTENER_AFTER. When I find
// a shortened URL, I will (try to) replace the short url by a long url in the
// html already displayed. (I think this is the only option, because I
// do the call to longurlplease asynchronously.)

// Twitter seems to use its own URL shortener, which is called t.co. So if
// a user submits a shortened url to Twitter, Twitter just shortens it again.
// However, Hotot does not display t.co urls. So I guess it should be possible
// to retrive the original urls from the tweets I get.
on_add_tweets:
function on_add_tweets(tweets, view) {
    hotot_log('ExpandUrls',
        'Update ['+view.name+'], '+ tweets.length +' items');

    // scan all tweets for shortened urls.
    for (var i = 0, l = tweets.length; i < l; ++i)
    {
        var the_regexp = ext.ExpandUrls.longurl_service.short_url_regexp;
        var match = the_regexp.exec(tweets[i].text);
        // loop through all matches
        while (match != null)
        {
            hotot_log('ExpandUrls', 'MATCH! short url found: ' + match);

            var tweet_id=tweets[i].id_str;
            // I will have to pass this tweet_id to the function called when
            // the call returns. Not sure yet how to do this.


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
                    // the short url, and the value the long url. I don't know
                    // how to just get the first value, so I copied some code from
                    // http://www.electrictoolbox.com/loop-key-value-pairs-associative-array-javascript/
                    // which is probably overkill.
                    for(var index in results)
                    {
                        // Log what I found
                        hotot_log('ExpandUrls', index + ' : ' + results[index]);
                        hotot_log('ExpandUrls', index + ' : ' + tweet_id);

                        // If tweet_id contains the id of the tweet, I can find
                        // the tweet (possibly tweets) using jquery, as below.
                        // But I still have to find out how i can pass this parameter.

                        hotot_log('ExpandUrls', $("li[tweet_id='"+tweet_id+"']").html());

                        // TODO: replace short url by long url.
                    }
                },
                function () {}
            );

            match = the_regexp.exec(tweets[i].text);
        }
    }

    //hotot_log('ExpandUrls', JSON.stringify(tweets[0]));
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

