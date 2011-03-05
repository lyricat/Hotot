if (typeof ext == 'undefined') var ext = {};
ext.HototTranslate = {

id: 'org.hotot.translate',

name: 'Hotot Translate',

description: 'Translate tweets.',

version: '1.0',

author: 'Shellex Wai',

url: 'http://hotot.org',

icon: 'icon.png',

languages: {
 'af':  'Afrikaans'   ,
 'sq':  'Albanian'    ,
 'am':  'Amharic'     ,
 'ar':  'Arabic'      ,
 'hy':  'Armenian'    ,
 'az':  'Azerbaijani' ,
 'eu':  'Basque'      ,
 'be':  'Belarusian'  ,
 'bn':  'Bengali'     ,
 'bh':  'Bihari'      ,
 'br':  'Breton'      ,
 'bg':  'Bulgarian'   ,
 'my':  'Burmese'     ,
 'ca':  'Catalan'     ,
 'chr':  'Cherokee'    ,
 'zh':  'Chinese'     ,
 'zh-CN':  'Chinese (Simplified)' ,
 'zh-TW':  'Chinese (Traditional)' ,
 'co':  'Corsican'    ,
 'hr':  'Croatian'    ,
 'cs':  'Czech'       ,
 'da':  'Danish'      ,
 'dv':  'Dhivehi'     ,
 'nl':  'Dutch'       ,
 'en':  'English'     ,
 'eo':  'Esperanto'   ,
 'et':  'Estonian'    ,
 'fo':  'Faroese'     ,
 'tl':  'Filipino'    ,
 'fi':  'Finnish'     ,
 'fr':  'French'      ,
 'fy':  'Frisian'     ,
 'gl':  'Galician'    ,
 'ka':  'Georgian'    ,
 'de':  'German'      ,
 'el':  'Greek'       ,
 'gu':  'Gujarati'    ,
 'ht':  'Haitian (Creole)' ,
 'iw':  'Hebrew'      ,
 'hi':  'Hindi'       ,
 'hu':  'Hungarian'   ,
 'is':  'Icelandic'   ,
 'id':  'Indonesian'  ,
 'iu':  'Inuktitut'   ,
 'ga':  'Irish'       ,
 'it':  'Italian'     ,
 'ja':  'Japanese' ,
 'jw':  'Javanese' ,
 'kn':  'Kannada' ,
 'kk':  'Kazakh' ,
 'km':  'Khmer' ,
 'ko':  'Korean' ,
 'ku':  'Kurdish',
 'ky':  'Kyrgyz',
 'lo':  'Lao' ,
 'la':  'Latin' ,
 'lv':  'Latvian' ,
 'lt':  'Lithuanian' ,
 'lb':  'Luxembourgish' ,
 'mk':  'Macedonian' ,
 'ms':  'Malay' ,
 'ml':  'Malayalam' ,
 'mt':  'Maltese' ,
 'mi':  'Maori' ,
 'mr':  'Marathi' ,
 'mn':  'Mongolian' ,
 'ne':  'Nepali' ,
 'no':  'Norwegian' ,
 'oc':  'Occitan' ,
 'or':  'Oriya' ,
 'ps':  'Pashto' ,
 'fa':  'Persian' ,
 'pl':  'Polish' ,
 'pt':  'Portuguese' ,
 'pt-pt':  'Portuguese (Portugal)' ,
 'pa':  'Punjabi' ,
 'qu':  'Quechua' ,
 'ro':  'Romanian' ,
 'ru':  'Russian' ,
 'sa':  'Sanskrit' ,
 'gd':  'Scots_gaelic' ,
 'sr':  'Serbian' ,
 'sd':  'Sindhi' ,
 'si':  'Sinhalese' ,
 'sk':  'Slovak' ,
 'sl':  'Slovenian' ,
 'es':  'Spanish' ,
 'su':  'Sundanese' ,
 'sw':  'Swahili' ,
 'sv':  'Swedish' ,
 'syr':  'Syriac' ,
 'tg':  'Tajik' ,
 'ta':  'Tamil' ,
 'tt':  'Tatar' ,
 'te':  'Telugu' ,
 'th':  'Thai' ,
 'bo':  'Tibetan' ,
 'to':  'Tonga' ,
 'tr':  'Turkish' ,
 'uk':  'Ukrainian' ,
 'ur':  'Urdu' ,
 'uz':  'Uzbek' ,
 'ug':  'Uighur' ,
 'vi':  'Vietnamese' ,
 'cy':  'Welsh' ,
 'yi':  'Yiddish' ,
 'yo':  'Yoruba' ,
 '':  'Unknown' 
},

on_centext_mitem_clicked:
function on_centext_mitem_clicked() {
    var dst_lang = 'en';
    ext.HototTranslate.prefs.get('dst_lang', function (key, val) {
        if (val == null) {
            ext.HototTranslate.prefs.set('dst_lang', dst_lang);
        } else {
            dst_lang = val;
        }
        ext.HototTranslate.do_translate_selection(dst_lang);
    });
},

on_tweet_more_mitem_clicked:
function on_tweet_more_mitem_clicked(li_id) {
    var dst_lang = 'en';
    ext.HototTranslate.prefs.get('dst_lang', function (key, val) {
        if (val == null) {
            ext.HototTranslate.prefs.set('dst_lang', dst_lang);
        } else {
            dst_lang = val;
        }
        ext.HototTranslate.do_translate_tweet(li_id, dst_lang);
    });
},

do_translate_selection:
function do_translate_selection(dst_lang) {
    var text = ui.ContextMenu.selected_string;
    var style = 'background: #333; overflow: auto; padding: 2px 5px;';
    ext.HototTranslate.do_translate(dst_lang, text,
    function (result) {
        var content = '';
        if (result.responseStatus == 200) {
            content = '<strong>Source</strong>:<p style="'+style+'">' + text
                + '</p><strong>'
                + ext.HototTranslate.languages[dst_lang]
                + '</strong>:<p style="'+style+'">'
                + result.responseData.translatedText+'</p>';
        } else {
            content = '<strong>ERROR</strong>: ' + result.responseDetails;
        }
        ui.MessageDlg.set_text('Translate Result', content);
        ui.DialogHelper.open(ui.MessageDlg)
    });
},

do_translate:
function do_translate(dst_lang, text, callback) {
    var url = 'http://ajax.googleapis.com/ajax/services/language/translate?langpair=|' + dst_lang + '&v=1.0&q=' + encodeURIComponent(text)
    $.getJSON(url, callback);
},

do_translate_tweet:
function do_translate_tweet(li_id, dst_lang) {
    var tweet_id = li_id;
    var text = $(tweet_id + ' .card_body').children('.text');
    var style = 'background:transparent url('
                + 'ext/'+ext.HototTranslate.id+'/ic16_translate.png'
                +') no-repeat;padding-left:20px;';
    ext.HototTranslate.do_translate(dst_lang, text.text(),
    function (result) {
        var content = '';
        if (result.responseStatus == 200) {
            content = '<strong style="'+style+'">'
                + ext.HototTranslate.languages[dst_lang] +'</strong>: '
                + result.responseData.translatedText;
        } else {
            content = '<strong style="'+style+'">ERROR</strong>: ' + result.responseDetails;
        }
        $(tweet_id + ' .tweet_body').children('.hotot_translate').remove(); 
        text.after(
            '<div class="hotot_translate" style="background-color:rgba(0,0,0,0.1); padding: 5px; border-radius: 5px;">'+content+'</div>');
    });
},

on_btn_save_prefs_clicked:
function on_btn_save_prefs_clicked(event) {
    var dst_lang = $('#ext_hotot_translate_dst_language').attr('value');
    ext.HototTranslate.prefs.set('dst_lang', dst_lang);
    ui.DialogHelper.close(ui.CommonDlg);
},

load:
function load () {
    ext.add_context_menuitem('ext_btn_hotot_translate'
        , 'Translate Selection.'
        , true
        , ext.HototTranslate.on_centext_mitem_clicked);

    ext.add_tweet_more_menuitem('ext_btn_hotot_translate'
        , 'Translate'
        , true
        , ext.HototTranslate.on_tweet_more_mitem_clicked);

    ext.HototTranslate.prefs = new ext.Preferences(ext.HototTranslate.id);
},

unload:
function unload() {
    ext.remove_context_menuitem('ext_btn_hotot_translate');
    ext.remove_tweet_more_menuitem('ext_btn_hotot_translate');
},

options:
function options() {
    if (ext.HototTranslate.prefs == null) {
        ext.HototTranslate.prefs = new ext.Preferences(ext.HototTranslate.id);
    }
    var title = 'Options of Hotot Translate';
    var options_arr = [];
    for (var code in ext.HototTranslate.languages) {
        var name = ext.HototTranslate.languages[code];
        options_arr.push('<option value="'+code+'">'+name+'</option>');
    }
    content = '<p>\
        <label>Default destination language:</label></p><p>\
        <center><select id="ext_hotot_translate_dst_language" title="Choose a destination language." class="dark"></center>'
        + options_arr.join() +   
        '</select></p>';

    ui.CommonDlg.reset(); 
    ui.CommonDlg.set_title(title);
    ui.CommonDlg.set_content(content);
    ui.CommonDlg.add_button('ext_btn_hotot_translate_save'
        , 'Save', 'Save Your Changes'
        , ext.HototTranslate.on_btn_save_prefs_clicked);

    var dst_lang = 'en';
    ext.HototTranslate.prefs.get('dst_lang', function (key, val) {
        if (val == null) {
            ext.HototTranslate.prefs.set('dst_lang', dst_lang);
        } else {
            dst_lang = val;
        }

        var selected_idx = 0;
        for (var code in ext.HototTranslate.languages) {
            if (code == dst_lang){
                break;
            }
            selected_idx += 1;
        }
        $('#ext_hotot_translate_dst_language')
            .attr('selectedIndex', selected_idx);
    });

    ui.DialogHelper.open(ui.CommonDlg); 
},

}

