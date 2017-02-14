/**
 * Created by moka on 16-6-16.
 */
app.controller('companyEditCtrl', ['$scope', '$http', 'SysCompanyFty', 'DictionaryFty', 
    function ($scope, $http, SysCompanyFty, DictionaryFty) {
    var id = getSearch('id');
    $scope.companyTypeSel = {
        list:[{name: '总公司', id: 1}, {name: '分公司', id: 2}],
        callback:function(e,d){
            d && d.id == 1 && (delete $scope.companyAreaId);
        },
        disabled:1
    }
    ycui.loading.show();
    SysCompanyFty.companyEditInfo({id: id}).then(function (response) {
        ycui.loading.hide();
        if(!response) return;
        $scope.companyName = response.companyName;
        $scope.abbrName = response.abbrName;
        $scope.companyUrl = response.companyUrl;
        $scope.manager = response.manager;
        $scope.phone = response.phone;
        $scope.companyType = response.companyType;
        $scope.email = response.email;
        $scope.companyAreaId = response.companyAreaId;
        $scope.telephone = response.telephone;
        // setTimeout(function () {
        //     $("input[type=radio]").each(function (i, n) {
        //         if ($scope.companyAreaId == (i + 1)) {
        //             $(this).prop("checked", "checked")
        //         }
        //     })
        // }, 200)
    });

    //更新客户类型下拉菜单
    // $scope.updateCompanyType = function (id) {
    //     $scope.companyType = id;
    //     if (id == 1) {
    //         $scope.companyAreaId = 0;
    //     } else {
    //         $scope.companyAreaId = -1;
    //     }
    // };

    //获取地域
    DictionaryFty.provinceListForCompany().then(function (response) {
        $scope.areaList = response;
    });

    //获取value值
    // $scope.getAreaId = function (id) {
    //     $scope.companyAreaId = id;
    //     $('.selectArea').parent().find('.error-message').remove();
    // };

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

        if (!$(".form").valid()) {
            pass = false;
        }

        if (pass) {
            ycui.loading.show();
            SysCompanyFty.companyEdit({
                id: id,
                companyName: $scope.companyName,
                abbrName: $scope.abbrName,
                companyUrl: $scope.companyUrl,
                manager: $scope.manager,
                phone: $scope.phone,
                companyType: $scope.companyType,
                companyAreaId: $scope.companyAreaId,
                email: $scope.email,
                telephone:$scope.telephone
            }).then(function (response) {
                ycui.loading.hide();
                if (response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewCompany')
                        },
                        timeout:10
                    })
                }
            })
        }
    };

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