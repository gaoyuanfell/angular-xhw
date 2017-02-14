/**
 * Created by moka on 16-6-17.
 */
app.controller("channelLevelManageCtrl", ['$scope', 'ResChannelLevelFty', 
    function ($scope, ResChannelLevelFty) {
        
        var pageSize = 10;
        $scope.query = {pageIndex:1,pageSize:pageSize};

        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        }

        ResChannelLevelFty.channelLevelPageList($scope.query).then(modView);

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.levelNameOrId = $scope.query.search;
            ResChannelLevelFty.channelLevelPageList($scope.query).then(modView);
        };
        
    }]);