if (typeof ext == 'undefined') var ext = {};
ext.Imghp = {

id: 'org.hotot.imghp',

name: 'Google image search',

description: ' Find big size images in 1-Click. ',

version: '1.0',

author: '@mmyjona',

icon: "icon.png",

url: 'https://twitter.com/mmyjona',

search_image_with_google:
function search_image_with_google(li_id) {
    var media_array = $(li_id +' .card_body .preview .media_preview > a');
    hotot_log('Imghp', 'img_num: '+media_array.length);
    if (media_array.length == 0) {
        toast.set('No image found in this tweet!').show(-1);
        return;
    } else {
        $.each(
            media_array,
            function(i,e){
                var search_img_url = 'https://www.google.com/searchbyimage?image_url=' + $(this).attr('direct_url');

                navigate_action(search_img_url);
                hotot_log('Imghp', 'search_url: '+search_img_url);
            }
        );
        return;
    }

},

enable:
function enable() {
    ext.add_tweet_more_menuitem('ext_btn_hotot_imghp'
        , 'Google Image'
        , true
        , ext.Imghp.search_image_with_google);
},

disable:
function disable() {
    ext.remove_tweet_more_menuitem('ext_btn_hotot_imghp');
}

}

