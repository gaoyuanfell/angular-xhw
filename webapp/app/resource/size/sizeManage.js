/**
 * Created by moka on 16-6-17.
 */
app.controller("sizeManageCtrl", ["$scope", "$http", "ResSizeFty",
    function ($scope, $http, ResSizeFty) {
        var pageSize = 10;
        $scope.query = {pageSize: pageSize};

        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            if(!response)return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        }
        ResSizeFty.sizePageList($scope.query).success(modView)

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.size = $scope.query.search;
            ResSizeFty.sizePageList($scope.query).success(modView)
        };
    }]);
