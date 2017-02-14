/**
 * Created by moka on 16-6-21.
 */
app.controller('listManageCtrl', ["$scope", "$http", "$q", "ScheduleFty", "DictionaryFty", 'ResChannelFty','SysCompanyFty','SysDepartmentFty',
    function ($scope, $http, $q, ScheduleFty, DictionaryFty, ResChannelFty,SysCompanyFty,SysDepartmentFty) {
        $scope.query = {};
        $scope.departmentListSel = {
            callback:function(e,d){
                if(d){
                    $scope.query.depScope = d.agencyNumber;
                }else{
                    $scope.query.depScope = $scope.companyListSel.$placeholder.agencyNumber;//从暂存数据取出
                }
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                ScheduleFty.scheduleList($scope.query).then(modView)
            }
        };
        $scope.companyListSel = {
            callback:function(e,d){
                $scope.departmentListSel.$destroy();
                if(d && d.id == 3){
                    SysDepartmentFty.parentDeps({ companyId: d.id }).then(function (res) {
                        if(res && res.code == 200){
                            $scope.departmentListSel.list = res.departmentList;
                        }
                    });
                }
            },
            sessionBack:function(d){
                if(d && d.id == 3){
                    SysDepartmentFty.parentDeps({ companyId: d.id }).then(function (res) {
                        if(res && res.code == 200){
                            $scope.departmentListSel.list = res.departmentList;
                        }
                    });
                }
            }
        };

        SysCompanyFty.companyList().then(function(res){
            if(res instanceof Array){
                $scope.companyListSel.list = res;
            }
        })

        $scope.languageSel = {};
        $scope.mediaNameSel = {
            callback:function(e,data){
                $scope.channelsSel.$destroy();
                if(!data){return};
                ResChannelFty.getChannelsByMedia({ mediaId: data.id }).then(function (response) {
                    $scope.channelsSel.list = response.channels;
                    $scope.channelsSel.list.unshift({'channelName':'全部'})
                });
            },
            sessionBack:function(d){
                if(d){
                    var key = this.key.split(',')[0];
                    ResChannelFty.getChannelsByMedia({ mediaId: d[key] }).then(function (response) {
                        $scope.channelsSel.list = response.channels;
                    });
                }
            }
        }
        $scope.channelsSel = {}
        $scope.sizeListSel = {}

        var pageSize = 8;
        $scope.query.pageSize = pageSize;

        var scheduleDownList = ScheduleFty.scheduleDownList().then(function (response) {
            if (response && response.code == 200) {
                $scope.languageSel.list = response.languageList;
                $scope.mediaNameSel.list = response.mediaList;
                $scope.sizeListSel.list = response.sizeList;
            }
        })

        $http.get(baseUrl + "/static/data/provinceList.json").then(function (data) {
            $scope.provinceList = data;
        });


        ycui.loading.show()
        $scope.nowDate = new Date().dateFormat('yyyy-MM');
        var modView = function (response) {
            ycui.loading.hide();
            if(!(response && response.code == 200))return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
            var dates = [];
            response.items.forEach(function (data) {
                dates.push({ details: data.details, id: data.id, priceCycle: data.priceCycle, name: data.adSpaceName })
            })
            $scope.dates = dates;

            var listManageSession = window.sessionStorage.getItem("listManageSession");
            if (listManageSession) {
                listManageSession = JSON.parse(listManageSession);
                $scope.nowDate = listManageSession.nowDate;
            }
            showDateAndWeek();
        };

        $q.all([scheduleDownList]).then(function(){
            ScheduleFty.scheduleList($scope.query).then(modView);
        })

        $scope.$on('schedulingGroup',function(){
            $scope.query.pageIndex = 1;
            ycui.loading.show();
            ScheduleFty.scheduleList($scope.query).then(modView)
        })

        /**
         * 展现日期和星期
         */
        var showDateAndWeek = function () {
            var _dateList = [];
            ycui.loading.show();
            var _date = $scope.nowDate;
            if (window.sessionStorage.getItem("listManageSession")) {
                _date = JSON.parse(window.sessionStorage.getItem("listManageSession")).nowDate
            }
            ScheduleFty.getHolidaySet({ currentYearMonth: _date }).then(function (res) {
                if (res && res.code == 200) {
                    if (res.items) {
                        res.items.forEach(function (data, index) {
                            _dateList.push({
                                date: index + 1,
                                holiday: data
                            })
                        });
                    } else {
                        var d = stringToDate($scope.nowDate + "-01").getLastDate().getDate();
                        for(var i = 1; i<=d; i++){
                            var date = stringToDate($scope.nowDate + '-' + i);
                            var isHoliday = 0;
                            if(date.getDay() == 6 || date.getDay() == 0){
                                isHoliday = 1
                            }
                            _dateList.push({
                                date:i,
                                day:date.getDay(),
                                holiday:{day:i,isHoliday:isHoliday}
                            })
                        }
                        // _dateList = getDateArray($scope.nowDate + "-01");
                    }
                    $scope.dateList = _dateList;
                    $scope.weekList = getWeekArray($scope.nowDate + "-01");
                    showScheduleList();
                    ycui.loading.hide();
                }
            });
        };

        /**
         * 展现排期信息
         */
        var showScheduleList = function () {
            var dateArray = [];
            $scope.dates.forEach(function (vaDate, index) {
                $scope.dateList.forEach(function (da) {
                    var time = stringToDate($scope.nowDate + "-" + (da.date || da));
                    var num = 0;
                    var area = 0;
                    var isBookOrder = false;
                    vaDate.details.forEach(function (vaTime) {
                        var _areaBo = vaTime.directionArea && vaTime.directionArea.length > 0;
                        var startDate = vaTime.startDate;
                        var endDate = vaTime.endDate;
                        var orderType = vaTime.orderType;
                        if (startDate <= time.getTime() && time.getTime() <= endDate) {
                            ++num;
                            // if(vaDate.priceCycle == 3 || _areaBo){//地域定向 按小时投放
                            //     ++area
                            // }
                            if(_areaBo){//地域定向
                                ++area
                            }
                            if(orderType == 1){
                                isBookOrder = true;
                            }
                        }
                    });
                    dateArray.push({ num: num, id: vaDate.id, name: vaDate.name, date: da.date || da, area: area,isBookOrder:isBookOrder });
                })
            });
            $scope.dateArray = array1Change2(dateArray, $scope.dateList.length);
        };

        /**
         * 下个月
         * @param nowDate
         */
        $scope.nextMonth = function (nowDate) {
            $scope.nowDate = stringToDate(nowDate + "-1").calendar(2, 1).dateFormat('yyyy-MM');
            window.sessionStorage.setItem("listManageSession", JSON.stringify({ nowDate: $scope.nowDate }));
            showDateAndWeek();
        };
        /**
         * 上个月
         * @param nowDate
         */
        $scope.prevMonth = function (nowDate) {
            $scope.nowDate = stringToDate(nowDate + "-1").calendar(2, -1).dateFormat('yyyy-MM');
            window.sessionStorage.setItem("listManageSession", JSON.stringify({ nowDate: $scope.nowDate }));
            showDateAndWeek();
        };
        

        /*点击添加到订单*/
        $scope.adList = [];
        $scope.addList = function (data) {
            for (var i = 0; i < $scope.adList.length; i++) {
                if (data.id == $scope.adList[i].id) {
                    return
                }
            }
            $scope.adListAllCheck = false;
            data.check = true;
            data.$check = true;
            $scope.adList.push(angular.copy(data));
        };

        /*清空已有的广告位订单*/
        $scope.moveAll = function () {
            $scope.adList.length = 0
        };

        /*删除已有的广告位*/
        $scope.deleteList = function (index) {
            $scope.adList.splice(index, 1);
        };

        /*删除的时候判断class*/
        $scope.getclass = function (id) {
            for (var i = 0; i < $scope.adList.length; i++) {
                if (id == $scope.adList[i].id) {
                    return true
                }
            }
        };

        //获取选择订单数量
        $scope.getAllCarNum = function () {
            var _num = 0;
            for (var i = 0; i < $scope.adList.length; i++) {
                if ($scope.adList[i].check) {
                    _num++;
                }
            }
            return _num;
        }

        //全选选择订单
        $scope.selectAllCar = function(e){
            var bo = e.target.checked;
            for (var i = 0; i < $scope.adList.length; i++) {
                $scope.adList[i].$check = bo;
            }
        }


        //搜索框
        $scope.redirect = function (num,con) {
            ycui.loading.show();
            $scope.query.adSpaceNameOrId = $scope.query.search;
            $scope.query.pageIndex = num || 1;
            ScheduleFty.scheduleList($scope.query).then(modView)
        };

        //点击创建订单
        $scope.getListInfo = function () {
            var idArr = [];
            var companyId = [];
            $scope.adList.forEach(function (data) {
                if (data.check) {
                    idArr.push(data.id);
                    companyId.push({
                        depScope:data.depScope,
                        companyId:data.companyId
                    })
                }
            });
            if (idArr.length == 0) {
                ycui.alert({
                    error:true,
                    content: "请至少选择一个",
                    timeout:10
                })
            } else {
                var _bo = true;
                companyId.forEach(function (data) {
                    if (companyId[0].companyId != data.companyId || companyId[0].depScope != data.depScope) {
                        _bo = false;
                    }
                });
                if (_bo) {
                    goRoute('ViewPutOrderAdd',{
                        ids:idArr.join(","),
                        companyId:companyId[0].companyId,
                        depScope:companyId[0].depScope
                    });
                } else {
                    ycui.alert({
                        error:true,
                        content: "一个订单只能添加同一范围下的广告位",
                        timeout:10
                    })
                }
            }
        };

        $("#cityFitter").bind('input', function () {
            var value = $(this).val();
            if (!value) {
                $scope.$apply(function () {
                    $scope.provinceListFitter = [];
                });
                return;
            }
            var array = cityFitter($scope.provinceList, value);
            if (array.length > 0) {
                $(this).next().show();
            } else {
                $(this).next().hide();
            }
            $scope.$apply(function () {
                $scope.provinceListFitter = array;
            })
        }).bind('blur', function () {
            setTimeout(function () {
                this.next().hide();
            }.bind($(this)), 250);
        }).bind('keyup', function (event) {
            var key = event.keyCode ? event.keyCode : event.which;
            if (key == 8) {
                if ($scope.provinceListFitter && $scope.provinceListFitter.length == 0) {
                    $(this).next().hide();
                }
            }
        });

        /**
         * 搜索框地域过滤
         * @param array
         * @param name
         * @returns {Array}
         */
        function cityFitter(array, name) {
            var a = [];
            var attr = [{ "id": 1, "provinceName": "北京市", "city": [{ "cityName": "北京市", "id": 1 }] },
                { "id": 9, "provinceName": "上海市", "city": [{ "cityName": "上海市", "id": 9 }] },
                { "id": 2, "provinceName": "天津市", "city": [{ "cityName": "天津市", "id": 2 }] },
                { "id": 22, "provinceName": "重庆市", "city": [{ "cityName": "重庆市", "id": 22 }] }];
            array.forEach(function (data) {
                attr = attr.concat(data);
            });
            attr.forEach(function (data) {
                if (data.provinceName.indexOf(name) != -1) {
                    var d = {};
                    angular.copy(data, d);
                    delete d.city;
                    a = a.concat([d]);
                }
                data.city.forEach(function (da) {
                    if (da.cityName.indexOf(name) != -1 && da.id != data.id) {
                        a = a.concat([da])
                    }
                });
            });
            return a
        }

        /**
         * 地域位置定位
         * @param $event
         */
        $scope.anchorLocation = function ($event) {
            if ($event.target.nodeName == 'A') {
                var href = angular.element($event.target).attr('data-href');
                $(".centralBox").animate({ scrollTop: $(href)[0].offsetTop - 76 }, 400);
            }
        };

        /**
         * 地域选择
         * @param $event
         */
        $scope.checkCity = function ($event) {
            if ($event.target.nodeName == 'SPAN') {
                var data = angular.element($event.target).attr('data');
                data = JSON.parse(data);
                for (var i in data) {
                    $scope.childId = data['id'];
                    if (i == 'provinceName') {
                        // $scope.areaId = data['id'];
                        $scope.provincesName = data['provinceName'];
                        // delete  $scope.childId;
                    } else if (i == 'cityName') {
                        $scope.provincesName = data['cityName'];
                        // delete  $scope.areaId;
                    }
                }
                $scope.areaClose();
            }
        };

        /**
         * 控件 关闭所做的事情
         * @param num
         */
        $scope.areaClose = function (num) {
            if (!num) {
                $scope.query.pageIndex = 1;
                $scope.query.childId = $scope.childId;
                ScheduleFty.scheduleList($scope.query).then(modView);
            }
            $scope.provinceListFitter = [];
            var cityFitter = document.querySelector('#cityFitter');
            cityFitter && (cityFitter.value = '')
            $scope.areaHide();
        }
        /**
         * 控件显示
         * @param event
         */
        $scope.areaShow = function (event) {
            $("body").append("<div class='dialog-bg animated fadeIn' data-value='#tiling_area'></div>")
            var $createBg = window.top.$createBg;
            $createBg && ($scope.closeFun = $createBg(close));
            function close(){
                $scope.areaHide();
            }
            $("div[data-value='#tiling_area']").bind("click", function () {
                $scope.areaHide();
            });
            // var $a = event.target;
            // var width = $a.clientWidth;
            // var height = $a.clientHeight;
            // var left = $a.offsetLeft/2;
            // var top = $a.offsetTop;
            $("#tiling_area").css({ "top": '117px', "left": '385px' }).slideDown(150);
        };
        /*地域控件结束*/

        $scope.areaHide = function () {
            $("#tiling_area").slideUp(150);
            var area = $("div[data-value='#tiling_area']");
            area.removeClass('fadeIn');
            area.addClass('fadeOut');
            setTimeout(function(){
                area.remove();
            },150)
            $scope.closeFun();
        }

        /**
         * 日期控件显示
         * @param event
         */
        $scope.dateControlShow = function (event) {
            $("body").append("<div class='dialog-bg animated fadeIn' data-value='#date_control'></div>");
            $scope._nowDate = $scope.nowDate && $scope.nowDate.split('-')[0];
            $scope.dateControl = createYearM();

            var $createBg = window.top.$createBg;
            var closeFun;
            $createBg && (closeFun = $createBg(close));
            function close(){
                $("#date_control").slideUp(150)
                var $date_control = $("div[data-value='#date_control']")[0]
                $date_control.classList.remove('fadeIn');
                $date_control.classList.add('fadeOut');
                setTimeout(function(){
                    $($date_control).remove();
                },150)
            }

            $("#date_control").css({ "top": '169px', "left": "88px" }).slideDown(150);
            $("div[data-value='#date_control']").bind("click", function () {
                $("#date_control").slideUp(150)
                var $date_control = $("div[data-value='#date_control']")[0]
                $date_control.classList.remove('fadeIn');
                $date_control.classList.add('fadeOut');
                setTimeout(function(){
                    $($date_control).remove();
                },150);
                closeFun()
            });
        };

        function createYearM(year) {
            var year = year || (new Date($scope.nowDate)).getFullYear();
            var array = [];
            for (var i = 1; i <= 12; i++) {
                array.push({
                    date: i + '月',
                    _date: i,
                    type: 'yearM',
                    year: year
                });
            }
            return array;
        }
        function createYear(year) {
            var year = year || (new Date($scope.nowDate)).getFullYear();
            var array = [];
            for (var i = -5; i <= 6; i++) {
                array.push({
                    type: 'year',
                    date: +year + i
                });
            }
            return array;
        }

        $scope.dateSwitch = function (da) {
            switch (da.type) {
                case 'year':
                    $scope.dateControl = createYearM(da.date);
                    $scope._nowDate = da.date;
                    break;
                case 'yearM':
                    $scope.nowDate = $scope._nowDate + '-' + intAddZero(da._date, 2);
                    window.sessionStorage.setItem("listManageSession", JSON.stringify({ nowDate: $scope.nowDate }));
                    showDateAndWeek();
                    $("div[data-value='#date_control']").click();
                    break;
            }
        }

        $scope.dateShowYear = function () {
            $scope.dateControl = createYear();
        }
        //日期控件显示

        //排期导出
        $scope.schedulePush = function () {
            $scope.queryModule = {};
            $scope.queryModule.startDate = new Date().dateFormat('yyyy-MM');
            $scope.queryModule.endDate = new Date().calendar(2, 2).dateFormat('yyyy-MM');
            $scope.schedulePushModule = {
                title: '排期导出',
                okClick: function (e) {
                    var startDate = $scope.queryModule.startDate;
                    var endDate = $scope.queryModule.endDate;

                    if (!startDate || !endDate) {
                        $scope.queryModule.dateMsg = '请填写月份范围';
                        return true;
                    }

                    if (startDate.split('-').length != 2 || !startDate.split('-')[1] || endDate.split('-').length != 2 || !endDate.split('-')[1]) {
                        $scope.queryModule.dateMsg = '请填写规定格式,例如yyyy-MM';
                        return true;
                    }

                    var _start = stringToDate(startDate + '-01');
                    var _end = stringToDate(endDate + '-01');

                    if (!(_start instanceof Date && !isNaN(_start.getFullYear())) || !(_end instanceof Date && !isNaN(_end.getFullYear()))) {
                        $scope.queryModule.dateMsg = '请填写规定格式,例如yyyy-MM';
                        return true;
                    }

                    if (Date.differMonth(_start,_end)> 3) {
                        $scope.queryModule.dateMsg = '月份范围不得超过3个月';
                        return true;
                    }

                    var url = baseUrl + '/schedule/exportSchedule.htm?startDate=' + _start.dateFormat() + '&endDate=' + _end.getLastDate().dateFormat();
                    console.info(url);
                    window.open(url, '_blank')
                },
                noClick: function (e) {}
            }
        }

        /**
         * 获取订单详情
         * @param id
         * @param date
         * @param $event
         * @param num<!--<!--0=待投放|1=投放中|2=已暂停|3=已完结|4=已撤销|5=已终止-->-->
         */
        $scope.scheduleInfo = function($event, id, date, num, name,roleValid){
            if(roleValid != 1){return}
            $scope._scheduleInfoModule = {};
            $event.stopPropagation();
            var time = stringToDate($scope.nowDate + "-" + date).dateFormat('yyyy-MM-dd');
            var query = { adSpaceId: id, startDate: time, endDate: time };

            $scope.query.languageId && (query.languageId = $scope.query.languageId);
            $scope.query.childId && (query.childId = $scope.query.childId);
            ycui.loading.show();
            ScheduleFty.scheduleDetail(query).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    for (var i = 0; i < res.details.length; i++) {
                        var data = res.details[i];
                        data.showTime = new Date(data.startDate).dateFormat('yyyyMMdd') + '-' + new Date(data.endDate).dateFormat('yyyyMMdd')
                        var _priceCycle = data.priceCycle;
                        switch (_priceCycle) {
                            case 3:
                                var _aa = [];
                                var _scheduleValue = [];
                                var _array = data.showTimeDetail.split("");
                                _array && _array.forEach(function (data, index, arr) {
                                    var _t = "";
                                    if (data == 1 && _aa.length == 0) {
                                        _aa.push({
                                            index: index,
                                            date: 1
                                        })
                                    }
                                    if (data == 0 && _aa.length > 0) {
                                        _aa.push({
                                            index: index - 1,
                                            date: 1
                                        });
                                        _t = "";
                                        _t += intAddZero(_aa[0].index) + ':00' + '-' + intAddZero(_aa[1].index) + ':59';
                                        _scheduleValue.push(_t);
                                        _aa.length = 0;
                                    }
                                    if (data == 1 && arr.length - 1 == index) {
                                        _aa.push({
                                            index: index,
                                            date: 1
                                        });
                                        _t = "";
                                        _t += intAddZero(_aa[0].index) + ':00' + '-' + intAddZero(_aa[1].index) + ':59';
                                        _scheduleValue.push(_t);
                                        _aa.length = 0;
                                    }
                                });
                                data.scheduleValue = _scheduleValue;
                                data._scheduleValue = getFrontElement(_scheduleValue,3);
                                break;
                        }
                    }
                    $scope._scheduleInfoModule.list = res.details;
                    $scope.scheduleInfoModule = {
                        title: '【'+ name +'】使用详情'
                    }
                }
            })
        }
    }]);

window.onload = function(){
    $('.adCreate-cart').hover(function(){
        $('.adCreate-table').stop().animate({'height':'250px'})
    },function(){
        $('.adCreate-table').stop().animate({'height':'0px'})
    })
}