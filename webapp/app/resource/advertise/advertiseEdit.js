/**
 * Created by moka on 16-6-17.
 */
app.controller("advertiseEditCtrl", ["$scope", "$http", "ResAdvertisingFty", "$q","UploadKeyFty","ResChannelFty",
    function ($scope, $http, ResAdvertisingFty, $q,UploadKeyFty,ResChannelFty) {
        
        $scope.priceArr = [{priceId: 1, priceName: "天"}, {priceId: 2, priceName: "月"}, {priceId: 3, priceName: "小时"}];
        $scope.priceClick = function (id) {
            $scope.priceCycle = id;
        }

        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.channelListSel.$destroy();
                d && ResChannelFty.getChannelsByMedia({mediaId:d.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            }
        };
        $scope.typeListSel = {
            callback:function(e,d){
                $scope.size2 = undefined;
                $scope.multiLimit = undefined;
                if(d){
                    var catagorys = d.catagorys && (d.catagorys.split(','))
                    $scope.catagorysList.forEach(function (da) {
                        if(catagorys.indexOf(String(da.value)) != -1){
                            da.check = true;
                        }else{
                            da.check = false;
                        }
                    })
                    $scope.enableBaseAd = d.enableBaseAd;
                    $scope.enableMark = d.enableMark;
                    $scope.enableMonitor = d.enableMonitor;
                    $scope.adEqCreative = d.adEqCreative;

                    $scope.$enableBaseAd && ($scope.$enableBaseAd.destroy());
                    $scope.$enableBaseAd2 && ($scope.$enableBaseAd2.destroy());

                    if(d.id == 11){
                        $scope.size2 = $scope.size;
                    }
                    // if(d.isMulti == 1){
                    //     $scope.$enableBaseAd = upload({id:'enableBaseAd',size:$scope.size});
                    //     $scope.$enableBaseAd2 = upload({id:'enableBaseAd2',size:$scope.size2});
                    // }else{
                    //     $scope.$isShowDefault = upload({id:'enableBaseAd',size:$scope.size});
                    // }
                }
                console.info(d);
            }
        };
        $scope.sizeListSel = {
            callback:function (e,d) {
                // $scope.$enableBaseAd && ($scope.enableBaseAd.destroy());
                // $scope.$enableBaseAd = upload({id:'enableBaseAd',size:$scope.size});
                //对联 尺寸一样 特殊处理
                if(d && $scope.adSpaceTypeId == 11){
                    $scope.size2 = d.size;
                    // $scope.$enableBaseAd2 && ($scope.$enableBaseAd2.destroy());
                    // $scope.$enableBaseAd2 = upload({id:'enableBaseAd2',size:$scope.size2});
                }
            }
        };
        $scope.sizeListSel2 = {
            callback:function () {
                // $scope.$enableBaseAd2 && ($scope.$enableBaseAd2.destroy());
                // $scope.$enableBaseAd2 = upload({id:'enableBaseAd2',size:$scope.size2});
            }
        };
        $scope.sizeListSel3 = {};
        $scope.sizeListSel4 = {};
        // $scope.effectListSel = {};
        $scope.channelListSel = {};

        $scope.catagorysList = [
            {name:'图片',value:1},
            {name:'JS',value:2},
            {name:'H5',value:3}
        ]

        var aDSpaceDownListForAdd = ResAdvertisingFty.aDSpaceDownListForAdd().then(function (response) {
            $scope.mediaListSel.list = response.mediaList;
            $scope.typeListSel.list = response.typeList;
            $scope.sizeListSel.list = response.sizeList;
            $scope.sizeListSel2.list = response.sizeList;
            $scope.sizeListSel3.list = response.sizeList;
            $scope.sizeListSel4.list = response.sizeList;

            // $scope.effectList = response.effectList;
            $scope.typeList = response.typeList;
        });

        $scope.isAdvertiseShow = false;

        $scope.isSure = function () {
            if ($scope.state == -1) {
                ycui.confirm({
                    content: "广告位禁用后不可投放广告！若再重新启用，须重新进入审批流程。请确认是否禁用广告？",
                    noclick: function () {
                        $scope.$apply(function () {
                            $scope.state = 0;
                        })
                    }
                });
            }
        }

        var id = getSearch("id");
        $scope.editManage = getSearch("editManage");
        ycui.loading.show();
        var aDSpaceDetail = ResAdvertisingFty.aDSpaceDetail({id: id}).then(function (response) {
            ycui.loading.hide();
            if (response && response.code == 200) {
                $scope.adStatus = response.adSpace.adStatus;
                $scope.adSpaceName = response.adSpace.adSpaceName;
                $scope.adSpaceTypeId = response.adSpace.adSpaceTypeId;
                $scope.adSpaceTypeName = response.adSpace.adSpaceTypeName;
                $scope.checkState = response.adSpace.checkState;
                $scope.checkUserId = response.adSpace.checkUserId;
                $scope.createTime = response.adSpace.createTime;
                $scope.fileSize = response.adSpace.fileSize;
                $scope.id = response.adSpace.id;
                $scope.isMultiLimit = response.adSpace.isMultiLimit;
                $scope.mediaChannelId = response.adSpace.mediaChannelId;
                $scope.mediaChannelIds = response.adSpace.mediaChannelIds;
                $scope.mediaChannelName = response.adSpace.mediaChannelName;
                $scope.mediaId = response.adSpace.mediaId;
                $scope.mediaName = response.adSpace.mediaName;
                $scope.multiLimit = response.adSpace.multiLimit;
                $scope.maxAdCount = response.adSpace.maxAdCount;
                $scope.pageType = response.adSpace.pageType;
                $scope.price = response.adSpace.price;
                $scope.priceCycle = response.adSpace.priceCycle;
                $scope.remark = response.adSpace.remark;
                $scope.size = response.adSpace.size;
                $scope.size2 = response.adSpace.size2;
                $scope.sort = response.adSpace.sort;
                $scope.state = response.adSpace.state;
                $scope.enableBaseAd = response.adSpace.enableBaseAd;
                $scope.defaultUrl1 = response.adSpace.defaultUrl1;
                $scope.defaultUrl2 = response.adSpace.defaultUrl2;
                $scope.catagorys = response.adSpace.catagorys;
                $scope.checkState = response.adSpace.checkState;
                $scope.enableMark = response.adSpace.enableMark;
                $scope.enableMonitor = response.adSpace.enableMonitor;
                $scope.showTimeLimit = response.adSpace.showTimeLimit;
                $scope.creativeSize = response.adSpace.creativeSize;
                $scope.creativeSize2 = response.adSpace.creativeSize2;
                $scope.adEqCreative = response.adSpace.adEqCreative;
                $scope.distanceValue = response.adSpace.distanceValue;

                // $scope._effectList = response.adSpace.effectList;
                //审核状态 0 审核中 1 审核通过 2审核未通过

                if ($scope.checkState == 1) {
                    $scope.isAdvertiseShow = true;
                }

                //显示打底广告
                
                if($scope.enableBaseAd == 1){
                    var size = {
                        size1:$scope.size.split('*')
                    };
                    if($scope.defaultUrl1){
                        $scope.imgList = [];
                        var wh = proportionPhoto(size.size1[0],size.size1[1],75,75);
                        $scope.imgList.push({
                            width:wh[0],
                            _width:size.size1[0],
                            height:wh[1],
                            _height:size.size1[1],
                            uploadFile:$scope.defaultUrl1
                        });
                    }
                    // $scope.$isShowDefault = upload({id:'isShowDefault',size:$scope.size});
                    if($scope.defaultUrl2){
                        // $scope.$isShowDefault2 = upload({id:'isShowDefault2',size:$scope.size2});
                        $scope.imgList2 = [];
                        size.size2 = $scope.size2.split('*');
                        wh = proportionPhoto(size.size2[0],size.size2[1],75,75);
                        $scope.imgList2.push({
                            width:wh[0],
                            _width:size.size2[0],
                            height:wh[1],
                            _height:size.size2[1],
                            uploadFile:$scope.defaultUrl2
                        })
                    }
                }

                //显示广告位类型
                $scope.catagorys && $scope.catagorysList.forEach(function(data){
                    if($scope.catagorys.indexOf(data.value) != -1) {
                        data.check = true;
                    }
                })
            }
        });


        $q.all([aDSpaceDownListForAdd, aDSpaceDetail]).then(function () {
            $scope.typeList.forEach(function (data) {
                if ($scope.adSpaceTypeId == data.id) {
                    $scope.isMulti = data.isMulti;
                    $scope.isCoupletAd = data.isCoupletAd; //是否对联
                    $scope.isLimitValue = data.isLimit; //纯文字连
                }
            })
            
            // $scope.effectList.forEach(function (da) {
            //     $scope._effectList && $scope._effectList.forEach(function (_da) {
            //         if(da.id == _da.id){
            //             da.check = true;
            //         }
            //     })
            // })
            
        });


        // var upload = function (item) {
        //     var key = '';
        //     var config = {
        //         server: fileUrl + "/orderAdCreative/upload.htm",
        //         pick: {
        //             id: '#'+item.id,
        //             multiple: false
        //         },
        //         error:function (uploader,err) {
        //             ycui.alert({
        //                 content: "错误的文件类型",
        //                 timeout: 10,
        //                 error:true
        //             });
        //             ycui.loading.hide();
        //             uploader.reset();
        //         },
        //         uploadComplete:function () {
        //             ycui.loading.hide();
        //         },
        //         beforeFileQueued:function (uploader,file) {
        //             ycui.loading.show();
        //             uploader.stop(file);
        //             UploadKeyFty.uploadKey().then(function (da) {
        //                 key = da.items;
        //                 uploader.upload(file);
        //             });
        //         },
        //         uploadBeforeSend:function (uploader, file, data) {
        //             data.uploadKey = key;
        //             data.fileSize = $scope.fileSize;
        //             if(item.size){
        //                 var size = item.size.split('*')
        //                 var sw = size[0];
        //                 var sh = size[1];
        //                 data.width = sw;
        //                 data.height = sh;
        //             }
        //
        //         },
        //         uploadSuccess:function (uploader, file, res) {
        //             if (res && res.code == 200) {
        //                 var wh = proportionPhoto(res.adCreative.width,res.adCreative.height,75,75);
        //                 var da = {
        //                     width:wh[0],
        //                     _width:res.adCreative.width,
        //                     height:wh[1],
        //                     _height:res.adCreative.height,
        //                     uploadFile:res.adCreative.fileHttpUrl
        //                 };
        //                 if(item.id == 'isShowDefault2'){
        //                     $scope.imgList2 = [];
        //                     $scope.$apply(function () {
        //                         $scope.imgList2.push(da);
        //                     })
        //                 }else{
        //                     $scope.imgList = [];
        //                     $scope.$apply(function () {
        //                         $scope.imgList.push(da);
        //                     })
        //                 }
        //             }else if (res._raw == "false") {
        //                 ycui.alert({
        //                     content: "不正确的操作",
        //                     timeout: 10,
        //                     error:true
        //                 });
        //             } else {
        //                 ycui.alert({
        //                     content: res.msg,
        //                     timeout: 10,
        //                     error:true
        //                 });
        //             }
        //             uploader.reset();
        //         }
        //     }
        //     return uploadInit(config);
        // }

        $scope.postEdit = function () {
            $scope.validShow = true;
            // if(($scope.isMulti == 1 && $scope.imgList.length == 0 && $scope.imgList2.length == 0) || ($scope.isMulti != 1 && $scope.imgList.length == 0)){
            //     return
            // }

            var catagorys = [];
            $scope.catagorysList.forEach(function(data){
                if(data.check){
                    catagorys.push(data.value);
                }
            })

            var query = {
                id: id,
                adSpaceName: $scope.adSpaceName,
                adSpaceTypeId: $scope.adSpaceTypeId,
                adSpaceTypeName: $scope.adSpaceTypeName,
                checkState: $scope.checkState,
                checkUserId: $scope.checkUserId,
                fileSize: $scope.fileSize,
                mediaChannelId: $scope.mediaChannelId,
                mediaChannelName: $scope.mediaChannelName,
                mediaId: $scope.mediaId,
                mediaName: $scope.mediaName,
                isMultiLimit: $scope.isMultiLimit,
                multiLimit: $scope.multiLimit || 1,
                pageType: $scope.pageType,
                price: $scope.price,
                priceCycle: $scope.priceCycle,
                size: $scope.size,
                // sort: $scope.sort,
                remark: $scope.remark,
                // state: $scope.state,
                enableMark:$scope.enableMark,
                enableMonitor:$scope.enableMonitor
            }

            //多图文 对联
            if ($scope.isCoupletAd == 1 || $scope.isMulti == 1) {
                query.size2 = $scope.size2;
            }

            if($scope.adSpaceTypeId == 11){
                query.distanceValue = $scope.distanceValue;
            }

            if(catagorys.length > 0){
                query.catagorys = catagorys.join(',')
            }
            
            /**
             * 视频通栏
             */
            if($scope.adSpaceTypeId == 21){
                query.showTimeLimit = $scope.showTimeLimit;
            }

            //多图 对联 创意尺寸
            if($scope.adEqCreative == 0){//广告尺寸与素材尺寸不相同
                if($scope.isMulti == 1){
                    if( $scope.isCoupletAd == 1){
                        query.creativeSize = query.creativeSize2 = $scope.creativeSize
                    }else{
                        query.creativeSize2 = $scope.creativeSize2;
                        query.creativeSize = $scope.creativeSize;
                    }
                }else{
                    query.creativeSize = $scope.creativeSize
                }
            }else{
                if($scope.isMulti == 1){
                    if( $scope.isCoupletAd == 1){
                        query.creativeSize = query.creativeSize2 = $scope.size
                    }else{
                        query.creativeSize2 = $scope.size2;
                        query.creativeSize = $scope.size;
                    }
                }else{
                    query.creativeSize = $scope.size
                }
            }

            /**
             * defaultUrl
             */
            if($scope.enableBaseAd == 1){
                $scope.imgList && $scope.imgList.forEach(function (da) {
                    query.defaultUrl1 = da.uploadFile;
                })
                $scope.imgList2 && $scope.imgList2.forEach(function (da) {
                    query.defaultUrl2 = da.uploadFile;
                })
            }
            
            //纯文字连
            if ($scope.isLimitValue == 1) {
                query.maxAdCount = $scope.maxAdCount;
            }

            //特效
            // var effects = [];
            // $scope.effectList.forEach(function (da) {
            //     if(da.check){
            //         effects.push(da.id);
            //     }
            // });
            // effects.length > 0 &&(query.effects = effects.join(','));
            ycui.loading.show();
            ResAdvertisingFty.aDSpaceUpdate(query).then(function (response) {
                ycui.loading.hide();
                if (response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewMediaChannelADSpace3');
                        },
                        timeout: 10
                    });
                }
            });
        };

        $(".form").validate({
            rules: {
                adName: "required",
                kbNum: {
                    required: true,
                    number: true
                },
                maxAdCount: {
                    required: true,
                    number: true
                },
                multiLimit:{
                    required: true,
                    number: true
                },
                distanceValue:{
                    required: true,
                    number:true,
                    min:0
                }
            },
            messages: {
                adName: "请输入广告位名称",
                kbNum: {
                    number: "请输入有效的数字",
                    required: "请输入K数限制"
                },
                maxAdCount: {
                    number: "请输入有效的数字",
                    required: "请输入文字链上限"
                },
                multiLimit:{
                    number: "请输入有效的数字",
                    required: "请输入轮播上限"
                },
                distanceValue:{
                    required: "请输入距离顶部的距离",
                    number: "请输入有效的数字",
                    min:"输入大于0的数字"
                }
            },
            errorClass: "error-span",
            errorElement: "span"
        })

    }]);