/**
 * Created by moka on 16-6-16.
 */
app.controller('userManageCtrl', ['$scope', '$http', 'SysUserFty', '$q',
    function ($scope, $http, SysUserFty, $q) {
        var pageSize = 10;
        $scope.userStateSel = {
            list:[
                {name:'启用',id:'0'},
                {name:'禁用',id:'-1'},
            ]
        }
        $scope.departmentListSel = {};
        $scope.companyListSel = {
            callback:function(e,d){
                $scope.departmentListSel.$destroy();
                if(d){
                    SysUserFty.depAndUserList({ companyId: d.id }).then(function (response) {
                        $scope.departmentListSel.list = response.departmentList;
                    });
                }
            },
            sessionBack:function(d){
                if(d){
                    var key = this.key.split(',')[0];
                    SysUserFty.depAndUserList({ companyId: d[key] }).then(function (response) {
                        $scope.departmentListSel.list = response.departmentList;
                    });
                }
            }
        };
        $scope.roleListSel = {};
        var paramListForSearch = SysUserFty.paramListForSearch().then(function (response) {
            if (response && response.code == 200) {
                $scope.companyListSel.list = response.companyList;
                $scope.roleListSel.list = response.roleList;
            }
        })

        $scope.query = {pageSize: pageSize,pageIndex:1};

        $scope.$on('sys-user',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            SysUserFty.userList($scope.query).then(modView);
        })

        ycui.loading.show();
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

        $scope.getRoleName = function(roleList){
            var str = '';
            if(roleList){
                roleList.forEach(function(ro,index){
                    str += ro.roleName + (index == (roleList.length - 1)?'':'、')
                })
            }
            return str;
        }

        SysUserFty.userList( $scope.query ).then(modView);

        // $scope.ruleId = getSearch("ruleId");

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.logNameOrTrueName = $scope.query.search;
            SysUserFty.userList($scope.query).then(modView);
        };

        //启用/禁用
        $scope.reStartAddDel = function (id, state,name) {
            var reStartAddDel;

            ycui.confirm({
                title: '【'+ name +'】' + (state == '-1'?'启用':'禁用'),
                content: '确认' + (state == '-1'?'启用':'禁用') + '此用户?',
                okclick: function () {
                    if (state == -1) {
                        reStartAddDel = SysUserFty.reStart({ id: id })
                    } else {
                        reStartAddDel = SysUserFty.delete({ id: id })
                    }
                    reStartAddDel.then(function(res){
                        if(res && res.code){
                            ycui.alert({
                                content:res.msg,
                                timeout:10
                            })
                            SysUserFty.userList($scope.query).then(modView);
                        }
                    })
                }
            })

        }
    }]);