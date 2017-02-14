/**
 * Created by moka on 16-6-17.
 */
app.controller("createManageCtrl", ["$scope", "$http", "ResCreativityFty",
    function ($scope, $http, ResCreativityFty) {
        var pageSize = 10;
        $scope.query = {pageSize: pageSize};

        var getApi = "/ADSpaceType/pageList.htm";
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
        };
        ResCreativityFty.adSpacePageList($scope.query).then(modView);
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.typeNameOrId = $scope.query.search;
            ResCreativityFty.adSpacePageList($scope.query).then(modView);
        };

        $scope.replaceReg = function (catagorys) {
            var catagorysList = [
                {name:'图片',value:1},
                {name:'JS',value:2},
                {name:'H5',value:3}
            ];
            catagorys = catagorys.split(',');
            var str = '';
            catagorysList.forEach(function (da) {
                if(catagorys.indexOf(String(da.value)) != -1 ){
                    str += ',' + da.name;
                }
            })
            return str.substr(1);
        }


    }]);