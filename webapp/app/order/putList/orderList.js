/**
 * Created by moka on 16-6-21.
 */
app.controller('putListCtrl', ["$scope", "$http", "OrdersFty", "SysRuleUserFty", "CustomerFty","$q","FlowFty",'SysUserFty','ConfigFty',
    function ($scope, $http, OrdersFty, SysRuleUserFty, CustomerFty,$q,FlowFty,SysUserFty,ConfigFty) {
        //获取客户名称
        $scope.customerSel = {}
        $scope.showStateSel = {
            list:[
                {name:'待投放',id:0},
                {name:'投放中',id:1},
                {name:'已暂停',id:2},
                {name:'已完结',id:3},
                {name:'已撤销',id:4},
                {name:'已作废',id:5},
            ]
        }
        $scope.showStateSel = {
            list:[
                {name:'待投放',id:0},
                {name:'投放中',id:1},
                {name:'已暂停',id:2},
                {name:'已完结',id:3},
                {name:'已撤销',id:4},
                {name:'已作废',id:5}
            ]
        }
        $scope.checkNamesSel = {}

        $scope.orderTypeSel = {
            list:[
                {name:'预定广告位',id:1},
                {name:'正式投放',id:2},
                {name:'试用推广',id:3},
                {name:'自用推广',id:4},
                {name:'补偿刊登',id:5}
            ]
        }
        var getPartCustomer = CustomerFty.getCustomerInOrder({customerType: 2}).then(function (res) {
            if (res && res.code == 200) {
                $scope.customerSel.list = res.items;
            }
        });

        //获取审核流程名称
        var checkNames = FlowFty.checkNames().then(function(res){
            if(res && res.code == 200){
                var arr = res.checkNames;
                arr.push('审核通过','审核未通过');
                $scope.checkNamesSel.list = arr.map(function(a){
                    return {
                        id:a,
                        name:a
                    }
                })
            }
        })

        ycui.loading.show();
        var pageSize = 10;
        var modView = function (response) {
            ycui.loading.hide();
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;

            $scope.hasDataRights = response.hasDataRights;
            // $scope.query.scheduleCodeCheck = false;
        };

        var getAllDate = function (response) {
            if (response.code == 200) {
                $scope.clickAll = response.clickAll;
                $scope.pvAll = response.pvAll;
                $scope.totalMoney = response.totalMoney;
            }
        };

        //用户名称
        var customerId = getSearch('customerId');
        var customerName = getSearch('customerName');
        var creativeToOrderId = getSearch('creativeToOrderId');
        $scope.query = {};
        $scope.queryValue = {};
        $scope.query.startDate = getDateFormat();
        $scope.query.endDate = getDateFormat();
        $scope.query.pageSize = pageSize;
        $scope.query.customerId = customerId;
        $scope.queryValue.customerName = customerName;

        // 如果有需要审核的订单 默认显示本角色下的需要审核的订单
        // var checkOrdersCount = top.window.document.querySelector('._checkOrdersCount');
        // if(checkOrdersCount){
        //     var num = parseInt(checkOrdersCount.innerText);
        //     if(num > 0){
        //         $scope.query.inCheck = 1;
        //     }
        // }
        var getCheckOrdersCount = SysUserFty.getCheckOrdersCount().then(function (res) {
            if (res && res.code == 200) {
                var count = res.count;
                if(count > 0){
                    $scope.query.inCheck = 1;
                }else{
                    $scope.query.inCheck = 0;
                }
            }
        });

        function showCheckFun(target,than) {
            if(target){
                for(var i = 0;i<target.length;i++){
                    if(than.indexOf(Number(target[i])) != -1){
                        return true;
                    }
                }
                return false;
            }
            return false;
        }
        $scope.showCheck = function (info,item) {
            var checkRoleIds;
            info.every(function (da) {
                if(da.checkStepState == 0){
                    checkRoleIds = da.checkRoleIds;
                    return false;
                }
                return true;
            })
            if(checkRoleIds){
                var list = checkRoleIds.replace(/^\,/g,'').replace(/\,$/g,'').split(',');
                item.checkList = list || []
            }
        };
        $scope.$on('loginUserInfo',function (e, data) {
            var userInfo = SysUserFty.userInfo({id: data.id}).then(function (res) {
                if (res) {
                    var list = [];
                    res.roleList.forEach(function (da) {
                        list.push(da.id);
                    })
                    $scope.$watch('items',function (newV, oldV) {
                        if(newV != oldV && newV){
                            newV.forEach(function (da) {
                                var bo = showCheckFun(da.checkList,list);//判断是否有角色审核
                                var state = da.showState == 0 || da.showState == 1 || da.showState == 2;//判断 是否 0=未投放|1=投放中|2=暂停投放

                                //判断审核前两步用户部门和数据之间的包含关系
                                var orderCheckInfo;
                                da.orderCheckInfos && da.orderCheckInfos.forEach(function(da){
                                    if((da.checkStep == 1 || da.checkStep == 2) && da.checkStepState == 0){
                                        orderCheckInfo = da;
                                    }
                                })
                                var InDepBo = true;
                                if(orderCheckInfo){
                                    InDepBo = da.orderInDepScope.indexOf(res.agencyNumber) != -1;
                                }
                                
                                da.showCheckBo = state && bo && InDepBo
                            })
                        }
                    });
                }
            });

            

            $q.all([userInfo,getCheckOrdersCount]).then(function () {
                if (customerName) {
                    OrdersFty.ordersList($scope.query).then(modView);
                    $scope.query.inCheck != 1 && OrdersFty.orderDataCount($scope.query).then(getAllDate);
                } else if (creativeToOrderId) {
                    OrdersFty.ordersList({creativeToOrderId: creativeToOrderId}).then(modView);
                    $scope.query.inCheck != 1 && OrdersFty.orderDataCount({creativeToOrderId: creativeToOrderId}).then(getAllDate);
                } else {
                    OrdersFty.ordersList($scope.query).then(modView);
                    $scope.query.inCheck != 1 && OrdersFty.orderDataCount($scope.query).then(getAllDate);
                }
            })
        })



        //订单跳转到创意列表
        $scope.putCreateManage = function (id, name,type) {
            goRoute('ViewPutOrderCreate',{
                orderId:id,
                orderName:name,
                orderType:type
            },{
                stateWill:function(){
                    window.sessionStorage.removeItem('session_page_index');
                }
            })
        };

        //搜索框
        $scope.redirect = function (num,con) {
            ycui.loading.show();
            $scope.query.ordersNameOrID = $scope.query.search;
            $scope.query.pageIndex = num || 1;
            OrdersFty.ordersList($scope.query).then(modView);
            $scope.query.inCheck != 1 && OrdersFty.orderDataCount($scope.query).then(getAllDate);
        };

        $scope.$on('putListGroup',function(){
            $scope.query.pageIndex = 1;
            ycui.loading.show();
            OrdersFty.ordersList($scope.query).then(modView);
            $scope.query.inCheck != 1 && OrdersFty.orderDataCount($scope.query).then(getAllDate);
        })

        //点击跳转到客户列表页面 获取客户权限

        $scope.returnToClientShow = true;
        $scope.returnToClientStyle = {
            color: "#9f9f9f"
        };
        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 3}).then(function (data) {
            if (data.code != 200) return false;
            if (data.items.length > 0)
                $scope.returnToClientShow = false, $scope.returnToClientStyle = {}
            else
                return false;
        });

        $scope.returnToClient = function (id) {
            if ($scope.returnToClientShow) return;
            CustomerFty.getCustomer({id: id}).then(function (response) {
                if (response.code == 200) {
                    goRoute('ViewCustomer',{
                        paramInt1:id
                    },{
                        stateWill:function(){
                            window.sessionStorage.removeItem('session_page_index');
                        }
                    })
                }
            })
        };

        ///////////////////////////

        /**
         * 订单批量审核
         * @param bo
         */
        // $scope.scheduleCheckAll = function (bo) {
        //     $scope.items.forEach(function (da) {
        //         da.scheduleCodeCheck = bo
        //     })
        // };

        /**
         * 批量审核按钮 显示
         * @returns {boolean}
         */
        // $scope.batchCheckShow = function () {
        //     var s = ['BranchCompanyFirstInstance','BranchCompanySecondInstance','HeadCompanyFirstInstance','HeadCompanySecondInstance']
        //     var _bo = ($scope.query.checkState == 1 || $scope.query.checkState == 2 || $scope.query.checkState == 3 || $scope.query.checkState == 4)
        //     var __bo = false;
        //     s.forEach(function (da) {
        //         if($scope._$parent.putManageRule[da]){
        //             __bo = true;
        //         }
        //     });
        //     return _bo && __bo
        // };

        // $scope.batchCheck = function () {
        //     var _body = [];
        //     $scope.items.forEach(function (da) {
        //         if(da.scheduleCodeCheck){
        //             _body.push(da)
        //         }
        //     });
        //     if(_body.length == 0){
        //         ycui.alert({
        //             content:'请选择批量操作的订单！'
        //         });
        //         return
        //     }
        //     var checkState = 1;
        //     var checkRemark = '';
        //     var $textarea = void 0;
        //     var html = '<div class="yc-row"><div class="yc-col-3" text-right>审核状态 ：</div><div class="yc-col-9"><div class="yc-select yc-select4" style="float: left"><div style="width:142px;" class="yc-select-current">审核通过</div> <i class="yc-icon">&#xe605;</i><ul class="yc-select-options"><li data-value="1">审核通过</li><li data-value="-1">未通过</li></ul></div></div></div><div class="yc-row hide textareaShow"><div class="yc-col-3" style="text-align: right">备注 ：</div><div class="yc-col-9" style="float: left;"><textarea name="textareaValue" style="height:90px;width: 170px; border: 1px solid #CCCCCC;float: left;" maxlength="200"></textarea><span id="textareaTextNum">剩余200字节</span></div></div>'
        //     ycui.confirm({
        //         title:'订单批量审核',
        //         content:'<div class="clear">'+ html +'</div>',
        //         okclick:function () {
        //             if (checkState == -1 && !checkRemark) {
        //                 $textarea.css('border', '1px solid red');
        //                 return true;
        //             }
        //             var body = [];
        //             _body.forEach(function (da) {
        //                 body.push({
        //                     orderId:da.id,
        //                     orderName:da.orderName,
        //                     checkState:checkState,
        //                     checkRemark:checkRemark
        //                 })
        //             });
        //             OrdersFty.batchCheck({orderCheckInfos:body}).then(function (res) {
        //                 if(res && res.code == 200){
        //                     ycui.alert({
        //                         content:res.msg,
        //                         timeout:-1,
        //                         okclick:function () {
        //                             OrdersFty.ordersList($scope.query).then(modView);
        //                             OrdersFty.orderDataCount($scope.query).then(getAllDate);
        //                         }
        //                     });
        //                 }else if(res && res.code == 201){
        //                     var html = '';
        //                     if(res.checkOrders && res.checkOrders.length > 0){
        //                         html += '<p>' + '审核成功：' + res.checkOrders.join('，') + '<p>'
        //                     }
        //                     if(res.noCheckOrders && res.noCheckOrders.length > 0){
        //                         html += '<p>' + '无需审核：' + res.noCheckOrders.join('，') + '<p>'
        //                     }
        //                     if(res.noRightsOrders && res.noRightsOrders.length > 0){
        //                         html += '<p>' + '无审核权限：' + res.noRightsOrders.join('，') + '<p>'
        //                     }
        //                     if(res.errorOrders && res.errorOrders.length > 0){
        //                         html += '<p>' + '审核失败：' + res.errorOrders.join('，') + '<p>'
        //                     }
        //                     ycui.alert({
        //                         content:'<div style="margin: 10px;text-align: left;max-width: 700px;overflow-y: auto;max-height: 300px;">'+ html +'</div>',
        //                         timeout:-1,
        //                         okclick:function () {
        //                             OrdersFty.ordersList($scope.query).then(modView);
        //                             OrdersFty.orderDataCount($scope.query).then(getAllDate);
        //                         }
        //                     });
        //                 }
        //             });
        //         },
        //         render:function () {
        //             ycui.select('.yc-select4', function (data) {
        //                 checkState = +data.attr('data-value');
        //                 if (checkState == -1) {
        //                     $(".textareaShow").show();
        //                 } else {
        //                     $(".textareaShow").hide();
        //                 }
        //             });
        //             $textarea = $("textarea[name=textareaValue]");
        //             $textarea.on("input", function () {
        //                 checkRemark = $(this).val();
        //                 var s = 200 - +$(this).val().length;
        //                 $("#textareaTextNum").text("剩余" + s + "字节")
        //             })
        //         }
        //     });
        // };
        //////////////////////////

        //投放图标的显示隐藏
        $scope.showIconState = function (event) {
            $(event.target).next().css("display", "inline-block")
        };
        $scope.hideIconState = function (event) {
            $(event.target.parentNode).find("i:eq(1)").hide();
        };

        //点击的时候获取接口
        $scope.changeState = function (id, state) {
            var queryApi = {id: id, showState: state};
            ycui.loading.show();
            OrdersFty.changeShowState(queryApi).then(function (response) {
                ycui.loading.hide();
                if (response.code == 200) {
                    OrdersFty.ordersList($scope.query).then(modView);
                    $scope.query.inCheck != 1 && OrdersFty.orderDataCount($scope.query).then(getAllDate);
                }
            })
        };

        /**
         * 撤销 终止 type 1 预订订单 2 非预定
         */
        $scope.orderCancel = function (id,type,orderName) {

            var title = '订单撤销';
            var placeholder = '请输入撤销操作的原因，最多200字；'
            if(type != 1){
                title = '订单作废';
                placeholder = '请输入作废操作的原因，最多200字；'
            }

            $scope.orderCancelModule = {
                title: title,
                okClick: function(){
                    this.$valid = true;
                    var query = {id:id};
                    if(!this.data.remark){
                        return true;
                    }
                    query.remark = this.data.remark;

                    if(type == 1){
                        OrdersFty.orderCancel(query).then(orderCancelOrTerminate);
                    }else{
                        OrdersFty.orderTerminate(query).then(orderCancelOrTerminate);
                    }
                    function orderCancelOrTerminate(res){
                        if(res && res.code == 200){
                            ycui.alert({
                                content:res.msg,
                                timeout:10,
                                okclick:function(){
                                    OrdersFty.ordersList($scope.query).then(modView);
                                }
                            })
                        }
                    }
                },
                data:{
                    orderName:orderName,
                    placeholder:placeholder
                }
            }
        };

        //获取订单的审核详情 //checkInfo
        $scope.checkInfo = function (infoArr,orderName) {
            var list = [];
            for (var i = 0; i < infoArr.length; i++) {
                var li = infoArr[i];
                if(li.checkStepState == 1 || (li.checkStepState == 1 && li.state == -1)){
                    list.push(li);
                }
            }
            if(list.length){
                $scope.checkInfoModule = {
                    title:'【'+ orderName +'】审核进度',
                    okClick:function () {

                    },
                    list:list
                }
            }else{
                ycui.alert({
                    title:'【'+ orderName +'】审核进度',
                    content: '暂没有审核信息',
                    timeout: 10
                })
            }
        };

        /**
         * 订单审核检测
         * @param id
         * @param checkState
         * @param info
         */
        $scope.isPassList = function(infoArr,orderName,id){
            var list = [];
            for (var i = 0; i < infoArr.length; i++) {
                var li = infoArr[i];
                if(li.checkStepState == 1 || (li.checkStepState == 1 && li.state == -1)){
                    list.push(li);
                }
            }
            
            $scope.checkModule = {
                title:'【'+ orderName +'】审核',
                okClick:function () {
                    var query = {orderId: id, checkState: this.data.checkState};
                    if(this.data.checkState == -1){
                        this.$valid = true;
                        if(!this.data.checkRemark){
                            return true;
                        }
                        query.checkRemark = this.data.checkRemark
                    }
                    OrdersFty.orderCheck(query).then(function (res) {
                        if (res.code == 200) {
                            ycui.alert({
                                content: res.msg,
                                okclick: function () {
                                    OrdersFty.ordersList($scope.query).then(modView);
                                    $scope.query.inCheck != 1 && OrdersFty.orderDataCount($scope.query).then(getAllDate);
                                    //改变审核数量
                                    SysUserFty.getCheckOrdersCount().then(function (res) {
                                        if (res && res.code == 200) {
                                            var count = res.count;
                                            count = count > 99?99:count;
                                            window.top.$setCheckNumChange && window.top.$setCheckNumChange(count);
                                        }
                                    });
                                    
                                }
                            })
                        }else if(res.code == 405){
                            ycui.alert({
                                error:true,
                                content: res.msg,
                                timeout:10
                            })
                        }
                    })

                },
                noClick:function(){},
                data:{
                    list:list,
                    checkState:1,
                    goRoute:function(){
                        $scope.checkModule.closeFun && $scope.checkModule.closeFun()
                        goRoute('ViewPutOrderCheck',{id:id});
                    }
                }
            }
        }


        // $scope.isPassList = function (id,checkState,info) {
        //     if (checkState == -1 || checkState == 1) {
        //         ycui.alert({
        //             content: "该订单已被审核，不能重复审核",
        //             timeout: 10
        //         })
        //     } else {
        //         goRoute('ViewPutOrderCheck',{id:id});
        //     }
        // };

        /*下拉搜索*/
        // ycui.select(".yc-select1", function (valueId) {
        //     var arr = valueId.attr("data-value").split(":");
        //     var value = valueId.text();
        //     var strName = valueId.html();
        //     var stringId = arr[0];
        //     var numId = arr[1];

        //     switch (stringId) {
        //         case "or":
        //             $scope.query.customerId = numId == -1 ? "" : numId;
        //             $scope.queryValue.customerIdValue = value;
        //             break;

        //         case "st":
        //             $scope.query.showState = numId == -1 ? "" : numId;
        //             $scope.queryValue.showStateValue = value;
        //             break;

        //         case "ch":
        //             $scope.query.checkName = numId == -2 ? "" : numId;
        //             $scope.queryValue.checkStateValue = value;
        //             break;

        //         case "de":
        //             $scope.query.orderType = numId == -1 ? "" : numId;
        //             $scope.queryValue.orderTypeValue = value;
        //             break;

        //     }
        //     var query = {pageSize: pageSize};
        //     $scope.query.pageIndex = 1;
        //     angular.extend(query, $scope.query);
        //     OrdersFty.ordersList(query).then(modView);
        //     window.sessionStorage.setItem("orderListSession", JSON.stringify(query));
        //     window.sessionStorage.setItem("orderValueSession", JSON.stringify($scope.queryValue));
        //     OrdersFty.orderDataCount(query).then(getAllDate);
        // });

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
                var query = {pageSize: pageSize, pageIndex: 1};
                query = angular.extend(query, $scope.query);
                OrdersFty.ordersList(query).then(modView);
                OrdersFty.orderDataCount(query).then(getAllDate);
                window.sessionStorage.setItem("orderListSession", JSON.stringify(query))
            }
        });

        /**
         * 显示广告位详情
         */
        $scope.showOrderADSpaces = function (res,name) {

            var list = [];
            res = angular.copy(res);
            res.forEach(function (data) {
                var _adShowDates = data.adShowDates;
                var _aa = [];
                var _scheduleValue = [];
                var _array = data.showTimeDetail.split("");
                _array && _array.forEach(function (data,index,arr) {
                    var _t = "";
                    if(data == 1 && _aa.length == 0){
                        _aa.push({
                            index:index,
                            date:1
                        })
                    }
                    if(data == 0 && _aa.length > 0){
                        _aa.push({
                            index:index-1,
                            date:1
                        });
                        _t = "";
                        _t += intAddZero(_aa[0].index) + ':00' + '-' + intAddZero(_aa[1].index) + ':59';
                        _scheduleValue.push(_t);
                        _aa.length = 0;
                    }
                    if(data == 1 && arr.length-1 == index){
                        _aa.push({
                            index:index,
                            date:1
                        });
                        _t = "";
                        _t += intAddZero(_aa[0].index) + ':00' + '-' + intAddZero(_aa[1].index) + ':59';
                        _scheduleValue.push(_t);
                        _aa.length = 0;
                    }
                });
                var arr = []
                _adShowDates.forEach(function (da) {
                    var start = new Date(da.startDate);
                    var end = new Date(da.endDate);
                    if(!isNaN(start.getTime())){
                        arr.push(start.dateFormat('yyyyMMdd') + '-' + end.dateFormat('yyyyMMdd'))
                    }
                });
                data.adShowDates = arr;
                data._adShowDates = getFrontElement(arr,2);
                
                data.scheduleValueList = _scheduleValue;
                data._scheduleValueList = getFrontElement(data.scheduleValueList,2);
            })

            $scope.orderShowDateModule = {
                title:"【" + name+"】排期详细",
                okClick:function(){

                },
                dataList:res
            }
        };


        //
        //导出报表
        var derive = '/orders/exportOrderReport.htm';
        $scope.export = function () {
            var array = ["排期单号", "订单名称", "合同号", "	客户名称", "业务员","投放", "审核状态", "投放档期", "订单金额","曝光量", "点击量"];
            var customer = window.sessionStorage.getItem('order_customer');
            var query = angular.copy($scope.query);
            if(customer){
                query.customerName = JSON.parse(customer).customerName;
            }
            var body = toBodyString(query);
            var url = baseUrl + derive + '?' + body + '&showColumns=' + array.join();
            window.open(url, '_blank')
        };

        $scope.$on('loginUserRole',function(e,d){
            var role = d.ViewPutOrder;
            if(role){
                ConfigFty.detail({type:1}).then(function(res){
                    if(res && res.code == 200){
                        var date = res.config.value;
                        $scope.orderValidDate = date;
                    }
                })
            }
        })

        $scope.modifyOrderEdit = function(event){
            $scope.$orderValidDate = $scope.orderValidDate;
            $scope.orderValidDateReadonly = !$scope.orderValidDateReadonly;
            setTimeout(function() {
                var input = document.querySelector('#orderValidDate')
                input.select();
                input.focus();
            }, 100);
        }
        
        /*修改预定订单有效期*/
        $scope.modifyOrderDate = function(){
            $scope.orderValidDateReadonly = true;
            var date = $scope.orderValidDate;
            var $date = $scope.$orderValidDate;
            if(date == $date)return;
            if(isNaN(parseInt(date)) || date <= 0 || /\./.test(date)){
                ycui.alert({
                    error:true,
                    timeout:10,
                    content:'请填写有效的正整数！'
                });
                return;
            }
            ycui.loading.show();
            ConfigFty.upBookTime({value:date}).then(function(res){
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        timeout:10,
                        content:res.msg
                    })
                }
            })
        }
    }]);