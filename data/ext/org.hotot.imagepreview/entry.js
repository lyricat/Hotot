if (typeof ext == 'undefined') var ext = {};
ext.HototImagePreview = {

id: 'org.hotot.imagepreview',

name: 'Hotot Image Preview',

description: 'To preview picture thumbs in timeline.\nSupport sites:\n\
    - img.ly, twitpic.com, twitgoo.com, yfrog.com, moby.to, plixi.com\n',

version: '1.0',

author: 'Shellex Wai',

url: 'http://hotot.org',

icon: 'icon.png',

img_link_reg: {
'img.ly': {
    reg: new RegExp('href="(http:\\/\\/img.ly\\/([a-zA-Z0-9]+))"','g'),
    base: 'http://img.ly/show/thumb/'
},
'twitpic.com': {
    reg: new RegExp('href="(http:\\/\\/twitpic.com\\/([a-zA-Z0-9]+))"','g'),
    base: 'http://twitpic.com/show/thumb/'
},
'twitgoo.com': {
    reg: new RegExp('href="(http:\\/\\/twitgoo.com\\/([a-zA-Z0-9]+))"','g'),
    base: 'http://twitgoo.com/show/thumb/'
},
'yfrog.com': {
    reg: new RegExp('href="(http:\\/\\/yfrog.com\\/([a-zA-Z0-9]+))"','g'),
    tail: '.th.jpg'
},
'moby.to': {
    reg: new RegExp('href="(http:\\/\\/moby.to\\/([a-zA-Z0-9]+))"','g'),
    tail: ':thumbnail'
},
'plixi.com': {
    reg: new RegExp('href="(http:\\/\\/plixi.com\\/p\\/([a-zA-Z0-9]+))"','g'),
    base: 'http://api.plixi.com/api/tpapi.svc/imagefromurl?size=thumbnail&url='
},

'raw': {
    reg: new RegExp('href="([a-zA-Z0-9]+:\\/\\/.+\\/.+\\.(jpg|png|gif))"', 'gi')
},

},

BORDER_STYLE: 'margin:2px 5px; padding:0; display:inline-block;',

IMG_STYLE: 'padding:4px; border:1px #ccc solid; background:#fff; margin:0; height: 150px',

form_image:
function form_image(href, src) {
    var html = '<a style="' 
        + ext.HototImagePreview.BORDER_STYLE
        + '" href="'+href+'"><img style="'
        + ext.HototImagePreview.IMG_STYLE
        + '" src="'+ src +'" /></a>'
    return html;
},

on_form_tweet_text:
function on_form_tweet_text(text) {
    var img_html_arr = [];
    var img_link_reg = ext.HototImagePreview.img_link_reg;
    for (var pvd_name in img_link_reg) {
        var match = img_link_reg[pvd_name].reg.exec(text);
        while (match != null) {
            switch (pvd_name) {
            case 'img.ly':
            case 'twitpic.com':  
            case 'twitgoo.com':
                img_html_arr.push(
                    ext.HototImagePreview.form_image(
                        match[1], img_link_reg[pvd_name].base + match[2]));
            break;
            case 'yfrog.com':
            case 'moby.to':
                img_html_arr.push(
                    ext.HototImagePreview.form_image(
                        match[1], match[1] + img_link_reg[pvd_name].tail));
            break;
            case 'plixi.com':
                img_html_arr.push(
                    ext.HototImagePreview.form_image(
                        match[1], img_link_reg[pvd_name].base +match[1]));
            break;
            case 'raw':
                img_html_arr.push(
                    ext.HototImagePreview.form_image(
                        match[1], match[1]));
            }
            match = img_link_reg[pvd_name].reg.exec(text);
        }
    }
    if (img_html_arr.length != 0) {
        text += '<p>'+img_html_arr.join('')+'</p>';
    }
    return text;
},

load:
function load () {
    ext.register_listener(ext.FORM_TWEET_TEXT_LISTENER_AFTER
        , ext.HototImagePreview.on_form_tweet_text);
},

unload:
function unload() {
    ext.unregister_listener(ext.FORM_TWEET_TEXT_LISTENER_AFTER
        , ext.HototImagePreview.on_form_tweet_text);
},


}

