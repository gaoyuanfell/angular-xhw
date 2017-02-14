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
