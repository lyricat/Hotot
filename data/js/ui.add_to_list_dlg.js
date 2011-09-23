if (typeof ui == 'undefined') var ui = {};
ui.AddToListDlg = {

id: '',

init:
function init () {
    ui.ListAttrDlg.id = '#add_to_list_dlg';

    var btn_add_to_list_update =new widget.Button('#btn_add_to_list_update');
    btn_add_to_list_update.on_clicked = function (event) {
        globals.add_to_list_dialog.close();
    };
    btn_add_to_list_update.create();

},

update:
function update() {
},

load:
function load() {
    var container = $('#add_to_list_list').empty();
    lib.twitterapi.get_user_lists(globals.myself.screen_name, -1
    , function (json) {
        for (var i = 0; i < json.lists.length; i += 1) {
            var li = $('<li/>');
            $('<input type="checkbox" class="checkbox"/>').attr('value', json.lists[i].slug).appendTo(li);
            $('<label class="label"/>').text(json.lists[i].name).appendTo(li);
            container.append(li)
        }
    });
},

request:
function request() {

},

}
    
