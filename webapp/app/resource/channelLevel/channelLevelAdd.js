/**
 * Created by moka on 16-6-17.
 */
app.controller("channelLevelAddCtrl", ['$scope', 'ResChannelLevelFty',
    function ($scope, ResChannelLevelFty) {
        $scope.channelLevel = {};

        $scope.postEdit = function () {
            if(!$(".form").valid())return;
            ycui.loading.show();
            ResChannelLevelFty.channelLevelAdd($scope.channelLevel).then(function(res){
                console.info(res);
                ycui.loading.hide();
                if (res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewMediaChannelADSpace4')
                        },
                        timeout: 10
                    });
                }
            })
        }

        $(".form").validate({
            rules: {
                levelName: "required"
            },
            messages: {
                levelName: "请输入频道级别名称"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);