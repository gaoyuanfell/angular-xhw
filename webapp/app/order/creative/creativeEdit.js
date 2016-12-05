/**
 * Created by moka on 16-6-21.
 */
app.controller("putListEditCtrl", ["$scope", "$http", "$location", "AdCreativeFty",'SysMarkFty',
    function ($scope, $http, $location, AdCreativeFty,SysMarkFty) {
        $scope.id = getSearch('id');
        $scope.editRuleBo = getSearch('editRuleBo');//权限
        $scope.showState = getSearch('showState');//投放档期结束 showState=3 不能修改创意

        $scope.orderListSel = {};

        var adMarkSelect = []
        SysMarkFty.adMarkSelect({adMarkType:1}).success(function (res) {
            if(res && res.length > 0){
                adMarkSelect = res;
            }
        });

        $scope.config = {
            adCreative:true,
            edit:true
        }
        ycui.loading.show();
        AdCreativeFty.adCreativeInfo({id: $scope.id}).success(function (res) {
            ycui.loading.hide();
            if (!res || res.code != 200) return;

            var adCreative = res.adCreative;
            $scope.orderName = adCreative.orderName;
            adCreative.advertisingShow = true;
            $scope.advertising = [angular.copy(adCreative)];

            var catagorysList = [
                {name:'图片',value:1},
                {name:'JS',value:2},
                {name:'H5',value:3}
            ];
            var catagory = adCreative.catagory;
            for (var i = 0;i<catagorysList.length;i++){
                var l = catagorysList[i];
                if(catagory != l.value){
                    catagorysList.splice(i,1);
                    i--
                }
            }
            adCreative.catagorysList = catagorysList;

            adCreative.adMarkSelectSel = {
                list:adMarkSelect,
                callback:function(e,d){
                    adCreative.adMarkArea = 3
                }
            };

            var getId = function () {
                return "ad" + new Date().getTime() + Math.floor(Math.random() * 1000);
            };
            function showPhoto(data) {
                var object = document.querySelector("." + data.uploadId);
                var config = {
                    src: data.src,
                    size: data.size.split('*'),
                    style: true,
                    width: data.width,
                    height: data.height
                };
                var html = photoAndSwfPreview(config);
                angular.element(object).append("<div class='channel-object'>" + html + "</div>");
            }
            var leftId = getId();
            var rightId = getId();
            var uploadId = getId();
            switch (adCreative.adCreativeType){
                case 2:
                    adCreative.leftId = leftId;
                    adCreative.rightId = rightId;
                    break;
                case 3:
                case 4:
                case 5:
                    adCreative.uploadId = uploadId;
                    break;
            }
            var lr = $scope.$on('advertising-upload',function () {
                switch (adCreative.adCreativeType){
                    case 2:
                        adCreative.adSpaceId && showPhoto({src:adCreative.fileHttpUrl,size:adCreative.size,width:130,height:180,uploadId:adCreative.leftId});
                        adCreative.adSpaceId && showPhoto({src:adCreative.fileHttpUrl2,size:adCreative.size2,width:130,height:180,uploadId:adCreative.rightId});
                        break;
                    case 3:
                    case 4:
                    case 5:
                        adCreative.adSpaceId && showPhoto({src:adCreative.fileHttpUrl,size:adCreative.size,width:260,height:180,uploadId:adCreative.uploadId});
                        break;
                }
                lr();
            })
            $scope.advertising[0].advertisingList = [adCreative];
        });
















        // ycui.loading.show();
        // AdCreativeFty.adCreativeInfo({id: $scope.id}).success(function (data) {
        //     ycui.loading.hide();
        //     if (!data || data.code != 200) return;
        //     var adCreative = data.adCreative;
        //
        //     //下拉值
        //     adCreative.effectListSel = {
        //         list:adCreative.effectList || []
        //     }
        //
        //     adCreative.advertisingShow = true;//默认显示
        //     $scope.orderName = adCreative.orderName;
        //     $scope.adSpaceName = adCreative.adSpaceName;
        //     $scope.size = adCreative.size;
        //
        //     $scope.catagory = adCreative.catagory || 1;
        //     adCreative.catagory = adCreative.catagory || 1;
        //
        //     switch ($scope.catagory){
        //         case 1:
        //             /*值回显*/
        //             adCreative.uploadId = "ad" + new Date().getTime() + Math.floor(Math.random() * 1000)
        //             adCreative.leftId = "ad" + new Date().getTime() + Math.floor(Math.random() * 1000)
        //             adCreative.rightId = "ad" + new Date().getTime() + Math.floor(Math.random() * 1000)
        //             adCreative["advertising" + adCreative.adCreativeType] = [angular.copy(adCreative)]
        //             $scope.advertising = [];
        //             $scope.advertising.push(adCreative);
        //
        //             $scope.advertising[0]["advertising" + adCreative.adCreativeType].forEach(function (advertising) {
        //
        //                 var size1 = advertising.size.split('*');
        //                 switch (advertising.adCreativeType) {
        //                     case 2:
        //                         var s = $scope.$on('advertising2',function () {
        //                             var size2 = advertising.size2.split('*');
        //                             var configL = {
        //                                 src: adCreative.fileHttpUrl,
        //                                 size: size1,
        //                                 style: true,
        //                                 width: 129,
        //                                 height: 180
        //                             };
        //                             var configR = {
        //                                 src: adCreative.fileHttpUrl2,
        //                                 size: size2,
        //                                 style: true,
        //                                 width: 129,
        //                                 height: 180
        //                             };
        //                             var objectL = document.querySelector("." + advertising.leftId);
        //                             var objectR = document.querySelector("." + advertising.rightId);
        //
        //                             var htmlL = photoAndSwfPreview(configL);
        //                             var htmlR = photoAndSwfPreview(configR);
        //
        //                             angular.element(objectL).append("<div class='channel-object'>" + htmlL + "</div>");
        //                             angular.element(objectR).append("<div class='channel-object'>" + htmlR + "</div>");
        //                             delete advertising.leftId;
        //                             delete advertising.rightId;
        //                             s();
        //                         });
        //                         break;
        //                     case 3:
        //                         var s = $scope.$on('advertising3', function () {
        //                             var object = document.querySelector("." + advertising.uploadId);
        //                             var config = {
        //                                 src: adCreative.fileHttpUrl,
        //                                 size: size1,
        //                                 style: true,
        //                                 width: 250,
        //                                 height: 180
        //                             };
        //                             var html = photoAndSwfPreview(config);
        //                             angular.element(object).append("<div class='channel-object'>" + html + "</div>");
        //                             delete advertising.uploadId;
        //                             s();
        //                         });
        //                         break;
        //                     case 4:
        //                         var s = $scope.$on('advertising4',function () {
        //                             var object = document.querySelector("." + advertising.uploadId);
        //                             var config = {
        //                                 src: adCreative.fileHttpUrl,
        //                                 size: size1,
        //                                 style: true,
        //                                 width: 250,
        //                                 height: 180
        //                             };
        //                             var html = photoAndSwfPreview(config);
        //                             angular.element(object).append("<div class='channel-object'>" + html + "</div>");
        //                             delete advertising.uploadId;
        //                             s();
        //                         });
        //                         break;
        //                     case 5:
        //                         var s = $scope.$on('advertising5',function () {
        //                             var object = document.querySelector("." + advertising.uploadId);
        //                             var config = {
        //                                 src: adCreative.fileHttpUrl,
        //                                 size: size1,
        //                                 style: true,
        //                                 width: 250,
        //                                 height: 180
        //                             };
        //                             var html = photoAndSwfPreview(config);
        //                             angular.element(object).append("<div class='channel-object'>" + html + "</div>");
        //                             delete advertising.uploadId;
        //                             s();
        //                         });
        //                         break;
        //                     default :
        //                         break;
        //                 }
        //             })
        //             break;
        //         case 2:
        //             adCreative["advertisingJsurl"] = [angular.copy(adCreative)];
        //             $scope.advertising = [];
        //             $scope.advertising.push(adCreative);
        //             break;
        //         case 3:
        //             adCreative["advertisingH5url"] = [angular.copy(adCreative)];
        //             $scope.advertising = [];
        //             $scope.advertising.push(adCreative);
        //             break;
        //     }
        // });

        // $scope.$on('creative-special',function () {
        //     ycui.select('.yc-select')
        // })
        /* 创意修改 */

        $scope.config.testUrl = function(url){
            var regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
            return !regUrl.test(url)
        }
        
        $scope.postEdit = function () {
            var regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
            $scope.config.$valid = true;
            var data = $scope.advertising[0].advertisingList[0];
            var li = angular.copy(data);
            var bo = false;
            switch (+li.catagory){
                case 1:
                    li.adCreativeText && (li.adCreativeText = li.adCreativeText.replace(/[\r\n]/g,''));
                    li.adCreativeTitle && (li.adCreativeTitle = li.adCreativeTitle.replace(/[\r\n]/g,''));
                    li.landingPage && (li.landingPage = li.landingPage.replace(/[\r\n]/g,''));

                    //对联如果第二张图片没有上传，默认显示第一张图片
                    if (!li.fileHttpUrl2 && li.adCreativeType == 2) {
                        li.fileHttpUrl2 = li.fileHttpUrl
                    }
                    if(!regUrl.test(li.landingPage)){
                        bo = true;
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
            if(bo)return;
            delete li.updateTime;
            delete li.createTime;
            delete li.handler;
            delete li.sort;
            delete li.state;
            AdCreativeFty.adCreativeUpdate(li).success(function (response) {
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewPutOrderCreate');
                        }
                    })
                }
            })






            // /*验证*/
            // var bo = false;//一项不通过都不请求
            // var data = $scope.advertising;
            //
            // // for (var i = 0, j = data.length; i < j; i++) {
            // //     var dd = data[i]["advertising" + data[i].adCreativeType];
            // //     for (var a = 0, b = dd.length; a < b; a++) {
            // //         //验证提示
            // //         dd[a].adCreativeNameValid = true;
            // //         dd[a].adCreativeTitleValid = true;
            // //         dd[a].adCreativeTextValid = true;
            // //         dd[a].landingPageValid = true;
            // //         dd[a].h5UrlValid = true;
            // //         dd[a].jsCodeValid = true;
            // //     }
            // // }
            // // data = angular.copy($scope.advertising);
            // // for (var i = 0, j = data.length; i < j; i++) {
            // //     var dd = data[i]["advertising" + data[i].adCreativeType];
            // //     for (var a = 0, b = dd.length; a < b; a++) {
            // //         //富文本去空格
            // //         dd[a].adCreativeText && (dd[a].adCreativeText = dd[a].adCreativeText.replace(/[\r\n]/g,''));
            // //         dd[a].adCreativeTitle && (dd[a].adCreativeTitle = dd[a].adCreativeTitle.replace(/[\r\n]/g,''));
            // //         dd[a].landingPage && (dd[a].landingPage = dd[a].landingPage.replace(/[\r\n]/g,''));
            // //         //落地页
            // //         if(!$scope.regUrl.test(dd[a].landingPage)){
            // //             bo = true;
            // //             break;
            // //         }
            // //         //创意名称 验证
            // //         if (dd[a].adCreativeName == undefined) {
            // //             bo = true;
            // //             break;
            // //         }
            // //
            // //         //创意内容 验证
            // //         if (dd[a].adCreativeTitle == undefined && (data[i].adCreativeType == 1 || data[i].adCreativeType == 4 || data[i].adCreativeType == 5)) {
            // //             bo = true;
            // //             break;
            // //         }
            // //         //创意描述 验证
            // //         if (dd[a].adCreativeText == undefined && data[i].adCreativeType == 5) {
            // //             bo = true;
            // //             break;
            // //         }
            // //         //创意地址 验证
            // //         if (dd[a].fileHttpUrl == undefined && data[i].adCreativeType != 1) {
            // //             ycui.alert({
            // //                 content: "请上传图片"
            // //             });
            // //             bo = true;
            // //             break;
            // //         }
            // //         //创意地址 验证
            // //         if (dd[a].fileHttpUrl2 == undefined && data[i].adCreativeType == 2) {
            // //             ycui.alert({
            // //                 content: "请上传图片"
            // //             });
            // //             bo = true;
            // //             break;
            // //         }
            // //     }
            // // }
            //
            // switch (+$scope.catagory){
            //     case 1:
            //         //验证提示
            //         for (var i = 0, j = data.length; i < j; i++) {
            //             var dd = data[i]["advertising" + data[i].adCreativeType];
            //             for (var a = 0, b = dd.length; a < b; a++) {
            //                 dd[a].adCreativeNameValid = true;
            //                 dd[a].adCreativeTitleValid = true;
            //                 dd[a].adCreativeTextValid = true;
            //                 dd[a].landingPageValid = true;
            //                 dd[a].h5UrlValid = true;
            //                 dd[a].jsCodeValid = true;
            //             }
            //         }
            //
            //         for (var i = 0, j = data.length; i < j; i++) {
            //             var dd = data[i]["advertising" + data[i].adCreativeType];
            //             for (var a = 0, b = dd.length; a < b; a++) {
            //                 //富文本去空格
            //                 dd[a].adCreativeText && (dd[a].adCreativeText = dd[a].adCreativeText.replace(/[\r\n]/g,''));
            //                 dd[a].adCreativeTitle && (dd[a].adCreativeTitle = dd[a].adCreativeTitle.replace(/[\r\n]/g,''));
            //                 dd[a].landingPage && (dd[a].landingPage = dd[a].landingPage.replace(/[\r\n]/g,''));
            //                 if(!$scope.regUrl.test(dd[a].landingPage)){
            //                     bo = true;
            //                     break;
            //                 }
            //                 //创意名称 验证
            //                 if (dd[a].adCreativeName == undefined) {
            //                     bo = true;
            //                     break;
            //                 }
            //                 //创意内容 验证
            //                 if (dd[a].adCreativeTitle == undefined && (data[i].adCreativeType == 1 || data[i].adCreativeType == 4 || data[i].adCreativeType == 5)) {
            //                     bo = true;
            //                     break;
            //                 }
            //                 //创意描述 验证
            //                 if (dd[a].adCreativeText == undefined && data[i].adCreativeType == 5) {
            //                     bo = true;
            //                     break;
            //                 }
            //                 //创意地址 验证
            //                 if (dd[a].fileHttpUrl == undefined && data[i].adCreativeType != 1) {
            //                     ycui.alert({
            //                         content: "请上传图片"
            //                     });
            //                     bo = true;
            //                     break;
            //                 }
            //             }
            //             if (bo)break;
            //         }
            //         break;
            //     case 2:
            //         for (var i = 0, j = data.length; i < j; i++) {
            //             var dd = data[i]["advertisingJsurl"];
            //             for (var a = 0, b = dd.length; a < b; a++) {
            //                 dd[a].landingPageValid = true;
            //                 dd[a].jsCodeValid = true;
            //             }
            //         }
            //         for (var i = 0, j = data.length; i < j; i++) {
            //             var dd = data[i]["advertisingJsurl"];
            //             for (var a = 0, b = dd.length; a < b; a++) {
            //                 if(!dd[a].jsCode){
            //                     bo = true;
            //                     break;
            //                 }
            //                 if(!dd[a].landingPage){
            //                     bo = true;
            //                     break;
            //                 }
            //             }
            //             if (bo)break;
            //         }
            //         break;
            //     case 3:
            //         for (var i = 0, j = data.length; i < j; i++) {
            //             var dd = data[i]["advertisingH5url"];
            //             for (var a = 0, b = dd.length; a < b; a++) {
            //                 dd[a].landingPageValid = true;
            //                 dd[a].h5UrlValid = true;
            //             }
            //         }
            //         for (var i = 0, j = data.length; i < j; i++) {
            //             if (data[i].advertisingShow == false) {
            //                 continue;
            //             }
            //             var dd = data[i]["advertisingH5url"];
            //             for (var a = 0, b = dd.length; a < b; a++) {
            //                 if(!dd[a].h5Content){
            //                     bo = true;
            //                     break;
            //                 }
            //                 if(!dd[a].landingPage){
            //                     bo = true;
            //                     break;
            //                 }
            //             }
            //             if (bo)break;
            //         }
            //         break;
            // }
            //
            // if (bo) return;
            //
            //
            // $scope.advertising.forEach(function (array) {
            //     var _body;
            //     switch (+$scope.catagory){
            //         case 1:
            //             _body = array["advertising" + array.adCreativeType][0];
            //             break;
            //         case 2:
            //             _body = array["advertisingJsurl"][0];
            //             break;
            //         case 3:
            //             _body = array["advertisingH5url"][0];
            //             break;
            //     }
            //     if(_body){
            //         var body = {
            //             adCreativeName:_body.adCreativeName,
            //             adCreativeType:_body.adCreativeType,
            //             adSpaceId:_body.adSpaceId,
            //             adSpaceTypeId:_body.adSpaceTypeId,
            //             adSpaceTypeName:_body.adSpaceTypeName,
            //             fileHttpUrl:_body.fileHttpUrl,
            //             fileHttpUrl2:_body.fileHttpUrl2,
            //             fileMD5:_body.fileMD5,
            //             fileSize:_body.fileSize,
            //             fileType:_body.fileType,
            //             id:_body.id,
            //             catagory:_body.catagory,
            //             landingPage:_body.landingPage,
            //             pvMonitor:_body.pvMonitor,
            //             clickMonitor:_body.clickMonitor,
            //             jsCode:_body.jsCode,
            //             h5Content:_body.h5Content,
            //             limitFileSize:_body.limitFileSize,
            //             orderId:_body.orderId,
            //             size:_body.size,
            //             size2:_body.size2,
            //             effectId:_body.effectId,
            //             specialEffectsName:_body.specialEffectsName,
            //             adMarkId:_body.adMarkId,
            //             adMarkArea:_body.adMarkArea,
            //             showTimeSeconds:_body.showTimeSeconds
            //         };
            //
            //         AdCreativeFty.adCreativeUpdate(_body).success(function (response) {
            //             if (response && response.code == 200) {
            //                 ycui.alert({
            //                     content: response.msg,
            //                     okclick: function () {
            //                         goRoute('ViewPutOrderCreate');
            //                     }
            //                 })
            //             }
            //         })
            //     }
            // });
        }
    }]);