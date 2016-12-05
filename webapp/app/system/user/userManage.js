/**
 * Created by moka on 16-6-16.
 */
app.controller('userManageCtrl', ['$scope', '$http', 'SysUserFty', '$q',
    function ($scope, $http, SysUserFty, $q) {
        var pageSize = 10;
        $scope.userStateSel = {
            list:[
                {name:'全部'},
                {name:'启用',id:'0'},
                {name:'禁用',id:'-1'},
            ]
        }
        $scope.departmentListSel = {};
        $scope.companyListSel = {
            callback:function(e,d){
                $scope.departmentListSel.$destroy();
                if(d){
                    SysUserFty.depAndUserList({ companyId: d.id }).success(function (response) {
                        $scope.departmentListSel.list = response.departmentList;
                    });
                }
            },
            sessionBack:function(d){
                if(d){
                    var key = this.key.split(',')[0];
                    SysUserFty.depAndUserList({ companyId: d[key] }).success(function (response) {
                        $scope.departmentListSel.list = response.departmentList;
                    });
                }
            }
        };
        $scope.roleListSel = {};
        var paramListForSearch = SysUserFty.paramListForSearch().success(function (response) {
            if (response && response.code == 200) {
                $scope.companyListSel.list = response.companyList;
                $scope.roleListSel.list = response.roleList;
            }
        })

        $scope.query = {pageSize: pageSize,pageIndex:1};

        $scope.$on('sys-user',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            SysUserFty.userList($scope.query).success(modView);
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

        SysUserFty.userList( $scope.query ).success(modView);

        // $scope.ruleId = getSearch("ruleId");

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.logNameOrTrueName = $scope.query.search;
            SysUserFty.userList($scope.query).success(modView);
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
                    reStartAddDel.success(function(res){
                        if(res && res.code){
                            ycui.alert({
                                content:res.msg,
                                timeout:10
                            })
                            SysUserFty.userList($scope.query).success(modView);
                        }
                    })
                }
            })

        }

        // ycui.select(".yc-select", function (valueId) {
        //     var arr = valueId.attr("data-value").split(":");
        //     var stringId = arr[0];
        //     var numId = arr[1];
        //     switch (stringId) {

        //         case "ro":
        //             $scope.roleId = numId == -1 ? "" : numId;
        //             break;

        //         case "de":
        //             $scope.departmentId = numId == -1 ? "" : numId;
        //             break;

        //         case "cn":
        //             $scope.companyId = numId == -1 ? 0 : numId;
        //             SysUserFty.depAndUserList({ companyId: numId }).success(function (response) {
        //                 $scope.departmentList = response.departmentList;

        //                 $scope.departmentListFitter = angular.copy(response.departmentList);
        //             });
        //             break;
        //     }
        //     var query = { pageSize: pageSize, pageIndex: 1 };
        //     $scope.search && (query.logNameOrTrueName = $scope.search);
        //     $scope.roleId && (query.searchRole = $scope.roleId);
        //     $scope.departmentId && (query.searchDepartment = $scope.departmentId);
        //     $scope.companyId && (query.searchCompany = $scope.companyId);
        //     SysUserFty.userList(query).success(modView);
        // })

        /*搜索过滤*/
        // $q.all([paramListForSearch]).then(function () {
        //     var roleListFitter = $scope.roleList;
        //     $scope.fitterSelectR = function (fitter) {
        //         var array = [];
        //         if ($scope.fitterR) {
        //             roleListFitter.forEach(function (data) {
        //                 if (data[fitter].indexOf($scope.fitterR) != -1) {
        //                     array.push(data);
        //                 }
        //             });
        //             $scope.roleList = array;
        //         } else {
        //             $scope.roleList = roleListFitter;
        //         }
        //     };

        //     var companyListFitter = $scope.companyList;
        //     $scope.fitterSelectM = function (fitter) {
        //         var array = [];
        //         if ($scope.fitterM) {
        //             companyListFitter.forEach(function (data) {
        //                 if (data[fitter].indexOf($scope.fitterM) != -1) {
        //                     array.push(data);
        //                 }
        //             });
        //             $scope.companyList = array;
        //         } else {
        //             $scope.companyList = companyListFitter;
        //         }
        //     };

        //     $scope.fitterSelect2 = function (fitter) {
        //         function concatList(array, _array) {
        //             if (!_array) {
        //                 _array = [];
        //             }
        //             if (array instanceof Array) {
        //                 for (var i = 0, j = array.length; i < j; i++) {
        //                     if (array[i].nextDepts instanceof Array && array[i].nextDepts.length > 0) {
        //                         concatList(array[i].nextDepts, _array)
        //                     }
        //                     delete array[i].nextDepts;
        //                     _array.push(array[i]);
        //                 }
        //             }
        //             return _array;
        //         }
        //         var _array = concatList(angular.copy($scope.departmentListFitter));

        //         var array = [];
        //         if ($scope.fitterM2) {
        //             _array.forEach(function (data) {
        //                 if (data[fitter].indexOf($scope.fitterM2) != -1) {
        //                     array.push(data);
        //                 }
        //             });
        //             $scope.departmentList = array;
        //         } else {
        //             $scope.departmentList = $scope.departmentListFitter;
        //         }
        //     };


        // });
    }]);