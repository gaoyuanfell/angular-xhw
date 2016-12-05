/**
 * Created by moka on 16-6-17.
 */
app.controller("createAddCtrl", ['$scope', '$http',
    function ($scope, $http) {
        var postApi = "/ADSpaceType/add.htm";

        function ClearBr(key) {
            var arr = [];
            arr = key.split(/[\r\n]+/);
            var i = arr.length, re = [];
            while (i--) {
                re.push({name: arr[i]});
            }
            return re;
        };
        $scope.name = "";

        $scope.postEdit = function () {
            ycui.loading.show();
            $http.post(baseUrl + postApi, {
                types: ClearBr($scope.name)
            }).success(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            location.replace("createManage.html")
                        },
                        timeout: -1
                    });
                } else if (response.code == 201) {
                    var arr = [];
                    arr = (response.msg.usedNames);
                    if (ClearBr($scope.name).length == arr.length) {
                        ycui.alert({
                            content: "此创意名称：" + arr + "已经被注册",
                            timeout: -1
                        });
                    } else {
                        ycui.alert({
                            content: "此创意名称：" + arr + "已经被注册,其他的都注册成功",
                            okclick: function () {
                                location.replace("createManage.html")
                            },
                            timeout: -1
                        });
                    }
                }
            })
        }

        $(".createIncreaseForm").validate({
            rules: {
                myText: "required"
            },
            messages: {
                myText: "请输入创意名称"
            },
            errorClass: "error-span",
            errorElement: "span",
            submitHandler: function (form) {
                $scope.postEdit();
            }
        })
    }]);