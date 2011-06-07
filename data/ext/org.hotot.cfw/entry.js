if (typeof ext == 'undefined') var ext = {};
ext.ContentFirewall = {

id: 'org.hotot.cfw',

name: 'Hotot Content Firewall',

description: 'filter out tweets based on content/user/source.',

version: '0.2',

author: 'Xu Zhen',

icon: 'icon.png',

url: 'http://code.google.com/p/hotot-extensionz',

prefs: {
	timeline: false,
	mentions: false,
	messages: false,
	others: false,
	whitelist: [],
	blacklist: [],
},

db: null,

on_add_tweets:
function on_add_tweets(tweets, container, reversion) {
	if (tweets.length == 0) {
		return;
	}

	var prefs = ext.ContentFirewall.prefs;

	if (prefs.blacklist.length == 0) {
		return;
	}

	switch (container.pagename) {
		case 'home_timeline':
			if (!prefs.timeline) {
				return;
			}
			break;
		case 'mentions':
			if (!prefs.mentions) {
				return;
			}
			break;
		case 'direct_messages_inbox':
		case 'direct_messages_outbox':
			if (!prefs.messages) {
				return;
			}
			break;
		default:
			if (!prefs.others) {
				return;
			}
	}

	var check_tweets = function (rulelist, tweets, ignorelist, callback) {
		if (rulelist.length == 0) {
			return;
		}
		var rules = rulelist.concat();
		for (var i = rules.length - 1; i >= 0; i--) {
			var rule = rules[i];
			if (!rule.enable) {
				rules.splice(i, 1);
			} else if (rule.type == 'regexp') {
				try {
					// case insensitive
					rule.pattern = new RegExp(rule.pattern, 'i');
				} catch (ex) {
					rules.splice(i, 1);
					hotot_log('Content Firewall', 'invalid regexp rule: ' + rule.pattern);
				}
			}
		}

		for (var ti = tweets.length - 1; ti >= 0; ti--) {
			if (ignorelist && ignorelist[ti]) {
				continue;
			}
			var tweet = tweets[ti];
			try {
				for (var ri = 0; ri < rules.length; ri++) {
					var rule = rules[ri];
					var text = '';
					var partial = false;
					switch (rule.target) {
						case 'content':
							text = tweet.text;
							partial = true;
							break;
						case 'source':
							text = $(document.createElement('div')).html(tweet.source).text();;
							break;
						case 'username':
							text = tweet.user.screen_name;
							break;
						case 'userid':
							text = tweet.user.id_str;
							break;
					}
					if (!text) {
						continue;
					}
					if (rule.type == 'plaintext') {
						if (partial) {
							if (text.indexOf(rule.pattern) >= 0) {
								callback(tweets, ti);
								break;
							}
						} else {
							if (text == rule.pattern) {
								callback(tweets, ti);
								break;
							}
						}
					} else {
						if (rule.pattern.test(text)) {
							callback(tweets, ti);
							break;
						}
					}
				}
			} catch (ex) {
				hotot_log('Content Firewall', 'check_tweets error: ' + ex.message);
			}
		}
	}

	var good_tweets = {};
	check_tweets(prefs.whitelist, tweets, null, function (tweets, idx) {
		good_tweets[idx] = 1;
	});

	check_tweets(prefs.blacklist, tweets, good_tweets, function (tweets, idx) {
		tweets.splice(idx, 1);
	});
},

open_option_dialog:
function open_option_dialog() {
	var title = 'Content Firewall';
	var body = '<style>'+
			'#ext_hotot_cfw_opt_dialog table{table-layout:fixed}'+
			'#ext_hotot_cfw_opt_dialog table td{padding:2px;text-align:center}'+
			'.ext_hotot_cfw_rule_pattern{width:116px}'+
			'.ext_hotot_cfw_rule_type{width:76px}'+
			'.ext_hotot_cfw_rule_target{width:76px}'+
			'.ext_hotot_cfw_rule_delete{width:38px}'+
			'.ext_hotot_cfw_new_rule{text-align:center}'+
		'</style>'+
		'<p>'+
		'<label>Filter:</label>'+
		'<input type="checkbox" id="ext_hotot_cfw_timeline" class="dark"/>Timeline</input>'+
		'<input type="checkbox" id="ext_hotot_cfw_mentions" class="dark"/>Mentions</input>'+
		'<input type="checkbox" id="ext_hotot_cfw_messages" class="dark"/>Messages</input>'+
		'<input type="checkbox" id="ext_hotot_cfw_others" class="dark"/>Others</input>'+
		'</p>'+
		'<p>&nbsp;</p>'+
		'<p>'+
		'<label>Blacklist Rules:</label><br/>'+
		'<table id="ext_hotot_cfw_blacklist">'+
		'<thead>'+
		'<tr>'+
			'<td style="width:28px"></td>'+
			'<td style="width:127px">Pattern</td>'+
			'<td style="width:80px">Type</td>'+
			'<td style="width:80px">Target</td>'+
			'<td style="width:47px"></td>'+
		'</tr>'+
		'</thead>'+
		'<tbody>'+
		'</tbody>'+
		'</table>'+
		'<div class="ext_hotot_cfw_new_rule">'+
		'<input type="button" id="ext_hotot_cfw_blacklist_new" value="New Rule"/>'+
		'</div>'+
		'</p>'+
		'<p>&nbsp;</p>'+
		'<p>'+
		'<label>Whitelist Rules:</label><br/>'+
		'<table id="ext_hotot_cfw_whitelist">'+
		'<thead>'+
		'<tr>'+
			'<td style="width:28px"></td>'+
			'<td style="width:127px">Pattern</td>'+
			'<td style="width:80px">Type</td>'+
			'<td style="width:80px">Target</td>'+
			'<td style="width:47px"></td>'+
		'</tr>'+
		'</thead>'+
		'<tbody>'+
		'</tbody>'+
		'</table>'+
		'<div class="ext_hotot_cfw_new_rule">'+
		'<input type="button" id="ext_hotot_cfw_whitelist_new" value="New Rule"/>'+
		'</div>'+
		'</p>';
		
	ext.ContentFirewall.option_dialog = widget.DialogManager.build_dialog(
		'#ext_hotot_cfw_opt_dialog', title, '', body,
		[{id:'#ext_btn_cfw_save', label: 'Save', click: ext.ContentFirewall.on_btn_save_prefs_clicked}]);
	ext.ContentFirewall.option_dialog.set_styles('header', {'display': 'none', 'height': '0'});
	ext.ContentFirewall.option_dialog.resize(400, 300);

	var prefs = ext.ContentFirewall.prefs;

	for (var key in prefs) {
		if (key != "blacklist" && key != "whitelist") {
			$('#ext_hotot_cfw_' + key).attr('checked', prefs[key]);
		}
	}

	var table = $("#ext_hotot_cfw_blacklist tbody");
	for (var i = 0, l = prefs.blacklist.length; i < l; i++) {
		var rule = prefs.blacklist[i];
		var item = ext.ContentFirewall.add_new_rule(rule);
		item.addClass("ext_hotot_cfw_blacklist_rule");
		table.append(item);
	}
	$("#ext_hotot_cfw_blacklist_new").click(function() {
		try {
			$("#ext_hotot_cfw_blacklist .ext_hotot_cfw_rule_pattern").each(function () {
				if (!$(this).val()) {
					$(this).focus();
					throw "";
				}
			});
			var item = ext.ContentFirewall.add_new_rule();
			item.addClass("ext_hotot_cfw_blacklist_rule");
			$("#ext_hotot_cfw_blacklist tbody").append(item);
		} catch (ex) {
		}
	})

	var table = $("#ext_hotot_cfw_whitelist tbody");
	for (var i = 0, l = prefs.whitelist.length; i < l; i++) {
		var rule = prefs.whitelist[i];
		var item = ext.ContentFirewall.add_new_rule(rule);
		item.addClass("ext_hotot_cfw_whitelist_rule");
		table.append(item);
	}
	$("#ext_hotot_cfw_whitelist_new").click(function() {
		try {
			$("#ext_hotot_cfw_whitelist .ext_hotot_cfw_rule_pattern").each(function () {
				if (!$(this).val()) {
					$(this).focus();
					throw "";
				}
			});
			var item = ext.ContentFirewall.add_new_rule();
			item.addClass("ext_hotot_cfw_whitelist_rule");
			$("#ext_hotot_cfw_whitelist tbody").append(item);
		} catch (ex) {
		}
	})

	ext.ContentFirewall.option_dialog.open();
},

add_new_rule:
function add_new_rule(rule) {
	var tr = $(document.createElement("tr"));
	tr.html('<td><input type="checkbox" class="ext_hotot_cfw_rule_enable"></input></td>'+
		'<td><input type="text" class="ext_hotot_cfw_rule_pattern"></input></td>'+
		'<td><select type="text" class="ext_hotot_cfw_rule_type">'+
			'<option value="plaintext">Plaintext</option>'+
			'<option value="regexp">Regular Expression</option>'+
		'</select></td>'+
		'<td><select type="text" class="ext_hotot_cfw_rule_target">'+
			'<option value="content">Content</option>'+
			'<option value="source">Via</option>'+
			'<option value="username">User Name</option>'+
			'<option value="userid">User ID</option>'+
		'</select></td>'+
		'<td><input type="button" class="ext_hotot_cfw_rule_delete" value="Del"/></td>');
	tr.find(".ext_hotot_cfw_rule_delete").click(function(event) {
		$(this).parents("tr").remove();
	});
	tr.find(".ext_hotot_cfw_rule_enable").click(function(event) {
		if ($(this).attr("checked")) {
			$(this).parents("tr").find("input[type=text], select").removeAttr("disabled");
		} else {
			$(this).parents("tr").find("input[type=text], select").attr("disabled", "disabled");
		}
	});
	if (rule) {
		tr.find(".ext_hotot_cfw_rule_enable").attr("checked", rule.enable);
		tr.find(".ext_hotot_cfw_rule_pattern").val(rule.pattern);
		tr.find(".ext_hotot_cfw_rule_type").val(rule.type);
		tr.find(".ext_hotot_cfw_rule_target").val(rule.target);
		if (!rule.enable) {
			tr.find("input[type=text], select").attr("disabled", "disabled");
		}
	} else {
		tr.find(".ext_hotot_cfw_rule_enable").attr("checked", true);
	}
	return tr;
},

on_btn_save_prefs_clicked:
function on_btn_save_prefs_clicked() {
	var prefs = {
		timeline: null,
		mentions: null,
		messages: null,
		others: null
	};

	for (var key in prefs) {
		prefs[key] = $('#ext_hotot_cfw_' + key).attr('checked');
	}

	try {
		prefs.blacklist = [];
		$(".ext_hotot_cfw_blacklist_rule").each(function() {
			var item = $(this);
			var rule = {};
			rule.pattern = item.find(".ext_hotot_cfw_rule_pattern").val().replace(/^\s+|\s+$/g, "");
			if (rule.pattern) {
				rule.enable = item.find(".ext_hotot_cfw_rule_enable").attr("checked");
				rule.type = item.find(".ext_hotot_cfw_rule_type").val();
				if (rule.type == "regexp") {
					try {
						new RegExp(rule.pattern);
					} catch (ex) {
						toast.set("Invalid regular expression").show();
						var input = item.find(".ext_hotot_cfw_rule_pattern").get(0);
						input.selectionStart = 0;
						input.selectionEnd = input.value.length;
						input.focus();
						throw "";
					}
				}
				rule.target = item.find(".ext_hotot_cfw_rule_target").val();
				prefs.blacklist.push(rule);
			}
		});
	
		prefs.whitelist = [];
		$(".ext_hotot_cfw_whitelist_rule").each(function() {
			var item = $(this);
			var rule = {};
			rule.pattern = item.find(".ext_hotot_cfw_rule_pattern").val().replace(/^\s+|\s+$/g, "");
			if (rule.pattern) {
				rule.enable = item.find(".ext_hotot_cfw_rule_enable").attr("checked");
				rule.type = item.find(".ext_hotot_cfw_rule_type").val();
				if (rule.type == "regexp") {
					try {
						new RegExp(rule.pattern);
					} catch (ex) {
						toast.set("Invalid regular expression").show();
						var input = item.find(".ext_hotot_cfw_rule_pattern").get(0);
						input.selectionStart = 0;
						input.selectionEnd = input.value.length;
						input.focus();
						throw "";
					}
				}
				rule.target = item.find(".ext_hotot_cfw_rule_target").val();
				prefs.whitelist.push(rule);
			}
		});
	} catch (ex) {
		return;
	}

	ext.ContentFirewall.prefs = prefs;
	ext.ContentFirewall.db.set('prefs', JSON.stringify(prefs));

	ext.ContentFirewall.option_dialog.close();
	ext.ContentFirewall.option_dialog = null;
},

parse_saved_prefs:
function parse_saved_prefs(str) {
	if (!str) {
		return;
	}
	try {
		var saved = JSON.parse(str);
		var prefs = ext.ContentFirewall.prefs;
		for (var key in prefs) {
			if (saved[key] != null) {
				prefs[key] = saved[key];
			}
		}
	} catch (ex) {
	}
},

enable:
function enable() {
	ext.add_exts_menuitem('ext_btn_hotot_cfw'
		, ext.ContentFirewall.id+'/ic16_cfw.png'
		, 'Content Firewall Setting...'
		, ext.ContentFirewall.options);

	ext.register_listener(ext.ADD_TWEETS_LISTENER
		, ext.ContentFirewall.on_add_tweets);
},

disable:
function disable() {
	ext.unregister_listener(ext.ADD_TWEETS_LISTENER
		, ext.ContentFirewall.on_add_tweets);

	ext.remove_exts_menuitem('ext_btn_hotot_cfw');
},

options:
function options() {
	ext.ContentFirewall.open_option_dialog();
},

};

// load preferences
ext.ContentFirewall.db = ext.Preferences(ext.ContentFirewall.id);
ext.ContentFirewall.db.get('prefs', function(key, val) {
	ext.ContentFirewall.parse_saved_prefs(val);
});
