/**
 * Created by moka on 16-6-21.
 */
app.controller("putListAddCtrl", ["$scope", "$http", "$location", "OrdersFty", "AdCreativeFty","$q","UploadKeyFty","SysMarkFty",
    function ($scope, $http, $location, OrdersFty, AdCreativeFty,$q,UploadKeyFty,SysMarkFty) {

        //获取所有的订单 做下拉选项用
        $scope.orderListSel = {
            callback:function(e,d){
                if(d){
                    $scope.useSizeBoChange($scope.useSizeBo);
                }
            }
        };
        var adCreativeOrderNames = AdCreativeFty.adCreativeOrderNames().success(function (response) {
            if(response){
                $scope.orderListSel.list = response.orderNames;
            }
        });
        var adMarkSelect = SysMarkFty.adMarkSelect({adMarkType:1}).success(function (res) {
            if(res && res.length > 0){
                $scope.adMarkSelect = res;
            }
        });

        var upload = function(id,advertising,type){
            var key = "";
            var sizes = advertising.size.split('*');
            var sizes2 = advertising.size2 && (advertising.size2.split('*'));
            var config = {
                server: fileUrl + "/orderAdCreative/upload.htm",
                pick: '#' + id,
                accept: null,
                beforeFileQueued:function(than,file){
                    ycui.loading.show();
                    than.stop(file);
                    UploadKeyFty.uploadKey().success(function (da) {
                        key = da.items;
                        than.upload(file);
                    });
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                uploadBeforeSend:function(than,file,data){
                    data.uploadKey = key;
                    if(advertising.adCreativeType == 2){
                        if(type == 'left'){
                            data.width = sizes[0];
                            data.height = sizes[1];
                        }else if(type == 'right'){
                            data.width = sizes2[0];
                            data.height = sizes2[1];
                        }
                    }else{
                        data.width = sizes[0];
                        data.height = sizes[1];
                    }
                    data.fileSize = advertising.fileSizeLimit;
                },
                uploadSuccess:function(than,file, res){
                    if (res && res.code == 200) {
                        var adCreative = res.adCreative;
                        var object = document.querySelector("." + advertising.uploadId);

                        var config = {
                            src: adCreative.fileHttpUrl,
                            size:sizes,
                            style: true
                        };

                        if(advertising.adCreativeType == 2){
                            if(type == 'left'){
                                advertising.fileHttpUrl = adCreative.fileHttpUrl;
                                object = document.querySelector("." + advertising.leftId);
                            }else if(type == 'right'){
                                config.size = sizes2;
                                advertising.fileHttpUrl2 = adCreative.fileHttpUrl;
                                object = document.querySelector("." + advertising.rightId);
                            }
                            advertising.fileMD5 = adCreative.fileMD5;
                            advertising.fileSize = adCreative.fileSize;
                            advertising.fileType = adCreative.fileType;
                            config.width = 130;
                            config.height = 180;
                        }else{
                            advertising.fileHttpUrl = adCreative.fileHttpUrl;
                            advertising.fileMD5 = adCreative.fileMD5;
                            advertising.fileSize = adCreative.fileSize;
                            advertising.fileType = adCreative.fileType;
                            config.width = 260;
                            config.height = 180;
                        }

                        var html = photoAndSwfPreview(config);
                        object.innerHTML = "<div class='channel-object'>" + html + "</div>";
                        ycui.loading.hide();
                        than.reset();
                    } else if (res._raw == "false") {
                        ycui.alert({
                            content: "不正确的操作",
                            timeout: 10,
                            error:true
                        })
                        than.reset();
                    } else {
                        ycui.alert({
                            content: res.msg,
                            timeout: 10,
                            error:true
                        })
                        than.reset();
                    }
                }
            }
            uploadInit(config);
        }


        /**
         * 根据广告位
         */
        function getAdSpacesFun() {
            $scope.advertising = [];
            ycui.loading.show();
            AdCreativeFty.adSpaceNamesByOrderId({orderId: $scope.config.orderId}).success(function (response) {
                ycui.loading.hide();
                $scope.adShow = true; //数据展现
                $scope.advertising = response.adSpaceNames;
                $scope.$emit('create:change');
            })
        }

        /**
         * 根据尺寸
         */
        function getUseSizeData() {
            $scope.advertising = [];
            ycui.loading.show();
            AdCreativeFty.adSpaceSizesByOrderId({orderId: $scope.config.orderId}).success(function (response) {
                ycui.loading.hide();
                var array = [];
                response.sizes.forEach(function (data) {
                    for (var key in data) {
                        var s = groupArray(data[key], "adCreativeType", "Creatives");
                        array = array.concat(s)
                    }
                });
                $scope.advertising = array;
                $scope.$emit('create:change');
            })
        };

        /*按尺寸上传 - 获取按尺寸数据   */
        $scope.config = {
            useSizeBo:0//暂时没有用到，但需要保留
        }
        $scope.useSizeBoChange = function (type) {
            if(type == 1){
                getUseSizeData();
            }else{
                getAdSpacesFun();
            }
        };

        function advertisingFun() {
            var getId = function () {
                return "ad" + new Date().getTime() + Math.floor(Math.random() * 1000);
            };

            $scope.advertising.forEach(function (data) {
                //筛选广告类型
                var catagorysList = [
                    {name:'图片',value:1},
                    {name:'JS',value:2},
                    {name:'H5',value:3}
                ];
                var catagorys = data.catagorys;
                if(catagorys){
                    catagorys = catagorys.split(',');
                    for (var i = 0;i<catagorysList.length;i++){
                        var l = catagorysList[i];
                        if(catagorys.indexOf(String(l.value)) == -1){
                            catagorysList.splice(i,1);
                            i--
                        }
                    }
                    data.catagory = catagorys[0];
                    data.catagorysList = catagorysList;
                }

                data.fileSizeLimit = data.fileSize;
                data.advertisingShow = true;


                !data.advertisingList && (data.advertisingList = []);
                ~function (da) {
                    da.adCreative = function () {
                        var leftId = getId();
                        var rightId = getId();
                        var uploadId = getId();
                        switch (da.adCreativeType){
                            case 2:
                                da.leftId = leftId;
                                da.rightId = rightId;
                                break;
                            case 3:
                            case 4:
                            case 5:
                                da.uploadId = uploadId;
                                break;
                        }
                        var _da = angular.copy(da);
                        //角标
                        _da.adMarkSelectSel = {
                            list:angular.copy($scope.adMarkSelect),
                            callback:function(e,d){
                                _da.adMarkArea = 3
                            }
                        };
                        var lr = $scope.$on('advertising-upload',function () {
                            switch (da.adCreativeType){
                                case 2:
                                    upload(leftId,_da,'left');
                                    upload(rightId,_da,'right');
                                    break;
                                case 3:
                                case 4:
                                case 5:
                                    upload(uploadId,_da);
                                    break;
                            }
                            lr();
                        });
                        delete _da.advertisingList;
                        da.advertisingList.push(_da);
                    };
                    da.adCreative();
                    da.closeBox = function (index) {
                        da.advertisingList.splice(index,1)
                    };
                }(data)
            });
        }

        $scope.$on('create:change',function () {
            advertisingFun();
        });

        /**
         * 分组 按某个字段分组 原有对象数组集合 返回重组数组
         * @param array 数组
         * @param field 计数字段
         * @param groupField 分组字段
         * @return Array
         */
        function groupArray(array, groupField, field) {
            for (var i = 0; i < array.length; i++) {
                var ob = array[i];
                var testField = ob[groupField];

                for (var a = i + 1; a < array.length; a++) {
                    var data = array[a];
                    if (testField == data[groupField]) {
                        if (!ob[field]) {
                            ob[field] = [];
                        }
                        if (!ob[field + "Name"]) {
                            ob[field + "Name"] = [];
                        }
                        var copyData = angular.copy(data);
                        ob[field].push(copyData);
                        ob[field + "Name"].push(copyData.adSpaceName);
                        array.splice(a, 1);
                        --a
                    }
                }
            }
            return array;
        };

        //创建订单后自动跳转到创意新增页面
        var orderAutoId = getSearch('orderAutoId');
        var orderAutoName = getSearch('orderAutoName');
        var orderAutoType = getSearch('orderAutoType');

        if (orderAutoId && orderAutoId != '') {
            if(orderAutoType != 1){
                $scope.config.orderAutoName = orderAutoName;
                $scope.config.orderId = orderAutoId;
                $scope.config.orderType = orderAutoType;//正式订单才会从订单新增跳转到创意新增
                //选择按尺寸后不需要按广告位。
                $q.all([adMarkSelect]).then(function () {
                    $scope.useSizeBoChange($scope.config.useSizeBo);
                })
            }
        }

        function CreativesFun(array,da) {
            var arr = [];
            array.forEach(function (data, index) {
                var ob = angular.copy(da);
                ob.adCreativeName = da.adCreativeName + "-" + (index + 1)
                arr.push(ob);
                // arr.push({
                //     adCreativeName:da.adCreativeName?(da.adCreativeName + "-" + (index + 1)):'',
                //     adCreativeType:data.adCreativeType,
                //     adSpaceId:data.id,
                //     fileHttpUrl:da.fileHttpUrl,
                //     fileMD5:da.fileMD5,
                //     fileSize:da.fileSize,
                //     fileType:da.fileType,
                //     size:data.size,
                //     landingPage:da.landingPage,

                //     adMarkId:da.adMarkId,
                //     adMarkArea:da.adMarkArea,
                //     monitorType:da.monitorType,

                //     urlOrContent:da.urlOrContent,
                //     h5Content:da.h5Content,
                //     jsCode:da.jsCode,
                //     pvMonitor:da.pvMonitor,
                //     clickMonitor:da.clickMonitor,
                //     showTimeSeconds:da.showTimeSeconds
                // });
            })
            return arr;
        }

        

        $scope.config.testUrl = function(url){
            var regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
            return !regUrl.test(url)
        }

        /*创意提交*/
        $scope.postEdit = function () {
            $scope.config.$valid = true;
            /**
             * 验证
             */
            if (!$scope.advertising) {
                ycui.alert({
                    content: "请选择订单"
                });
                return
            }
            /*广告位验证*/
            var advertisSum = 0;
            $scope.advertising.forEach(function (data) {
                if (data.advertisingShow == false) {
                    ++advertisSum;
                }
            });
            if (advertisSum == $scope.advertising.length) {
                ycui.alert({
                    content: "请选择广告位"
                });
                return
            }
            var regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
            var list = angular.copy($scope.advertising);

            for (var i = 0;i<list.length;i++){
                if (list[i].advertisingShow == false) {
                    continue;
                }
                var ali = list[i].advertisingList;
                for (var j = 0;j<ali.length;j++){
                    var li = ali[j];
                    var bo = false;
                    if(!regUrl.test(li.landingPage)){
                        bo = true;
                        break;
                    }
                    switch (+li.catagory){
                        case 1:
                            li.adCreativeText && (li.adCreativeText = li.adCreativeText.replace(/[\r\n]/g,''));
                            li.adCreativeTitle && (li.adCreativeTitle = li.adCreativeTitle.replace(/[\r\n]/g,''));
                            li.landingPage && (li.landingPage = li.landingPage.replace(/[\r\n]/g,''));

                            //对联如果第二张图片没有上传，默认显示第一张图片
                            if (!li.fileHttpUrl2 && li.adCreativeType == 2) {
                                li.fileHttpUrl2 = li.fileHttpUrl
                            }
                            //创意名称 验证
                            if (!li.adCreativeName) {
                                bo = true;
                            }
                            //创意内容 验证
                            if (!li.adCreativeTitle && (li.adCreativeType == 1 || li.adCreativeType == 4 || li.adCreativeType == 5)) {
                                bo = true;
                            }
                            //创意描述 验证
                            if (!li.adCreativeText && li.adCreativeType == 5) {
                                bo = true;
                            }
                            //创意地址 验证
                            if (!li.fileHttpUrl && li.adCreativeType != 1) {
                                bo = true;
                            }
                            if(li.adSpaceTypeId == 21 && (isNaN(li.showTimeSeconds) || li.showTimeSeconds > li.showTimeLimit || li.showTimeSeconds <= 0)){
                                bo = true;
                            }
                            //创意填写地址校验
                            if(li.urlLoadType == 1){
                                if(li.adCreativeType == 2 && (li.$sizesError2 || li.$sizesError1)){
                                    bo = true;
                                }
                                if(li.adCreativeType != 2 && li.adCreativeType != 1 && li.$sizesError1){
                                    bo = true;
                                }
                            }
                            break;
                        case 2:
                            if(!li.jsCode){
                                bo = true;
                            }
                            if(!li.landingPage){
                                bo = true;
                            }
                            if(!li.adCreativeName){
                                bo = true;
                            }
                            if(li.adSpaceTypeId == 21 && (isNaN(li.showTimeSeconds) || li.showTimeSeconds > li.showTimeLimit || li.showTimeSeconds <= 0)){
                                bo = true;
                            }
                            break;
                        case 3:
                            if(!li.h5Content){
                                bo = true;
                            }
                            if(!li.landingPage){
                                bo = true;
                            }
                            if(!li.adCreativeName){
                                bo = true;
                            }
                            if(li.adSpaceTypeId == 21 && (isNaN(li.showTimeSeconds) || li.showTimeSeconds > li.showTimeLimit || li.showTimeSeconds <= 0)){
                                bo = true;
                            }
                            break;
                    }
                }
                if(bo)return
            }

            var arr = [];
            list.forEach(function (li) {
                if (li.advertisingShow == false) {
                    return;
                }
                var aList = li.advertisingList;
                if ($scope.config.useSizeBo == 1){
                    aList.forEach(function (aLi) {
                        if (aLi.Creatives) {
                            arr = arr.concat(CreativesFun(aLi.Creatives,aLi));
                            delete aLi.Creatives;
                        }
                        arr.push(aLi);
                    })
                }else{
                    aList.forEach(function (aLi) {
                        arr.push(aLi);
                    })
                }
            });

            console.info(arr);

            arr.forEach(function (li) {
                li.orderId = $scope.config.orderId;
                li.orderType = $scope.config.orderType;
                li.adSpaceId = li.id;
            });

            /*switch (+$scope.catagory){
                case 1:
                    //验证提示
                    for (var i = 0, j = data.length; i < j; i++) {
                        if (data[i].advertisingShow == false) {
                            continue;
                        }
                        var dd = data[i]["advertising" + data[i].adCreativeType];
                        for (var a = 0, b = dd.length; a < b; a++) {
                            dd[a].adCreativeNameValid = true;
                            dd[a].adCreativeTitleValid = true;
                            dd[a].adCreativeTextValid = true;
                            dd[a].landingPageValid = true;
                            dd[a].h5UrlValid = true;
                            dd[a].jsCodeValid = true;

                            //对联如果第二张图片没有上传，默认显示第一张图片
                            if (dd[a].fileHttpUrl2 == undefined && data[i].adCreativeType == 2) {
                                dd[a].fileHttpUrl2 = dd[a].fileHttpUrl
                            }
                        }
                    }

                    for (var i = 0, j = data.length; i < j; i++) {
                        if (data[i].advertisingShow == false) {
                            continue;
                        }
                        var dd = data[i]["advertising" + data[i].adCreativeType];
                        for (var a = 0, b = dd.length; a < b; a++) {
                            //富文本去空格
                            dd[a].adCreativeText && (dd[a].adCreativeText = dd[a].adCreativeText.replace(/[\r\n]/g,''));
                            dd[a].adCreativeTitle && (dd[a].adCreativeTitle = dd[a].adCreativeTitle.replace(/[\r\n]/g,''));
                            dd[a].landingPage && (dd[a].landingPage = dd[a].landingPage.replace(/[\r\n]/g,''));
                            if(!$scope.regUrl.test(dd[a].landingPage)){
                                bo = true;
                                break;
                            }
                            //创意名称 验证
                            if (dd[a].adCreativeName == undefined) {
                                bo = true;
                                break;
                            }
                            //创意内容 验证
                            if (dd[a].adCreativeTitle == undefined && (data[i].adCreativeType == 1 || data[i].adCreativeType == 4 || data[i].adCreativeType == 5)) {
                                bo = true;
                                break;
                            }
                            //创意描述 验证
                            if (dd[a].adCreativeText == undefined && data[i].adCreativeType == 5) {
                                bo = true;
                                break;
                            }
                            //创意地址 验证
                            if (dd[a].fileHttpUrl == undefined && data[i].adCreativeType != 1) {
                                ycui.alert({
                                    content: "请上传图片"
                                });
                                bo = true;
                                break;
                            }
                        }
                        if (bo)break;
                    }
                    break;
                case 2:
                    for (var i = 0, j = data.length; i < j; i++) {
                        if (data[i].advertisingShow == false) {
                            continue;
                        }
                        var dd = data[i]["advertisingJsurl"];
                        for (var a = 0, b = dd.length; a < b; a++) {
                            dd[a].adCreativeNameValid = true;
                            dd[a].landingPageValid = true;
                            dd[a].jsCodeValid = true;
                        }
                    }
                    for (var i = 0, j = data.length; i < j; i++) {
                        if (data[i].advertisingShow == false) {
                            continue;
                        }
                        var dd = data[i]["advertisingJsurl"];
                        for (var a = 0, b = dd.length; a < b; a++) {
                            if(!dd[a].jsCode){
                                bo = true;
                                break;
                            }
                            if(!dd[a].landingPage){
                                bo = true;
                                break;
                            }
                            if(!dd[a].adCreativeName){
                                bo = true;
                                break;
                            }
                        }
                        if (bo)break;
                    }
                    break;
                case 3:
                    for (var i = 0, j = data.length; i < j; i++) {
                        if (data[i].advertisingShow == false) {
                            continue;
                        }
                        var dd = data[i]["advertisingH5url"];
                        for (var a = 0, b = dd.length; a < b; a++) {
                            dd[a].adCreativeNameValid = true;
                            dd[a].landingPageValid = true;
                            dd[a].h5UrlValid = true;
                        }
                    }
                    for (var i = 0, j = data.length; i < j; i++) {
                        if (data[i].advertisingShow == false) {
                            continue;
                        }
                        var dd = data[i]["advertisingH5url"];
                        for (var a = 0, b = dd.length; a < b; a++) {
                            if(!dd[a].h5Content){
                                bo = true;
                                break;
                            }
                            if(!dd[a].landingPage){
                                bo = true;
                                break;
                            }
                            if(!dd[a].adCreativeName){
                                bo = true;
                                break;
                            }
                        }
                        if (bo)break;
                    }
                    break;
            }*/

            var body = {
                orderAdCreativeList: arr
            };
            ycui.loading.show();
            AdCreativeFty.adCreativeUpload(body).success(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewPutOrderCreate');
                        }
                    })
                }
            })
        };

    }]);
