if (typeof ui == 'undefined') var ui = {};
ui.ErrorDlg = {

init:
function init() {
    ui.ErrorDlg.container = $('#error_container')
    
    var btn_close = new widget.Button('#btn_error_close');
    btn_close.on_clicked = function (event) {
        ui.ErrorDlg.clear_errors();
        globals.error_dialog.close();
    };
    btn_close.create();

},

add_error:
function add_error(title, summary, techinfo) {
    var n = new Date();
    var time = n.getFullYear() +'-'+ n.getMonth() +'-'+ n.getUTCDate() + ' ' + n.getHours() +':'+ n.getMinutes() +':'+ n.getSeconds()
    ui.ErrorDlg.container.prepend('<li class="error_item"><div class="error_item_header"><span class="error_item_time">'
        + time + '</span><span class="error_item_title">'
        + title + '</span></div><div class="error_item_body"><div class="error_item_summary">'+summary+'</div><pre class="error_item_techinfo">'+techinfo+'</pre></div></li>');
},

alert:
function alert(title, summary, techinfo) {
    ui.ErrorDlg.add_error(title, summary, techinfo);
    globals.error_dialog.open();
},

clear_errors:
function clear_errors() {
    ui.ErrorDlg.container.empty();
}

};
