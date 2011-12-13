if (typeof (lib) == 'undefined') var lib = {};

lib.network = {

py_request: false,

success_task_table: {},

error_task_table: {},

last_req_url: '',

generate_uuid:
function generate_uuid() {
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
},

normalize_result:
function normalize_result(result) {
    if (result.constructor == String) {
        try {
            return JSON.parse(result);
        } catch (e) {
            return result;
        }
    }
    return result;
},

encode_multipart_formdata:
function encode_multipart_formdata(fields, file, name, data) {
    if (!window.BlobBuilder) {
        window.BlobBuilder = window.WebKitBlobBuilder;
    }
    var bb = new BlobBuilder();
    var BOUNDARY = 'HototFormBoundary31415926535897932384626'
    var CRLF = '\r\n'
    var L = [];
    var bytes = [];
    for (var key in fields) {
        value = fields[key];
        L.push('--' + BOUNDARY);
        L.push('Content-Disposition: form-data; name="'+key+'"');
        L.push('');
        L.push(value);
    }
    L.push('--' + BOUNDARY);
    L.push('Content-Disposition: form-data; name="'+name+'"; filename="'+file.name+'"');
    L.push('Content-Type: ' + file.type);
    L.push('');
    var str = L.join(CRLF) + CRLF;
    for (var i = 0; i < str.length; i+= 1) {
        bb.append(str.substring(i, i+1));
    }
    bb.append(data);
    bb.append(CRLF);
    L = [];
    L.push('--' + BOUNDARY + '--');
    L.push('');
    bb.append(L.join(CRLF)); 
    var body = bb.getBlob();
    var headers = {'content-type':'multipart/form-data; boundary=' + BOUNDARY
        , 'content-length': body.size};
    return [headers, body]
},

do_request:
function do_request(req_method, req_url, req_params, req_headers, req_files,on_success, on_error) {

    if (!req_headers) req_headers = {};
    if (lib.network.py_request 
        || (req_files && req_files.constructor == Array && req_files.length != 0)) {
        var task_uuid = lib.network.generate_uuid();
        lib.network.success_task_table[task_uuid] = on_success;
        lib.network.error_task_table[task_uuid] = on_error;
        hotot_action('request/' +
            encodeURIComponent(JSON.stringify(
                { uuid: task_uuid
                , method: req_method
                , url: req_url
                , params: req_params
                , files: req_files
                , headers: req_headers })));
    } else {
        var task_uuid = lib.network.generate_uuid();
        lib.network.success_task_table[task_uuid] = on_success;
        lib.network.error_task_table[task_uuid] = on_error;
        
        hotot_log('Req', JSON.stringify({'type':req_method, 'url': req_url, 'data':req_params}));

        jQuery.ajax({    
            type: req_method,
            url: req_url,
            processData: (req_files == null),
            data: (req_files == null? req_params:req_files),
            beforeSend: 
            function(xhr) {
                for (var k in req_headers) {
                    xhr.setRequestHeader(k, req_headers[k]);
                }
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
            },
            success: 
            function(result, textStatus, xhr) {
                if ( on_success != null) {
                    result = lib.network.normalize_result(result);
                    lib.network.success_task_table[task_uuid](result, textStatus, xhr);
                    delete lib.network.success_task_table[task_uuid];
                    delete lib.network.error_task_table[task_uuid];
                }
            },
            error: 
            function (result, textStatus, xhr) {
                if ( on_error != null) {
                    result = lib.network.normalize_result(result);
                    lib.network.error_task_table[task_uuid](result, textStatus, xhr);
                    delete lib.network.success_task_table[task_uuid];
                    delete lib.network.error_task_table[task_uuid];
                }
            }
        }); 
    }
},    
}

