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
