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
        ReportCustomerFty.agentCustomerReport($scope.query).success(modView);

        //汇总
        var summarizing = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };
        ReportCustomerFty.collectAgentCustomerReport($scope.query).success(summarizing);

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
            ReportCustomerFty.agentCustomerReport($scope.query).success(modView);
            ReportCustomerFty.collectAgentCustomerReport($scope.query).success(summarizing);
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
                ReportCustomerFty.agentCustomerReport($scope.query).success(modView);
                ReportCustomerFty.collectAgentCustomerReport($scope.query).success(summarizing);
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