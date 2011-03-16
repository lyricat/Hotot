if (typeof ext == 'undefined') var ext = {};
ext.HototInstapaper = {

id: 'org.hotot.instapaper',

name: 'Hotot Instapaper',

description: 'Save tweets to Instapaper.com for reading later.',

version: '1.0',

author: 'Shellex Wai',

url: 'http://hotot.org',

icon: 'icon.png',

auth_url: 'https://www.instapaper.com/api/authenticate?username={%USERNAME%}&password={%PASSWORD%}',

add_url: 'https://www.instapaper.com/api/add?username={%USERNAME%}&password={%PASSWORD%}&url={%URL%}&title=&selection={%SELECTION%}',

prefs: null,

option_dialog: null,

on_tweet_more_mitem_clicked:
function on_tweet_more_mitem_clicked(li_id) {
    ext.HototInstapaper.do_prepare(li_id);
},

do_add:
function do_add(username, password, url, text, callback) {
    var req_url = ext.HototInstapaper.add_url;
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
    var m = text.match(ext.HototInstapaper.reg_url);
    if (m == null) return;
    var url = m[1];
    var username = '';
    var password = '';
    ext.HototInstapaper.prefs.get('username', function (key, val) {
        username = val;
        ext.HototInstapaper.prefs.get('password', function (key, val) {
            password = val;
            ui.Notification.set('Add to Instapaper ...').show();
            ext.HototInstapaper.do_add(username, password, url, text
                , function (result) {
                    if (result == '201') {
                        ui.Notification.set('Saved!').show();
                    } else {
                        ui.Notification.set('Error Code:'+ result).show();
                    }
                });
        });
    });
},

on_btn_save_prefs_clicked:
function on_btn_save_prefs_clicked(event) {
    var username = $('#ext_hotot_instapaper_username').attr('value');
    var password = $('#ext_hotot_instapaper_password').attr('value');
    ext.HototInstapaper.prefs.set('username', username);
    ext.HototInstapaper.prefs.set('password', password);
    ext.HototInstapaper.option_dialog.close();
},

create_option_dialog:
function create_option_dialog() {
    var title = 'Options of Hotot Instapaper';

    var body = '<p>\
    <label>Sign in to Instapaper:</label></p><p>\
    <table><tr><td>Username:</td><td><input id="ext_hotot_instapaper_username" type="text" class="entry"/></td></tr>\
    <tr><td>Password:</td><td><input id="ext_hotot_instapaper_password" type="password" class="entry"/></td></tr>\
    </table></p>';

    ext.HototInstapaper.option_dialog 
        = widget.DialogManager.build_dialog(
              '#ext_instapaper_opt_dialog'
            , title, '', body
            , [{  id: '#ext_btn_hotot_instapaper_save', label: 'Save'
                , click: ext.HototInstapaper.on_btn_save_prefs_clicked}] 
            );
    ext.HototInstapaper.option_dialog.set_styles('header', {'display': 'none', 'height':'0'});
    ext.HototInstapaper.option_dialog.resize(400, 250);
},

load:
function load () {
    ext.add_tweet_more_menuitem('ext_btn_hotot_instapaper'
        , 'Read Later'
        , true
        , ext.HototInstapaper.on_tweet_more_mitem_clicked);

    ext.HototInstapaper.reg_url = new RegExp( 
        '[a-zA-Z]+:\\/\\/(' + ui.Template.reg_url_path_chars+'+)');
    ext.HototInstapaper.prefs = new ext.Preferences(ext.HototInstapaper.id);

},

unload:
function unload() {
    ext.remove_tweet_more_menuitem('ext_btn_hotot_instapaper');
},

options:
function options() {
    if (ext.HototInstapaper.prefs == null) {
        ext.HototInstapaper.prefs = new ext.Preferences(ext.HototInstapaper.id);
    }

    ext.HototInstapaper.prefs.get('username', function (key, val) {
        $('#ext_hotot_instapaper_username').val(val == null? '': val);
    });
    ext.HototInstapaper.prefs.get('password', function (key, val) {
        $('#ext_hotot_instapaper_password').val(val == null? '': val);
    });

    if (!ext.HototInstapaper.option_dialog) {
        ext.HototInstapaper.create_option_dialog();        
    }
    ext.HototInstapaper.option_dialog.open();
},

}

