/**
 * Created by moka on 16-6-16.
 */
app.controller('companyManageCtrl', ['$scope', '$http', 'SysCompanyFty',
    function ($scope, $http, SysCompanyFty) {
        ycui.loading.show();
        $scope.page = {}
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

        $scope.query = {pageSize: pageSize,pageIndex:1};

        SysCompanyFty.companyPageList($scope.query).then(modView);

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.companyNameOrAbbr = $scope.query.search;
            SysCompanyFty.companyPageList($scope.query).then(modView);
        };

        ycui.select(".yc-select", function (valueId) {
            var arr = valueId.attr("data-value").split(":");
            var stringId = arr[0];
            var numId = arr[1];
            switch (stringId) {
                case "com":
                    $scope.companyType = numId == -1 ? "" : numId;
                    break;
            }
            var query = {pageSize: pageSize, pageIndex: 1};
            $scope.companyType && (query.companyType = $scope.companyType);
            SysCompanyFty.companyPageList(query).then(modView);
        })
        
    }]);