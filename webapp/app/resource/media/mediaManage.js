/**
 * Created by moka on 16-6-17.
 */
app.controller("mediaManageCtrl", ["$scope", "$http", "ResMediaFty",'$q',
    function ($scope, $http, ResMediaFty,$q) {
        $scope.companyListSel = {}
        var companyList = ResMediaFty.companyList().then(function (res) {
            if(res && res.code == 200){
                $scope.companyListSel.list = res.companyList;
            }
        })

        $scope.mediaTypeSel = {
            list:[
                {name:'Web',id:1},
                {name:'Wap',id:2}
            ]
        };

        $scope.$on('res-media-media',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ResMediaFty.mediaPageList($scope.query).then(modView);
        })

        $scope.query = {pageSize:10};
        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        }
        ResMediaFty.mediaPageList($scope.query).then(modView);

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.mediaNameOrId = $scope.query.search;
            ResMediaFty.mediaPageList($scope.query).then(modView);
        };
    }]);