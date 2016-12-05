/**
 * Created by moka on 16-6-21.
 */
app.controller('territoryCtrl', ["$scope", "$http", "ReportAdvertiseFty", "DictionaryFty",'$q',
    function ($scope, $http, ReportAdvertiseFty, DictionaryFty,$q) {
        $scope.orderListSel = {};
        $scope.provinceListSel = {};

        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().success(function (response) {
            $scope.orderListSel.list = response.items;
        });
        //获取城市列表
        DictionaryFty.provinceList().success(function (data) {
            if(!data) return;
            $scope.provinceListSel.list = data.lists;
        })

        $scope.$on('ad-report-territory',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalCity($scope.query).success(modViewD);
            ReportAdvertiseFty.collectCity($scope.query).success(summarizingD);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
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
        ReportAdvertiseFty.totalCity($scope.query).success(modViewD);

        //汇总
        var summarizingD = function (response) {
            $scope.summarizing = response.items;
        };
        ReportAdvertiseFty.collectCity($scope.query).success(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.totalCity($scope.query).success(modViewD);
            ReportAdvertiseFty.collectCity($scope.query).success(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime4', {
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
                ReportAdvertiseFty.totalCity($scope.query).success(modViewD);
                ReportAdvertiseFty.collectCity($scope.query).success(summarizingD);
                
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportCityReport.htm';
        $scope.export = function () {
            var array = ["省", "市", "订单量","曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            provinceName: true,
            cityName: false,
            orderIdTotal:true,
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

        /*按市统计*/
        $scope.$watch('forCityBo', function (newValue) {
            if(newValue == undefined)return;
            if (newValue) {
                $scope.query.paramInt1 = 1;
                $scope.forCity = true;
                $scope.forCitySearch = '请输入省或市'
                $scope.clientCustom.cityName = true;
            } else {
                $scope.query.paramInt1 = 0;
                $scope.forCity = false;
                $scope.forCitySearch = '请输入省'
                $scope.clientCustom.cityName = false;
            }
            ReportAdvertiseFty.totalCity($scope.query).success(modViewD);
            ReportAdvertiseFty.collectCity($scope.query).success(summarizingD);
        })
    }]);