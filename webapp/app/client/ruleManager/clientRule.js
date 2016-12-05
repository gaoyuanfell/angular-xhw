/**
 * Created by moka on 16-6-16.  
 */
app.controller("clientLimitCtrl", ['$scope', 'SysRuleUserFty',
    function ($scope, SysRuleUserFty) {
        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 3}).success(function (res) {
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
            $scope.qualityRule = _object;
            $scope.clientRule = _object;
        })
    }])