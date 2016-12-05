/**
 * Created by moka on 16-6-21.
 */
app.controller('operationCtrl', ["$scope", "$http", "ReportAdvertiseFty",'$q',
    function ($scope, $http, ReportAdvertiseFty,$q) {
        $scope.orderListSel = {};
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().success(function (response) {
            $scope.orderListSel.list = response.items;
        });

        $scope.$on('ad-report-operation',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalOS($scope.query).success(modViewE);
            ReportAdvertiseFty.collectOS($scope.query).success(summarizingE);
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
        ReportAdvertiseFty.totalOS($scope.query).success(modViewE);

        //汇总
        var summarizingE = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };

        ReportAdvertiseFty.collectOS($scope.query).success(summarizingE);
        
        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.totalOS($scope.query).success(modViewE);
            ReportAdvertiseFty.collectOS($scope.query).success(summarizingE);
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
                ReportAdvertiseFty.totalOS($scope.query).success(modViewE);
                ReportAdvertiseFty.collectOS($scope.query).success(summarizingE);
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