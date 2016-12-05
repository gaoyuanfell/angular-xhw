/**
 * Created by moka on 16-7-8.
 */
app.controller('keyWordCtrl', ["$scope", "ReportAdvertiseFty", "CustomerFty",'$q',
    function ($scope, ReportAdvertiseFty, CustomerFty,$q) {
        $scope.orderListSel = {};
        $scope.customerListSel = {};

        //订单下拉框
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().success(function (response) {
            if(!response) return;
            $scope.orderListSel.list = response.items;
        });
        //客户下拉框
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 2}).success(function (response) {
            if(!response) return;
            $scope.customerListSel.list = response.items;
        });

        $scope.query = {pageSize:10,pageIndex:1};

        $scope.$on('ad-report-word',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            //列表
            ReportAdvertiseFty.keywordReport($scope.query).success(modViewG);
            //汇总
            ReportAdvertiseFty.collectKeywordReport($scope.query).success(summarizingG);
        })

        ycui.loading.show();
        var modViewG = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingG = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };

        //列表
        ReportAdvertiseFty.keywordReport($scope.query).success(modViewG);
        //汇总
        ReportAdvertiseFty.collectKeywordReport($scope.query).success(summarizingG);

        //搜索框
        $scope.redirect = function (num,co) {
            ycui.loading.show();
            $scope.query.param1 = $scope.query.search;;
            $scope.query.pageIndex = num || 1;
            //列表
            ReportAdvertiseFty.keywordReport($scope.query).success(modViewG);
            //汇总
            ReportAdvertiseFty.collectKeywordReport($scope.query).success(summarizingG);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportWord', {
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

                ReportAdvertiseFty.keywordReport($scope.query).success(modViewG);
                ReportAdvertiseFty.collectKeywordReport($scope.query).success(summarizingG);
            }
        });

        //导出
        var derive = '/special/exportKeywordReport.htm';
        $scope.export = function () {
            var array = ["文字链标题", "广告位名称", "曝光量", "点击量", "点击率"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            textLinkName: true,
            adSpaceName: true,
            pv: true,
            click: true,
            ctr: true,
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }]);
