/**
 * Created by moka on 16-6-21.
 */
app.controller("trueAdvertisementAddCtrl", ['$scope', '$http','ResMediaFty','DefaultOrdersFty',
    function ($scope, $http,ResMediaFty,DefaultOrdersFty) {
        $scope.state = 0;
        $scope.priority = 0;
        $scope.landingPage = "http://";
        $scope.timeArr = [];
        //获取媒体名称
        ResMediaFty.listForDefautOrder().success(function (response) {
            $scope.media = response.mediaList;
        });

        function initPickerDate(data){
            !function(da){
                new pickerDateRange(da.id, {
                    defaultText: ' / ',
                    isSingleDay: false,
                    stopToday: false,
                    stopTodayBefore: true,
                    calendars: 2,
                    shortbtn: 0,
                    success: function (data) {
                        da.startTime = data.startDate;
                        da.endTime = data.endDate;
                    }
                });
            }(data)
        }

        $scope.timeArr = [{id: "calend1"}];

        $scope.$on('timeArrList',function(){
            var length = $scope.timeArr.length;
            initPickerDate($scope.timeArr[length-1])
        })

        $scope.addDiv = function () {
            var id = 't' + Math.uuid();
            $scope.timeArr.push({id: id});
        }

        $scope.removeDiv = function (ev, index) {
            $scope.timeArr.splice(index, 1);
        }

        var mediaName = [];
        $scope.mediaNamePush = function(e,id){
            if(id != undefined){
                var checked = e.target.checked;
                if(checked){
                    mediaName.push(id);
                }else{
                    for(var i = 0;i<mediaName.length;i++){
                        var s = mediaName[i];
                        if(s == id){
                            mediaName.splice(i,1);
                            break;
                        }
                    }
                }
            }else{
                return mediaName.length;
            }
        }

        $scope.postEdit = function () {
            $scope.validate = true;
            var bo = false;
            $scope.mediaIds = mediaName.join(",")
            if($scope.priority != 99){
                $scope.timeArr = [{id: "calend1"}];
            }
            var timeArr = [];
            for (var i = 0; i < $scope.timeArr.length; i++) {
                var da = $scope.timeArr[i];
                if (da.startTime && da.endTime) {
                    timeArr.push({
                        startTime: da.startTime,
                        endTime: da.endTime
                    })
                }
            }
            if (!$(".form").valid()) {bo = true;}
            if(!$scope.mediaIds){bo = true;}
            if(bo){return};

            var body = {
                orderShowDates: timeArr,
                orderName: $scope.orderName,
                state: $scope.state,
                priority: $scope.priority,
                landingPage: $scope.landingPage,
                mediaIds: $scope.mediaIds
            }

            ycui.loading.show();
            DefaultOrdersFty.defaultOrdersAdd(body).success(function(res){
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            if ($scope.state == '0') {
                                goRoute('ViewDefaultOrderCreateAdd',{
                                    orderId:res.orderId,
                                    orderName:res.orderName
                                })
                            } else {
                                goRoute('ViewDefaultOrder')
                            }
                        },
                        timeout: 10
                    });
                }
            })

        }
        //表单验证
        $(".form").validate({
            rules: {
                orderName: "required",
                myUrl: {
                    required: true,
                    url: true
                }
            },
            messages: {
                orderName: '必须填入订单名称',
                myUrl: {
                    required: '必须填入落地页地址'
                }
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);