/**
 * Created by moka on 16-6-21.
 */

app.controller('PutAddCtrl', ['$scope', '$q', 'ContractFty', 'OrdersFty', 'ScheduleFty', 'CustomerFty', 'SysUserFty','SysContractTolerantFty','UploadKeyFty','ResChannelFty','ResMediaFty','SysDepartmentFty',
    function ($scope, $q, ContractFty, OrdersFty, ScheduleFty, CustomerFty, SysUserFty,SysContractTolerantFty,UploadKeyFty,ResChannelFty,ResMediaFty,SysDepartmentFty) {
        $scope.departmentListSel = {}
        //获取登陆人信息
        var loginUserInfo = $scope.$on('loginUserInfo',function(e,data){
            $scope.order.flowUserId = data.id;
            $scope.order.orderInCompanyId = data.companyId;
            $scope._cache.trueName = data.trueName;
            $scope._cache.companyId = data.companyId;
            
            //部门
            SysUserFty.depAndUserList({companyId: $scope._cache.companyId}).then(function (res) {
                $scope.departmentListSel.list = res.departmentList;
            })
        });

        //客户下拉
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 2}).then(function (res) {
            if (res && res.code == 200) {
                $scope.customerListSel.list = res.items;
            }
        });

        $scope.customerListSel = {}

        $scope.orderTypeSel = {
            list:[
                {name:'正式投放',id:2},
                {name:'预定广告位',id:1},
                {name:'试用推广',id:3},
                {name:'内部自用推广',id:4},
                {name:'补偿刊登',id:5},
            ],
            callback:function(e,d){
                d && selectOrderType(d.id);
            }
        }
        // 合同对象
        $scope.contractCodeSel = {
            list:[],
            callback:function(e,d){
                d && setContract(d);
            },
            searchBlack:function(d){
                if(d){
                    ycui.loading.show();
                    ContractFty.getContractsByCode({contractCode: d}).then(function (res) {
                        ycui.loading.hide();
                        if (res && res.code == 200 && res.items) {
                            $scope.contractCodeSel.list = [res.items];
                            $scope.contractsListShow = false;
                        } else {
                            $scope.contractCodeSel.list.length = 0;
                            $scope.contractsListShow = true;
                        }
                    });
                }else{
                    $scope.contractCodeSel.list.length = 0
                }
            }
        }

        $scope._cache = {contract:{}};//临时值
        /**
         * 表单 默认值
         */
        $scope.order = {contractType: 2, isPackage: 1};
        $scope.selectContractShow = false;//正式投放 有合同
        //是否显示排期值
        $scope._cache.orderListManagerShow = function () {
            return (($scope.order.orderType == 1 && $scope.order.isPackage != 2) || ($scope.order.orderType == 2 && $scope.order.isPackage != 2) || ($scope.order.orderType == 5 && $scope.order.isPackage != 2)) || ($scope.order.orderType == 3 || $scope.order.orderType == 4)
        }

        /**
         * 改变订单类型后保存广告位的档期
         * @param array $scope.adListInfo 唯一
         * @returns {*} add
         */
        function saveAdListInfo(array) {
            array.forEach(function (data) {
                if(data.scheduleType != undefined){
                    var _bo = true;
                    //如果排期类型在此类型当中 就不删除
                    $scope.scheduleTypeList.forEach(function (da) {
                        if(da.id == data.scheduleType){
                            _bo = false;
                        }
                    });
                    _bo && (delete data.scheduleType);
                }
                if($scope.scheduleTypeList.length >= 1){
                    data.scheduleType = $scope.scheduleTypeList[0].id
                }
                delete data.scheduleAdMoney;
            });
        }

        /**
         * 如果没有操作 【更多设置】 需要恢复控件
         * @param array $scope.adListInfo 唯一
         */
        function recoveryAdListDate(array) {
            array.forEach(function (data) {
                addListInfo(data);
            })
        }

        /***
         * 订单类型修改
         * @param name
         * @param data
         */
        function selectOrderType(data){
            $scope._cache.localDeliveryMoney = 0;
            $scope._cache.localScheduleMoney = 0;
            destroyOrder();
            initPicker();

            /**
             * 排期类型 根据订单类型的不同 变换广告位排期类型
             *
             * 订单类型-自用推广 ，排期类型：自用
             * 订单类型-试用推广，排期类型：免费配送
             * 订单类型-预定广告位，排期类型：正常购买、免费配送、打包
             * 订单类型-正式投放，根据打包属性，打包则显示排期类型打包；否则则是正常购买、免费配送
             * 订单类型-补偿刊登，根据选择的关联订单相应显示，
             */
            $scope.scheduleTypeList = [];
            switch (data) {
                case 1:
                    $scope.order.contractType = 2;
                    $scope.scheduleTypeList = [{id: 0, name: '正常购买'}, {id: 1, name: '免费配送'}];
                    break;
                case 2:
                    $scope.order.contractType = 1;
                    $scope.scheduleTypeList = [{id: 0, name: '正常购买'}, {id: 1, name: '免费配送'}];
                    break;
                case 3:
                    $scope.order.totalMoney = 0;
                    $scope.order.contractType = 2;
                    $scope.scheduleTypeList = [{id: 1, name: '免费配送'}];
                    break;
                case 4:
                    $scope.order.totalMoney = 0;
                    $scope.order.contractType = 2;
                    $scope.scheduleTypeList = [{id: 2, name: '自用'}];
                    break;
                case 5:
                    $scope.order.contractType = 2;
                    $scope.scheduleTypeList = [{id: 1, name: '免费配送'}];
                    break;
            }

            //保留广告位
            saveAdListInfo($scope.adListInfo);
            //恢复广告位信息
            recoveryAdListDate($scope.adListInfo);
            $scope.selectContractShow = false;
        }

        // 初始化合同对象
        function setContract(data){
            if (data.id != undefined) {
                $scope.order.contractCode = data.contractCode;
                $scope.order.totalMoney = data.contractMoney;
                $scope.order.discount = data.discount*100;
                $scope.order.present = data.present*100;
                // $scope._cache.contract = data;

                $scope._cache.contract && angular.extend($scope._cache.contract,data);

                $scope.selectContractShow = true;//显示 合同金额等。。。。
                /**
                 * 正式订单 获取合同 根据是否打包合同 改变广告位类型
                 */
                if($scope.order.isPackage != data.type){
                    $scope.isPackageChange(data.type);
                }
                $scope.order.isPackage = data.type;
            }
        }

        /**
         * 合同类型改变后 排期类型相应改变
         */
        $scope.isPackageChange = function (type) {
            if (type == 1) {
                $scope.scheduleTypeList = [{id: 0, name: '正常购买'}, {id: 1, name: '免费配送'}];
            } else {
                $scope.scheduleTypeList = [{id: 3, name: '打包'}];
            }
            $scope._cache.localScheduleMoney = 0;
            $scope._cache.localDeliveryMoney = 0;
            //保留广告位
            saveAdListInfo($scope.adListInfo);
            recoveryAdListDate($scope.adListInfo);
            // setTimeout(function () {
            //     ycui.select('.yc-select-add');
            // },500);

            delete $scope.order.packageMoney
        };

        /**
         * 计算总购买金额 和 总配送金额
         */
        $scope.$watch('order.futureMoney',function () {
            var futureMoney = $scope.order.futureMoney > 0
            var discount = $scope.order.discount >= 0
            var present = $scope.order.present >= 0
            if(futureMoney && discount && present){
                getMoney();
            }
        });
        $scope.$watch('order.discount',function () {
            var futureMoney = $scope.order.futureMoney > 0
            var discount = $scope.order.discount >= 0
            var present = $scope.order.present >= 0
            if(futureMoney && discount && present){
                getMoney();
            }
        });
        $scope.$watch('order.present',function () {
            var futureMoney = $scope.order.futureMoney > 0
            var discount = $scope.order.discount >= 0
            var present = $scope.order.present >= 0
            if(futureMoney && discount && present){
                getMoney();
            }
        });
        function getMoney() {
            var _contractMoneyMax = $scope.order.futureMoney/($scope.order.discount*0.01);
            var _presentMoneyMax = $scope.order.futureMoney*($scope.order.present*0.01);

            $scope._cache.contract && angular.extend($scope._cache.contract,{
                contractBuyMoney:_contractMoneyMax,
                presentMoney:_presentMoneyMax,
                schedulingBuyMoney:$scope.order.buyMoney,
                presentedMoney:$scope.order.presentMoney,
                scheduleMoney:_contractMoneyMax + _presentMoneyMax
            })
        }

        /**
         * 合同签订情况改变 删除其值
         */
        $scope.contractTypeChange = function () {
            $scope.selectContractShow = false;
            if ($scope.order.contractType == 2) {
                delete $scope.order.contractCode;
                $scope.contractCodeSel.$destroy();
            }
            $scope._cache.contract = {};
            destroyOrder();
        };

        function destroyOrder() {
            // delete $scope.order.totalMoney;
            // delete $scope.order.futureMoney;
            // delete $scope.order.historyScheduleMoney;
            // delete $scope.order.discount;
            // delete $scope.order.present;
            delete $scope.order.relatedOrderId;
        }

        //初始化时间控件
        var initPicker = function () {
            if(!$scope.order.orderShowDate){
                $scope.order.orderShowDate = {};
            }
            $scope.order.orderShowDate.pickerDateRange = 'pickerDateRange';
            pointerTimely($scope.order.orderShowDate);
        };
        initPicker();

        /**
         * 获取由排期添加的广告位
         */
        var id = getSearch("ids");
        var _companyId = getSearch("companyId");
        var _depScope = getSearch("depScope");
        $scope.adListInfo = [];
        if (id) {
            $scope.order.adInCompanyId = _companyId;
            $scope._cache.adInCompanyId = _companyId;
            $scope.order.adInDepScope = _depScope;
            $scope._cache.adInDepScope = _depScope;
            ScheduleFty.scheduleADToOrder({ads: id}).then(function (res) {
                if (res && res.code == 200) {
                    for (var i = 0, j = res.items.length; i < j; i++) {
                        var itemInfo = res.items[i];
                        $scope.adListInfoCache.push(angular.copy(itemInfo));
                        itemInfo.companyId = _companyId;
                        $scope.adListInfo.push(itemInfo);
                        addListInfo(itemInfo);
                        itemInfo.dateType = 0;
                        itemInfo.weekOrDate = 0;
                    }
                }
            })
        }

        // 选择广告位
        $scope.$on('orderAddGroup',function(){
            if ($scope.query.companyId != undefined) {
                OrdersFty.getADSpacesForAddOrder($scope.query).then(modView);
            }
        })
        $scope.departmentListAdSel = {
            callback:function(e,d){
                if(d){
                    $scope._cache.adInDepScope = d.agencyNumber;
                    $scope.query.depScope = d.agencyNumber;
                }
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                OrdersFty.getADSpacesForAddOrder($scope.query).then(modView);
            }
        };
        $scope.companyListSel = {
            callback:function(e,d){
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.mediaListSel.$destroy();
                if(d){
                    $scope._cache.adInCompanyId = d.id;
                    ResMediaFty.mediaListInCom({companyId:d.id}).then(function(res){
                        if(res && res.code == 200){
                            $scope.mediaListSel.list = res.mediaList;
                        }
                    })
                }
                delete $scope._cache.adInDepScope;
                $scope.departmentListAdSel.$destroy();
                if(d && d.id == 3){
                    SysDepartmentFty.parentDeps({ companyId: d.id }).then(function (res) {
                        if(res && res.code == 200){
                            $scope.departmentListAdSel.list = res.departmentList;
                        }
                    });
                }
            }
        };
        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.periodicationSel.$destroy();
                if(!d){return};
                ResChannelFty.getChannelsByMedia({ mediaId: d.id }).then(function (response) {
                    $scope.periodicationSel.list = response.channels;
                });
            }
        };
        $scope.periodicationSel = {};
        $scope.sizeListSel = {};
        $scope.typeListSel = {};


        $scope.showAdList = function(){
            // $scope.query = {pageSize: 5};
            if (validDate()) {
                return
            }
            $scope.adListInfoCache = [];
            $scope.redirect = function (num,search) {
                ycui.loading.show();
                $scope.query.pageIndex = num || 1;
                $scope.query.adSpaceNameOrId = $scope.query.search;
                if ($scope.query.companyId != undefined) {
                    OrdersFty.getADSpacesForAddOrder($scope.query).then(modView);
                }
            };
            if(_companyId && $scope.order.adInCompanyId){
                // $scope.companyList.forEach(function (da) {
                //     if(da.id == $scope.order.adInCompanyId){
                //         $scope._cache.companyName = da.companyName;
                //     }
                // });
                $scope.query.companyId = $scope.order.adInCompanyId;
                $scope.redirect(1);
            }
            $scope.adSpaceModule = {
                title:'添加广告位',
                okClick:function(){
                    var bo = true;
                    var _bo1 = $scope._cache.adInDepScope && $scope.order.adInDepScope && $scope._cache.adInDepScope != $scope.order.adInDepScope;
                    var _bo2 = $scope._cache.adInCompanyId && $scope.order.adInCompanyId && $scope._cache.adInCompanyId != $scope.order.adInCompanyId;
                    if(_bo1 || _bo2){
                        bo = false;
                    }
                    if(bo){
                        hideAdList();
                    }else{
                        function _time(){
                            ycui.confirm({
                                content:'两次选择范围不一致，已添加的广告位将会清空！',
                                okclick:function(){
                                    $scope.$apply(function(){
                                        $scope._cache.localDeliveryMoney = 0;
                                        $scope._cache.localScheduleMoney = 0;
                                        $scope.adListInfo.length = 0;
                                        hideAdList();
                                    })
                                }
                            })
                        }
                        setTimeout(_time, 20);
                    }
                },
                noClick:function(){

                }
            }
        }

        /**
         * 隐藏购物车 moreConfig
         */
        function hideAdList() {
            $scope.adListInfoCache.forEach(function (data) {
                var id = data.id;
                var scheduleType = data.scheduleType;
                var _adListInfo = 0;
                var _list = $scope.scheduleTypeList.length;
                $scope.adListInfo.forEach(function(da){
                    if(id == da.id){
                        ++_adListInfo;
                    }
                })
                if(_adListInfo < _list){
                    var _data = angular.copy(data);
                    $scope.adListInfo.push(_data);
                    addListInfo(_data);
                }
            })
            $scope.order.adInCompanyId = $scope._cache.adInCompanyId;
            $scope.order.adInDepScope = $scope._cache.adInDepScope;
        };

        $scope.query = {pageSize: 5};//搜索条件
        var modView = function (response) {
            ycui.loading.hide();
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        var dLInOrder = ScheduleFty.dLInOrder().then(function (res) {
            if(res && res.code == 200){
                $scope.companyListSel.list = res.companyList;
                
                $scope.periodicationSel.list = res.periodicationList;
                $scope.sizeListSel.list = res.sizeList;
                $scope.typeListSel.list = res.typeList;
            }
        });

        /**
         * 购物车开始
         */
        $scope.deleteInfo = function (index, name) {
            ycui.confirm({
                title: "操作确认",
                content: "请确认，您将删除广告位：" + "<br>" + name,
                timeout: -1,
                okclick: function () {
                    $scope.$apply(function () {
                        var _d = $scope.adListInfo[index];
                        cartRemove(_d.scheduleAdMoney, _d.scheduleType);
                        $scope.adListInfo.splice(index, 1);
                    });
                }
            });
        };

        $scope.deleteInfoByIndex = function (index) {
            $scope.adListInfoCache.splice(index, 1)
        };

        //点击添加到右边
        $scope.adListInfoCache = [];
        $scope.putRightInfo = function (itemInfo) {
            for (var i = 0; i < $scope.adListInfoCache.length; i++) {
                if ($scope._cache.adInCompanyId  && $scope._cache.adInCompanyId != $scope.adListInfoCache[i].companyId) {
                    $scope.adListInfoCache.length = 0;
                    break;
                }
                if(itemInfo.depScope != $scope.adListInfoCache[i].depScope){
                    $scope.adListInfoCache.length = 0;
                    break;
                }
                if (itemInfo.id == $scope.adListInfoCache[i].id) {
                    return
                }
            }
            //TODO
            $scope._cache.adInDepScope = itemInfo.depScope;
            itemInfo.dateType = 0;
            itemInfo.weekOrDate = 0;
            $scope.adListInfoCache.push(itemInfo);
        };

        $scope.$watch('order.orderShowDate', function (newValue, oldValue, scope) {
            if (oldValue !== newValue) {
                /**
                 * 重新加载广告位下的日期控件
                 */
                $scope.adListInfo.forEach(function (data) {
                    //没有设置更多设置
                    if(!data.scheduleAdMoneyShow){
                        data.adShowDates[0].startTime = newValue.startTime;
                        data.adShowDates[0].endTime = newValue.endTime;
                        data.adShowDates[0].pickerDateRange = Math.uuid();

                        switch (data.priceCycle){
                            case 1:
                                pointerTimely(data.adShowDates[0], true, data);
                                break;
                            case 2:
                                pointerTimely(data.adShowDates[0], true, data);
                                // $scope.addMonthDetail(data);
                                break;
                            case 3:
                                $scope.addTimeDetail(data);
                                break;
                        }
                    }
                })
            }
        }, true);

        /**
         * 显示购物车详细信息
         * @param itemInfo 广告位对象
         * 广告位下标 add
         */
        function addListInfo(itemInfo) {
            if(!itemInfo.adShowDates){
                itemInfo.adShowDates = [];
                itemInfo.adShowDates[0] = angular.copy($scope.order.orderShowDate);
                itemInfo.adShowDates[0].pickerDateRange = Math.uuid();
            }
            //默认选择一个排期类型
            if($scope.scheduleTypeList && $scope.scheduleTypeList.length >= 1){
                itemInfo.scheduleType = $scope.scheduleTypeList[0].id
            }

            switch (itemInfo.priceCycle) {
                case 1:
                    /**
                     * 日期控件ID生成
                     */
                    pointerTimely(itemInfo.adShowDates[0], true, itemInfo);
                    break;
                case 2:
                    /**
                     * 日期控件ID生成
                     */
                    pointerTimely(itemInfo.adShowDates[0], true, itemInfo);
                    break;
                case 3:
                    var times = [];
                    if(!itemInfo.timeSel1){
                        itemInfo.timeSel1 = {};
                    }
                    if(!itemInfo.timeSel2){
                        itemInfo.timeSel2 = {};
                    }
                    itemInfo.timeSel1.list = times;
                    itemInfo.timeSel2.list = times;

                    //默认显示满时间段
                    itemInfo.showTimeDetail = createArray(24, 1);
                    var i = 0;
                    while (i <= 23) {
                        times.push({
                            s: i,
                            z: intAddZero(i, 2) + ':' + '00',
                            n: intAddZero(i, 2) + ':' + '59'
                        });
                        i++;
                    }

                    itemInfo.showTimeBox = 0;//默认选择全时间段 更多设置

                    //默认选满整个时间段
                    itemInfo.startTime = 0;
                    itemInfo.endTime = 23;
                    /**
                     * 列表 小时计算
                     * @param data
                     */
                    $scope.addTimeDetail = function (data) {
                        var _f = data.startTime;
                        var _s = data.endTime;
                        if (_f > _s) {
                            _f ^= _s;
                            _s ^= _f;
                            _f ^= _s;
                        }
                        var array = createArray(24, 0);
                        while (_f <= _s) {
                            array.splice(_f, 1, 1);
                            _f++;
                        }
                        data.showTimeDetail = array;
                        var _scheduleAdMoney = selectCalculate(data.scheduleType, data.price, $scope.order.discount, [$scope.order.orderShowDate], data.showTimeDetail, data.priceCycle);
                        cartTotal(data.scheduleAdMoney, _scheduleAdMoney, data.scheduleType, data.scheduleType);//计算排期总金额
                        data.scheduleAdMoney = _scheduleAdMoney;
                    };
                    if (itemInfo.scheduleType != undefined) {
                        $scope.addTimeDetail(itemInfo);
                    }
                    break;
            }
        }

        /**
         * 初始化时间控件
         * @param ad 广告位对象
         * @param bo 是否触发计算排期金额
         * @param obj 广告位对象 add
         */
        function pointerTimely(ad, bo, obj) {
            setTimeout(function () {
                !function (da, ob, obj) {
                    new pickerDateRange(da.pickerDateRange || da, {
                        defaultText: ' / ',
                        isSingleDay: false,
                        stopToday: false,
                        stopTodayBefore: true,
                        startDate: da.startTime,
                        endDate: da.endTime,
                        minValidDate: $scope.order.orderShowDate.startTime || '1970-01-01',
                        maxValidDate: $scope.order.orderShowDate.endTime || '3000-01-01',
                        calendars: 2,
                        shortbtn: 0,
                        success: function (data) {
                            $scope.$apply(function () {
                                da.startTime = data.startDate;
                                da.endTime = data.endDate;
                            });
                            if (ob) {
                                //重新计算金额
                                if(obj.scheduleType != undefined){
                                    $scope.$apply(function () {
                                        var _scheduleAdMoney = selectCalculate(obj.scheduleType, obj.price, $scope.order.discount, obj.adShowDates, [], obj.priceCycle);
                                        cartTotal(obj.scheduleAdMoney, _scheduleAdMoney, obj.scheduleType, obj.scheduleType);//计算排期总金额
                                        obj.scheduleAdMoney = _scheduleAdMoney;
                                    })
                                }
                            }
                        }
                    });
                    if (ob) {
                        //重新计算金额
                        if(obj.scheduleType != undefined){
                            $scope.$apply(function () {
                                var _scheduleAdMoney = selectCalculate(obj.scheduleType, obj.price, $scope.order.discount, obj.adShowDates, [], obj.priceCycle);
                                cartTotal(obj.scheduleAdMoney, _scheduleAdMoney, obj.scheduleType, obj.scheduleType);//计算排期总金额
                                obj.scheduleAdMoney = _scheduleAdMoney;
                            })
                        }
                    }
                }(ad, bo, obj);
            }, 500);
        }


        //判断右边里有没有
        $scope.isInRight = function (id) {
            for (var i = 0; i < $scope.adListInfoCache.length; i++) {
                if (id == $scope.adListInfoCache[i].id) {
                    return "noShow"
                }
            }
        };

        //清空数据
        $scope.clearInfo = function () {
            $scope.adListInfoCache.length = 0;
        };

        /**
         * 验证前提必要的数据
         */
        var validDate = function () {
            if ($scope.order.orderType == undefined) {
                ycui.alert({
                    error:true,
                    content: '请选择订单类型',
                    timeout: 10
                });
                return true
            }
            if ($scope.order.orderType == 2 && $scope.order.contractType == 1 && $scope.order.contractCode == undefined) {
                ycui.alert({
                    error:true,
                    content: '请选择合同',
                    timeout: 10
                });
                return true
            }
            if ($scope.order.orderShowDate.startTime == undefined || $scope.order.orderShowDate.endTime == undefined) {
                ycui.alert({
                    error:true,
                    content: '请选择投放档期',
                    timeout: 10
                });
                return true
            }
            if ($scope.order.contractType == 2 && $scope.order.orderType == 2) {
                var _msg = "";
                if ($scope.order.futureMoney == undefined) {
                    _msg += '请输入预估金额<br>'
                }
                if ($scope.order.historyScheduleMoney == undefined) {
                    _msg += '请输入历史排期金额<br>'
                }
                if ($scope.order.discount == undefined) {
                    _msg += '请输入合同折扣<br>'
                }
                if ($scope.order.present == undefined) {
                    _msg += '请输入合同配送<br>'
                }
                if (_msg) {
                    ycui.alert({
                        error:true,
                        content: _msg,
                        timeout: 10
                    });
                    return true
                }
            }
        };

        //快速日期选择
        function quickDateFun(quickDate){
            quickDate.nextMonth = function(index,bo){
                if(quickDate.$list && quickDate.$list.length > 2){
                    if(bo){
                        if(quickDate.$list[index-1-1]){
                            quickDate.list = [];
                            quickDate.list.$index = index - 1
                            quickDate.list.push(quickDate.$list[index-1-1],quickDate.$list[index-1])
                        }
                    }else{
                        if(quickDate.$list[index+1]){
                            quickDate.list = [];
                            quickDate.list.$index = index + 1
                            quickDate.list.push(quickDate.$list[index],quickDate.$list[index+1])
                        }
                    }
                }
            }
            //单个选择
            quickDate.selectOne = function (event,arr) {
                var $target = event.target;
                if($target && $target.nodeName == 'DIV' && $target.getAttribute('data-date') == 'true' && $target.className.indexOf('date-display') == -1){
                    var $index = $target.getAttribute('data-index');
                    arr[$index].selected = !arr[$index].selected
                }
            };
            //按星期选择
            quickDate.selectRow = function (index,arr) {
                var _arr = [];
                for(var i = 0,j = arr.length;i<j;i++){
                    if(!arr[i].display && !arr[i].hidden && (i-index)%7 == 0){
                        arr[i].selected = !arr[i].selected;
                        _arr.push(arr[i])
                    }
                }
            };
        }

        // 更多设置
        $scope.showScheduleDay = function(name,index){
            /**
             * 选择排期类型后才能打开更多设置
             * @type {{}}
             */
            if (isNaN($scope.adListInfo[index].scheduleType)) {
                ycui.alert({
                    error:true,
                    content: '请选择排期类型',
                    timeout: 10
                });
                return true
            }
            $scope.scheduleTemp = {};
            $scope.scheduleTemp = angular.copy($scope.adListInfo[index]); //临时对象 完成设置后
            $scope.scheduleTemp._index = index;
            $scope.validTimeValue = '';

            // 快捷日期选择
            var quickDate = $scope.scheduleTemp.quickDate = {};
            quickDateFun(quickDate);
            // quickDate.nextMonth = function(index,bo){
            //     if(quickDate.$list && quickDate.$list.length > 2){
            //         if(bo){
            //             if(quickDate.$list[index-1-1]){
            //                 quickDate.list = [];
            //                 quickDate.list.$index = index - 1
            //                 quickDate.list.push(quickDate.$list[index-1-1],quickDate.$list[index-1])
            //             }
            //         }else{
            //             if(quickDate.$list[index+1]){
            //                 quickDate.list = [];
            //                 quickDate.list.$index = index + 1
            //                 quickDate.list.push(quickDate.$list[index],quickDate.$list[index+1])
            //             }
            //         }
            //     }
            // }
            // //单个选择
            // quickDate.selectOne = function (event,arr) {
            //     var $target = event.target;
            //     if($target && $target.nodeName == 'DIV' && $target.getAttribute('data-date') == 'true' && $target.className.indexOf('date-display') == -1){
            //         var $index = $target.getAttribute('data-index');
            //         arr[$index].selected = !arr[$index].selected
            //     }
            // };
            // //按星期选择
            // quickDate.selectRow = function (index,arr) {
            //     var _arr = [];
            //     for(var i = 0,j = arr.length;i<j;i++){
            //         if(!arr[i].display && (i-index)%7 == 0){
            //             arr[i].selected = !arr[i].selected;
            //             _arr.push(arr[i])
            //         }
            //     }
            // };
            function initQuick(array){
                var startTime = $scope.order.orderShowDate.startTime;
                var endTime = $scope.order.orderShowDate.endTime;
                quickDate.$list = getDateRange(startTime,endTime,array);
                if(quickDate.$list.length > 2){
                    quickDate.list = [];
                    quickDate.list.$index = 1;
                    quickDate.list.push(quickDate.$list[0],quickDate.$list[1])
                }else{
                    quickDate.list = quickDate.$list;
                }
            }

            //快捷星期
            var quickWeek = $scope.scheduleTemp.quickWeek = {};
            function initQuickWeek(week){
                quickWeek.list = [
                    {week:'周一',num:1,selected:true},
                    {week:'周二',num:2,selected:true},
                    {week:'周三',num:3,selected:true},
                    {week:'周四',num:4,selected:true},
                    {week:'周五',num:5,selected:true},
                    {week:'周六',num:6,selected:true},
                    {week:'周日',num:0,selected:true}
                ]
                if(week){
                    var weeks = week.split(',');
                    quickWeek.list.map(function(a){
                        a.selected = false;
                        if(weeks.indexOf(String(a.num)) != -1){
                            a.selected = true;
                        }
                    })
                }
            }

            /**
             * 保存后 回显数据
             */

            var _d = $scope.scheduleTemp.adShowDates = arrayFilter($scope.scheduleTemp.adShowDates);
            var selectWeeks = $scope.scheduleTemp.selectWeeks;
            initQuickWeek(selectWeeks);
            initQuick(_d);
            _d.forEach(function (da) {
                da.pickerDateRange = Math.uuid();
                pointerTimely(da);
            })

            $scope.scheduleTemp.init = function(){
                initQuick(_d);
                initQuickWeek();
            }
            $scope.scheduleTemp.empty = function () {
                quickDate.$list.forEach(function (data) {
                    var dates = data.dates;
                    dates.forEach(function (da) {
                        if(da.selected){
                            da.selected = false;
                        }
                    })
                })
            }

            $scope.moreConfigModule = {
                title:'设置档期',
                okClick:function(){
                    return hideSchedule($scope.scheduleTemp);
                },
                noClick:function(){

                }
            }

        }
        /**
         * 更多设置 添加档期控件
         */
        $scope.addCalendar = function () {
            var index = $scope.scheduleTemp.adShowDates.push({
                pickerDateRange: Math.uuid()
            });
            pointerTimely($scope.scheduleTemp.adShowDates[index - 1])
        };
        /**
         *  更多设置 删除档期控件
         */
        $scope.deleteDateRange = function (index) {
            $scope.scheduleTemp.adShowDates.splice(index, 1);
        };

        /**
         * 更多设置显示 type == 3 小时
         */
        $scope.showScheduleTime = function (name, index) {
            /**
             * 选择排期类型后才能打开更多设置
             * @type {{}}
             */
            if (isNaN($scope.adListInfo[index].scheduleType)) {
                ycui.alert({
                    error:true,
                    content: '请选择排期类型',
                    timeout: 10
                });
                return true
            }
            $scope.scheduleTemp = {};
            $scope.scheduleTemp = angular.copy($scope.adListInfo[index]); //临时对象 完成设置后
            $scope.scheduleTemp._index = index;
            $scope.validTimeValue = '';

            // 快捷日期选择
            var quickDate = $scope.scheduleTemp.quickDate = {};
            quickDateFun(quickDate);

            function initQuick(array){
                var startTime = $scope.order.orderShowDate.startTime;
                var endTime = $scope.order.orderShowDate.endTime;
                quickDate.$list = getDateRange(startTime,endTime,array);
                if(quickDate.$list.length > 2){
                    quickDate.list = [];
                    quickDate.list.$index = 1;
                    quickDate.list.push(quickDate.$list[0],quickDate.$list[1])
                }else{
                    quickDate.list = quickDate.$list;
                }
            }

            //快捷星期
            var quickWeek = $scope.scheduleTemp.quickWeek = {};
            function initQuickWeek(week){
                quickWeek.list = [
                    {week:'周一',num:1,selected:true},
                    {week:'周二',num:2,selected:true},
                    {week:'周三',num:3,selected:true},
                    {week:'周四',num:4,selected:true},
                    {week:'周五',num:5,selected:true},
                    {week:'周六',num:6,selected:true},
                    {week:'周日',num:0,selected:true}
                ];
                if(week){
                    var weeks = week.split(',');
                    quickWeek.list.map(function(a){
                        a.selected = false;
                        if(weeks.indexOf(String(a.num)) != -1){
                            a.selected = true;
                        }
                    })
                }
            }

            /**
             * 保存后 回显数据
             */
            var _d = $scope.scheduleTemp.adShowDates = arrayFilter($scope.scheduleTemp.adShowDates);
            var selectWeeks = $scope.scheduleTemp.selectWeeks;
            initQuickWeek(selectWeeks);
            initQuick(_d);
            _d.forEach(function (da) {
                da.pickerDateRange = Math.uuid();
                pointerTimely(da);
            })

            $scope.scheduleTemp.init = function(){
                initQuick(_d);
                initQuickWeek();
            }

            $scope.scheduleTemp.empty = function () {
                quickDate.$list.forEach(function (data) {
                    var dates = data.dates;
                    dates.forEach(function (da) {
                        if(da.selected){
                            da.selected = false;
                        }
                    })
                })
            }

            function getShowTimeDetail(bo,array){
                var _showTimeDetail = [];
                if(array){
                    for(var i = 0;i<=23;i++){
                        var b = {};
                        b.selected = !!+array[i];
                        b.num = i;
                        b.str = intAddZero(i,2) + ':00';
                        _showTimeDetail.push(b);
                    }
                }else{
                    for(var i = 0;i<=23;i++){
                        var b = {};
                        b.selected = bo;
                        b.num = i;
                        b.str = intAddZero(i,2) + ':00';
                        _showTimeDetail.push(b);
                    }
                }
                return _showTimeDetail;
            }

            if (!($scope.scheduleTemp.showTimeDetail && $scope.scheduleTemp.showTimeDetail.length != 0)) {
                $scope.scheduleTemp.showTimeDetailList = getShowTimeDetail(true);
            } else {
                $scope.scheduleTemp.showTimeBox = 1;
                var _array = $scope.scheduleTemp.showTimeDetail;
                $scope.scheduleTemp.showTimeDetailList = getShowTimeDetail(false,_array);
            }

            /**
             * 点击改变颜色
             */
            // $scope.changeTimeTemp = function (index) {
            //     var _t = $scope.scheduleTemp.showTimeDetail[index];
            //     if (_t == 0) {
            //         _t = 1;
            //     } else {
            //         _t = 0;
            //     }
            //     $scope.scheduleTemp.showTimeDetail[index] = _t;
            // };
            $scope.moreConfigModule = {
                title:'设置档期',
                okClick:function(){
                    return hideSchedule($scope.scheduleTemp);
                },
                noClick:function(){

                }
            }
        };

        /**
         * 更多设置影藏
         * @param name
         * @param data 广告位对象  type 刊例价类型  计算开始
         * 0正常购买 1免费配送 2自用 3打包
         */
        function hideSchedule(data){
            var _dateType = data.dateType;
            var _weekOrDate = data.weekOrDate;
            var _quickDate = data.quickDate;
            var _quickWeek = data.quickWeek;
            var _s = $scope.adListInfo[data._index];

            if(_dateType == 1){
                if(_weekOrDate == 1){
                    //快速日期
                    var _d = [];
                    _quickDate.$list.forEach(function(li){
                        var dates = li.dates;
                        dates.forEach(function(da){
                            if(da.selected){
                                _d.push(li.month + '-' + intAddZero(da.day,2));
                            }
                        })
                    })
                    var _date = makeDateRange(_d,'startTime','endTime');
                    data.adShowDates = _date;
                }else{
                    //快速星期
                    var _w = [];
                    _quickWeek.list.forEach(function(li){
                        if(li.selected){
                            _w.push(li.num);
                        }
                    })
                    var s = $scope.order.orderShowDate.startTime;
                    var e = $scope.order.orderShowDate.endTime;
                    var da = Date.differDate(s,e);
                    var _ss = stringToDate(s);
                    var _d = [];
                    for(var i = 0;i <= da;i++){
                        var w = _ss.getDay();
                        if(_w.indexOf(w) != -1){
                            _d.push(_ss.dateFormat())
                        }
                        _ss.calendar(1,1);
                    }
                    var _date = makeDateRange(_d,'startTime','endTime');
                    data.adShowDates = _date;
                    _s.selectWeeks = _w.join(',');
                }
            }else{
                //日期范围
                /**
                 * 验证时间是否重叠 或超过投放当期
                 */
                var valid = validTime($scope.order.orderShowDate, data.adShowDates);
                if (valid == 1) {
                    $scope.validTimeValue = '超过档期范围';
                    return true
                } else if (valid == 2) {
                    $scope.validTimeValue = '档期重合';
                    return true
                } else if(valid == 3){
                    $scope.validTimeValue = '档期不能为空';
                    return true
                }
            }

            var _priceCycle = data.priceCycle;//时间类型
            var _price = data.price;//单价
            var _scheduleType = data.scheduleType;//排期类型
            var _adShowDates = data.adShowDates;//天月时间

            if(_priceCycle == 3){//小时
                var _timeDetail = data.showTimeDetail = data.showTimeDetailList.map(function(a){
                    if(a.selected){
                        return 1
                    }else{
                        return 0
                    }
                });
            }

            var _discount = $scope.order.discount;//合同折扣
            var _present = $scope.order.present;//合同配送比例 ×××没有用到×××


            //全时间段
            if (data.showTimeBox == 0) {
                data.showTimeDetail = createArray(24, 1);
            }
            var _countPrice = selectCalculate(_scheduleType, _price, _discount, _adShowDates, _timeDetail, _priceCycle);

            cartTotal($scope.adListInfo[data._index].scheduleAdMoney, _countPrice, _scheduleType, _scheduleType);//计算排期总金额


            _s.scheduleValue = [];

            if(_priceCycle == 1 || _priceCycle == 2){
                data.adShowDates.forEach(function (data) {
                    var _t = "";
                    _t += new Date(data.startTime).dateFormat('yyyyMMdd') + '-' + new Date(data.endTime).dateFormat('yyyyMMdd');
                    _s.scheduleValue.push(_t);
                })
                _s._scheduleValue = getFrontElement(_s.scheduleValue, 2);
            }else if(_priceCycle == 3){
                var _a = [];
                _s.showTimeDetail = data.showTimeDetail;
                _s.showTimeDetail && _s.showTimeDetail.forEach(function (data,index,arr) {
                    var _t = "";
                    if(data == 1 && _a.length == 0){
                        _a.push({
                            index:index,
                            date:1
                        })
                    }
                    if(data == 0 && _a.length > 0){
                        _a.push({
                            index:index-1,
                            date:1
                        });
                        _t = "";
                        _t += intAddZero(_a[0].index) + ':00' + '-' + intAddZero(_a[1].index) + ':59';
                        _s.scheduleValue.push(_t);
                        _a.length = 0;
                    }
                    if(data == 1 && arr.length-1 == index){
                        _a.push({
                            index:index,
                            date:1
                        });
                        _t = "";
                        _t += intAddZero(_a[0].index) + ':00' + '-' + intAddZero(_a[1].index) + ':59';
                        _s.scheduleValue.push(_t);
                        _a.length = 0;
                    }
                });
                _s._scheduleValue = getFrontElement(_s.scheduleValue, 3);
            }
            _s.scheduleAdMoney = _countPrice;//暂存 排期总金额
            _s.scheduleAdMoneyShow = true;
            _s.dateType = data.dateType;
            _s.weekOrDate = data.weekOrDate;
            _s.adShowDates = _adShowDates;
        }

        /**
         * 总计算 排期金额 配送金额
         * @param a 旧排期金额
         * @param b 新排期金额
         * @param oldType 旧排期类型
         * @param newType 新排期类型
         */
        function cartTotal(a, b, oldType, newType) {
            a = a || 0;
            b = b || 0;
            if (isNaN($scope._cache.localScheduleMoney)) {
                $scope._cache.localScheduleMoney = 0;
            }
            if (isNaN($scope._cache.localDeliveryMoney)) {
                $scope._cache.localDeliveryMoney = 0;
            }
            if (oldType == newType) {
                if (oldType == 0 || oldType == 2) {
                    $scope._cache.localScheduleMoney -= a;
                    $scope._cache.localScheduleMoney += b;
                } else {
                    $scope._cache.localDeliveryMoney -= a;
                    $scope._cache.localDeliveryMoney += b;
                }
            } else if ((oldType == 0 || oldType == 2) && newType == 1) {
                $scope._cache.localScheduleMoney -= a;
                $scope._cache.localDeliveryMoney += b;
            } else {
                $scope._cache.localDeliveryMoney -= a;
                $scope._cache.localScheduleMoney += b;
            }
        }

        /**
         * 移除列
         * @param a
         * @param type
         */
        function cartRemove(a, type) {
            if (type == 0 || type == 2) {
                $scope._cache.localScheduleMoney -= a;
            } else if (type == 1) {
                $scope._cache.localDeliveryMoney -= a;
            }
        }

        /**
         * 改变排期类型
         * @param data
         * @param typeId add
         */
        $scope.scheduleTypeChange = function (data,typeId) {
            var _countPrice = 0;
            if (data.scheduleType == undefined) {
                //重新计算金额
                _countPrice = selectCalculate(typeId, data.price, $scope.order.discount, data.adShowDates, data.showTimeDetail, data.priceCycle);
                cartTotal(0, _countPrice, typeId, typeId);//计算排期总金额
                data.scheduleType = typeId;
                data.scheduleAdMoney = _countPrice;
            } else if (data.scheduleType != typeId) {
                //重新计算金额
                _countPrice = selectCalculate(typeId, data.price, $scope.order.discount, data.adShowDates, data.showTimeDetail, data.priceCycle);
                cartTotal(data.scheduleAdMoney, _countPrice, data.scheduleType, typeId);//计算排期总金额
                data.scheduleType = typeId;
                data.scheduleAdMoney = _countPrice;
            }
        };

        /**
         * 验证时间组
         * @param rangeTime 限定的时间范围
         * @param time 时间组
         * @returns {number} 0 成功 1时间组超过限定时间范围 2时间组之间有重合 3 档期为空
         */
        function validTime(rangeTime, time) {
            for (var a = 0; a < time.length; a++) {
                var data = time[a];
                if(!data.startTime && !data.endTime){
                    return 3;
                }
            }
            for (var a = 0; a < time.length; a++) {
                var data = time[a];
                if (new Date(rangeTime.startTime).getTime() > new Date(data.startTime).getTime() || new Date(rangeTime.endTime).getTime() < new Date(data.endTime).getTime()) {
                    return 1;
                }
            }
            for (var i = 0; i < time.length; i++) {
                for (var j = i + 1; j < time.length; j++) {
                    var startI = new Date(time[i].startTime).getTime();
                    var endI = new Date(time[i].endTime).getTime();
                    var startJ = new Date(time[j].startTime).getTime();
                    var endJ = new Date(time[j].endTime).getTime();

                    var _fullDate;
                    if(startI < startJ){
                        _fullDate = Math.abs(startI-endJ);
                    }else{
                        _fullDate = Math.abs(startJ-endI);
                    }

                    if((startI-endJ) == 0 || (endI-startJ) == 0 || _fullDate < Math.abs(Math.abs(startI-endI) + Math.abs(startJ-endJ))){
                        return 2;
                    }
                }
            }
            return 0
        }

        /**
         * 计算方式 根据scheduleType 类型的不同 来计算排期金额
         * @param type 排期类型 如果不计算 type传值0和1之外的值
         * @param price 单价
         * @param discount 折扣
         * @param time 天月时间 type Array
         * @param timeDetail 小时 type Array
         * @param timeType 时间类型
         * @returns {number} 排期金额
         * add
         */
        function selectCalculate(type, price, discount, time, timeDetail, timeType) {
            var _day = 0;//没有精确到小时，所以_day 默认1天；
            var count = 0;
            // discount>1?discount = discount*0.01:void (0);//折扣不可能大于1，页面是大于一的，所以/100；
            discount = 1;
            var _money = 0;
            switch (+type) {
                case 0:
                    switch (timeType) {
                        case 1:
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e)+1;
                            });
                            return _day * price * discount;
                        case 2:
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e)+1;

                                var _sDate = new Date(_s);
                                var _eDate = new Date(_e);
                                var _sLastDay = new Date(_s).getLastDate().getDate();
                                var _sMonth = _sDate.getMonth();
                                var _eMonth = _eDate.getMonth();

                                if(_sMonth != _eMonth){
                                    var _month = 0;
                                    if(_sMonth > _eMonth){
                                        _month = 11 - _sMonth + _eMonth + 1;
                                    }else{
                                        _month = _eMonth - _sMonth;
                                    }
                                    var _eLastDay = new Date(_e).getLastDate().getDate();

                                    var _sDay = _sLastDay - _sDate.getDate() + 1;
                                    var _eDay = _eDate.getDate();

                                    _money += price/_sLastDay*_sDay;
                                    _money += price/_eLastDay*_eDay;
                                    _money += price*(_month-1);
                                }else{
                                    _money += price/_sLastDay*(_eDate.getDate() - _sDate.getDate() + 1)
                                }
                            });
                            return _money;
                        case 3:
                            count = countElement(timeDetail, 1);
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e)+1;
                            });
                            return count * _day * price * discount;
                        default:
                            return 0;
                    }
                case 1:
                case 2:
                    switch (timeType) {
                        case 1:
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e)+1;
                            });
                            return _day * price;
                        case 2:
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e)+1;

                                var _sDate = new Date(_s);
                                var _eDate = new Date(_e);
                                var _sLastDay = new Date(_s).getLastDate().getDate();
                                var _sMonth = _sDate.getMonth();
                                var _eMonth = _eDate.getMonth();

                                if(_sMonth != _eMonth){
                                    var _month = 0;
                                    if(_sMonth > _eMonth){
                                        _month = 11 - _sMonth + _eMonth + 1;
                                    }else{
                                        _month = _eMonth - _sMonth;
                                    }
                                    var _eLastDay = new Date(_e).getLastDate().getDate();

                                    var _sDay = _sLastDay - _sDate.getDate() + 1;
                                    var _eDay = _eDate.getDate();

                                    _money += price/_sLastDay*_sDay;
                                    _money += price/_eLastDay*_eDay;
                                    _money += price*(_month-1);
                                }else{
                                    _money += price/_sLastDay*(_eDate.getDate() - _sDate.getDate() + 1)
                                }
                            });
                            return _money;
                        case 3:
                            count = countElement(timeDetail, 1);
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e)+1;
                            });
                            return count * _day * price;
                        default:
                            return 0;
                    }
                default:
                    return 0;
            }
        }

        /**
         * 显示 关联订单
         * @param name
         */
        $scope.query2 = {pageSize: 5,orderType:2};//搜索条件
        var modView2 = function (response) {
            ycui.loading.hide()
            $scope.page2 = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items2 = response.items;
            $scope.total_page2 = response.total_page;
        };
        //获取客户名称
        $scope.customerNameSel = {
            callback:function(e,d){
                OrdersFty.ordersList($scope.query2).then(modView2);
            }
        };
        CustomerFty.getAllCustomer({customerState: 1}).then(function (response) {
            if (response.code == 200) {
                $scope.customerNameSel.list = response.items
            }
        });
        // ycui.select('.yc-select-order',function (data) {
        //     var _array = data.attr('data-value').split(":");
        //     var _type = _array[0];
        //     var _value = _array[1];
        //     switch (_type){
        //         case 'me':
        //             _value != -1 && ($scope.query2.customerId = _value);
        //             break
        //     }
        //     OrdersFty.ordersList($scope.query2).then(modView2);
        // });
        $scope.showOrderCarList = function (name) {
            $scope.query2 = {pageSize: 5,orderType:2};
            /**
             * 关联订单
             */
            OrdersFty.ordersList($scope.query2).then(modView2);
            $scope.redirect2 = function (num,da) {
                ycui.loading.show()
                $scope.query2.pageIndex = num || 1;
                $scope.query2.ordersNameOrID = $scope.query2.search;
                OrdersFty.ordersList($scope.query2).then(modView2);
            };
            pointerTimely('orderCarRange');
            $scope.showOrderCarModule = {
                title:'选择关联订单',
                noClick:function(){

                },
                okClick:function(){

                }
            }
        };

        //取消订单关联
        $scope.hideRelatedOrder = function(event){
            event.stopPropagation();
            delete $scope._cache._relatedOrderName;
            delete $scope.order.orderName;
            delete $scope.order.relatedOrderId;
            delete $scope.scheduleTypeList;
            $scope.order.orderShowDate = {};
            delete $scope.order.contractType;
            delete $scope.order.customerId;
            delete $scope.order.customerName;
            delete $scope.order.futureMoney;
            delete $scope.order.historyScheduleMoney;
            delete $scope.order.packageMoney;
            delete $scope.order.contractCode;
            delete $scope.order.totalMoney;
            delete $scope.order.discount;
            delete $scope.order.present;
            delete $scope.order.isPackage;
        }

        /**
         * 选择关联订单
         * @param name
         * @param id
         */
        $scope.hideOrderAdList = function (name, id) {
            delete $scope.order.futureMoney;
            delete $scope.order.discount;
            delete $scope.order.present;
            if(id){
                OrdersFty.orderDetail({id:id}).then(function (res) {
                    if(res && res.code == 200){
                        var _order = res.orders;

                        $scope._cache._relatedOrderName = _order.orderName;
                        $scope.order.orderName = '赔偿' + _order.orderName;
                        $scope.order.relatedOrderId = _order.id;
                        $scope.scheduleTypeList = [{id: 1, name: '免费配送'}];

                        $scope.order.orderShowDate = _order.orderShowDate;
                        $scope.order.orderShowDate.pickerDateRange = 'pickerDateRange';
                        pointerTimely($scope.order.orderShowDate);

                        $scope.order.contractType = _order.contractType;
                        $scope.order.customerId = _order.customerId;
                        $scope.order.customerName = _order.customerName;
                        $scope.order.futureMoney = _order.futureMoney;
                        $scope.order.historyScheduleMoney = _order.historyScheduleMoney;
                        $scope.order.packageMoney = _order.packageMoney;

                        if(_order.contractCode){
                            ContractFty.getContractsByCode({contractCode: _order.contractCode}).then(function (res) {
                                if (res && res.code == 200 && res.items) {
                                    $scope.order.contractCode = res.items.contractCode;
                                    $scope.order.totalMoney = res.items.contractMoney;
                                    $scope.order.discount = +res.items.discount*100;
                                    setTimeout(function(){
                                        $scope.$apply(function () {
                                            $scope.order.present = +res.items.present*100;
                                        });
                                    },200);
                                    $scope.order.isPackage = res.items.type;
                                }
                            });
                        }else{
                            $scope.order.discount = _order.discount*100;
                            setTimeout(function(){
                                $scope.$apply(function () {
                                    $scope.order.present = _order.present*100;
                                });
                            },200);
                            $scope.order.isPackage = _order.isPackage;
                        }
                    }
                });
            }
            setTimeout(function(){
                document.querySelector('[yc-module=showOrderCarModule] .ok').click()
            },20)
        };

        var upload = function(id){
            var key = "";
            var config = {
                server: fileUrl + "/orderAdCreative/remark.htm",
                pick: '#' + id,
                beforeFileQueued:function(uploader,file){
                    ycui.loading.show();
                    uploader.stop(file);
                    UploadKeyFty.uploadKey().then(function (da) {
                        key = da.items;
                        uploader.upload(file);
                    });
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                uploadBeforeSend:function(uploader,file,data){
                    data.uploadKey = key;
                },
                uploadSuccess:function(uploader,file, res){
                    if (res && res.code == 200) {
                        !$scope.imgList && ($scope.imgList = []);
                        var wh = proportionPhoto(res.file.width, res.file.height, 75, 75);
                        $scope.$apply(function () {
                            res.file.width = wh[0];
                            res.file.height = wh[1];
                            $scope.imgList.push(res.file);
                        });
                        uploader.reset();
                    } else if (res._raw == "false") {
                        ycui.alert({
                            content: "不正确的操作",
                            timeout: 10,
                            error:true
                        });
                        uploader.reset();
                    } else {
                        ycui.alert({
                            content: res.msg,
                            timeout: 10,
                            error:true
                        });
                        uploader.reset();
                    }
                },
                error:function (uploader,err) {
                    switch (err){
                        case 'F_EXCEED_SIZE':
                            ycui.alert({
                                content: "文件大小不能超高2M",
                                timeout: 10,
                                error:true
                            });
                            break;
                        case 'Q_TYPE_DENIED':
                            ycui.alert({
                                content: "错误的文件类型",
                                timeout: 10,
                                error:true
                            });
                            break;
                        default:
                            ycui.alert({
                                content: "操作错误",
                                timeout: 10,
                                error:true
                            });
                            break;
                    }
                    ycui.loading.hide();
                    uploader.reset();
                }
            };
            uploadInit(config);
        };
        //备注图片上传
        $scope.showPhoto = 0;
        $scope.showPhotoFun = function () {
            if($scope.showPhoto === 0){
                upload('showPhotoUpload');
            }
            $scope.showPhoto = !$scope.showPhoto;
        };
        /**
         * 表单验证
         */
        $(".form").validate({
            rules: {
                orderName: "required",
                futureMoney: {
                    required: true,
                    number: true,
                    min:1
                },
                historyScheduleMoney: {
                    required: true,
                    number: true,
                    min:0
                },
                totalMoney: "required",
                discount:  {
                    required: true,
                    number: true,
                    min:0,
                    max:100
                },
                present: {
                    required: true,
                    number: true,
                    min:0
                },
                packageMoney: {
                    required: true,
                    number: true,
                    min:1
                }
            },
            messages: {
                orderName: '请输入订单名称',
                futureMoney: {
                    required: '请输入预估合同金额',
                    number: '请输入正确的预估合同金额'
                },
                historyScheduleMoney: {
                    required: '请输入历史排期金额',
                    number: '请输入正确的历史排期金额'
                },
                totalMoney: {
                    required: '请输入合同金额',
                    number: '请输入正确的合同金额'
                },
                discount: {
                    required: '请输入合同折扣',
                    number: '请输入正确的合同折扣'
                },
                present: {
                    required: '请输入合同配送',
                    number: '请输入正确的合同配送'
                },
                packageMoney: {
                    required: '请输订单打包金额',
                    number: '请输入正确的订单打包金额'
                }
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });

        $.getJSON("../../static/data/areas.json", function (data) {
            $scope.getAreaids = ycui.createAreas(data, [], '#areasList');
        });

        $scope.languageList = [
            {name: "中文/简体", id: 1},
            {name: "英语", id: 2},
            {name: "西班牙语", id: 3},
            {name: "法语", id: 4},
            {name: "中文/繁体", id: 5},
            {name: "俄语", id: 6},
            {name: "日本语", id: 7},
            {name: "阿拉伯语", id: 8},
            {name: "韩语", id: 9},
            {name: "德语", id: 10},
            {name: "维吾尔语", id: 11},
            {name: "藏语", id: 12},
            {name: "蒙古语", id: 13}
        ];

        $scope.postEdit = function () {
            $scope.validShow = true;
            var $bo = false;
            //验证
            if ($scope.order.orderType == 1 || $scope.order.orderType == 2 || $scope.order.orderType == 3) {
                if ($scope.order.customerId == undefined) {
                    $bo = true;
                }
            }

            if ($scope.order.orderType == 4 && !$scope.order.agencyNumber) {
                $bo = true;
            }

            if ($scope.order.orderType == 2 && !$scope.order.contractCode && $scope.order.contractType == 1) {
                $bo = true;
            }

            if (!$('.form').valid()) {
                $bo = true;
            }

            if($bo)return;

            //获取id 和 name；
            var _getArea = $scope.getAreaids(true, true);
            var _languageList = [];
            $scope.languageList.forEach(function (data) {
                if (data.value && data.value != 0) {
                    _languageList.push(data.value)
                }
            });

            var body = angular.copy($scope.order);

            //备注图片
            if($scope.showPhoto && $scope.imgList && $scope.imgList.length > 0){
                $scope.imgList.forEach(function (da,i) {
                    body['remarkUrl'+ '' + ++i] = da.fileHttpUrl;
                })
            }

            if(body.orderType == 1 || body.orderType == 3 || body.orderType == 4){
                delete body.contractType;
                delete body.contractCode;
                delete body.present;
                delete body.discount;
                delete body.historyScheduleMoney;
                delete body.futureMoney;
                delete body.totalMoney;
                if(body.orderType == 3){
                    delete body.agencyDepName;
                    delete body.agencyNumber;
                }
                if(body.orderType == 4){
                    delete body.customerId;
                    delete body.customerName;
                }
                if(body.orderType != 1){
                    delete body.isPackage;
                }
            }

            if($scope._cache.orderListManagerShow){
                body.buyMoney = $scope._cache.localScheduleMoney;
                body.presentMoney = $scope._cache.localDeliveryMoney;
            }

            if ($scope.languageShow == 1) {
                body.directionLanguages = _languageList.join(",");
            }else{
                delete body.directionLanguages;
            }
            if ($scope.areasListShow == 1) {
                body.directionCitys = _getArea[0].join(",");
                body.directionArea = _getArea[1].join(",");
                var _array = [];
                _getArea[2].forEach(function (data) {
                    data.child && (_array = _array.concat(data.child));
                });

                var _directionValue = [];
                _array.forEach(function (data) {
                    _directionValue.push(data.name);
                    if(data.length != data.child.length){
                        _directionValue.push('（');
                        data.child.forEach(function (da,i) {
                            if(i == data.child.length -1){
                                _directionValue.push(da.name)
                            }else{
                                _directionValue.push(da.name + '、')
                            }
                        });
                        _directionValue.push('）');
                    }
                    _directionValue.push('\n');
                });
                body.directionValue = _directionValue.join('');
            }else{
                delete body.directionCitys;
                delete body.directionArea;
            }

            var _adListInfo = [];
            var _adJudgeListInfo = [];
            $scope.adListInfo.forEach(function (data) {
                var _adShowDates = [];
                data.adShowDates.forEach(function (ad) {
                    _adShowDates.push({
                        startTime: ad.startTime,
                        endTime: ad.endTime
                    })
                });
                // var _s = void 0;
                //传参数 标准的日期格式yyyy-MM-dd
                /*if (data.priceCycle == 2) {
                    //如果是刊例价单位是月
                    if(!Date.fullMonth(body.orderShowDate.startTime,body.orderShowDate.endTime)){
                        return
                    }
                    _s = angular.copy(_adShowDates);
                    _s.forEach(function (da) {
                        da.startTime = new Date(da.startTime).dateFormat();
                        da.endTime = new Date(da.endTime).getLastDate().dateFormat();
                    })
                }*/

                if(data.priceCycle == 3 && data.scheduleType == 3){
                    data.showTimeDetail = createArray(24,1);
                }

                var _q = {
                    adSpaceId: data.id,
                    price: data.price,
                    priceCycle: data.priceCycle,
                    scheduleType: data.scheduleType,
                    adShowDates: _adShowDates,
                    dateType:data.dateType,
                    weekOrDate:data.weekOrDate,
                    selectWeeks:data.selectWeeks
                };
                if (data.priceCycle == 3) {
                    _q.showTimeDetail = data.showTimeDetail.join('');
                }else{
                    data.showTimeDetail = createArray(24,1);
                }
                _adListInfo.push(_q);

                _adJudgeListInfo.push({
                    adSpaceName:data.adSpaceName,
                    adSpaceId: data.id,
                    priceCycle: data.priceCycle,
                    adShowDates: _adShowDates,
                    showTimeDetail:data.showTimeDetail.join(''),
                    scheduleType:data.scheduleType
                })
            });


            body.orderShowDate = {
                startTime: body.orderShowDate.startTime,
                endTime: body.orderShowDate.endTime
            };

            body.orderADSpaces = _adListInfo;

            if (!body.orderADSpaces || body.orderADSpaces.length == 0) {
                ycui.alert({
                    error:true,
                    content: '请选择广告位',
                    timeout: 10
                });
                return void 0;
            }

            for (var i = 0; i < body.orderADSpaces.length; i++) {
                var data = body.orderADSpaces[i];
                if (data.scheduleType == undefined) {
                    ycui.alert({
                        error:true,
                        content: '请选择广告位的排期类型',
                        timeout: 10
                    });
                    return void 0;
                }
            }

            for (var i = 0; i < body.orderADSpaces.length; i++) {
                var data = body.orderADSpaces[i];
                for (var j = i + 1; j < body.orderADSpaces.length; j++) {
                    var _data = body.orderADSpaces[j];
                    if(data.adSpaceId == _data.adSpaceId && data.scheduleType == _data.scheduleType){
                        ycui.alert({
                            error:true,
                            content: '相同广告位排期类型不能相同！',
                            timeout: 10
                        });
                        return void 0;
                    }
                }
            }

            if($scope.order.orderType == 2){
                if($scope.order.isPackage == 2){
                    if($scope.order.contractCode){
                        if(+$scope.order.totalMoney - (+$scope._cache.contract.schedulingBuyMoney || 0) < +$scope.order.packageMoney){
                            ycui.alert({
                                error:true,
                                content:'订单打包金额超过合同可购买金额',
                                timeout:10
                            });
                            return
                        }
                    }else {
                        if(+$scope.order.futureMoney < +$scope.order.packageMoney){
                            ycui.alert({
                                error:true,
                                content:'订单打包金额超过合同可购买金额',
                                timeout:10
                            });
                            return
                        }
                    }
                }
            }

            ycui.loading.show();
            var query = {};
            query.orderADSpaces = _adJudgeListInfo;
            if (body.directionCitys) {
                body.directionCitys && (query.directionCitys = body.directionCitys);
                body.directionArea && (query.directionArea = body.directionArea);
            }

            if(body.orderType == 2){
                body.discount = body.discount*0.01;
                body.present = body.present*0.01;
            }

            var judgeADShowDateUsable = OrdersFty.judgeADShowDateUsable(query);
            var contractTolerantCurrent = SysContractTolerantFty.contractTolerantCurrent();

            $q.all([judgeADShowDateUsable,contractTolerantCurrent]).then(function (res) {
                ycui.loading.hide();
                //不能超过合同最大排期总金额
                if ($scope.order.orderType == 2 && $scope.order.isPackage == 1) {
                    var _s = 0;//容错金额
                    switch (res[1].tolerantRule){
                        case 1:
                            if($scope.order.futureMoney*res[1].tolerant > res[1].tolerantMoney){
                                _s = res[1].tolerantMoney
                            }else{
                                _s = $scope.order.futureMoney*res[1].tolerant
                            }
                            break;
                        case 2:
                            if($scope.order.futureMoney*res[1].tolerant > res[1].tolerantMoney){
                                _s = $scope.order.futureMoney*res[1].tolerant
                            }else{
                                _s = res[1].tolerantMoney
                            }
                            break;
                    }
                    var _contractMoney = $scope.order.futureMoney / ($scope.order.discount * 0.01);
                    var _contractMoneyMax = _contractMoney + _s;
                    var _presentMoney = $scope.order.futureMoney * ($scope.order.present * 0.01);
                    var _presentMoneyMax = _presentMoney + _s;
                    var _schedulingMoneyMax = _contractMoney + _presentMoney + _s;

                    if($scope.order.contractCode){
                        _contractMoneyMax = $scope._cache.contract.contractBuyMoneyMax;
                        _presentMoneyMax = $scope._cache.contract.presentMoneyMax;
                        _schedulingMoneyMax = $scope._cache.contract.scheduleMoneyMax;
                    }

                    if($scope._cache.localScheduleMoney + ($scope._cache.contract.schedulingBuyMoney || 0) > _contractMoneyMax){
                        ycui.alert({
                            error:true,
                            content: '排期购买金额大于剩余合同总购买金额',
                            timeout: 10
                        });
                        return void 0;
                    }

                    if($scope._cache.localDeliveryMoney + ($scope._cache.contract.schedulingPresentedMoney || 0) > _presentMoneyMax){
                        ycui.alert({
                            error:true,
                            content: '排期配送金额大于剩余合同总配送金额',
                            timeout: 10
                        });
                        return void 0;
                    }

                    if($scope._cache.localDeliveryMoney + $scope._cache.localScheduleMoney + ($scope._cache.contract.schedulingBuyMoney || 0) + ($scope._cache.contract.schedulingPresentedMoney || 0) > _schedulingMoneyMax){
                        ycui.alert({
                            error:true,
                            content: '超过合同最大排期总金额',
                            timeout: 10
                        });
                        return void 0;
                    }
                }

                if (res[0] && res[0].data && res[0].data.code == 201) {
                    ycui.alert({
                        title:'提示框',
                        content: "<div style='max-height:350px;max-width:600px;overflow-y: auto;'><p style='text-align: left;line-height: 25px'>" + res[0].data.msg.join("<br>") + "</p></div>",
                        timeout: -1
                    })
                }else{
                    ycui.loading.show();
                    OrdersFty.orderAdd(body).then(function (res) {
                        ycui.loading.hide();
                        if (res.code == 200) {
                            ycui.alert({
                                content: res.msg,
                                okclick: function () {
                                    //改变审核数量
                                    SysUserFty.getCheckOrdersCount().then(function (res) {
                                        if (res && res.code == 200) {
                                            var count = res.count;
                                            count = count > 99?99:count;
                                            window.top.$setCheckNumChange && window.top.$setCheckNumChange(count);
                                        }
                                    });
                                    /*如果是正式投放 就跳转到创意新增页面*/
                                    if ($scope.order.orderType != 1) {
                                        goRoute('ViewPutOrderCreateAdd',{
                                            orderAutoId:res.orderId,
                                            orderAutoName:res.orderName,
                                            orderAutoType:$scope.order.orderType
                                        })
                                    } else {
                                        goRoute('ViewPutOrder');
                                    }
                                    //改变审核数量
                                    window.top.$checkNumChange && window.top.$checkNumChange(1)
                                },
                                timeout: 10
                            });
                        }
                    })
                }
            });
        }

    }]);
