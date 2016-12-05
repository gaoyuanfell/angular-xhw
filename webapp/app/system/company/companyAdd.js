/**
 * Created by moka on 16-6-16.
 */
app.controller("companyAddCtrl", ['$scope', '$http', 'SysCompanyFty', 'DictionaryFty', 
    function ($scope, $http, SysCompanyFty, DictionaryFty) {
    $scope.companyTypeSel = {
        list:[{name: '总公司', id: 1}, {name: '分公司', id: 2}],
        callback:function(e,d){
            d && d.id == 1 && (delete $scope.companyAreaId);
        }
    }
        $scope.companyType = 2;
    //获取地域
    ycui.loading.show();
    DictionaryFty.provinceListForCompany().success(function (response) {
        ycui.loading.hide();
        $scope.areaList = response;
    });

    $scope.postEdit = function () {
        $scope.validate = true;
        var pass = true;

        //下拉菜单的验证
        if ($scope.companyType == undefined) {
            pass = false
        }

        // if ($scope.companyType == 2 && $scope.companyAreaId == undefined) {
        //     pass = false
        // }

        //验证表单		
        if (!$(".form").valid()) {
            pass = false
        }

        if (pass) {
            ycui.loading.show();
            SysCompanyFty.companyAdd({
                companyName: $scope.companyName,
                manager: $scope.manager,
                phone: $scope.phone,
                remark: $scope.remark,
                companyType: $scope.companyType,
                companyAreaId: $scope.companyAreaId,
                email: $scope.email,
                telephone:$scope.telephone
            }).success(function (response) {
                ycui.loading.hide();
                if (response.code && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewCompany')
                        },
                        timeout: 10
                    })
                }
            });
        }
    };

    //表单验证
    $(".form").validate({
        rules: {
            userName: "required",
            companyName: {
                required: true
            },
            myUrl: {
                required: true,
                url: true
            },
            companyPerson: 'required',
            phone: {
                required: true,
                phone: true
            },
            telephone: {
                required: true,
                phone: true
            },
            myEmail: {
                required: true,
                email: true
            }
        },
        messages: {
            userName: '请输入公司名称',
            companyName: {
                required: '请输入公司简称'
            },
            companyPerson: '请输入公司管理员',
            phone: {
                required: '请输入电话'
            },
            telephone: {
                required: '请输入座机'
            },
            myEmail: {
                required: '请输入邮箱'
            }
        },
        errorClass: 'error-span',
        errorElement: 'span'
    });
}]);