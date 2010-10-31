if (typeof ext == 'undefined') var ext = {};
ext.HototVideoPreview = {

id: 'org.hotot.videopreview',

name: 'Video Preview',

description: 'To preview video thumbs in timeline.\nSupport sites:\n\
    - youtube.com\n',

version: '0.1',

author: 'Interloper, starting from Shellex Wai\'s Hotot Image Preview code',

url: 'http://halteniarazon.blogspot.com',

icon: 'icon.png',

ytb_thmb: {
'lg': 'large (480x360)',
'sm': 'small (120x90)'
},

ytb_thmb_s: undefined,

vid_link_reg: {
'youtube.com': {
    reg: new RegExp('href="(http:\\/\\/(www.)?youtube.com\\/watch\\?v\\=([A-Za-z0-9_\\-]+))','g'),
    base: 'http://img.youtube.com/vi/',
    tail_sm: '/default.jpg',
    tail_lg: '/0.jpg'
},
},

BORDER_STYLE: 'margin:2px 5px; padding:0; display:inline-block;',

IMG_STYLE: 'padding:4px; border:1px #ccc solid; background:#fff; margin:0;',

form_image:
function form_image(href, src) {
    var html = '<a style="' 
        + ext.HototVideoPreview.BORDER_STYLE
        + '" href="'+href+'"><img style="'
        + ext.HototVideoPreview.IMG_STYLE
        + '" src="'+ src +'" /></a>'
    return html;
},

on_form_tweet_text:
function on_form_tweet_text(text) {
    var vid_html_arr = [];
    var vid_link_reg = ext.HototVideoPreview.vid_link_reg;
    for (var pvd_name in vid_link_reg) {
        var match = vid_link_reg[pvd_name].reg.exec(text);
        while (match != null) {
            switch (pvd_name) {
                case 'youtube.com':
                    if (ext.HototVideoPreview.ytb_thmb_s != 'lg'){
                        vid_html_arr.push(
                            ext.HototVideoPreview.form_image(
                            match[1], vid_link_reg[pvd_name].base + match[3] + vid_link_reg[pvd_name].tail_sm));
                    } else {
                        vid_html_arr.push(
                            ext.HototVideoPreview.form_image(
                            match[1], vid_link_reg[pvd_name].base + match[3] + vid_link_reg[pvd_name].tail_lg));
                    }; 
                    break;
            }
            match = vid_link_reg[pvd_name].reg.exec(text);
        }
    }
    if (vid_html_arr.length != 0) {
        text += '<p>'+vid_html_arr.join('')+'</p>';
    }
    return text;
},

load:
function load () {
    ext.register_listener(ext.FORM_TWEET_TEXT_LISTENER_AFTER
        , ext.HototVideoPreview.on_form_tweet_text);
    ext.HototVideoPreview.prefs = new ext.Preferences(ext.HototVideoPreview.id);
    ext.HototVideoPreview.prefs.get('ytb_thmb_size', function (key, val) {
        ext.HototVideoPreview.ytb_thmb_s = val;
    });
},

unload:
function unload() {
    ext.unregister_listener(ext.FORM_TWEET_TEXT_LISTENER_AFTER
        , ext.HototVideoPreview.on_form_tweet_text);
},

on_btn_save_prefs_clicked:
function on_btn_save_prefs_clicked(event) {
    var ytb_thmb_size = $('#ext_hotot_videopreview_ytb_thmb').attr('value');
    ext.HototVideoPreview.prefs.set('ytb_thmb_size', ytb_thmb_size);
    ui.DialogHelper.close(ui.CommonDlg);
},

options:
function options() {
    var title = 'Options of Hotot Video Preview';
    var options_arr = [];
    for (var code in ext.HototVideoPreview.ytb_thmb) {
        var name = ext.HototVideoPreview.ytb_thmb[code];
        options_arr.push('<option value="'+code+'">'+name+'</option>');
    }
    content = '<p>\
        <label>Youtube thumbnails size*:</label></p><p>\
        <select id="ext_hotot_videopreview_ytb_thmb" title="Choose a thumbnail size for youtube videos." class="dark">'
        + options_arr.join() +   
        '</select></p>\
        <span style="font-size:10px;">\
            * Restart needed.\
        </span>\
';

    ui.CommonDlg.reset(); 
    ui.CommonDlg.set_title(title);
    ui.CommonDlg.set_content(content);
    ui.CommonDlg.add_button('ext_btn_hotot_videopreview_save'
        , 'Save', 'Save Your Changes'
        , ext.HototVideoPreview.on_btn_save_prefs_clicked);

    var ytb_thmb_size = 'sm';
    ext.HototVideoPreview.prefs.get('ytb_thmb_size', function (key, val) {
        if (val == null) {
            ext.HototVideoPreview.prefs.set('ytb_thmb_size', ytb_thmb_size);
        } else {
            ytb_thmb_size = val;
        }

        var selected_idx = 0;
        for (var code in ext.HototVideoPreview.ytb_thmb) {
            if (code == ytb_thmb_size){
                break;
            }
            selected_idx += 1;
        }
        $('#ext_hotot_videopreview_ytb_thmb')
            .attr('selectedIndex', selected_idx);
    });

    ui.DialogHelper.open(ui.CommonDlg); 
},

}

