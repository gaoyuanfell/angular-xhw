/**
 * Created by moka on 16-6-21.
 */
app.controller("trueAdvertisementAuditCtrl", ["$scope", "$http", "DefaultOrdersFty",'ResMediaFty','$q',
    function ($scope, $http, DefaultOrdersFty,ResMediaFty,$q) {

        // function initPickerDate(data){
        //     !function(da){
        //         var s = da.startTime?new Date(da.startTime).dateFormat():'';
        //         var e = da.endTime?new Date(da.endTime).dateFormat():'';
        //         new pickerDateRange(da.id, {
        //             defaultText: ' 至 ',
        //             isSingleDay: false,
        //             stopToday: false,
        //             stopTodayBefore: true,
        //             calendars: 2,
        //             shortbtn: 0,
        //             startDate:s,
        //             endDate:e,
        //             success: function (data) {
        //                 da.startTime = data.startDate;
        //                 da.endTime = data.endDate;
        //             }
        //         });
        //     }(data)
        // }

        // $scope.addDiv = function () {
        //     var id = 't' + Math.uuid();
        //     $scope.orderShowDates.push({id: id});
        // }

        // $scope.removeDiv = function (ev, index) {
        //     $scope.orderShowDates.splice(index, 1);
        // }

        // ResMediaFty.listForOrder().success(function (response) {
        //     $scope.media = response.mediaList;
        // });

        // var mediaName = [];
        // $scope.mediaNamePush = function(e,id,name){
        //     if(id != undefined){
        //         var checked = e.target.checked;
        //         if(checked){
        //             mediaName.push({
        //                 id:id,
        //                 mediaName:name
        //             });
        //         }else{
        //             for(var i = 0;i<mediaName.length;i++){
        //                 var s = mediaName[i].id;
        //                 if(s == id){
        //                     mediaName.splice(i,1);
        //                     break;
        //                 }
        //             }
        //         }
        //     }else{
        //         return mediaName.length;
        //     }
        // }


        $scope.emergencyCheckState = 1
        var id = getSearch("id");
        ycui.loading.show();//$check
        var defaultOrdersDetail = DefaultOrdersFty.defaultOrdersDetail({id: id}).success(function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.orderName = response.order.orderName
            $scope.priority = response.order.priority
            $scope.showState = response.order.showState
            $scope.landingPage = response.order.landingPage
            $scope.mediaIds = response.order.mediaIds
            $scope.mediaNames = response.order.mediaNames
            mediaName = $scope.mediaLista = response.order.mediaList
            $scope.state = response.order.state
            $scope.orderShowDates = [];

            var orderShowDates = [];
            if ($scope.priority == 99) {
                for (var i = 0; i < response.order.orderShowDates.length; i++) {
                    orderShowDates.push({
                        id: "calend" + i,
                        "startTime": new Date(response.order.orderShowDates[i].startDate).dateFormat(),
                        "endTime": new Date(response.order.orderShowDates[i].endDate).dateFormat()
                    });
                }
            }
            // var timeArrList = $scope.$on('timeArrList',function(){
            //     orderShowDates.forEach(function(data,index,da){
            //         da.length - 1 != index && initPickerDate(data);
            //     })
            //     timeArrList();
            // })
            
            $scope.orderShowDates = orderShowDates;
        })

        // $scope.$on('timeArrList',function(){
        //     var length = $scope.orderShowDates.length;
        //     initPickerDate($scope.orderShowDates[length-1])
        // })

        $q.all([defaultOrdersDetail]).then(function(){
            ResMediaFty.listForOrder().success(function (response) {
                var m = $scope.mediaIds.split(',');
                var list = response.mediaList;
                for(var i = 0;i<list.length;i++){
                    if(m.indexOf(String(list[i].id)) != -1){
                        list[i].$check = true;
                    }
                }
                $scope.media = list;
            });
        })

        $scope.postEdit = function(){
            var pass = true;
            if ($scope.emergencyCheckState == 1) {
                pass = false;
                ycui.confirm({
                    content: "请确定是否将此订单设为审核通过？",
                    okclick: function () {
                        var id = parseInt(getSearch("id"));
                        DefaultOrdersFty.defaultOrderCheck({
                            id: id,
                            emergencyCheckState: 1
                        }).success(function (response) {
                            if (response.code == 200) {
                                ycui.alert({
                                    content: response.msg,
                                    okclick: function () {
                                        goRoute('ViewDefaultOrder')
                                    }
                                });
                            }
                        })
                    }
                });
            }

            if (pass) {
                var id = parseInt(getSearch("id"));
                DefaultOrdersFty.defaultOrderCheck({
                    id: id,
                    emergencyRemark: $scope.emergencyRemark,
                    emergencyCheckState: $scope.emergencyCheckState
                }).success(function (response) {
                    if (response && response.code == 200) {
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                goRoute('ViewDefaultOrder')
                            }
                        });
                    }
                })
            }
        }
    }]);