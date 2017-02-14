/**
 * Created by zhouqi on 2016/7/1.
 */
app.controller('contractTolerantAddCtrl', ['$scope', '$http', 'SysContractTolerantFty',
    function ($scope, $http, SysContractTolerantFty) {
        SysContractTolerantFty.contractTolerantCurrent().then(function (res) {
            if(res){
                $scope._cache = angular.copy(res);
                $scope.tolerantRule = res.tolerantRule;
                $scope.tolerant = accMul(res.tolerant,100);
                $scope.tolerantMoney = res.tolerantMoney;
            }else{
                $scope.tolerantRule = 1;
            }
        });

        $scope.tolerantSel = {
            list:[
                {name:'就低原则',id:1},
                {name:'就高原则',id:2},
            ]
        }

        $scope.postEdit = function () {
            if($scope.tolerant == $scope._cache.tolerant * 100 && $scope.tolerantMoney == $scope._cache.tolerantMoney && $scope.tolerantRule == $scope._cache.tolerantRule){
                ycui.alert({"content":"数据没有修改，请修改后提交！"});
                return;
            }
            if(!$(".form").valid)return;
            ycui.loading.show();
            SysContractTolerantFty.contractTolerantAdd({
                tolerant:$scope.tolerant * .01,
                tolerantMoney:$scope.tolerantMoney,
                tolerantRule:$scope.tolerantRule
            }).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        timeout:10,
                        okclick: function () {
                            goRoute('ViewTolerantRate');
                        }
                    })
                }
            })
        };

        $(".form").validate({
            rules: {tolerant: "required",tolerantMoney: "required"},
            messages: {tolerant: "请输入比率",tolerantMoney: "请输入绝对值"},
            errorClass: "error-span",
            errorElement: "span"
        });
    }]);