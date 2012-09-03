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

// If I register the function below with ADD_TWEETS_LISTENER, this gets called 
// before a tweet is displayed. Here I have the ability to change tweets[i].text.
//
// I plan to search each tweet for shortened urls. If I find one, I submit
// it to longurlplease, and then I want to either replace the url by the
// long one, or either adding the long one to the tweet (I don't know yet,
// maybe make it configurable.)
//
// With Twitter there is an additional problem:
// Twitter seems to use its own URL shortener, which is called t.co. So if
// a user submits a shortened url to Twitter, Twitter just shortens it again.
// This means that for tweets, I might have to call longurlplease twice.
//
// The strange thing is that hotot shows actual urls, and not the t.co ones.
// So probably somewhere in Hotot there is already code that expands the
// t.co-urls. I've noticed that when I register this function with
// ADD_TWEETS_LISTENER_AFTER, I do get the expanded urls. But then I am
// unable to change the actual tweet contents.
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

                        // Problem here is that at this point, I cannot access
                        // the tweets any more. I will have to look up how to
                        // do this; I am kind of new to Javascript :-)
                    }
                },
                function () {}
            );

            match = the_regexp.exec(tweets[i].text);
        }
    }

    //hotot_log('ExpandUrls', JSON.stringify(tweets[0]));
    //tweets[0].text='At this point, you can replace the text of a tweet.';    
},

enable:
function enable() {
    ext.register_listener(ext.ADD_TWEETS_LISTENER
        , ext.ExpandUrls.on_add_tweets);
},

disable:
function disable() {
    ext.unregister_listener(ext.ADD_TWEETS_LISTENER
        , ext.ExpandUrls.on_add_tweets);
}

}

