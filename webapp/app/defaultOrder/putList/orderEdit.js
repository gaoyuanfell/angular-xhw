/**
 * Created by moka on 16-6-21.
 */
app.controller("trueAdvertisementEditCtrl", ["$scope", "$http", "DefaultOrdersFty",'ResMediaFty','$q',
    function ($scope, $http, DefaultOrdersFty,ResMediaFty,$q) {

        function initPickerDate(data){
            !function(da){
                var s = da.startTime?new Date(da.startTime).dateFormat():'';
                var e = da.endTime?new Date(da.endTime).dateFormat():'';
                new pickerDateRange(da.id, {
                    defaultText: ' / ',
                    isSingleDay: false,
                    stopToday: false,
                    stopTodayBefore: true,
                    calendars: 2,
                    shortbtn: 0,
                    startDate:s,
                    endDate:e,
                    success: function (data) {
                        da.startTime = data.startDate;
                        da.endTime = data.endDate;
                    }
                });
            }(data)
        }

        $scope.addDiv = function () {
            var id = 't' + Math.uuid();
            $scope.orderShowDates.push({id: id});
        }

        $scope.removeDiv = function (ev, index) {
            $scope.orderShowDates.splice(index, 1);
        }

        // ResMediaFty.listForDefautOrder().then(function (response) {
        //     $scope.media = response.mediaList;
        // });

        var mediaName = [];
        $scope.mediaNamePush = function(e,id,name){
            if(id != undefined){
                var checked = e.target.checked;
                if(checked){
                    mediaName.push({
                        id:id,
                        mediaName:name
                    });
                }else{
                    for(var i = 0;i<mediaName.length;i++){
                        var s = mediaName[i].id;
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



        var id = getSearch("id");
        ycui.loading.show();//$check
        var defaultOrdersDetail = DefaultOrdersFty.defaultOrdersDetail({id: id}).then(function (response) {
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
            var timeArrList = $scope.$on('timeArrList',function(){
                orderShowDates.forEach(function(data,index,da){
                    da.length - 1 != index && initPickerDate(data);
                })
                timeArrList();
            })
            
            $scope.orderShowDates = orderShowDates;
        })

        $scope.$on('timeArrList',function(){
            var length = $scope.orderShowDates.length;
            initPickerDate($scope.orderShowDates[length-1])
        })

        $q.all([defaultOrdersDetail]).then(function(){
            ResMediaFty.listForDefautOrder().then(function (response) {
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
            $scope.validate = true;
            var bo = false;
            $scope.mediaIds = mediaName.join(",");
            if($scope.priority != 99){
                $scope.orderShowDates = [{id: "calend1"}];
            }
            var timeArr = [];
            for (var i = 0; i < $scope.orderShowDates.length; i++) {
                var da = $scope.orderShowDates[i];
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
                id: +id,
                orderShowDates: timeArr,
                orderName: $scope.orderName,
                state: $scope.state,
                priority: $scope.priority,
                landingPage: $scope.landingPage,
                mediaList: mediaName
            }

            ycui.loading.show();
            DefaultOrdersFty.defaultOrdersUpdate(body).then(function(res){
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewDefaultOrder')
                        },
                        timeout: 10
                    });
                }
                ycui.loading.hide();
            })
        }

        //表单验证
        $(".fForm").validate({
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

        //订单状态弹出提示
        $scope.changeState = function () {
            if ($scope.showState == 1 && $scope.state == -1) {
                ycui.confirm({
                    content: "<div>订单禁用后不可投放！</div>若从新开启，须重新进入审批流程<div> <div>请确认是否禁用该订单?</div>",
                    noclick: function () {
                        $scope.$apply(function () {
                            $scope.state = 0
                        })
                    }
                })
            }
        };
    }]);