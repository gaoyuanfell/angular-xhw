/**
 * Created by Yunior on 2015/12/31.
 */
app.factory("IndexFactory", ["$http", function ($http) {
    return {
        adDataOverviewBar: function (query, callback) {
            var api = "/index/AdDataOverview.htm";
            var AdDataOverview = $http.get(baseUrl + api, { params: query });
            AdDataOverview.success(function (data) {
                if (data && data.code === 200 && data.items.length > 0) {
                    var ob = data.items[0];
                    var stack = undefined;
                    var barWidth = Math.floor(90 / ob.dateList.length);
                    barWidth < 3 ? barWidth = 3 : barWidth;
                    var series = [
                        {
                            name: "客户量",
                            type: 'line',
                            stack: stack || "customerCount",
                            barWidth: barWidth,
                            data: ob.customerList
                        },
                        {
                            name: "订单量",
                            type: 'line',
                            stack: stack || "orderCount",
                            barWidth: barWidth,
                            data: ob.orderList
                        },
                        {
                            name: "创意量",
                            type: 'line',
                            stack: stack || "adCreativeCount",
                            barWidth: barWidth,
                            data: ob.adCreativeList
                        },
                        {
                            name: "曝光量",
                            type: 'line',
                            stack: stack || "pvCount",
                            barWidth: barWidth,
                            data: ob.pvList
                        },
                        {
                            name: "点击量",
                            type: 'line',
                            stack: stack || "clickCount",
                            barWidth: barWidth,
                            data: ob.clickList
                        },
                        {
                            name: "点击率",
                            type: 'line',
                            stack: stack || "ctrCount",
                            barWidth: barWidth,
                            data: ob.ctrList
                        },
                        {
                            name: "广告位使用率",
                            type: 'line',
                            stack: stack || "adSpaceUseRate",
                            barWidth: barWidth,
                            data: ob.adSpaceUseRateList
                        }
                    ];
                    callback(ob, series);
                }
            });
        }
    }
}]);

app.controller("dataSummaryCtrl",
    ["$scope", "$http", "IndexFactory",
        function ($scope, $http, IndexFactory) {

            /******* echarts  start *****/
            var $main = document.getElementById("main");
            var mainChart = echarts.init($main);
            var getOption = function (data, series) {
                return {
                    color: ["#e46464", "#fdc161", "#f9de72", "#6dd889", "#51dcd7", "#48ceef", "#69bbf4"],
                    legend: {
                        data:[
                                {name:'客户量',icon: 'rect'},
                                {name:'订单量',icon: 'rect'},
                                {name:'创意量',icon: 'rect'},
                                {name:'曝光量',icon: 'rect'},
                                {name:'点击量',icon: 'rect'},
                                {name:'点击率',icon: 'rect'},
                                {name:'广告位使用率',icon: 'rect'}
                            ],
                        right:0,
                        itemWidth:30,
                        itemHeight:8,
                        inactiveColor:'#ccc'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'

                        },
                        formatter: function (data) {
                            var s = data[0].name + "<br/>";
                            if (data instanceof Array) {
                                data.forEach(function (bo) {
                                    if (bo.seriesIndex == 6 || bo.seriesIndex == 5) {
                                        s += bo.seriesName + " : " + (bo.value == 0 ? '0.00' : bo.value.toFixed(2)) + "%" + "<br/>";
                                    } else {
                                        s += bo.seriesName + " : " + bo.value + "<br/>";
                                    }
                                })
                            }
                            return s;
                        }
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            magicType: { show: true, type: ["line", "bar"], default: "line" },
                            restore: { show: true, title: "刷新" },
                            saveAsImage: { show: true }
                        },
                        left:250
                    },
                    xAxis: [
                        {
                            type: 'category',
                            splitLine: { show: false },
                            data: data
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    grid: {
                        left: '1%',
                        right: '1%',
                        bottom: '3%',
                        containLabel: true
                    },
                    series: series
                }
            };
            /*查询条件*/
            // var lastDay = new Date();
            // lastDay.calendar(1, -30);
            $scope.startTime = getDateFormat() + " 00:00:00";
            $scope.endTime = getDateFormat() + " 23:59:59";

            var init = function () {
                mainChart.showLoading();
                IndexFactory.adDataOverviewBar({
                    startTime: $scope.startTime,
                    endTime: $scope.endTime
                }, function (data, series) {
                    mainChart.hideLoading();
                    $scope.adDataOverview = data;
                    var option = getOption(data.dateList, series);
                    mainChart.setOption(option);
                    var onresize = window.onresize = mainChart.resize;
                    $main.parentNode.style.height = (document.body.clientHeight - 210) + 'px';//动态高度
                    onresize();
                    window.onresize = function () {
                        $main.parentNode.style.height = (document.body.clientHeight - 210) + 'px';//动态高度
                        onresize()
                    }
                })
            };
            init();

            //日历查询
            var dateRange = new pickerDateRange('indexPicker', {
                defaultText: ' / ',
                isSingleDay: false,
                stopToday: false,
                calendars: 2,
                startDate: getDateFormat(),
                endDate: getDateFormat(),
                inputTrigger: 'dateRange',
                success: function (obj) {
                    $scope.startTime = obj.startDate + " 00:00:00";
                    $scope.endTime = obj.endDate + " 23:59:59";
                    init();
                }
            });
        }]);