/**
 * Created by moka on 16-6-21.
 */
app.controller('adAdvertisementCtrl', ["$scope", "$http", "ReportAdvertiseFty", "ResAdvertisingFty",'$q','CustomerFty','ResChannelFty',
    function ($scope, $http, ReportAdvertiseFty, ResAdvertisingFty,$q,CustomerFty,ResChannelFty) {
        $scope.orderListSel = {};
        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.channelListSel.$destroy();
                d && ResChannelFty.getChannelsByMedia({mediaId: d.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        };
        $scope.typeListSel = {};
        $scope.customerListSel = {};
        $scope.channelListSel = {};

        //订单下拉框
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            $scope.orderListSel.list = response.items;
        });
        //客户下拉
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 2}).then(function (response) {
            $scope.customerListSel.list = response.items;
        });

        //媒体 频道  创意
        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            if(response){
                $scope.mediaListSel.list = response.mediaList;
                $scope.typeListSel.list = response.typeList;
            }
        });
        

        $scope.$on('ad-report-create',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalADSpace($scope.query).then(modViewG);
            ReportAdvertiseFty.collectADSpace($scope.query).then(summarizingG);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewG = function (response) {
            ycui.loading.hide();
            if(!response){return};
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize: pageSize,pageIndex: 1}
        
        //列表
        ReportAdvertiseFty.totalADSpace($scope.query).then(modViewG);

        //汇总
        var summarizingG = function (response) {
            if(response){
                $scope.summarizing = response.items;
            }
        };
        ReportAdvertiseFty.collectADSpace($scope.query).then(summarizingG);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.totalADSpace($scope.query).then(modViewG);
            ReportAdvertiseFty.collectADSpace($scope.query).then(summarizingG);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime7', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportAdvertiseFty.totalADSpace($scope.query).then(modViewG);
                ReportAdvertiseFty.collectADSpace($scope.query).then(summarizingG);
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportADSpaceReport.htm';
        $scope.export = function () {
            var array = ["广告位ID", "广告位名称", "创意类型", "频道", "页面类型", "所属媒体", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            id: true,
            adSpaceName: true,
            adSpaceTypeName: true,
            customerTotal: true,
            orderIdTotal: true,
            channelName: true,
            pageType: true,
            mediaName: true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller('browserCtrl', ["$scope", "$http", "ReportAdvertiseFty",'$q',
    function ($scope, $http, ReportAdvertiseFty,$q) {
        $scope.orderListSel = {};
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            $scope.orderListSel.list = response.items;
        });

        $scope.$on('ad-report-browser',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalBrowser($scope.query).then(modViewF);
            ReportAdvertiseFty.collectBrowser($scope.query).then(summarizingF);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewF = function (response) {
            ycui.loading.hide();
            if(!response){return};
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize: pageSize,pageIndex: 1}

        //列表
        ReportAdvertiseFty.totalBrowser({pageSize: pageSize}).then(modViewF);

        //汇总
        var summarizingF = function (response) {
            if(response){
                $scope.summarizing = response.items; 
            }
        };

        ReportAdvertiseFty.collectBrowser($scope.query).then(summarizingF);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.totalBrowser($scope.query).then(modViewF);
            ReportAdvertiseFty.collectBrowser($scope.query).then(summarizingF);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime6', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportAdvertiseFty.totalBrowser($scope.query).then(modViewF);
                ReportAdvertiseFty.collectBrowser($scope.query).then(summarizingF);
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportBrowserReport.htm';
        $scope.export = function () {
            var array = ["浏览器名称", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            browserName: true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller('dateCtrl', ["$scope", "$http", "ReportAdvertiseFty", "CustomerFty",'$q',
    function ($scope, $http, ReportAdvertiseFty, CustomerFty,$q) {
        $scope.query = {pageSize:10,pageIndex:1}
        $scope.customerListSel = {};
        $scope.orderListSel = {};

        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            $scope.orderListSel.list = response.items;
        });
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 2}).then(function (response) {
            $scope.customerListSel.list = response.items;
        });

        $scope.$on('ad-report-data',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.dateReport($scope.query).then(modViewA);
            ReportAdvertiseFty.collectDateReport($scope.query).then(summarizingA);
        })
        
        ycui.loading.show();
        var pageSize = 10;
        var modViewA = function (response) {
            ycui.loading.hide();
            if(!response){return};
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingA = function (response) {
            $scope.summarizing = response.items;
        };

        ReportAdvertiseFty.dateReport($scope.query).then(modViewA);
        ReportAdvertiseFty.collectDateReport($scope.query).then(summarizingA);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            ReportAdvertiseFty.dateReport($scope.query).then(modViewA);
            ReportAdvertiseFty.collectDateReport($scope.query).then(summarizingA);
        };

        //日历查询
        var dateRange = new pickerDateRange('resourceAff', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: new Date().calendar(1, -15).dateFormat(),
            endDate: new Date().dateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                $scope.query.pageIndex = 1;
                ReportAdvertiseFty.dateReport($scope.query).then(modViewA);
                ReportAdvertiseFty.collectDateReport($scope.query).then(summarizingA);
            }
        });

        //导出报表
        var derive = '/AdvertiseReport/exportDateReport.htm';
        $scope.export = function () {
            var array = ["日期", "合同量","客户量", "订单量", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            days: true,
            customerTotal: true,
            orderIdTotal: true,
            contractTotal:true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-7-8.
 */
app.controller('hourCtrl', ["$scope", "$http", "ReportAdvertiseFty", "ResAdvertisingFty","CustomerFty",'$q',
    function ($scope, $http, ReportAdvertiseFty, ResAdvertisingFty,CustomerFty,$q) {
        $scope.orderListSel = {};
        $scope.customerListSel = {};
        //订单下拉框
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            $scope.orderListSel.list = response.items;
        });
        //客户下拉
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 2}).then(function (response) {
            $scope.customerListSel.list = response.items;
        });

        $scope.$on('ad-report-hour',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalHour($scope.query).then(modViewG);
            ReportAdvertiseFty.collectHour($scope.query).then(summarizingG);
        })

        ycui.loading.show();
        var modViewG = function (response) {
            ycui.loading.hide();
            if(!response){return};
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };
        $scope.query = {pageSize:10,pageIndex:1};

        //列表
        ReportAdvertiseFty.totalHour($scope.query).then(modViewG);

        //汇总
        var summarizingG = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };
        ReportAdvertiseFty.collectHour($scope.query).then(summarizingG);

        //搜索框
        $scope.redirect = function (num) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            ReportAdvertiseFty.totalHour($scope.query).then(modViewG);
            ReportAdvertiseFty.collectHour($scope.query).then(summarizingG);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime8', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportAdvertiseFty.totalHour($scope.query).then(modViewG);
                ReportAdvertiseFty.collectHour($scope.query).then(summarizingG);
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportHourReport.htm';
        $scope.export = function () {
            var array = ["时段", "客户量", "订单量", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            currentHour: true,
            customerTotal: true,
            orderIdTotal: true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
        
    }]);

/**
 * Created by moka on 16-7-8.
 */
app.controller('keyWordCtrl', ["$scope", "ReportAdvertiseFty", "CustomerFty",'$q',
    function ($scope, ReportAdvertiseFty, CustomerFty,$q) {
        $scope.orderListSel = {};
        $scope.customerListSel = {};

        //订单下拉框
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            if(!response) return;
            $scope.orderListSel.list = response.items;
        });
        //客户下拉框
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 2}).then(function (response) {
            if(!response) return;
            $scope.customerListSel.list = response.items;
        });

        $scope.query = {pageSize:10,pageIndex:1};

        $scope.$on('ad-report-word',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            //列表
            ReportAdvertiseFty.keywordReport($scope.query).then(modViewG);
            //汇总
            ReportAdvertiseFty.collectKeywordReport($scope.query).then(summarizingG);
        })

        ycui.loading.show();
        var modViewG = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingG = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };

        //列表
        ReportAdvertiseFty.keywordReport($scope.query).then(modViewG);
        //汇总
        ReportAdvertiseFty.collectKeywordReport($scope.query).then(summarizingG);

        //搜索框
        $scope.redirect = function (num,co) {
            ycui.loading.show();
            $scope.query.param1 = $scope.query.search;;
            $scope.query.pageIndex = num || 1;
            //列表
            ReportAdvertiseFty.keywordReport($scope.query).then(modViewG);
            //汇总
            ReportAdvertiseFty.collectKeywordReport($scope.query).then(summarizingG);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportWord', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;

                ReportAdvertiseFty.keywordReport($scope.query).then(modViewG);
                ReportAdvertiseFty.collectKeywordReport($scope.query).then(summarizingG);
            }
        });

        //导出
        var derive = '/special/exportKeywordReport.htm';
        $scope.export = function () {
            var array = ["文字链标题", "广告位名称", "曝光量", "点击量", "点击率"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            textLinkName: true,
            adSpaceName: true,
            pv: true,
            click: true,
            ctr: true,
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);

/**
 * Created by moka on 16-6-21.
 */
app.controller('operationCtrl', ["$scope", "$http", "ReportAdvertiseFty",'$q',
    function ($scope, $http, ReportAdvertiseFty,$q) {
        $scope.orderListSel = {};
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            $scope.orderListSel.list = response.items;
        });

        $scope.$on('ad-report-operation',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalOS($scope.query).then(modViewE);
            ReportAdvertiseFty.collectOS($scope.query).then(summarizingE);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewE = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize: pageSize,pageIndex: 1}

        //列表
        ReportAdvertiseFty.totalOS($scope.query).then(modViewE);

        //汇总
        var summarizingE = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };

        ReportAdvertiseFty.collectOS($scope.query).then(summarizingE);
        
        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.totalOS($scope.query).then(modViewE);
            ReportAdvertiseFty.collectOS($scope.query).then(summarizingE);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime5', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportAdvertiseFty.totalOS($scope.query).then(modViewE);
                ReportAdvertiseFty.collectOS($scope.query).then(summarizingE);
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportOSReport.htm';
        $scope.export = function () {
            var array = ["操作系统名称", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            osName: true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller('indentCtrl', ["$scope", "$http", "ReportAdvertiseFty", "CustomerFty",'$q',
    function ($scope, $http, ReportAdvertiseFty, CustomerFty,$q) {
        $scope.customerListSel = {};
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 3}).then(function (response) {
            $scope.customerListSel.list = response.items;
        });
        $scope.orderTypeSel = {
            list:[
                {name:'预定广告位',id:1},
                {name:'正式投放',id:2},
                {name:'试用推广',id:3},
                {name:'自用推广',id:4},
                {name:'补偿刊登',id:5}
            ]
        }

        $scope.$on('ad-report-order',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.orderReport($scope.query).then(modViewB);
            ReportAdvertiseFty.collectOrder($scope.query).then(summarizingB);
        })


        ycui.loading.show();
        var pageSize = 10;
        var modViewB = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize: pageSize, pageIndex: 1};

        //列表
        ReportAdvertiseFty.orderReport($scope.query).then(modViewB);

        //汇总
        summarizingB = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };

        ReportAdvertiseFty.collectOrder($scope.query).then(summarizingB);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.orderReport($scope.query).then(modViewB);
            ReportAdvertiseFty.collectOrder($scope.query).then(summarizingB);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime2', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            calendars: 2,
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportAdvertiseFty.orderReport($scope.query).then(modViewB);
                ReportAdvertiseFty.collectOrder($scope.query).then(summarizingB);
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportOrderReport.htm';
        $scope.export = function () {
            var array = ["订单ID", "订单名称","订单类型", "客户名称", "客户类型", "代理名称","投放档期", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            id: true,
            orderName: true,
            customerName: true,
            customerType: true,
            agentName: true,
            orderType:true,
            scheduleTime:true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller('adOriginalityCtrl', ["$scope", "$http", "ReportAdvertiseFty",'$q','CustomerFty',
    function ($scope, $http, ReportAdvertiseFty,$q,CustomerFty) {
        $scope.orderListSel = {};
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            $scope.orderListSel.list = response.items;
        });

        $scope.customerListSel = {};
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 3}).then(function (response) {
            $scope.customerListSel.list = response.items;
        });
        

        $scope.$on('ad-report-create',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalAdCreative($scope.query).then(modViewC);
            ReportAdvertiseFty.collectAdCreative($scope.query).then(summarizingC);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewC = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize: pageSize,pageIndex: 1}

        //列表
        ReportAdvertiseFty.totalAdCreative($scope.query).then(modViewC);


        //汇总
        var summarizingC = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };

        ReportAdvertiseFty.collectAdCreative($scope.query).then(summarizingC);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.totalAdCreative($scope.query).then(modViewC);
            ReportAdvertiseFty.collectAdCreative($scope.query).then(summarizingC);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime3', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportAdvertiseFty.totalAdCreative($scope.query).then(modViewC);
                ReportAdvertiseFty.collectAdCreative($scope.query).then(summarizingC);
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportAdCreativeReport.htm';
        $scope.export = function () {
            var array = ["创意ID", "创意名称","客户名称", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };
        $scope.clientCustom = {
            id: true,
            adCreativeName: true,
            customerName:true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller('territoryCtrl', ["$scope", "$http", "ReportAdvertiseFty", "DictionaryFty",'$q',
    function ($scope, $http, ReportAdvertiseFty, DictionaryFty,$q) {
        $scope.orderListSel = {};
        $scope.provinceListSel = {};

        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            $scope.orderListSel.list = response.items;
        });
        //获取城市列表
        DictionaryFty.provinceList().then(function (data) {
            if(!data) return;
            $scope.provinceListSel.list = data.lists;
        })

        $scope.$on('ad-report-territory',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalCity($scope.query).then(modViewD);
            ReportAdvertiseFty.collectCity($scope.query).then(summarizingD);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize: pageSize,pageIndex: 1}

        //列表
        ReportAdvertiseFty.totalCity($scope.query).then(modViewD);

        //汇总
        var summarizingD = function (response) {
            $scope.summarizing = response.items;
        };
        ReportAdvertiseFty.collectCity($scope.query).then(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.totalCity($scope.query).then(modViewD);
            ReportAdvertiseFty.collectCity($scope.query).then(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime4', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportAdvertiseFty.totalCity($scope.query).then(modViewD);
                ReportAdvertiseFty.collectCity($scope.query).then(summarizingD);
                
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportCityReport.htm';
        $scope.export = function () {
            var array = ["省", "市", "订单量","曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            provinceName: true,
            cityName: false,
            orderIdTotal:true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }

        /*按市统计*/
        $scope.$watch('forCityBo', function (newValue) {
            if(newValue == undefined)return;
            if (newValue) {
                $scope.query.paramInt1 = 1;
                $scope.forCity = true;
                $scope.forCitySearch = '请输入省或市'
                $scope.clientCustom.cityName = true;
            } else {
                $scope.query.paramInt1 = 0;
                $scope.forCity = false;
                $scope.forCitySearch = '请输入省'
                $scope.clientCustom.cityName = false;
            }
            ReportAdvertiseFty.totalCity($scope.query).then(modViewD);
            ReportAdvertiseFty.collectCity($scope.query).then(summarizingD);
        })
    }]);
/**
 * Created by moka on 16-7-25.
 */
app.controller('contractConsumeCtrl', ['$scope', 'ReportAdvertiseFty',
    function ($scope, ReportAdvertiseFty) {

        ycui.loading.show();
        var modViewG = function (response) {
            ycui.loading.hide();
            if (response && response.code == 200) {
                $scope.page = {
                    page:response.page,
                    total_page:response.total_page
                }
                $scope.items = response.items;
                $scope.total_page = response.total_page;
            }
        };

        var collectG = function (res) {
            if (res && res.code == 200) {
                $scope.summarizing = res.items;
            }
        };

        var _tayStart = new Date().dateFormat();
        var _tayEnd = new Date().calendar(1, 1).dateFormat();
        var _start = stringToDate(_tayStart);
        var _end = stringToDate(_tayEnd).calendar(6,-1);
        $scope.query = {pageSize: 10,pageIndex:1, startTime: _start.dateFormat('yyyy-MM-dd HH:mm:ss'), endTime: _end.dateFormat('yyyy-MM-dd HH:mm:ss')};

        ReportAdvertiseFty.contractCostReport($scope.query).then(modViewG);
        ReportAdvertiseFty.collectContractCostReport($scope.query).then(collectG);

        new pickerDateRange('dateRangeOperate', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: _start.dateFormat(),
            endDate: _end.dateFormat(),
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate + ' 00:00:00';
                $scope.query.endTime = obj.endDate + ' 23:59:59';
                ReportAdvertiseFty.contractCostReport($scope.query).then(modViewG);
                ReportAdvertiseFty.collectContractCostReport($scope.query).then(collectG);
            }
        });

        //搜索框
        $scope.redirect = function (num, da1) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.contractCostReport($scope.query).then(modViewG);
            ReportAdvertiseFty.collectContractCostReport($scope.query).then(collectG);
        };

        //导出
        var derive = '/costReport/exportContractCostReport.htm';//日期、排期单号、合同号、已执行金额、已配送金额
        $scope.export = function () {
            var array = ["日期", "合同号","合同金额","折扣比例","配送比例", "已执行金额", "已配送金额", "推送收入金额", "推送配送金额"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            currentDate: true,
            contractCode: true,
            contractMoney:true,
            discount:true,
            present:true,
            cost: true,
            costFree: true,
            pushCost: true,
            pushCostFree: true
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-7-25.
 */
app.controller('orderConsumeCtrl', ['$scope', 'ReportAdvertiseFty','$q','CustomerFty',
    function ($scope, ReportAdvertiseFty,$q,CustomerFty) {

        $scope.orderListSel = {};
        $scope.customerListSel = {};

        //订单下拉框
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            if(!response) return;
            $scope.orderListSel.list = response.items;
        });
        //客户下拉框
        var getPartCustomer = CustomerFty.getAllCustomer().then(function (response) {
            if(!response) return;
            $scope.customerListSel.list = response.items;
        });

        $scope.$on('ad-report-orderCon',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.orderCostReport($scope.query).then(modViewG);
            ReportAdvertiseFty.collectOrderCostReport($scope.query).then(collectG);
        })

        ycui.loading.show();
        var modViewG = function (response) {
            ycui.loading.hide();
            if (response && response.code == 200) {
                $scope.page = {
                    page:response.page,
                    total_page:response.total_page
                }
                $scope.items = response.items;
                $scope.total_page = response.total_page;
            }
        };

        var collectG = function (res) {
            if (res && res.code == 200) {
                $scope.summarizing = res.items;
            }
        };

        var _tayStart = new Date().dateFormat();
        var _tayEnd = new Date().calendar(1, 1).dateFormat();
        var _start = stringToDate(_tayStart);
        var _end = stringToDate(_tayEnd).calendar(6,-1);
        $scope.query = {pageSize: 10,pageIndex:1, startTime: _start.dateFormat('yyyy-MM-dd HH:mm:ss'), endTime: _end.dateFormat('yyyy-MM-dd HH:mm:ss')};

        ReportAdvertiseFty.orderCostReport($scope.query).then(modViewG);
        ReportAdvertiseFty.collectOrderCostReport($scope.query).then(collectG);

        new pickerDateRange('dateRangeOperate', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: _start.dateFormat(),
            endDate: _end.dateFormat(),
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate + ' 00:00:00';
                $scope.query.endTime = obj.endDate + ' 23:59:59';
                ReportAdvertiseFty.orderCostReport($scope.query).then(modViewG);
                ReportAdvertiseFty.collectOrderCostReport($scope.query).then(collectG);
            }
        });

        //搜索框
        $scope.redirect = function (num, da1) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.orderCostReport($scope.query).then(modViewG);
            ReportAdvertiseFty.collectOrderCostReport($scope.query).then(collectG);
        };

        //导出
        var derive = '/costReport/exportOrderCostReport.htm';//日期、排期单号、合同号、已执行金额、已配送金额
        $scope.export = function () {
            var array = ["日期", "排期单号", "订单名称","客户名称","代理名称","业务员", "合同号", "已执行金额", "已配送金额"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            currentDate: true,
            trueName:true,
            scheduleCode: true,
            orderName: true,
            customerName: true,
            agentName: true,
            contractCode: true,
            cost: true,
            costFree: true
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
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

/**
 * Created by moka on 16-6-21.
 */
app.controller('client2Ctrl', ["$scope", "$http", "ReportCustomerFty",
    function ($scope, $http, ReportCustomerFty) {
        ycui.loading.show();
        var pageSize = 10;
        $scope.query = {pageSize:pageSize,pageIndex:1}
        var modView = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };
        ReportCustomerFty.agentCustomerReport($scope.query).then(modView);

        //汇总
        var summarizing = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };
        ReportCustomerFty.collectAgentCustomerReport($scope.query).then(summarizing);

        $scope.search = '';
        $scope.go = '';
        $scope.optype = '';
        $scope.num = '';
        $scope.time = '';

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportCustomerFty.agentCustomerReport($scope.query).then(modView);
            ReportCustomerFty.collectAgentCustomerReport($scope.query).then(summarizing);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff1', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                $scope.query.pageIndex = 1;
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportCustomerFty.agentCustomerReport($scope.query).then(modView);
                ReportCustomerFty.collectAgentCustomerReport($scope.query).then(summarizing);
            }
        });

        //导出报表
        var derive = '/CustomerReport/exportAgentCustomerReport.htm';
        $scope.exportB = function () {
            var array = ["客户ID", "客户名称", "订单量", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            id: true,
            customerName: true,
            orderTotal: true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller('clientCtrl', ["$scope", "$http", "ReportCustomerFty",
    function ($scope, $http, ReportCustomerFty) {
        $scope.clientTypeSel = {
            list:[
                {name:'直客',id:1},
                {name:'代理子客户',id:3}
            ]
        }

        var pageSize = 10;
        $scope.query = {pageSize: pageSize,pageIndex:1}

        ycui.loading.show();
        var modViewA = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };
        ReportCustomerFty.customerReport($scope.query).then(modViewA);

        //汇总
        var summarizingA = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };
        ReportCustomerFty.collectCustomerReport($scope.query).then(summarizingA);

        $scope.$on('clientListGroup',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportCustomerFty.customerReport($scope.query).then(modViewA);
            ReportCustomerFty.collectCustomerReport($scope.query).then(summarizingA);
        })

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportCustomerFty.customerReport($scope.query).then(modViewA);
            ReportCustomerFty.collectCustomerReport($scope.query).then(summarizingA);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            calendars: 2,
            inputTrigger: 'dateRange',
            success: function (obj) {
                $scope.query.pageIndex = 1;
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportCustomerFty.customerReport($scope.query).then(modViewA);
                ReportCustomerFty.collectCustomerReport($scope.query).then(summarizingA);
            }
        });

        //导出报表
        var derive = '/CustomerReport/exportCustomerReport.htm';
        $scope.exportA = function () {
            var array = ["客户ID", "客户名称","业务员", "代理名称", "订单量","合同量","创意量", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            id: true,
            customerName: true,
            trueName:true,
            agentName: true,
            orderTotal: true,
            contractTotal:true,
            adCreativeTotal:true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
    }]);

/**
 * Created by moka on 16-6-21.
 */
app.controller('advertisementCtrl', ["$scope", "$http", "ReportResourceFty", "ResAdvertisingFty","$q","ResChannelFty",
    function ($scope, $http, ReportResourceFty, ResAdvertisingFty,$q,ResChannelFty) {
        $scope.channelListSel = {};
        $scope.typeListSel = {};
        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.channelListSel.$destroy();
                d && ResChannelFty.getChannelsByMedia({mediaId: d.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        };

        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            $scope.mediaListSel.list = response.mediaList;
            $scope.typeListSel.list = response.typeList;
        });

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize: pageSize,pageIndex:1};

        $scope.$on('advertisementListGroup',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportResourceFty.aDSpaceConsume($scope.query).then(modViewD);
            ReportResourceFty.collectADSpaceConsume($scope.query).then(summarizingD);
        })

        ReportResourceFty.aDSpaceConsume($scope.query).then(modViewD);

        //汇总
        summarizingD = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };
        ReportResourceFty.collectADSpaceConsume($scope.query).then(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportResourceFty.aDSpaceConsume($scope.query).then(modViewD);
            ReportResourceFty.collectADSpaceConsume($scope.query).then(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff4', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.hide();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportResourceFty.aDSpaceConsume($scope.query).then(modViewD);
                ReportResourceFty.collectADSpaceConsume($scope.query).then(summarizingD);
            }
        });

        //导出报表
        var derive = '/Resource/exportADSpaceConsume.htm';
        $scope.export = function () {
            var array = ["广告位ID", "广告位名称", "创意类型", "频道", "所属媒体","合同量", "客户量", "订单量", "创意量","曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            adSpaceId: true,
            adSpaceName: true,
            adSpaceTypeName: true,
            channelName: true,
            mediaName: true,
            customerTotal: true,
            orderIdTotal: true,
            contractTotal:true,
            adCreativeTotal:true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller('channelCtrl', ["$scope", "$http", "ReportResourceFty", "ResAdvertisingFty","$q",
    function ($scope, $http, ReportResourceFty, ResAdvertisingFty,$q) {
        $scope.mediaListSel = {
            callback:function(){
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                ReportResourceFty.mediaChannelConsume($scope.query).then(modViewB);
                ReportResourceFty.collectChannelConsume($scope.query).then(summarizingB);
            }
        };

        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            $scope.mediaListSel.list = response.mediaList;
        });

        ycui.loading.show();
        var pageSize = 10;
        var modViewB = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize: pageSize,pageIndex:1}

        ReportResourceFty.mediaChannelConsume($scope.query).then(modViewB);

        //汇总
        summarizingB = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };
        ReportResourceFty.collectChannelConsume($scope.query).then(summarizingB);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportResourceFty.mediaChannelConsume($scope.query).then(modViewB);
            ReportResourceFty.collectChannelConsume($scope.query).then(summarizingB);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff2', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportResourceFty.mediaChannelConsume($scope.query).then(modViewB);
                ReportResourceFty.collectChannelConsume($scope.query).then(summarizingB);
            }
        });

        //导出报表
        var derive = '/Resource/exportChannelConsume.htm';
        $scope.export = function () {
            var array = ["客户ID", "频道", "所属媒体","合同量", "客户量", "订单量","创意量", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            mediaChannelId: true,
            mediaChannelName: true,
            mediaName: true,
            customerTotal: true,
            orderIdTotal: true,
            contractTotal:true,
            adCreativeTotal:true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-6-21.
 */

//操作系统
app.controller('impressionSysCtrl', ["$scope", "ImpressionFty", "ResAdvertisingFty", "$q", "ResChannelFty",
    function ($scope, ImpressionFty, ResAdvertisingFty, $q, ResChannelFty) {
        $scope.query = {pageSize: 10,pageIndex: 1}
        //获取媒体下拉
        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            $scope.mediaListSel.list = response.mediaList;
        });

        $scope.mediaListSel = {
            callback: function (event, data) {
                $scope.channelListSel.$destroy();
                if(!data){return};
                ResChannelFty.getChannelsByMedia({mediaId: data.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        }
        $scope.channelListSel = {}

        //下拉框统一回调
        $scope.$on('impression-sys',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ImpressionFty.osReport($scope.query).then(modViewD);
            ImpressionFty.collectOSReport($scope.query).then(summarizingD);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingD = function (response) {
            if (!response) return;
            $scope.summarizing = response.items;
        };

        ImpressionFty.osReport($scope.query).then(modViewD);
        ImpressionFty.collectOSReport($scope.query).then(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ImpressionFty.osReport($scope.query).then(modViewD);
            ImpressionFty.collectOSReport($scope.query).then(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff5', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                $scope.query.pageIndex = 1;
                ImpressionFty.osReport($scope.query).then(modViewD);
                ImpressionFty.collectOSReport($scope.query).then(summarizingD);
            }
        });

        //导出报表
        var derive = '/channelReport/exportOSReport.htm';
        $scope.export = function () {
            var array = ["操作系统", "频道", "媒体", "印象数"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            osName: true,
            channelName: true,
            mediaName: true,
            pv: true
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }
]);

//浏览器
app.controller('impressionBowCtrl', ["$scope", "ImpressionFty", "ResAdvertisingFty", "$q", "ResChannelFty",
    function ($scope, ImpressionFty, ResAdvertisingFty, $q, ResChannelFty) {
        $scope.query = {pageSize: 10,pageIndex: 1}
        //获取媒体下拉
        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            $scope.mediaListSel.list = response.mediaList;
        });

        $scope.mediaListSel = {
            callback: function (event, data) {
                $scope.channelListSel.$destroy();
                if(!data){return};
                ResChannelFty.getChannelsByMedia({mediaId: data.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        }

        $scope.channelListSel = {}
        //下拉框统一回调
        $scope.$on('impression-bow',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ImpressionFty.browserReport($scope.query).then(modViewD);
            ImpressionFty.collectBrowserReport($scope.query).then(summarizingD);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingD = function (response) {
            if (!response) return;
            $scope.summarizing = response.items;
        };

        ImpressionFty.browserReport($scope.query).then(modViewD);
        ImpressionFty.collectBrowserReport($scope.query).then(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ImpressionFty.browserReport($scope.query).then(modViewD);
            ImpressionFty.collectBrowserReport($scope.query).then(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff6', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                $scope.query.pageIndex = 1;
                ImpressionFty.browserReport($scope.query).then(modViewD);
                ImpressionFty.collectBrowserReport($scope.query).then(summarizingD);
            }
        });

        //导出报表
        var derive = '/channelReport/exportBrowserReport.htm';
        $scope.export = function () {
            var array = ["浏览器", "频道", "媒体", "印象数"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            browserName: true,
            channelName: true,
            mediaName: true,
            pv: true
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }
]);


//国家
app.controller('impressionChinaCtrl', ["$scope", "ImpressionFty", "ResAdvertisingFty", "$q", "ResChannelFty",
    function ($scope, ImpressionFty, ResAdvertisingFty, $q, ResChannelFty) {
        $scope.query = {pageSize: 10,pageIndex: 1}
        //获取媒体下拉
        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            $scope.mediaListSel.list = response.mediaList;
        });

        $scope.mediaListSel = {
            callback: function (event, data) {
                $scope.channelListSel.$destroy();
                if(!data){return};
                ResChannelFty.getChannelsByMedia({mediaId: data.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        }

        $scope.channelListSel = {}
        //下拉框统一回调
        $scope.$on('impression-china',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ImpressionFty.countryReport($scope.query).then(modViewD);
            ImpressionFty.collectCountryReport($scope.query).then(summarizingD);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingD = function (response) {
            if (!response) return;
            $scope.summarizing = response.items;
        };

        ImpressionFty.countryReport($scope.query).then(modViewD);
        ImpressionFty.collectCountryReport($scope.query).then(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ImpressionFty.countryReport($scope.query).then(modViewD);
            ImpressionFty.collectCountryReport($scope.query).then(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff7', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                $scope.query.pageIndex = 1;
                ImpressionFty.countryReport($scope.query).then(modViewD);
                ImpressionFty.collectCountryReport($scope.query).then(summarizingD);
            }
        });

        //导出报表
        var derive = '/channelReport/exportCountryReport.htm';
        $scope.export = function () {
            var array = ["国家", "频道", "媒体", "印象数"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            countryName: true,
            channelName: true,
            mediaName: true,
            pv: true
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }
]);

//城市
app.controller('impressionCityCtrl', ["$scope", "ImpressionFty", "ResAdvertisingFty", "$q", "ResChannelFty",
    function ($scope, ImpressionFty, ResAdvertisingFty, $q, ResChannelFty) {
        $scope.query = {pageSize: 10,pageIndex: 1}
        //获取媒体下拉
        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            $scope.mediaListSel.list = response.mediaList;
        });

        $scope.mediaListSel = {
            callback: function (event, data) {
                $scope.channelListSel.$destroy();
                if(!data){return};
                ResChannelFty.getChannelsByMedia({mediaId: data.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        }

        $scope.channelListSel = {}
        //下拉框统一回调
        $scope.$on('impression-city',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ImpressionFty.cityReport($scope.query).then(modViewD);
            ImpressionFty.collectCityReport($scope.query).then(summarizingD);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingD = function (response) {
            if (!response) return;
            $scope.summarizing = response.items;
        };

        ImpressionFty.cityReport($scope.query).then(modViewD);
        ImpressionFty.collectCityReport($scope.query).then(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ImpressionFty.cityReport($scope.query).then(modViewD);
            ImpressionFty.collectCityReport($scope.query).then(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff8', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                $scope.query.pageIndex = 1;
                ImpressionFty.cityReport($scope.query).then(modViewD);
                ImpressionFty.collectCityReport($scope.query).then(summarizingD);
            }
        });

         $scope.$watch('forCityBo', function (newValue) {
             if(newValue == true){
                $scope.query.paramInt3 = 1;
                $scope.placeholder = '请输入省、市名称';
             }else{
                 $scope.query.paramInt3 = 0;
                 $scope.placeholder = '请输入省名称';
             }
             $scope.$emit('impression-city');
         })

        //导出报表
        var derive = '/channelReport/exportCountryReport.htm';
        $scope.export = function () {
            var array = ["城市/省", "频道", "媒体", "印象数"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            provinceName:true,
            cityName: true,
            channelName: true,
            mediaName: true,
            pv: true
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }
]);

/**
 * Created by moka on 16-6-21.
 */
app.controller('resourceCtrl', ["$scope", "$http", "ReportResourceFty",
    function ($scope, $http, ReportResourceFty) {
        ycui.loading.show();
        var pageSize = 10;
        var modViewA = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize:pageSize,pageIndex:1}

        ReportResourceFty.mediaConsume($scope.query).then(modViewA);

        //汇总
        summarizingA = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };
        ReportResourceFty.collectMediaConsume($scope.query).then(summarizingA);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportResourceFty.mediaConsume($scope.query).then(modViewA);
            ReportResourceFty.collectMediaConsume($scope.query).then(summarizingA);
        };

        //日历查询
        var dateRange = new pickerDateRange('resourceAff', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportResourceFty.mediaConsume($scope.query).then(modViewA);
                ReportResourceFty.collectMediaConsume($scope.query).then(summarizingA);
            }
        });

        //导出报表
        var derive = '/Resource/exportMediaConsume.htm';
        $scope.export = function () {
            var array = ["媒体ID", "媒体","合同量", "客户量", "订单量","创意量", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            mediaId: true,
            mediaName: true,
            customerTotal: true,
            orderIdTotal: true,
            contractTotal:true,
            adCreativeTotal:true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller('originalityCtrl', ["$scope", "$http", "ReportResourceFty", "ResAdvertisingFty","$q","ResChannelFty",
    function ($scope, $http, ReportResourceFty, ResAdvertisingFty,$q,ResChannelFty) {
        $scope.channelListSel = {};
        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.channelListSel.$destroy();
                d && ResChannelFty.getChannelsByMedia({mediaId: d.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        };

        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            $scope.mediaListSel.list = response.mediaList;
        });

        $scope.$on('reportLeiXingListGroup',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportResourceFty.adCreativeConsume($scope.query).then(modViewC);
            ReportResourceFty.collectAdCreativeConsume($scope.query).then(summarizingC);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewC = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize: pageSize,pageIndex:1}

        ReportResourceFty.adCreativeConsume($scope.query).then(modViewC);

        //汇总
        summarizingC = function (response) {
            if (!response) return;
            $scope.summarizing = response.items;
        };
        ReportResourceFty.collectAdCreativeConsume($scope.query).then(summarizingC);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportResourceFty.adCreativeConsume($scope.query).then(modViewC);
            ReportResourceFty.collectAdCreativeConsume($scope.query).then(summarizingC);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff3', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportResourceFty.adCreativeConsume($scope.query).then(modViewC);
                ReportResourceFty.collectAdCreativeConsume($scope.query).then(summarizingC);
            }
        });

        //导出报表
        var derive = '/Resource/exportAdCreativeConsume.htm';
        $scope.export = function () {
            var array = ["创意类型ID", "创意类型", "频道", "页面类型", "所属媒体","合同量", "客户量", "订单量","创意量", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            adSpaceTypeId: true,
            adSpaceTypeName: true,
            mediaChannelName: true,
            pageType: false,
            mediaName: true,
            customerTotal: true,
            orderIdTotal: true,
            contractTotal:true,
            adCreativeTotal:true,
            pv: true,
            click: true,
            ctr: true,
            cpm: false,
            cpc: false,
            totalMoney: false
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }

    }]);
/**
 * Created by Yunior on 2015/12/31.
 */
app.factory("IndexFactory", ["$http", function ($http) {
    return {
        adDataOverviewBar: function (query, callback) {
            var api = "/index/AdDataOverview.htm";
            var AdDataOverview = $http.get(baseUrl + api, { params: query });
            AdDataOverview.then(function (data) {
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
/**
 * Created by moka on 16-6-21.
 */
 app.directive('columnSetting',function(){
     return {
         restrict: "A",
         scope:{
             setting:"=columnSetting"
         },
         link:function(scope, element, attr){
             element[0].parentNode.style.position = 'relative';
             scope.setting.columnSetting = function(e,bo){
                 function fideIn($column){
                     $column.style.display = 'block';
                     $column.classList.remove('fadeOut');
                     $column.classList.add('fadeIn');
                 }
                 function findeOut($column){
                     $column.classList.remove('fadeIn');
                     $column.classList.add('fadeOut');
                     setTimeout(function() {
                         $column.style.display = 'none';
                     }, 150);
                 }
                 var $column;
                 if(e && bo){
                     $column = e.target.parentNode.parentNode;
                     if($column && $column.classList.contains('column-line')){
                         findeOut($column);
                     }
                 }else{
                     $column =e.target.parentNode.nextElementSibling;
                     if($column && $column.classList.contains('column-line')){
                         if($column.style.display == 'block'){
                             findeOut($column);
                         }else{
                             fideIn($column);
                         }
                     }
                 }
             }
         }
     }
 })

app.controller('orderRuleCtrl', ["$scope", "$location", "SysRuleUserFty",
    function ($scope, $location, SysRuleUserFty) {
        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 4}).then(function (res) {
            var _object = {};
            if(res && res.code == 200){
                var items = res.items;
                items.forEach(function(ad){
                    _object[ad.verify] = ad;
                })
            }
            /**
             * 权限对象 扁平化
             * @type {{}}
             */
            $scope.contrastReport = _object;
        })

        $scope.removePageIndex = function () {
            window.sessionStorage.removeItem('session_page_index');
        }
    }]);
