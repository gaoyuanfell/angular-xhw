/**
 * Created by moka on 16-6-16.
 */
app.controller('departmentManageCtrl', ['$scope', '$http', 'SysDepartmentFty', '$q',
    function ($scope, $http, SysDepartmentFty, $q) {
        ycui.loading.show();
        var pageSize = 10,
            modView = function (response) {
                ycui.loading.hide();
                if (!response) return;
                $scope.page = {
                    page:response.page,
                    total_page:response.total_page
                }
                $scope.items = response.items;
                $scope.total_page = response.total_page;
            };

        $scope.companyListSel = {
            callback:function(){
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                SysDepartmentFty.departmentPageList($scope.query).then(modView);
            }
        }
        var getCompany = SysDepartmentFty.getCompany().then(function (response) {
            if (response && response.code == 200) {
                $scope.companyListSel.list = response.companyList;
            }
        });
        $scope.query = {pageSize: pageSize,pageIndex:1};

        SysDepartmentFty.departmentPageList($scope.query).then(modView);


        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.departmentName = $scope.query.search;
            SysDepartmentFty.departmentPageList($scope.query).then(modView);
        };
    }]);