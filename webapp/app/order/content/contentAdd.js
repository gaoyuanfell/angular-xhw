/**
 * Created by moka on 16-9-2.
 */
app.controller('ContentAddCtrl', ['$scope', 'ContentFty', 'UploadKeyFty', 'CustomerFty', 'OrdersFty', 'ScheduleFty', 'AdCreativeFty', '$q','SysMarkFty',
    function ($scope, ContentFty, UploadKeyFty, CustomerFty, OrdersFty, ScheduleFty, AdCreativeFty, $q,SysMarkFty) {

        $scope.channelListSel = {};
        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.channelListSel.$destroy();
                if(d){
                    ContentFty.getChannelsByMedia({mediaId:d.id}).success(function(res){
                        $scope.channelListSel.list = res.channels;
                    })
                }
            }
        };

        ContentFty.mediaList().success(function(res){
            if(res && res.code == 200){
                $scope.mediaListSel.list = res.mediaList;
            }
        })

        var uploadC = function(id){
            var config = {
                server: fileUrl + "/orderAdCreative/content.htm",
                pick: {
                    id: '#' + id,
                    multiple: false
                },
                accept: null,
                error:function (uploader,err) {
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: 10,
                        error:true
                    });
                    ycui.loading.hide();
                    uploader.reset();
                },
                uploadComplete:function () {
                    ycui.loading.hide();
                },
                beforeFileQueued:function (uploader,file) {
                    var size = 20*1024*1024;
                    if(file.size > size){
                        ycui.alert({
                            content: "文件大小不能超过20M(1M等于1024KB)",
                            timeout: 10,
                            error:true
                        });
                        return false;
                    }
                    ycui.loading.show();
                    uploader.stop(file);
                    UploadKeyFty.uploadKey().success(function (da) {
                        key = da.items;
                        uploader.upload(file);
                    });
                },
                uploadBeforeSend:function (uploader, file, data) {
                    data.uploadKey = key;
                },
                uploadSuccess:function (uploader, file, res) {
                    if (res && res.code == 200) {
                        $scope.$apply(function () {
                            $scope.content.contentAnnex = res.file.fileHttpUrl
                        })
                    }
                }
            }
            return uploadInit(config);
        }

        uploadC('contentAnnex');

        $scope.content = {};

        $scope.$on('loginUserInfo', function () {
            $scope.content.createUser = $scope.$parent.user.id;
            $scope.content.createUserName = $scope.$parent.user.trueName;
        })

        //  创意开始
        $scope.config = {isContent:true};
        $scope.orderListSel = {
            callback:function(){
                getAdvertising();
            }
        }
        var adCreativeOrderNames = AdCreativeFty.adCreativeOrderNames().success(function (response) {
            if (response) {
                $scope.orderListSel.list = response.orderNames;
            }
        });

        var adMarkSelect = SysMarkFty.adMarkSelect({adMarkType:1}).success(function (res) {
            if(res && res.length > 0){
                $scope.adMarkSelect = res;
            }
        });

        $scope.$on('create:change', function () {
            advertisingFun();
        })

        function getAdvertising() {
            $scope.advertising = [];
            ycui.loading.show();
            AdCreativeFty.adSpaceNamesByOrderId({ orderId: $scope.content.orderId }).success(function (response) {
                ycui.loading.hide();
                $scope.adShow = true; //数据展现
                $scope.advertising = response.adSpaceNames;
                $scope.$emit('create:change');
            })
        }

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
                            timeout: -1
                        })
                        than.reset();
                    } else {
                        ycui.alert({
                            content: res.msg,
                            timeout: -1
                        })
                        than.reset();
                    }
                }
            }
            uploadInit(config);
        }

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

        $scope.postEdit = function () {
            $scope.validShow = true;


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
            if(!$scope.content.mediaId || !$scope.content.channelId){
                return;
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
            // var regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
            var list = angular.copy($scope.advertising);

            var bo = false;
            for (var i = 0;i<list.length;i++){
                if (list[i].advertisingShow == false) {
                    continue;
                }
                var ali = list[i].advertisingList;
                for (var j = 0;j<ali.length;j++){
                    var li = ali[j];
                    switch (+li.catagory){
                        case 1:
                            li.adCreativeText && (li.adCreativeText = li.adCreativeText.replace(/[\r\n]/g,''));
                            li.adCreativeTitle && (li.adCreativeTitle = li.adCreativeTitle.replace(/[\r\n]/g,''));

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
                            //创意名称 验证
                            if (!li.adCreativeName) {
                                bo = true;
                            }
                            if(!li.jsCode){
                                bo = true;
                            }
                            // if(!li.landingPage){
                            //     bo = true;
                            // }
                            if(!li.adCreativeName){
                                bo = true;
                            }
                            if(li.adSpaceTypeId == 21 && (isNaN(li.showTimeSeconds) || li.showTimeSeconds > li.showTimeLimit || li.showTimeSeconds <= 0)){
                                bo = true;
                            }
                            break;
                        case 3:
                            //创意名称 验证
                            if (!li.adCreativeName) {
                                bo = true;
                            }
                            if(!li.h5Content){
                                bo = true;
                            }
                            // if(!li.landingPage){
                            //     bo = true;
                            // }
                            if(!li.adCreativeName){
                                bo = true;
                            }
                            if(li.adSpaceTypeId == 21 && (isNaN(li.showTimeSeconds) || li.showTimeSeconds > li.showTimeLimit || li.showTimeSeconds <= 0)){
                                bo = true;
                            }
                            break;
                    }
                    if(bo)return
                }
            }

            if (!$scope.content.orderId || !$scope.content.contentAnnex || !$scope.content.contentName) {
                bo = true;
            }

            if (bo) return;

            var arr = [];
            list.forEach(function (li) {
                if (li.advertisingShow == false) {
                    return;
                }
                var aList = li.advertisingList;
                aList.forEach(function (aLi) {
                    arr.push(aLi);
                })
            });

            arr.forEach(function (li) {
                li.orderId = $scope.content.orderId;
                li.orderType = $scope.content.orderType;
                li.adSpaceId = li.id;

                delete li.adCreative;
                delete li.adMarkSelectSel;
                delete li.catagorysList;
                delete li.handler;
            });

            $scope.content.creativeList = arr;

            ycui.loading.show();
            ContentFty.contentAdd($scope.content).success(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        timeout: -1,
                        okclick: function () {
                            goRoute('ViewContent');
                        }
                    })
                }
            })
        };

    }]);
