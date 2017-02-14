/**
 * Created by moka on 16-6-17.
 */
app.controller("mediaAddCtrl", ['$scope', '$http', 'ResMediaFty','$q',
    function ($scope, $http, ResMediaFty,$q) {
        $scope.companyListSel = {}
        var companyList = ResMediaFty.companyList().then(function (res) {
            if (res && res.code == 200) {
                $scope.companyListSel.list = res.companyList;
            }
        });
        $scope.medias = [];

        function addMedia(){
            $scope.medias.push({
                url: "http://",
                mediaType:1,
                companyListSel:angular.copy($scope.companyListSel)
            })
        }

        $q.all([companyList]).then(function(){
            addMedia()
        })

        $scope.addMedia = function () {
            addMedia()
        };

        $scope.removeMedia = function (index) {
            $scope.medias.splice(index, 1);
        };

        $scope.postEdit = function () {
            var info = "";
            var pass = false;
            var regUrl = /^((https?|ftp|news):\/\/)?([a-z]([a-z0-9\-]*[\.。])+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&]*)?)?(#[a-z][a-z0-9_]*)?$/;
            for (var i = 0; i < $scope.medias.length; i++) {
                var data = $scope.medias[i];
                if (!data.mediaName) {
                    info = '请填写媒体名称';
                    pass = true;
                    break;
                }
                if (!data.companyId) {
                    info += ' 请选择公司';
                    pass = true;
                    break;
                }
                if (!data.mediaType) {
                    info += ' 请选择媒体类型';
                    pass = true;
                    break;
                }
                if (!regUrl.test(data.url)) {
                    info += ' 请正确填写域名';
                    pass = true;
                    break;
                }
            }
            // $(".form")
            //     .find('.error-message')
            //     .remove();
            // $(".yc-resourse:eq(" + i + ")").after('<span class="error-message" style="line-height: 50px;">' + info + '</span>');

            if (pass) {
                return;
            }
            ycui.loading.show()
            ResMediaFty.mediaAdd({medias: $scope.medias}).then(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewMediaChannelADSpace1')
                        },
                        timeout: 10
                    })
                } else if (response && response.code == 201) {
                    if ($scope.medias.length == response.msg.usedNames.length) {
                        ycui.alert({
                            error:true,
                            content: "此媒体名称：" + response.msg.usedNames + "已经被注册",
                            timeout: 10
                        });
                        $scope.medias = [];
                    } else {
                        ycui.alert({
                            content: "此媒体名称：" + response.msg.usedNames + "已经被注册,其它注册成功",
                            timeout: 10,
                            okclick: function () {
                                goRoute('ViewMediaChannelADSpace1')
                            }
                        });
                    }
                }
            })
        }
    }]);