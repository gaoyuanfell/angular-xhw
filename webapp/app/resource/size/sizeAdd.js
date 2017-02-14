/**
 * Created by moka on 16-6-17.
 */
app.controller("sizeAddCtrl", ['$scope', 'ResSizeFty',
    function ($scope, ResSizeFty) {

        function ClearBr(key) {
            var arr = [];
            arr = key.split(/[\r\n]+/);
            return arr;
        };

        $scope.postEdit = function () {
            if(!$('.form').valid())return;
            var body = {
                sizes: ClearBr($scope.size)
            }
            ycui.loading.show();
            ResSizeFty.addSize(body).then(function(res){
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewSize');
                        },
                        timeout: 10
                    });
                }else if (res.code == 201){
                    var response = res;
                    var arr = [];
                    var arr1 = [];
                    arr = response.msg.usedNames;   //已有的尺寸
                    arr1 = response.msg.sizeErrors; //尺寸错误
                    if (arr.length > 0 && arr1.length > 0 && ClearBr($scope.size).length - (arr.length + arr1.length) > 0) {
                        ycui.alert({
                            content: "以下尺寸不正确：" + arr1 + "<br/>" + "以下尺寸已存在:" + arr + "<br/>" + "其他尺寸添加成功！",
                            okclick: function () {
                                location.replace("sizeManage.html")
                            },
                            timeout: -1
                        });
                    } else if (arr.length > 0 && arr1.length > 0 && ClearBr($scope.size).length - (arr.length + arr1.length) == 0) {
                        ycui.alert({
                            content: "以下尺寸不正确：" + arr1 + "<br/>" + "以下尺寸已存在:" + arr,
                            timeout: -1
                        });
                    } else if (arr1.length > 0) {
                        ycui.alert({
                            content: arr1 + "不是正确的尺寸，请重新填写",
                            timeout: -1
                        });
                    } else if (arr.length > 0 && ClearBr($scope.size).length - (arr.length + arr1.length) > 0) {
                        ycui.alert({
                            content: "该尺寸：" + arr + "已经被添加,其他的添加成功",
                            okclick: function () {
                                location.replace("sizeManage.html")
                            },
                            timeout: -1
                        });
                    } else {
                        ycui.alert({
                            content: "该尺寸：" + arr + "已经被添加",
                            timeout: -1
                        });
                    }
                }
            })
        }

        $(".form").validate({
            rules: {
                myText: "required"
            },
            messages: {
                myText: "请输入尺寸"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);