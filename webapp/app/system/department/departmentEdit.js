/**
 * Created by moka on 16-6-16.
 */
app.controller('departmentEditCtrl', ['$scope', '$http', 'SysDepartmentFty','$q',
    function ($scope, $http, SysDepartmentFty,$q) {
        var id = getSearch('id');
        ycui.loading.show();
        $scope.parentDepSel = {};
        $scope.deListSel = {
            // callback:function(e,d){
            //     if(d){
            //         $scope.parentDepSel.$destroy()
            //         SysDepartmentFty.parentDeps({companyId:d.id}).then(function(res){
            //             if(res && res.code == 200){
            //                 $scope.parentDepSel.list = res.departmentList
            //             }
            //         })
            //     }
            // }
        };
        // var departmentListForDep = SysDepartmentFty.departmentListForDep().then(function (response) {
        //     if (!response) return;
        //     $scope.deListSel.list = response.companyList;
        // });
        SysDepartmentFty.departmentEditInfo({id: id}).then(function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.id = response.id;
            $scope.deListId = response.companyId;
            $scope.companyName = response.companyName;
            $scope.departmentName = response.departmentName;
            $scope.companyType = response.companyType;
            $scope.parentDepId = response.parentDepId;
            $scope.parentDepName = response.parentDepName;
        });

        $scope.postEdit = function () {
            $scope.validate = true;
            var pass = $(".form").valid()
            if ($scope.deListId == undefined) {
                pass = false
            }
            if(!pass)return;
            ycui.loading.show();
            SysDepartmentFty.departmentEdit({
                id: $scope.id,
                departmentName: $scope.departmentName,
                companyId: $scope.deListId,
                companyType:$scope.companyType,
                parentDepId:$scope.parentDepId
            }).then(function (response) {
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
        };

        /*表单验证*/
        $(".form").validate({
            rules: {
                myText: "required"
            },
            messages: {
                myText: "请输入部门名称"
            },
            errorClass: 'error-span',
            errorElement: 'span',
            submitHandler: function (form) {
                $scope.postEdit();
            }
        });

    }]);