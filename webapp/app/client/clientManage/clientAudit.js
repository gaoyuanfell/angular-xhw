/**
 * Created by moka on 16-6-16.
 */
app.controller('auditCtrl', ['$scope', '$http', 'CustomerFty',
    function ($scope, $http, CustomerFty) {
        $scope.clientModel = {customerState:1};

        //获取修改信息															
        var id = parseInt(getSearch("id"));
        ycui.loading.show();
        CustomerFty.getCustomer({id: id}).success(function (response) {
            ycui.loading.hide();
            if (response && response.code == 200) {
                delete response.items.updateTime;
                delete response.items.createTime;
                $scope.clientModel = response.items;
                
                $scope.clientModel.customerState = 1;//默认门审核通过

                $scope.labelClientList = $scope.clientModel.flowUsers;
                $scope.clientList = $scope.clientModel.customerContacts;
            }
        });

        ycui.select(".yc-select");
        
        function post() {
            CustomerFty.reviewCustomer($scope.clientModel).success(function (res) {
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            location.replace("clientManageh.html")
                        },
                        timeout: -1
                    });
                }
            })
        }
        
        $scope.postEdit = function () {
            if($scope.clientModel.customerState == 1){
                ycui.confirm({
                    content: "请确定是否将此客户设为审核通过？",
                    timeout:-1,
                    okclick: function () {
                        post();
                    }
                })
            }else{
                post();
            }
        };
    }]);