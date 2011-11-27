if (typeof ui == 'undefined') var ui = {};
ui.KismetDlg = {
init:
function init() {
    var filter_btns = new widget.RadioGroup('#kismet_cat_btns');
    filter_btns.on_clicked = function (btn, event) {
        var name = btn.attr('href').substring(1);
        ui.KismetDlg.switch_category(name);
        return false;
    };
    filter_btns.create();
    $('#kismet_cat_btns .radio_group_btn:eq(0)').click();

    
    // dialogs
    ui.KismetDlg.rule_edit_dialog = new widget.Dialog('#kismet_rule_edit_dialog');
    ui.KismetDlg.rule_edit_dialog.set_styles('header', 
            {'height': '0px', 'padding':'0px', 'display': 'none'});
    ui.KismetDlg.rule_edit_dialog.resize(500, 450);
    ui.KismetDlg.rule_edit_dialog.create();
    
    ui.KismetDlg.guide_dialog = new widget.Dialog('#kismet_guide_dialog');
    ui.KismetDlg.guide_dialog.set_styles('header', 
            {'height': '0px', 'padding':'0px', 'display': 'none'});
    ui.KismetDlg.guide_dialog.resize(500, 400);
    ui.KismetDlg.guide_dialog.create();

    $('.kismet_sample').click(function () {
        var text = $(this).text();
        $('#kismet_rule_edit_data').val($('#kismet_rule_edit_data').val() + ' ' +text);
        return false;
    });

    $('#kismet_add_rule_btn').click(function () {
        ui.KismetDlg.show_edit_dialog({name:'', rule:''});
        return false;
    });

    $('#kismet_rule_edit_ok').click(function () {
        var name = $.trim($('#kismet_rule_edit_name').val());
        var data = $.trim($('#kismet_rule_edit_data').val());
        if (name.length == 0 || data.length == 0) {
            toast.set('Please fill all fields.').show(3);
            return false;
        }
        if (kismet.compile(data) == kismet.ERROR) {
            toast.set('Verify failed, please check your rule.').show(3);
            return false;
        }
        var rule = { name: name, data: data };
        kismet.update_rule(rule);
        kismet.save();
        ui.KismetDlg.reload();
        ui.KismetDlg.rule_edit_dialog.close();
        return false;
    });
    
    $('#kismet_rule_edit_verify').click(function () {
        var data = $.trim($('#kismet_rule_edit_data').val());
        var ret = kismet.compile(data);
        if (ret != kismet.ERROR) {
            widget.DialogManager.alert('Verify Result', kismet.rule_string);
        } else {
            toast.set('Verify failed, please check your rule.').show(3);
        }
        return false;
    });

    $('#kismet_dialog .rule').live('click', function () {
        $('#kismet_rule_list .rule').removeClass('selected');
        $(this).addClass('selected');
        $('#kismet_rule_list .rule').parent().removeClass('selected');
        $(this).parent().addClass('selected');
        return false;
    });
    
    $('#kismet_dialog .delete_btn').live('click', function () {
        var s=$('#kismet_rule_list .rule.selected');
        if (s.length == 0) { return false; }
        kismet.remove_rule(decodeURIComponent(s.attr('rule_name')));
        ui.KismetDlg.reload();
        return false;
    });
    
    $('#kismet_dialog .edit_btn').live('click', function () {
        var s=$('#kismet_rule_list .rule.selected');
        if (s.length == 0) { return false; }
        var rule = {
            name: decodeURIComponent(s.attr('rule_name')),
            data: decodeURIComponent(s.attr('rule_data')),
        };
        ui.KismetDlg.show_edit_dialog(rule);
        return false;
    });
    
    $('#kismet_save_btn').click(function () {
        kismet.save();
        globals.kismet_dialog.close();
        return false;
    });

    $('#kismet_guide_next_btn').click(function () {
        var marked = $('#kismet_guide_dialog .marked');
        if (marked.length == 0) { //  
            toast.set('Please select a field!').show(3);
            return false;
        }
        var rule_data_arr = [];
        for (var i = 0; i < marked.length; i += 1) {
            var text = $.trim($(marked[i]).text());
            if ($(marked[i]).hasClass('who_href')) {
                rule_data_arr.push('name:' + text);
            } else if ($(marked[i]).parent().hasClass('tweet_source')) {
                rule_data_arr.push('via:"' + text + '"');
            } else if ($(marked[i]).hasClass('word')) {
                if (text[0] == '#') {
                    rule_data_arr.push('tag:' + text.substring(1));
                } else if (text[0] == '@') {
                    rule_data_arr.push('mention:' + text.substring(1));
                } else {
                    rule_data_arr.push('"'+text+'"');
                }
            }
        }
        $('#kismet_guide_dialog .checkbox:checked').each(function (i, n) {
            rule_data_arr.push('do:' + $(n).val());
        });
        var rule_data = rule_data_arr.join(' ');
        if (kismet.compile(rule_data) != kismet.ERROR) {
            var rule = {name: kismet.rule_string, data: rule_data};
            ui.KismetDlg.show_edit_dialog(rule);
        }
        ui.KismetDlg.guide_dialog.close();
        return false;
    });
    ui.KismetDlg.reload();
},

switch_category:
function switch_category(name) {
    $('#kismet_dialog .kismet_page').hide();
    $('#kismet_dialog .'+name).show();
},

show_edit_dialog:
function show_edit_dialog(default_value) {
    if (default_value) {
        $('#kismet_rule_edit_name').val(default_value.name);
        $('#kismet_rule_edit_data').val(default_value.data);
    } else {
        $('#kismet_rule_edit_dialog .entry').val('');
    }
    ui.KismetDlg.rule_edit_dialog.open();
    var e = $('#kismet_rule_edit_dialog .entry:eq(0)');
    e.get(0).selectionStart = e.val().length;
    e.get(0).selectionEnd = e.val().length;
    e.focus();
},

load_guide:
function load_guide(tweet) {
    if (tweet.user != undefined) {
        var html = ui.Template.form_tweet(tweet, "kismet_guide");
        $('#kismet_guide_dialog .sample_area').html(html);
        var words = tweet.text.split(/[\s,-:;'".，。；：-]/)
            .filter(function (x) { return x.length != 0; })
            .map(function (x) {
                return '<span class="word">' + x + '</span>';
            });
        $('#kismet_guide_dialog .sample_area .text').html(words.join(' '));
    }
    $('#kismet_guide_dialog .sample_area .who_href, #kismet_guide_dialog .sample_area .word, #kismet_guide_dialog .sample_area .tweet_source > a, #kismet_guide_dialog .sample_area .hash_href')
        .unbind()
        .click(function (ev) {
            if (ev.target == this) {
                $(this).toggleClass('marked');
            }
            return false;
        });
},

reload:
function reload() {
    $('#kismet_rule_list .button').unbind();
    $('#kismet_rule_list .rule').unbind();
    $('#kismet_rule_list').empty();
    for (var i = 0; i < kismet.rules.length; i += 1) {
        var li = $('<li/>');
        var rule = $('<a class="rule"/>');
        rule.appendTo(li);
        rule.text(kismet.rules[i].name);
        rule.attr('rule_name', encodeURIComponent(kismet.rules[i].name));
        rule.attr('rule_data', encodeURIComponent(kismet.rules[i].data));
        $('<div class="item_ctrl"><a href="#" class="button edit_btn">Edit</a><a href="#" class="button delete_btn">Delete</a></div>').appendTo(li);
        li.appendTo($('#kismet_rule_list'));
    }
},


}
