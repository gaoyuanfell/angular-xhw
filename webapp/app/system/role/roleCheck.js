/**
 * Created by moka on 16-6-16.
 */
app.controller("roleCheckCtrl", ['$scope', '$http','SysRuleUserFty','SysRoleFty',
    function ($scope, $http,SysRuleUserFty,SysRoleFty) {
        setTimeout(function () {
            $("input").attr("disabled", "disabled");
        }, 200);
        
        $scope.role = {};
        var id = getSearch("id");
        ycui.loading.show();
        SysRoleFty.getRole({id:id}).then(function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.role = response;
            SysRuleUserFty.levelsRights().then(function (res) {
                if(res){
                    var array = changeRuleDate(res);
                    $scope.getAreaids = ycui.createAreas(array, $scope.role.roleCluster, '#areasList', 1);
                }
            });
        });
        
        $scope.backToRole = function () {
            location.replace("roleManage.html")
        };

        function changeRuleDate(arr) {
            var array = [];
            for (var key in arr) {
                var ob = arr[key];
                var ar = [];
                ob.forEach(function (data) {
                    var a = [];
                    if (data.childRight instanceof Array) {
                        data.childRight.forEach(function (da) {
                            a.push({
                                childId: da.id,
                                childName: da.rightName,
                                verify: da.verify
                            })
                        })
                    }
                    ar.push({
                        parentId: data.id,
                        parentName: data.rightName,
                        verify: data.verify,
                        childList: a
                    })
                });
                switch (key) {
                    case 'AdOrder':
                        array.push({
                            areaName: "广告订单",
                            areaId: 1,
                            parentList: ar
                        });
                        break;
                    case 'ResourceManage':
                        array.push({
                            areaName: "资源管理",
                            areaId: 2,
                            parentList: ar
                        });
                        break;
                    case 'CustomerManage':
                        array.push({
                            areaName: "客户管理",
                            areaId: 3,
                            parentList: ar
                        });
                        break;
                    case 'DataReport':
                        array.push({
                            areaName: "数据报表",
                            areaId: 4,
                            parentList: ar
                        });
                        break;
                    case 'SystemSet':
                        array.push({
                            areaName: "系统设置",
                            areaId: 5,
                            parentList: ar
                        });
                        break;
                }
            }
            return array;
        }
    }]);