/**
 * Created by moka on 16-6-16.
 */
app.controller("departmentAddCtrl", ['$scope', '$http', 'SysDepartmentFty', '$q',
    function ($scope, $http, SysDepartmentFty, $q) {
        $scope.parentDepSel = {};
        $scope.deListSel = {
            callback:function(e,d){
                if(d){
                    $scope.parentDepSel.$destroy()
                    SysDepartmentFty.parentDeps({companyId:d.id}).success(function(res){
                        if(res && res.code == 200){
                            $scope.parentDepSel.list = res.departmentList
                        }
                    })
                }
            }
        };
        
        var departmentListForDep = SysDepartmentFty.departmentListForDep().success(function (response) {
            $scope.deListSel.list = response.companyList;
        });

        $scope.postEdit = function () {
            $scope.validate = true;
            var pass = $(".form").valid()
            if ($scope.deListId == undefined) {
                pass = false
            }

            if (pass) {
                ycui.loading.show();
                SysDepartmentFty.departmentAdd({
                    departmentName: $scope.departmentName,
                    companyId: $scope.deListId,
                    parentDepId:$scope.parentDepId,
                    companyType:$scope.companyType
                }).success(function (response) {
                    ycui.loading.hide();
                    if (response && response.code == 200) {
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                goRoute('ViewDepartment')
                            },
                            timeout:10
                        });
                    }
                })
            }
        };

        //下拉框
        // ycui.select(".yc-select");

        /*表单验证*/
        $(".form").validate({
            rules: {
                departmentName: "required"
            },
            messages: {
                departmentName: '请输入部门名称'
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);