/**
 * Created by moka on 16-6-21.
 */
app.controller('browserCtrl', ["$scope", "$http", "ReportAdvertiseFty",'$q',
    function ($scope, $http, ReportAdvertiseFty,$q) {
        $scope.orderListSel = {};
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            $scope.orderListSel.list = response.items;
        });

        $scope.$on('ad-report-browser',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalBrowser($scope.query).then(modViewF);
            ReportAdvertiseFty.collectBrowser($scope.query).then(summarizingF);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewF = function (response) {
            ycui.loading.hide();
            if(!response){return};
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize: pageSize,pageIndex: 1}

        //列表
        ReportAdvertiseFty.totalBrowser({pageSize: pageSize}).then(modViewF);

        //汇总
        var summarizingF = function (response) {
            if(response){
                $scope.summarizing = response.items; 
            }
        };

        ReportAdvertiseFty.collectBrowser($scope.query).then(summarizingF);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.totalBrowser($scope.query).then(modViewF);
            ReportAdvertiseFty.collectBrowser($scope.query).then(summarizingF);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime6', {
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
                ReportAdvertiseFty.totalBrowser($scope.query).then(modViewF);
                ReportAdvertiseFty.collectBrowser($scope.query).then(summarizingF);
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportBrowserReport.htm';
        $scope.export = function () {
            var array = ["浏览器名称", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            browserName: true,
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