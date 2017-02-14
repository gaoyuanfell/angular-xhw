/**
 * Created by moka on 16-6-17.
 */
app.controller("sizeEditCtrl", ['$scope', 'ResSizeFty',
    function ($scope, ResSizeFty) {
        var id = getSearch("id");
        ycui.loading.show();
        ResSizeFty.getSize({id:id}).then(function (response) {
            ycui.loading.hide();
            var arr = [];
            $scope.size = response.size;
            arr = $scope.size.split("*");
            $scope.firstSize = arr[0];
            $scope.lastSize = arr[1];
        });

        $scope.postEdit = function(){
            if(!$(".form").valid())return;
            var body = {
                id: id,
                size: $scope.firstSize + "*" + $scope.lastSize
            }
            ycui.loading.show();
            ResSizeFty.updateSize(body).then(function(res){
                ycui.loading.hide();
                if (res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewSize')
                        },
                        timeout: 10
                    });
                }
            })
        }

        $(".form").validate({
            rules: {
                myText: "required",
                myText2: "required"
            },
            messages: {
                myText: "请输入尺寸",
                myText2: "请输入尺寸"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);