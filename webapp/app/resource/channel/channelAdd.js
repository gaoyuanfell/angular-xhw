/**
 * Created by moka on 16-6-17.
 */
app.controller("channelAddCtrl", ['$scope', '$http','ResChannelFty','ResChannelLevelFty','$q',
    function ($scope, $http ,ResChannelFty, ResChannelLevelFty,$q) {
        
        function ClearBr(key) {
            key = key.replace(/(\n)/g, "&");
            var arr = [];
            arr = key.split("&");
            return arr;
        }

        $scope.level = 0;
        $scope.mediaId = 0;

        $scope.mediaListNameSel = {};
        var downListForSearch = ResChannelFty.mediaListForAdd().success(function (res) {
            if(res && res.code == 200){
                $scope.mediaListNameSel.list = res.mediaList
            }
        });

        $scope.levelListSel = {}
        ResChannelLevelFty.channelLevelList().success(function(res){
            console.info(res);
            $scope.levelListSel.list = res.levels
        })

        

        //updateMediaName

        $scope.postEdit = function () {
            var pass = true, parent;
            $scope.validate = true;

            if ($scope.level == 0) {
                pass = false;
            }
            if ($scope.mediaId == 0) {
                pass = false;
            }
            if (!$(".form").valid()) {
                pass = false;
            }

            if (pass) {
                ycui.loading.show();
                ResChannelFty.channelAdd({
                    channelNames: ClearBr($scope.channelNames),
                    mediaId: $scope.mediaId,
                    level: $scope.level
                }).success(function (response) {
                    ycui.loading.hide();
                    if (response.code == 200) {
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                goRoute('ViewMediaChannelADSpace2')
                            },
                            timeout: 10
                        });
                    } else if (response.code == 201) {
                        var arr = [];
                        arr = (response.msg.usedNames);
                        if (ClearBr($scope.channelNames).length == arr.length) {
                            ycui.alert({
                                content: "此频道名称：" + arr + "已经被注册",
                                timeout: -1
                            });
                        } else {
                            ycui.alert({
                                content: "此频道名称：" + arr + "已经被注册,其他的都注册成功",
                                okclick: function () {
                                    goRoute('ViewMediaChannelADSpace2')
                                },
                                timeout: 10
                            });
                        }
                    }
                })
            }
        }

        $(".form").validate({
            rules: {
                myText: "required"
            },
            messages: {
                myText: "请输入频道名称"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);