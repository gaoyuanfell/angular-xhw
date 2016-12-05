/**
 * Created by moka on 16-6-21.
 */
app.controller("orderRuleCtrl", ["$scope", "SysRuleUserFty","SysLoginUserFty",
    function ($scope, SysRuleUserFty,SysLoginUserFty) {

        var loginUserInfo = SysLoginUserFty.loginUserInfo().success(function (res) {
            if (res && res.code == 200) {
                $scope.user = res;
                $scope.$broadcast('loginUserInfo');
            }
        });

        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 1}).success(function (res) {
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
            $scope.trueAdvertisementRule = _object;
        })
    }]);

app.filter("type", function () {
    return function (input) {
        if (input == 1) {
            return "首页"
        } else if (input == 2) {
            return "频道"
        } else {
            return "内容页"
        }
    }
});
app.filter("isPass", function () {
    return function (input) {
        if (input == 0) {
            return "审核中"
        } else if (input == 1) {
            return "审核通过"
        } else {
            return "审核未通过"
        }
    }
});