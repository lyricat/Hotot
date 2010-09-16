if (typeof ext == 'undefined') var ext = {};
ext.HototGMap = {

id: 'org.hotot.gmap',

name: 'Hotot GMap',

description: 'View geolocation information of tweets.',

version: '1.0',

author: 'Shellex Wai',

url: 'http://hotot.org',

icon: 'icon.png',

map_frame: null,

map_doc: null,

on_form_indicator:
function on_form_indicator(tweet, html) {
    if (tweet.geo && tweet.geo.type == 'Point') {
        var x = tweet.geo.coordinates[0];
        var y = tweet.geo.coordinates[1];
        var indicator = '<a class="geo_indicator" href="javascript:void(0);" x="'+x+'" y="'+y+'" onclick="ext.HototGMap.on_map_indicator_clicked('+ x + ',' + y + ')" style="background: transparent url(../ext/'+ext.HototGMap.id+'/ic16_marker.png) no-repeat; width: 16px; height: 16px; display:inline-block;"></a>';
        html += indicator;
    }
    return html;
},

on_map_indicator_clicked:
function on_map_indicator_clicked(x, y) {
    $('#hotot_gmap_frame').get(0).contentWindow.load_map(x, y);
    $('#hotot_gmap_canvas').show();
},

create:
function create() {
    $('body').append('<div id="hotot_gmap_canvas"></div>');
    $('#hotot_gmap_canvas').append('<a class="dialog_close_btn ic_close" href="javascript:void(0);" onclick="$(\'#hotot_gmap_canvas\').hide();"></a>\
    <iframe id="hotot_gmap_frame" class="dialog dialog_body">\
    </iframe>');
    
    $('#hotot_gmap_canvas').css({'position':'absolute', 'z-index':'111111', 'left':'20%', 'top':'20%', 'height': '60%', 'width': '60%', 'display':'none'});
    $('#hotot_gmap_canvas').addClass('dialog_border')
    $('#hotot_gmap_frame').css({'height': '100%', 'width': '100%'});

    ext.HototGMap.map_doc = $('#hotot_gmap_frame').get(0).contentWindow.document;
    ext.HototGMap.map_doc.open();
    ext.HototGMap.map_doc.write("<html><head><script src=\"http://maps.google.com/maps/api/js?sensor=false\"></script><script>\
function load_map(x, y) {\
    var myLatlng = new google.maps.LatLng(x, y);\
    var myOptions = {\
      zoom: 13,\
      center: myLatlng,\
      mapTypeId: google.maps.MapTypeId.ROADMAP\
    };\
    var map = new google.maps.Map(document.getElementById('map'),\ myOptions);\
    var marker = new google.maps.Marker({position: myLatlng, title:'Here!'});\
    marker.setMap(map);\
}\
    </script></head><body><div id=\"map\" style=\"width:100%;height:100%;\"></div></body></html>");
    ext.HototGMap.map_doc.close();
},

load:
function load () {
    ext.register_listener(ext.FORM_TWEET_STATUS_INDICATOR_LISTENER
        , ext.HototGMap.on_form_indicator);
    ext.HototGMap.create();
},

unload:
function unload() {
    ext.unregister_listener(ext.FORM_TWEET_STATUS_INDICATOR_LISTENER
        , ext.HototGMap.on_form_indicator);
},
}

