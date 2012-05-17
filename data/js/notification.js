var notification = {

_queue: [],

_delay: 3000,

_k_limit: 3,

init:
function init() {
    notification.check_proc();
},

check_proc:
function check_proc() {
    if (notification._queue.length) {
        var tuple = notification._queue.shift();
        notification.notify(tuple[0], tuple[1], tuple[2], tuple[3]);
    }
    setTimeout(notification.check_proc, 1000);
},

notify:
function notify(title, summary, image, type) {
    title = title.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    summary = summary.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    if (util.is_native_platform()) {
        hotot_action('system/notify/'
            + type
            + '/' + encodeURIComponent(title)
            + '/' + encodeURIComponent(summary)
            + '/' + encodeURIComponent(image));
    } else if (conf.vars.platform == 'Chrome') {
        var img_url = image? image: './image/ic64_hotot.png';
        var linux_native_notification_id = 'dbmjjjonelodfeckmpfglmffhngdplal';

        chrome.management.get(linux_native_notification_id, function(result) {
            if (result != undefined && result.enabled) {
                console.log(result);

                chrome.extension.sendRequest(linux_native_notification_id,
                {
                    title: title, body: summary, iconUrl: img_url, notificationType: type
                },
                function(response)
                {
                    console.log(response);
                });
            } else {
                var notification = webkitNotifications.createNotification(img_url, title, summary);
                notification.show();
                setTimeout(function() {notification.cancel()}, 5000);
            }
        });
    }
},

push:
function push(title, summary, image, type) {
    notification._queue.push([title, summary, image, type]);
}

};
