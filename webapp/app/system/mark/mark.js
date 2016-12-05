/**
 * Created by moka on 16-8-31.
 */
app.controller('MarkManageCtrl',['$scope','SysMarkFty',function ($scope,SysMarkFty) {
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

    SysMarkFty.adMarkList($scope.query).success(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search
        SysMarkFty.adMarkList($scope.query).success(modView);
    };

    $scope.delete = function (id) {
        ycui.confirm({
            title:'角标删除',
            content:'确定要删除此角标?',
            okclick:function () {
                SysMarkFty.deleteAdMark({id:id}).success(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:-1,
                            okclick:function () {
                                SysMarkFty.adMarkList($scope.query).success(modView);
                            }
                        })
                    }
                })
            }
        })
    }

    $scope.enable = function (id,state) {
        ycui.confirm({
            title:'角标启用/禁用',
            content:'确定要'+ (~state?'禁用':'启用') +'此角标?',
            okclick:function () {
                SysMarkFty.enableAdMark({id:id,state:~state}).success(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:-1,
                            okclick:function () {
                                SysMarkFty.adMarkList($scope.query).success(modView);
                            }
                        })
                    }
                })
            }
        })
    }
}])

app.controller('MarkAddCtrl',['$scope','UploadKeyFty','SysMarkFty',function ($scope,UploadKeyFty,SysMarkFty) {
    
    $scope.mark = {state:0,adMarkType:1};

    var upload = function (id) {
        var key = '';
        var config = {
            server: fileUrl + "/contract/uploadADMark.htm",
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
                ycui.loading.show();
                uploader.stop(file);
                UploadKeyFty.uploadKey().success(function (da) {
                    key = da.items;
                    uploader.upload(file);
                });
            },
            uploadBeforeSend:function (uploader, file, data) {
                data.uploadKey = key;
                data.fileSize = $scope.fileSize;
            },
            uploadSuccess:function (uploader, file, res) {
                if(res && res.code == 200){
                    $scope.imgList = [];
                    var wh = proportionPhoto(res.width,res.height,20,20);
                    var da = {
                        width:wh[0],
                        height:wh[1],
                        uploadFile:res.uploadFile
                    };
                    $scope.$apply(function () {
                        $scope.mark.adMarkUrl = res.uploadFile;
                        $scope.imgList.push(da);
                    });

                }else if(res && res.code == 500){
                    ycui.alert({
                        error:true,
                        content:res.msg,
                        timeout:10
                    })
                }
            }
        }
        return uploadInit(config);
    };

    upload('markUpload');
    
    $scope.postEdit = function () {
        $scope.validShow = true;
        var bo = true;
        if(!$scope.mark.adMarkUrl){
            bo = false;
        }
        if(!$(".form").valid()){
            bo = false;
        }
        if(!bo){return};
        SysMarkFty.addAdMark($scope.mark).success(function (res) {
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewADMark');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            adMarkName: "required"
        },
        messages: {
            adMarkName: "请输入角标名称"
        },
        errorClass: "error-span",
        errorElement: "span"
    })
    
}]);

app.controller('MarkCompileCtrl',['$scope','SysMarkFty','UploadKeyFty',function ($scope,SysMarkFty,UploadKeyFty) {
    var id = getSearch("id");
    $scope.mark = {};
    SysMarkFty.getAdMark({id:id}).success(function (res) {
        if(res){
            $scope.mark = res;
            $scope.imgList = [];
            var da = {
                width:20,
                height:20,
                uploadFile:res.adMarkUrl
            };
            $scope.imgList.push(da);
        }
    });

    var upload = function (id) {
        var key = '';
        var config = {
            server: fileUrl + "/contract/uploadADMark.htm",
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
                ycui.loading.show();
                uploader.stop(file);
                UploadKeyFty.uploadKey().success(function (da) {
                    key = da.items;
                    uploader.upload(file);
                });
            },
            uploadBeforeSend:function (uploader, file, data) {
                data.uploadKey = key;
                data.fileSize = $scope.fileSize;
            },
            uploadSuccess:function (uploader, file, res) {
                if(res && res.code == 200){
                    $scope.imgList = [];
                    var wh = proportionPhoto(res.width,res.height,20,20);
                    var da = {
                        width:wh[0],
                        height:wh[1],
                        uploadFile:res.uploadFile
                    };
                    $scope.$apply(function () {
                        $scope.mark.adMarkUrl = res.uploadFile;
                        $scope.imgList.push(da);
                    });
                }else if(res && res.code == 500){
                    ycui.alert({
                        error:true,
                        content:res.msg,
                        timeout:10
                    })
                }
            }
        };
        return uploadInit(config);
    };

    upload('markUpload');

    $scope.postEdit = function () {
        $scope.validShow = true;
        var bo = true;
        if(!$scope.mark.adMarkUrl){
            bo = false;
        }
        if(!$(".form").valid()){
            bo = false;
        }
        if(!bo){return};

        var body = {
            id:$scope.mark.id,
            adMarkName:$scope.mark.adMarkName,
            state:$scope.mark.state,
            adMarkUrlShow:$scope.mark.adMarkUrlShow,
            adMarkUrl:$scope.mark.adMarkUrl,
            adMarkType:$scope.mark.adMarkType
        };

        SysMarkFty.updateAdMark(body).success(function (res) {
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewADMark');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            adMarkName: "required"
        },
        messages: {
            adMarkName: "请输入角标名称"
        },
        errorClass: "error-span",
        errorElement: "span"
    })
}]);

app.filter('markPositionFtr',function () {
    return function (input) {
        switch (input) {
            case 1:
                return "左上角";
            case 2:
                return "左下角";
            case 3:
                return "右上角";
            case 4:
                return "右下角";
            default:
                return input;
        }
    };
});