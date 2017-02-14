/**
 * Created by moka on 16-8-5.
 */
app.controller('contractSyncCtrl',['$scope','DataSyncFty',function ($scope,DataSyncFty) {
    $scope.contractSync = function () {
        ycui.loading.show();
        DataSyncFty.getContract().then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    title:'合同同步',
                    content:'同步成功',
                    timeout:-1
                })
            }
        });
    };

    ycui.loading.show();
    var modView = function (response) {
        ycui.loading.hide();
        if(!response) return;
        $scope.page_size = response.page_size;
        $scope.prev_page = response.prev_page;
        $scope.total_page = response.total_page;
        $scope.items = response.items;
        $scope.page = response.page;
        $scope.total_count = response.total_count;
    };

    $scope.query = {pageSize:10,startTime:getDateFormat(),endDate:getDateFormat(),pageIndex:1,paramInt1:0};

    DataSyncFty.listSynLogs($scope.query).then(modView);

    new pickerDateRange('calendar-contract', {
        defaultText: ' / ',
        isSingleDay: false,
        stopToday: false,
        calendars: 2,
        startDate: getDateFormat(),
        endDate: getDateFormat(),
        success: function (obj) {
            $scope.query.pageIndex = 1;
            $scope.query.startTime = obj.startDate;
            $scope.query.endDate = obj.endDate;
            DataSyncFty.listSynLogs($scope.query).then(modView);
        }
    });
}]);

app.controller('incomePushCtrl',['$scope','DataSyncFty',function ($scope,DataSyncFty) {
    $scope.incomePush = function () {
        ycui.loading.show();
        DataSyncFty.pushContractMoney().then(function (res) {
            if(res && res.code == 200){
                ycui.alert({
                    title:'推送金额',
                    content:'推送成功',
                    timeout:-1
                })
            }
        });
    };

    ycui.loading.show();
    var modView = function (response) {
        ycui.loading.hide();
        if(!response) return;
        $scope.page_size = response.page_size;
        $scope.prev_page = response.prev_page;
        $scope.total_page = response.total_page;
        $scope.items = response.items;
        $scope.page = response.page;
        $scope.total_count = response.total_count;
    };

    $scope.query = {pageSize:10,startTime:getDateFormat(),endDate:getDateFormat(),pageIndex:1,paramInt1:1};

    DataSyncFty.listSynLogs($scope.query).then(modView);
    
    new pickerDateRange('calendar-income', {
        defaultText: ' / ',
        isSingleDay: false,
        stopToday: false,
        calendars: 2,
        startDate: getDateFormat(),
        endDate: getDateFormat(),
        success: function (obj) {
            $scope.query.pageIndex = 1;
            $scope.query.startTime = obj.startDate;
            $scope.query.endDate = obj.endDate;
            DataSyncFty.listSynLogs($scope.query).then(modView);
        }
    });
}]);