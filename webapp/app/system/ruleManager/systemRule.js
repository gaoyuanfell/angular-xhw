/**
 * Created by moka on 16-6-16.
 */
app.controller("limitCtrl", ['$scope', 'SysRuleUserFty','SysLoginUserFty',
    function ($scope,SysRuleUserFty,SysLoginUserFty) {
        var loginUserInfo = SysLoginUserFty.loginUserInfo().success(function (res) {
            if (res && res.code == 200) {
                $scope.user = res;
                $scope.$broadcast('loginUserInfo');
            }
        });

        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 5}).success(function (res) {
            var _object = {};
            if(res && res.code == 200){
                var items = res.items;
                items.forEach(function(ad){
                    _object[ad.verify] = ad;
                })
            }
            /**
             * 权限对象 扁平化
             * @type {{}}
             */
            $scope.systemManageRule = _object;
        })
    }]);


/*_______________________________________*/

app.filter("typeApp", function () {
    return function (input) {
        if (input == 1) {
            return "Web"
        } else if (input == 2) {
            return "Wap"
        } else {
            return "APP"
        }
    }
})
app.filter("isNull", function () {
    return function (input) {
        if (input) {
            return input
        } else {
            return "请选择"
        }
    }
})

app.filter("companyTypeFtr", function () {
    return function (input) {
        switch (input) {
            case 1:
                return "总公司";
            case 2:
                return "分公司";
            default:
                return "--";
        }
    }
});

