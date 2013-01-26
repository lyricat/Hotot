if (typeof ext == 'undefined') var ext = {};
ext.HototGMap = {

id: 'org.hotot.gmap',

name: 'Hotot GMap',

description: 'View geolocation information of tweets.',

version: '1.0',

author: 'Shellex Wai',

url: 'http://hotot.org',

icon: 'icon.png',

map_doc: null,

map_dialog: null,

on_form_indicator:
function on_form_indicator(tweet, html) {
    if (tweet.geo && tweet.geo.type == 'Point') {
        var x = tweet.geo.coordinates[0];
        var y = tweet.geo.coordinates[1];
        var tag = "geo1_" + tweet.id + Date.now();
        
        setTimeout(function() {
            $('#' + tag).click(function(e) {
                e.preventDefault();
                return ext.HototGMap.on_map_indicator_clicked(x, y);
            })
        }, 500);
        var indicator = '<a class="geo_indicator" href="#" x="'+x+'" y="'+y+'" id="' + tag + '" style="background: transparent url(ext/'+ext.HototGMap.id+'/ic16_marker.png) no-repeat; width: 16px; height: 16px; display:inline-block;"></a>';
        html += indicator;
    }
    return html;
},

on_map_indicator_clicked:
function on_map_indicator_clicked(x, y) {
    ext.HototGMap.map_dialog.open(); 
    $('#hotot_gmap_frame').get(0).contentWindow.document.getElementById('map').innerHTML = '<img src="http://maps.googleapis.com/maps/api/staticmap?center=' + x + ',' + y + '&zoom=11&size=' + ($('#ext_hotot_gmap_map_dialog').width() - 2) + 'x' + ($('#ext_hotot_gmap_map_dialog').height() - 40) + '&sensor=false">';

    $('#hotot_gmap_frame').css({
          'height': ($('#ext_hotot_gmap_map_dialog').height() - 30) + 'px'
        , 'width': ($('#ext_hotot_gmap_map_dialog').width() - 2)+'px'
        , 'padding': '0'});
},


create_map_dialog:
function create_map_dialog() {
    var body ='<iframe id="hotot_gmap_frame" class="dialog_body"></iframe>';
    ext.HototGMap.map_dialog 
        = widget.DialogManager.build_dialog('#ext_hotot_gmap_map_dialog'
            , 'Google Map', '', body
            , []);
    ext.HototGMap.map_dialog.set_styles('header', {'padding': '0', 'height': '0', 'display': 'none'});
    ext.HototGMap.map_dialog.set_styles('footer', {'padding': '0', 'height': '0', 'display': 'none'});
    ext.HototGMap.map_dialog.set_styles('body', {'padding': '0'});
    ext.HototGMap.map_dialog.resize(500, 500);
    ext.HototGMap.map_doc = $('#hotot_gmap_frame').get(0).contentWindow.document;
    ext.HototGMap.map_doc.open();
    ext.HototGMap.map_doc.write("<html><head><style>*{margin: 0 0 0 0;padding:0 0 0 0;overflow:hidden;}</style></head><body><div id=\"map\" style=\"width:100%;height:100%;\"></div></body></html>");
    ext.HototGMap.map_doc.close();
},

enable:
function enable() {
    ext.register_listener(ext.FORM_TWEET_STATUS_INDICATOR_LISTENER
        , ext.HototGMap.on_form_indicator);
    ext.HototGMap.create_map_dialog();
},

disable:
function disable() {
    ext.unregister_listener(ext.FORM_TWEET_STATUS_INDICATOR_LISTENER
        , ext.HototGMap.on_form_indicator);
}
}

