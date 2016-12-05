/**
 * Created by moka on 16-6-21.
 */
app.controller('adAdvertisementCtrl', ["$scope", "$http", "ReportAdvertiseFty", "ResAdvertisingFty",'$q','CustomerFty','ResChannelFty',
    function ($scope, $http, ReportAdvertiseFty, ResAdvertisingFty,$q,CustomerFty,ResChannelFty) {
        $scope.orderListSel = {};
        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.channelListSel.$destroy();
                d && ResChannelFty.getChannelsByMedia({mediaId: d.id}).success(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        };
        $scope.typeListSel = {};
        $scope.customerListSel = {};
        $scope.channelListSel = {};

        //订单下拉框
        var allNDefaultOrderNames = ReportAdvertiseFty.allNDefaultOrderNames().success(function (response) {
            $scope.orderListSel.list = response.items;
        });
        //客户下拉
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 2}).success(function (response) {
            $scope.customerListSel.list = response.items;
        });

        //媒体 频道  创意
        var downListForSearch = ResAdvertisingFty.downListForSearch().success(function (response) {
            if(response){
                $scope.mediaListSel.list = response.mediaList;
                $scope.typeListSel.list = response.typeList;
            }
        });
        

        $scope.$on('ad-report-create',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportAdvertiseFty.totalADSpace($scope.query).success(modViewG);
            ReportAdvertiseFty.collectADSpace($scope.query).success(summarizingG);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewG = function (response) {
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
        ReportAdvertiseFty.totalADSpace($scope.query).success(modViewG);

        //汇总
        var summarizingG = function (response) {
            if(response){
                $scope.summarizing = response.items;
            }
        };
        ReportAdvertiseFty.collectADSpace($scope.query).success(summarizingG);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportAdvertiseFty.totalADSpace($scope.query).success(modViewG);
            ReportAdvertiseFty.collectADSpace($scope.query).success(summarizingG);
        };

        //日历查询
        var dateRange = new pickerDateRange('adReportTime7', {
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
                ReportAdvertiseFty.totalADSpace($scope.query).success(modViewG);
                ReportAdvertiseFty.collectADSpace($scope.query).success(summarizingG);
            }
        });

        //导出
        var derive = '/AdvertiseReport/exportADSpaceReport.htm';
        $scope.export = function () {
            var array = ["广告位ID", "广告位名称", "创意类型", "频道", "页面类型", "所属媒体", "曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            id: true,
            adSpaceName: true,
            adSpaceTypeName: true,
            customerTotal: true,
            orderIdTotal: true,
            channelName: true,
            pageType: true,
            mediaName: true,
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