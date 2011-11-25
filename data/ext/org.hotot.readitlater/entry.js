if (typeof ext == 'undefined') var ext = {};
var readitlater_apikey='4c2T7D4dg52f6r440gd746eW4cpkG7f6';
ext.HototReaditlater = {

id: 'org.hotot.readitlater',

name: 'Hotot Readitlater',

description: 'Save tweets to Readitlater.com for reading later.',

version: '1.0',

author: 'anamewing',

url: 'http://hotot.org',

icon: 'icon.png',



auth_url: 'https://readitlaterlist.com/v2/auth?username={%USERNAME%}&password={%PASSWORD%}&apikey='+readitlater_apikey,

add_url: 'https://readitlaterlist.com/v2/add?username={%USERNAME%}&password={%PASSWORD%}&apikey='+readitlater_apikey+'&url={%URL%}&title={%SELECTION%}',

prefs: null,

option_dialog: null,

on_tweet_more_mitem_clicked:
function on_tweet_more_mitem_clicked(li_id) {
    ext.HototReaditlater.do_prepare(li_id);
},

do_add:
function do_add(username, password, url, text, callback) {
    var req_url = ext.HototReaditlater.add_url;
    req_url = req_url.replace('{%USERNAME%}', encodeURIComponent(username));
    req_url = req_url.replace('{%PASSWORD%}', encodeURIComponent(password));
    req_url = req_url.replace('{%URL%}', encodeURIComponent(url));
    req_url = req_url.replace('{%SELECTION%}', encodeURIComponent(text));
    $.get(req_url, callback);
},

do_prepare:
function do_prepare(li_id) {
    var tweet_id = li_id;
    var text = $(tweet_id + ' .card_body').children('.text').text();
    var m = text.match(ext.HototReaditlater.reg_url);
    if (m == null) return;
    var url = m[1];
    var username = '';
    var password = '';
    ext.HototReaditlater.prefs.get('username', function (key, val) {
        username = val;
        ext.HototReaditlater.prefs.get('password', function (key, val) {
            password = val;
            toast.set('Add to Readitlater ...').show();
            ext.HototReaditlater.do_add(username, password, url, text
                , function (result) {
                    if (result == '200 OK') {
                        toast.set('Saved!').show();
                    } else {
                        toast.set('Error Code:'+ result).show();
                    }
                });
        });
    });
},

on_btn_save_prefs_clicked:
function on_btn_save_prefs_clicked(event) {
    var username = $('#ext_hotot_readitlater_username').attr('value');
    var password = $('#ext_hotot_readitlater_password').attr('value');
    ext.HototReaditlater.prefs.set('username', username);
    ext.HototReaditlater.prefs.set('password', password);
    ext.HototReaditlater.option_dialog.close();
},

create_option_dialog:
function create_option_dialog() {
    var title = 'Options of Hotot Readitlater';

    var body = '<p>\
    <label>Sign in to Readitlater:</label></p><p>\
    <table><tr><td>Username:</td><td><input id="ext_hotot_readitlater_username" type="text" class="entry"/></td></tr>\
    <tr><td>Password:</td><td><input id="ext_hotot_readitlater_password" type="password" class="entry"/></td></tr>\
    </table></p>';

    ext.HototReaditlater.option_dialog 
        = widget.DialogManager.build_dialog(
              '#ext_readitlater_opt_dialog'
            , title, '', body
            , [{  id: '#ext_btn_hotot_readitlater_save', label: 'Save'
                , click: ext.HototReaditlater.on_btn_save_prefs_clicked}] 
            );
    ext.HototReaditlater.option_dialog.set_styles('header', {'display': 'none', 'height':'0'});
    ext.HototReaditlater.option_dialog.resize(400, 250);
},

enable:
function enable() {
    ext.add_tweet_more_menuitem('ext_btn_hotot_readitlater'
        , 'Read it later'
        , true
        , ext.HototReaditlater.on_tweet_more_mitem_clicked);

    ext.HototReaditlater.reg_url = new RegExp( 
        '[a-zA-Z]+:\\/\\/(' + ui.Template.reg_url_path_chars+'+)');
    ext.HototReaditlater.prefs = new ext.Preferences(ext.HototReaditlater.id);

},

disable:
function disable() {
    ext.remove_tweet_more_menuitem('ext_btn_hotot_readitlater');
},

options:
function options() {
    if (ext.HototReaditlater.prefs == null) {
        ext.HototReaditlater.prefs = new ext.Preferences(ext.HototReaditlater.id);
    }

    ext.HototReaditlater.prefs.get('username', function (key, val) {
        $('#ext_hotot_readitlater_username').val(val == null? '': val);
    });
    ext.HototReaditlater.prefs.get('password', function (key, val) {
        $('#ext_hotot_readitlater_password').val(val == null? '': val);
    });

    if (!ext.HototReaditlater.option_dialog) {
        ext.HototReaditlater.create_option_dialog();        
    }
    ext.HototReaditlater.option_dialog.open();
},

}

