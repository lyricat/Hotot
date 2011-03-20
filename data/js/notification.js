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
    if (conf.get_current_profile().preferences.use_native_notify) {
        if (util.is_native_platform()) {
            hotot_action('system/notify/'
                + type
                + '/' + encodeURIComponent(title)
                + '/' + encodeURIComponent(summary)
                + '/' + encodeURIComponent(image));
        } else if (conf.vars.platform == 'Chrome') {
            var img_url = image? image: './image/ic64_hotot.png';
            var notification = webkitNotifications.createNotification(
              img_url, title, summary);
            notification.show();
            setTimeout(function() {notification.cancel()}, 5000);
        }
    } else {
        // @TODO other notify way
    }
},

push:
function push(title, summary, image, type) {
    notification._queue.push([title, summary, image, type]);
},

};
