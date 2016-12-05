/**
 * Created by moka on 16-6-16.
 */
app.controller("userAddCtrl", ['$scope', '$http', 'SysUserFty','$q',
    function ($scope, $http, SysUserFty,$q) {
        $scope.userListSel = {};

        $scope.departmentListSel = {
            getName:function(obj,name){
                if(!name){
                    name = obj.departmentName
                }
                var _obj = obj.$$parent;
                if(_obj){
                    name = _obj.departmentName + '-' + name;
                    return this.getName(_obj,name);
                }
                return name;
            },
            callback:function(e,d){
                if(d){
                    $scope.userMode.agencyNames = this.getName(d);
                }
            }
        }
        $scope.companyListSel = {
            callback:function(e,d){
                $scope.departmentListSel.$destroy();
                $scope.userListSel.$destroy()
                var numId = d.id;
                ycui.loading.show();
                var roleListByCom = SysUserFty.roleListByCom({id:numId}).success(function (res) {
                    if(res && res.code == 200){
                        $scope.roleList = res.roleList;
                    }
                });
                var depAndUserList = SysUserFty.depAndUserList({companyId: numId}).success(function (response) {
                    $scope.departmentList = angular.copy(response.departmentList);
                    $scope.departmentListSel.list = response.departmentList;
                    $scope.userListSel.list = response.userList;
                })
                $q.all([roleListByCom,depAndUserList]).then(function(){
                    ycui.loading.hide();
                })
                delete $scope.userMode.agencyNumber;
                delete $scope.userMode.agencyNames;
                delete $scope.userMode.leaderId;
            }
        };
        var paramList = SysUserFty.paramList().success(function (response) {
            if (response && response.code == 200) {
                $scope.companyListSel.list = response.companyList;
            }
        });

        $scope.userMode = {roleIds:[]};
        $scope.userMode.state = 0;

        $scope.postEdit = function () {

            var body = angular.copy($scope.userMode);
            $scope.roleList && $scope.roleList.forEach(function (data) {
                if(data.check){
                    body.roleIds.push(data.id);
                }
            });

            if (body.logPwd != body.logPwd2) {
                ycui.alert({
                    content: "两次输入的密码不一样，请重新填写"
                });
                return
            }
            if (body.roleIds.length == 0) {
                $scope.roleIdBo = true;
                $scope.$watch('userMode.roleIds.length', function (newValue) {
                    if (newValue > 0) {
                        $scope.roleIdBo = false;
                    }
                });
                return
            }

            if (!body.companyId) {
                $scope.validShow = true;
                return
            }
            if (!body.agencyNumber) {
                $scope.validShow = true;
                return
            }

            if (!$(".form").valid()) {
                return
            }
            delete body.logPwd2;
            body.logPwd = md5(body.logPwd);
            ycui.loading.show();
            SysUserFty.userAdd(body).success(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewUser')
                        },
                        timeout: 10
                    });
                }
            });
        };
        $(".form").validate({
            rules: {
                loginName: "required",
                passWord: {
                    required: true
                },
                isPassWord: {
                    required: true
                },
                userName: "required",
                myPhone: {
                    phone: true
                },
                telephone:{
                    phone: true
                },
                myEmail: {
                    email: true
                }
            },
            messages: {
                loginName: '请输入用户名',
                passWord: {
                    required: '请输入6位及以上字符，区分大小写'
                },
                isPassWord: {
                    required: '请再次输入密码'
                },
                userName: '请输入姓名',
                myPhone: {

                },
                telephone:{

                }
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });

    }]);
