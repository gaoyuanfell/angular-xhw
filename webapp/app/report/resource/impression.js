/**
 * Created by moka on 16-6-21.
 */

//操作系统
app.controller('impressionSysCtrl', ["$scope", "ImpressionFty", "ResAdvertisingFty", "$q", "ResChannelFty",
    function ($scope, ImpressionFty, ResAdvertisingFty, $q, ResChannelFty) {
        $scope.query = {pageSize: 10,pageIndex: 1}
        //获取媒体下拉
        var downListForSearch = ResAdvertisingFty.downListForSearch().success(function (response) {
            $scope.mediaListSel.list = response.mediaList;
        });

        $scope.mediaListSel = {
            callback: function (event, data) {
                $scope.channelListSel.$destroy();
                if(!data){return};
                ResChannelFty.getChannelsByMedia({mediaId: data.id}).success(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        }
        $scope.channelListSel = {}

        //下拉框统一回调
        $scope.$on('impression-sys',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ImpressionFty.osReport($scope.query).success(modViewD);
            ImpressionFty.collectOSReport($scope.query).success(summarizingD);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingD = function (response) {
            if (!response) return;
            $scope.summarizing = response.items;
        };

        ImpressionFty.osReport($scope.query).success(modViewD);
        ImpressionFty.collectOSReport($scope.query).success(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ImpressionFty.osReport($scope.query).success(modViewD);
            ImpressionFty.collectOSReport($scope.query).success(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff5', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                $scope.query.pageIndex = 1;
                ImpressionFty.osReport($scope.query).success(modViewD);
                ImpressionFty.collectOSReport($scope.query).success(summarizingD);
            }
        });

        //导出报表
        var derive = '/channelReport/exportOSReport.htm';
        $scope.export = function () {
            var array = ["操作系统", "频道", "媒体", "印象数"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            osName: true,
            channelName: true,
            mediaName: true,
            pv: true
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }
]);

//浏览器
app.controller('impressionBowCtrl', ["$scope", "ImpressionFty", "ResAdvertisingFty", "$q", "ResChannelFty",
    function ($scope, ImpressionFty, ResAdvertisingFty, $q, ResChannelFty) {
        $scope.query = {pageSize: 10,pageIndex: 1}
        //获取媒体下拉
        var downListForSearch = ResAdvertisingFty.downListForSearch().success(function (response) {
            $scope.mediaListSel.list = response.mediaList;
        });

        $scope.mediaListSel = {
            callback: function (event, data) {
                $scope.channelListSel.$destroy();
                if(!data){return};
                ResChannelFty.getChannelsByMedia({mediaId: data.id}).success(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        }

        $scope.channelListSel = {}
        //下拉框统一回调
        $scope.$on('impression-bow',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ImpressionFty.browserReport($scope.query).success(modViewD);
            ImpressionFty.collectBrowserReport($scope.query).success(summarizingD);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingD = function (response) {
            if (!response) return;
            $scope.summarizing = response.items;
        };

        ImpressionFty.browserReport($scope.query).success(modViewD);
        ImpressionFty.collectBrowserReport($scope.query).success(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ImpressionFty.browserReport($scope.query).success(modViewD);
            ImpressionFty.collectBrowserReport($scope.query).success(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff6', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                $scope.query.pageIndex = 1;
                ImpressionFty.browserReport($scope.query).success(modViewD);
                ImpressionFty.collectBrowserReport($scope.query).success(summarizingD);
            }
        });

        //导出报表
        var derive = '/channelReport/exportBrowserReport.htm';
        $scope.export = function () {
            var array = ["浏览器", "频道", "媒体", "印象数"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            browserName: true,
            channelName: true,
            mediaName: true,
            pv: true
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }
]);


//国家
app.controller('impressionChinaCtrl', ["$scope", "ImpressionFty", "ResAdvertisingFty", "$q", "ResChannelFty",
    function ($scope, ImpressionFty, ResAdvertisingFty, $q, ResChannelFty) {
        $scope.query = {pageSize: 10,pageIndex: 1}
        //获取媒体下拉
        var downListForSearch = ResAdvertisingFty.downListForSearch().success(function (response) {
            $scope.mediaListSel.list = response.mediaList;
        });

        $scope.mediaListSel = {
            callback: function (event, data) {
                $scope.channelListSel.$destroy();
                if(!data){return};
                ResChannelFty.getChannelsByMedia({mediaId: data.id}).success(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        }

        $scope.channelListSel = {}
        //下拉框统一回调
        $scope.$on('impression-china',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ImpressionFty.countryReport($scope.query).success(modViewD);
            ImpressionFty.collectCountryReport($scope.query).success(summarizingD);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingD = function (response) {
            if (!response) return;
            $scope.summarizing = response.items;
        };

        ImpressionFty.countryReport($scope.query).success(modViewD);
        ImpressionFty.collectCountryReport($scope.query).success(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ImpressionFty.countryReport($scope.query).success(modViewD);
            ImpressionFty.collectCountryReport($scope.query).success(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff7', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                $scope.query.pageIndex = 1;
                ImpressionFty.countryReport($scope.query).success(modViewD);
                ImpressionFty.collectCountryReport($scope.query).success(summarizingD);
            }
        });

        //导出报表
        var derive = '/channelReport/exportCountryReport.htm';
        $scope.export = function () {
            var array = ["国家", "频道", "媒体", "印象数"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            countryName: true,
            channelName: true,
            mediaName: true,
            pv: true
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }
]);

//城市
app.controller('impressionCityCtrl', ["$scope", "ImpressionFty", "ResAdvertisingFty", "$q", "ResChannelFty",
    function ($scope, ImpressionFty, ResAdvertisingFty, $q, ResChannelFty) {
        $scope.query = {pageSize: 10,pageIndex: 1}
        //获取媒体下拉
        var downListForSearch = ResAdvertisingFty.downListForSearch().success(function (response) {
            $scope.mediaListSel.list = response.mediaList;
        });

        $scope.mediaListSel = {
            callback: function (event, data) {
                $scope.channelListSel.$destroy();
                if(!data){return};
                ResChannelFty.getChannelsByMedia({mediaId: data.id}).success(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        }

        $scope.channelListSel = {}
        //下拉框统一回调
        $scope.$on('impression-city',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ImpressionFty.cityReport($scope.query).success(modViewD);
            ImpressionFty.collectCityReport($scope.query).success(summarizingD);
        })

        ycui.loading.show();
        var pageSize = 10;
        var modViewD = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //汇总
        var summarizingD = function (response) {
            if (!response) return;
            $scope.summarizing = response.items;
        };

        ImpressionFty.cityReport($scope.query).success(modViewD);
        ImpressionFty.collectCityReport($scope.query).success(summarizingD);

        //搜索框
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            ImpressionFty.cityReport($scope.query).success(modViewD);
            ImpressionFty.collectCityReport($scope.query).success(summarizingD);
        };

        //日历查询
        var dateRange = new pickerDateRange('clientAff8', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: getDateFormat(),
            endDate: getDateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                $scope.query.pageIndex = 1;
                ImpressionFty.cityReport($scope.query).success(modViewD);
                ImpressionFty.collectCityReport($scope.query).success(summarizingD);
            }
        });

         $scope.$watch('forCityBo', function (newValue) {
             if(newValue == true){
                $scope.query.paramInt3 = 1;
                $scope.placeholder = '请输入省、市名称';
             }else{
                 $scope.query.paramInt3 = 0;
                 $scope.placeholder = '请输入省名称';
             }
             $scope.$emit('impression-city');
         })

        //导出报表
        var derive = '/channelReport/exportCountryReport.htm';
        $scope.export = function () {
            var array = ["城市/省", "频道", "媒体", "印象数"];
            exportFun(array, $scope.clientCustom);
            var body = toBodyString($scope.query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.clientCustom = {
            provinceName:true,
            cityName: true,
            channelName: true,
            mediaName: true,
            pv: true
        };
        $scope.clientCustomFun = function (bo) {
            $scope.clientCustomShow = bo;
        }
    }
]);
