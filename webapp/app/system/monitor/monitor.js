/**
 * Created by moka on 16-9-12.
 */
app.controller('MonitorManageCtrl',['$scope','SysMonitorFty',function ($scope,SysMonitorFty) {
    ycui.loading.show();
    $scope.query = {
        pageSize:10,
        pageIndex:1
    };
    var modView = function (response) {
        ycui.loading.hide();
        if (!response) return;
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;
    };

    SysMonitorFty.monitorList($scope.query).success(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search
        SysMonitorFty.monitorList($scope.query).success(modView);
    };

    $scope.delete = function (id, name) {
        ycui.confirm({
            title:name,
            content:'是否删除此监控类型？',
            timeout:-1,
            okclick:function () {
                SysMonitorFty.monitorDel({id:id}).success(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:-1,
                            okclick:function () {
                                SysMonitorFty.monitorList($scope.query).success(modView);
                            }
                        })
                    }
                })
            }
        })
    }

    $scope.enable = function (id,state) {
        ycui.confirm({
            title:'监控类型开/关',
            content:'确定要'+ (state == -1?'开':'关') +'此监控类型?',
            okclick:function () {
                SysMonitorFty.monitorState({id:id,state:~state}).success(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:10,
                            okclick:function () {
                                SysMonitorFty.monitorList($scope.query).success(modView);
                            }
                        })
                    }
                })
            }
        })
    }

}]);

app.controller('MonitorInfoCtrl',['$scope','SysMonitorFty',function ($scope,SysMonitorFty) {
    console.info('system');
    $scope.monitorStateSel = {
        list:[
            {name:'全部'},
            {name:'正常',id:'1'},
            {name:'异常',id:'0'}
        ],
        callback:function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            SysMonitorFty.monitorDetailsList($scope.query).success(modView);
        }
    }

    ycui.loading.show();
    $scope.query = {
        pageSize:10,
        pageIndex:1
    };
    var modView = function (response) {
        ycui.loading.hide();
        if (!response) return;
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;
    };

    SysMonitorFty.monitorDetailsList($scope.query).success(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search
        SysMonitorFty.monitorDetailsList($scope.query).success(modView);
    };
}]);

app.controller('MonitorAddCtrl',['$scope','SysMonitorFty',function ($scope,SysMonitorFty) {
    
    $scope.monitor = {
        monitorSwitch:1,
        monitorCondition:1,
        monitorUrlType:1
    };

    $scope.postEdit = function () {
        $scope.validShow = true;

        if(!$(".form").valid()){
            return;
        }
        ycui.loading.show();
        SysMonitorFty.monitorAdd($scope.monitor).success(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewMonitor');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            monitorName: "required",
            monitorUrl:{
                required:true
            },
            monitorMark: "required"
        },
        messages: {
            monitorName: "请输入监控名称",
            monitorUrl:{
                required:'请输入接口地址'
            },
            monitorMark:'请输入标示'
        },
        errorClass: "error-span",
        errorElement: "span"
    })
}])

app.controller('MonitorEditCtrl',['$scope','SysMonitorFty',function ($scope,SysMonitorFty) {
    var id = getSearch('id');
    SysMonitorFty.getMonitor({id:id}).success(function (res) {
        if(res && res.code == 200){
            $scope.monitor = res.items;
        }
    });

    $scope.postEdit = function () {
        $scope.validShow = true;

        if(!$(".form").valid()){
            return;
        }
        delete $scope.monitor.updateTime;
        ycui.loading.show();
        SysMonitorFty.monitorUpdate($scope.monitor).success(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewMonitor');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            monitorName: "required",
            monitorUrl:{
                required:true
            }
        },
        messages: {
            monitorName: "请输入监控名称",
            monitorUrl:{
                required:'请输入接口地址'
            }
        },
        errorClass: "error-span",
        errorElement: "span"
    })
}]);

app.filter('monitorType',function () {
    return function (input) {
        switch (+input){
            case 1:
                return 'http请求正常';
            case 2:
                return '标示';
            case 3:
                return '值';
            case 4:
                return '其他';
            default:
                return
        }
    }
})