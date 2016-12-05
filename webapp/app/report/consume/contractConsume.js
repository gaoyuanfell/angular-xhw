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

        ReportAdvertiseFty.contractCostReport($scope.query).success(modViewG);
        ReportAdvertiseFty.collectContractCostReport($scope.query).success(collectG);

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
                ReportAdvertiseFty.contractCostReport($scope.query).success(modViewG);
                ReportAdvertiseFty.collectContractCostReport($scope.query).success(collectG);
            }
        });

        //搜索框
        $scope.redirect = function (num, da1) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.contractCostReport($scope.query).success(modViewG);
            ReportAdvertiseFty.collectContractCostReport($scope.query).success(collectG);
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