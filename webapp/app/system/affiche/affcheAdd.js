/**
 * Created by moka on 16-6-16.
 */
app.controller("affcheAddCtrl", ['$scope', 'SysNoticeFty','SysUserFty','UploadKeyFty',
    function ($scope, SysNoticeFty,SysUserFty,UploadKeyFty) {
        $scope.affche = {
            state:0,
            isPublic: 1,
            isEmail: 1,
            important: 0,
            publishRange:0
        };

        $scope.$on('loginUserInfo',function () {
            SysUserFty.userInfo({id: $scope.$parent.user.id}).then(function (res) {
                if (res) {
                    $scope.roleList = res.roleList;
                    $scope.affche.publishUserId = res.id;
                    $scope.affche.publishRoleId = $scope.roleList[0].id;
                    $scope.affche.publishUser = res.trueName;
                }
            })
        });

        var upload = function (id) {
            var key = '';
            var config = {
                server: fileUrl + "/contract/uploadNotice.htm",
                pick: {
                    id: '#'+id,
                    multiple: false
                },
                accept: null,
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
                    var size = 20*1024*1024;
                    if(file.size > size){
                        ycui.alert({
                            content: "文件大小不能超过20M(1M等于1024KB)",
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
                },
                uploadSuccess:function (uploader, file, res) {
                    if(res && res.uploadFile){
                        $scope.$apply(function(){
                            $scope.affche.noticeAttachment = res.uploadFile;
                        })
                    }
                }
            }
            return uploadInit(config);
        };

        upload('affcheAddUpload')

        $scope.postEdit = function () {
            if(!$(".form").valid())return;
            ycui.loading.show();
            SysNoticeFty.addNotice($scope.affche).then(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewNotice')
                        }
                    });
                }
            })
        };

        $(".form").validate({
            rules: {
                myTitle: "required",
                myContent: "required"
            },
            messages: {
                myTitle: "请输入公告名称",
                myContent: "请输入公告内容"
            },
            errorClass: "error-span",
            errorElement: "span"
        })

    }]);