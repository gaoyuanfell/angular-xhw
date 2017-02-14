/**
 * Created by moka on 16-6-16.
 */
app.controller("affcheEditCtrl", ['$scope', '$http', 'SysNoticeFty','SysUserFty','UploadKeyFty',
    function ($scope, $http, SysNoticeFty,SysUserFty,UploadKeyFty) {
        var id = getSearch("id");
        ycui.loading.show();

        $scope.$on('loginUserInfo',function () {
            SysUserFty.userInfo({id: $scope.$parent.user.id}).then(function (res) {
                if (res) {
                    $scope.roleList = res.roleList;
                }
            })
        });
        
        SysNoticeFty.edit({id: id}).then(function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.affche = response;
            
            // $scope.title = response.title;
            // $scope.content = response.content;
            // $scope.isEmail = response.isEmail;
            // $scope.companyId = response.companyId;
            // $scope.departmentId = response.departmentId;
            // $scope.important = response.important;
            // $scope.showDate = response.showDate;
            // $scope.publishUser = response.publishUser;
            // $scope.state = response.state == 0 ? true : false;
            // $scope.sort = response.sort;
            // $scope.createTime = response.createTime;
            // $scope.updateTime = response.updateTime;
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
            
            var body = angular.copy($scope.affche);
            if(!$(".form").valid())return;
            delete body.createTime;
            delete body.updateTime;
            ycui.loading.show();
            SysNoticeFty.updateNotice(body).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewNotice')
                        },
                        timeout: 10
                    });
                }
            });
        };

        $(".form").validate({
            rules: {
                userName: "required",
                myContent: "required"
            },
            messages: {
                userName: "请输入公告名称",
                myContent: "请输入公告内容"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);