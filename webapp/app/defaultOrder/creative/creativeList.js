/**
 * Created by moka on 16-6-21.
 */
app.controller("trueCreateListCtrl", ["$scope", "$http", "DefaultOrdersFty", '$q',
    function ($scope, $http, DefaultOrdersFty, $q) {
        $scope.checkStateSel = {
            list:[
                {name:'全部',id:-2},
                {name:'审核中',id:0},
                {name:'审核通过',id:1},
                {name:'审核不通过',id:-1},
            ]
        }
        $scope.defaultOrderSel = {
            callback:function(e,d){
                if(d){
                    $scope.queryValue.orderName = d.orderName
                    $scope.query.orderId = d.id
                }
            },
            sessionBack:function(d){
                $scope.queryValue.orderName = d.orderName
                $scope.query.orderId = d.id
            }
        };

        //获取默认订单的名称下拉
        var defaultOrdersNameSearch = DefaultOrdersFty.defaultOrdersNameSearch().success(function (response) {
            $scope.defaultOrderSel.list = response.defaultOrdersList;
        });

        $scope.$on('deCreateListGroup',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            DefaultOrdersFty.defaultAdCreativeList($scope.query).success(modViewA);
            DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).success(getDataCount);
        })

        ycui.loading.show();
        var modViewA = function (response) {
            ycui.loading.hide();
            if (!response) {return}
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        var getDataCount = function (response) {
            if (response.code == 200) {
                $scope.clickAll = response.clickAll;
                $scope.pvAll = response.pvAll;
            }
        };

        $scope.query = {};
        $scope.queryValue = {};
        $scope.query.startDate = getDateFormat();
        $scope.query.endDate = getDateFormat();
        $scope.query.pageSize = 10;
        
        //保存查询条件
        // if (window.sessionStorage.getItem("trueCreateSession")) {
        //     var query = JSON.parse(window.sessionStorage.getItem("trueCreateSession")) || {};
        //     var queryValue = JSON.parse(window.sessionStorage.getItem('trueCreateValueSession')) || {};
        //     angular.extend($scope.query, query);
        //     angular.extend($scope.queryValue, queryValue);
        // }else{
        //     window.sessionStorage.setItem("trueCreateSession", JSON.stringify($scope.query));
        //     window.sessionStorage.setItem("trueCreateValueSession", JSON.stringify($scope.queryValue));
        // }
        
        var id = getSearch("orderId");
        var orderName = getSearch('orderName');
        $scope.query.orderId = id;
        $scope.queryValue.orderName = orderName;

        DefaultOrdersFty.defaultAdCreativeList($scope.query).success(modViewA);
        DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).success(getDataCount);

        //判断审核能不能跳转
        $scope.okChecked = function (id, priority, state, emergencyCheckState) {
            switch (priority) {
                case 0:
                    var checkState = $scope.$parent.trueAdvertisementRule['EmergencyCreativeAudit'];
                    if (!checkState) {
                        ycui.alert({
                            content: "没有默认创意审核权限"
                        });
                        return
                    }
                    break;
                case 99:
                    var defaultCheckState = $scope.$parent.trueAdvertisementRule['DefaultCreativeReview'];
                    if (!defaultCheckState) {
                        ycui.alert({
                            content: "没有紧急创意审核权限"
                        });
                        return
                    }
                    break;
            }

            if (state == 0) {   //紧急广告和启用状态
                if (emergencyCheckState != 0) {  //判断是不是审核中，不是就不能点
                    ycui.alert({
                        content: "该创意已被审核，不能重复审核"
                    })
                } else {
                    DefaultOrdersFty.defaultAdCreativeDetail({id: id}).success(function (data) {
                        var url = data.adCreative.fileHttpUrl;
                        var wh = data.adCreative.size.split("*");
                        var landingPage = data.adCreative.landingPage;
                        var adCreativeName = data.adCreative.adCreativeName;
                        var html = photoAndSwfPreview({
                            src: url,
                            width: 500,
                            height: 250,
                            size: wh,
                            landingPage: landingPage
                        });
                        $scope._okCheckedModule = data.adCreative || {};
                        $scope._okCheckedModule.$html = html;
                        $scope._okCheckedModule.$emergencyCheckState = 1;

                        $scope.okCheckedModule = {
                            title:"创意审核",
                            okClick:function(){
                                var check = $scope._okCheckedModule.$emergencyCheckState
                                var remark = $scope._okCheckedModule.$emergencyRemark
                                if(check == -1 && !remark){
                                    $scope._okCheckedModule.$valid = true;
                                    return true;
                                }
                                var query = {id: id, emergencyCheckState: check};
                                remark && (query.emergencyRemark = remark);
                                DefaultOrdersFty.checkEmergencyCheck(query).success(function (res) {
                                    if(res && res.code == 200){
                                        ycui.alert({
                                            content:res.msg,
                                            timeout:10,
                                            okclick:function(){
                                                DefaultOrdersFty.defaultAdCreativeList($scope.query).success(modViewA);
                                                DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).success(getDataCount);
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }
        };

        $scope.goOrderDefault = function(id){
            goRoute('ViewDefaultOrder',{
                creativeToOrderId:id
            },{
                stateWill:function(){
                    window.sessionStorage.removeItem('session_page_index');
                }
            })
        }

        //默认广告图片预览
        $scope.showPhoto = function (url, name, size, landingPage) {
            var wh = size.split("*");
            ycui.alert({
                content: "<div> " + photoAndSwfPreview({
                    src: url,
                    width: 700,
                    height: 350,
                    size: wh,
                    landingPage: landingPage
                }) + "</div>",
                timeout: 10,
                title: "【" + name + "】创意预览"
            })
        }

        //全选和全不选
        // var arrId = [];
        // var secValue = 0;
        // var oCheckIpt = document.getElementById("checkIpt");
        // var oTbody = document.getElementById("tBody");
        // var aIpt = oTbody.getElementsByTagName("input");
        // oCheckIpt.onclick = function () {
        //     for (var i = 0; i < aIpt.length; i++) {
        //         aIpt[i].checked = oCheckIpt.checked;
        //     }
        // }

        // setTimeout(function () {
        //     for (var i = 0; i < aIpt.length; i++) {
        //         aIpt[i].onclick = function () {
        //             var count = 0;
        //             for (var i = 0; i < aIpt.length; i++) {
        //                 if (aIpt[i].checked == true) {
        //                     count++;
        //                 }
        //             }
        //             if (count == aIpt.length) {
        //                 oCheckIpt.checked = true;
        //             } else {
        //                 oCheckIpt.checked = false;
        //             }
        //         }
        //     }
        // }, 1000)

        $scope.setMore = function () {
            var arrTrue = [];
            for (var i = 0; i < aIpt.length; i++) {
                if (aIpt[i].checked) {
                    arrTrue.push(aIpt[i])
                }
            }

            if (arrTrue.length == 0) {
                ycui.alert({
                    content: "请至少选择一个"
                });
            } else {
                var arrId = [];
                for (var i = 0; i < arrTrue.length; i++) {
                    arrId.push({
                        "adCreativeName": arrTrue[i].getAttribute("data-name"),
                        "id": arrTrue[i].getAttribute("data-id")
                    })
                }
                ycui.confirm({
                    content: '请确认，您将批量删除所选择的创意',
                    okclick: function () {
                        DefaultOrdersFty.defaultAdCreativeDelete({"creatives": arrId}).success(function (response) {
                            if (response.code == 200) {
                                ycui.alert({
                                    content: response.msg,
                                    okclick: function () {
                                        DefaultOrdersFty.defaultAdCreativeList($scope.query).success(modViewA);
                                        DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).success(getDataCount);
                                    }
                                });
                            } else if (response.code == 201) {
                                ycui.alert({
                                    content: response.hasPVNames.join(",") + "创意有投放数据，不能删除",
                                    okclick: function () {
                                        DefaultOrdersFty.defaultAdCreativeList($scope.query).success(modViewA);
                                        DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).success(getDataCount);
                                    }
                                });
                            }
                        })
                    }
                })
            }
        };

        $scope.creativeCheckAll = function(e){
            if(!$scope.items){
                return;
            }
            var bo = e.target.checked;
            for(var i = 0;i<$scope.items.length;i++){
                var data = $scope.items[i];
                data.$check = bo;
            }
        }

        $scope.deleteCreate = function (id, name,state) {
            var body = {creatives:[]};
            var arrCreate = body.creatives;
            if(id){
                arrCreate.push({adCreativeName: name, id: id});
                body.state = ~state
            }else{
                body.state = -1;
                for(var i = 0;i<$scope.items.length;i++){
                    var data = $scope.items[i];
                    if(data.$check){
                        arrCreate.push({
                            adCreativeName:data.adCreativeName,
                            id:data.id
                        })
                    }
                }
                if(arrCreate.length == 0){
                    ycui.alert({
                        error:true,
                        content:'请选择需要禁用的创意！'
                    });
                    return
                }
            }
            var msg = "请确认，您将执行禁用操作";
            if(state == -1 && id){
                msg = "请确认，您将执行启用操作";
            }
            ycui.confirm({
                content: msg,
                okclick: function () {
                    DefaultOrdersFty.defaultAdCreativeEnable(body).success(function (response) {
                        if (response.code == 200) {
                            ycui.alert({
                                content: response.msg,
                                okclick: function () {
                                    DefaultOrdersFty.defaultAdCreativeList($scope.query).success(modViewA);
                                    DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).success(getDataCount);
                                }
                            });
                        } else if (response.code == 201) {
                            ycui.alert({
                                error:true,
                                content: response.hasPVNames.join(",") + "已有投放数据，不能操作",
                                timeout: 10
                            });
                        }else if(response.code == 403){
                            ycui.alert({
                                error:true,
                                content: response.noRightNames.join(",") + "权限不够，不能操作",
                                timeout: 10
                            });
                        }
                    })
                }
            })
        };


        /*搜索框*/
        $scope.redirect = function (num,con) {
            ycui.loading.show();
            $scope.query.adCreativeNameOrId = $scope.query.search;
            DefaultOrdersFty.defaultAdCreativeList($scope.query).success(modViewA);
            DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).success(getDataCount);
        };

        var dateRange = new pickerDateRange('clientAff', {
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
                $scope.query.pageIndex = 1;
                DefaultOrdersFty.defaultAdCreativeList($scope.query).success(modViewA);
                DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).success(getDataCount);
            }
        });
    }])