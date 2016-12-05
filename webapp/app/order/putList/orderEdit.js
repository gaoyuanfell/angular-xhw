app.controller('PutEditCtrl', ['$scope', '$q', 'ContractFty', 'OrdersFty', 'ResCreativityFty', 'ScheduleFty', 'CustomerFty', 'SysCompanyFty', 'SysUserFty', 'SysContractTolerantFty', 'ResMediaFty','UploadKeyFty','ResChannelFty',
    function ($scope, $q, ContractFty, OrdersFty, ResCreativityFty, ScheduleFty, CustomerFty, SysCompanyFty, SysUserFty, SysContractTolerantFty, ResMediaFty,UploadKeyFty,ResChannelFty) {
        $scope.customerListSel = {}
        //客户下拉
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 2}).success(function (res) {
            if (res && res.code == 200) {
                $scope.customerListSel.list = res.items;
            }
        });

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
                    ContractFty.getContractsByCode({contractCode: d}).success(function (res) {
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

        $scope._cache = {};//临时值
        /**
         * 表单 默认值
         */
        $scope.order = {};

        $scope.showState = +getSearch('showState');
        $scope.selectContractShow = false;
        $scope.adListInfo = [];//广告位列表集合

        var id = getSearch('id');
        var orderDetail = OrdersFty.orderDetail({id: id}).success(function (res) {
            if (res && res.code == 200) {
                if (res.orders.orderType == 1) {
                    delete res.orders.present;
                    delete res.orders.packageMoney;
                    delete res.orders.futureMoney;
                    delete res.orders.discount;
                    delete res.orders.contractType;
                    delete res.orders.historyScheduleMoney;
                }
                $scope.order = res.orders;
                var companyId = $scope._cache.adInCompanyId = $scope.order.adInCompanyId;
                
                //下拉值
                // $scope.orderTypeSel.placeholder = $scope.order.orderName;
                // $scope.customerListSel.placeholder = $scope.order.customerName;
                // $scope.departmentListSel.placeholder = $scope.order.agencyDepName;

                $scope._cache.order = angular.copy(res.orders);
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

                if ($scope.order.orderType == 2 && !$scope.order.contractCode) {
                    $scope.order.discount = res.orders.discount * 100;
                    $scope.order.present = res.orders.present * 100;
                    $scope._cache.order.discount = res.orders.discount;
                    $scope._cache.order.present = res.orders.present;
                } else if ($scope.order.orderType == 2 && $scope.order.contractCode) {
                    /**
                     * 有合同号 拉取最新合同信息
                     */
                    ContractFty.getContractsByCode({contractCode: $scope.order.contractCode}).success(function (res) {
                        if (res && res.code == 200 && res.items) {
                            $scope.order.totalMoney = res.items.contractMoney;
                            $scope.order.discount = res.items.discount * 100;
                            $scope.order.present = res.items.present * 100;
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
                    startTime: new Date($scope.order.orderShowDate.startDate).dateFormat('yyyy-MM-dd'),
                    pickerDateRange: "pickerDateRange",
                    pickerStart: 'pickerRangeStart',
                    pickerEnd: 'pickerRangeEnd',
                    endTime: new Date($scope.order.orderShowDate.endDate).dateFormat('yyyy-MM-dd')
                };

                $scope.order.orderADSpaces.forEach(function (data) {
                    data.adShowDates.forEach(function (da, index, data) {
                        data[index] = {
                            startTime: new Date(da.startDate).dateFormat('yyyy-MM-dd'),
                            endTime: new Date(da.endDate).dateFormat('yyyy-MM-dd'),
                            pickerDateRange: Math.uuid()
                        }
                    });
                    if (data.showTimeDetail) {
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

                //备注图片转换
                if($scope.order.remarkUrl1){
                    $scope.showPhoto = !0;
                    $scope.imgList = [];
                    var img1 = getImgInfo($scope.order.remarkUrl1);
                    img1.onload = function () {
                        var wh1 = proportionPhoto(img1.width,img1.height,75,75);
                        var s1 = {
                            width:wh1[0],
                            height:wh1[1],
                            fileHttpUrl:$scope.order.remarkUrl1
                        };
                        $scope.$apply(function () {
                            $scope.imgList.push(s1)
                        })
                    };
                    if($scope.order.remarkUrl2){
                        var img2 = getImgInfo($scope.order.remarkUrl2);
                        img2.onload = function () {
                            var wh2 = proportionPhoto(img2.width,img2.height,75,75);
                            var s2 = {
                                width:wh2[0],
                                height:wh2[1],
                                fileHttpUrl:$scope.order.remarkUrl2
                            };
                            $scope.$apply(function () {
                                $scope.imgList.push(s2)
                            })
                        };
                    }else{
                        $scope.showPhotoFun(!0)
                    }
                }

                /**
                 * 判断审核的状态 -1 审核不通过 1审核通过 0 审核中 2第一次审核（包括审核中）
                 * 已经被人审核过~~在流程中不能修改
                 *
                 * 若是没人审核~~或者不通过~~是可以修改的
                 *
                 * 没有合同 没在审核流程中的都能改
                 *
                 */

                // var _checkEndState = $scope.order.checkEndState; //_checkEndState == 1 审核通过 == 2 处在审核流程中
                // if(_checkEndState == 0){
                //     if ($scope.order.orderCheckInfos.length > 0) {
                //         var _data = void 0;
                //         for (var i = 0, j = $scope.order.orderCheckInfos.length; i < j; i++) {
                //             var info = $scope.order.orderCheckInfos[i];
                //             if (info.state != -1 && info.checkStep != 0) {
                //                 _data = info;
                //                 break;
                //             }
                //         }
                //         if(_data && ((_data.isLastOne == 0 && _data.checkStepState == 0) || (_data.isLastOne == 1 && _data.checkStepState == 0))){
                //             _checkEndState = 2;
                //         }
                //     }
                // }else if(_checkEndState == 1){
                //     _checkEndState = 2//审核通过  不能修改
                //     $scope.$okModifyData = true; //可以修改的数据
                // }
                //
                // $scope._checkEndState = _checkEndState;

                //如果有暂无合同历史数据
                if ($scope.order.historyData) {
                    $scope.order.historyData = JSON.parse($scope.order.historyData);
                }


                !function () {
                    var _check;
                    var _checkEndState = $scope.order.checkEndState;
                    if (_checkEndState == -1) {
                        _check = -1;
                    } else if (_checkEndState == 1) {
                        _check = 1;
                    } else if (_checkEndState == 0) {
                        _check = 0;
                        if ($scope.order.orderCheckInfos.length > 0) {
                            var _data = void 0;
                            //过滤重新发起审批的记录
                            for (var i = 0, j = $scope.order.orderCheckInfos.length; i < j; i++) {
                                if ($scope.order.orderCheckInfos[i].state != -1 && $scope.order.orderCheckInfos[i].checkStep != 0) {
                                    _data = $scope.order.orderCheckInfos[i];
                                    break;
                                }
                            }
                            if ((_data.isLastOne == 0 && _data.checkStepState == 0) || (_data.isLastOne == 1 && _data.checkStepState == 0)) {
                                _check = 2;
                            }
                        }
                    }
                    $scope._checkEndState = $scope.order.orderType == 1 || _check == -1 || _check == 2;

                    $scope._checkEndStateTrue = _check == 1;//审核通过
                    //暂无合同
                    if ($scope.order.contractType == 2) {
                        if ($scope._checkEndStateTrue || $scope._checkEndState) {
                            $scope._contractType = true;
                        } else {
                            $scope._contractType = false;
                        }
                    }
                    //已终止且无合同
                    if ($scope.order.contractType == 2 && $scope.order.showState == 5) {
                        $scope._contractType = true;
                        $scope._checkEndState = false;//不能修改其他数据
                        $scope._showState5 = true; //不能修改档期
                    }
                }();

            }
        });


        /***
         * 订单类型修改
         * @param name
         * @param data
         */
        function selectOrderType(data){
            $scope._cache.localDeliveryMoney = 0;
            $scope._cache.localScheduleMoney = 0;
            if($scope.order.orderType == 3 || $scope.order.orderType == 4){
                delete $scope.order.isPackage;
            }
            destroyOrder();

            $scope.order.contractType = 1;

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
                    $scope.scheduleTypeList = [{id: 0, name: '正常购买'}, {id: 1, name: '免费配送'}, {
                        id: 3,
                        name: '打包'
                    }];
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
            //保留广告位
            saveAdListInfo($scope.adListInfo);

            /**
             * 计算排期金额
             */
            $scope.adListInfo.forEach(function (data) {
                !function (data) {
                    var _scheduleAdMoney = selectCalculate(data.scheduleType, data.price, $scope.order.discount, data.adShowDates, data.showTimeDetail, data.priceCycle);
                    cartTotal(data.scheduleAdMoney, _scheduleAdMoney, data.scheduleType, data.scheduleType);//计算排期总金额
                    data.scheduleAdMoney = _scheduleAdMoney;
                }(data);
            });

            initPicker();
            $scope.selectContractShow = false;
            if ($scope.order.orderType == 3 || $scope.order.orderType == 4) {
                $scope.order.totalMoney = 0;
            }
        }

        // 初始化合同对象
        function setContract(data){
            delete $scope.order.abNormalMsg;
            delete $scope._cache._schedulingHaveMoey;

            if (data.type != $scope.order.isPackage) {
                $scope.order.contractCode = data.contractCode;
                ycui.alert({
                    error:true,
                    content: '绑定合同打包属性与原有订单属性不一致，不能绑定，请重新选择',
                    timeout: 10,
                    okclick: function () {
                        $scope.$apply(function () {
                            delete $scope.order.contractCode;
                        });
                    }
                });
                return;
            }

            var _buyMoney = $scope._cache.order.buyMoney || 0;//订单已购买金额
            var _presentMoney = $scope._cache.order.presentMoney || 0;//订单已配送金额
            var _packageMoney = $scope._cache.order.packageMoney || 0;//订单已打包金额

            var _executedBuyMoney = $scope._cache.order.executedBuyMoney || 0;//订单已执行购买金额
            var _executedPresentMoney = $scope._cache.order.executedPresentMoney || 0;//订单已执行打包金额
            // var _executedPackageMoney = $scope._cache.order.executedPackageMoney || 0;//订单已执行配送金额


            var _contractMoney = data.contractMoney;//合同金额
            var _contractBuyMoneyMax = data.contractBuyMoneyMax || 0;//合同购买最大金额
            var _presentMoneyMax = data.presentMoneyMax || 0;//配送最大金额
            var _schedulingBuyMoney = data.schedulingBuyMoney || 0;//已排期购买金额
            var _schedulingPresentedMoney = data.schedulingPresentedMoney || 0;//已排期配送金额

            if (!$scope._cache.order.contractCode) {
                $scope._cache.order.historyData = JSON.stringify({
                    discount: $scope._cache.order.discount,
                    present: $scope._cache.order.present,
                    futureMoney: $scope._cache.order.futureMoney,
                    isPackage: $scope._cache.order.isPackage,
                    historyScheduleMoney: $scope._cache.order.historyScheduleMoney
                });

                var _contractUseMoney = _contractBuyMoneyMax - (_schedulingBuyMoney + _schedulingPresentedMoney);//合同可用金额

                if(_executedBuyMoney + _executedPresentMoney >= _contractUseMoney){
                    $scope.order.abNormalMsg = '无合同情况下的当前订单产生的执行和配送金额已经超出绑定合同可排期剩余最大金额，系统自动终止订单';
                    var msg = '';
                    if(data.type == 1){
                        msg = '已执行金额与已配送金额相加是大于等于合同剩余可排期最大的金额，请确定是否要绑定该合同';
                    }else{
                        msg = '已执行金额与已配送金额相加是大于等于合同剩余可排期最大的金额，请确定是否要绑定该合同';
                    }
                    ycui.alert({
                        error:true,
                        content: '<p text-left>'+ msg +'</p>',
                        timeout: 10
                    });
                    asd(data);
                }else{
                    if(_buyMoney > _contractUseMoney){
                        ycui.alert({
                            error:true,
                            content: '<p text-left>无合同情况下的当前订单的排期金额大于合同剩余可排期金额，请修改投放档期</p>',
                            timeout: 10
                        });
                        $scope._cache._schedulingHaveError = true;
                        $scope._cache._schedulingHaveMoney =  _contractUseMoney - (($scope._cache.localScheduleMoney || 0) + ($scope._cache.localDeliveryMoney || 0));
                        $scope.$watch('_cache.localScheduleMoney',function (newValue,oldValue) {
                            if(newValue == oldValue) return
                            $scope._cache._schedulingHaveMoney =  _contractUseMoney - (($scope._cache.localScheduleMoney || 0) + ($scope._cache.localDeliveryMoney || 0));
                        })
                        $scope.$watch('_cache.localDeliveryMoney',function (newValue,oldValue) {
                            if(newValue == oldValue) return
                            $scope._cache._schedulingHaveMoney =  _contractUseMoney - (($scope._cache.localScheduleMoney || 0) + ($scope._cache.localDeliveryMoney || 0));
                        })
                    }
                    asd(data);
                }
            }else{
                var validOrderData = OrdersFty.validOrderData({orderId: $scope.order.id});
                validOrderData.success(function (res) {
                    if (res && res.code == 404) {
                        //TODO
                        asd(data);
                    } else {
                        ycui.alert({
                            error:true,
                            timeout:10,
                            content: '订单已产生数据，不能修改合同号'
                        })
                    }
                });
            }
            function asd(data) {
                $scope.order.contractCode = data.contractCode;
                $scope.order.totalMoney = data.contractMoney;
                $scope.order.discount = data.discount * 100;
                $scope.order.present = data.present * 100;
                $scope._cache.contract = data;
                $scope.selectContractShow = true;//显示 合同金额等。。。。
                /**
                 * 正式订单 获取合同 根据是否打包合同 改变广告位类型 ×××××××××××估计不会运行××××××××××
                 */
                if ($scope.order.isPackage != data.type) {
                    $scope.isPackageChange(data.type);
                }
                $scope.order.isPackage = data.type;
            }
        }

        //部门
        $scope.departmentListSel = {}
        $q.all([orderDetail]).then(function () {
            SysUserFty.depAndUserList({companyId: $scope._cache.companyId}).success(function (res) {
                $scope.departmentListSel.list = res.departmentList;
            })
        });

        var upload = function(id){
            var key = "";
            var config = {
                server: fileUrl + "/orderAdCreative/remark.htm",
                pick: '#' + id,
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
                },
                beforeFileQueued:function(uploader,file){
                    ycui.loading.show();
                    uploader.stop(file);
                    UploadKeyFty.uploadKey().success(function (da) {
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
                }
            };
            uploadInit(config);
        };

        //备注图片转换
        $scope.showPhoto = 0;
        $scope.showPhotoInit = false;
        $scope.showPhotoFun = function (bo) {
            $scope.showPhoto = bo;
            if($scope.showPhotoInit){
                return
            }
            upload('showPhotoUpload');
            $scope.showPhotoInit = true;
        };

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

        //改变订单类型后保存广告位的档期
        function saveAdListInfo(array) {
            array.forEach(function (data) {
                if (data.scheduleType != undefined) {
                    var _bo = true;
                    //如果排期类型在此类型当中 就不删除
                    $scope.scheduleTypeList.forEach(function (da) {
                        if (da.id == data.scheduleType) {
                            _bo = false;
                        }
                    });
                    _bo && (delete data.scheduleType);
                }
                if ($scope.scheduleTypeList.length == 1) {
                    data.scheduleType = $scope.scheduleTypeList[0].id
                }
                delete data.scheduleAdMoney;
            });
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
            //保留可用数据
            saveAdListInfo($scope.adListInfo);
            
            $scope._cache.localScheduleMoney = 0;
            $scope._cache.localDeliveryMoney = 0;
            /**
             * 计算排期金额
             */
            $scope.adListInfo.forEach(function (data) {
                !function (data) {
                    var _scheduleAdMoney = selectCalculate(data.scheduleType, data.price, $scope.order.discount, data.adShowDates, data.showTimeDetail, data.priceCycle);
                    cartTotal(data.scheduleAdMoney, _scheduleAdMoney, data.scheduleType, data.scheduleType);//计算排期总金额
                    data.scheduleAdMoney = _scheduleAdMoney;
                }(data);
            });
            delete $scope.order.packageMoney;//删除打包金额
        };

        /**
         * 计算总购买金额 和 总配送金额
         */
        $scope.$watch('order.futureMoney',function () {
            if($scope.order.futureMoney != undefined && $scope.order.discount != undefined && $scope.order.present != undefined){
                getMoney();
            }
        });
        $scope.$watch('order.discount',function () {
            if($scope.order.futureMoney != undefined && $scope.order.discount != undefined && $scope.order.present != undefined){
                getMoney();
            }
        });
        $scope.$watch('order.present',function () {
            if($scope.order.futureMoney != undefined && $scope.order.discount != undefined && $scope.order.present != undefined){
                getMoney();
            }
        });
        function getMoney() {
            var _contractMoneyMax = $scope.order.futureMoney/($scope.order.discount*0.01);
            var _presentMoneyMax = $scope.order.futureMoney*($scope.order.present*0.01);
            $scope._cache.contract = {
                contractBuyMoney:_contractMoneyMax,
                presentMoney:_presentMoneyMax,
                schedulingBuyMoney:$scope.order.buyMoney,
                presentedMoney:$scope.order.presentMoney,
                scheduleMoney:_contractMoneyMax + _presentMoneyMax
            }
        }

        /**
         * 合同签订情况改变 删除其值
         */
        $scope.contractTypeChange = function () {
            if ($scope.order.contractType == 2) {
                delete $scope.order.contractCode;
                $scope.contractCodeSel.$destroy();
            }
            $scope.selectContractShow = false;
            destroyOrder();
        };

        function destroyOrder() {
            if ($scope.order.contractType == 1) {
                // $scope._cache.order.isPackage = $scope.order.isPackage;
                // delete $scope.order.totalMoney;
                // delete $scope.order.futureMoney;
                // delete $scope.order.historyScheduleMoney;
                // delete $scope.order.discount;
                // delete $scope.order.present;
                delete $scope.order.relatedOrderId;
            }// else{
            //     $scope.order.totalMoney = $scope._cache.order.totalMoney;
            //     $scope.order.futureMoney = $scope._cache.order.futureMoney;
            //     $scope.order.historyScheduleMoney = $scope._cache.order.historyScheduleMoney;
            //     $scope.order.discount = $scope._cache.order.discount;
            //     $scope.order.present = $scope._cache.order.present;
            //     $scope.order.isPackage = $scope._cache.order.isPackage;
            // }
        }

        var initPicker = function () {
            //审核通过的使用双控件选择日期
            if (!$scope._checkEndState) {
                var _startTime = $scope.order.orderShowDate.startTime;
                var endTime = $scope.order.orderShowDate.endTime;
                if (new Date(_startTime).getTime() > new Date(new Date().dateFormat()).getTime()) {
                    pointerTimelyStart($scope.order.orderShowDate);
                }
                pointerTimelyEnd($scope.order.orderShowDate);
                // if (new Date(endTime).getTime() >= new Date(new Date().dateFormat()).getTime()) {
                //
                // }
            } else {
                pointerTimely($scope.order.orderShowDate);
            }
        };
        $q.all([orderDetail]).then(function () {
            initPicker();
        });


        /**
         * 购物车
         * @type {number}
         */
        // 选择广告位
        $scope.$on('orderAddGroup',function(){
            if ($scope.query.companyId != undefined) {
                OrdersFty.getADSpacesForAddOrder($scope.query).success(modView);
            }
        })

        $q.all([orderDetail]).then(function(){
            ResMediaFty.mediaListInCom({companyId:$scope._cache.adInCompanyId}).success(function(res){
                if(res && res.code == 200){
                    $scope.mediaListSel.list = res.mediaList;
                }
            })
        })
        
        $scope.companyListSel = {
            callback:function(e,d){
                if(d){
                    $scope._cache.adInCompanyId = d.id;
                    ResMediaFty.mediaListInCom({companyId:d.id}).success(function(res){
                        if(res && res.code == 200){
                            $scope.mediaListSel.list = res.mediaList;
                        }
                    })
                }
            }
        };
        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.periodicationSel.$destroy();
                if(!d){return};
                ResChannelFty.getChannelsByMedia({ mediaId: d.id }).success(function (response) {
                    $scope.periodicationSel.list = response.channels;
                    $scope.periodicationSel.list.unshift({'channelName':'全部'})
                });
            }
        };
        $scope.periodicationSel = {};
        $scope.sizeListSel = {};
        $scope.typeListSel = {};


        $scope.showAdList = function(){
            if (validDate()) {
                return
            }
            $scope.adListInfoCache = [];
            $scope.redirect = function (num,co) {
                ycui.loading.show();
                $scope.query.pageIndex = num || 1;
                $scope.query.adSpaceNameOrId = $scope.query.search;;
                if ($scope.query.companyId != undefined) {
                    OrdersFty.getADSpacesForAddOrder($scope.query).success(modView);
                }else{
                    ycui.loading.hide();
                }
            };
            if($scope.order.adInCompanyId){
                $scope.query.companyId = $scope.order.adInCompanyId;
                $scope.redirect(1);
            }
            $scope.adSpaceModule = {
                title:'添加广告位',
                okClick:function(){
                    var bo = true;
                    if($scope.order.adInCompanyId && $scope._cache.adInCompanyId && $scope._cache.adInCompanyId != $scope.order.adInCompanyId){
                        bo = false;
                    }
                    if(bo){
                        hideAdList();
                    }else{
                        function _time(){
                            ycui.confirm({
                                content:'两次选择所属不一致，已添加的广告位将会清空！',
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
            // if($scope.order.adInCompanyId && $scope._cache.adInCompanyId && $scope._cache.adInCompanyId != $scope.order.adInCompanyId){
            //     $scope._cache.localDeliveryMoney = 0;
            //     $scope._cache.localScheduleMoney = 0;
            //     $scope.adListInfo.length = 0;
            // }
            $scope.adListInfoCache.forEach(function (data) {
                var id = data.id;
                var scheduleType = data.scheduleType;
                var _adListInfo = 0;
                var _list = $scope.scheduleTypeList.length;
                $scope.adListInfo.forEach(function(da){
                    var _id = da.adSpaceId || da.id;
                    if(id == _id){
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

        var dLInOrder = ScheduleFty.dLInOrder().success(function (res) {
            if(res && res.code == 200){
                $scope.companyListSel.list = res.companyList;
                $scope.mediaListSel.list = res.mediaList;
                $scope.periodicationSel.list = res.periodicationList;
                $scope.sizeListSel.list = res.sizeList;
                $scope.typeListSel.list = res.typeList;
            }
        });

        /**
         * 购物车开始 删除订单内的广告位 删除的广告位存储
         */
        $scope._cache.deleteAdSpaceId = [];
        $scope.deleteInfo = function (index, name, id,type) {
            if (id) {
                OrdersFty.validData({
                    orderId: $scope.order.id,
                    adSpaceId: id,
                    scheduleType:type
                }).success(function (res) {
                    if (res && res.code == 404) {
                        _validData();
                    } else if (res && res.code == 200) {
                        ycui.alert({
                            error:true,
                            content: '此广告位已产生数据，不能删除',
                            timeout:10
                        })
                    }
                })
            } else {
                _validData();
            }
            function _validData() {
                ycui.confirm({
                    title: "操作确认",
                    content: "请确认，您将删除广告位：" + "<br>" + name,
                    timeout: -1,
                    okclick: function () {
                        $scope.$apply(function () {
                            var _d = $scope.adListInfo[index];
                            cartRemove(_d.scheduleAdMoney, _d.scheduleType);
                            if (_d.adSpaceId) {
                                $scope._cache.deleteAdSpaceId.push({
                                    adSpaceId:_d.adSpaceId,
                                    scheduleType:_d.scheduleType
                                })
                            }
                            $scope.adListInfo.splice(index, 1)
                        });
                    }
                });
            }
        };

        $scope.deleteInfoByIndex = function (index) {
            $scope.adListInfoCache.splice(index, 1)
        };

        //点击添加到右边
        $scope.adListInfoCache = [];
        $scope.putRightInfo = function (itemInfo) {
            for (var i = 0; i < $scope.adListInfoCache.length; i++) {
                if (itemInfo.id == $scope.adListInfoCache[i].id) {
                    return
                }
            }
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
                    if (!data.scheduleAdMoneyShow) {
                        data.adShowDates[0].startTime = newValue.startTime;
                        data.adShowDates[0].endTime = newValue.endTime;
                        data.adShowDates[0].pickerDateRange = Math.uuid();

                        switch (data.priceCycle) {
                            case 1:
                                pointerTimely(data.adShowDates[0], true, data);
                                break;
                            case 2:
                                pointerTimely(data.adShowDates[0], true, data);
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
         * @param index 广告位下标
         */
        function addListInfo(itemInfo) {
            if (!itemInfo.adShowDates) {
                itemInfo.adShowDates = [];
                itemInfo.adShowDates[0] = angular.copy($scope.order.orderShowDate);
                itemInfo.adShowDates[0].pickerDateRange = Math.uuid();

                //默认选择一个排期类型
                if($scope.scheduleTypeList && $scope.scheduleTypeList.length >= 1){
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
                    var times = [];
                    $scope.timeSel1 = {list:times};
                    $scope.timeSel2 = {list:times};
                    if (!itemInfo.showTimeDetail) {
                        itemInfo.showTimeDetail = createArray(24, 1);
                        itemInfo.startTime = 0;
                        itemInfo.endTime = 23;
                    }
                    var i = 0;
                    while (i <= 23) {
                        times.push({
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
         * @param ad 广告位中时间对象
         * @param bo 是否触发计算排期金额
         * @param obj 广告位对象 Edit
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

        function pointerTimelyStart(ad, bo, obj) {
            setTimeout(function () {
                !function (da, ob, obj) {
                    var _minValidDate = $scope.order.orderShowDate.startTime;
                    var _maxValidDate = $scope.order.orderShowDate.endTime;
                    /**
                     * 投放档期 没有时间范围的限制
                     */
                    if (da.pickerStart == 'pickerRangeStart') {
                        _minValidDate = '1970-01-01';
                        _maxValidDate = '';
                    }
                    var _options = {
                        isSingleDay: true,
                        stopToday: false,
                        stopTodayBefore: true,
                        startDate: da.startTime,
                        endDate: da.startTime,
                        minValidDate: _minValidDate || '1970-01-01',
                        maxValidDate: _maxValidDate || '',
                        calendars: 1,
                        calendarsChoose: 1,
                        shortOpr: true,
                        shortbtn: 0
                    };
                    _options.success = function (data) {
                        $scope.$apply(function () {
                            da.startTime = data.startDate;
                        });
                        if (ob && da.endTime) {
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

                    new pickerDateRange(da.pickerStart || da, _options);
                    if (ob && da.endTime) {
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

        function pointerTimelyEnd(ad, bo, obj) {
            setTimeout(function () {
                !function (da, ob, obj) {
                    var _minValidDate = $scope.order.orderShowDate.startTime;
                    var _maxValidDate = $scope.order.orderShowDate.endTime;
                    /**
                     * 投放档期 没有时间范围的限制
                     */
                    if (da.pickerEnd == 'pickerRangeEnd') {
                        _minValidDate = '1970-01-01';
                        _maxValidDate = '';
                    }
                    var _options = {
                        isSingleDay: true,
                        stopToday: false,
                        stopTodayBefore: true,
                        startDate: da.endTime,
                        endDate: da.endTime,
                        minValidDate: _minValidDate || '1970-01-01',
                        maxValidDate: _maxValidDate || '',
                        calendars: 1,
                        calendarsChoose: 1,
                        shortOpr: true,
                        shortbtn: 0
                    };
                    _options.success = function (data) {
                        $scope.$apply(function () {
                            da.endTime = data.startDate;
                        });
                        if (ob && da.startTime) {
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

                    new pickerDateRange(da.pickerEnd || da, _options);
                    if (ob && da.startTime) {
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
                var $index = $target.getAttribute('data-index');
                var ob = arr[$index];
                var bo1 = $target && $target.nodeName == 'DIV' && $target.getAttribute('data-date') == 'true';
                var bo2 = ob && !ob.hidden1 && !ob.hidden && !ob.display
                if(bo1 && bo2){
                    ob.selected = !ob.selected
                }
            };
            //按星期选择
            quickDate.selectRow = function (index,arr) {
                var _arr = [];
                for(var i = 0,j = arr.length;i<j;i++){
                    if(!arr[i].display && !arr[i].hidden && !arr[i].hidden1 && (i-index)%7 == 0){
                        arr[i].selected = !arr[i].selected;
                        _arr.push(arr[i])
                    }
                }
            };
        }

        /**
         * 更多设置显示 type == 1
         */
        $scope.showScheduleDay = function (name, index) {
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
            $scope.scheduleTemp = angular.copy($scope.adListInfo[index]); //临时对象 完成设置后
            $scope.scheduleTemp._index = index;
            $scope.validTimeValue = '';

            // 快捷日期选择
            var quickDate = $scope.scheduleTemp.quickDate = {};
            quickDateFun(quickDate);

            function initQuick(array){
                var startTime = $scope.order.orderShowDate.startTime;
                var endTime = $scope.order.orderShowDate.endTime;
                var config = {beforeTimeDiff:$scope._checkEndStateTrue};//如果审核通过 就不能修改以前的时间
                quickDate.$list = getDateRange(startTime,endTime,array,config);
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

            var _d = $scope.scheduleTemp.adShowDates = arrayFilter($scope.scheduleTemp.adShowDates);
            var selectWeeks = $scope.scheduleTemp.selectWeeks;
            initQuickWeek(selectWeeks);
            initQuick(_d);
            // _d.forEach(function (da) {
            //     da.pickerDateRange = Math.uuid();
            //     pointerTimely(da);
            // })

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

            /**
             * 保存后 回显数据
             */
            if (!$scope._checkEndState) {
                _d.forEach(function (da) {
                    delete da.pickerDateRange;
                    var _startTime = da.startTime;
                    var endTime = da.endTime;

                    if (new Date(_startTime).getTime() > new Date(new Date().dateFormat()).getTime()) {
                        da.pickerStart = Math.uuid();
                        pointerTimelyStart(da);
                    }
                    if (new Date(endTime).getTime() >= new Date(new Date().dateFormat()).getTime()) {
                        da.pickerEnd = Math.uuid();
                        pointerTimelyEnd(da);
                    }
                })
            } else {
                _d.forEach(function (da) {
                    da.pickerDateRange = Math.uuid();
                    pointerTimely(da);
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
            
            $scope.scheduleTemp = angular.copy($scope.adListInfo[index]); //临时对象 完成设置后
            $scope.scheduleTemp._index = index;
            $scope.validTimeValue = '';

            // 快捷日期选择
            var quickDate = $scope.scheduleTemp.quickDate = {};
            quickDateFun(quickDate);

            function initQuick(array){
                var startTime = $scope.order.orderShowDate.startTime;
                var endTime = $scope.order.orderShowDate.endTime;
                var config = {beforeTimeDiff:$scope._checkEndStateTrue};//如果审核通过 就不能修改以前的时间
                quickDate.$list = getDateRange(startTime,endTime,array,config);
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
            // _d.forEach(function (da) {
            //     da.pickerDateRange = Math.uuid();
            //     pointerTimely(da);
            // })

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

            // var selectWeeks = $scope.scheduleTemp.selectWeeks;
            // initQuickWeek(selectWeeks);
            // var _d = $scope.scheduleTemp.adShowDates = arrayFilter($scope.scheduleTemp.adShowDates);
            // initQuick(_d);

            /**
             * 保存后 回显数据
             */



            if (!$scope._checkEndState) {
                _d.forEach(function (da) {
                    delete da.pickerDateRange;
                    var _startTime = da.startTime;
                    var endTime = da.endTime;

                    if (new Date(_startTime).getTime() > new Date(new Date().dateFormat()).getTime()) {
                        da.pickerStart = Math.uuid();
                        pointerTimelyStart(da);
                    }
                    if (new Date(endTime).getTime() >= new Date(new Date().dateFormat()).getTime()) {
                        da.pickerEnd = Math.uuid();
                        pointerTimelyEnd(da);
                    }
                })
            } else {
                _d.forEach(function (da) {
                    da.pickerDateRange = Math.uuid();
                    pointerTimely(da);
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
         */
        function hideSchedule(data) {
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
            var _timeDetail = data.showTimeDetail;//小时

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
            var _present = $scope.order.present;//合同配送比例

            //全时间段
            if (data.showTimeBox == 0) {
                data.showTimeDetail = createArray(24, 1);
            }
            var _countPrice = selectCalculate(_scheduleType, _price, _discount, _adShowDates, _timeDetail, _priceCycle);

            cartTotal($scope.adListInfo[data._index].scheduleAdMoney, _countPrice, _scheduleType, _scheduleType);//计算排期总金额

            _s.adShowDates = data.adShowDates;
            _s.scheduleValue = [];

            if (_priceCycle == 1 || _priceCycle == 2) {
                data.adShowDates.forEach(function (data) {
                    var _t = "";
                    _t += new Date(data.startTime).dateFormat('yyyyMMdd') + '-' + new Date(data.endTime).dateFormat('yyyyMMdd');
                    _s.scheduleValue.push(_t);
                })
                _s._scheduleValue = getFrontElement(_s.scheduleValue, 2);
            } else if (_priceCycle == 3) {
                _s.showTimeDetail = data.showTimeDetail;
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
                });
                _s._scheduleValue = getFrontElement(_s.scheduleValue, 3);
            }

            _s.scheduleAdMoney = _countPrice;//暂存 排期总金额
            _s.scheduleAdMoneyShow = true;
            _s.dateType = data.dateType;//档期选择
            _s.weekOrDate = data.weekOrDate;//设置日期
            _s.adShowDates = _adShowDates;
        };

        /**
         * 总计算 排期金额 配送金额
         * @param a 旧排期金额
         * @param b 新排期金额
         * @param oldType 旧排期类型
         * @param newType 新排期类型 Edit
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
         * @param typeId
         * @param index
         */
        $scope.scheduleTypeChange = function (data, typeId) {
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
         * @returns {number} 0 成功 1时间组超过限定时间范围 2时间组之间有重合
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
         * 太乱了。。。。。。
         * 计算方式 根据scheduleType 类型的不同 来计算排期金额
         * @param type 排期类型 如果不计算 type传值0和1之外的值
         * @param price 单价
         * @param discount 折扣
         * @param time 天月时间 type Array
         * @param timeDetail 小时 type Array
         * @param timeType 时间类型
         * @param orderType 订单类型
         * @returns {number} 排期金额 edit
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
                        /*time.forEach(function (data) {
                         var _s = data.startTime;
                         var _e = data.endTime;
                         _day += +Date.differMonth(_s,_e)+1;
                         });
                         return _day*price*discount;*/
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
                        /*time.forEach(function (data) {
                         var _s = data.startTime;
                         var _e = data.endTime;
                         _day += +Date.differMonth(_s,_e)+1;
                         });
                         return _day*price;*/
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
                d && OrdersFty.ordersList($scope.query2).success(modView2);
            }
        };
        CustomerFty.getAllCustomer({customerState: 1}).success(function (response) {
            if (response.code == 200) {
                $scope.customerNameSel.list = response.items
            }
        });

        $scope.showOrderCarList = function (name) {
            $scope.query2 = {pageSize: 5,orderType:2};
            /**
             * 关联订单
             */
            OrdersFty.ordersList($scope.query2).success(modView2);
            $scope.redirect2 = function (num,da) {
                ycui.loading.show()
                $scope.query2.pageIndex = num || 1;
                $scope.query2.ordersNameOrID = $scope.query2.search;;
                OrdersFty.ordersList($scope.query2).success(modView2);
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
        /**
         * 选择关联订单
         * @param name
         * @param id
         */
        $scope.hideOrderAdList = function (name, id) {
            delete $scope.order.futureMoney;
            delete $scope.order.discount;
            delete $scope.order.present;
            OrdersFty.orderDetail({id: id}).success(function (res) {
                if (res && res.code == 200) {
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

                    if (_order.contractCode) {
                        ContractFty.getContractsByCode({contractCode: _order.contractCode}).success(function (res) {
                            if (res && res.code == 200 && res.items) {
                                $scope.order.contractCode = res.items.contractCode;
                                $scope.order.totalMoney = res.items.contractMoney;
                                $scope.order.discount = +res.items.discount * 100;
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $scope.order.present = +res.items.present * 100;
                                    });
                                }, 200);
                                $scope.order.isPackage = res.items.type;
                            }
                        });
                    } else {
                        $scope.order.discount = _order.discount * 100;
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.order.present = _order.present * 100;
                            });
                        }, 200);
                        $scope.order.isPackage = _order.isPackage;
                    }
                }
            });
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
                    min: 1
                },
                historyScheduleMoney: {
                    required: true,
                    number: true,
                    min: 0
                },
                totalMoney: "required",
                discount: {
                    required: true,
                    number: true,
                    min: 0,
                    max: 100
                },
                present: {
                    required: true,
                    number: true,
                    min: 0
                },
                packageMoney: {
                    required: true,
                    number: true,
                    min: 1
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

        $scope.postEdit = function () {
            $scope.validShow = true;
            //验证
            if ($scope.order.orderType == 1 || $scope.order.orderType == 2 || $scope.order.orderType == 3) {
                if ($scope.order.customerId == undefined) {
                    return;
                }
            }

            if ($scope.order.orderType == 2 && !$scope.order.contractCode && $scope.order.contractType == 1) {
                return
            }

            for (var a = 0, j = $scope.adListInfo.length; a < j; a++) {
                var _data = $scope.adListInfo[a];
                if (validTime($scope.order.orderShowDate, _data.adShowDates) != 0) {
                    ycui.alert({
                        error:true,
                        content: '广告位排期超过订单总档期，请重新选择'
                    });
                    return;
                }
            }

            if (!$('.form').valid()) {
                return;
            }

            //获取id 和 name；
            var _getArea = $scope.getAreaids(true, true);
            var _languageList = [];
            $scope.languageList.forEach(function (data) {
                if (data.value && data.value != 0) {
                    _languageList.push(data.value)
                }
            });

            var body = angular.copy($scope.order);

            //需要制空
            body.remarkUrl1 = '';
            body.remarkUrl2 = '';
            if($scope.showPhoto && $scope.imgList && $scope.imgList.length > 0){
                $scope.imgList.forEach(function (da,i) {
                    body['remarkUrl'+ '' + ++i] = da.fileHttpUrl;
                })
            }

            body.historyData = $scope._cache.order.historyData;

            if (body.orderType == 1 || body.orderType == 3 || body.orderType == 4) {
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
            } else {
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
            } else {
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

                if (data.priceCycle == 3 && data.scheduleType == 3) {
                    data.showTimeDetail = createArray(24, 1);
                }

                var _q = {
                    adSpaceId: data.adSpaceId || data.id,
                    price: data.price,
                    priceCycle: data.priceCycle,
                    scheduleType: +data.scheduleType,
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
                    adSpaceId: data.adSpaceId || data.id,
                    priceCycle: data.priceCycle,
                    adShowDates: _adShowDates,
                    showTimeDetail:data.showTimeDetail.join(''),
                    scheduleType:data.scheduleType
                })
            });


            body.orderShowDate = {
                startTime: body.orderShowDate.startTime,
                endTime: body.orderShowDate.endTime
            }

            body.orderADSpaces = _adListInfo;

            if (!body.orderADSpaces || body.orderADSpaces.length == 0) {
                ycui.alert({
                    error:true,
                    content: '请选择广告位',
                    timeout: -1
                });
                return void 0;
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

            for (var i = 0; i < body.orderADSpaces.length; i++) {
                var data = body.orderADSpaces[i];
                if (data.scheduleType == undefined) {
                    ycui.alert({
                        error:true,
                        content: '请选择广告位的排期类型',
                        timeout: -1
                    });
                    return void 0;
                }
            }

            if ($scope.order.orderType == 2) {
                if ($scope.order.isPackage == 2) {
                    if ($scope.order.contractCode) {
                        if ($scope.order.totalMoney - ($scope._cache.contract.schedulingBuyMoney - $scope.order.packageMoney) < $scope.order.packageMoney) {
                            ycui.alert({
                                error:true,
                                content: '订单打包金额超过合同可购买金额'
                            });
                            return void 0;
                        }
                    } else {
                        if ($scope.order.futureMoney < +$scope.order.packageMoney) {
                            ycui.alert({
                                error:true,
                                content: '订单打包金额超过合同可购买金额'
                            });
                            return void 0;
                        }
                    }
                }
            }

            ycui.loading.show();
            var query = {};
            query.orderADSpaces = _adJudgeListInfo;
            query.id = body.id;
            if (body.directionCitys) {
                body.directionCitys && (query.directionCitys = body.directionCitys);
                body.directionArea && (query.directionArea = body.directionArea);
            }

            var judgeADShowDateUsable = OrdersFty.judgeADShowDateUsable(query);
            var contractTolerantCurrent = SysContractTolerantFty.contractTolerantCurrent();

            /**
             * 显示问题 数据库存储真实数据
             */
            if (body.orderType == 2) {
                body.discount = body.discount * 0.01;
                body.present = body.present * 0.01;
            }
            //删除的广告位Id结合
            body.delADs = angular.copy($scope._cache.deleteAdSpaceId);

            $q.all([judgeADShowDateUsable, contractTolerantCurrent]).then(function (res) {
                ycui.loading.hide();
                //不能超过合同最大排期总金额
                if ($scope.order.orderType == 2 && $scope.order.isPackage == 1) {
                    var _s = 0;//容错金额
                    switch (res[1].data.tolerantRule) {
                        case 1:
                            if ($scope.order.futureMoney * res[1].data.tolerant > res[1].data.tolerantMoney) {
                                _s = res[1].data.tolerantMoney
                            } else {
                                _s = $scope.order.futureMoney * res[1].data.tolerant
                            }
                            break;
                        case 2:
                            if ($scope.order.futureMoney * res[1].data.tolerant > res[1].data.tolerantMoney) {
                                _s = $scope.order.futureMoney * res[1].data.tolerant
                            } else {
                                _s = res[1].data.tolerantMoney
                            }
                            break;
                    }
                    var _contractMoney = $scope.order.futureMoney / ($scope.order.discount * 0.01);
                    var _contractMoneyMax = _contractMoney + _s;
                    var _presentMoney = $scope.order.futureMoney * ($scope.order.present * 0.01);
                    var _presentMoneyMax = _presentMoney + _s;
                    var _schedulingMoneyMax = _contractMoney + _presentMoney + _s;

                    if ($scope.order.contractCode) {
                        _contractMoneyMax = $scope._cache.contract.contractBuyMoneyMax;
                        _presentMoneyMax = $scope._cache.contract.presentMoneyMax;
                        _schedulingMoneyMax = $scope._cache.contract.scheduleMoneyMax;
                    }

                    if ($scope._cache.localScheduleMoney + ($scope._cache.contract.schedulingBuyMoney || 0) - $scope.order.buyMoney > _contractMoneyMax) {
                        ycui.alert({
                            error:true,
                            content: '排期购买金额大于剩余合同总购买金额',
                            timeout: 10
                        });
                        return void 0;
                    }
                    if ($scope._cache.localDeliveryMoney + ($scope._cache.contract.schedulingPresentedMoney || 0) - $scope.order.presentMoney > _presentMoneyMax) {
                        ycui.alert({
                            error:true,
                            content: '排期配送金额大于剩余合同总配送金额',
                            timeout: 10
                        });
                        return void 0;
                    }

                    if ($scope._cache.localDeliveryMoney + $scope._cache.localScheduleMoney + ($scope._cache.contract.schedulingBuyMoney || 0) + ($scope._cache.contract.schedulingPresentedMoney || 0) - $scope.order.buyMoney - $scope.order.presentMoney > _schedulingMoneyMax) {
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
                        error:true,
                        content: "<div style='max-height:350px;max-width:600px;overflow-y: auto;'><p style='text-align: left;line-height: 25px'>" + res[0].data.msg.join("<br>") + "</p></div>",
                        timeout: -1
                    })
                } else {
                    if(body.abNormalMsg){
                        ycui.confirm({
                            error:true,
                            content: '<p text-left>由于当前订单产生的已执行金额已经超出合同剩余可排期最大金额，系统将自动作废该订单，请确定是否绑定该合同</p> ',
                            timeout: -1,
                            okclick: function () {
                                orderEditFn();
                            }
                        });
                    }else if($scope._cache._schedulingHaveMoney < 0){
                        ycui.confirm({
                            error:true,
                            content: '<p text-left>当前订单的排期金额依然大于剩余可排期的金额，请再次确定是否已经完成档期修改，若绑定合同系统会作废订单，该订单将不能继续投放，请确定是否绑定</p>',
                            timeout: -1,
                            okclick: function () {
                                orderEditFn();
                            }
                        });
                    }
                    else{
                        orderEditFn();
                    }
                    function orderEditFn() {
                        ycui.loading.show();
                        OrdersFty.orderUpdate(body).success(function (res) {
                            ycui.loading.hide();
                            if (res.code == 200) {
                                ycui.alert({
                                    content: res.msg,
                                    okclick: function () {
                                        goRoute('ViewPutOrder');
                                    },
                                    timeout: 10
                                });
                            } else if (res.code == 405) {
                                ycui.alert({
                                    error:true,
                                    content: res.wrongItems.join(','),
                                    timeout: 10
                                })
                            }
                        })
                    }
                }
            });
        }

    }])
