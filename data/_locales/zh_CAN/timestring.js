// moment.js language configuration
// language : cantonese chinese (zh-CAN)
// author : Preston: https://github.com/pentie
(function () {
    var lang = {
            months : "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
            monthsShort : "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
            weekdays : "禮拜日_禮拜一_禮拜二_禮拜三_禮拜四_禮拜五_禮拜六".split("_"),
            weekdaysShort : "週日_週一_週二_週三_週四_週五_週六".split("_"),
            weekdaysMin : "日_一_二_三_四_五_六".split("_"),
            longDateFormat : {
                LT : "Ah點mm",
                L : "YYYY年MMMD日",
                LL : "YYYY年MMMD日",
                LLL : "YYYY年MMMD日LT",
                LLLL : "YYYY年MMMD日ddddLT"
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 3) {
                    return "半夜";
                } else if (hour < 6) {
                    return "清晨";
                } else if (hour < 9) {
                    return "朝早";
                } else if (hour < 11 && minute < 30) {
                    return "上晝";
                } else if (hour < 13) {
                    return "中午";
                } else if (hour < 17) {
                    return "晏晝";
                } else if (hour < 19) {
                    return "挨晚";
                } else {
                    return "晚黑";
                }
            },
            calendar : {
                sameDay : '[今日]LT',
                nextDay : '[聽日]LT',
                nextWeek : '[下]ddddLT',
                lastDay : '[尋日]LT',
                lastWeek : '[上]ddddLT',
                sameElse : 'L'
            },
            relativeTime : {
                future : "%s內",
                past : "%s之前",
                s : "幾秒",
                m : "一分鐘",
                mm : "%d分鐘",
                h : "一個鐘",
                hh : "%d個鐘,
                d : "一日",
                dd : "%d日",
                M : "一個月",
                MM : "%d個月",
                y : "一年",
                yy : "%d年"
            },
            ordinal : function (number) {
                return '';
            }
        };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = lang;
    }
    // Browser
    if (typeof window !== 'undefined' && this.moment && this.moment.lang) {
        this.moment.lang('zh-CAN', lang);
    }
}());
