/**
 * Created by moka on 16-6-16.
 */
app.controller("roleAddCtrl", ['$scope', '$http', 'SysRuleUserFty','SysRoleFty',
    function ($scope, $http, SysRuleUserFty,SysRoleFty) {
        ycui.loading.show();
        SysRuleUserFty.levelsRights().then(function (res) {
            ycui.loading.hide();
            if(res){
                var array = changeRuleDate(res);
                $scope.getAreaids = ycui.createAreas(array, [], '#areasList', 1);
            }
        });

        $scope.role = {type:1};

        $scope.postEdit = function () {
            var roleClusterId = $scope.getAreaids();
            var bo = $(".form").valid();
            if (roleClusterId.length == 0) {
                ycui.alert({
                    content: "角色权限必须勾选"
                })
                return;
            }
            if(!bo)return;
            ycui.loading.show();
            var body = $scope.role;
            body.roleCluster = roleClusterId.join(",");
            SysRoleFty.addRole(body).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewRole');
                        },
                        timeout: 10
                    })
                }
            })
        };
        
        function changeRuleDate(arr) {
            var array = [];
            for(var key in arr){
                var ob = arr[key];
                var ar = [];
                ob.forEach(function (data) {
                    var a = [];
                    if(data.childRight instanceof Array){
                        data.childRight.forEach(function (da) {
                            a.push({
                                childId:da.id,
                                childName:da.rightName,
                                verify:da.verify
                            })
                        })
                    }
                    ar.push({
                        parentId:data.id,
                        parentName:data.rightName,
                        verify:data.verify,
                        childList:a
                    })
                });
                switch (key){
                    case 'AdOrder':
                        array.push({
                            areaName:"广告订单",
                            areaId:1,
                            parentList:ar
                        });
                        break;
                    case 'ResourceManage':
                        array.push({
                            areaName:"资源管理",
                            areaId:2,
                            parentList:ar
                        });
                        break;
                    case 'CustomerManage':
                        array.push({
                            areaName:"客户管理",
                            areaId:3,
                            parentList:ar
                        });
                        break;
                    case 'DataReport':
                        array.push({
                            areaName:"数据报表",
                            areaId:4,
                            parentList:ar
                        });
                        break;
                    case 'SystemSet':
                        array.push({
                            areaName:"系统设置",
                            areaId:5,
                            parentList:ar
                        });
                        break;
                }
            }
            return array;
        }

        

        $(".form").validate({
            rules: {
                myRole: "required"
            },
            messages: {
                myRole: "请输入角色名称"
            },
            errorClass: 'error-span',
            errorElement: 'span'
        })
    }]);