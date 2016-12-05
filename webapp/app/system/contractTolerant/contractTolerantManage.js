/**
 * Created by zhouqi on 2016/7/1.
 */
app.controller('contractTolerantCtrl', ['$scope', '$http', 'SysContractTolerantFty', function ($scope, $http, SysContractTolerantFty) {
    ycui.loading.show();
    SysContractTolerantFty.contractTolerantCurrent().success(function (res) {
        if(res){
            $scope.tolerantRule = res.tolerantRule;
            $scope.currentTolerant = res.tolerant;
            $scope.currentTolerantMoney = res.tolerantMoney;
        }
    });
    
    var pageSize = 10;
    var modView = function (response) {
        ycui.loading.hide();
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;
    };

    $scope.query = {pageSize: pageSize,pageIndex:1};

    SysContractTolerantFty.contractTolerantList($scope.query).success(modView);

    $scope.redirect = function (num) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1
        SysContractTolerantFty.contractTolerantList($scope.query).success(modView);
    };
}]);

app.filter('tolerantRuleFtr',function () {
    return function (input) {
        switch (input) {
            case 1:
                return "就低原则";
            case 2:
                return "就高原则";
        }
    };
});