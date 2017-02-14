/**
 * Created by moka on 16-6-21.
 */
app.controller("tureAdCtrl", ["$scope", "$http", "DefaultOrdersFty",
    function ($scope, $http, DefaultOrdersFty) {
        $scope.checkStateSel = {
            list:[
                {name:'全部'},
                {name:'审核中',id:0},
                {name:'审核通过',id:1},
                {name:'审核不通过',id:-1},
            ]
        }
        $scope.priorityOrderSel = {
            list:[
                {name:'全部'},
                {name:'默认广告',id:0},
                {name:'紧急广告',id:99},
                {name:'审核不通过',id:-1},
            ]
        }

        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            if(!response){return}
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        var getAllDate = function (response) {
            if (response && response.code == 200) {
                $scope.clickAll = response.clickAll;
                $scope.pvAll = response.pvAll;
                $scope.totalMoney = response.totalMoney;
            }
        };

        $scope.$on('deOrderListGroup',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            DefaultOrdersFty.defaultOrdersList($scope.query).then(modView);
            DefaultOrdersFty.defaultOrderDataCount($scope.query).then(getAllDate);
        })

        //判断审核能不能跳转
        $scope.okChecked = function (id, priority, state, emergencyCheckState) {
            switch (priority){
                case 0:
                    var checkState = $scope.$parent.trueAdvertisementRule['EmergencyOrderReview'];
                    if (!checkState) {
                        ycui.alert({
                            content: "没有默认订单审核权限"
                        });
                        return
                    }
                    break;
                case 99:
                    var defaultCheckState = $scope.$parent.trueAdvertisementRule['DefaultOrderReview'];
                    if (!defaultCheckState) {
                        ycui.alert({
                            content: "没有紧急订单审核权限"
                        });
                        return
                    }
                    break;
            }



            if (state == 0) {   //紧急广告和启用状态
                if (emergencyCheckState != 0) {  //判断是不是审核中，不是就不能点
                    ycui.alert({
                        content: "该订单已被审核，不能重复审核"
                    })
                } else {
                    goRoute('ViewDefaultOrderCheck',{
                        id:id
                    })
                }
            }
        };

        $scope.query = {};
        $scope.queryValue = {};
        $scope.query.startDate = getDateFormat();
        $scope.query.endDate = getDateFormat();
        $scope.query.pageSize = 10;

        var orderId = getSearch("creativeToOrderId");
        if (orderId) {
            var a = {pageSize: 10, creativeToOrderId: orderId};
            DefaultOrdersFty.defaultOrdersList(a).then(modView);
            DefaultOrdersFty.defaultOrderDataCount(a).then(getAllDate);
        } else {
            DefaultOrdersFty.defaultOrdersList($scope.query).then(modView);
            DefaultOrdersFty.defaultOrderDataCount($scope.query).then(getAllDate);
        }

        //搜索框
        $scope.redirect = function (num,co) {
            ycui.loading.show();
            $scope.query.defaultOrderNameOrID = $scope.query.search;
            $scope.query.pageIndex = num || 1;
            DefaultOrdersFty.defaultOrdersList($scope.query).then(modView);
            DefaultOrdersFty.defaultOrderDataCount($scope.query).then(getAllDate);
        };

        $scope.goDefaultCreate = function(id,name){
            goRoute('ViewDefaultOrderCreate',{
                orderId:id,
                orderName:name
            },{
                stateWill:function(){
                    window.sessionStorage.removeItem('session_page_index');
                }
            })
        }

        //默认显示当天的时间

        var dateRange = new pickerDateRange('clientAff4', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            startDate: $scope.query.startDate,
            endDate: $scope.query.endDate,
            calendars: 2,
            inputTrigger: 'dateRange',
            success: function (obj) {
                ycui.loading.show();
                $scope.query.startDate = obj.startDate;
                $scope.query.endDate = obj.endDate;
                DefaultOrdersFty.defaultOrdersList($scope.query).then(modView);
                DefaultOrdersFty.defaultOrderDataCount($scope.query).then(getAllDate);
            }
        });

        $scope.changeState = function(state,id){
            function _changeState(res){
                if(res && res.code == 200){
                    ycui.alert({
                        content:res.msg,
                        timeout:10,
                        okclick:function(){
                            DefaultOrdersFty.defaultOrdersList($scope.query).then(modView);
                            DefaultOrdersFty.defaultOrderDataCount($scope.query).then(getAllDate);
                        }
                    })
                }
            }
            if(state == 0){
                ycui.confirm({
                    content: "<div>订单禁用后不可投放！</div>若重新开启，须重新进入审批流程<div> <div>请确认是否禁用该订单?</div>",
                    okclick: function () {
                        DefaultOrdersFty.enableOrder({state:~state,id:id}).then(_changeState)
                    }
                })
            }else{
                DefaultOrdersFty.enableOrder({state:~state,id:id}).then(_changeState)
            }
        }

    }]);
