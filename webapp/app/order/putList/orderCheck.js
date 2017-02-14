/**
 * Created by moka on 16-6-21.
 */
app.controller("PutCheckCtrl", ["$scope", "$http", "OrdersFty", "ScheduleFty", "ContractFty", "$q",'SysUserFty',
    function ($scope, $http, OrdersFty, ScheduleFty, ContractFty, $q,SysUserFty) {
        $scope._cache = {};//临时值
        /**
         * 表单 默认值
         */
        $scope.order = {};
        $scope.selectContractShow = false;

        $scope.adListInfo = [];//广告位列表集合

        var id = getSearch('id');
        var orderDetail = OrdersFty.orderDetail({id:id}).then(function (res) {
            if(res && res.code == 200){
                $scope.order = res.orders;
                $scope.order.checkState = 1;
                //是否显示排期值
                $scope._cache.orderListManagerShow = function () {
                    return ((($scope.order.orderType == 1 && $scope.order.isPackage != 2) || ($scope.order.orderType == 2 && $scope.order.isPackage != 2) || ($scope.order.orderType == 5 && $scope.order.isPackage != 2)) || ($scope.order.orderType == 3 || $scope.order.orderType == 4))
                }
                /**
                 * 默认值
                 * @type {string}
                 */
                $scope._cache.trueName = $scope.order.flowUserName;
                $scope._cache.companyId = $scope.order.orderInCompanyId;

                if($scope.order.orderType == 2 && !$scope.order.contractCode){
                    $scope.order.discount = res.orders.discount*100;
                    $scope.order.present = res.orders.present*100;
                }else if($scope.order.orderType == 2 && $scope.order.contractCode){
                    /**
                     * 有合同号 拉取最新合同信息
                     */
                    ContractFty.getContractsByCode({contractCode: $scope.order.contractCode}).then(function (res) {
                        if (res && res.code == 200 && res.items) {
                            $scope.order.totalMoney = res.items.contractMoney;
                            $scope.order.discount = res.items.discount*100;
                            $scope.order.present = res.items.present*100;
                            $scope.order.isPackage = res.items.type;

                            $scope._cache.contract = res.items;
                            $scope.selectContractShow = true;
                        }
                    });
                }

                /**
                 * 时间戳转时间字符
                 */
                $scope.order.orderShowDate = {
                    startTime:new Date($scope.order.orderShowDate.startDate).dateFormat('yyyy-MM-dd'),
                    pickerDateRange:"pickerDateRange",
                    endTime:new Date($scope.order.orderShowDate.endDate).dateFormat('yyyy-MM-dd')
                };

                $scope.order.orderADSpaces.forEach(function (data) {
                    data.adShowDates.forEach(function (da,index,data) {
                        data[index] = {
                            startTime:new Date(da.startDate).dateFormat('yyyy-MM-dd'),
                            endTime:new Date(da.endDate).dateFormat('yyyy-MM-dd'),
                            pickerDateRange:Math.uuid()
                        }
                    });
                    if(data.showTimeDetail){
                        data.showTimeDetail = data.showTimeDetail.split('');
                    }
                });
                /**
                 * 广告位展现
                 */
                for (var i = 0, j = $scope.order.orderADSpaces.length; i < j; i++) {
                    var _s = $scope.order.orderADSpaces[i];
                    addListInfo(_s);

                    var _priceCycle = _s.priceCycle;
                    _s.scheduleValue = [];
                    if (_priceCycle == 1 || _priceCycle == 2) {
                        _s.adShowDates.forEach(function (data) {
                            var _t = "";
                            _t += new Date(data.startTime).dateFormat('yyyyMMdd') + '-' + new Date(data.endTime).dateFormat('yyyyMMdd');
                            _s.scheduleValue.push(_t);
                        })
                    } else if (_priceCycle == 3) {
                        var _a = [];
                        _s.showTimeDetail && _s.showTimeDetail.forEach(function (data, index, arr) {
                            var _t = "";
                            if (data == 1 && _a.length == 0) {
                                _a.push({
                                    index: index,
                                    date: 1
                                })
                            }
                            if (data == 0 && _a.length > 0) {
                                _a.push({
                                    index: index - 1,
                                    date: 1
                                });
                                _t = "";
                                _t += intAddZero(_a[0].index) + ':00' + '-' + intAddZero(_a[1].index) + ':59';
                                _s.scheduleValue.push(_t);
                                _a.length = 0;
                            }
                            if (data == 1 && arr.length - 1 == index) {
                                _a.push({
                                    index: index,
                                    date: 1
                                });
                                _t = "";
                                _t += intAddZero(_a[0].index) + ':00' + '-' + intAddZero(_a[1].index) + ':59';
                                _s.scheduleValue.push(_t);
                                _a.length = 0;
                            }
                        })
                    }

                    _s._scheduleValue = getFrontElement(_s.scheduleValue, 3);
                    _s.scheduleAdMoneyShow = true;

                    var __s = angular.copy(_s);
                    $scope.adListInfo.push(__s);
                }
                
                switch ($scope.order.orderType) {
                    case 1:
                        $scope.scheduleTypeList = [{id: 0, name: '正常购买'}, {id: 1, name: '免费配送'}];
                        break;
                    case 2:
                        $scope.scheduleTypeList = [{id: 0, name: '正常购买'}, {id: 1, name: '免费配送'}];
                        break;
                    case 3:
                        $scope.scheduleTypeList = [{id: 1, name: '免费配送'}];
                        break;
                    case 4:
                        $scope.scheduleTypeList = [{id: 2, name: '自用'}];
                        break;
                    case 5:
                        $scope.scheduleTypeList = [{id: 1, name: '免费配送'}];
                        break;
                }

                if ($scope.order.isPackage == 2) {
                    $scope.scheduleTypeList = [{id: 3, name: '打包'}];
                }
            }
        });

        /**
         * 计算购买配送总金额
         * @param futureMoney 预估合同金额
         * @param discount 合同折扣
         * @param present 合同配送
         */
        function schedulingMoneyMax(futureMoney, discount, present) {
            var _contractMoneyMax = futureMoney / (discount * 0.01);
            var _presentMoneyMax = futureMoney * (present * 0.01);
            $scope._cache.contract = {
                contractBuyMoney: _contractMoneyMax,
                presentMoney: _presentMoneyMax,
                schedulingBuyMoney: $scope.order.buyMoney,
                schedulingPresentedMoney: $scope.order.presentMoney,
                scheduleMoney: _contractMoneyMax + _presentMoneyMax
            };
        }

        $q.all([orderDetail]).then(function () {
            $scope.schedulingMoney = function () {
                if ($scope.order.orderType == 2 && !$scope.order.contractCode) {
                    schedulingMoneyMax($scope.order.futureMoney, $scope.order.discount, $scope.order.present)
                }
            };
            $scope.schedulingMoney();
        });

        /**
         * 订单审核详情
         */
        OrdersFty.orderCheckInfo({id: id}).then(function (res) {
            if (res && res.code == 200) {
                var _checkInfoList = [];

                res.orderCheckInfo.forEach(function (data) {
                    if(data.checkStepState == 1){
                        _checkInfoList.push(data);
                    }
                    if(data.checkStepState == 0){
                        $scope.checkInfoListFirst = data
                    }
                })

                $scope.checkInfoList = _checkInfoList;
            }
        })

        //表单下拉
        // ycui.select('.yc-select-check');

        var initPicker = function () {
            pointerTimely($scope.order.orderShowDate);
        };
        $q.all([orderDetail]).then(function () {
            initPicker();
        });

        /**
         * 显示购物车详细信息
         * @param itemInfo 广告位对象
         * @param index 广告位下标
         */
        function addListInfo(itemInfo) {
            if (!itemInfo.adShowDates) {
                itemInfo.adShowDates = [];
                itemInfo.adShowDates[0] = angular.copy($scope.order.orderShowDate);
                itemInfo.adShowDates[0].pickerDateRange = Math.uuid();

                //默认选择一个排期类型
                if ($scope.scheduleTypeList && $scope.scheduleTypeList.length >= 1) {
                    itemInfo.scheduleType = $scope.scheduleTypeList[0].id
                }
            }

            switch (itemInfo.priceCycle) {
                case 1:
                    /**
                     * 日期控件ID生成
                     */
                    if (!itemInfo.adSpaceId) {
                        pointerTimely(itemInfo.adShowDates[0], true, itemInfo);
                    } else {
                        !function (data) {
                            var _scheduleAdMoney = selectCalculate(data.scheduleType, data.price, $scope.order.discount, data.adShowDates, data.showTimeDetail, data.priceCycle);
                            cartTotal(data.scheduleAdMoney, _scheduleAdMoney, data.scheduleType, data.scheduleType);//计算排期总金额
                            data.scheduleAdMoney = _scheduleAdMoney;
                        }(itemInfo);
                    }

                    break;
                case 2:
                    if (!itemInfo.adSpaceId) {
                        pointerTimely(itemInfo.adShowDates[0], true, itemInfo);
                    } else {
                        !function (data) {
                            var _scheduleAdMoney = selectCalculate(data.scheduleType, data.price, $scope.order.discount, data.adShowDates, data.showTimeDetail, data.priceCycle);
                            cartTotal(data.scheduleAdMoney, _scheduleAdMoney, data.scheduleType, data.scheduleType);//计算排期总金额
                            data.scheduleAdMoney = _scheduleAdMoney;
                        }(itemInfo);
                    }
                    break;
                case 3:
                    $scope.times = [];
                    if (!itemInfo.showTimeDetail) {
                        itemInfo.showTimeDetail = createArray(24, 1);
                        itemInfo.startTime = 0;
                        itemInfo.endTime = 23;
                    }
                    var i = 0;
                    while (i <= 23) {
                        $scope.times.push({
                            s: i,
                            z: intAddZero(i, 2) + ':' + '00',
                            n: intAddZero(i, 2) + ':' + '59'
                        });
                        i++;
                    }

                    itemInfo.showTimeBox = 0;//默认选择全时间段

                    /**
                     * 列表 小时计算
                     * @param data
                     * @param index
                     */
                    $scope.addTimeDetail = function (data) {
                        var _scheduleAdMoney = 0;
                        if (!data.adSpaceId) {
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
                            _scheduleAdMoney = selectCalculate(data.scheduleType, data.price, $scope.order.discount, [$scope.order.orderShowDate], data.showTimeDetail, data.priceCycle);
                        } else {
                            _scheduleAdMoney = selectCalculate(data.scheduleType, data.price, $scope.order.discount, data.adShowDates, data.showTimeDetail, data.priceCycle);
                        }
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
         * @param obj 广告位对象
         */
        function pointerTimely(ad, bo, obj) {
            setTimeout(function () {
                !function (da, ob, obj) {
                    var _minValidDate = $scope.order.orderShowDate.startTime;
                    var _maxValidDate = $scope.order.orderShowDate.endTime;
                    /**
                     * 投放档期 没有时间范围的限制
                     */
                    if (da.pickerDateRange == 'pickerDateRange') {
                        _minValidDate = '1970-01-01';
                        _maxValidDate = '';
                    }
                    var _options = {
                        defaultText: ' / ',
                        isSingleDay: false,
                        stopToday: false,
                        stopTodayBefore: true,
                        startDate: da.startTime,
                        endDate: da.endTime,
                        minValidDate: _minValidDate || '1970-01-01',
                        maxValidDate: _maxValidDate || '',
                        calendars: 2,
                        shortbtn: 0
                    };
                    _options.success = function (data) {
                        $scope.$apply(function () {
                            da.startTime = data.startDate;
                            da.endTime = data.endDate;
                        });
                        if (ob) {
                            //重新计算金额
                            if (obj.scheduleType != undefined) {
                                $scope.$apply(function () {
                                    var _scheduleAdMoney = selectCalculate(obj.scheduleType, obj.price, $scope.order.discount, obj.adShowDates, [], obj.priceCycle);
                                    cartTotal(obj.scheduleAdMoney, _scheduleAdMoney, obj.scheduleType, obj.scheduleType);//计算排期总金额
                                    obj.scheduleAdMoney = _scheduleAdMoney;
                                })
                            }
                        }
                    };

                    new pickerDateRange(da.pickerDateRange || da, _options);
                    if (ob) {
                        //重新计算金额
                        if (obj.scheduleType != undefined) {
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

        /**
         * 计算方式 根据scheduleType 类型的不同 来计算排期金额
         * @param type 排期类型 如果不计算 type传值0和1之外的值
         * @param price 单价
         * @param discount 折扣
         * @param time 天月时间 type Array
         * @param timeDetail 小时 type Array
         * @param timeType 时间类型
         * @param orderType 订单类型
         * @returns {number} 排期金额 check
         */
        function selectCalculate(type, price, discount, time, timeDetail, timeType) {
            var _day = 0;//没有精确到小时，所以_day 默认1天；
            var count = 0;
            // discount>1?discount = discount*0.01:void (0);//折扣不可能大于1，页面是大于一的，所以/100；
            discount = 1;
            var _money = 0;
            switch (type) {
                case 0:
                    switch (timeType) {
                        case 1:
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e) + 1;
                            });
                            return _day * price * discount;
                        case 2:
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e) + 1;

                                var _sDate = new Date(_s);
                                var _eDate = new Date(_e);
                                var _sLastDay = new Date(_s).getLastDate().getDate();
                                var _sMonth = _sDate.getMonth();
                                var _eMonth = _eDate.getMonth();

                                if (_sMonth != _eMonth) {
                                    var _month = 0;
                                    if(_sMonth > _eMonth){
                                        _month = 11 - _sMonth + _eMonth + 1;
                                    }else{
                                        _month = _eMonth - _sMonth;
                                    }
                                    var _eLastDay = new Date(_e).getLastDate().getDate();

                                    var _sDay = _sLastDay - _sDate.getDate() + 1;
                                    var _eDay = _eDate.getDate();

                                    _money += price / _sLastDay * _sDay;
                                    _money += price / _eLastDay * _eDay;
                                    _money += price * (_month - 1);
                                } else {
                                    _money += price / _sLastDay * (_eDate.getDate() - _sDate.getDate() + 1)
                                }
                            });
                            return _money;
                        case 3:
                            count = countElement(timeDetail, 1);
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e) + 1;
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
                                _day += +Date.differDate(_s, _e) + 1;
                            });
                            return _day * price;
                        case 2:
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e) + 1;

                                var _sDate = new Date(_s);
                                var _eDate = new Date(_e);
                                var _sLastDay = new Date(_s).getLastDate().getDate();
                                var _sMonth = _sDate.getMonth();
                                var _eMonth = _eDate.getMonth();

                                if (_sMonth != _eMonth) {
                                    var _month = 0;
                                    if(_sMonth > _eMonth){
                                        _month = 11 - _sMonth + _eMonth + 1;
                                    }else{
                                        _month = _eMonth - _sMonth;
                                    }
                                    var _eLastDay = new Date(_e).getLastDate().getDate();

                                    var _sDay = _sLastDay - _sDate.getDate() + 1;
                                    var _eDay = _eDate.getDate();

                                    _money += price / _sLastDay * _sDay;
                                    _money += price / _eLastDay * _eDay;
                                    _money += price * (_month - 1);
                                } else {
                                    _money += price / _sLastDay * (_eDate.getDate() - _sDate.getDate() + 1)
                                }
                            });
                            return _money;
                        case 3:
                            count = countElement(timeDetail, 1);
                            time.forEach(function (data) {
                                var _s = data.startTime;
                                var _e = data.endTime;
                                _day += +Date.differDate(_s, _e) + 1;
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

        // var adSpaceUsedDetail = OrdersFty.adSpaceUsedDetail({id: id})

        $scope.commitInfo = function () {
            if(!$(".form").valid()){
                return
            }
            var str = '';
            var stateValue = '确定把状态更改为审核通过';
            var query = {orderId: id, checkState: $scope.order.checkState};
            if ($scope.order.checkState == -1) {
                stateValue = '确定把状态更改为审核不通过';
                query = {orderId: id, checkState: $scope.order.checkState, checkRemark: $scope.order.checkRemark}
            }
            ycui.confirm({
                content:stateValue,
                okclick:function () {
                    OrdersFty.orderCheck(query).then(function (res) {
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
                                    goRoute('ViewPutOrder');
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
                }
            });

            // $q.all([adSpaceUsedDetail]).then(function (res) {
            //     if (res && res[0] && res[0].status == 200) {
            //         var data = res[0].data;
            //         if (data.msg instanceof Array) {
            //             for (var i = 0, j = data.msg.length; i < j; i++) {
            //                 str += data.msg[i].content + '<br>'
            //             }
            //             str += "<br>" + '<p style="text-align: center">' + stateValue + '</p>';
            //         }
            //         ycui.confirm({
            //             content: "<div style='text-align: left;max-width: 800px;overflow-y: auto;max-height: 400px;'>" + (str || '<p style="text-align: center">' + stateValue + '</p>') + "</div>",
            //             okclick: function () {
            //                 OrdersFty.orderCheck(query).then(function (res) {
            //                     if (res.code == 200) {
            //                         ycui.alert({
            //                             content: res.msg,
            //                             okclick: function () {
            //                                 goRoute('ViewPutOrder');
            //                             }
            //                         })
            //                     }else if(res.code == 405){
            //                         ycui.alert({
            //                             error:true,
            //                             content: res.msg,
            //                             timeout:10
            //                         })
            //                     }
            //                 })
            //             }
            //         })
            //     }
            // });
        };

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

        /**
         * 语言 地域 数据展现
         */
        $q.all([orderDetail]).then(function () {
            $.getJSON("../../static/data/areas.json", function (data) {
                $scope.getAreaids = ycui.createAreas(data, $scope.order.childIdList, '#areasList');
                if ($scope.order.childIdList.length > 0) {
                    $scope.$apply(function () {
                        $scope.areasListShow = 1
                    })
                }
            });
            if ($scope.order.languageList && $scope.order.languageList.length > 0) {
                $scope.languageShow = 1;
                $scope.order.languageList.forEach(function (da) {
                    $scope.languageList.forEach(function (data) {
                        if (da.id == data.id) {
                            data.value = data.id
                        }
                    })
                })
            }
        });

        /**
         * 表单验证
         */
        $(".form").validate({
            rules: {
                checkRemark: "required"
            },
            messages: {
                checkRemark: '请输入审核备注'
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });

    }])
