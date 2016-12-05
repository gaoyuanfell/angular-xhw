/**
 * Created by moka on 16-9-7.
 */
app.controller('processListCtrl', ['$scope', '$http','FlowFty', function ($scope, $http,FlowFty) {

    $scope.processListSel = {
        callback:function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            FlowFty.flowList($scope.query).success(modViewA);
        }
    }

    FlowFty.flowTemplates().success(function (res) {
        if(res && res.code == 200){
            $scope.processListSel.list = res.templates;
        }
    })

    ycui.loading.show();
    var modViewA = function (response) {
        ycui.loading.hide();
        if (!response) {return}
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;
    };
    $scope.query = {pageSize: 10, pageIndex: 1};

    FlowFty.flowList($scope.query).success(modViewA);

    $scope.redirect = function (num,co) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search;;
        FlowFty.flowList($scope.query).success(modViewA);
    };

}]);


app.controller('processEditCtrl', ['$scope', '$q','SysUserFty','FlowFty', function ($scope, $q ,SysUserFty,FlowFty) {

    var id = getSearch('id');
    var name = getSearch('name');

    $scope.flowTemplateSel = {
        callback:flowTemplateBack
    }

    function flowTemplateBack(e,d,list,index){
        console.info(d);
        FlowFty.flows({checkResourceType:d.checkResourceType}).success(flowsFun)
    }

    FlowFty.flowTemplates().success(function (res) {
        if(res && res.code == 200){
            $scope.flowTemplateSel.list = res.templates;
        }
    });

    var roleListAll = SysUserFty.roleListAll().success(function (res) {
        if(res && res.code == 200){
            $scope.roleList = res.roleList
        }
    });

    $q.all([roleListAll]).then(function () {
        if(id && name){
            $scope.name = name;
            $scope.id = id;
            $scope.query.checkResourceType = id;
            FlowFty.flows({checkResourceType:id}).success(flowsFun)
        }
    })

    // $scope.$on('loginUserInfo',function (e,d) {
    //     var roleListByCom = SysUserFty.roleListByCom({id:d.companyId}).success(function (res) {
    //         if(res && res.code == 200){
    //             $scope.roleList = res.roleList;
    //         }
    //     });
    //
    //
    //
    // })


    function flowsFun(res) {
        if(res && res.code == 200){
            var flows = res.flows;
            var s = flows.map(function(da){
                var roleList = angular.copy($scope.roleList);
                var checkRoles = da.checkRoles;
                for(var i = 0;i<checkRoles.length;i++){
                    for(var j = 0;j<roleList.length;j++){
                        if(checkRoles[i].id == roleList[j].id){
                            roleList.splice(j,1);
                            j--;
                        }
                    }
                }
                da.processListSel = {
                    list: roleList,
                    callback:function(e,d,list,index){
                        if(!d){return};
                        list.splice(index,1);
                        da.checkRoles.push(d);
                    }
                };
                return da;
            });
            $scope.processList = s;
        }
    }

    // $q.all([loginUserInfo]).then(function (e,d) {
    //     console.info(d);
    // });
    //
    // var roleListByCom = SysUserFty.roleListByCom({id:3}).success(function (res) {
    //     if(res && res.code == 200){
    //         $scope.roleList = res.roleList;
    //     }
    // });
    //
    // $q.all([roleListByCom]).then(function(){
    //     FlowFty.flowTemplates().success(function (res) {
    //         if(res && res.code == 200){
    //             $scope.flowTemplateSel.list = res.templates;
    //         }
    //     })
    // })

    $scope.query = {};

    $scope.addContact = function (index) {
        var _bo = {
            checkRoles:[],
            processListSel:{
                list:angular.copy($scope.roleList),
                callback:function(e,d,list,index){
                    if(!d){return};
                    list.splice(index,1);
                    _bo.checkRoles.push(d);
                }
            }
        }
        $scope.processList.splice(index+1, 0, _bo);
    };

    $scope.removeContact = function (index) {
        $scope.processList && $scope.processList.length > 1 && ($scope.processList.splice(index, 1))
    };

    $scope.recoveryContact = function(process,index){
        process.processListSel.list.push(process.checkRoles.splice(index,1)[0]);
    }

    $scope.switchingPosition = function (inx, index) {
        if (inx == 0 && index < 0) {
            return
        }
        if (inx == $scope.processList.length - 1 && index == 1) {
            return
        }
        var form = $scope.processList[inx];
        var to = $scope.processList[inx + index];
        $scope.processList.splice(inx, 1, to);
        $scope.processList.splice(inx + index, 1, form);
    }

    $scope.postEdit = function () {
        var rep = angular.copy($scope.processList);
        $scope.$valid = true;

        if(!rep){return;}
        var body = {
            checkResourceType:$scope.query.checkResourceType
        };
        var bo = false;
        rep.forEach(function (da,index) {
            delete da.processListSel;
            delete da.updateTime;
            delete da.createTime;
            var s = da.checkRoles.map(function (da) {
                return da.id;
            });
            if(s.length == 0){bo = true}
            da.checkStep = ++index;
            da.checkRoleIds = s.join(',')
            delete da.checkRoles;
        });
        body.checkFlows = rep;
        if(bo)return;
        ycui.loading.show();
        FlowFty.flowsEdit(body).success(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    timeout:-1,
                    okclick:function () {
                        goRoute('ViewAuditProcess')
                    }
                });
            }
        });
    }

}])