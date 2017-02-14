/**
 * Created by moka on 16-6-21.
 */
app.controller('adOriginalityCtrl', ["$scope", "$http", "ReportAdvertiseFty",'$q','CustomerFty',
    function ($scope, $http, ReportAdvertiseFty,$q,CustomerFty) {
        $scope.orderListSel = {};
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().then(function (response) {
            $scope.orderListSel.list = response.items;
        });

        $scope.customerListSel = {};
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 3}).then(function (response) {
            $scope.customerListSel.list = response.items;
        });
        

        $scope.$on('ad-report-create',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalAdCreative($scope.query).then(modViewC);
            ReportAdvertiseFty.collectAdCreative($scope.query).then(summarizingC);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewC = function (response) {
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
        ReportAdvertiseFty.totalAdCreative($scope.query).then(modViewC);


        //汇总
        var summarizingC = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };

        ReportAdvertiseFty.collectAdCreative($scope.query).then(summarizingC);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.totalAdCreative($scope.query).then(modViewC);
            ReportAdvertiseFty.collectAdCreative($scope.query).then(summarizingC);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime3', {
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
                ReportAdvertiseFty.totalAdCreative($scope.query).then(modViewC);
                ReportAdvertiseFty.collectAdCreative($scope.query).then(summarizingC);
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportAdCreativeReport.htm';
        $scope.export = function () {
            var array = ["创意ID", "创意名称","客户名称", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };
        $scope.clientCustom = {
            id: true,
            adCreativeName: true,
            customerName:true,
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