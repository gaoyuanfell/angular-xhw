/**
 * Created by moka on 16-6-16.
 */
app.controller('roleManageCtrl', ['$scope', '$http', 'SysRuleUserFty', 'SysRoleFty',
    function ($scope, $http, SysRuleUserFty,SysRoleFty) {
        ycui.loading.show();
        var pageSize = 10;
        var modView = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.companyTypeSel = {
            list:[
                {name:'总公司角色',id:1},
                {name:'分公司角色',id:2}
            ],
            callback:function () {
                SysRuleUserFty.listRole($scope.query).then(modView);
            }
        };

        $scope.disable = function (id, state,name) {
            var body = {id:id};
            if(state !== -1){
                ycui.confirm({
                    title:'【'+ name +'】禁用',
                    content:'请确认是否禁用该角色，禁用后将影响使用该角色的用户，请相应进行调整！',
                    okclick:function () {
                        body.state = -1;
                        SysRoleFty.enableRole(body).then(function (res) {
                            if(res && res.code == 200){
                                ycui.alert({
                                    content:res.msg,
                                    timeout:10
                                })
                                SysRuleUserFty.listRole($scope.query).then(modView);
                            }
                        })
                    }
                })
            }else{
                body.state = 0;
                SysRoleFty.enableRole(body).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:10
                        })
                        SysRuleUserFty.listRole($scope.query).then(modView);
                    }
                })
            }
        };

        $scope.query = {pageSize: pageSize,pageIndex:1};

        SysRuleUserFty.listRole($scope.query).then(modView);
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            SysRuleUserFty.listRole($scope.query).then(modView);
        };
}]);