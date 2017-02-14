/**
 * Created by moka on 16-6-16.
 */
app.controller('errorLogCtrl', ['$scope', '$http', 'SysLogFty', function ($scope, $http, SysLogFty) {
    ycui.loading.show();
    var pageSize = 10,
        modView = function (response) {
            if(!response) return;
            $scope.page_size = response.page_size;
            $scope.prev_page = response.prev_page;
            $scope.total_page = response.total_page;
            $scope.errorLogs = response.items;
            $scope.page = response.page;
            $scope.total_count = response.total_count;
            ycui.loading.hide();
        };

   $scope.query = {pageSize:pageSize,pageIndex:1};

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.descr = $scope.query.search;
        SysLogFty.errorLogList($scope.query).then(modView);
    };
    function getLastDate(currentDate, day) {
        var dd = new Date();
        dd.setDate(currentDate.getDate()+day);
        return dd.dateFormat();
    }
    var dateRange = new pickerDateRange('dateRangeError', {
        defaultText: ' / ',
        isSingleDay: false,
        stopToday: false,
        calendars: 2,
        startDate: getLastDate(new Date(), -6),
        endDate: getDateFormat(),
        inputTrigger: 'dateRange',
        success: function (obj) {
            $('#dateRange').val(obj.startDate);
            $scope.query.startTime = obj.startDate;
            $scope.query.endTime = obj.endDate;
            $scope.redirect(1);
        }
    });
    $scope.query.startTime = dateRange.mOpts.startDate;
    $scope.query.endTime = dateRange.mOpts.endDate;
    $scope.redirect(1);
}]);