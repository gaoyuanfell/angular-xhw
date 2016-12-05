/**
 * Created by moka on 16-6-17.
 */
app.controller("channelEditCtrl", ['$scope', '$http','ResChannelFty','UploadKeyFty','ResChannelLevelFty',
    function ($scope, $http, ResChannelFty,UploadKeyFty,ResChannelLevelFty) {

        $scope.levelListSel = {}
        ResChannelLevelFty.channelLevelList().success(function(res){
            console.info(res);
            $scope.levelListSel.list = res.levels
        })

        
        var id = getSearch("id");

        ycui.loading.show();
        ResChannelFty.getChannel({id:id}).success(function (response) {
            ycui.loading.hide();
            $scope.channelName = response.channelName;
            $scope.level = response.level;
            $scope.mediaName = response.mediaName;
            $scope.mediaId = response.mediaId;

            if(response.imageUrl){
                $scope.imageUrl = response.imageUrl;
                var info = getImgInfo($scope.imageUrl);
                info.onload = function () {
                    var wh = proportionPhoto(info.width,info.height,75,75);
                    $scope.$apply(function () {
                        $scope._imageUrl = {
                            width:wh[0],
                            height:wh[1],
                            imageUrl:$scope.imageUrl
                        }
                    })
                }
            }
        });

        // $scope.updateLevel = function (id) {
        //     $scope.level = id;
        //     $('.select-level').parent().find('.error-message').remove();
        // }

        // $scope.updateMediaName = function (id) {
        //     $scope.mediaId = id;
        //     $('.select-media').parent().find('.error-message').remove();
        // }

        $scope.postEdit = function () {
            var pass = true;

            if (!$(".form").valid()) {
                pass = false;
            }
            
            var body = {
                id: id,
                channelName: $scope.channelName,
                level: $scope.level,
                mediaId: $scope.mediaId
            }

            $scope.imageUrl && (body.imageUrl = $scope.imageUrl);
            if(pass){
                ycui.loading.show();
                ResChannelFty.channelUpdate(body).success(function (res) {
                    ycui.loading.hide();
                    if (res && res.code == 200) {
                        ycui.alert({
                            content: res.msg,
                            okclick: function () {
                                goRoute('ViewMediaChannelADSpace2')
                            },
                            timeout: 10
                        });
                    }
                })
            }
        };

        $(".form").validate({
            rules: {
                myText: "required"
            },
            messages: {
                myText: "请输入频道名称"
            },
            errorClass: "error-span",
            errorElement: "span"
        });

        var upload = function(id){
            var key = '';
            var config = {
                server:fileUrl + "/channel/uploadPic.htm",
                pick: {
                    id: '#' + id
                },
                beforeFileQueued:function(uploader,file){
                    ycui.loading.show();
                    uploader.stop(file);
                    UploadKeyFty.uploadKey().success(function (da) {
                        key = da.items;
                        uploader.upload(file);
                    });
                },
                uploadBeforeSend:function(uploader,file,data){
                    data.uploadKey = key;
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                uploadSuccess:function(uploader,file, res){
                    if(res && res.code == 200){
                        $scope.imageUrl = res.imageUrl;
                        var w = res.width;
                        var h = res.height;
                        var wh = proportionPhoto(w,h,75,75);
                        $scope.$apply(function () {
                            $scope._imageUrl = {
                                width:wh[0],
                                height:wh[1],
                                imageUrl:$scope.imageUrl
                            }
                        })
                    }
                    ycui.loading.hide();
                }
            }
            uploadInit(config);
        }

        upload('channel-manage');
    }]);