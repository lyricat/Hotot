if (typeof util == 'undefined') var util = {};
util.console = {

cmd_count: 0,
ps_in:  'In {%COUNT%}: ',
ps_out: 'Out{%COUNT%}: ',
ps_err: 'Err{%COUNT%}: ',
is_show: false,

init:
function init () {
    var _this = this;
    $(document).keyup(
    function (event) {
        if (event.ctrlKey && event.keyCode == 192) { //Ctrl+`
            if (_this.is_show) 
                $('#console').hide();
            else 
                $('#console').show();
            _this.is_show = !_this.is_show;
            $('#console_in').focus();
        }
    });
    
    $('#console_in').keyup(
    function(event) {
        if (event.keyCode == 13) {
            var cmd = $(this).attr('value');
            if (cmd == '') 
                return;
            $(this).attr('value', '');

            _this.cmd_count += 1;
            cmd_in = _this.form_result('in', cmd)
            _this.raw_out(cmd_in);
            _this.raw_out(_this.interpret(cmd));
        }
    });
},

interpret:
function interpret (cmd) {
    var result = this.interpret_predefined(cmd);
    if (result == -1) {
        try {
            result = eval(cmd);
            result = util.console.form_result('out', result);
        } catch (e) {
            result = util.console.form_result('err', e.toString());
        }
    } else {
        result = util.console.form_result('out', result);
    }
    return result;
},

interpret_predefined:
function interpret_predefined(cmd) {
    var result = -1;
    var ins = '', args = '',
    cmd_arr = cmd.split(' ');
    if (1 < cmd_arr.length) 
        args = cmd.substring(cmd_arr[0].length);
    ins = cmd_arr[0];
    switch (ins) {
    case 'clear':
        result = this.clear();
    break;
    case 'now':
        result = Date.now()
    break;
    case 'time':
        result = new Date().toString();
    break;
    case 'post':
        if (args != '')
            result = ui.StatusBox.update_status(args)
        else 
            result = '';
    break;
    default:
        result = -1;
    break;
    }
    return result;
},

form_result:
function form_result (type, raw_result) {
    var ps = type == 'in'? util.console.ps_in:
        (type == 'out'? util.console.ps_out: util.console.ps_err);
    var result = '<span class="console_ps_' + type + '">'
        + ps
        + '</span>'
        + raw_result + '<br/>';
    result = result.replace(/{%COUNT%}/g, 
        '[<strong>' + util.console.cmd_count + '</strong>]');
    return result;
},

out:
function out (text) {
    $('#console_out').append($('<p/>').text(text));
},

raw_out:
function raw_out (html) {
    $('#console_out').append(html);
},

href_out:
function href_out(link) {
    var p = $('<p/>');
    $('<a/>').appendTo(p).attr('href', link).text(link);
    $('#console_out').append(p);
},

clear:
function console_clear() {
    $('#console_out').empty();
    return '';
},

};



