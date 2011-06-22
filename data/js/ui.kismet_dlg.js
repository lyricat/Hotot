if (typeof ui == 'undefined') var ui = {};
ui.KismetDlg = {
init:
function init() {
    $('#kismet_rule_list .kismet_rule').live('click', function(event) {
        var selected = $('#kismet_rule_list .selected');
        if (selected.length == 0) {
            $('#kismet_rule_ctrl .new').click();
        }
        if (selected.attr('name') == $(this).attr('name')) {
            return;
        }
        ui.KismetDlg.update_rule(selected.attr('name'));
        selected.removeClass('selected');
        $(this).addClass('selected');
        var name = $(this).text();
        var rule_id = $(this).attr('rule_id');
        var type = $(this).attr('type');
        var field = $(this).attr('field');
        var method = $(this).attr('method');
        var pattern = $(this).attr('pattern');
        var acts = $(this).attr('actions').split(':');

        $('#kismet_rule_name').val(name);
        $('#kismet_type').val(type); 
        if (type == '0') {
            $('#kismet_method').val(method).removeAttr('disabled');
        } else {
            $('#kismet_method').attr('disabled','true'); 
        }
        $('#kismet_field').val(field); 
        $('#kismet_pattern').val(pattern); 

        $('#kismet_rule_action input[type=checkbox]')
            .attr('checked', false);
        $('#kismet_action_archive_name').val(archive_name)
            .removeAttr('disabled');
        for (var i = 0; i < acts.length; i += 1) {
            var act = acts[i];
            if (act == '0') {
                $('#kismet_action_drop').attr('checked', true); 
            } else if (act == '1') {
                $('#kismet_action_notify').attr('checked',true); 
            } else if (act == '2') {
                $('#kismet_action_mask').attr('checked',true); 
            } else if (act == '3') {
                $('#kismet_action_archive').attr('checked',true); 
                var archive_name = $(this).attr('archive_name')
                $('#kismet_action_archive_name').val(archive_name)
                    .removeAttr('disabled');
            }
        }
    });

    $('#kismet_rule_ctrl .new').click(function () {
        var name = $.trim($('#kismet_rule_name').val());  
        var exists = $('#kismet_rule_list .kismet_rule[name="'+name+'"]');
        if (name.length == 0) return;
        if (exists.length == 0) {
            ui.KismetDlg.add_rule(name);
        } else {
            ui.KismetDlg.update_rule(name);
            $('#kismet_rule_list .selected').removeClass('selected');
            ui.KismetDlg.clear_info();
        }
    });

    $('#kismet_rule_ctrl .remove').click(function () {
        var li = $('#kismet_rule_list .kismet_rule.selected').parent();
        li.remove();
    });

    $('#kismet_rule_ctrl .enable').click(function () {
        var current = $('#kismet_rule_list .kismet_rule.selected');
        current.removeAttr('disabled');
    });

    $('#kismet_rule_ctrl .disable').click(function () {
        var current = $('#kismet_rule_list .kismet_rule.selected');
        current.attr('disabled', '1');
    });
    
    $('#kismet_rule_ctrl .up').click(function () {
        var current = $($('#kismet_rule_list .kismet_rule.selected').parent().get(0));
        var prev = current.prev('li');
        if (prev.length != 0) {
            prev.before('<li>'+current.html()+'</li>');
            current.remove();
        }
    });

    $('#kismet_rule_ctrl .down').click(function () {
        var current = $($('#kismet_rule_list .kismet_rule.selected').parent().get(0));
        var next = current.next('li');
        if (next.length != 0) {
            next.after('<li>'+current.html()+'</li>');
            current.remove();
        }
    });

    $('#kismet_type').change(function () {
        if ($(this).val() == 0) {
            $('#kismet_method').removeAttr('disabled');
        } else {
            $('#kismet_method').attr('disabled', 'true');
        }
    });

    $('#kismet_action_archive').click(function () {
        if ($(this).attr('checked') == true) {
            $('#kismet_method').removeAttr('disabled');
        } else {
            $('#kismet_method').attr('disabled', 'true');
        }
    });

    $('#kismet_save_btn').click(function () {
        ui.KismetDlg.save();
        globals.kismet_dialog.close();
    });
    
    $('#kismet_cancel_btn').click(function () {
        globals.kismet_dialog.close();
    });
},

load:
function load() {
    $('#kismet_rule_list').empty();
    for (var i = 0; i < kismet.rules.length; i += 1) {
        $('#kismet_rule_list').append(
            ui.Template.form_kismet_rule(kismet.rules[i]));
    }
},

save:
function save() {
    var rules = [];
    $('#kismet_rule_list .kismet_rule').each(function (i, n) {
        var obj = $(n);
        var rule = {name: obj.attr('name')
            , type: parseInt(obj.attr('type'))
            , method: parseInt(obj.attr('method'))
            , pattern: obj.attr('pattern')
            , field: parseInt(obj.attr('field'))
            , disabled: parseInt(obj.attr('disabled'))
            , actions: obj.attr('actions').split(':')
            , archive_name: obj.attr('archive_name')};
        rules.push(rule);
    });
    kismet.rules = rules;
    kismet.save();
},

add_rule:
function add_rule(name) {
    var rule = {};
    rule.name = name;
    rule.type = parseInt($('#kismet_type').val());
    rule.method = parseInt($('#kismet_method').val());
    rule.field = parseInt($('#kismet_field').val());
    rule.pattern = $('#kismet_pattern').val();
    rule.disabled = '0';
    rule.archive_name = '';
    var acts = [];
    $('#kismet_rule_action input[type=checkbox]').each(function (i, n) {
        if ($(n).attr('checked') == true) {
            acts.push($(n).val())
        }
    });
    rule.actions = acts;
    $('#kismet_rule_list').append(
        ui.Template.form_kismet_rule(rule));
},

update_rule:
function update_rule(name) {
    var rule = {};
    rule.name = name;
    rule.type = parseInt($('#kismet_type').val());
    rule.method = parseInt($('#kismet_method').val());
    rule.field = parseInt($('#kismet_field').val());
    rule.pattern = $('#kismet_pattern').val();
    var acts = [];
    $('#kismet_rule_action input[type=checkbox]').each(function (i, n) {
        if ($(n).attr('checked') == true) {
            acts.push($(n).val())
        }
    });
    rule.actions = acts.join(':');
    $('#kismet_rule_list .kismet_rule[name="'+name+'"]').attr(rule);
},

clear_info:
function clear_info() {
    $('#kismet_rule_info input[type=text]').val('');
    $('#kismet_rule_info select').val(0);
    $('#kismet_rule_action input[type=checkbox]').attr('checked', false);
    $('#kismet_action_archive_name').attr('disabled', true);
},

}
