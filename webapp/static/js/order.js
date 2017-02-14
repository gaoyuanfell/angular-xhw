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
                    ContentFty.getChannelsByMedia({mediaId:d.id}).then(function(res){
                        $scope.channelListSel.list = res.channels;
                    })
                }
            }
        };

        ContentFty.mediaList().then(function(res){
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
                    UploadKeyFty.uploadKey().then(function (da) {
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
        var adCreativeOrderNames = AdCreativeFty.adCreativeOrderNames().then(function (response) {
            if (response) {
                $scope.orderListSel.list = response.orderNames;
            }
        });

        var adMarkSelect = SysMarkFty.adMarkSelect({adMarkType:1}).then(function (res) {
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
            AdCreativeFty.adSpaceNamesByOrderId({ orderId: $scope.content.orderId }).then(function (response) {
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
                    UploadKeyFty.uploadKey().then(function (da) {
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
                        var list = angular.copy($scope.adMarkSelect);
                        list.unshift({adMarkName:'无',id:0})
                        _da.adMarkSelectSel = {
                            list:list,
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
            ContentFty.contentAdd($scope.content).then(function (res) {
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

/**
 * Created by moka on 16-9-2.
 */
app.controller('ContentEditCtrl', ['$scope', 'ContentFty', 'UploadKeyFty', 'CustomerFty', 'OrdersFty', 'ScheduleFty', 'AdCreativeFty', '$q', 'SysMarkFty',
    function ($scope, ContentFty, UploadKeyFty, CustomerFty, OrdersFty, ScheduleFty, AdCreativeFty, $q, SysMarkFty) {

        $scope.channelListSel = {};
        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.channelListSel.$destroy();
                if(d){
                    ContentFty.getChannelsByMedia({mediaId:d.id}).then(function(res){
                        $scope.channelListSel.list = res.channels;
                    })
                }
            },
            sessionBack:function(d){
                if(d){
                    ContentFty.getChannelsByMedia({mediaId:d.id}).then(function(res){
                        $scope.channelListSel.list = res.channels;
                    })
                }
            }
        };

        ContentFty.mediaList().then(function(res){
            if(res && res.code == 200){
                $scope.mediaListSel.list = res.mediaList;
            }
        })

        $scope.config = {isContent:true};
        var upload = function(id,advertising,type){
            var key = "";
            var sizes = advertising.size.split('*');
            var sizes2 = advertising.size2 && (advertising.size2.split('*'));
            var config = {
                server: fileUrl + "/orderAdCreative/upload.htm",
                pick: '#' + id,
                beforeFileQueued:function(than,file){
                    ycui.loading.show();
                    than.stop(file);
                    UploadKeyFty.uploadKey().then(function (da) {
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

            $scope.advertising.forEach(function (data) {
                //筛选广告类型
                var catagorysList = [
                    {name:'图片',value:1},
                    {name:'JS',value:2},
                    {name:'H5',value:3}
                ];
                var catagorys = data.catagorys || String(data.catagory);
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

                data.fileSizeLimit = data.limitFileSize || data.fileSize;
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
                        var list = angular.copy($scope.adMarkSelect);
                        list.unshift({adMarkName:'无',id:0})
                        _da.adMarkSelectSel = {
                            list:list,
                            callback:function(e,d){
                                _da.adMarkArea = 3
                            }
                        };
                        var lr = $scope.$on('advertising-upload',function () {
                            switch (da.adCreativeType){
                                case 2:
                                    upload(leftId,_da,'left');
                                    upload(rightId,_da,'right');
                                    _da.adSpaceId && showPhoto({src:_da.fileHttpUrl,size:_da.size,width:130,height:180,uploadId:_da.leftId});
                                    _da.adSpaceId && showPhoto({src:_da.fileHttpUrl2,size:_da.size2,width:130,height:180,uploadId:_da.rightId});
                                    break;
                                case 3:
                                case 4:
                                case 5:
                                    upload(uploadId,_da);
                                    _da.adSpaceId && showPhoto({src:_da.fileHttpUrl,size:_da.size,width:260,height:180,uploadId:_da.uploadId});
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

        var adMarkSelect = SysMarkFty.adMarkSelect({adMarkType:1}).then(function (res) {
            if(res && res.length > 0){
                $scope.adMarkSelect = res;
            }
        });

        var id = getSearch("id");
        var checkState = $scope.checkState = getSearch("checkState");
        ContentFty.contentOne({ id: id }).then(function (res) {
            if (res && res.code == 200) {
                $scope.content = res.content;
                $scope.advertising = res.content.creativeList;
                // $scope.advertising = [];
                $q.all([adMarkSelect]).then(function () {
                    advertisingFun();
                })
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
                    UploadKeyFty.uploadKey().then(function (da) {
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



        $scope.orderListSel = {
            callback:function(){
                getAdvertising();
            }
        }

        var adCreativeOrderNames = AdCreativeFty.adCreativeOrderNames().then(function (response) {
            if (response) {
                $scope.orderListSel.list = response.orderNames;
            }
        });

        $scope.$on('create:change', function () {
            advertisingFun();
        })

        function getAdvertising() {
            $scope.advertising = [];
            ycui.loading.show();
            AdCreativeFty.adSpaceNamesByOrderId({ orderId: $scope.content.orderId }).then(function (response) {
                ycui.loading.hide();
                $scope.adShow = true; //数据展现
                $scope.advertising = response.adSpaceNames;
                $scope.$emit('create:change');
            })
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
                li.adSpaceId = li.adSpaceId || li.id;

                delete li.adCreative;
                delete li.adMarkSelectSel;
                delete li.catagorysList;
                delete li.handler;
            });

            $scope.content.creativeList = arr;
            ycui.loading.show();
            ContentFty.editContent($scope.content).then(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        timeout: 10,
                        okclick: function () {
                            goRoute('ViewContent');
                        }
                    })
                }
            })
        };

    }]);

/**
 * Created by moka on 16-9-2.
 */
app.controller('ContentListCtrl', ['$scope', 'ContentFty', 'AdCreativeFty', '$q', function ($scope, ContentFty, AdCreativeFty, $q) {
    
    $scope.channelListSel = {};
    $scope.mediaListSel = {
        callback:function(e,d){
            $scope.channelListSel.$destroy();
            if(d){
                ContentFty.getChannelsByMedia({mediaId:d.id}).then(function(res){
                    $scope.channelListSel.list = res.channels;
                })
            }
        },
        sessionBack:function(d){
            if(d){
                ContentFty.getChannelsByMedia({mediaId:d.id}).then(function(res){
                    $scope.channelListSel.list = res.channels;
                })
            }
        }
    };

    ContentFty.mediaList().then(function(res){
        if(res && res.code == 200){
            $scope.mediaListSel.list = res.mediaList;
        }
    })

    $scope.orderNameSel = {};
    $scope.stateSel = {
        list:[
            {name:'审核中',id:0},
            {name:'审核通过',id:1},
            {name:'审核不通过',id:-1},
        ]
    };

    //订单
    var orderNamesForList = AdCreativeFty.orderNamesForList().then(function (response) {
        if (response && response.code == 200) {
            $scope.orderNameSel.list = response.orderNames;
        }
    });

    
    ycui.loading.show();
    $scope.query = {
        pageSize: 10,
        pageIndex: 1
    };
    var modView = function (response) {
        ycui.loading.hide();
        if (!response) return;
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;

        response.items && response.items.forEach(function (data) {
            if (data.creativeList && data.creativeList.length > 0) {
                data.orderName = data.creativeList[0].orderName
            }
        })
        $scope.items = response.items;
    }

    ContentFty.contentList($scope.query).then(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.searchName = $scope.query.search;
        ContentFty.contentList($scope.query).then(modView);
    };

    $scope.$on('contentListGroup',function(){
        ycui.loading.show();
        $scope.query.pageIndex = 1;
        ContentFty.contentList($scope.query).then(modView);
    })
    

    $scope.contentCheck = function (id, name) {
        var body = $scope._contentCheckModule = {id:id,checkState:1}
        var reg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
        $scope.contentCheckModule = {
            title:'【' + name + '】' + '审核',
            okClick:function(){
                $scope._contentCheckModule.$valid = true;
                var testValue = $scope.contentCheckModule.testValue = reg.test(body.publishAddr);
                if(body.checkState == 1 && !testValue){
                    return true;
                }
                if(body.checkState == -1 && !body.checkRemark){
                    return true;
                }
                ContentFty.editCheck(body).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content: res.msg,
                            timeout: 10,
                            okclick: function () {
                                ContentFty.contentList($scope.query).then(modView);
                            }
                        })
                    }
                })
            },
            noClick:function(){

            }
        }

    }

    $scope.showInfo = function (item) {
        if (item && item.creativeList && item.creativeList.length > 0) {
            var html = '';
            //ID、广告位名称、频道、媒体
            html += '<table class="yc-table"><thead><tr><th>ID</th><th>广告位名称</th><th>频道</th><th>媒体</th></tr></thead><%body%></table>'
            var body = '';
            item.creativeList.forEach(function (data) {
                body += '<tr><td>' + data.adSpaceId + '</td><td>' + data.adSpaceName + '</td><td>' + data.channelName + '</td><td>' + data.mediaName + '</td></tr>';
            })
            ycui.alert({
                title: '【' + item.contentName + '】',
                content: html.replace('<%body%>', body),
                timeout: -1
            })
        }
    }

    $scope.delete = function (id, name) {
        ycui.confirm({
            title: '【' + name + '】内容删除',
            content: '确定要删除此内容?',
            okclick: function () {
                ContentFty.contentDelete({ id: id }).then(function (res) {
                    if (res && res.code == 200) {
                        ycui.alert({
                            content: res.msg,
                            timeout: -1,
                            okclick: function () {
                                ContentFty.contentList($scope.query).then(modView);
                            }
                        })
                    }
                })
            }
        })
    }

}])
/**
 * Created by moka on 16-6-21.
 */
/**
 * 合同号列表
 */
app.controller('contractListCtrl', ['$scope', 'ContractFty','UploadKeyFty',
    function ($scope, ContractFty,UploadKeyFty) {
        ycui.loading.show();
        var modViewA = function (response) {
            ycui.loading.hide();
            if(!response){return}
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };
        $scope.query = {pageSize: 10, pageIndex: 1};
        ContractFty.listContracts($scope.query).then(modViewA);

        $scope.redirect = function (num,con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search
            ContractFty.listContracts($scope.query).then(modViewA);
        };

        var upload = function(id){
            var key = '';
            var config = {
                server: baseUrl + "/contracts/readContracts.htm",
                pick: {
                    id: '#'+id,
                    multiple: false
                },
                // accept: {
                //     title: 'xls',
                //     extensions: 'xls,xlsx',
                //     mimeTypes: '.xls,.xlsx'
                // },
                error:function(uploader,err){
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: -1,
                        error:true
                    });
                    ycui.loading.hide();
                    uploader.reset();
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                beforeFileQueued:function(uploader,file){
                    ycui.loading.show();
                    uploader.stop(file);
                    UploadKeyFty.uploadKey().then(function (da) {
                        key = da.items;
                        uploader.upload(file);
                    });
                },
                uploadBeforeSend:function(uploader,file, data){
                    data.uploadKey = key;
                },
                uploadSuccess:function(uploader,file, res){
                    if (res && res.code == 200) {
                        var arr = res.msg.replace(/\;/g,'<br>');
                        ycui.alert({
                            content: '<div style="max-height: 300px;overflow-y: auto;width: auto;">'+ arr +'</div>',
                            timeout: 10,
                            okclick:function () {
                                ContractFty.listContracts(query).then(modViewA);
                            }
                        });
                        ycui.loading.hide();
                        uploader.reset();
                    }else if (res._raw == "false") {
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

            }
            return uploadInit(config);
        }

        // var uploadInit = function (id) {
        //     var config = {
        //         server: baseUrl + "/contracts/readContracts.htm",
        //         pick: {
        //             id: '#'+id,
        //             multiple: false
        //         },
        //         fileVal: "uploadFile",
        //         accept: {
        //             title: 'xls',
        //             extensions: 'xls,xlsx',
        //             mimeTypes: '.xls,.xlsx'
        //         }
        //     };
        //     var uploader = WebUploader.create(config);
        //     uploader.on('error', function (err) {
        //         ycui.alert({
        //             content: "错误的文件类型",
        //             timeout: -1,
        //             error:true
        //         });
        //         ycui.loading.hide();
        //         uploader.reset();
        //     });
        //     uploader.on('uploadComplete', function () {
        //         ycui.loading.hide();
        //     });
        //     var key = '';
        //     uploader.on('beforeFileQueued', function (file) {
        //         ycui.loading.show();
        //         uploader.stop(file);
        //         UploadKeyFty.uploadKey().then(function (da) {
        //             key = da.items;
        //             uploader.upload(file);
        //         });
        //     });
        //     uploader.on('uploadBeforeSend', function (ob, data) {
        //         data.uploadKey = key;
        //     });
        //     return uploader
        // };
        
        /**
         * 合同导入
         */
        // upload('contractImport')

        // var uploader = uploadInit('contractImport').on('uploadSuccess',function (file, res) {
        //     if (res && res.code == 200) {
        //         var arr = res.msg.replace(/\;/g,'<br>');
        //         ycui.alert({
        //             content: '<div style="max-height: 300px;overflow-y: auto;width: auto;">'+ arr +'</div>',
        //             timeout: -1,
        //             okclick:function () {
        //                 ContractFty.listContracts(query).then(modViewA);
        //             }
        //         });
        //         ycui.loading.hide();
        //         uploader.reset();
        //     }else if (res._raw == "false") {
        //         ycui.alert({
        //             content: "不正确的操作",
        //             timeout: -1,
        //             error:true
        //         });
        //         uploader.reset();
        //     } else {
        //         ycui.alert({
        //             content: res.msg,
        //             timeout: -1,
        //             error:true
        //         });
        //         uploader.reset();
        //     }
        // });

        $scope.contractDown = function () {
            window.open(fileUrl + '/download/合同录入模板.xlsx','_blank')
        }
    }]);

/**
 * 新增合同号
 */
app.controller('contractAddCtrl', ['$scope', 'ContractFty',
    function ($scope, ContractFty) {
        $scope.contract = {type:1};

        $scope.postEdit = function () {
            if(!$(".form").valid()){
                return;
            }
            var query = {
                contractCode:$scope.contract.contractCode,
                contractMoney:$scope.contract.contractMoney,
                discount:$scope.contract.discount*.01,
                present:$scope.contract.present*.01,
                type:$scope.contract.type,
                contractName:$scope.contract.contractName
            }
            ycui.loading.show();
            ContractFty.addContracts(query).then(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewContract')
                        },
                        timeout: 10
                    });
                }
            })
        };
        /**
         * 验证
         */
        $(".form").validate({
            rules: {
                contractCode: {required: true},
                contractMoney: {required: true, number: true,min:1,},
                discount: {
                    required: true, 
                    number: true,
                    min:1,
                    max:100
                },
                present: {
                    required: true, 
                    number: true,
                    min:0
                },
                contractName: {required: true}
            },
            messages: {
                contractCode: {required: '请输入合同号'},
                contractMoney: {required: '请输入合同总金额',number:'请输入正确的合同总金额',min:'请输入大于等于1合同总金额'},
                discount: {required: '请输入合同折扣比例',number:'请输入正确的合同折扣比例',min:'请输入大于等1合同折扣比例',max:'请输入小于等于100合同折扣比例'},
                present: {required: '请输入合同配送比例',number:'请输入正确的合同配送比例',min:'请输入大于等于0配送比例'},
                contractName: {required: '请输入合同名称'}
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);

/**
 * 修改合同号
 */
app.controller('contractEditCtrl', ['$scope', 'ContractFty',
    function ($scope, ContractFty) {
        $scope.contract = {};
        var id = getSearch("id");
        $scope.id = id;
        ContractFty.findContracts({id: id}).then(function (res) {
            if (res && res.code == 200) {
                $scope.contract = res.items;
                $scope.contract.discount = $scope.contract.discount*100;
                $scope.contract.present = $scope.contract.present*100;
            }
        });

        $scope.postEdit = function () {
            if(!$(".form").valid()){
                return;
            }
            var query = {
                contractCode:$scope.contract.contractCode,
                contractMoney:$scope.contract.contractMoney,
                discount:$scope.contract.discount*.01,
                id:$scope.contract.id,
                present:$scope.contract.present*.01,
                type:$scope.contract.type,
                contractName:$scope.contract.contractName
            };
            ycui.loading.show();
            ContractFty.updateContracts(query).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewContract')
                        },
                        timeout: 10
                    });
                }
            })
        };
        /**
         * 验证
         */
        $(".form").validate({
            rules: {
                contractCode: {required: true},
                contractMoney: {required: true, number: true,min:1},
                discount: {
                    required: true,
                    number: true,
                    min:1,
                    max:100
                },
                present: {
                    required: true,
                    number: true,
                    min:0
                },
                contractName: {required: true}
            },
            messages: {
                contractCode: {required: '请输入合同号'},
                contractMoney: {required: '请输入合同总金额',number:'请输入正确的合同总金额',min:'请输入大于等于1合同总金额'},
                discount: {required: '请输入合同折扣比例',number:'请输入正确的合同折扣比例',min:'请输入大于等于1合同折扣比例',max:'请输入小于等于100合同折扣比例'},
                present: {required: '请输入合同配送比例',number:'请输入正确的合同配送比例',min:'请输入大于等于0配送比例'},
                contractName: {required: '请输入合同名称'}
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);
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
        var adCreativeOrderNames = AdCreativeFty.adCreativeOrderNames().then(function (response) {
            if(response){
                $scope.orderListSel.list = response.orderNames;
            }
        });
        var adMarkSelect = SysMarkFty.adMarkSelect({adMarkType:1}).then(function (res) {
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
                    UploadKeyFty.uploadKey().then(function (da) {
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
                        var fileType = adCreative.fileType;
                        var adCreativeType = advertising.adCreativeType;

                        var config = {
                            style: true,
                            size:sizes,
                            fileType:fileType,
                            style:true
                        };

                        var photoSrc;
                        if(fileType == 2){
                            var totalSeconds = adCreative.totalSeconds
                            var showTimeLimit = advertising.showTimeLimit
                            if(showTimeLimit < totalSeconds){
                                ycui.alert({
                                    content: "视频长度超过最大限制（视频总长"+ totalSeconds +"秒）",
                                    timeout: 10,
                                    error:true
                                });
                                than.reset();
                                return;
                            }
                            $scope.$apply(function(){
                                advertising.showTimeSeconds = totalSeconds;
                            })
                            photoSrc = adCreative.httpUrl;
                            config.src = photoSrc;
                        }else if(fileType == 0){
                            photoSrc = adCreative.fileHttpUrl;
                            config.src = photoSrc;
                        }

                        var object = document.querySelector("." + advertising.uploadId);
                        switch (+adCreativeType) {
                            case 2:
                                if(type == 'left'){
                                    advertising.fileHttpUrl = photoSrc;
                                    object = document.querySelector("." + advertising.leftId);
                                }else if(type == 'right'){
                                    config.size = sizes2;
                                    advertising.fileHttpUrl2 = photoSrc;
                                    object = document.querySelector("." + advertising.rightId);
                                }
                                advertising.fileMD5 = adCreative.fileMD5;
                                advertising.fileSize = adCreative.fileSize;
                                advertising.fileType = adCreative.fileType;
                                config.width = 130;
                                config.height = 180;
                                break;
                            default:
                                advertising.fileHttpUrl = photoSrc;
                                advertising.fileMD5 = adCreative.fileMD5;
                                advertising.fileSize = adCreative.fileSize;
                                advertising.fileType = adCreative.fileType;
                                config.width = 260;
                                config.height = 180;
                                break;
                        }

                        var html = showMaterials(config);
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
            AdCreativeFty.adSpaceNamesByOrderId({orderId: $scope.config.orderId}).then(function (response) {
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
            AdCreativeFty.adSpaceSizesByOrderId({orderId: $scope.config.orderId}).then(function (response) {
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
                    data.catagory = +catagorys[0];
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
                        var list = angular.copy($scope.adMarkSelect);
                        list.unshift({adMarkName:'无',id:0})
                        _da.adMarkSelectSel = {
                            list:list,
                            callback:function(e,d){
                                _da.adMarkArea = 3
                            }
                        };
                        _da.urlOrContent = 1;
                        _da.useLandingPage = 0;
                        _da.urlLoadType = 0;
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
                    if(!regUrl.test(li.landingPage) && li.useLandingPage == 0){
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
            AdCreativeFty.adCreativeUpload(body).then(function (response) {
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
        SysMarkFty.adMarkSelect({adMarkType:1}).then(function (res) {
            if(res && res.length > 0){
                adMarkSelect = res;
                adMarkSelect.unshift({adMarkName:'无',id:0})
            }
        });

        $scope.config = {
            adCreative:true,
            edit:true
        }
        ycui.loading.show();
        AdCreativeFty.adCreativeInfo({id: $scope.id}).then(function (res) {
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
                    height: data.height,
                    fileType:data.fileType
                };
                var html = showMaterials(config);
                object.innerHTML = "<div class='channel-object'>" + html + "</div>";
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
                if(adCreative.catagory == 2 || adCreative.catagory == 3)return;//等于1 类型 才会有图片显示
                switch (adCreative.adCreativeType){
                    case 2:
                        showPhoto({src:adCreative.fileHttpUrl,size:adCreative.size,width:130,height:180,uploadId:adCreative.leftId,fileType:adCreative.fileType});
                        showPhoto({src:adCreative.fileHttpUrl2,size:adCreative.size2,width:130,height:180,uploadId:adCreative.rightId,fileType:adCreative.fileType});
                        break;
                    case 3:
                    case 4:
                    case 5:
                        showPhoto({src:adCreative.fileHttpUrl,size:adCreative.size,width:260,height:180,uploadId:adCreative.uploadId,fileType:adCreative.fileType});
                        break;
                }
                lr();
            })
            $scope.advertising[0].advertisingList = [adCreative];
        });
















        // ycui.loading.show();
        // AdCreativeFty.adCreativeInfo({id: $scope.id}).then(function (data) {
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
                    if(!regUrl.test(li.landingPage) && li.useLandingPage == 0){
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
                    if(!regUrl.test(li.landingPage) && li.useLandingPage == 0){
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
                    if(!li.h5Content){
                        bo = true;
                    }
                    if(!regUrl.test(li.landingPage) && li.useLandingPage == 0){
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
            if(bo)return;
            delete li.updateTime;
            delete li.createTime;
            delete li.handler;
            delete li.sort;
            delete li.state;
            ycui.loading.show();
            AdCreativeFty.adCreativeUpdate(li).then(function (response) {
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
            //         AdCreativeFty.adCreativeUpdate(_body).then(function (response) {
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
/**
 * Created by moka on 16-6-21.
 */
app.controller('createListCtrl', ["$scope", "$http", "$location", "AdCreativeFty", "OrdersFty", "ResSizeFty", "$q", "SuperviseFty",'SysRuleUserFty','SysUserFty','UploadKeyFty',
    function ($scope, $http, $location, AdCreativeFty, OrdersFty, ResSizeFty, $q, SuperviseFty,SysRuleUserFty,SysUserFty,UploadKeyFty) {

        $scope.orderNameSel = {
            callback:function(e,d){
                if(d){
                    $scope.queryValue.orderName =  d.orderName;
                    $scope.queryValue.orderType = d.orderType;
                    $scope.query.orderId = d.id;
                }
            }
        };
        $scope.sizeSel = {};
        $scope.superviseSel = {
            list:[
                {name:'法规待监管',id:1},
                {name:'法规监管合格',id:2},
                {name:'法规监管不合格',id:3},
                {name:'创意待监管',id:4},
                {name:'创意监管合格',id:5},
                {name:'创意监管不合格',id:6},
                {name:'网络安全待监管',id:7},
                {name:'网络安全监管合格',id:8},
                {name:'网络安全监管不合格',id:9},
                {name:'监管合格',id:10},
                {name:'监管不合格',id:11},
            ]
        }
        $scope.showStateSel = {
            list:[
                {name:'待投放',id:'0'},
                {name:'投放中',id:'1'},
                {name:'已暂停',id:'2'},
                {name:'已结束',id:'3'},
                // {name:'已撤销',id:'4'},
                {name:'已作废',id:'5'}
                // {name:'已失效',id:'6'}
            ]
        }

        //订单
        var orderNamesForList = AdCreativeFty.orderNamesForList().then(function (response) {
            if (response && response.code == 200) {
                $scope.orderNameSel.list = response.orderNames;
            }
        });
        var sizeAllName = ResSizeFty.sizeAllName().then(function (response) {
            if (response && response.code == 200) {
                $scope.sizeSel.list = response.sizeList;
            }
        });

        ycui.loading.show();
        var modViewA = function (response) {
            ycui.loading.hide();
            if(!response){return}
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;

            $scope.items.forEach(function(item){
                var name = item.adCreativeName;
                var info = item.superviseInfo;
                var list = [
                    {type:1,name:'创意监管',stateName:superviseToName('creativeSupState',info.creativeSupState),time:info.creativeSupTime,remake:info.creativeSupRemark,state:info.creativeSupState},
                    {type:2,name:'法规监管',stateName:superviseToName('materialSupState',info.materialSupState),time:info.materialSupTime,remake:info.materialSupRemark,state:info.materialSupState},
                    {type:3,name:'网络安全监管',stateName:superviseToName('securitySupState',info.securitySupState),time:info.securitySupTime,remake:info.securitySupRemark,state:info.securitySupState}
                ];
                item.superviseInfoList = list;
                item.superviseInfoTitle = '';
                list.forEach(function(da){
                    var stateStr = '待监管';
                    var dateStr;
                    if(da.state == -1){
                        stateStr = '不合格'
                    }else if(da.state == 1){
                        stateStr = '合格'
                    }
                    //2016-11-28创意监管：不合格；备注：11111
                    if(da.time){
                        dateStr = new Date(da.time).dateFormat('yyyy-MM-dd HH:mm:ss')
                    }
                    var str = '';
                    dateStr && (str += dateStr);
                    str += da.name + ':' + stateStr;
                    da.remake && (str += '；备注：' + da.remake);

                    item.superviseInfoTitle += str + '\n'
                })
            })
        };

        function superviseToName(name,state){
            switch(name){
                case 'creativeSupState':
                    switch(state){
                        case 0:
                        return '创意待监管';
                        case 1:
                        return '创意监管合格';
                        case -1:
                        return '创意监管不合格';
                    }
                break;
                case 'materialSupState':
                    switch(state){
                        case 0:
                        return '法规待监管';
                        case 1:
                        return '法规监管合格';
                        case -1:
                        return '法规监管不合格';
                    }
                break;
                case 'securitySupState':
                    switch(state){
                        case 0:
                        return '网络安全待监管';
                        case 1:
                        return '网络安全监管合格';
                        case -1:
                        return '网络安全监管不合格';
                    }
                break;
            }
        }

        var getDataCount = function (response) {
            if (response && response.code == 200) {
                $scope.clickAll = response.clickAll;
                $scope.pvAll = response.pvAll;
            }
        };

        $scope.query = {};
        $scope.queryValue = {};
        $scope.query.startTime = getDateFormat();
        $scope.query.endTime = getDateFormat();
        $scope.query.pageSize = 10;

        //判断地址里面有没有id值
        var search = getUrlSearch($location.absUrl());
        var id = search.orderId;
        $scope.queryValue.orderName = search.orderName;
        $scope.queryValue.orderType = search.orderType;
        $scope.query.orderId = id;
        
        AdCreativeFty.adCreativeList($scope.query).then(modViewA)
        AdCreativeFty.adCreativeDataCount($scope.query).then(getDataCount);

        $scope.$on('createListGroup',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            AdCreativeFty.adCreativeList($scope.query).then(modViewA)
            AdCreativeFty.adCreativeDataCount($scope.query).then(getDataCount);
        })

        /*搜索框*/
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.adCreativeName = $scope.query.search;
            AdCreativeFty.adCreativeList($scope.query).then(modViewA);
            AdCreativeFty.adCreativeDataCount($scope.query).then(getDataCount);
        };


        $scope.showIconState = function (event) {
            $(event.target).next().css("display", "inline-block")
        };
        $scope.hideIconState = function (event) {
            $(event.target.parentNode).find("i:eq(1)").hide();
        };

        //点击的时候获取接口
        $scope.changeState = function (id, state) {
            var queryApi = { id: id, showState: state };
            ycui.loading.show();
            AdCreativeFty.adCreativeUpState(queryApi).then(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    AdCreativeFty.adCreativeList($scope.query).then(modViewA);
                    AdCreativeFty.adCreativeDataCount($scope.query).then(getDataCount);
                }
            })
        };

        $scope.$on('loginUserInfo',function () {
            SysUserFty.userInfo({id: $scope.$parent.user.id}).then(function (res) {
                if (res) {
                    $scope.$user = res;
                }
            })
        });


        //创意监管
        var affcheAddUpload2;
        $scope.doSupervise = function (items) {
            $scope._superviseModule = {
                creativeSupState: 1,
                publishRange:0,
                isAddaffche:0,
                uploadId:'affcheAddUpload2'
            };

            $scope._superviseModule.items = items;

            var superviseList = $scope._superviseModule.superviseList = [];
            var rule = $scope.$parent.putManageRule;

            //监管筛选
            rule['SuperviseCreative'] && items.superviseInfo.creativeSupState == 0 && (superviseList.push(rule['SuperviseCreative']));
            rule['SuperviseMaterial'] && items.superviseInfo.materialSupState == 0 && (superviseList.push(rule['SuperviseMaterial']));
            rule['SuperviseNetworkSecurity'] && items.superviseInfo.securitySupState == 0 && (superviseList.push(rule['SuperviseNetworkSecurity']));
            
            //公告
            $scope._superviseModule.roleList = $scope.$user.roleList;
            $scope._superviseModule.publishUserId = $scope.$user.id;
            $scope._superviseModule.publishRoleId = $scope.$user.roleList[0].id;
            $scope._superviseModule.publishUser = $scope.$user.trueName;

            //上传
            $scope._superviseModule.change = function(num){
                if(num == 1){
                    affcheAddUpload2 && (affcheAddUpload2.destroy());
                    affcheAddUpload2 = upload($scope._superviseModule)
                }
            }

            //角标
            if(items.adMarkId){
                var getAdMark = AdCreativeFty.getAdMark({ id: items.adMarkId }).then(function (res) {
                    if (res) {
                        items.adMarkUrl = res.adMarkUrl;
                    }
                })
                $q.all([getAdMark]).then(function () {
                    superviseList.length > 0 && doSuperviseFun()
                })
            }else{
                superviseList.length > 0 && doSuperviseFun()
            }

            function doSuperviseFun(){
                var content = '#superviseModule';
                document.querySelector(content).innerHTML = '';
                var html = previewCreative(items,content);
                var type = typeof html;
                if(type == 'string'){
                    $scope._superviseModule.previewPhoto = html;
                }

                superviseList[0] && ($scope._superviseModule.checkSupervise = superviseList[0].verify);

                $scope.superviseModule = {
                    title: '【' + items.adCreativeName + '】监管',
                    okClick: function () {
                        var key = $scope._superviseModule.checkSupervise;
                        var state = $scope._superviseModule.creativeSupState;
                        var remark = $scope._superviseModule.creativeSupRemark;

                        var title = $scope._superviseModule.title;
                        var content = $scope._superviseModule.content;
                        var publishRange = $scope._superviseModule.publishRange;
                        var publishUserId = $scope._superviseModule.publishUserId;
                        var publishRoleId = $scope._superviseModule.publishRoleId;

                        var notice = {
                            title:title,
                            content:content,
                            publishRange:publishRange,
                            publishUserId:publishUserId,
                            publishRoleId:publishRoleId,
                        }
                        var body = {
                            creativeId: items.id,
                        }

                        if(state == -1){
                            this.$valid = true;
                            body.notice = notice;
                            if(!notice.title || !notice.content || !remark){
                                return true;
                            }
                        }

                        var httpPost;
                        switch (key) {
                            case 'SuperviseCreative':
                                body.creativeSupState = state;
                                remark && (body.creativeSupRemark = remark);
                                httpPost = SuperviseFty.creative(body)
                                break;
                            case 'SuperviseMaterial':
                                body.materialSupState = state;
                                remark && (body.materialSupRemark = remark);
                                httpPost = SuperviseFty.material(body)
                                break;
                            case 'SuperviseNetworkSecurity':
                                body.securitySupState = state;
                                remark && (body.securitySupRemark = remark);
                                httpPost = SuperviseFty.security(body)
                                break;
                            default:
                                break;
                        }
                        if (!httpPost) {
                            return true;
                        }
                        httpPost.then(function (res) {
                            if (res && res.code == 200) {
                                ycui.alert({
                                    content: res.msg,
                                    timeout: 10,
                                    okclick:function () {
                                        AdCreativeFty.adCreativeList($scope.query).then(modViewA);
                                    }
                                })
                            }
                        })
                    },
                    noClick: function () {

                    }
                }
            }
            
        }

        function previewCreative(items,content) {
            var url = items.fileHttpUrl;
            var url2 = items.fileHttpUrl2;
            var type = items.adCreativeType;
            var typeId = items.adSpaceTypeId;
            var size = items.size;
            var size2 = items.size2;
            var wh = size.split("*");
            var landingPage = items.landingPage;
            var html = "";
            var adMarkUrl = items.adMarkUrl;
            var adMarkArea = items.adMarkArea;
            var catagory = items.catagory;
            var urlOrContent = items.urlOrContent;
            var fileType = items.fileType;

            switch(+catagory){
                case 1:
                switch (type) {
                    case 2:
                        var wh2 = size2.split("*");
                        if (typeId == 11) {
                            html += showMaterials({
                                src: url,
                                width: 200,
                                height: 200,
                                size: wh,
                                landingPage: landingPage,
                                adMarkUrl: adMarkUrl,
                                fileType: fileType,
                                adMarkArea: adMarkArea
                            }, { src: url2, width: 200, height: 200, size: wh2, landingPage: landingPage,fileType: fileType,adMarkUrl: adMarkUrl,adMarkArea: adMarkArea });
                        } else {
                            if (url != undefined) {
                                html += showMaterials({
                                    src: url,
                                    width: 200,
                                    height: 200,
                                    size: wh,
                                    landingPage: landingPage,
                                    adMarkUrl: adMarkUrl,
                                    fileType: fileType,
                                    adMarkArea: adMarkArea
                                });
                            }
                            if (url2 != undefined) {
                                html += showMaterials({
                                    src: url2,
                                    width: 200,
                                    height: 200,
                                    size: wh2,
                                    landingPage: landingPage,
                                    adMarkUrl: adMarkUrl,
                                    fileType: fileType,
                                    adMarkArea: adMarkArea
                                });
                            }
                        }
                        break;
                    case 3:
                        if (url != undefined) {
                            html += showMaterials({
                                src: url,
                                width: 200,
                                height: 200,
                                size: wh,
                                landingPage: landingPage,
                                adMarkUrl: adMarkUrl,
                                fileType: fileType,
                                adMarkArea: adMarkArea
                            });
                        }
                        break;
                    case 4:
                        if (url != undefined) {
                            html += showMaterials({
                                src: url,
                                width: 200,
                                height: 200,
                                size: wh,
                                landingPage: landingPage,
                                adMarkUrl: adMarkUrl,
                                fileType: fileType,
                                adMarkArea: adMarkArea
                            });
                        }
                        break;
                    case 5:
                        if (url != undefined) {
                            html += showMaterials({
                                src: url,
                                width: 200,
                                height: 200,
                                size: wh,
                                landingPage: landingPage,
                                adMarkUrl: adMarkUrl,
                                fileType: fileType,
                                adMarkArea: adMarkArea
                            });
                        }
                        break;
                    default:
                        break;
                }
                return html;
                case 2:
                return createIframe('js',urlOrContent,items.jsCode,wh);
                case 3:
                return createIframe('h5',urlOrContent,items.h5Content,wh);
            }

            function createIframe(name,type,code,size){
                var $iframe = document.createElement('iframe');
                $iframe.allowTransparency = 'true';
                $iframe.allowScriptsToClose = true;
                $iframe.allowsUntrusted = true;
                $iframe.frameBorder = 0;
                $iframe.scrolling = 'no';
                $iframe.style.cssText = "width:"+ size[0] +"px;height:"+ size[1] +"px;";
                document.querySelector(content).appendChild($iframe);
                var script = '<script src="${code}"></script>';
                switch (name){
                    case 'js':
                        if(type == 1){
                            code = script.replace("${code}",code);
                        }
                        var u = getHtml(code);
                        $iframe.contentWindow.name = u;
                        $iframe.src = 'javascript:void(~function(l){l.open();l.write(self.name);l.close()}(document))';
                        break;
                    case 'h5':
                        if(type == 1){
                            $iframe.src = decodeURIComponent(code);
                        }else{
                            var u = getHtml(code);
                            $iframe.contentWindow.name = u;
                            $iframe.src = 'javascript:void(~function(l){l.open();l.write(self.name);l.close()}(document))';
                        }
                        break;
                }
                return $iframe;
                function getHtml(code) {
                    return ['<html><head><style>*{margin:0;padding:0;border:0}body,html{background-color:transparent;overflow:hidden;width:100%;height:100%}a{cursor:pointer;text-decoration:none;outline:none;hide-focus:expression(this.hideFocus=true);box-sizing:border-box;-moz-box-sizing:border-box;-ms-box-sizing:border-box;-o-box-sizing:border-box;-webkit-box-sizing:border-box;overflow:hidden}</style></head><body oncontextmenu="return false">',
                        '</body></html>'].join(decodeURIComponent(code || ""));
                }
            }
        }

        $scope.showPhoto = function (data) {
            var name = data.adCreativeName;
            $scope._showPhotoModule = data;
            function showPhotoFun(){
                var content  = '#showPhotoModule';
                document.querySelector(content).innerHTML = '';
                var html = previewCreative(data,content);
                var type = typeof html;
                if(type == 'string'){
                    $scope._showPhotoModule.$html = html;
                }
            }
            //获取角标地址
            if(data.adMarkId){
                ycui.loading.show();
                var getAdMark = AdCreativeFty.getAdMark({ id: data.adMarkId }).then(function (res) {
                    ycui.loading.hide();
                    if (res) {
                        data.adMarkUrl = res.adMarkUrl;
                    }
                })
                $q.all([getAdMark]).then(function () {
                    showPhotoFun()
                })
            }else{
                showPhotoFun()
            }
            $scope.showPhotoModule = {
                title:"【" + name + "】创意预览",
                okClick:function () {

                },
                noClick:function () {

                }
            }
        }

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

        //批量操作接口：删除（含单个）、暂停、投放
        $scope.setMore = function (n) {
            if(!$scope.items){
                ycui.alert({
                    content: "请至少选择一个",
                    timeout:10
                });
                return;
            }
            var arrId = [];
            for (var i = 0; i < $scope.items.length; i++) {
                var data = $scope.items[i];
                if (data.$check) {
                    arrId.push({
                        adCreativeName:data.adSpaceName,
                        id:data.id
                    })
                }
            }
            if (arrId.length == 0) {
                ycui.alert({
                    content: "请至少选择一个",
                    timeout:10
                });
            } else {
                if (n == 3) { //投放
                    ycui.confirm({
                        content: '请确认，您将批量投放所选择的创意',
                        okclick: function () {
                            AdCreativeFty.adCreativeBatchOpt({
                                orderAdCreativeList: arrId,
                                type: 3
                            }).then(function (response) {
                                if (response.code == 200) {
                                    ycui.alert({
                                        content: response.msg,
                                        timeout: -1,
                                        okclick: function () {
                                            AdCreativeFty.adCreativeList($scope.query).then(modViewA);
                                        }
                                    });
                                } else if (response.code == 203) {
                                    var array = []
                                    response.cannotList.forEach(function (data) {
                                        array.push(data.adCreativeName)
                                    })
                                    ycui.alert({
                                        content: array.join(",") + ",创意投放结束，无法修改状态",
                                        okclick: function () {
                                            AdCreativeFty.adCreativeList($scope.query).then(modViewA);
                                        },
                                        timeout: -1
                                    });
                                }
                            })
                        }
                    })
                } else if (n == 2) {
                    ycui.confirm({
                        content: '请确认，您将批量暂停所选择的创意',
                        okclick: function () {
                            AdCreativeFty.adCreativeBatchOpt({
                                orderAdCreativeList: arrId,
                                type: 2
                            }).then(function (response) {
                                if (response.code == 200) {
                                    ycui.alert({
                                        content: response.msg,
                                        timeout: -1,
                                        okclick: function () {
                                            AdCreativeFty.adCreativeList($scope.query).then(modViewA);
                                        }
                                    });
                                } else if (response.code == 202) {
                                    var array = []
                                    response.cannotList.forEach(function (data) {
                                        array.push(data.adCreativeName)
                                    })
                                    ycui.alert({
                                        content: array.join(",") + ",创意投放结束，无法修改状态",
                                        okclick: function () {
                                            AdCreativeFty.adCreativeList($scope.query).then(modViewA);
                                        },
                                        timeout: -1
                                    });
                                }
                            })
                        }
                    })
                }
            }
        };

        var upload = function (ob) {
            var key = '';
            var config = {
                server: fileUrl + "/contract/uploadNotice.htm",
                pick: {
                    id: '#'+ ob.uploadId,
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
                    UploadKeyFty.uploadKey().then(function (da) {
                        key = da.items;
                        uploader.upload(file);
                    });
                },
                uploadBeforeSend:function (uploader, file, data) {
                    data.uploadKey = key;
                },
                uploadSuccess:function (uploader, file, res) {
                    if(res && res.uploadFile){
                        $scope.$apply(function(){
                            ob.noticeAttachment = res.uploadFile;
                        })
                    }
                }
            }
            return uploadInit(config);
        };

        // 作废
        var affcheAddUpload;
        $scope.deleList = function(id, name){
            if(name){
                name = '【'+ name +'】'
            }else{
                name = '批量'
            }
            var arrList = [];
            if(id){
                arrList.push({ "adCreativeName": name, "id": id });
            }else{
                for (var i = 0; i < $scope.items.length; i++) {
                    var data = $scope.items[i];
                    if (data.$check) {
                        arrList.push({
                            adCreativeName:data.adSpaceName,
                            id:data.id
                        })
                    }
                }
            }
            if (arrList.length == 0) {
                ycui.alert({
                    content: "请至少选择一个",
                    timeout:10
                });
                return;
            }

            $scope._deleListModule  = {publishRange:0,isAddaffche:0,uploadId:'affcheAddUpload'};
            //判断是否有公告管理权限
            var haveAddAffcheRule = SysRuleUserFty.getUserRightsByParentId({rightsParentId: 5}).then(function (res) {
                $scope._deleListModule.haveAddAffcheRule = false;
                if(res && res.items){
                    res.items.forEach(function(data){
                        if(data.verify == 'ManageNotice'){
                            $scope._deleListModule.haveAddAffcheRule = true;
                        }
                    })
                }
            });

            $scope._deleListModule.roleList = $scope.$user.roleList;
            $scope._deleListModule.publishUserId = $scope.$user.id;
            $scope._deleListModule.publishRoleId = $scope.$user.roleList[0].id;
            $scope._deleListModule.publishUser = $scope.$user.trueName;

            $scope._deleListModule.change = function(num){
                if(num == 1){
                    affcheAddUpload && (affcheAddUpload.destroy());
                    affcheAddUpload = upload($scope._deleListModule)
                }
            }

            $q.all([haveAddAffcheRule]).then(function(){
                $scope.deleListModule = {
                    title: name + '作废',
                    okClick:function(){
                        var title = $scope._deleListModule.title;
                        var content = $scope._deleListModule.content;
                        var publishRange = $scope._deleListModule.publishRange;
                        var publishUserId = $scope._deleListModule.publishUserId;
                        var publishRoleId = $scope._deleListModule.publishRoleId;
                        var body = {
                            orderAdCreativeList:arrList,
                            type:1,
                            notice:{
                                title:title,
                                content:content,
                                publishRange:publishRange,
                                publishUserId:publishUserId,
                                publishRoleId:publishRoleId
                            }
                        }
                        if($scope._deleListModule.isAddaffche == 1 && (!title || !content)){
                            $scope._deleListModule.$valid = true;
                            return true;
                        }
                        $scope._deleListModule.noticeAttachment && (body.notice.noticeAttachment = $scope._deleListModule.noticeAttachment);
                        AdCreativeFty.adCreativeBatchOpt(body).then(function(response){
                            if (response.code == 200) {
                                ycui.alert({
                                    content: response.msg,
                                    timeout: -1,
                                    okclick: function () {
                                        AdCreativeFty.adCreativeList($scope.query).then(modViewA);
                                    }
                                });
                            } else if (response.code == 201) {
                                if (response.canNotDelList.length > 0 && response.delList.length == 0) {
                                    ycui.alert({
                                        error:true,
                                        content: response.canNotDelList.join(",") + "已有投放数据,不能作废",
                                        timeout: 10
                                    });
                                } else if (response.canNotDelList.length > 0 && response.delList.length > 0) {
                                    ycui.alert({
                                        content: response.delList.join(",") + "作废成功" + response.canNotDelList.join(",") + "已有投放数据,不能作废",
                                        okclick: function () {
                                            AdCreativeFty.adCreativeList($scope.query).then(modViewA);
                                        },
                                        timeout: 10
                                    });
                                } else {
                                    ycui.alert({
                                        content: "作废成功",
                                        okclick: function () {
                                            AdCreativeFty.adCreativeList($scope.query).then(modViewA);
                                        },
                                        timeout: 10
                                    });
                                }
                            }
                         })
                    },
                    noClick:function(){}
                }
            })

        }

        var dateRange = new pickerDateRange('clientAff', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            startDate: $scope.query.startTime,
            endDate: $scope.query.endTime,
            calendars: 2,
            inputTrigger: 'dateRange',
            success: function (obj) {
                $scope.query.startTime = obj.startDate;
                $scope.query.endTime = obj.endDate;
                $scope.query.pageIndex = 1;
                AdCreativeFty.adCreativeList($scope.query).then(modViewA);
                AdCreativeFty.adCreativeDataCount($scope.query).then(getDataCount);
            }
        });



        $scope.superviseInfo = function(item){
            var name = item.adCreativeName;
            var info = item.superviseInfo;
            var list = [
                {stateName:superviseToName('creativeSupState',info.creativeSupState),time:info.creativeSupTime,remake:info.creativeSupRemark,state:info.creativeSupState},
                {stateName:superviseToName('materialSupState',info.materialSupState),time:info.materialSupTime,remake:info.materialSupRemark,state:info.materialSupState},
                {stateName:superviseToName('securitySupState',info.securitySupState),time:info.securitySupTime,remake:info.securitySupRemark,state:info.securitySupState}
            ];
            $scope._superviseInfoModule = {list:list};
            $scope.superviseInfoModule = {
                title:'【'+ name +'】监管状态',
                okClick:function () {}
            };
        }

        /**
         * 新增创意跳转控制
         * @param id
         */
        $scope.goCreateAd = function (id) {
            var hash = 'ViewPutOrderCreateAdd'
            if(id == undefined){
                goRoute(hash);
            }else{
                OrdersFty.orderDetail({ id: id }).then(function (res) {
                    if (res && res.code == 200) {
                        if (res.orders.orderType == 1 || res.orders.showState == 5) {
                            ycui.alert({
                                error:true,
                                content: '预定广告位或者已作废的订单不能新建创意',
                                timeout: 10
                            })
                        } else {
                            var data = {
                                orderAutoId:res.orders.id,
                                orderAutoName:res.orders.orderName,
                                orderAutoType:res.orders.orderType
                            }
                            goRoute(hash,data);
                        }
                    }
                })
            }
        }
    }
]);

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

    $http.post(baseUrl + '/holiday/getMonthHolidays.htm',{months:year},configJson).then(getMonthHolidays);

    
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
        $http.post(baseUrl + '/holiday/editHolidays.htm',form,configJson).then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    timeout:10,
                    okclick:function () {
                        $http.post(baseUrl + '/holiday/getMonthHolidays.htm',{months:year},configJson).then(getMonthHolidays);
                    }
                })
            }
        })
    }

}]);
/**
 * Created by moka on 16-6-21.
 */
app.directive("originalityBox", [
    function () {
        var html = "<div ng-init='updateCreative = !data.orderId' class='yc-compile-section clear' ng-if='data.advertisingShow'><div class='yc-col-2 yc-col-2-max'></div><div class='upload-adCreative yc-col-10'><div class='upload-adCreative-top'><span ng-hide='data.useSizeShow'>【广告位】<span ng-style='titleStyle' ng-bind='data.adSpaceName'></span></span><span>【尺寸】<span ng-style='titleStyle'>{{data.adSpaceTypeId == 9?(data.size + ' ' + data.size2):data.size}}</span></span><span ng-hide='data.useSizeShow'>【创意类型】<span ng-style='titleStyle' ng-bind='data.adSpaceTypeName'></span></span></div><div class='upload-adCreative-body clear'><div class='upload-adCreative-title'><p>请上传创意：</p> </div><div class='upload-adCreative-add'>" +
            " <adver-words data='data'></adver-words> " +
            " <adver-couplet data='data'></adver-couplet> " +
            " <adver-channel data='data'></adver-channel> " +
            " <adver-channel-in data='data'></adver-channel-in> " +
            " <adver-channel-in2 data='data'></adver-channel-in2> " +
            "<div ng-show='updateCreative' class='adCreative-add'><i ng-click='adCreative()' class='yc-icon'>&#xe644;</i></div></div></div></div></div>";

        var uploadInit = function (id) {
            var config = {
                swf: baseUrl + "/static/lib/Uploader.swf",
                server: fileUrl + "/orderAdCreative/upload.htm",
                pick: {
                    id: id,
                    multiple: false
                },
                fileVal: "uploadFile",
                accept: {
                    extensions: 'gif,jpg,jpeg,bmp,png,swf',
                    mimeTypes: 'image/*,application/x-shockwave-flash'
                }
            };
            var uploader = WebUploader.create(config);
            uploader.on('error', function (err) {
                ycui.alert({
                    content: "错误的文件类型",
                    timeout: 10,
                    error:true
                });
                ycui.loading.hide();
                uploader.reset();
            })

            uploader.on('uploadComplete', function () {
                ycui.loading.hide();
            })
            return uploader
        };
        var getId = function () {
            return "ad" + new Date().getTime() + Math.floor(Math.random() * 1000);
        };
        return {
            restrict: "E",
            template: html,
            controller: function () {
                /*图片上传*/
                this.uploadInit = uploadInit;
                /*获取随机ID*/
                this.getId = getId;
            },
            scope: {
                data: "="
            },
            compile: function () {
                return {
                    pre: function preLink(scope) {
                    },
                    post: function postLink(scope) {
                        //标题字体颜色
                        scope.titleStyle = {color: "red"};
                        // console.info(scope.data.adCreativeType);
                        switch (scope.data.adCreativeType) {
                            case 1:
                                scope.adCreative = function () {
                                    scope.data.advertising1.push({
                                        size: scope.data.size,
                                        fileSizeLimit: scope.data.fileSize,
                                        adSpaceId: scope.data.id,
                                        adCreativeType: scope.data.adCreativeType,
                                        fileType: 3
                                    });
                                }
                                break;
                            case 2:
                                scope.adCreative = function () {
                                    scope.data.advertising2.push({
                                        size: scope.data.size,
                                        size2: scope.data.size2,
                                        fileSizeLimit: scope.data.fileSize,
                                        adSpaceId: scope.data.id,
                                        adCreativeType: scope.data.adCreativeType,
                                        adSpaceTypeId: scope.data.adSpaceTypeId,
                                        leftId: getId(),
                                        rightId: getId()
                                    });
                                };
                                break;
                            case 3:
                                scope.adCreative = function () {
                                    scope.data.advertising3.push({
                                        size: scope.data.size,
                                        fileSizeLimit: scope.data.fileSize,
                                        adSpaceId: scope.data.id,
                                        adCreativeType: scope.data.adCreativeType,
                                        uploadId: getId()
                                    });
                                }
                                break;
                            case 4:
                                scope.adCreative = function () {
                                    scope.data.advertising4.push({
                                        size: scope.data.size,
                                        fileSizeLimit: scope.data.fileSize,
                                        adSpaceId: scope.data.id,
                                        adCreativeType: scope.data.adCreativeType,
                                        uploadId: getId()
                                    });
                                };
                                break;
                            case 5:
                                scope.adCreative = function () {
                                    scope.data.advertising5.push({
                                        size: scope.data.size,
                                        fileSizeLimit: scope.data.fileSize,
                                        adSpaceId: scope.data.id,
                                        adCreativeType: scope.data.adCreativeType,
                                        uploadId: getId()
                                    });
                                };
                                break;
                            default :
                                break;
                        }
                    }
                }
            }
        }
    }]);

app.directive("adverWords", ["$timeout",
    function ($timeout) {
        var html = "<div ng-repeat='data in data.advertising1'><div ng-if='closeBo' class='adCreative-box'> <input class='adverCouplet' ng-model='data.adCreativeName'  type='text' placeholder='请输入创意名称' ng-class='{\"redBorder\":!data.adCreativeName && data.adCreativeNameValid}' ng-keyup='data.adCreativeNameValid = true'> <div class='adCreative-box-words'> <div class='size' ng-bind='data.size'></div><div class='span'></div>  </div> <div class='maxlengthInput'><textarea class='adCreativeTitle' ng-model='data.adCreativeTitle' placeholder='请输入文字链内容' maxlength='30' ng-class='{\"redBorder\":!data.adCreativeTitle && data.adCreativeTitleValid}' ng-keyup='data.adCreativeTitleValid = true'></textarea><span class='textareaLength'></span></div>  <div ng-click='clodeBox($index)' ng-show='$index > 0' class='close'><i class='yc-icon'>&#xe643;</i></div>  <div class='landing-page'><div>*落地页：</div><div><textarea ng-model='data.landingPage' placeholder='请输入落地页地址' ng-class='{\"redBorder\":!regUrl.test(data.landingPage) && data.landingPageValid}' ng-keyup='data.landingPageValid = true'></textarea></div></div>  </div> </div>";
        return {
            restrict: "AE",
            template: html,
            require: "^?originalityBox",
            scope: {
                data: "="
            },
            transclude: true,
            compile: function () {
                return {
                    pre: function (scope, element) {
                        scope.regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
                        if (scope.data.adCreativeType != 1)return;
                        scope.$watch('data.advertising1.length', function (newValue, oldValue) {
                            if (newValue >= oldValue) {
                                $timeout(function () {
                                    
                                    var textarea = element[0].getElementsByClassName("adCreativeTitle");
                                    var span = element[0].getElementsByClassName("textareaLength");
                                    var maxlength = angular.element(textarea[newValue - 1]).attr("maxlength");
                                    var length = angular.element(textarea).val().length;
                                    span[newValue - 1].innerText = (length || 0) + "/" + maxlength;
                                    angular.element(textarea[newValue - 1]).bind("input", function (event) {
                                        angular.element(event.target).next().text(event.target.value.length + "/" + maxlength)
                                    })
                                }, 20)
                            }
                        })
                    },
                    post: function (scope, element, iAttrs, controller) {
                        if (scope.data.adCreativeType != 1)return;
                        scope.closeBo = true;
                        if (scope.data.advertising1 && scope.data.advertising1[0].orderId) {
                            if (scope.data.advertising1[0].lawCheckState == 1 && scope.data.advertising1[0].artCheckState == 1) {
                                delete scope.data.advertising1[0].uploadId
                            }
                            if (scope.data.advertising1[0].lawCheckState == 1 && scope.data.advertising1[0].artCheckState == 0) {
                                delete scope.data.advertising1[0].uploadId
                            }
                        } else {
                            scope.data.advertising1 = []
                            scope.data.advertising1.push({
                                size: scope.data.size,
                                adSpaceId: scope.data.id,
                                adCreativeType: scope.data.adCreativeType,
                                fileType: 3
                            });
                        }
                        scope.clodeBox = function (index) {
                            scope.data.advertising1.splice(index, 1)
                        }
                    }
                }
            }
        }
    }]);

app.directive("adverCouplet", ["$timeout", "UploadKeyFty",
    function ($timeout, UploadKeyFty) {
        var html = "<div ng-repeat='data in data.advertising2'><div ng-if='closeBo' class='adCreative-box'> <input class='adverCouplet' ng-model='data.adCreativeName' type='text' placeholder='请输入创意名称' ng-class='{\"redBorder\":!data.adCreativeName && data.adCreativeNameValid}' ng-keyup='data.adCreativeNameValid = true'> <div class='adCreative-box-couplet'> <div class='couplet-header'> <p class='size' ng-bind='data.size'></p><p ng-if='data.adSpaceTypeId == 9' class='size' ng-bind='data.size2'></p> <p class='prompt'></p> </div> <div class='couplet-body'> <div class='couplet-uploading'> <span ng-if='data.adSpaceTypeId == 11'>左侧待传</span><div ng-show='data.leftId' class='couplet-uploading-btn' id='{{data.leftId}}'> 选择文件 </div> </div> <div class='couplet-uploading'> <span ng-if='data.adSpaceTypeId == 11'>右侧待传</span><div ng-show='data.rightId' class='couplet-uploading-btn' id='{{data.rightId}}'> 选择文件 </div> </div> </div> </div> <div ng-click='clodeBox($index)' ng-show='$index > 0' class='close'><i class='yc-icon'>&#xe643;</i></div>  <div class='landing-page'><div>*落地页：</div><div><textarea name='landingPage' ng-model='data.landingPage' placeholder='请输入落地页地址' ng-class='{\"redBorder\":!regUrl.test(data.landingPage) && data.landingPageValid}' ng-keyup='data.landingPageValid = true'></textarea></div></div>  </div></div>";
        return {
            restrict: "AE",
            template: html,
            require: "^?originalityBox",
            scope: {
                data: "="
            },
            transclude: true,
            compile: function () {
                return {
                    pre: function preLink(scope) {
                        scope.regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
                    },
                    post: function postLink(scope, element, iAttrs, controller) {
                        if (scope.data.adCreativeType != 2)return;
                        scope.closeBo = true;
                        var wh = scope.data.size.split("*");
                        if (!scope.data.size2) {
                            scope.data.size2 = scope.data.size;
                        }
                        var wh2 = scope.data.size2.split("*");
                        if (scope.data.advertising2 && scope.data.advertising2[0].orderId) {
                            var htmlLeft = photoAndSwfPreview({
                                src: scope.data.advertising2[0].fileHttpUrl,
                                width: 115,
                                height: 210,
                                size: wh,
                                style: true
                            })
                            if (!scope.data.advertising2[0].fileHttpUrl2) {
                                scope.data.advertising2[0].fileHttpUrl2 = scope.data.advertising2[0].fileHttpUrl;
                            }
                            var htmlRight = photoAndSwfPreview({
                                src: scope.data.advertising2[0].fileHttpUrl2,
                                width: 115,
                                height: 210,
                                size: wh2,
                                style: true
                            })
                            $timeout(function () {
                                var uploadHtmlLeft = angular.element(element)[0].querySelector("#" + scope.data.advertising2[0].leftId)
                                var uploadHtmlRight = angular.element(element)[0].querySelector("#" + scope.data.advertising2[0].rightId)
                                angular.element(uploadHtmlLeft).after("<div class='channel-object'>" + htmlLeft + "</div>");
                                angular.element(uploadHtmlRight).after("<div class='channel-object'>" + htmlRight + "</div>");

                                delete scope.data.advertising2[0].leftId
                                delete scope.data.advertising2[0].rightId

                                scope.disabled = true;
                                
                            }, 100)

                        } else {
                            scope.data.advertising2 = []
                            scope.data.advertising2.push({
                                size: scope.data.size,
                                size2: scope.data.size2,
                                fileSizeLimit: scope.data.fileSize,
                                adSpaceId: scope.data.id,
                                adCreativeType: scope.data.adCreativeType,
                                adSpaceTypeId: scope.data.adSpaceTypeId,
                                leftId: controller.getId(),
                                rightId: controller.getId()
                            });
                        }

                        scope.$watch("data.advertising2.length", function (newValue, oldValue, scope) {
                            if (newValue < oldValue)return;
                            var advertising2 = scope.data.advertising2;
                            setTimeout(function () {
                                var index = advertising2.length - 1;
                                var keyleft = "";
                                var uploaderleft = controller.uploadInit("#" + advertising2[index].leftId)
                                    .on('beforeFileQueued', function (file) {
                                        ycui.loading.show();
                                        uploaderleft.stop(file);
                                        UploadKeyFty.uploadKey().then(function (da) {
                                            keyleft = da.items;
                                            uploaderleft.upload(file);
                                        });
                                    })
                                    .on('uploadBeforeSend', function (ob, data) {
                                        data.uploadKey = keyleft;
                                        if (scope.data.size) {
                                            var sizes = scope.data.size.split('*');
                                            data.width = sizes[0];
                                            data.height = sizes[1];
                                        }
                                        data.fileSize = advertising2[index].fileSizeLimit
                                    })
                                    .on('uploadSuccess', function (file, res) {
                                        if (res && res.code == 200) {
                                            var adCreative = res.adCreative;
                                            advertising2[index].fileHttpUrl = adCreative.fileHttpUrl;
                                            advertising2[index].fileMD5 = adCreative.fileMD5;
                                            advertising2[index].fileSize = adCreative.fileSize;
                                            advertising2[index].fileType = adCreative.fileType;
                                            var object = angular.element(element)[0].querySelector("#" + advertising2[index].leftId);
                                            var div = object.parentNode.querySelector(".channel-object");
                                            if (div) {
                                                div.parentNode.removeChild(div);
                                            }
                                            var html = photoAndSwfPreview({
                                                src: adCreative.fileHttpUrl,
                                                width: 115,
                                                height: 210,
                                                size: wh,
                                                style: true
                                            })
                                            angular.element(object).after("<div class='channel-object'>" + html + "</div>");
                                            uploaderleft.reset();
                                        } else if (res._raw == "false") {
                                            ycui.alert({
                                                content: "不正确的操作",
                                                timeout: 10,
                                                error:true
                                            })
                                            uploaderleft.reset();
                                        } else {
                                            ycui.alert({
                                                content: res.msg,
                                                timeout: 10,
                                                error:true
                                            })
                                            uploaderleft.reset();
                                        }

                                    });
                                var keyright = "";
                                var uploaderRight = controller.uploadInit("#" + advertising2[index].rightId)
                                    .on('beforeFileQueued', function (file) {
                                        ycui.loading.show();
                                        uploaderRight.stop(file);
                                        UploadKeyFty.uploadKey().then(function (da) {
                                            keyright = da.items;
                                            uploaderRight.upload(file);
                                        });
                                    })
                                    .on('uploadBeforeSend', function (ob, data) {
                                        data.uploadKey = keyright;
                                        if (scope.data.size2) {
                                            var sizes = scope.data.size2.split('*');
                                            data.width = sizes[0];
                                            data.height = sizes[1];
                                        }

                                        data.fileSize = advertising2[index].fileSizeLimit
                                    })
                                    .on('uploadSuccess', function (file, res) {
                                        if (res && res.code == 200) {
                                            var adCreative = res.adCreative;
                                            advertising2[index].fileHttpUrl2 = adCreative.fileHttpUrl;
                                            advertising2[index].fileMD5 = adCreative.fileMD5;
                                            advertising2[index].fileSize = adCreative.fileSize;
                                            advertising2[index].fileType = adCreative.fileType;
                                            var object = angular.element(element)[0].querySelector("#" + advertising2[index].rightId);
                                            var div = object.parentNode.querySelector(".channel-object");
                                            if (div) {
                                                div.parentNode.removeChild(div);
                                            }

                                            var html = photoAndSwfPreview({
                                                src: adCreative.fileHttpUrl,
                                                width: 115,
                                                height: 210,
                                                size: wh2,
                                                style: true
                                            })
                                            angular.element(object).after("<div class='channel-object'>" + html + "</div>");
                                            uploaderRight.reset();
                                        } else if (res._raw == "false") {
                                            ycui.alert({
                                                content: "不正确的操作",
                                                timeout: 10,
                                                error:true
                                            })
                                            uploaderRight.reset();
                                        } else {
                                            ycui.alert({
                                                content: res.msg,
                                                timeout: 10,
                                                error:true
                                            })
                                            uploaderRight.reset();
                                        }
                                    });
                            }, 100);
                        }, true)
                        scope.clodeBox = function (index) {
                            scope.data.advertising2.splice(index, 1)
                        }
                    }
                }
            }
        }
    }]);

app.directive("adverChannelIn", ["$timeout", "UploadKeyFty",
    function ($timeout, UploadKeyFty) {
        var html = "<div ng-repeat='data in data.advertising4' ><div ng-if='closeBo' class='adCreative-box'> <input type='text' ng-model='data.adCreativeName' placeholder='请输入创意名称' ng-class='{\"redBorder\":!data.adCreativeName && data.adCreativeNameValid}' ng-keyup='data.adCreativeNameValid = true'> <div class='channel-in'> <div class='span' ng-bind='data.size'></div><div ng-show='data.uploadId' class='channel-btn' id='{{data.uploadId}}'> <span>选择文件</span> </div> </div> <div class='maxlengthInput'><textarea ng-model='data.adCreativeTitle' ng-disabled='disabled'  placeholder='请输入广告标题' maxlength='30' style='resize: none' ng-class='{\"redBorder\":!data.adCreativeTitle && data.adCreativeTitleValid}' ng-keyup='data.adCreativeTitleValid = true'></textarea><span class='textareaLength'></span></div> <div ng-click='clodeBox($index)' ng-show='$index > 0' class='close'><i class='yc-icon'>&#xe643;</i></div>  <div class='landing-page'><div>*落地页：</div><div><textarea name='landingPage' ng-model='data.landingPage' placeholder='请输入落地页地址' ng-class='{\"redBorder\":!regUrl.test(data.landingPage) && data.landingPageValid}' ng-keyup='data.landingPageValid = true'></textarea></div></div>  </div> </div>";
        return {
            restrict: "AE",
            template: html,
            require: "^?originalityBox",
            scope: {
                data: "="
            },
            compile: function () {
                return {
                    pre: function preLink(scope, element) {
                        scope.regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
                        if (scope.data.adCreativeType != 4)return;
                        scope.$watch('data.advertising4.length', function (newValue, oldValue) {
                            if (newValue >= oldValue) {
                                $timeout(function () {
                                    var textarea = element[0].getElementsByTagName("textarea");
                                    var span = element[0].getElementsByClassName("textareaLength");

                                    var maxlength = angular.element(textarea[newValue - 1]).attr("maxlength");
                                    var length = angular.element(textarea).val().length;
                                    span[newValue - 1].innerText = (length || 0) + "/" + maxlength;
                                    angular.element(textarea[newValue - 1]).bind("input", function (event) {
                                        angular.element(event.target).next().text(event.target.value.length + "/" + maxlength)
                                    })
                                }, 20)
                            }
                        })
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        if (scope.data.adCreativeType != 4)return;
                        scope.closeBo = true;

                        var wh = scope.data.size.split("*");

                        if (scope.data.advertising4 && scope.data.advertising4[0].orderId) {
                            var html = photoAndSwfPreview({
                                src: scope.data.advertising4[0].fileHttpUrl,
                                width: 290,
                                height: 263,
                                size: wh,
                                style: true
                            })

                            $timeout(function () {
                                var uploadHtml = angular.element(iElement)[0].querySelector("#" + scope.data.advertising4[0].uploadId)
                                angular.element(uploadHtml).after("<div class='channel-object'>" + html + "</div>");

                                delete scope.data.advertising4[0].uploadId
                                scope.disabled = true;
                                
                            }, 100)

                        } else {
                            scope.data.advertising4 = [];
                            scope.data.advertising4.push({
                                size: scope.data.size,
                                fileSizeLimit: scope.data.fileSize,
                                adSpaceId: scope.data.id,
                                adCreativeType: scope.data.adCreativeType,
                                uploadId: controller.getId()
                            });
                        }

                        scope.$watch("data.advertising4.length", function (newValue, oldValue, scope) {
                            var advertising4 = scope.data.advertising4
                            if (newValue < oldValue)return;
                            setTimeout(function () {
                                var index = advertising4.length - 1;
                                var key = "";
                                var uploader = controller.uploadInit("#" + advertising4[index].uploadId)
                                    .on('beforeFileQueued', function (file) {
                                        ycui.loading.show();
                                        uploader.stop(file);
                                        UploadKeyFty.uploadKey().then(function (da) {
                                            key = da.items;
                                            uploader.upload(file);
                                        });
                                    })
                                    .on('uploadBeforeSend', function (ob, data) {
                                        data.uploadKey = key;
                                        if (scope.data.size) {
                                            var sizes = scope.data.size.split('*');
                                            data.width = sizes[0];
                                            data.height = sizes[1];
                                        }
                                        data.fileSize = advertising4[index].fileSizeLimit;
                                    })
                                    .on('uploadSuccess', function (file, res) {
                                        if (res && res.code == 200) {
                                            var adCreative = res.adCreative;
                                            advertising4[index].fileHttpUrl = adCreative.fileHttpUrl;
                                            advertising4[index].fileMD5 = adCreative.fileMD5;
                                            advertising4[index].fileSize = adCreative.fileSize;
                                            advertising4[index].fileType = adCreative.fileType;
                                            var object = angular.element(iElement)[0].querySelector("#" + advertising4[index].uploadId);
                                            var div = object.parentNode.querySelector(".channel-object");
                                            if (div) {
                                                div.parentNode.removeChild(div);
                                            }

                                            var html = photoAndSwfPreview({
                                                src: adCreative.fileHttpUrl,
                                                width: 290,
                                                height: 263,
                                                size: wh,
                                                style: true
                                            })
                                            angular.element(object).after("<div class='channel-object'>" + html + "</div>");
                                            uploader.reset();
                                        } else if (res._raw == "false") {
                                            ycui.alert({
                                                content: "不正确的操作",
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        } else {
                                            ycui.alert({
                                                content: res.msg,
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        }
                                    });
                            }, 10);
                        }, true)

                        scope.clodeBox = function (index) {
                            scope.data.advertising4.splice(index, 1)
                            scope.backgroundImage.splice(index, 1)
                        }
                    }
                }
            }
        }
    }]);

app.directive("adverChannelIn2", ["$timeout", "UploadKeyFty",
    function ($timeout, UploadKeyFty) {
        var html = "<div ng-repeat='data in data.advertising5'><div ng-if='closeBo' class='adCreative-box'> <input type='text' ng-model='data.adCreativeName' placeholder='请输入创意名称' ng-class='{\"redBorder\":!data.adCreativeName && data.adCreativeNameValid}' ng-keyup='data.adCreativeNameValid = true'> <div class='channel-in2'> <div class='span' ng-bind='data.size'></div><div ng-show='data.uploadId' class='channel-btn' id='{{data.uploadId}}'> <span>选择文件</span> </div> </div> <div class='maxlengthInput'><textarea class='inputCreative adCreativeText borderBottomNone' type='text' maxlength='30' ng-model='data.adCreativeTitle' ng-disabled='disabled'  placeholder='请输入广告标题' ng-class='{\"redBorder\":!data.adCreativeTitle && data.adCreativeTitleValid}' ng-keyup='data.adCreativeTitleValid = true'></textarea><span class='inputLength'></span></div> <div class='maxlengthInput'><textarea class='textareaCreative' rows='4' name='adCreativeText' ng-model='data.adCreativeText' ng-disabled='disabled'  placeholder='请输入广告描述' maxlength='500' ng-class='{\"redBorder\":!data.adCreativeText && data.adCreativeTextValid}' ng-keyup='data.adCreativeTextValid = true'></textarea><span class='textareaLength'></span></div> <div ng-click='clodeBox($index)' ng-show='$index > 0' class='close'><i class='yc-icon'>&#xe643;</i></div>  <div class='landing-page'><div>*落地页：</div><div><textarea name='landingPage' ng-model='data.landingPage' placeholder='请输入落地页地址' ng-class='{\"redBorder\":!regUrl.test(data.landingPage) && data.landingPageValid}' ng-keyup='data.landingPageValid = true'></textarea></div></div>  </div> </div>";
        return {
            restrict: "AE",
            template: html,
            require: "^?originalityBox",
            scope: {
                data: "="
            },
            compile: function () {
                return {
                    pre: function preLink(scope, element) {
                        scope.regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
                        if (scope.data.adCreativeType != 5)return;
                        scope.$watch('data.advertising5.length', function (newValue, oldValue) {
                            if (newValue >= oldValue) {
                                $timeout(function () {
                                    var textarea = element[0].getElementsByClassName("textareaCreative");
                                    var input = element[0].getElementsByClassName("inputCreative");
                                    var span = element[0].getElementsByClassName("textareaLength");
                                    var inputSpan = element[0].getElementsByClassName("inputLength");

                                    var maxlength = angular.element(textarea[newValue - 1]).attr("maxlength");
                                    var inputMaxlength = angular.element(input[newValue - 1]).attr("maxlength");
                                    var textareaValueLength = angular.element(textarea).val().length;
                                    var inputValueLength = angular.element(input).val().length;
                                    span[newValue - 1].innerText = (textareaValueLength || 0) + "/" + maxlength;
                                    inputSpan[newValue - 1].innerText = (inputValueLength || 0) + "/" + inputMaxlength;
                                    angular.element(textarea[newValue - 1]).bind("input", function (event) {
                                        angular.element(event.target).next().text(event.target.value.length + "/" + maxlength)
                                    })
                                    angular.element(input[newValue - 1]).bind("input", function (event) {
                                        angular.element(event.target).next().text(event.target.value.length + "/" + inputMaxlength)
                                    })
                                }, 20)
                            }
                        })
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        if (scope.data.adCreativeType != 5)return;
                        scope.closeBo = true;
                        var wh = scope.data.size.split("*");

                        if (scope.data.advertising5 && scope.data.advertising5[0].orderId) {
                            var html = photoAndSwfPreview({
                                src: scope.data.advertising5[0].fileHttpUrl,
                                width: 290,
                                height: 250,
                                size: wh,
                                style: true
                            })

                            $timeout(function () {
                                var uploadHtml = angular.element(iElement)[0].querySelector("#" + scope.data.advertising5[0].uploadId)
                                angular.element(uploadHtml).after("<div class='channel-object'>" + html + "</div>");

                                delete scope.data.advertising5[0].uploadId
                                scope.disabled = true;
                                
                            }, 100)


                        } else {
                            scope.data.advertising5 = []
                            scope.data.advertising5.push({
                                size: scope.data.size,
                                fileSizeLimit: scope.data.fileSize,
                                adSpaceId: scope.data.id,
                                adCreativeType: scope.data.adCreativeType,
                                uploadId: controller.getId()
                            });
                        }

                        scope.$watch("data.advertising5.length", function (newValue, oldValue, scope) {
                            var advertising5 = scope.data.advertising5
                            if (newValue < oldValue)return;
                            setTimeout(function () {
                                var index = advertising5.length - 1;
                                var key = "";
                                var uploader = controller.uploadInit("#" + advertising5[index].uploadId)
                                    .on('beforeFileQueued', function (file) {
                                        ycui.loading.show();
                                        uploader.stop(file);
                                        UploadKeyFty.uploadKey().then(function (da) {
                                            key = da.items;
                                            uploader.upload(file);
                                        });
                                    })
                                    .on('uploadBeforeSend', function (ob, data) {
                                        data.uploadKey = key;
                                        if (scope.data.size) {
                                            var sizes = scope.data.size.split('*');
                                            data.width = sizes[0];
                                            data.height = sizes[1];
                                        }
                                        data.fileSize = advertising5[index].fileSizeLimit
                                    })
                                    .on('uploadSuccess', function (file, res) {
                                        if (res && res.code == 200) {
                                            var adCreative = res.adCreative;
                                            advertising5[index].fileHttpUrl = adCreative.fileHttpUrl;
                                            advertising5[index].fileMD5 = adCreative.fileMD5;
                                            advertising5[index].fileSize = adCreative.fileSize;
                                            advertising5[index].fileType = adCreative.fileType;
                                            var object = angular.element(iElement)[0].querySelector("#" + advertising5[index].uploadId);
                                            var div = object.parentNode.querySelector(".channel-object");
                                            if (div) {
                                                div.parentNode.removeChild(div);
                                            }
                                            var html = photoAndSwfPreview({
                                                src: adCreative.fileHttpUrl,
                                                width: 290,
                                                height: 250,
                                                size: wh,
                                                style: true
                                            })
                                            angular.element(object).after("<div class='channel-object'>" + html + "</div>");
                                            uploader.reset();
                                        } else if (res._raw == "false") {
                                            ycui.alert({
                                                content: "不正确的操作",
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        } else {
                                            ycui.alert({
                                                content: res.msg,
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        }
                                    });
                            }, 10);
                        }, true)

                        scope.clodeBox = function (index) {
                            scope.data.advertising5.splice(index, 1)
                        }
                    }
                }
            }
        }
    }]);

app.directive("adverChannel", ["$timeout", "UploadKeyFty",
    function ($timeout, UploadKeyFty) {
        var html = "<div ng-repeat='data in data.advertising3'><div class='adCreative-box'> <input ng-model='data.adCreativeName' type='text' placeholder='请输入创意名称' ng-class='{\"redBorder\":!data.adCreativeName && data.adCreativeNameValid}' ng-keyup='data.adCreativeNameValid = true'> <div class='channel'> <div class='span' ng-bind='data.size'></div><div ng-show='data.uploadId' class='channel-btn' id='{{data.uploadId}}'> 选择文件 </div></div> <div ng-click='clodeBox($index)' ng-show='$index > 0' class='close'><i class='yc-icon'>&#xe643;</i></div>  <div class='landing-page'><div>*落地页：</div><div><textarea name='landingPage' ng-model='data.landingPage' placeholder='请输入落地页地址' ng-class='{\"redBorder\":!regUrl.test(data.landingPage) && data.landingPageValid}' ng-keyup='data.landingPageValid = true'></textarea></div></div>  </div></div>";
        return {
            restrict: "AE",
            template: html,
            require: "^?originalityBox",
            scope: {
                data: "="
            },
            transclude: true,
            compile: function () {
                return {
                    pre: function preLink(scope) {
                        scope.regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        if (scope.data.adCreativeType != 3)return;

                        var wh = scope.data.size.split("*");
                        if (scope.data.advertising3 && scope.data.advertising3[0].orderId) {
                            var html = photoAndSwfPreview({
                                src: scope.data.advertising3[0].fileHttpUrl,
                                width: 290,
                                height: 300,
                                size: wh,
                                style: true
                            })

                            $timeout(function () {
                                var uploadHtml = angular.element(iElement)[0].querySelector("#" + scope.data.advertising3[0].uploadId)
                                angular.element(uploadHtml).after("<div class='channel-object'>" + html + "</div>");
                                
                                delete scope.data.advertising3[0].uploadId
                                scope.disabled = true;
                            }, 100)


                        } else {
                            scope.data.advertising3 = []
                            scope.data.advertising3.push({
                                size: scope.data.size,
                                fileSizeLimit: scope.data.fileSize,
                                adSpaceId: scope.data.id,
                                adCreativeType: scope.data.adCreativeType,
                                uploadId: controller.getId()
                            });
                        }
                        scope.$watch("data.advertising3.length", function (newValue, oldValue, scope) {
                            var advertising3 = scope.data.advertising3
                            if (newValue < oldValue)return;
                            setTimeout(function () {
                                var index = advertising3.length - 1;
                                var key = "";
                                var uploader = controller.uploadInit("#" + advertising3[index].uploadId)
                                    .on('beforeFileQueued', function (file) {
                                        ycui.loading.show();
                                        uploader.stop(file);
                                        UploadKeyFty.uploadKey().then(function (da) {
                                            key = da.items;
                                            uploader.upload(file);
                                        });
                                    })
                                    .on('uploadBeforeSend', function (ob, data) {
                                        data.uploadKey = key;
                                        if (scope.data.size) {
                                            var sizes = scope.data.size.split('*')
                                            data.width = sizes[0];
                                            data.height = sizes[1];
                                        }
                                        data.fileSize = advertising3[index].fileSizeLimit
                                    })
                                    .on('uploadSuccess', function (file, res) {
                                        if (res && res.code == 200) {
                                            var adCreative = res.adCreative;
                                            advertising3[index].fileHttpUrl = adCreative.fileHttpUrl;
                                            advertising3[index].fileMD5 = adCreative.fileMD5;
                                            advertising3[index].fileSize = adCreative.fileSize;
                                            advertising3[index].fileType = adCreative.fileType;
                                            var object = angular.element(iElement)[0].querySelector("#" + advertising3[index].uploadId);
                                            var div = object.parentNode.querySelector(".channel-object");
                                            if (div) {
                                                div.parentNode.removeChild(div);
                                            }
                                            var html = photoAndSwfPreview({
                                                src: adCreative.fileHttpUrl,
                                                width: 290,
                                                height: 300,
                                                size: wh,
                                                style: true
                                            })
                                            angular.element(object).after("<div class='channel-object'>" + html + "</div>");
                                            uploader.reset();
                                        } else if (res._raw == "false") {
                                            ycui.alert({
                                                content: "不正确的操作",
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        } else {
                                            ycui.alert({
                                                content: res.msg,
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        }
                                    });
                            }, 10);
                        }, true)

                        scope.clodeBox = function (index) {
                            scope.data.advertising3.splice(index, 1)
                        }
                    }
                }
            }
        }
    }]);
/**
 * Created by moka on 16-9-7.
 */
app.controller('processListCtrl', ['$scope', '$http','FlowFty', function ($scope, $http,FlowFty) {

    $scope.processListSel = {
        callback:function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            FlowFty.flowList($scope.query).then(modViewA);
        }
    }

    FlowFty.flowTemplates().then(function (res) {
        if(res && res.code == 200){
            $scope.processListSel.list = res.templates;
        }
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
    $scope.query = {pageSize: 10, pageIndex: 1};

    FlowFty.flowList($scope.query).then(modViewA);

    $scope.redirect = function (num,co) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search;;
        FlowFty.flowList($scope.query).then(modViewA);
    };

}]);


app.controller('processEditCtrl', ['$scope', '$q','SysUserFty','FlowFty', function ($scope, $q ,SysUserFty,FlowFty) {

    var id = getSearch('id');
    var name = getSearch('name');

    $scope.flowTemplateSel = {
        callback:flowTemplateBack
    }

    function flowTemplateBack(e,d,list,index){
        console.info(d);
        FlowFty.flows({checkResourceType:d.checkResourceType}).then(flowsFun)
    }

    FlowFty.flowTemplates().then(function (res) {
        if(res && res.code == 200){
            $scope.flowTemplateSel.list = res.templates;
        }
    });

    var roleListAll = SysUserFty.roleListAll().then(function (res) {
        if(res && res.code == 200){
            $scope.roleList = res.roleList
        }
    });

    $q.all([roleListAll]).then(function () {
        if(id && name){
            $scope.name = name;
            $scope.id = id;
            $scope.query.checkResourceType = id;
            FlowFty.flows({checkResourceType:id}).then(flowsFun)
        }
    })

    // $scope.$on('loginUserInfo',function (e,d) {
    //     var roleListByCom = SysUserFty.roleListByCom({id:d.companyId}).then(function (res) {
    //         if(res && res.code == 200){
    //             $scope.roleList = res.roleList;
    //         }
    //     });
    //
    //
    //
    // })


    function flowsFun(res) {
        if(res && res.code == 200){
            var flows = res.flows;
            var s = flows.map(function(da){
                var roleList = angular.copy($scope.roleList);
                var checkRoles = da.checkRoles;
                for(var i = 0;i<checkRoles.length;i++){
                    for(var j = 0;j<roleList.length;j++){
                        if(checkRoles[i].id == roleList[j].id){
                            roleList.splice(j,1);
                            j--;
                        }
                    }
                }
                da.processListSel = {
                    list: roleList,
                    callback:function(e,d,list,index){
                        if(!d){return};
                        list.splice(index,1);
                        da.checkRoles.push(d);
                    }
                };
                return da;
            });
            $scope.processList = s;
        }else if(res.code == 404){
            var list = [
                {
                    backToStep:0,
                    checkResourceType:$scope.query.checkResourceType,
                    checkStep:1,
                    checkStepState:1,
                    isLastOne:1,
                    checkRoles:[]
                }
            ],
            list = list.map(function(da){
                var roleList = angular.copy($scope.roleList);
                var checkRoles = da.checkRoles;
                for(var i = 0;i<checkRoles.length;i++){
                    for(var j = 0;j<roleList.length;j++){
                        if(checkRoles[i].id == roleList[j].id){
                            roleList.splice(j,1);
                            j--;
                        }
                    }
                }
                da.processListSel = {
                    list: roleList,
                    callback:function(e,d,list,index){
                        if(!d){return};
                        list.splice(index,1);
                        da.checkRoles.push(d);
                    }
                };
                return da;
            });
            $scope.processList = list;
        }
    }

    // $q.all([loginUserInfo]).then(function (e,d) {
    //     console.info(d);
    // });
    //
    // var roleListByCom = SysUserFty.roleListByCom({id:3}).then(function (res) {
    //     if(res && res.code == 200){
    //         $scope.roleList = res.roleList;
    //     }
    // });
    //
    // $q.all([roleListByCom]).then(function(){
    //     FlowFty.flowTemplates().then(function (res) {
    //         if(res && res.code == 200){
    //             $scope.flowTemplateSel.list = res.templates;
    //         }
    //     })
    // })

    $scope.query = {};

    $scope.addContact = function (index) {
        var _bo = {
            checkRoles:[],
            processListSel:{
                list:angular.copy($scope.roleList),
                callback:function(e,d,list,index){
                    if(!d){return};
                    list.splice(index,1);
                    _bo.checkRoles.push(d);
                }
            }
        }
        $scope.processList.splice(index+1, 0, _bo);
    };

    $scope.removeContact = function (index) {
        $scope.processList && $scope.processList.length > 1 && ($scope.processList.splice(index, 1))
    };

    $scope.recoveryContact = function(process,index){
        process.processListSel.list.push(process.checkRoles.splice(index,1)[0]);
    }

    $scope.switchingPosition = function (inx, index) {
        if (inx == 0 && index < 0) {
            return
        }
        if (inx == $scope.processList.length - 1 && index == 1) {
            return
        }
        var form = $scope.processList[inx];
        var to = $scope.processList[inx + index];
        $scope.processList.splice(inx, 1, to);
        $scope.processList.splice(inx + index, 1, form);
    }

    $scope.postEdit = function () {
        var rep = angular.copy($scope.processList);
        $scope.$valid = true;

        if(!rep){return;}
        var body = {
            checkResourceType:$scope.query.checkResourceType
        };
        var bo = false;
        rep.forEach(function (da,index) {
            delete da.processListSel;
            delete da.updateTime;
            delete da.createTime;
            var s = da.checkRoles.map(function (da) {
                return da.id;
            });
            if(s.length == 0){bo = true}
            da.checkStep = ++index;
            da.checkRoleIds = s.join(',')
            delete da.checkRoles;
        });
        body.checkFlows = rep;
        if(bo)return;
        ycui.loading.show();
        FlowFty.flowsEdit(body).then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    timeout:-1,
                    okclick:function () {
                        goRoute('ViewAuditProcess')
                    }
                });
            }
        });
    }

}])
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

app.controller('PutEditCtrl', ['$scope', '$q', 'ContractFty', 'OrdersFty', 'ResCreativityFty', 'ScheduleFty', 'CustomerFty', 'SysCompanyFty', 'SysUserFty', 'SysContractTolerantFty', 'ResMediaFty','UploadKeyFty','ResChannelFty','SysDepartmentFty',
    function ($scope, $q, ContractFty, OrdersFty, ResCreativityFty, ScheduleFty, CustomerFty, SysCompanyFty, SysUserFty, SysContractTolerantFty, ResMediaFty,UploadKeyFty,ResChannelFty,SysDepartmentFty) {
        $scope.customerListSel = {}
        //客户下拉
        var getPartCustomer = CustomerFty.getPartCustomer({customerType: 2}).then(function (res) {
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
        $scope.order = {};

        $scope.showState = +getSearch('showState');
        $scope.editManage = +getSearch('editManage');
        $scope.selectContractShow = false;
        $scope.adListInfo = [];//广告位列表集合

        var id = getSearch('id');
        var orderDetail = OrdersFty.orderDetail({id: id}).then(function (res) {
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
                $scope._cache.adInDepScope = $scope.order.adInDepScope;
                $scope._cache._relatedOrderName = $scope.order.relatedOrderName;
                
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
                    var getContractsByCode = ContractFty.getContractsByCode({contractCode: $scope.order.contractCode}).then(function (res) {
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
            $q.all([getContractsByCode]).then(function(){
                console.info($scope._cache.contract);
            })
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
                validOrderData.then(function (res) {
                    if (res && res.code == 404) {
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
                // $scope._cache.contract = data;

                $scope._cache.contract && angular.extend($scope._cache.contract,data);
                
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
            SysUserFty.depAndUserList({companyId: $scope._cache.companyId}).then(function (res) {
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
            $scope._cache.contract && angular.extend($scope._cache.contract,{
                contractBuyMoney: _contractMoneyMax,
                presentMoney: _presentMoneyMax,
                schedulingBuyMoney: $scope.order.buyMoney,
                schedulingPresentedMoney: $scope.order.presentMoney,
                scheduleMoney: _contractMoneyMax + _presentMoneyMax
            })
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
                OrdersFty.getADSpacesForAddOrder($scope.query).then(modView);
            }
        })

        $q.all([orderDetail]).then(function(){
            ResMediaFty.mediaListInCom({companyId:$scope._cache.adInCompanyId}).then(function(res){
                if(res && res.code == 200){
                    $scope.mediaListSel.list = res.mediaList;
                }
            })
        })

        $scope.departmentListAdSel = {
            callback:function(e,d){
                if(d){
                    $scope.query.depScope = d.agencyNumber;
                    $scope._cache.adInDepScope = d.agencyNumber;
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
            },
            sessionBack:function(d){
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
                    OrdersFty.getADSpacesForAddOrder($scope.query).then(modView);
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
                }).then(function (res) {
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
                OrdersFty.ordersList($scope.query2).then(modView2);
            }
        };
        CustomerFty.getAllCustomer({customerState: 1}).then(function (response) {
            if (response.code == 200) {
                $scope.customerNameSel.list = response.items
            }
        });

        $scope.showOrderCarList = function (name) {
            $scope.query2 = {pageSize: 5,orderType:2};
            /**
             * 关联订单
             */
            OrdersFty.ordersList($scope.query2).then(modView2);
            $scope.redirect2 = function (num,da) {
                ycui.loading.show()
                $scope.query2.pageIndex = num || 1;
                $scope.query2.ordersNameOrID = $scope.query2.search;;
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
            OrdersFty.orderDetail({id: id}).then(function (res) {
                if (res && res.code == 200) {
                    var _order = res.orders;

                    $scope._cache._relatedOrderName = _order.orderName;
                    $scope.order.orderName = '赔偿' + _order.orderName;
                    $scope.order.relatedOrderId = _order.id;
                    $scope.scheduleTypeList = [{id: 1, name: '免费配送'}];

                    // $scope.order.orderShowDate = _order.orderShowDate;
                    // $scope.order.orderShowDate.pickerDateRange = 'pickerDateRange';
                    // pointerTimely($scope.order.orderShowDate);

                    $scope.order.contractType = _order.contractType;
                    $scope.order.customerId = _order.customerId;
                    $scope.order.customerName = _order.customerName;
                    $scope.order.futureMoney = _order.futureMoney;
                    $scope.order.historyScheduleMoney = _order.historyScheduleMoney;

                    if (_order.contractCode) {
                        ContractFty.getContractsByCode({contractCode: _order.contractCode}).then(function (res) {
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
            setTimeout(function(){
                document.querySelector('[yc-module=showOrderCarModule] .ok').click()
            },20)
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
                        $scope.areasListShow = 1;
                    })
                }
            });
            if ($scope.order.languageList && $scope.order.languageList.length > 0) {
                $scope.languageShow = '1';
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
            var $bo = false;
            //验证
            if ($scope.order.orderType == 1 || $scope.order.orderType == 2 || $scope.order.orderType == 3) {
                if ($scope.order.customerId == undefined) {
                    $bo = true;
                }
            }

            if ($scope.order.orderType == 2 && !$scope.order.contractCode && $scope.order.contractType == 1) {
                $bo = true;
            }

            for (var a = 0, j = $scope.adListInfo.length; a < j; a++) {
                var _data = $scope.adListInfo[a];
                if (validTime($scope.order.orderShowDate, _data.adShowDates) != 0) {
                    ycui.alert({
                        error:true,
                        content: '广告位排期超过订单总档期，请重新选择'
                    });
                    $bo = true;
                }
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
                    switch (res[1].tolerantRule) {
                        case 1:
                            if ($scope.order.futureMoney * res[1].tolerant > res[1].tolerantMoney) {
                                _s = res[1].tolerantMoney
                            } else {
                                _s = $scope.order.futureMoney * res[1].tolerant
                            }
                            break;
                        case 2:
                            if ($scope.order.futureMoney * res[1].tolerant > res[1].tolerantMoney) {
                                _s = $scope.order.futureMoney * res[1].tolerant
                            } else {
                                _s = res[1].tolerantMoney
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
                        OrdersFty.orderUpdate(body).then(function (res) {
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
/**
 * Created by moka on 16-6-21.
 */
app.controller("orderRuleCtrl", ["$scope", "SysRuleUserFty","SysLoginUserFty",
    function ($scope, SysRuleUserFty,SysLoginUserFty) {

        var loginUserInfo = SysLoginUserFty.loginUserInfo().then(function (res) {
            if (res && res.code == 200) {
                $scope.user = res;
                $scope.$broadcast('loginUserInfo',$scope.user);
            }
        });

        var getUserRightsByParentId = SysRuleUserFty.getUserRightsByParentId({rightsParentId: 1}).then(function (res) {
            var _object = {};
            if(res && res.code == 200){
                var items = res.items;
                items.forEach(function(ad){
                    _object[ad.verify] = ad;
                })
            }
            /**
             * 权限对象 扁平化
             * @type {{}}
             */
            $scope.putManageRule = _object;
            $scope.$broadcast('loginUserRole',$scope.putManageRule);
        })
    }]);


$(".strategys-items a").click(function () {
    var i = $(this).index();
    $(this).addClass("strategys-itemsFa").siblings().removeClass("strategys-itemsFa");
    $(".yc-compile-articl").hide().eq(i).show();
});

app.filter("type", function () {
    return function (input) {
        if (input == 1) {
            return "首页"
        } else if (input == 2) {
            return "频道"
        } else {
            return "内容页"
        }
    }
});
app.filter("isPass", function () {
    return function (input) {
        if (input == 0) {
            return "审核中"
        } else if (input == 1) {
            return "审核通过"
        } else {
            return "审核未通过"
        }
    }
});