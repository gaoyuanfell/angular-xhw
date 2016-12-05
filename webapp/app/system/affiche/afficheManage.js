/**
 * Created by moka on 16-6-16.
 */
app.controller('afficheManageCtrl', ['$scope', '$http', 'SysNoticeFty',
    function ($scope, $http, SysNoticeFty) {
        ycui.loading.show();
        var pageSize = 10;
        modView = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize:10,pageIndex:1};

        var endTime = new Date().dateFormat() + " 23:59:59";
        var startTime = new Date().calendar(1, -7).dateFormat() + " 00:00:00";
        $scope.query.endTime = endTime;
        $scope.query.startTime = startTime;

        SysNoticeFty.noticeList($scope.query).success(modView);
        $scope.ruleId = getSearch("ruleId");
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.searchConext = $scope.query.search;
            SysNoticeFty.noticeList($scope.query).success(modView);
        };
        $scope.delete = function (id) {
            ycui.confirm({
                content: "您确定要删除么",
                okclick: function () {
                    SysNoticeFty.removeNotice({id: id}).success(function (response) {
                        if (!response) return;
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                SysNoticeFty.noticeList($scope.query).success(modView);
                            }
                        });
                    })
                }
            })
        };

        var dateRange = new pickerDateRange('dateRangeAff', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: new Date().calendar(1, -7).dateFormat(),
            endDate: new Date().dateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                $scope.query.startTime = obj.startDate + " 00:00:00";
                $scope.query.endTime = obj.endDate + " 23:59:59";
                SysNoticeFty.noticeList($scope.query).success(modView);
            }
        });
        
        $scope.changeState = function (id,state) {
            SysNoticeFty.enableNotice({id:id,state:~state}).success(function (res) {
                if(res && res.code == 200){
                    SysNoticeFty.noticeList($scope.query).success(modView);
                }
            })
        }
    }]);