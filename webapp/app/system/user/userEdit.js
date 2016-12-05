/**
 * Created by moka on 16-6-16.
 */
app.controller("userEditCtrl", ['$scope', '$http', 'SysUserFty','$q',
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
            disabled:true
        };

        var id = getSearch("id");

        $scope.userMode = {};
        $scope.user = {};

        ycui.loading.show();
        var getEditUserInfo = SysUserFty.getEditUserInfo({id:id}).success(function (response) {
            ycui.loading.hide();
            $scope.userMode = response;
            $scope.user.logName = response.logName;
            $scope.user.id = response.id;
        });

        $q.all([getEditUserInfo]).then(function () {
            var roleListByCom = SysUserFty.roleListByCom({id:$scope.userMode.companyId}).success(function (res) {
                if(res && res.code == 200){
                    res.roleList.forEach(function (data) {
                        $scope.userMode.roleList.map(function (da) {
                            if(da && data && da.id == data.id){
                                data.check = true;
                            }
                            return da
                        });
                    });
                    $scope.roleList = res.roleList;
                }
            });

            var depAndUserList = SysUserFty.depAndUserList({companyId: $scope.userMode.companyId}).success(function (response) {
                $scope.departmentListSel.list = response.departmentList;
                $scope.userListSel.list = response.userList;
            })
        });

        $scope.initialize = function () {
            ycui.confirm({
                title:'密码初始化',
                content:'请确认是否初始化密码，初始化后当前密码将会失效',
                timeout:-1,
                okclick:function () {
                    SysUserFty.initPwd({id:$scope.userMode.id,logName:$scope.userMode.logName}).success(function (res) {
                        if(res && res.code == 200){
                            ycui.alert({
                                content:res.msg + '<br> 提示:密码为用户名+当前年份!',
                                timeout:10
                            })
                        }
                    })
                }
            })
        };


        $scope.postEdit = function () {

            var body = angular.copy($scope.userMode);
            body.roleIds = [];
            $scope.roleList && $scope.roleList.forEach(function (data) {
                if(data.check){
                    body.roleIds.push(data.id);
                }
            });

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

            var query = {
                id:body.id,
                logName:body.logName,
                trueName:body.trueName,
                email:body.email,
                companyId:body.companyId,
                agencyNumber:body.agencyNumber,
                phone:body.phone,
                telephone:body.telephone,
                remark:body.remark,
                roleIds:body.roleIds,
                state:body.state,
                leaderId:body.leaderId,
                agencyNames:body.agencyNames
            };
            ycui.loading.show();
            SysUserFty.userEdit(query).success(function (response) {
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
            })
        };

        $(".form").validate({
            rules: {
                loginName: "required",
                passWord: {
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
                loginName: '请输入名字',
                passWord: {
                    required: '请输入所属公司'
                },
                userName: '请输入名字'
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });

        $scope.highBox = function () {
            $scope.user.oldPassword = '';
            $scope.user.newPassword = '';
            $scope.user.okPassword = '';
            $scope.validation = function(){
                $scope.user.oldPassword && SysUserFty.validPwd({id:$scope.user.id,logPwd:md5($scope.user.oldPassword)}).success(function(res){
                    if(res && res.code == 200){
                        $scope.validaMsgBo = false;
                    }else{
                        $scope.validaMsgBo = true;
                        $scope.validaMsgStr = res.msg;
                    }
                })
            };

            $scope.$watch('user.newPassword+user.okPassword',function () {
                if($scope.user.newPassword == $scope.user.okPassword){
                    $scope.validaMsgStr = '';
                    $scope.validaMsgBo = false;
                }
            });

            $scope.userEditPsdModule = {
                title:'修改密码',
                okClick:function(){
                    if(!$scope.validaMsgBo){
                        if (
                            $scope.user &&
                            ($scope.user.newPassword.length >= 6 &&
                            $scope.user.okPassword.length >= 6) &&
                            ($scope.user.newPassword == $scope.user.okPassword)) {
                            var body = {
                                id: $scope.user.id,
                                logPwd: md5($scope.user.oldPassword),
                                newLogPwd: md5($scope.user.newPassword)
                            }
                            ycui.loading.show();
                            SysUserFty.updatePwd(body).success(function(res){
                                ycui.loading.hide();
                                if(res && res.code == 200){
                                    $scope.validaMsgStr = '';
                                    $scope.validaMsgBo = false;
                                    setTimeout(function () {
                                        ycui.alert({
                                            content:res.msg,
                                            timeout:10
                                        })
                                    }, 500)
                                }
                            })
                        }else{
                            if($scope.user.newPassword != $scope.user.okPassword){
                                $scope.validaMsgStr = '两次密码输入不一致！';
                            }else{
                                $scope.validaMsgStr = '密码至少6字符';
                            }
                            $scope.validaMsgBo = true;
                            return true;
                        }
                    }else{
                        return true;
                    }
                },
                noClick:function(){
                    $scope.validaMsgBo = false;
                    $scope.validaMsgStr = '';
                }
            }
        }

    }]);
