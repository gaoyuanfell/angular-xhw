app.controller('indexCtrl',['$scope','SysNoticeFty',function($scope,SysNoticeFty){
    ycui.loading.show();
    $scope.query = {pageIndex:1,pageSize:10}
    var modView = function (res) {
        ycui.loading.hide();
        if (res && res.code == 200) {
            $scope.page = {
                page:res.page,
                total_page:res.total_page
            };
            $scope.total_page = res.total_page;
            $scope.noticeList = res.items;
        }
    };
    SysNoticeFty.viewUserAllNotice($scope.query).then(modView);

    $scope.noticeRead = function(item){
        item.click = !item.click;
        if(item.readState == 0){
            item.readState = 1;
            SysNoticeFty.noticeRead({id:item.id})
        }
    }

    $scope.redirect = function(num){
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        SysNoticeFty.viewUserAllNotice($scope.query).then(modView);
    }

    $scope.showNotice = function(time){
        return time  > Date.now() - 60*60*1000*24*7
    }


}])


app.controller('helpCtrl',['$scope','SysDocumentFty',function($scope,SysDocumentFty){
    $scope.query = {pageIndex:1,pageSize:10};
    ycui.loading.show();
    var modView = function (res) {
        ycui.loading.hide();
        if (res && res.code == 200) {
            $scope.page = {
                page:res.page,
                total_page:res.total_page
            };
            $scope.total_page = res.total_page;
            $scope.items = res.items;
        }
    };

    $scope.redirect = function(num){
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        SysDocumentFty.documentList($scope.query).then(modView);
    }

    $scope.download = function(url,name){
        ycui.confirm({
            content:'请确认是否下载【'+ name +'】',
            okclick:function(){
                window.open(url,'_blank')
            }
        })
    }

    SysDocumentFty.documentList($scope.query).then(modView);
}]);