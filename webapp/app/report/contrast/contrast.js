/**
 * Created by moka on 16-6-21.
 */
app.factory("ContrastFactory", ["$http",
    function ($http) {
        var api = "/CompareReport/reportCompare.htm";
        var apiOrder = "/orderAdCreative/orderNamesForAdd.htm";//投放订单
        var apiDefaultOrder = "/defaultOrders/orderNames.htm";//默认订单
        var apiMedia = "/media/list.htm";
        var apiChannel = "/channel/list.htm";
        var apiADSpaceType = "/ADSpaceType/list.htm";
        var apiADSpace = "/ADSpace/pageList.htm";
        var apiAllCustomer = "/customer/getAllCustomer.htm";
        return {
            getReportCompare: function (query, callback) {
                $http({
                    headers: {
                        "Content-Type": undefined,
                        "Content-Length": query.length
                    },
                    method: "post",
                    url: baseUrl + api,
                    params: query,
                    data: query
                }).then(function (data) {
                    if (data && data.code === 200 && data.items.length > 0) {
                        var ob = data.items[0];
                        var firstTime = query.timeType == 0 ? query.firstTime.split("-")[0] + "年" : query.timeType == 1 ? query.firstTime.split("-")[0] + "-" + query.firstTime.split("-")[1] + "月" : query.firstTime + "日";
                        var secondTime = query.timeType == 0 ? query.secondTime.split("-")[0] + "年" : query.timeType == 1 ? query.secondTime.split("-")[0] + "-" + query.secondTime.split("-")[1] + "月" : query.secondTime + "日";

                        var seriesPv = function (index) {
                            return [
                                {
                                    name: (firstTime || "") + " 曝光量",
                                    type: 'line',
                                    stack: "pv1",
                                    barWidth: 13,
                                    yAxisIndex: index,
                                    data: ob.pv1
                                }, {
                                    name: (secondTime || "") + " 曝光量",
                                    type: 'line',
                                    stack: "pv2",
                                    barWidth: 13,
                                    yAxisIndex: index,
                                    data: ob.pv2
                                }
                            ]
                        }
                        var seriesCl = function (index) {
                            return seriesCl = [
                                {
                                    name: (firstTime || "") + " 点击量",
                                    type: 'line',
                                    stack: "click1",
                                    barWidth: 13,
                                    yAxisIndex: index,
                                    data: ob.click1
                                }, {
                                    name: (secondTime || "") + " 点击量",
                                    type: 'line',
                                    stack: "click2",
                                    barWidth: 13,
                                    yAxisIndex: index,
                                    data: ob.click2
                                }
                            ]
                        }

                        callback(ob.timeList, seriesPv, seriesCl);
                    }
                })
            },
            getOrderName: function (query) {
                return $http({
                    method: "POST",
                    headers: {
                        "Content-Type": undefined
                    },
                    url: baseUrl + apiOrder,
                    params: query || {},
                    data: query || {}
                })
            },
            getDefaultOrderName: function (query) {
                return $http({
                    method: "POST",
                    headers: {
                        "Content-Type": undefined
                    },
                    url: baseUrl + apiDefaultOrder,
                    params: query || {},
                    data: query || {}
                })
            },
            getMediaList: function (query) {
                return $http({
                    method: "POST",
                    headers: {
                        "Content-Type": undefined
                    },
                    url: baseUrl + apiMedia,
                    params: query || {},
                    data: query || {}
                })
            },
            getChannelList: function (query) {
                return $http({
                    method: "POST",
                    headers: {
                        "Content-Type": undefined
                    },
                    url: baseUrl + apiChannel,
                    params: query || {},
                    data: query || {}
                })
            },
            getADSpaceType: function (query) {
                return $http({
                    method: "POST",
                    headers: {
                        "Content-Type": undefined
                    },
                    url: baseUrl + apiADSpaceType,
                    params: query || {},
                    data: query || {}
                })
            },
            getADSpace: function (query) {
                return $http({
                    method: "POST",
                    headers: {
                        "Content-Type": undefined
                    },
                    url: baseUrl + apiADSpace,
                    params: query || {},
                    data: query || {}
                })
            },
            getAllCustomer: function (query) {
                return $http({
                    method: "POST",
                    headers: {
                        "Content-Type": undefined
                    },
                    url: baseUrl + apiAllCustomer,
                    params: query || {},
                    data: query || {}
                })
            },
            getDateStr: function (AddDayCount, format) {
                var dd = new Date();
                switch (format) {
                    case 'YMd':
                        dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
                        return dd.getFullYear() + "-" + (+dd.getMonth() + 1) + "-" + dd.getDate();
                        break;
                    case 'YM':
                        dd.setMonth(dd.getMonth() + AddDayCount);
                        return dd.getFullYear() + "-" + (+dd.getMonth() + 1);
                        break;
                    case 'Y':
                        dd.setFullYear(dd.getFullYear() + AddDayCount)
                        return dd.getFullYear();
                        break;
                    default:
                        return;
                }
            }
        };
    }])
app.controller("contrastCtrl", ["$scope", "$http", "ContrastFactory",
    function ($scope, $http, ContrastFactory) {
        var getOption = function (data, series, yAxis) {
            var legend = [];
            series.forEach(function (data) {
                legend.push(data.name);
            });
            return {
                // color: ["#666666", "#6666FF", "#669966", "#999966"],
                title: {
                    x: 'center'
                },
                grid: {
                    left: '1%',
                    right: '1%',
                    bottom: '3%',
                    top: "13%",
                    containLabel: true
                },
                legend: {
                    data: legend,
                    x: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {show: true},
                        magicType: {show: true, type: ["line", "bar"]},
                        //dataView: {show: true, readOnly: false},
                        restore: {show: true, title: "刷新"},
                        saveAsImage: {show: true}
                    }
                },
                xAxis: [
                    {
                        type: 'category',
                        axisLine: {onZero: false},
                        splitLine: {show: false},
                        data: data
                    }
                ],
                yAxis: yAxis,
                series: series
            }
        };

        ycui.select(".yc-select");

        var destroy = function () {
            $scope.adSpaceName = undefined;
            $scope.creativeTypes = undefined;
            $scope.channelName = undefined;
            $scope.mediaName = undefined;
            $scope.orderName = undefined;
            $scope.orderType = undefined;
            $scope.customer = undefined;
            $scope.customerType = undefined;
        };

        /*维度类型*/
        $scope.mainMark = -1;
        /*默认*/
        var getAllCustomer = function (type) {
            ContrastFactory.getAllCustomer({customerType: type}).then(function (data) {
                if (data.code != 200 && data.items.length < 0) return;
                data.items.unshift({
                    id: -1,
                    customerName: "所有客户"
                });
                $scope.allCustomerList = data.items;
            });
        };

        $scope.getMainMark = function (data) {
            destroy();
            switch (data.id) {
                case 0:
                    /*默认*/
                    $scope.customerType = 1;
                    getAllCustomer(1);
                    break;
                case 1:
                    break;
                case 2:
                    /*获取媒体列表*/
                    ContrastFactory.getMediaList().then(function (data) {
                        if (data.code != 200 && data.mediaList.length < 0) return;
                        data.mediaList.unshift({
                            id: -1,
                            mediaName: "全部媒体"
                        });
                        $scope.mediaList = data.mediaList;
                    });
                    ContrastFactory.getChannelList().then(function (data) {
                        if (data.code != 200 && data.channelList.length < 0) return;
                        data.channelList.unshift({
                            id: -1,
                            channelName: "全部频道"
                        });
                        $scope.channelList = data.channelList;
                    });
                    ContrastFactory.getADSpaceType().then(function (data) {
                        if (data.code != 200 && data.adSpaceTypeList.length < 0) return;
                        data.adSpaceTypeList.unshift({
                            id: -1,
                            name: "全部创意类型"
                        });
                        $scope.adSpaceTypeList = data.adSpaceTypeList
                    });
                    ContrastFactory.getADSpace({pageSize: 1}).then(function (data) {
                        if (data.code != 200 && data.items.length < 0) return;
                        ContrastFactory.getADSpace({pageSize: data.total_count}).then(function (da) {
                            if (da.code != 200 && da.items.length < 0) return;
                            da.items.unshift({
                                id: -1,
                                adSpaceName: "全部广告位"
                            });
                            $scope.ADSpaceList = da.items;
                        })
                    });
                    break;
            }
            $scope.mainMark = data.id;
            init();
        };

        /*客户类型*/
        /*默认*/
        $scope.customerType = 1;
        $scope.getCustomerType = function (data) {
            getAllCustomer(data.id);
            $scope.customerType = data.id;
            init();
        };
        /*客户*/
        $scope.getCustomer = function (data) {
            if (data.id === -1) {
                $scope.customerName = undefined;
            } else {
                $scope.customerName = data.customerName;
            }
            init();
        };

        /*时间类型*/
        $scope.timeType = 2;
        $scope.firstTimeStr = ContrastFactory.getDateStr(0, 'YMd');
        $scope.secondTimeStr = ContrastFactory.getDateStr(-1, 'YMd');
        /*默认*/
        $scope.getTimeType = function (data) {
            /*默认时间*/
            switch (data.id) {
                case 0:
                    $scope.firstTimeStr = ContrastFactory.getDateStr(0, 'Y');
                    $scope.secondTimeStr = ContrastFactory.getDateStr(-1, 'Y');
                    $scope.firstTime = $scope.firstTimeStr + "-" + "01" + "-" + "01";
                    $scope.secondTime = $scope.secondTimeStr + "-" + "01" + "-" + "01";
                    break;
                case 1:
                    $scope.firstTimeStr = ContrastFactory.getDateStr(0, 'YM');
                    $scope.secondTimeStr = ContrastFactory.getDateStr(-1, 'YM');
                    $scope.firstTime = $scope.firstTimeStr + "-" + "01";
                    $scope.secondTime = $scope.secondTimeStr + "-" + "01";
                    break;
                case 2:
                    $scope.firstTimeStr = ContrastFactory.getDateStr(0, 'YMd');
                    $scope.secondTimeStr = ContrastFactory.getDateStr(-1, 'YMd');
                    $scope.firstTimeStr = ContrastFactory.getDateStr(0, 'YMd');
                    $scope.secondTimeStr = ContrastFactory.getDateStr(-1, 'YMd');
                    break;
            }
            $scope.timeType = data.id;
            init();
        };

        /*订单类型*/
        $scope.getOrderType = function (data) {
            if (data.id === -1) {
                $scope.orderType = undefined;
            } else {
                if (data.id == 1) {
                    /*获取所有订单*/
                    ContrastFactory.getOrderName().then(function (data) {
                        if (data.code != 200 && data.orderNames.length < 0) return;
                        data.orderNames.unshift({
                            id: -1,
                            orderName: "全部订单"
                        });
                        $scope.orderNames = data.orderNames;
                    });
                } else if (data.id == 2) {
                    ContrastFactory.getDefaultOrderName().then(function (data) {
                        if (data.code != 200 && data.defaultOrdersList.length < 0) return;
                        data.defaultOrdersList.unshift({
                            id: -1,
                            orderName: "全部订单"
                        });
                        $scope.orderNames = data.defaultOrdersList;
                    });
                }
                $scope.orderType = data.id;
            }
            init();
        };

        /*获取订单*/
        $scope.getOrder = function (data) {
            if (data.id === -1) {
                $scope.orderName = undefined;
            } else {
                $scope.orderName = data.orderName;
            }
            init();
        };

        /*媒体类型*/
        $scope.getMediaName = function (data) {
            if (data.id === -1) {
                $scope.mediaName = undefined;
            } else {
                $scope.mediaName = data.mediaName;
            }
            init();
        };

        /*频道*/
        $scope.getChannel = function (data) {
            if (data.id === -1) {
                $scope.channelName = undefined;
            } else {
                $scope.channelName = data.channelName;
            }
            init();
        };

        /*创意类型*/
        $scope.getSpaceType = function (data) {
            if (data.id === -1) {
                $scope.creativeTypes = undefined;
            } else {
                $scope.creativeTypes = data.name;
            }
            init();
        };

        /*广告位*/
        $scope.getSpace = function (data) {
            if (data.id === -1) {
                $scope.adSpaceName = undefined;
            } else {
                $scope.adSpaceName = data.adSpaceName;
            }
            init();
        };

        var init = function () {
            var f = ContrastFactory.getDateStr(0, 'YMd');
            var s = ContrastFactory.getDateStr(-1, 'YMd');

            var query = {
                firstTime: $scope.firstTime || f,
                secondTime: $scope.secondTime || s,
                mainMark: $scope.mainMark,
                customerType: $scope.customerType,
                timeType: $scope.timeType,
                orderType: $scope.orderType,
                customerName: $scope.customerName,
                orderName: $scope.orderName,
                mediaName: $scope.mediaName,
                channelName: $scope.channelName,
                creativeTypes: $scope.creativeTypes,
                adSpaceName: $scope.adSpaceName
            };
            var mainChart = echarts.init(document.getElementById("main"));
            if ($scope.mainMark == -1 || (!$scope.exposureNum && !$scope.clickNum)) {
                mainChart.clear();
                return
            }
            ContrastFactory.getReportCompare(query, function (data, series1, series2) {
                var yAxis1 = [{
                    name: '曝光量',
                    type: 'value'
                }];
                var yAxis2 = [{
                    name: '点击量',
                    type: 'value'
                }];

                if ($scope.exposureNum && !$scope.clickNum) {
                    mainChart.setOption(getOption(data, series1(0), yAxis1));
                } else if (!$scope.exposureNum && $scope.clickNum) {
                    mainChart.setOption(getOption(data, series2(0), yAxis2));
                } else if ($scope.exposureNum && $scope.clickNum) {
                    mainChart.setOption(getOption(data, series1(0).concat(series2(1)), yAxis1.concat(yAxis2)));
                }
                window.onresize = mainChart.resize;
            })
        };

        $scope.redirectStart = function (data, type) {
            if (data == '--请选择--') {
                $scope.firstTime = undefined;
                return;
            }
            switch (type) {
                case 0:
                    $scope.firstTime = data + "-" + "01" + "-" + "01";
                    break;
                case 1:
                    $scope.firstTime = data + "-" + "01";
                    break;
                default:
                    break;
            }
            if ($scope.secondTime) {
                init();
            }
        };

        $scope.redirectEnd = function (data, type) {
            if (data == '--请选择--') {
                $scope.secondTime = undefined;
                return;
            }
            switch (type) {
                case 0:
                    $scope.secondTime = data + "-" + "01" + "-" + "01";
                    break;
                case 1:
                    $scope.secondTime = data + "-" + "01";
                    break;
                default:
                    break;
            }
            if ($scope.firstTime) {
                init();
            }
        };


        //日历查询
        new pickerDateRange('contrastTimeStart', {
            stopToday: false,
            autoSubmit: true,
            shortbtn: 0,
            startDate: $scope.firstTime,
            endDate: $scope.secondTime,
            calendars: 1,
            isSingleDay: true,
            shortOpr: true,
            inputTrigger: 'dateRange',
            success: function (obj) {
                $scope.firstTime = obj.startDate;
                if ($scope.secondTime) {
                    init();
                }
            }
        });
        new pickerDateRange('contrastTimeEnd', {
            stopToday: false,
            autoSubmit: true,
            shortbtn: 0,
            startDate: $scope.secondTime,
            endDate: $scope.secondTime,
            calendars: 1,
            isSingleDay: true,
            shortOpr: true,
            inputTrigger: 'dateRange',
            success: function (obj) {
                $scope.secondTime = obj.endDate;
                if ($scope.firstTime) {
                    init();
                }
            }
        });

        /*年构造*/
        $scope.years = [];
        $scope.months = [];
        var year = +new Date().getFullYear();
        for (var i = year - 4; i <= year; i++) {
            $scope.years.push(i);
            /*月构造*/
            for (var j = 1; j <= 12; j++) {
                $scope.months.push(i + "-" + j);
            }
        }

        /*默认选中一个*/
        $scope.exposureNum = true;
        $scope.$watch('exposureNum', function (newValue, oldValue, scope) {
            if (newValue === undefined)return;
            init();
        })
        $scope.$watch('clickNum', function (newValue, oldValue, scope) {
            if (newValue === undefined)return;
            init();
        })
    }]);
