/**
 * Created by moka on 16-8-31.
 */
app.controller('SpecialManageCtrl',['$scope','SysSpecialFty',function ($scope,SysSpecialFty) {
    ycui.loading.show();
    $scope.query = {
        pageSize:10,
        pageIndex:1
    };
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

    SysSpecialFty.specialList($scope.query).success(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search
        SysSpecialFty.specialList($scope.query).success(modView);
    };
    
    $scope.delete = function (id) {
        ycui.confirm({
            content:'是否删除此特效',
            okclick:function () {
                SysSpecialFty.specialDelete({id:id}).success(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:10,
                            okclick:function () {
                                SysSpecialFty.specialList($scope.query).success(modView);
                            }
                        })
                    }
                })
            }
        })
    }
    
}]);

app.controller('SpecialAddCtrl',['$scope','SysSpecialFty',function ($scope,SysSpecialFty) {
    
    $scope.special = {};
    
    $scope.postEdit = function () {
        $scope.validShow = true;

        if(!$(".form").valid){
            return;
        }

        SysSpecialFty.specialAdd($scope.special).success(function (res) {
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewSpecialEffects');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            specialEffectsName: "required",
            specialEffectsUrl:{
                url:true,
                required:true
            }
        },
        messages: {
            specialEffectsName: "请输入特效名称",
            specialEffectsUrl: {
                required: "请输入特效打开地址",
                url: "请输入有效的url"
            }
        },
        errorClass: "error-span",
        errorElement: "span"
    })
    
}]);

app.controller('SpecialCompileCtrl',['$scope','SysSpecialFty',function ($scope,SysSpecialFty) {
    var id = getSearch("id");
    $scope.special = {};
    SysSpecialFty.getSpecial({id:id}).success(function (res) {
        if(res && res.code == 200){
            $scope.special = res.items;
        }
    });

    $scope.postEdit = function () {
        $scope.validShow = true;
        
        if(!$(".form").valid){
            return;
        }

        var body = {
            id:$scope.special.id,
            specialEffectsName:$scope.special.specialEffectsName,
            specialEffectsUrl:$scope.special.specialEffectsUrl,
            remark:$scope.special.remark
        }

        SysSpecialFty.specialUpdate(body).success(function (res) {
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewSpecialEffects');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            specialEffectsName: "required",
            specialEffectsUrl:{
                url:true,
                required:true
            }
        },
        messages: {
            specialEffectsName: "请输入特效名称",
            specialEffectsUrl: {
                required: "请输入特效打开地址",
                url: "请输入有效的url"
            }
        },
        errorClass: "error-span",
        errorElement: "span"
    })
}]);