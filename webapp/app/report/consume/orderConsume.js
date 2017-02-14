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