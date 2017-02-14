/**
 * Created by moka on 16-6-21.
 */
app.controller('advertisementCtrl', ["$scope", "$http", "ReportResourceFty", "ResAdvertisingFty","$q","ResChannelFty",
    function ($scope, $http, ReportResourceFty, ResAdvertisingFty,$q,ResChannelFty) {
        $scope.channelListSel = {};
        $scope.typeListSel = {};
        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.channelListSel.$destroy();
                d && ResChannelFty.getChannelsByMedia({mediaId: d.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        };

        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            $scope.mediaListSel.list = response.mediaList;
            $scope.typeListSel.list = response.typeList;
        });

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

        $scope.query = {pageSize: pageSize,pageIndex:1};

        $scope.$on('advertisementListGroup',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ReportResourceFty.aDSpaceConsume($scope.query).then(modViewD);
            ReportResourceFty.collectADSpaceConsume($scope.query).then(summarizingD);
        })

        ReportResourceFty.aDSpaceConsume($scope.query).then(modViewD);

        //汇总
        summarizingD = function (response) {
            if(!response) return;
            $scope.summarizing = response.items;
        };
        ReportResourceFty.collectADSpaceConsume($scope.query).then(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ReportResourceFty.aDSpaceConsume($scope.query).then(modViewD);
            ReportResourceFty.collectADSpaceConsume($scope.query).then(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff4', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.hide();
                $scope.query.pageIndex = 1;
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                ReportResourceFty.aDSpaceConsume($scope.query).then(modViewD);
                ReportResourceFty.collectADSpaceConsume($scope.query).then(summarizingD);
            }
        });

        //导出报表
        var derive = '/Resource/exportADSpaceConsume.htm';
        $scope.export = function () {
            var array = ["广告位ID", "广告位名称", "创意类型", "频道", "所属媒体","合同量", "客户量", "订单量", "创意量","曝光量", "点击量", "CTR", "CPM", "CPC", "总花费"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            adSpaceId: true,
            adSpaceName: true,
            adSpaceTypeName: true,
            channelName: true,
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