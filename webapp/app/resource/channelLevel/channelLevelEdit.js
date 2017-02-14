/**
 * Created by moka on 16-6-17.
 */
app.controller("channelLevelEditCtrl", ['$scope', 'ResChannelLevelFty',
    function ($scope, ResChannelLevelFty) {
        var id = getSearch("id");

        ycui.loading.show();
        ResChannelLevelFty.channelLevelOne({id:id}).then(function (res) {
            if(res){
                $scope.channelLevel = res;
            }
            ycui.loading.hide();
        });

        $scope.postEdit = function () {
            if(!$(".form").valid())return;
            var body = {
                id:$scope.channelLevel.id,
                levelName:$scope.channelLevel.levelName
            }
            $scope.channelLevel.remark && (body.remark = $scope.channelLevel.remark);

            ycui.loading.show();
            ResChannelLevelFty.channelLevelEdit($scope.channelLevel).then(function(res){
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
        };

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