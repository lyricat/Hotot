var user = {
    update_tweet:
    function update_tweet(data) {
        var d = [];
        for (var i = 0; i < data.length; i += 1) {
            d.push({label: data[i][0]+':'+data[i][1], data: data[i][1]});
        }
        $.plot($('#tweet_chart'), d, 
            {
            series: {
                pie: {show: true, label:{show:true 
                    , formatter: function(label, series){
                        return '<span style="font-size:12px;text-align:center;">'+Math.round(series.percent)+'%</span>';
                    }}}
            }
        });
    },
    update_stat:
    function update_stat(data) {
        var hour_d=[], day_d=[];
        for (var i = 0; i < data.hour_stat.length; i += 1) {
            hour_d.push([i+0.5, data.hour_stat[i]]);
        }
        for (var i = 0; i < data.day_stat.length; i += 1) {
            day_d.push([i+0.2, data.day_stat[i]]);
        }
        $.plot($('#hour_stat_chart'), [
            {label:'TPH',data:hour_d,color:'#48BB32'}
        ], {
            series: { lines: {show: true}, points: {show: true}},
            xaxis: {ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12
                    ,13,14,15,16,17,18,19,20,21,22,23]},
            grid: {backgroundColor: {colors: ['#fff','#f2f2f2']}}
        });
        $.plot($('#day_stat_chart'), [
            {label:'TPD',data:day_d,color:'#E0B73C'}
        ], {
            series: { lines: {show: true}, points: {show:true}},
            xaxis: {ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12
                    ,13,14,15,16,17,18,19,20,21,22,23
                    ,24,25,26,27,28,29,30,31]},
            grid: {backgroundColor: {colors: ['#fff','#f2f2f2']}}
        });
    },
    update_top_talkers:
    function update_top_talkers(talkers) {
        var data = [0];
        var ticks = [0];
        for (var i = 0; i < talkers.length; i += 1) {
            data.push([i+0.5, talkers[i][1]]);
            ticks.push([i+0.5, talkers[i][0]]);
        }
        $.plot($('#top10_talkers_stat_chart'), [
            { data:data, color:'#48BB32'}
        ], {
            series: {bars: {show:true, barWidth:0.6}},
            xaxis: {ticks: ticks},
            grid: {backgroundColor: {colors: ['#fff','#f2f2f2']}}
        })
    },
    update_top_rt_users:
    function update_top_rt_users(talkers) {
        var data = [0];
        var ticks = [0];
        for (var i = 0; i < talkers.length; i += 1) {
            data.push([i+0.5, talkers[i][1]]);
            ticks.push([i+0.5, talkers[i][0]]);
        }
        $.plot($('#top10_rt_user_stat_chart'), [
            { data:data, color:'orange'}
        ], {
            series: {bars: {show:true, barWidth:0.6}},
            xaxis: {ticks: ticks},
            grid: {backgroundColor: {colors: ['#fff','#f2f2f2']}}
        })
    },
    update_top_clients:
    function update_top_clients(clients) {
        var d = [];
        for (var i = 0; i < clients.length; i += 1) {
            d.push({label:clients[i][0]+':'+clients[i][1],data:clients[i][1]});
        }
        $.plot($('#top10_clients_stat_chart'), d, 
            {
            series: {
                pie: {show: true, label:{show:true 
                    , formatter: function(label, series){
                        return '<span style="font-size:12px;text-align:center;">'+Math.round(series.percent)+'%</span>';
                    }}}
                },
            legend: { noColumns: 2 }
        });
    },
    update_follower_trend:
    function update_follower_trend(follower_stream) {
        var data = [0];
        for (var i = 0; i < follower_stream.length; i += 1) {
            data.push([i, follower_stream[i]]);
        }
        $.plot($('#follower_trend_stat_chart'), [
            { data:data, color:'red'}
        ], {
            series: {lines: {show:true}},
            grid: {backgroundColor: {colors: ['#fff','#f2f2f2']}}
        })
    }
};

var home = {
    update_top_speakers:
    function update_top_speakers(user) {
        var data = [0];
        var ticks = [0];
        for (var i = 0; i < user.length; i += 1) {
            data.push([i+0.5, user[i][1]]);
            ticks.push([i+0.5, user[i][0]]);
        }
        $.plot($('#top10_speakers_home_stat_chart'), [
            { data:data, color:'#48BB32'}
        ], {
            series: {bars: {show:true, barWidth:0.6}},
            xaxis: {ticks: ticks},
            grid: {backgroundColor: {colors: ['#fff','#f2f2f2']}}
        })
    },
};

    function start() {
        $('#user_stat_charts').hide();
        $('#home_stat_charts').hide();
        $('#progress_bar_mask').show();
    }
    function done(arg) {
        $('#'+arg+'_stat_charts').show();
        $('#progress_bar_mask').hide();
    }
    function progress_set_label(value) {
        //$('#stat_charts').show();
        $('#progress_bar_mask .label').text(value);
    }

    $(document).ready(function () {
        
    });

