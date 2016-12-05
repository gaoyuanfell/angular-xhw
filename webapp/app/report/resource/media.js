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

        ReportResourceFty.mediaConsume($scope.query).success(modViewA);

        //汇总
        summarizingA = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };
        ReportResourceFty.collectMediaConsume($scope.query).success(summarizingA);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportResourceFty.mediaConsume($scope.query).success(modViewA);
            ReportResourceFty.collectMediaConsume($scope.query).success(summarizingA);
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
                ReportResourceFty.mediaConsume($scope.query).success(modViewA);
                ReportResourceFty.collectMediaConsume($scope.query).success(summarizingA);
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