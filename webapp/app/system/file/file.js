/**
 * Created by moka on 16-8-31.
 */
app.controller('FileManageCtrl',['$scope','SysDocumentFty',function ($scope,SysDocumentFty) {
    ycui.loading.show();
    $scope.query = {
        pageSize:10,
        pageIndex:1
    };
    var modView = function (response) {
        ycui.loading.hide();
        if (!response) return;
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;
    };

    SysDocumentFty.documentList($scope.query).then(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search;
        SysDocumentFty.documentList($scope.query).then(modView);
    };

    $scope.delete = function (id) {
        ycui.confirm({
            title:'文档删除',
            content:'确定要删除此文档?',
            okclick:function () {
                SysDocumentFty.documentDel({id:id}).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:10,
                            okclick:function () {
                                SysDocumentFty.documentList($scope.query).then(modView);
                            }
                        })
                    }
                })
            }
        })
    }
}])

app.controller('FileAddCtrl',['$scope','UploadKeyFty','SysDocumentFty',function ($scope,UploadKeyFty,SysDocumentFty) {
    
    $scope.document = {};

    var upload = function (id) {
        var key = '';
        var config = {
            server: fileUrl + "/contract/uploadDocument.htm",
            pick: {
                id: '#'+id,
                multiple: false
            },
            error:function (uploader,err) {
                ycui.alert({
                    content: "错误的文件类型",
                    timeout: 10,
                    error:true
                });
                ycui.loading.hide();
                uploader.reset();
            },
            uploadComplete:function () {
                ycui.loading.hide();
            },
            beforeFileQueued:function (uploader,file) {
                var size = 100*1024*1024;
                if(file.size > size){
                    ycui.alert({
                        content: "文件大小不能超过100M(1M等于1024KB)",
                        timeout: 10,
                        error:true
                    });
                    return false;
                }
                ycui.loading.show();
                uploader.stop(file);
                UploadKeyFty.uploadKey().then(function (da) {
                    key = da.items;
                    uploader.upload(file);
                });
            },
            uploadBeforeSend:function (uploader, file, data) {
                data.uploadKey = key;
                data.fileSize = $scope.fileSize;
            },
            uploadSuccess:function (uploader, file, res) {
                if(res){
                    $scope.$apply(function(){
                        $scope.document.documentUrl = res.uploadFile;
                    })
                }
            }
        }
        return uploadInit(config);
    };

    upload('documentUrl');
    
    $scope.postEdit = function () {
        $scope.validShow = true;
        var bo = true;
        if(!$(".form").valid()){
            bo = false;
        }
        if(!$scope.document.documentUrl){
            bo = false;
        }
        if(!bo){return};
        ycui.loading.show();
        SysDocumentFty.documentAdd($scope.document).then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ManageHelpDocument');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            documentName: "required"
        },
        messages: {
            documentName: "请输入文档名称"
        },
        errorClass: "error-span",
        errorElement: "span"
    })
    
}]);