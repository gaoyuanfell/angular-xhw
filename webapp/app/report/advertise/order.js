/**
 * Created by moka on 16-6-21.
 */
app.controller('indentCtrl', ["$scope", "$http", "ReportAdvertiseFty", "CustomerFty",'$q',
    function ($scope, $http, ReportAdvertiseFty, CustomerFty,$q) {
        $scope.customerListSel = {};
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 3}).success(function (response) {
            $scope.customerListSel.list = response.items;
        });
        $scope.orderTypeSel = {
            list:[
                {name:'全部',id:-1},
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
            ReportAdvertiseFty.orderReport($scope.query).success(modViewB);
            ReportAdvertiseFty.collectOrder($scope.query).success(summarizingB);
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
        ReportAdvertiseFty.orderReport($scope.query).success(modViewB);

        //汇总
        summarizingB = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };

        ReportAdvertiseFty.collectOrder($scope.query).success(summarizingB);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.orderReport($scope.query).success(modViewB);
            ReportAdvertiseFty.collectOrder($scope.query).success(summarizingB);
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
                ReportAdvertiseFty.orderReport($scope.query).success(modViewB);
                ReportAdvertiseFty.collectOrder($scope.query).success(summarizingB);
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