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