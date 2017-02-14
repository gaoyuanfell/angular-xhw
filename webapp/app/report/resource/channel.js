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