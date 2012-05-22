if (typeof ext == 'undefined') var ext = {};
ext.AppMask = {

id: 'org.hotot.appmask',

name: 'AppMask',

description: 'Change your source application name.',

version: '0.3',

author: 'Xu Zhen',

icon: "icon.png",

url: 'https://github.com/xnreformer/hotot-exts',

prefs: {
	"consumer_key": conf.vars.consumer_key,
	"consumer_secret": conf.vars.consumer_secret
},

def_prefs: {
	"consumer_key": conf.vars.consumer_key,
	"consumer_secret": conf.vars.consumer_secret
},

db: null,

open_option_dialog:
function open_option_dialog() {
	var title = 'App Setting';
	var body = '<style>'+
			'#ext_hotot_appmask_opt_dialog .dialog_body>ol{list-style-type:decimal;margin-left:25px}'+
			'#ext_hotot_appmask_opt_dialog .dialog_body li{margin:10px 0}'+
			'#ext_hotot_appmask_opt_dialog .dialog_body table{margin:0 10px}'+
			'#ext_hotot_appmask_opt_dialog .dialog_body td{border:none;padding:0px}'+
			'#ext_hotot_appmask_opt_dialog .dialog_body input{width:200px}'+
		'</style>'+
		'<ol>'+
		'<li>'+
		'Visit <a href="https://dev.twitter.com/apps">https://dev.twitter.com/apps</a> and create your own application'+
		'</li>'+
		'<li>'+
		'<span>Paste consumer key & secret here:</span>'+
		'<table>'+
		'<tbody>'+
		'<tr>'+
		'<td>Consumer Key:</td>'+
		'<td><input type="text" id="ext_hotot_appmask_consumer_key"/></td>'+
		'</tr>'+
		'<tr>'+
		'<td>Consumer Secret:</td>'+
		'<td><input type="text" id="ext_hotot_appmask_consumer_secret"/></td>'+
		'</tr>'+
		'</tbody>'+
		'</table>'+
		'</li>'+
		'<li>'+
		'<span>Clean old token & reauthorize<span>'+
		'</li>'+
		'</ol>';
		
	ext.AppMask.option_dialog = widget.DialogManager.build_dialog(
		'#ext_hotot_appmask_opt_dialog', title, '', body, [
			{id:'#ext_btn_appmask_reset', label: 'Reset', click: ext.AppMask.on_btn_reset_clicked},
			{id:'#ext_btn_appmask_save', label: 'Save', click: ext.AppMask.on_btn_save_prefs_clicked}
		]);
	ext.AppMask.option_dialog.set_styles('header', {'display': 'none', 'height': '0'});
	ext.AppMask.option_dialog.resize(400, 280);

	$("#ext_btn_appmask_reset").css("padding-right", "10px");

	var prefs = ext.AppMask.prefs;
	for (var key in prefs) {
		$('#ext_hotot_appmask_' + key).val(prefs[key]);
	}
	
	ext.AppMask.option_dialog.open();
},

on_btn_reset_clicked:
function on_btn_reset_clicked() {
	var prefs = ext.AppMask.def_prefs;
	for (var key in prefs) {
		$('#ext_hotot_appmask_' + key).val(prefs[key]);
	}
},

on_btn_save_prefs_clicked:
function on_btn_save_prefs_clicked() {

	var prefs = {
		"consumer_key": "",
		"consumer_secret": ""
	};
	for (var key in prefs) {
		var value = $('#ext_hotot_appmask_' + key).val();
		if (value) {
			prefs[key] = value;
		} else {
			toast.set("Please fill the " + key.replace("_", " ") + " field").show();
			$('#ext_hotot_appmask_' + key).focus();
			return;
		}
	}

	ext.AppMask.prefs = prefs;
	ext.AppMask.db.set('prefs', JSON.stringify(prefs));

	ext.AppMask.option_dialog.close();
	ext.AppMask.option_dialog = null;
},

enable:
function enable() {
	var key = ext.AppMask.prefs.consumer_key;
	var secret = ext.AppMask.prefs.consumer_secret;
	if (key && secret) {
		conf.vars.consumer_key = globals.twitterClient.oauth.key = key;
		conf.vars.consumer_secret = globals.twitterClient.oauth.secret = secret;
	}
},

disable:
function disable() {
	var key = ext.AppMask.def_prefs.consumer_key;
	var secret = ext.AppMask.def_prefs.consumer_secret;
	conf.vars.consumer_key = globals.twitterClient.oauth.key = key;
	conf.vars.consumer_secret = globals.twitterClient.oauth.secret = secret;
},

options:
function options() {
	ext.AppMask.open_option_dialog();
},

}

ext.AppMask.db = new ext.Preferences(ext.AppMask.id);
ext.AppMask.db.get('prefs', function(key, val) {
	if (val) {
		var prefs = JSON.parse(val);
		if (prefs.consumer_key != null) {
			ext.AppMask.prefs.consumer_key = prefs.consumer_key;
		}
		if (prefs.consumer_secret != null) {
			ext.AppMask.prefs.consumer_secret = prefs.consumer_secret;
		}
	}
});
