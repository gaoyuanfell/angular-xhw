/**
 * Created by moka on 16-9-9.
 */
app.controller('holidayCtrl',['$scope','$http',function ($scope,$http) {
    //列选中
    $scope.selectRow = function (index,arr) {
        var _arr = [];
        for(var i = 0,j = arr.length;i<j;i++){
            if(!arr[i].display && (i-index)%7 == 0){
                arr[i].selected = !arr[i].selected;
                _arr.push(arr[i])
            }
        }
    };

    //选中单个
    $scope.selectOne = function (event,arr) {
        var $target = event.target;
        if($target && $target.nodeName == 'DIV' && $target.getAttribute('data-date') == 'true' && $target.className.indexOf('date-display') == -1){
            var $index = $target.getAttribute('data-index');
            arr[$index].selected = !arr[$index].selected
        }
    };

    //选中所有的双休日
    $scope.selectWeekend = function () {
        $scope.holidayList.forEach(function (obj1) {
            $scope.selectRow(0,obj1.datas);
            $scope.selectRow(6,obj1.datas);
        });
    };

    function getYearArray(num) {
        var array = [];
        var date = new Date();
        for(var i = 0; i < num; i++){
            array.push(date.dateFormat('yyyy-MM'));
            date.calendar(2,1);
        }
        return array;
    }

    var year = getYearArray(6);

    var getMonthHolidays = function (res) {
        if(res && res.code == 200){
            var obj = res.items;
            var _year = getYearArray(6);
            var _obj = {};
            for(var b = 0,j = _year.length;b<j;b++){
                var o = obj[_year[b]];
                if(o){
                    _obj[_year[b]] = o;
                }else{
                    _year.splice(b,1);
                    --j;
                }
            }

            var _array = [];
            for(var i in _obj){
                if (_obj.hasOwnProperty(i)) {
                    var array = _obj[i];
                    var week = new Date(i).getDay();
                    var _i = 0;
                    for(var a = week;a>0;a--){
                        array.unshift({display:true});
                        ++_i;
                    }
                    var _o = {month:i};
                    _o.datas = array;
                    _o.displayNum = _i;
                    _array.push(_o);
                }
            }

            $scope.holidayList = _array;
        }
    };

    $http.post(baseUrl + '/holiday/getMonthHolidays.htm',{months:year},configJson).success(getMonthHolidays);

    
    $scope.postEdit = function (type,value) {
        if(type == 1 && !value){
            $scope.validShow = true;
            return
        }
        var body = angular.copy($scope.holidayList);
        var _body = [];
        body.forEach(function (obj1) {
            var month = obj1.month;
            obj1.datas.forEach(function (obj2) {
                if(!obj2.display && obj2.selected){
                    _body.push(month + '-' + intAddZero(obj2.day,2));
                }
            })
        });

        var form = {
            days:_body,
            holidayName:value,
            type:type
        };
        ycui.loading.show();
        $http.post(baseUrl + '/holiday/editHolidays.htm',form,configJson).success(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    timeout:10,
                    okclick:function () {
                        $http.post(baseUrl + '/holiday/getMonthHolidays.htm',{months:year},configJson).success(getMonthHolidays);
                    }
                })
            }
        })
    }

}]);