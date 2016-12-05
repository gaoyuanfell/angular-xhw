/**
 * Created by moka on 16-6-17.
 */
app.controller("mediaEditCtrl", ['$scope', '$http', 'ResMediaFty',
    function ($scope, $http, ResMediaFty) {
        // ResMediaFty.companyList().success(function (res) {
        //     if (res && res.code == 200) {
        //         $scope.companyList = res.companyList;
        //     }
        // });

        var id = getSearch("id");
        ycui.loading.show();
        ResMediaFty.getMedia({id: id}).success(function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.medias = [{
                id: id,
                mediaName: response.mediaName,
                mediaType: response.mediaType,
                companyId: response.companyId,
                companyName: response.companyName,
                url: response.url
            }];
        });

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
            if (pass) {
                return;
            }
            ycui.loading.show();
            ResMediaFty.mediaUpdate($scope.medias[0]).success(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewMediaChannelADSpace1')
                        },
                        timeout: 10
                    });
                }
            })
        }
    }]);