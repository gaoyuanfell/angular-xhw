/**
 * Created by moka on 16-6-17.
 */
app.controller("resLimitCtrl", ['$scope', 'SysRuleUserFty',
    function ($scope, SysRuleUserFty) {
        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 2}).success(function (res) {
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
            $scope.resourceRule = _object;
        })
    }]);



$(".strategys-items a").click(function () {
    var i = $(this).index();
    $(this).addClass("strategys-itemsFa").siblings().removeClass("strategys-itemsFa")
    $(".yc-compile-articl").hide().eq(i).show();
})


//广告位状态
app.filter("isOpen", function () {
    return function (input) {
        if (input == -1) {
            return "禁用 "
        } else if (input == 0) {
            return "启用 "
        } else {
            return "启用"
        }
    }
})

//广告位所属页面
app.filter("toIndex", function () {
    return function (input) {
        if (input == 1) {
            return "首页 "
        } else if (input == 2) {
            return "频道 "
        } else {
            return "内容页"
        }
    }
})

//广告位审核状态   0 审核中 1 审核通过 2审核未通过
app.filter("markState", function () {
    return function (input) {
        if (input == 0) {
            return "审核中"
        } else if (input == 1) {
            return "审核通过"
        } else if (input == 2) {
            return "审核未通过"
        } else {
            return "--"
        }
    }
})

app.filter("typeApp", function () {
    return function (input) {
        if (input == 1) {
            return "Web"
        } else if (input == 2) {
            return "Wap"
        } else {
            return "App"
        }
    }
})
app.filter("channerType", function () {
    return function (input) {
        if (input == 1) {
            return "A类"
        } else if (input == 2) {
            return "B类"
        } else if (input == 3) {
            return "C类"
        } else if (input == 4) {
            return "D类"
        } else {
            return "E类"
        }
    }
})