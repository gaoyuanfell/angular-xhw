/**
 * Created by moka on 16-6-16.
 */
app.controller('operationLogCtrl', ['$scope', '$http', 'SysLogFty', function ($scope, $http, SysLogFty) {

    $scope.logTypeSel = {
        list:[
            {name:'新增',id:1},
            {name:'修改',id:2},
            {name:'删除',id:3},
            {name:'审批',id:4},
            {name:'禁用',id:5},
            {name:'登录',id:7},
            {name:'其他',id:6},
        ],
        callback:function(){
            $scope.redirect();
        }
    }

    ycui.loading.show();
    var pageSize = 10,
        modView = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.operationLogs = response.items;
            $scope.total_page = response.total_page;
        };

    var startTime = new Date().calendar(1,-6).dateFormat();
    var endTime = new Date().dateFormat();

    $scope.query = {pageSize:pageSize,pageIndex:1,startTime:startTime,endTime:endTime};

    SysLogFty.operationLogList($scope.query).then(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search;
        SysLogFty.operationLogList($scope.query).then(modView);
    };
    
    $scope.typeShow = function(type){
        var types = ["无", "新增", "修改", "删除", "审核", "禁用", "其他", "登录"];
        return types[type];
    };
    
    function getLastDate(currentDate, day) {
        var dd = new Date();
        dd.setDate(currentDate.getDate()+day);
        return dd.dateFormat();
    }
    var dateRange = new pickerDateRange('dateRangeOperate', {
        defaultText: ' / ',
        isSingleDay: false,
        stopToday: false,
        calendars: 2,
        startDate: startTime,
        endDate: endTime,
        success: function (obj) {
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            $scope.query.startTime = obj.startDate;
            $scope.query.endTime = obj.endDate;
            SysLogFty.operationLogList($scope.query).then(modView);
        }
    });
}]);