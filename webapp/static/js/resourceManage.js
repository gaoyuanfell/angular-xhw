/**
 * Created by moka on 16-6-17.
 */
app.controller("advertiseAddCtrl", ["$scope", "$http", "ResAdvertisingFty",'$q','UploadKeyFty','ResChannelFty',
    function ($scope, $http, ResAdvertisingFty,$q,UploadKeyFty,ResChannelFty) {
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
                    //adEqCreative 0 与广告位尺寸不相同
                    $scope.enableBaseAd = d.enableBaseAd;// isShowDefault
                    $scope.enableMark = d.enableMark;
                    $scope.enableMonitor = d.enableMonitor;
                    $scope.adEqCreative = d.adEqCreative;

                    // $scope.$isShowDefault && ($scope.$isShowDefault.destroy());
                    // $scope.$isShowDefault2 && ($scope.$isShowDefault2.destroy());

                    if(d.id == 11){
                        $scope.size2 = $scope.size;
                    }
                    // if(d.isMulti == 1){
                    //     $scope.$isShowDefault = upload({id:'isShowDefault',size:$scope.size});
                    //     $scope.$isShowDefault2 = upload({id:'isShowDefault2',size:$scope.size2});
                    // }else{
                    //     $scope.$isShowDefault = upload({id:'isShowDefault',size:$scope.size});
                    // }
                }
                console.info(d);
            }
        };
        $scope.sizeListSel = {
            callback:function (e,d) {
                // $scope.$isShowDefault && ($scope.$isShowDefault.destroy());
                // $scope.$isShowDefault = upload({id:'isShowDefault',size:$scope.size});
                //对联 尺寸一样 特殊处理
                if(d && $scope.adSpaceTypeId == 11){
                    $scope.size2 = d.size;
                    // $scope.$isShowDefault2 && ($scope.$isShowDefault2.destroy());
                    // $scope.$isShowDefault2 = upload({id:'isShowDefault2',size:$scope.size2});
                }

            }
        };
        $scope.sizeListSel2 = {
            callback:function () {
                // $scope.$isShowDefault2 && ($scope.$isShowDefault2.destroy());
                // $scope.$isShowDefault2 = upload({id:'isShowDefault2',size:$scope.size2});
            }
        };
        $scope.sizeListSel3 ={};
        $scope.sizeListSel4 ={};
        // $scope.effectListSel = {};
        $scope.channelListSel = {};

        $scope.catagorysList = [
            {name:'图片',value:1,check:false},
            {name:'JS',value:2,check:false},
            {name:'H5',value:3,check:false}
        ];

        var aDSpaceDownListForAdd = ResAdvertisingFty.aDSpaceDownListForAdd().then(function (response) {
            $scope.mediaListSel.list = response.mediaList;
            $scope.typeListSel.list = response.typeList;
            $scope.sizeListSel.list = response.sizeList;
            $scope.sizeListSel2.list = response.sizeList;
            $scope.sizeListSel3.list = response.sizeList;
            $scope.sizeListSel4.list = response.sizeList;
            // $scope.effectList = response.effectList;
        });


        $scope.fileSize = 40;
        $scope.state = 0;
        $scope.priceCycle = 1;
        $scope.down = true;
        $scope.enableMark = 0;
        $scope.enableMonitor = 0;
        $scope.isMultiLimit = 0;
        $scope.enableBaseAd = 0;
        $scope.mediaId = 0;
        $scope.mediaChannelId = 0;
        $scope.adSpaceTypeId = 0;
        $scope.sizeId = 0;

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
        };

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
            var passChannel = true;

            if (!$scope.mediaId) {
                passChannel = false;
            }
            if (!$scope.mediaChannelId) {
                passChannel = false;
            }
            if (!$scope.adSpaceTypeId) {
                passChannel = false;
            }

            if (!$scope.size) {
                passChannel = false;
            }

            // if(!$scope.catagorysValid()){
            //     passChannel = false;
            // }

            if($scope.adEqCreative == 0 && !$scope.creativeSize){
                passChannel = false;
            }
            if($scope.adEqCreative == 0 && ($scope.isMulti == 1 && $scope.isCoupletAd == 0) && !$scope.creativeSize2){
                passChannel = false;
            }

            if (!$scope.size && ($scope.isMulti == 1 && $scope.isCoupletAd == 0)) {
                passChannel = false;
            }

            if (!$scope.size2 && ($scope.isMulti == 1 && $scope.isCoupletAd == 0)) {
                passChannel = false;
            }

            // if(($scope.isMulti == 1 && !$scope.imgList && !$scope.imgList2) || ($scope.isMulti != 1 && !$scope.imgList)){
            //     passChannel = false;
            // }

            if (!$(".form").valid()) {
                passChannel = false;
            }
            var arr = [];
            $("input[name=items]").each(function (i, v) {
                if ($(this).prop("checked")) {
                    arr.push($(this).prop("value"))
                }
            });
            $scope.mediaChannelIds = arr.join(",");

            var catagorys = [];
            $scope.catagorysList.forEach(function(data){
                if(data.check){
                    catagorys.push(data.value);
                }
            })

            if (passChannel) {
                var query = {
                    pageType: 2, //页面类型 1首页 2 频道 3内容页
                    mediaId: $scope.mediaId,
                    mediaChannelId: $scope.mediaChannelId,
                    mediaChannelIds: $scope.mediaChannelIds,
                    adSpaceTypeId: $scope.adSpaceTypeId,
                    adSpaceName: $scope.adSpaceName,
                    size: $scope.size,
                    fileSize: $scope.fileSize,
                    state: $scope.state,
                    remark: $scope.remark,
                    isMultiLimit: $scope.isMultiLimit,
                    multiLimit: $scope.multiLimit || 1,
                    enableBaseAd:+$scope.enableBaseAd,
                    enableMark:$scope.enableMark,
                    enableMonitor:$scope.enableMonitor,
                    adEqCreative:$scope.adEqCreative,
                };

                if(catagorys.length > 0){
                    query.catagorys = catagorys.join(',')
                }
                
                /**
                 * 多图文 对联
                 */
                if ($scope.isCoupletAd == 1 || $scope.isMulti == 1) {
                    query.size2 = $scope.size2;
                }

                if($scope.adSpaceTypeId == 11){
                    query.distanceValue = $scope.distanceValue;
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
                /**
                 * 纯文字连
                 */
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
                ResAdvertisingFty.aDSpaceAdd(query).then(function (response) {
                    ycui.loading.hide();
                    if (response && response.code == 200) {
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                goRoute('ViewMediaChannelADSpace3')
                            },
                            timeout: 10
                        });
                    }
                })
            }
        };


        // $scope.$watch('isMultiLimit', function (newValue, oldValue) {
        //     if (newValue == 1) {
        //         $("input[name=multiLimit]").rules('add', {
        //             required: true,
        //             number: true,
        //             messages: {
        //                 required: "请输入轮播上限"
        //             }
        //         })
        //     } else {
        //         $("input[name=multiLimit]").rules('remove');
        //     }
        // });

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
                showTimeLimit:{
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
                showTimeLimit:{
                    number: "请输入有效的数字",
                    required: "请输入最大显示时长"
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
/**
 * Created by moka on 16-6-17.
 */
app.controller("advertiseManageCtrl", ["$scope", "$http", "ResAdvertisingFty",'$q','ResChannelFty','UploadKeyFty','$timeout','SysUserFty',
    function ($scope, $http, ResAdvertisingFty,$q,ResChannelFty,UploadKeyFty,$timeout,SysUserFty) {
        $scope.stateSel = {
            list:[
                {name:'启用',id:0},
                {name:'禁用',id:-1}
            ]
        }

        $scope.checkStateSel = {
            list:[
                {name:'审核中',id:0},
                {name:'审核通过',id:1},
                {name:'审核未通过',id:2}
            ]
        }
        $scope.hasDefaultSel = {
            list:[
                {name:'不展示',id:-1},
                {name:'未上传',id:0},
                {name:'已上传',id:1}
            ]
        };

        $scope.$on('loginUserInfo',function () {
            SysUserFty.userInfo({id: $scope.$parent.user.id}).then(function (res) {
                if (res) {
                    $scope.$user = res;
                }
            })
        });

        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.channelListSel.$destroy();
                d && ResChannelFty.getChannelsByMedia({mediaId: d.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            },
            sessionBack:function(d){
                if(d){
                    var key = this.key.split(',')[0];
                    ResChannelFty.getChannelsByMedia({mediaId: d[key]}).then(function (response) {
                        $scope.channelListSel.list = response.channels;
                    })
                }
            }
        };
        $scope.typeListSel = {};
        $scope.channelListSel = {};
        $scope.sizeListSel = {};

        //媒体 频道  创意
        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            if(response){
                $scope.mediaListSel.list = response.mediaList;
                $scope.typeListSel.list = response.typeList;
                $scope.sizeListSel.list = response.sizeList;
            }
        });

        $scope.$on('res-adCreate-create',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ResAdvertisingFty.ADSpaceList($scope.query).then(modView);
        })

        var pageSize = 10;
        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize:pageSize};

        $scope.queryValue = {};

        ResAdvertisingFty.ADSpaceList($scope.query).then(modView);

        $scope.copyHtml = "";

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.adSpaceNameOrId = $scope.query.search;
            ResAdvertisingFty.ADSpaceList($scope.query).then(modView);
        };
        //JS代码
        $scope.showJs = function (item) {
            var id = item.id;
            var type = item.adSpaceTypeId;
            var name = item.adSpaceName;
            var focusTemplate = item.focusTemplate;
            var JSCode = jsssssssss.replace("<%id%>", id);
            var JSdelayed = '<ins data-ycad-slot="<%id%>"></ins>'.replace('<%id%>',id);
            var JSbasics = '<script type="text/javascript" src="<%src%>"></script>'.replace('<%src%>',jsDelayed);
            $scope._jsCodeModule = {jsCode:JSCode,focusTemplate:focusTemplate,adSpaceTypeId:type,JSbasics:JSbasics,JSdelayed:JSdelayed};
            $scope._jsCodeModule.copyBtn = function(id){
                document.querySelector('#'+id).select();
                document.execCommand('copy');
                $scope._jsCodeModule.advertiseJsCode2 = false;
                $scope._jsCodeModule.advertiseJsCode3 = false;
                $scope._jsCodeModule.advertiseJsCode4 = false;
                $scope._jsCodeModule[id] = true;
            }

            $scope.jsCodeModule = {
                title:'【'+ name +'】' + 'JS代码',
                okClick:function(){

                }
            };
        };

        //审核
        $scope.checkRemark = "";
        $scope.isPass = function (item) {
            var checkState = item.checkState;
            var state = item.state;
            var id = item.id;
            var adSpaceTypeId = item.adSpaceTypeId;
            var adSpaceName = item.adSpaceName;
            var price = item.price;
            var textLinkStyle = item.textLinkStyle;
            var freeDistanceBot = item.freeDistanceBot;
            var freeDistance = item.freeDistance;

            // if (checkState != 0 && state == 0) {
            /*if (state == 0) {
                ycui.alert({
                    error:true,
                    content: "该广告位已经被审核，不能重复审核",
                    timeout: 10
                })
                return
            } else */
            if(!price){
                ycui.alert({
                    error:true,
                    content: "该广告位未填写刊例价，不能进行审核",
                    timeout: 10
                })
                return
            }
            item.catagorysList = [
                {name:'图片',id:1},
                {name:'JS',id:2},
                {name:'H5',id:3}
            ]
            if(item.catagorys){
                var list = item.catagorys.split(',');
                item.catagorysList.forEach(function(d){
                    if(list.indexOf(String(d.id)) != -1){
                        d.$check = true;
                    }
                })
            }

            $scope._isPassModule = angular.copy(item);

            var jsCode = jsssssssss.replace("<%id%>", id);
            $scope._isPassModule.jsCode = jsCode;
            $scope._isPassModule.copyBtn = function(){
                document.querySelector('#advertiseJsCode').select();
                document.execCommand('copy');
                $scope._isPassModule.copyBtnSuccess = true;
            }

            $scope._isPassModule.checkState = checkState || 1;

            /*广告类型为：画中画16、旗帜4、通栏2、矩形广告6*/
            $scope._isPassModule.$adSpaceType1 = [16,4,2,6].indexOf(+adSpaceTypeId) != -1;
            /*广告位类型为：纯文字链10、标题文字链19、图文文字链17、热点聚焦区文字链20*/
            $scope._isPassModule.$adSpaceType2 = [10,19,17,20].indexOf(+adSpaceTypeId) != -1;
            //默认值
            $scope._isPassModule.freeDistanceBot = freeDistanceBot == undefined?5:freeDistanceBot;
            $scope._isPassModule.freeDistance = freeDistance == undefined?5:freeDistance;;
            $scope._isPassModule.textLinkStyle = textLinkStyle || 1;

            $scope.$adSpaceTypeSel = [
                {id:5,name:'5像素'},
                {id:10,name:'10像素'},
                {id:20,name:'20像素'},
                {id:0,name:'无'},
                {id:-1,name:'其他'}
            ]

            $scope.isPassModule = {
                title:'【'+ adSpaceName +'】' + '广告位审核',
                okClick:function(){
                    $scope._isPassModule.$valid = true;

                    var focusTemplate = $scope._isPassModule.focusTemplate;
                    var checkRemark = $scope._isPassModule.checkRemark;
                    var checkState = $scope._isPassModule.checkState;

                    var freeDistance = $scope._isPassModule.freeDistance;
                    var freeDistanceBot = $scope._isPassModule.freeDistanceBot;
                    var textLinkStyle = $scope._isPassModule.textLinkStyle;

                    var body = {
                        id:id,
                        checkState:checkState
                    }
                    if($scope._isPassModule.$adSpaceType1){
                        body.freeDistance = freeDistance;
                        body.freeDistanceBot = freeDistanceBot;
                    }
                    if($scope._isPassModule.$adSpaceType2){
                        body.textLinkStyle = textLinkStyle;
                    }
                    if(focusTemplate){
                        body.focusTemplate = focusTemplate;
                    }
                    if(checkState == 2){
                        if(!checkRemark)return true;
                        body.checkRemark = checkRemark;
                    }
                    ResAdvertisingFty.checkADSpace(body).then(function (response) {
                        if (response.code == 200) {
                            ycui.alert({
                                content: response.msg,
                                okclick: function () {
                                    ResAdvertisingFty.ADSpaceList($scope.query).then(modView);
                                },
                                timeout: 10
                            });
                        }
                    });

                },
                noClick:function(){

                }
            }
        };


        //刊例价导出
        $scope._kanliModule = {mediaListSel:{}};
        $scope.kanliPricExport = function () {
            var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
                if(response){
                    $scope._kanliModule.mediaListSel.list = response.mediaList;
                }
            });

            $q.all([downListForSearch]).then(function () {
                $scope.kanliModule = {
                    title:'刊例导出',
                    okClick:function(){
                        $scope._kanliModule.$valid = true;
                        if($scope._kanliModule.mediaId == undefined){
                            return true;
                        }
                        var url = baseUrl + '/ADSpace/exportADspaceReport.htm?mediaId=' + ($scope._kanliModule.mediaId || '') +'&mediaName=' + ($scope._kanliModule.mediaName || '');
                        console.info(url)
                        window.open(url,'_blank');
                    },
                    noClick:function(){

                    }
                }
            })
        };


        // 打底广告上传
        var upload = function (item,type) {
            var uploadId = item.uploadId;
            if(type == 'left'){
                uploadId = item.uploadLeft;
            }else if(type == 'right'){
                uploadId = item.uploadRight;
            }
            var key = '';
            var config = {
                server: fileUrl + "/orderAdCreative/upload.htm",
                pick: {
                    id: '#'+ uploadId,
                    multiple: false
                },
                beforeFileQueued:function (uploader,file) {
                    ycui.loading.show();
                    uploader.stop(file);
                    UploadKeyFty.uploadKey().then(function (da) {
                        key = da.items;
                        uploader.upload(file);
                    });
                },
                uploadBeforeSend:function (uploader,file, data) {
                    data.uploadKey = key;
                    data.fileSize = item.fileSize;
                    var size;
                    if(type == 'right'){
                        size = item.size2.split('*')
                    }else{
                        size = item.size.split('*')
                    }
                    var sw = size[0];
                    var sh = size[1];
                    data.width = sw;
                    data.height = sh;
                },
                uploadComplete:function () {
                    ycui.loading.hide();
                },
                error:function (uploader,err) {
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: 10,
                        error:true
                    });
                    ycui.loading.hide();
                    uploader.reset();
                },
                uploadSuccess:function (uploader, file, res) {
                    if (res && res.code == 200) {
                        $scope._moduleDefaultShow.sizeError = false;
                        var src = res.adCreative.fileHttpUrl;
                        var data = {
                            id:item.id,
                            src: src,
                            width: 100,
                            height: 100
                        }
                        if(type == 'right'){
                            data.size = item.size2.split('*');
                            var html = photoAndSwfPreview(data);
                            $scope.$apply(function () {
                                $scope._moduleDefaultShow.html2 = html;
                                $scope._moduleDefaultShow.defaultUrl2 = src;
                            })
                        }else{
                            data.size = item.size.split('*');
                            var html = photoAndSwfPreview(data);
                            $scope.$apply(function () {
                                $scope._moduleDefaultShow.html1 = html;
                                $scope._moduleDefaultShow.defaultUrl1 = src;
                            })
                        }
                        $uploader.reset();
                    }else if(res && res.code == 500){
                        $scope.$apply(function () {
                            $scope._moduleDefaultShow.sizeError = true;
                            $scope._moduleDefaultShow.sizeErrorStr = res.msg;
                        });
                    }
                }
            }
            return uploadInit(config);
        }

        //是否打底广告
        var $uploader;
        var $uploader2;
        $scope.loadDefaultShow = function(item){
            $uploader && $uploader.destroy();
            $uploader2 && $uploader2.destroy();
            var item1 = angular.copy(item);
            $scope._moduleDefaultShow = item1;
            if(item1.enableBaseAd == 1){
                if(item1.size2){
                    item1.uploadLeft = 'enableBaseAd';
                    item1.uploadRight = 'enableBaseAd2';
                    $uploader = upload(item1,'left');
                    $uploader2 = upload(item1,'right');
                }else{
                    item1.uploadId = 'enableBaseAd';
                    $uploader = upload(item1);
                }
            }

            if(item1.defaultUrl1){
                var size = {
                    size1:item.size.split('*')
                };
                if(item1.defaultUrl1){
                    var data1 = {
                        id:item1.id,
                        src: item1.defaultUrl1,
                        width: 100,
                        height: 100,
                        size: item1.size.split('*')
                    }
                    $scope._moduleDefaultShow.html1 = photoAndSwfPreview(data1)
                }
                if(item1.defaultUrl2){
                    var data2 = {
                        id:item1.id,
                        src: item1.defaultUrl2,
                        width: 100,
                        height: 100,
                        size: item1.size2.split('*')
                    }
                    $scope._moduleDefaultShow.html2 = photoAndSwfPreview(data2)
                }
            }
            
            function showPhoto(ad,url,sizes,type){
                var data = {
                        src: url,
                        width: 100,
                        height: 100,
                        size: sizes
                    }
                var html = photoAndSwfPreview(data);
                if(type == 'right'){
                    ad.html2 = html
                }else{
                    ad.html1 = html
                }
            }

            function removePhoto(ad,type){
                $scope.$apply(function(){
                    if(type == 'right'){
                        delete ad.html2;
                    }else{
                        delete ad.html1;
                    }
                })
            }

            $scope._moduleDefaultShow.loadImg = function(ad,url,type){
                $timeout.cancel(ad.$$timeout);
                ~function(ad,url,type){
                    ad.$$timeout = $timeout(function(){
                        var img = new Image()
                        img.src = url;
                        img.onload = function(e){
                            var width = img.width;
                            var height = img.height;
                            showPhoto(ad,url,[width,height],type);
                            $scope.$apply(function(){
                                if(type == 'right'){
                                    delete ad.$sizesError2;
                                }else{
                                    delete ad.$sizesError1;
                                }
                            })
                        }
                        img.onerror = function(e){
                            if(type == 'right'){
                                $scope.$apply(function(){
                                    ad.$sizesError2 = '图片地址有误';
                                })
                                removePhoto(ad,'right');
                            }else{
                                $scope.$apply(function(){
                                    ad.$sizesError1 = '图片地址有误';
                                })
                                removePhoto(ad,'left');
                            }
                        }
                    },500)
                }(ad,url,type)
            }

            $scope.moduleDefault = {
                title:'【'+ item.adSpaceName +'】上传打底广告',
                okClick:function(){
                    var ad = $scope._moduleDefaultShow;
                    ad.$valid = true;
                    var enableBaseAd = ad.enableBaseAd;
                    var urlLoadType = ad.urlLoadType;
                    var defaultUrl1 = ad.defaultUrl1;
                    var defaultUrl2 = ad.defaultUrl2;
                    var defaultLandingPage = ad.defaultLandingPage;

                    var bo = false;
                    if(ad.urlLoadType == 0){
                        bo = ad.sizeError || !ad.defaultLandingPage;
                    }else{
                        bo = ad.$sizesError1 || ad.$sizesError2 || !ad.defaultLandingPage;
                    }
                    if(ad.size2 && (!defaultUrl2 || !defaultUrl1)){
                        bo = true;
                    }
                    if(bo) return true;
                    var query = {
                        id:ad.id,
                        enableBaseAd:enableBaseAd,
                        defaultUrl1:defaultUrl1,
                        defaultLandingPage:defaultLandingPage,
                        urlLoadType:urlLoadType
                    }
                    if(ad.size2){
                        query.defaultUrl2 = defaultUrl2;
                    }
                    ResAdvertisingFty.upDefaultUrl(query).then(function (res) {
                        if(res && res.code == 200){
                            ycui.alert({
                                content:res.msg,
                                timeout:10,
                                okclick:function () {
                                    ResAdvertisingFty.ADSpaceList($scope.query).then(modView);
                                }
                            })
                        }
                    })

                },
                noClick:function () {}
            }
        }

        //撤销打底广告
        $scope.recoveryDefaultAd = function (id, name) {
            ycui.confirm({
                title:'【'+ name +'】撤销打底广告',
                content:'是否撤销打底广告？',
                okclick:function () {
                    var body = {
                        id:id,
                        defaultUrl1:'',
                        defaultUrl2:'',
                        defaultLandingPage:''
                    }
                    ycui.loading.show();
                    ResAdvertisingFty.cancelDefault(body).then(function (res) {
                        ycui.loading.hide();
                        if(res && res.code == 200){
                            ycui.alert({
                                content:res.msg,
                                timeout:10,
                                okclick:function () {
                                    ResAdvertisingFty.ADSpaceList($scope.query).then(modView);
                                }
                            })
                        }
                    })
                },
                noclick:function () {}
            })
        }

        /**
         * 修改刊例价
         */
        $scope.editPriceCycle = function (id,item) {
            $scope._advertiseModule = angular.copy(item);
            $scope._advertiseModule.priceCycle = item.priceCycle || 1;
            console.info(item)
            $scope.advertiseModule = {
                title:'修改刊例价',
                okClick:function(){
                    $scope._advertiseModule.$valid = true;
                    var price = $scope._advertiseModule.price;
                    var remark = $scope._advertiseModule.remarkNew;
                    var priceCycle = $scope._advertiseModule.priceCycle;
                    if(price <= 0 || !remark){
                        return true;
                    }
                    var body = {
                        id:id,
                        price:price,
                        priceCycle:priceCycle,
                        remark:remark
                    }
                    ycui.loading.show()
                    ResAdvertisingFty.updatePrice(body).then(function(res){
                        ycui.loading.hide()
                        if(res && res.code == 200){
                            ResAdvertisingFty.ADSpaceList($scope.query).then(modView);
                        }
                    })
                },
                noClick:function(){

                }
            }
        };
        /**
         * 查看修改刊例价详情
         */
        $scope.priceCycleInfo = function (id,name) {
            var data = "";
            ycui.loading.show();
            ResAdvertisingFty.getPriceRecord({id:id}).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    res.records.forEach(function (da) {
                        data += '<tr style="outline:none"><td>'+ new Date(da.editTime).dateFormat("yyyy-MM-dd HH:mm:ss") +'</td><td style="text-align: left">'+ da.editAft +'</td><td style="text-align: left">'+ da.editRemark +'</td></tr>'
                    });
                    ycui.alert({
                        title:"【" + name + "】刊例价修改记录",
                        content:'<div style="max-height: 350px;overflow-y: auto;"><table class="yc-table"><thead><tr><td>修改时间</td><td>刊例价</td><td>备注</td></tr></thead><tbody>'+ data +'</tbody></table></div>',
                        timeout:10
                    })
                }
            })
        };
        /**
         * 禁用广告位
         */
        var upload2 = function (ob) {
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
        var affcheAddUpload;
        $scope.removeAdvertise = function (id,name) {
            $scope._disableModule = {publishRange:0,isAddaffche:0,uploadId:'affcheAddUpload'};

            $scope._disableModule.roleList = $scope.$user.roleList;
            $scope._disableModule.publishUserId = $scope.$user.id;
            $scope._disableModule.publishRoleId = $scope.$user.roleList[0].id;
            $scope._disableModule.publishUser = $scope.$user.trueName;

            affcheAddUpload && (affcheAddUpload.destroy());
            affcheAddUpload = upload2($scope._disableModule);

            $scope.disableModule = {
                title:'【'+ name +'】' + '禁用',
                okClick:function(){
                    $scope._disableModule.$valid = true;
                    var remark = $scope._disableModule.remark;
                    var title = $scope._disableModule.title;
                    var content = $scope._disableModule.content;
                    var publishRange = $scope._disableModule.publishRange;
                    var publishUserId = $scope._disableModule.publishUserId;
                    var publishRoleId = $scope._disableModule.publishRoleId;
                    var noticeAttachment = $scope._disableModule.noticeAttachment;
                    if(!remark || !title || !content){
                        return true;
                    }
                    var notice = {
                        title:title,
                        content:content,
                        publishRange:publishRange,
                        publishUserId:publishUserId,
                        publishRoleId:publishRoleId
                    }
                    if(noticeAttachment){
                        notice.noticeAttachment = noticeAttachment;
                    }
                    ycui.loading.show();
                    ResAdvertisingFty.remove({id:id,disableRemark:remark,notice:notice}).then(function (res) {
                        ycui.loading.hide();
                        if(res && res.code == 200){
                            ycui.alert({
                                content:res.msg,
                                timeout:10,
                                okclick:function () {
                                    ResAdvertisingFty.ADSpaceList($scope.query).then(modView);
                                }
                            })
                        }
                    })
                },
                noClick:function(){

                }
            }
        };

        $scope.reStartAdvertise = function (id) {
            ycui.loading.show();
            ResAdvertisingFty.reStart({id:id}).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ResAdvertisingFty.ADSpaceList($scope.query).then(modView);
                }
            })
        }

        $scope.invalidAD = function (id, name) {
            $scope.invalidADModule = {
                title: '【'+ name +'】作废',
                okClick:function () {
                    if(!this.remark){
                        this.$valid = true;
                        return true;
                    }
                    ycui.loading.show();
                    ResAdvertisingFty.invalidAD({id:id,remark:this.remark}).then(function (res) {
                        ycui.loading.hide();
                        if(res && res.code == 200){
                            ycui.alert({
                                content:res.msg,
                                timeout:10,
                                okclick:function () {
                                    ResAdvertisingFty.ADSpaceList($scope.query).then(modView);
                                }
                            })
                        }
                    })
                },
                noClick:function(){

                }
            }
        }
    }]);

/**
 * Created by moka on 16-6-17.
 */
app.controller("advertiseManageDisCtrl", ["$scope", "$http", "ResAdvertisingFty",'$q','ResChannelFty','UploadKeyFty','$timeout','SysUserFty',
    function ($scope, $http, ResAdvertisingFty,$q,ResChannelFty,UploadKeyFty,$timeout,SysUserFty) {

        $scope.stateSel = {
            list:[
                {name:'启用',id:0},
                {name:'禁用',id:-1}
            ]
        }

        $scope.checkStateSel = {
            list:[
                {name:'审核中',id:0},
                {name:'审核通过',id:1},
                {name:'审核未通过',id:2}
            ]
        }
        $scope.hasDefaultSel = {
            list:[
                {name:'不展示',id:-1},
                {name:'未上传',id:0},
                {name:'已上传',id:1}
            ]
        };

        $scope.$on('loginUserInfo',function () {
            SysUserFty.userInfo({id: $scope.$parent.user.id}).then(function (res) {
                if (res) {
                    $scope.$user = res;
                }
            })
        });

        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.channelListSel.$destroy();
                d && ResChannelFty.getChannelsByMedia({mediaId: d.id}).then(function (response) {
                    $scope.channelListSel.list = response.channels;
                })
            },
            sessionBack:function(d){
                if(d){
                    var key = this.key.split(',')[0];
                    ResChannelFty.getChannelsByMedia({mediaId: d[key]}).then(function (response) {
                        $scope.channelListSel.list = response.channels;
                    })
                }
            }
        };
        $scope.typeListSel = {};
        $scope.channelListSel = {};
        $scope.sizeListSel = {};

        //媒体 频道  创意
        var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
            if(response){
                $scope.mediaListSel.list = response.mediaList;
                $scope.typeListSel.list = response.typeList;
                $scope.sizeListSel.list = response.sizeList;
            }
        });

        $scope.$on('res-adCreate-create',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ResAdvertisingFty.invalidAdList($scope.query).then(modView);
        })

        var pageSize = 10;
        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize:pageSize,pageIndex:1};

        $scope.queryValue = {};

        ResAdvertisingFty.invalidAdList($scope.query).then(modView);

        $scope.copyHtml = "";

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.adSpaceNameOrId = $scope.query.search;
            ResAdvertisingFty.invalidAdList($scope.query).then(modView);
        };
        //JS代码
        $scope.showJs = function (item) {
            var id = item.id;
            var type = item.adSpaceTypeId;
            var name = item.adSpaceName;
            var focusTemplate = item.focusTemplate;
            var JSCode = jsssssssss.replace("<%id%>", id);
            var JSdelayed = '<ins data-ycad-slot="<%id%>"></ins>'.replace('<%id%>',id);
            var JSbasics = '<script type="text/javascript" src="<%src%>"></script>'.replace('<%src%>',jsDelayed);
            $scope._jsCodeModule = {jsCode:JSCode,focusTemplate:focusTemplate,adSpaceTypeId:type,JSbasics:JSbasics,JSdelayed:JSdelayed};
            $scope._jsCodeModule.copyBtn = function(id){
                document.querySelector('#'+id).select();
                document.execCommand('copy');
                $scope._jsCodeModule.advertiseJsCode2 = false;
                $scope._jsCodeModule.advertiseJsCode3 = false;
                $scope._jsCodeModule.advertiseJsCode4 = false;
                $scope._jsCodeModule[id] = true;
            }

            $scope.jsCodeModule = {
                title:'【'+ name +'】' + 'JS代码',
                okClick:function(){

                }
            };
        };

        //审核
        $scope.checkRemark = "";
        $scope.isPass = function (item) {
            var checkState = item.checkState;
            var state = item.state;
            var id = item.id;
            var adSpaceTypeId = item.adSpaceTypeId;
            var adSpaceName = item.adSpaceName;
            var price = item.price;
            var textLinkStyle = item.textLinkStyle;
            var freeDistanceBot = item.freeDistanceBot;
            var freeDistance = item.freeDistance;

            // if (checkState != 0 && state == 0) {
            /*if (state == 0) {
                ycui.alert({
                    error:true,
                    content: "该广告位已经被审核，不能重复审核",
                    timeout: 10
                })
                return
            } else */
            if(!price){
                ycui.alert({
                    error:true,
                    content: "该广告位未填写刊例价，不能进行审核",
                    timeout: 10
                })
                return
            }
            item.catagorysList = [
                {name:'图片',id:1},
                {name:'JS',id:2},
                {name:'H5',id:3}
            ]
            if(item.catagorys){
                var list = item.catagorys.split(',');
                item.catagorysList.forEach(function(d){
                    if(list.indexOf(String(d.id)) != -1){
                        d.$check = true;
                    }
                })
            }

            $scope._isPassModule = angular.copy(item);

            var jsCode = jsssssssss.replace("<%id%>", id);
            $scope._isPassModule.jsCode = jsCode;
            $scope._isPassModule.copyBtn = function(){
                document.querySelector('#advertiseJsCode').select();
                document.execCommand('copy');
                $scope._isPassModule.copyBtnSuccess = true;
            }

            $scope._isPassModule.checkState = checkState || 1;

            /*广告类型为：画中画16、旗帜4、通栏2、矩形广告6*/
            $scope._isPassModule.$adSpaceType1 = [16,4,2,6].indexOf(+adSpaceTypeId) != -1;
            /*广告位类型为：纯文字链10、标题文字链19、图文文字链17、热点聚焦区文字链20*/
            $scope._isPassModule.$adSpaceType2 = [10,19,17,20].indexOf(+adSpaceTypeId) != -1;
            //默认值
            $scope._isPassModule.freeDistanceBot = freeDistanceBot == undefined?5:freeDistanceBot;
            $scope._isPassModule.freeDistance = freeDistance == undefined?5:freeDistance;;
            $scope._isPassModule.textLinkStyle = textLinkStyle || 1;

            $scope.$adSpaceTypeSel = [
                {id:5,name:'5像素'},
                {id:10,name:'10像素'},
                {id:20,name:'20像素'},
                {id:0,name:'无'},
                {id:-1,name:'其他'}
            ]

            $scope.isPassModule = {
                title:'【'+ adSpaceName +'】' + '广告位审核',
                okClick:function(){
                    $scope._isPassModule.$valid = true;

                    var focusTemplate = $scope._isPassModule.focusTemplate;
                    var checkRemark = $scope._isPassModule.checkRemark;
                    var checkState = $scope._isPassModule.checkState;

                    var freeDistance = $scope._isPassModule.freeDistance;
                    var freeDistanceBot = $scope._isPassModule.freeDistanceBot;
                    var textLinkStyle = $scope._isPassModule.textLinkStyle;

                    var body = {
                        id:id,
                        checkState:checkState
                    }
                    if($scope._isPassModule.$adSpaceType1){
                        body.freeDistance = freeDistance;
                        body.freeDistanceBot = freeDistanceBot;
                    }
                    if($scope._isPassModule.$adSpaceType2){
                        body.textLinkStyle = textLinkStyle;
                    }
                    if(focusTemplate){
                        body.focusTemplate = focusTemplate;
                    }
                    if(checkState == 2){
                        if(!checkRemark)return true;
                        body.checkRemark = checkRemark;
                    }
                    ResAdvertisingFty.checkADSpace(body).then(function (response) {
                        if (response.code == 200) {
                            ycui.alert({
                                content: response.msg,
                                okclick: function () {
                                    ResAdvertisingFty.invalidAdList($scope.query).then(modView);
                                },
                                timeout: 10
                            });
                        }
                    });

                },
                noClick:function(){

                }
            }
        };


        //刊例价导出
        $scope._kanliModule = {mediaListSel:{}};
        $scope.kanliPricExport = function () {
            var downListForSearch = ResAdvertisingFty.downListForSearch().then(function (response) {
                if(response){
                    $scope._kanliModule.mediaListSel.list = response.mediaList;
                }
            });

            $q.all([downListForSearch]).then(function () {
                $scope.kanliModule = {
                    title:'刊例导出',
                    okClick:function(){
                        $scope._kanliModule.$valid = true;
                        if($scope._kanliModule.mediaId == undefined){
                            return true;
                        }
                        var url = baseUrl + '/ADSpace/exportADspaceReport.htm?mediaId=' + ($scope._kanliModule.mediaId || '') +'&mediaName=' + ($scope._kanliModule.mediaName || '');
                        console.info(url)
                        window.open(url,'_blank');
                    },
                    noClick:function(){

                    }
                }
            })
        };


        // 打底广告上传
        var upload = function (item,type) {
            var uploadId = item.uploadId;
            if(type == 'left'){
                uploadId = item.uploadLeft;
            }else if(type == 'right'){
                uploadId = item.uploadRight;
            }
            var key = '';
            var config = {
                server: fileUrl + "/orderAdCreative/upload.htm",
                pick: {
                    id: '#'+ uploadId,
                    multiple: false
                },
                beforeFileQueued:function (uploader,file) {
                    ycui.loading.show();
                    uploader.stop(file);
                    UploadKeyFty.uploadKey().then(function (da) {
                        key = da.items;
                        uploader.upload(file);
                    });
                },
                uploadBeforeSend:function (uploader,file, data) {
                    data.uploadKey = key;
                    data.fileSize = item.fileSize;
                    var size;
                    if(type == 'right'){
                        size = item.size2.split('*')
                    }else{
                        size = item.size.split('*')
                    }
                    var sw = size[0];
                    var sh = size[1];
                    data.width = sw;
                    data.height = sh;
                },
                uploadComplete:function () {
                    ycui.loading.hide();
                },
                error:function (uploader,err) {
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: 10,
                        error:true
                    });
                    ycui.loading.hide();
                    uploader.reset();
                },
                uploadSuccess:function (uploader, file, res) {
                    if (res && res.code == 200) {
                        $scope._moduleDefaultShow.sizeError = false;
                        var src = res.adCreative.fileHttpUrl;
                        var data = {
                            id:item.id,
                            src: src,
                            width: 100,
                            height: 100
                        }
                        if(type == 'right'){
                            data.size = item.size2.split('*');
                            var html = photoAndSwfPreview(data);
                            $scope.$apply(function () {
                                $scope._moduleDefaultShow.html2 = html;
                                $scope._moduleDefaultShow.defaultUrl2 = src;
                            })
                        }else{
                            data.size = item.size.split('*');
                            var html = photoAndSwfPreview(data);
                            $scope.$apply(function () {
                                $scope._moduleDefaultShow.html1 = html;
                                $scope._moduleDefaultShow.defaultUrl1 = src;
                            })
                        }
                        $uploader.reset();
                    }else if(res && res.code == 500){
                        $scope.$apply(function () {
                            $scope._moduleDefaultShow.sizeError = true;
                            $scope._moduleDefaultShow.sizeErrorStr = res.msg;
                        });
                    }
                }
            }
            return uploadInit(config);
        }

        //是否打底广告
        var $uploader;
        var $uploader2;
        $scope.loadDefaultShow = function(item){
            $uploader && $uploader.destroy();
            $uploader2 && $uploader2.destroy();
            var item1 = angular.copy(item);
            $scope._moduleDefaultShow = item1;
            if(item1.enableBaseAd == 1){
                if(item1.size2){
                    item1.uploadLeft = 'enableBaseAd';
                    item1.uploadRight = 'enableBaseAd2';
                    $uploader = upload(item1,'left');
                    $uploader2 = upload(item1,'right');
                }else{
                    item1.uploadId = 'enableBaseAd';
                    $uploader = upload(item1);
                }
            }

            if(item1.defaultUrl1){
                var size = {
                    size1:item.size.split('*')
                };
                if(item1.defaultUrl1){
                    var data1 = {
                        id:item1.id,
                        src: item1.defaultUrl1,
                        width: 100,
                        height: 100,
                        size: item1.size.split('*')
                    }
                    $scope._moduleDefaultShow.html1 = photoAndSwfPreview(data1)
                }
                if(item1.defaultUrl2){
                    var data2 = {
                        id:item1.id,
                        src: item1.defaultUrl2,
                        width: 100,
                        height: 100,
                        size: item1.size2.split('*')
                    }
                    $scope._moduleDefaultShow.html2 = photoAndSwfPreview(data2)
                }
            }
            
            function showPhoto(ad,url,sizes,type){
                var data = {
                        src: url,
                        width: 100,
                        height: 100,
                        size: sizes
                    }
                var html = photoAndSwfPreview(data);
                if(type == 'right'){
                    ad.html2 = html
                }else{
                    ad.html1 = html
                }
            }

            function removePhoto(ad,type){
                $scope.$apply(function(){
                    if(type == 'right'){
                        delete ad.html2;
                    }else{
                        delete ad.html1;
                    }
                })
            }

            $scope._moduleDefaultShow.loadImg = function(ad,url,type){
                $timeout.cancel(ad.$$timeout);
                ~function(ad,url,type){
                    ad.$$timeout = $timeout(function(){
                        var img = new Image()
                        img.src = url;
                        img.onload = function(e){
                            var width = img.width;
                            var height = img.height;
                            showPhoto(ad,url,[width,height],type);
                            $scope.$apply(function(){
                                if(type == 'right'){
                                    delete ad.$sizesError2;
                                }else{
                                    delete ad.$sizesError1;
                                }
                            })
                        }
                        img.onerror = function(e){
                            if(type == 'right'){
                                $scope.$apply(function(){
                                    ad.$sizesError2 = '图片地址有误';
                                })
                                removePhoto(ad,'right');
                            }else{
                                $scope.$apply(function(){
                                    ad.$sizesError1 = '图片地址有误';
                                })
                                removePhoto(ad,'left');
                            }
                        }
                    },500)
                }(ad,url,type)
            }

            $scope.moduleDefault = {
                title:'【'+ item.adSpaceName +'】上传打底广告',
                okClick:function(){
                    var ad = $scope._moduleDefaultShow;
                    ad.$valid = true;

                    var bo = false;
                    if(ad.urlLoadType == 0){
                        bo = ad.sizeError || !ad.defaultLandingPage
                    }else{
                        bo = ad.$sizesError1 || ad.$sizesError2 || !ad.defaultLandingPage
                    }
                    if(bo) return true;
                    var enableBaseAd = ad.enableBaseAd;
                    var urlLoadType = ad.urlLoadType;
                    var defaultUrl1 = ad.defaultUrl1;
                    var defaultUrl2 = ad.defaultUrl2;
                    var defaultLandingPage = ad.defaultLandingPage;

                    var query = {
                        id:ad.id,
                        enableBaseAd:enableBaseAd,
                        defaultUrl1:defaultUrl1,
                        defaultLandingPage:defaultLandingPage,
                        urlLoadType:urlLoadType
                    }
                    if(ad.size2){
                        query.defaultUrl2 = defaultUrl2;
                    }
                    ResAdvertisingFty.upDefaultUrl(query).then(function (res) {
                        if(res && res.code == 200){
                            ResAdvertisingFty.invalidAdList($scope.query).then(modView);
                            ycui.alert({
                                content:res.msg,
                                timeout:10
                            })
                        }
                    })

                }
            }
        }

                //             $scope._moduleDefaultShow.$valid = true;
        //             if($scope._moduleDefaultShow.sizeError || !$scope._moduleDefaultShow.defaultLandingPage)return true
        //             var data1 = $scope._moduleDefaultShow.data1;
        //             var data2 = $scope._moduleDefaultShow.data2;
        //             if(!data1 || !data1.src){
        //                 return true;
        //             }
        //             var id = data1.id;
        //             var defaultUrl1 = data1.src
        //             var enableBaseAd = $scope._moduleDefaultShow.enableBaseAd;
        //             var query = {
        //                 id:id,enableBaseAd:enableBaseAd,
        //                 defaultUrl1:defaultUrl1,
        //                 defaultLandingPage:$scope._moduleDefaultShow.defaultLandingPage
        //             }
        //             if($scope._moduleDefaultShow.$$is2){
        //                 if(!data2 || !data2.src){
        //                     return true;
        //                 }
        //                 var defaultUrl2 = data2.src;
        //                 if(!defaultUrl2){return true;}
        //                 query.defaultUrl2 = defaultUrl2;
        //             }
        //             ResAdvertisingFty.upDefaultUrl(query).then(function (res) {
        //                 if(res && res.code == 200){
        //                     ResAdvertisingFty.invalidAdList($scope.query).then(modView);
        //                     ycui.alert({
        //                         content:res.msg,
        //                         timeout:10
        //                     })
        //                 }
        //             })

        
        
        // $scope.moduleDefaultShow = function(item){
        //     $scope._moduleDefaultShow = {enableBaseAd:1,size:item.size,size2:item.size2}
        //     var key = '';
        //     var upload = function (item) {
        //         var config = {
        //             server: fileUrl + "/orderAdCreative/upload.htm",
        //             pick: {
        //                 id: '#'+ item.uploadId,
        //                 multiple: false
        //             },
        //             beforeFileQueued:function (uploader,file) {
        //                 ycui.loading.show();
        //                 uploader.stop(file);
        //                 UploadKeyFty.uploadKey().then(function (da) {
        //                     key = da.items;
        //                     uploader.upload(file);
        //                 });
        //             },
        //             uploadBeforeSend:function (uploader,file, data) {
        //                 data.uploadKey = key;
        //                 data.fileSize = item.fileSize;
        //                 var size;
        //                 if(item.$$is2){
        //                     size = item.size2.split('*')
        //                 }else{
        //                     size = item.size.split('*')
        //                 }
        //                 var sw = size[0];
        //                 var sh = size[1];
        //                 data.width = sw;
        //                 data.height = sh;
        //             },
        //             uploadComplete:function () {
        //                 ycui.loading.hide();
        //             },
        //             error:function (uploader,err) {
        //                 ycui.alert({
        //                     content: "错误的文件类型",
        //                     timeout: 10,
        //                     error:true
        //                 });
        //                 ycui.loading.hide();
        //                 uploader.reset();
        //             },
        //             uploadSuccess:function (uploader, file, res) {
        //                 if (res && res.code == 200) {
        //                     $scope._moduleDefaultShow.sizeError = false;

        //                     var data = {
        //                         id:item.id,
        //                         src: res.adCreative.fileHttpUrl,
        //                         width: 100,
        //                         height: 100,
        //                         size: item.size.split('*')
        //                     }
        //                     var html = photoAndSwfPreview(data)
        //                     if(item.$$is2){
        //                         $scope.$apply(function () {
        //                             $scope._moduleDefaultShow.html2 = html
        //                         })
        //                         $scope._moduleDefaultShow.data2 = data;
        //                     }else{
        //                         $scope.$apply(function () {
        //                             $scope._moduleDefaultShow.html1 = html
        //                         })
        //                         $scope._moduleDefaultShow.data1 = data;
        //                     }
        //                     $uploader.reset();
        //                 }else if(res && res.code == 500){
        //                     $scope.$apply(function () {
        //                         $scope._moduleDefaultShow.sizeError = true
        //                         $scope._moduleDefaultShow.sizeErrorStr = res.msg
        //                     });
        //                 }
        //             }
        //         }
        //         return uploadInit(config);
        //     }

        //     $uploader && $uploader.destroy();
        //     $uploader2 && $uploader2.destroy();
        //     var item1 = angular.copy(item);
        //     $scope._moduleDefaultShow.defaultLandingPage = item1.defaultLandingPage;
        //     $scope._moduleDefaultShow.enableBaseAd = item1.enableBaseAd;

        //     if(item1.enableBaseAd == 1){
        //         item1.uploadId = 'enableBaseAd';
        //         var item2;
        //         if(item1.size2){
        //             item2 = angular.copy(item);
        //             item2.size = item1.size2;
        //             item2.$$is2 = true;
        //             $scope._moduleDefaultShow.$$is2 = true;
        //             item2.uploadId = 'enableBaseAd2';
        //         }
        //         $uploader = upload(item1);
        //         item2 && ($uploader2 = upload(item2))
        //     }

        //     if(item1.defaultUrl1){
        //         var size = {
        //             size1:item.size.split('*')
        //         };
        //         if(item.defaultUrl1){
        //             var data1 = $scope._moduleDefaultShow.data1 = {
        //                 id:item.id,
        //                 src: item.defaultUrl1,
        //                 width: 100,
        //                 height: 100,
        //                 size: item.size.split('*')
        //             }
        //             $scope._moduleDefaultShow.html1 = photoAndSwfPreview(data1)
        //         }
        //         if(item1.defaultUrl2){
        //             var data2 = $scope._moduleDefaultShow.data2 = {
        //                 id:item.id,
        //                 src: item.defaultUrl2,
        //                 width: 100,
        //                 height: 100,
        //                 size: item.size2.split('*')
        //             }
        //             $scope._moduleDefaultShow.html2 = photoAndSwfPreview(data2)
        //         }
        //     }

        //     $scope.moduleDefault = {
        //         title:'【'+ item.adSpaceName +'】上传打底广告',
        //         okClick:function(){
        //             $scope._moduleDefaultShow.$valid = true;
        //             if($scope._moduleDefaultShow.sizeError || !$scope._moduleDefaultShow.defaultLandingPage)return true
        //             var data1 = $scope._moduleDefaultShow.data1;
        //             var data2 = $scope._moduleDefaultShow.data2;
        //             if(!data1 || !data1.src){
        //                 return true;
        //             }
        //             var id = data1.id;
        //             var defaultUrl1 = data1.src
        //             var enableBaseAd = $scope._moduleDefaultShow.enableBaseAd;
        //             var query = {
        //                 id:id,enableBaseAd:enableBaseAd,
        //                 defaultUrl1:defaultUrl1,
        //                 defaultLandingPage:$scope._moduleDefaultShow.defaultLandingPage
        //             }
        //             if($scope._moduleDefaultShow.$$is2){
        //                 if(!data2 || !data2.src){
        //                     return true;
        //                 }
        //                 var defaultUrl2 = data2.src;
        //                 if(!defaultUrl2){return true;}
        //                 query.defaultUrl2 = defaultUrl2;
        //             }
        //             ResAdvertisingFty.upDefaultUrl(query).then(function (res) {
        //                 if(res && res.code == 200){
        //                     ResAdvertisingFty.invalidAdList($scope.query).then(modView);
        //                     ycui.alert({
        //                         content:res.msg,
        //                         timeout:10
        //                     })
        //                 }
        //             })
        //         },
        //         noClick:function(){}
        //     }
        // };


        /**
         * 修改刊例价
         */
        $scope.editPriceCycle = function (id,item) {
            $scope._advertiseModule = angular.copy(item);
            $scope._advertiseModule.priceCycle = item.priceCycle || 1;
            console.info(item)
            $scope.advertiseModule = {
                title:'修改刊例价',
                okClick:function(){
                    $scope._advertiseModule.$valid = true;
                    var price = $scope._advertiseModule.price;
                    var remark = $scope._advertiseModule.remarkNew;
                    var priceCycle = $scope._advertiseModule.priceCycle;
                    if(price <= 0 || !remark){
                        return true;
                    }
                    var body = {
                        id:id,
                        price:price,
                        priceCycle:priceCycle,
                        remark:remark
                    }
                    ycui.loading.show()
                    ResAdvertisingFty.updatePrice(body).then(function(res){
                        ycui.loading.hide()
                        if(res && res.code == 200){
                            ResAdvertisingFty.invalidAdList($scope.query).then(modView);
                        }
                    })
                },
                noClick:function(){

                }
            }
        };
        /**
         * 查看修改刊例价详情
         */
        $scope.priceCycleInfo = function (id,name) {
            var data = "";
            ycui.loading.show();
            ResAdvertisingFty.getPriceRecord({id:id}).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    res.records.forEach(function (da) {
                        data += '<tr style="outline:none"><td>'+ new Date(da.editTime).dateFormat("yyyy-MM-dd HH:mm:ss") +'</td><td style="text-align: left">'+ da.editAft +'</td><td style="text-align: left">'+ da.editRemark +'</td></tr>'
                    });
                    ycui.alert({
                        title:"【" + name + "】刊例价修改记录",
                        content:'<div style="max-height: 350px;overflow-y: auto;"><table class="yc-table"><thead><tr><td>修改时间</td><td>刊例价</td><td>备注</td></tr></thead><tbody>'+ data +'</tbody></table></div>',
                        timeout:10
                    })
                }
            })
        };
        /**
         * 禁用广告位
         */
        var upload2 = function (ob) {
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
        var affcheAddUpload;
        $scope.removeAdvertise = function (id,name) {
            $scope._disableModule = {publishRange:0,isAddaffche:0,uploadId:'affcheAddUpload'};

            $scope._disableModule.roleList = $scope.$user.roleList;
            $scope._disableModule.publishUserId = $scope.$user.id;
            $scope._disableModule.publishRoleId = $scope.$user.roleList[0].id;
            $scope._disableModule.publishUser = $scope.$user.trueName;

            affcheAddUpload && (affcheAddUpload.destroy());
            affcheAddUpload = upload2($scope._disableModule);

            $scope.disableModule = {
                title:'【'+ name +'】' + '禁用',
                okClick:function(){
                    $scope._disableModule.$valid = true;
                    var remark = $scope._disableModule.remark;
                    var title = $scope._disableModule.title;
                    var content = $scope._disableModule.content;
                    var publishRange = $scope._disableModule.publishRange;
                    var publishUserId = $scope._disableModule.publishUserId;
                    var publishRoleId = $scope._disableModule.publishRoleId;
                    var noticeAttachment = $scope._disableModule.noticeAttachment;
                    if(!remark || !title || !content){
                        return true;
                    }
                    var notice = {
                        title:title,
                        content:content,
                        publishRange:publishRange,
                        publishUserId:publishUserId,
                        publishRoleId:publishRoleId
                    }
                    if(noticeAttachment){
                        notice.noticeAttachment = noticeAttachment;
                    }
                    ycui.loading.show();
                    ResAdvertisingFty.remove({id:id,disableRemark:remark,notice:notice}).then(function (res) {
                        ycui.loading.hide();
                        if(res && res.code == 200){
                            ycui.alert({
                                content:res.msg,
                                timeout:10,
                                okclick:function () {
                                    ResAdvertisingFty.invalidAdList($scope.query).then(modView);
                                }
                            })
                        }
                    })
                },
                noClick:function(){

                }
            }
        };

        $scope.reStartAdvertise = function (id) {
            ycui.loading.show();
            ResAdvertisingFty.reStart({id:id}).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ResAdvertisingFty.invalidAdList($scope.query).then(modView);
                }
            })
        }

        $scope.invalidAD = function (id, name) {
            $scope.invalidADModule = {
                title: '【'+ name +'】作废',
                okClick:function () {
                    if(!this.remark){
                        this.$valid = true;
                        return true;
                    }
                    ycui.loading.show();
                    ResAdvertisingFty.invalidAD({id:id}).then(function (res) {
                        ycui.loading.hide();
                        if(res && res.code == 200){
                            ycui.alert({
                                content:res.msg,
                                timeout:10,
                                okclick:function () {
                                    ResAdvertisingFty.invalidAdList($scope.query).then(modView);
                                }
                            })
                        }
                    })
                },
                noClick:function(){

                }
            }
        }
    }]);

/**
 * Created by moka on 16-6-17.
 */
app.controller("channelAddCtrl", ['$scope', 'ResChannelFty','ResChannelLevelFty','SysDepartmentFty',
    function ($scope, ResChannelFty, ResChannelLevelFty,SysDepartmentFty) {
        
        function ClearBr(key) {
            key = key.replace(/(\n)/g, "&");
            var arr = [];
            arr = key.split("&");
            return arr;
        }

        $scope.level = 0;
        $scope.mediaId = 0;

        $scope.departmentListSel = {};
        $scope.mediaListNameSel = {
            callback:function(e,d){
                $scope.departmentListSel.$destroy();
                if(d && d.companyId == 3){
                    SysDepartmentFty.parentDeps({companyId:d.companyId}).then(function(res){
                        if(res && res.code == 200){
                            $scope.departmentListSel.list = res.departmentList;
                        }
                    })
                }
            }
        };

        var downListForSearch = ResChannelFty.mediaListForAdd().then(function (res) {
            if(res && res.code == 200){
                $scope.mediaListNameSel.list = res.mediaList
            }
        });

        $scope.levelListSel = {}
        ResChannelLevelFty.channelLevelList().then(function(res){
            $scope.levelListSel.list = res.levels
        })

        $scope.postEdit = function () {
            var pass = true, parent;
            $scope.validate = true;

            if ($scope.level == 0) {
                pass = false;
            }
            if ($scope.mediaId == 0) {
                pass = false;
            }
            if (!$(".form").valid()) {
                pass = false;
            }

            if (pass) {
                ycui.loading.show();
                ResChannelFty.channelAdd({
                    channelNames: ClearBr($scope.channelNames),
                    mediaId: $scope.mediaId,
                    level: $scope.level,
                    depScope: $scope.depScope || ''
                }).then(function (response) {
                    ycui.loading.hide();
                    if (response.code == 200) {
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                goRoute('ViewMediaChannelADSpace2')
                            },
                            timeout: 10
                        });
                    } else if (response.code == 201) {
                        var arr = [];
                        arr = (response.msg.usedNames);
                        if (ClearBr($scope.channelNames).length == arr.length) {
                            ycui.alert({
                                content: "此频道名称：" + arr + "已经被注册",
                                timeout: -1
                            });
                        } else {
                            ycui.alert({
                                content: "此频道名称：" + arr + "已经被注册,其他的都注册成功",
                                okclick: function () {
                                    goRoute('ViewMediaChannelADSpace2')
                                },
                                timeout: 10
                            });
                        }
                    }
                })
            }
        }

        $(".form").validate({
            rules: {
                myText: "required"
            },
            messages: {
                myText: "请输入频道名称"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("channelEditCtrl", ['$scope', '$http','ResChannelFty','UploadKeyFty','ResChannelLevelFty','SysDepartmentFty',
    function ($scope, $http, ResChannelFty,UploadKeyFty,ResChannelLevelFty,SysDepartmentFty) {

        $scope.departmentListSel = {};
        $scope.levelListSel = {}
        ResChannelLevelFty.channelLevelList().then(function(res){
            console.info(res);
            $scope.levelListSel.list = res.levels
        })

        
        var id = getSearch("id");
        $scope.editManage = getSearch("editManage");

        ycui.loading.show();
        ResChannelFty.getChannel({id:id}).then(function (response) {
            ycui.loading.hide();
            $scope.channelName = response.channelName;
            $scope.level = response.level;
            $scope.mediaName = response.mediaName;
            $scope.mediaId = response.mediaId;
            $scope.depScope = response.depScope;

            if(response.imageUrl){
                $scope.imageUrl = response.imageUrl;
                var info = getImgInfo($scope.imageUrl);
                info.onload = function () {
                    var wh = proportionPhoto(info.width,info.height,75,75);
                    $scope.$apply(function () {
                        $scope._imageUrl = {
                            width:wh[0],
                            height:wh[1],
                            imageUrl:$scope.imageUrl
                        }
                    })
                }
            }
            if(response.companyId == 3){
                SysDepartmentFty.parentDeps({companyId:response.companyId}).then(function(res){
                    if(res && res.code == 200){
                        $scope.departmentListSel.list = res.departmentList;
                    }
                })
            }
        });

        // $scope.updateLevel = function (id) {
        //     $scope.level = id;
        //     $('.select-level').parent().find('.error-message').remove();
        // }

        // $scope.updateMediaName = function (id) {
        //     $scope.mediaId = id;
        //     $('.select-media').parent().find('.error-message').remove();
        // }

        $scope.postEdit = function () {
            var pass = true;

            if (!$(".form").valid()) {
                pass = false;
            }
            
            var body = {
                id: id,
                channelName: $scope.channelName,
                level: $scope.level,
                mediaId: $scope.mediaId,
                depScope:$scope.depScope
            }

            $scope.imageUrl && (body.imageUrl = $scope.imageUrl);
            if(pass){
                ycui.loading.show();
                ResChannelFty.channelUpdate(body).then(function (res) {
                    ycui.loading.hide();
                    if (res && res.code == 200) {
                        ycui.alert({
                            content: res.msg,
                            okclick: function () {
                                goRoute('ViewMediaChannelADSpace2')
                            },
                            timeout: 10
                        });
                    }
                })
            }
        };

        $(".form").validate({
            rules: {
                myText: "required"
            },
            messages: {
                myText: "请输入频道名称"
            },
            errorClass: "error-span",
            errorElement: "span"
        });

        var upload = function(id){
            var key = '';
            var config = {
                server:fileUrl + "/channel/uploadPic.htm",
                pick: {
                    id: '#' + id
                },
                beforeFileQueued:function(uploader,file){
                    ycui.loading.show();
                    uploader.stop(file);
                    UploadKeyFty.uploadKey().then(function (da) {
                        key = da.items;
                        uploader.upload(file);
                    });
                },
                uploadBeforeSend:function(uploader,file,data){
                    data.uploadKey = key;
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                uploadSuccess:function(uploader,file, res){
                    if(res && res.code == 200){
                        $scope.imageUrl = res.imageUrl;
                        var w = res.width;
                        var h = res.height;
                        var wh = proportionPhoto(w,h,75,75);
                        $scope.$apply(function () {
                            $scope._imageUrl = {
                                width:wh[0],
                                height:wh[1],
                                imageUrl:$scope.imageUrl
                            }
                        })
                    }
                    ycui.loading.hide();
                }
            }
            uploadInit(config);
        }

        upload('channel-manage');
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("channelManageCtrl", ['$scope', '$http', 'ResChannelFty', 'ResMediaFty','$q','ResChannelLevelFty','SysCompanyFty','SysDepartmentFty',
    function ($scope, $http, ResChannelFty, ResMediaFty,$q,ResChannelLevelFty,SysCompanyFty,SysDepartmentFty) {

        $scope.departmentListSel = {
            callback:function(e,d){
                if(d){
                    $scope.query.depScope = d.agencyNumber;
                }else{
                    $scope.query.depScope = $scope.companyListSel.$placeholder.agencyNumber;//从暂存数据取出
                }
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                ResChannelFty.channelPageList($scope.query).then(modView)
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

        $scope.mediaListSel = {};
        
        $scope.levelNameSel = {}
        $scope.levelNameSel2 = {}
        ResChannelLevelFty.channelLevelList().then(function(res){
            $scope.levelNameSel.list = res.levels;
            $scope.levelNameSel2.list = angular.copy(res.levels);
        })

        $scope.hasImageSel = {
            list:[
                {name:'已上传',id:1},
                {name:'未上传',id:0}
            ]
        };
        var listForOrder = ResChannelFty.mediaListForSea().then(function (res) {
            if (res && res.code == 200) {
                $scope.mediaListSel.list = res.mediaList
            }
        });
        var pageSize = 10;
        $scope.query = {pageIndex:1,pageSize:pageSize};

        $scope.$on('res-channe-list',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ResChannelFty.channelPageList($scope.query).then(modView)
        })

        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        }
        ResChannelFty.channelPageList($scope.query).then(modView)

        var postApi = "/channel/batchUpdateLevel.htm";
       
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.channelNameOrId = $scope.query.search;
            ResChannelFty.channelPageList($scope.query).then(modView)
        };

        $scope.channeCheckAll = function(e){
            if(!$scope.items){
                return;
            }
            var bo = e.target.checked;
            for(var i = 0;i<$scope.items.length;i++){
                var data = $scope.items[i];
                data.$check = bo;
            }
        }

        $scope.setMoreLevel = function () {
            var arrId = [];
            for (var i = 0; i < $scope.items.length; i++) {
                var data = $scope.items[i];
                if (data.$check) {
                    arrId.push({
                        id:data.id
                    })
                }
            }
            if (arrId.length == 0) {
                ycui.alert({
                    error:true,
                    content: "请至少选择一个",
                    timeout: 10
                });
            } else {
                $scope.setMoreLevelModule = {
                    level:1,
                    title:'批量设置频道级别',
                    okClick:function () {
                        $http.post(baseUrl + postApi, {
                            channels: arrId,
                            level: $scope._setMoreLevelModule.level
                        }).then(function (response) {
                            if (response.code == 200) {
                                ycui.alert({
                                    content: response.msg,
                                    okclick: function () {
                                        ResChannelFty.channelPageList($scope.query).then(modView)
                                    },
                                    timeout: 10
                                });
                            }
                        })
                    },
                    noClick:function () {}
                }
            }
        }
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("channelLevelAddCtrl", ['$scope', 'ResChannelLevelFty',
    function ($scope, ResChannelLevelFty) {
        $scope.channelLevel = {};

        $scope.postEdit = function () {
            if(!$(".form").valid())return;
            ycui.loading.show();
            ResChannelLevelFty.channelLevelAdd($scope.channelLevel).then(function(res){
                console.info(res);
                ycui.loading.hide();
                if (res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewMediaChannelADSpace4')
                        },
                        timeout: 10
                    });
                }
            })
        }

        $(".form").validate({
            rules: {
                levelName: "required"
            },
            messages: {
                levelName: "请输入频道级别名称"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("channelLevelEditCtrl", ['$scope', 'ResChannelLevelFty',
    function ($scope, ResChannelLevelFty) {
        var id = getSearch("id");

        ycui.loading.show();
        ResChannelLevelFty.channelLevelOne({id:id}).then(function (res) {
            if(res){
                $scope.channelLevel = res;
            }
            ycui.loading.hide();
        });

        $scope.postEdit = function () {
            if(!$(".form").valid())return;
            var body = {
                id:$scope.channelLevel.id,
                levelName:$scope.channelLevel.levelName
            }
            $scope.channelLevel.remark && (body.remark = $scope.channelLevel.remark);

            ycui.loading.show();
            ResChannelLevelFty.channelLevelEdit($scope.channelLevel).then(function(res){
                ycui.loading.hide();
                if (res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewMediaChannelADSpace4')
                        },
                        timeout: 10
                    });
                }
            })
        };

        $(".form").validate({
            rules: {
                levelName: "required"
            },
            messages: {
                levelName: "请输入频道级别名称"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("channelLevelManageCtrl", ['$scope', 'ResChannelLevelFty', 
    function ($scope, ResChannelLevelFty) {
        
        var pageSize = 10;
        $scope.query = {pageIndex:1,pageSize:pageSize};

        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        }

        ResChannelLevelFty.channelLevelPageList($scope.query).then(modView);

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.levelNameOrId = $scope.query.search;
            ResChannelLevelFty.channelLevelPageList($scope.query).then(modView);
        };
        
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("createAddCtrl", ['$scope', '$http',
    function ($scope, $http) {
        var postApi = "/ADSpaceType/add.htm";

        function ClearBr(key) {
            var arr = [];
            arr = key.split(/[\r\n]+/);
            var i = arr.length, re = [];
            while (i--) {
                re.push({name: arr[i]});
            }
            return re;
        };
        $scope.name = "";

        $scope.postEdit = function () {
            ycui.loading.show();
            $http.post(baseUrl + postApi, {
                types: ClearBr($scope.name)
            }).then(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            location.replace("createManage.html")
                        },
                        timeout: -1
                    });
                } else if (response.code == 201) {
                    var arr = [];
                    arr = (response.msg.usedNames);
                    if (ClearBr($scope.name).length == arr.length) {
                        ycui.alert({
                            content: "此创意名称：" + arr + "已经被注册",
                            timeout: -1
                        });
                    } else {
                        ycui.alert({
                            content: "此创意名称：" + arr + "已经被注册,其他的都注册成功",
                            okclick: function () {
                                location.replace("createManage.html")
                            },
                            timeout: -1
                        });
                    }
                }
            })
        }

        $(".createIncreaseForm").validate({
            rules: {
                myText: "required"
            },
            messages: {
                myText: "请输入创意名称"
            },
            errorClass: "error-span",
            errorElement: "span",
            submitHandler: function (form) {
                $scope.postEdit();
            }
        })
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("createEditCtrl", ['$scope', 'ResCreativityFty',
    function ($scope, ResCreativityFty) {

        $scope.catagorysList = [
            {name:'图片',value:1},
            {name:'JS',value:2},
            {name:'H5',value:3}
        ];

        var id = getSearch("id");

        ycui.loading.show();
        ResCreativityFty.getADType({id:id}).then(function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.createType = response;

            var catagorys = response.catagorys;
            if(catagorys){
                var list = catagorys.split(',');
                $scope.catagorysList.forEach(function (da) {
                    if(list.indexOf(String(da.value)) != -1){
                        da.check = true;
                    }
                })
            }
        })

        $scope.catagorysValid = function(){
            var ca = $scope.catagorysList;
            for(var i = 0;i<ca.length;i++){
                if(ca[i].check){
                    return true;
                }
            }
        }

        $scope.postEdit = function () {
            $scope.validShow = true;
            var bo = false;
            var catagorys = [];
            $scope.catagorysList.forEach(function(data){
                if(data.check){
                    catagorys.push(data.value);
                }
            })
            if(catagorys.length == 0){bo = true;}
            if(!$(".form").valid()){bo = true;};
            if(bo)return;
            ycui.loading.show();
            var body = angular.copy($scope.createType);

            delete body.updateTime
            delete body.createTime
            body.catagorys = catagorys.join(',');
            ResCreativityFty.update(body).then(function(res){
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewCreativeType');
                        },
                        timeout: 10
                    });
                }
                ycui.loading.hide();
            })
        }

        $(".form").validate({
            rules: {
                myText: "required",
                sort: "required",
            },
            messages: {
                myText: "请输入创意名称",
                sort: "请输入排序序号"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("createManageCtrl", ["$scope", "$http", "ResCreativityFty",
    function ($scope, $http, ResCreativityFty) {
        var pageSize = 10;
        $scope.query = {pageSize: pageSize};

        var getApi = "/ADSpaceType/pageList.htm";
        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };
        ResCreativityFty.adSpacePageList($scope.query).then(modView);
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.typeNameOrId = $scope.query.search;
            ResCreativityFty.adSpacePageList($scope.query).then(modView);
        };

        $scope.replaceReg = function (catagorys) {
            var catagorysList = [
                {name:'图片',value:1},
                {name:'JS',value:2},
                {name:'H5',value:3}
            ];
            catagorys = catagorys.split(',');
            var str = '';
            catagorysList.forEach(function (da) {
                if(catagorys.indexOf(String(da.value)) != -1 ){
                    str += ',' + da.name;
                }
            })
            return str.substr(1);
        }


    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("mediaAddCtrl", ['$scope', '$http', 'ResMediaFty','$q',
    function ($scope, $http, ResMediaFty,$q) {
        $scope.companyListSel = {}
        var companyList = ResMediaFty.companyList().then(function (res) {
            if (res && res.code == 200) {
                $scope.companyListSel.list = res.companyList;
            }
        });
        $scope.medias = [];

        function addMedia(){
            $scope.medias.push({
                url: "http://",
                mediaType:1,
                companyListSel:angular.copy($scope.companyListSel)
            })
        }

        $q.all([companyList]).then(function(){
            addMedia()
        })

        $scope.addMedia = function () {
            addMedia()
        };

        $scope.removeMedia = function (index) {
            $scope.medias.splice(index, 1);
        };

        $scope.postEdit = function () {
            var info = "";
            var pass = false;
            var regUrl = /^((https?|ftp|news):\/\/)?([a-z]([a-z0-9\-]*[\.。])+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&]*)?)?(#[a-z][a-z0-9_]*)?$/;
            for (var i = 0; i < $scope.medias.length; i++) {
                var data = $scope.medias[i];
                if (!data.mediaName) {
                    info = '请填写媒体名称';
                    pass = true;
                    break;
                }
                if (!data.companyId) {
                    info += ' 请选择公司';
                    pass = true;
                    break;
                }
                if (!data.mediaType) {
                    info += ' 请选择媒体类型';
                    pass = true;
                    break;
                }
                if (!regUrl.test(data.url)) {
                    info += ' 请正确填写域名';
                    pass = true;
                    break;
                }
            }
            // $(".form")
            //     .find('.error-message')
            //     .remove();
            // $(".yc-resourse:eq(" + i + ")").after('<span class="error-message" style="line-height: 50px;">' + info + '</span>');

            if (pass) {
                return;
            }
            ycui.loading.show()
            ResMediaFty.mediaAdd({medias: $scope.medias}).then(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewMediaChannelADSpace1')
                        },
                        timeout: 10
                    })
                } else if (response && response.code == 201) {
                    if ($scope.medias.length == response.msg.usedNames.length) {
                        ycui.alert({
                            error:true,
                            content: "此媒体名称：" + response.msg.usedNames + "已经被注册",
                            timeout: 10
                        });
                        $scope.medias = [];
                    } else {
                        ycui.alert({
                            content: "此媒体名称：" + response.msg.usedNames + "已经被注册,其它注册成功",
                            timeout: 10,
                            okclick: function () {
                                goRoute('ViewMediaChannelADSpace1')
                            }
                        });
                    }
                }
            })
        }
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("mediaEditCtrl", ['$scope', '$http', 'ResMediaFty',
    function ($scope, $http, ResMediaFty) {
        // ResMediaFty.companyList().then(function (res) {
        //     if (res && res.code == 200) {
        //         $scope.companyList = res.companyList;
        //     }
        // });

        var id = getSearch("id");
        ycui.loading.show();
        ResMediaFty.getMedia({id: id}).then(function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.medias = [{
                id: id,
                mediaName: response.mediaName,
                mediaType: response.mediaType,
                companyId: response.companyId,
                companyName: response.companyName,
                url: response.url
            }];
        });

        $scope.postEdit = function () {
            var info = "";
            var pass = false;
            var regUrl = /^((https?|ftp|news):\/\/)?([a-z]([a-z0-9\-]*[\.。])+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&]*)?)?(#[a-z][a-z0-9_]*)?$/;
            for (var i = 0; i < $scope.medias.length; i++) {
                var data = $scope.medias[i];
                if (!data.mediaName) {
                    info = '请填写媒体名称';
                    pass = true;
                    break;
                }
                if (!data.companyId) {
                    info += ' 请选择公司';
                    pass = true;
                    break;
                }
                if (!data.mediaType) {
                    info += ' 请选择媒体类型';
                    pass = true;
                    break;
                }
                if (!regUrl.test(data.url)) {
                    info += ' 请正确填写域名';
                    pass = true;
                    break;
                }
            }
            if (pass) {
                return;
            }
            ycui.loading.show();
            ResMediaFty.mediaUpdate($scope.medias[0]).then(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewMediaChannelADSpace1')
                        },
                        timeout: 10
                    });
                }
            })
        }
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("mediaManageCtrl", ["$scope", "$http", "ResMediaFty",'$q',
    function ($scope, $http, ResMediaFty,$q) {
        $scope.companyListSel = {}
        var companyList = ResMediaFty.companyList().then(function (res) {
            if(res && res.code == 200){
                $scope.companyListSel.list = res.companyList;
            }
        })

        $scope.mediaTypeSel = {
            list:[
                {name:'Web',id:1},
                {name:'Wap',id:2}
            ]
        };

        $scope.$on('res-media-media',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ResMediaFty.mediaPageList($scope.query).then(modView);
        })

        $scope.query = {pageSize:10};
        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        }
        ResMediaFty.mediaPageList($scope.query).then(modView);

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.mediaNameOrId = $scope.query.search;
            ResMediaFty.mediaPageList($scope.query).then(modView);
        };
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("sizeAddCtrl", ['$scope', 'ResSizeFty',
    function ($scope, ResSizeFty) {

        function ClearBr(key) {
            var arr = [];
            arr = key.split(/[\r\n]+/);
            return arr;
        };

        $scope.postEdit = function () {
            if(!$('.form').valid())return;
            var body = {
                sizes: ClearBr($scope.size)
            }
            ycui.loading.show();
            ResSizeFty.addSize(body).then(function(res){
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewSize');
                        },
                        timeout: 10
                    });
                }else if (res.code == 201){
                    var response = res;
                    var arr = [];
                    var arr1 = [];
                    arr = response.msg.usedNames;   //已有的尺寸
                    arr1 = response.msg.sizeErrors; //尺寸错误
                    if (arr.length > 0 && arr1.length > 0 && ClearBr($scope.size).length - (arr.length + arr1.length) > 0) {
                        ycui.alert({
                            content: "以下尺寸不正确：" + arr1 + "<br/>" + "以下尺寸已存在:" + arr + "<br/>" + "其他尺寸添加成功！",
                            okclick: function () {
                                location.replace("sizeManage.html")
                            },
                            timeout: -1
                        });
                    } else if (arr.length > 0 && arr1.length > 0 && ClearBr($scope.size).length - (arr.length + arr1.length) == 0) {
                        ycui.alert({
                            content: "以下尺寸不正确：" + arr1 + "<br/>" + "以下尺寸已存在:" + arr,
                            timeout: -1
                        });
                    } else if (arr1.length > 0) {
                        ycui.alert({
                            content: arr1 + "不是正确的尺寸，请重新填写",
                            timeout: -1
                        });
                    } else if (arr.length > 0 && ClearBr($scope.size).length - (arr.length + arr1.length) > 0) {
                        ycui.alert({
                            content: "该尺寸：" + arr + "已经被添加,其他的添加成功",
                            okclick: function () {
                                location.replace("sizeManage.html")
                            },
                            timeout: -1
                        });
                    } else {
                        ycui.alert({
                            content: "该尺寸：" + arr + "已经被添加",
                            timeout: -1
                        });
                    }
                }
            })
        }

        $(".form").validate({
            rules: {
                myText: "required"
            },
            messages: {
                myText: "请输入尺寸"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("sizeEditCtrl", ['$scope', 'ResSizeFty',
    function ($scope, ResSizeFty) {
        var id = getSearch("id");
        ycui.loading.show();
        ResSizeFty.getSize({id:id}).then(function (response) {
            ycui.loading.hide();
            var arr = [];
            $scope.size = response.size;
            arr = $scope.size.split("*");
            $scope.firstSize = arr[0];
            $scope.lastSize = arr[1];
        });

        $scope.postEdit = function(){
            if(!$(".form").valid())return;
            var body = {
                id: id,
                size: $scope.firstSize + "*" + $scope.lastSize
            }
            ycui.loading.show();
            ResSizeFty.updateSize(body).then(function(res){
                ycui.loading.hide();
                if (res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewSize')
                        },
                        timeout: 10
                    });
                }
            })
        }

        $(".form").validate({
            rules: {
                myText: "required",
                myText2: "required"
            },
            messages: {
                myText: "请输入尺寸",
                myText2: "请输入尺寸"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);
/**
 * Created by moka on 16-6-17.
 */
app.controller("sizeManageCtrl", ["$scope", "$http", "ResSizeFty",
    function ($scope, $http, ResSizeFty) {
        var pageSize = 10;
        $scope.query = {pageSize: pageSize};

        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            if(!response)return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        }
        ResSizeFty.sizePageList($scope.query).then(modView)

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.size = $scope.query.search;
            ResSizeFty.sizePageList($scope.query).then(modView)
        };
    }]);

/**
 * Created by moka on 16-6-17.
 */
app.controller("resLimitCtrl", ['$scope', 'SysRuleUserFty','SysLoginUserFty',
    function ($scope, SysRuleUserFty,SysLoginUserFty) {

        var loginUserInfo = SysLoginUserFty.loginUserInfo().then(function (res) {
            if (res && res.code == 200) {
                $scope.user = res;
                $scope.$broadcast('loginUserInfo',$scope.user);
            }
        });

        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 2}).then(function (res) {
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
            $scope.resourceRule = _object;
        })

        $scope.removePageIndex = function () {
            window.sessionStorage.removeItem('session_page_index');
        }
    }]);



$(".strategys-items a").click(function () {
    var i = $(this).index();
    $(this).addClass("strategys-itemsFa").siblings().removeClass("strategys-itemsFa")
    $(".yc-compile-articl").hide().eq(i).show();
})


//广告位状态
app.filter("isOpen", function () {
    return function (input) {
        if (input == -1) {
            return "禁用 "
        } else if (input == 0) {
            return "启用 "
        } else {
            return "启用"
        }
    }
})

//广告位所属页面
app.filter("toIndex", function () {
    return function (input) {
        if (input == 1) {
            return "首页 "
        } else if (input == 2) {
            return "频道 "
        } else {
            return "内容页"
        }
    }
})

//广告位审核状态   0 审核中 1 审核通过 2审核未通过
app.filter("markState", function () {
    return function (input) {
        if (input == 0) {
            return "审核中"
        } else if (input == 1) {
            return "审核通过"
        } else if (input == 2) {
            return "审核未通过"
        } else {
            return "--"
        }
    }
})

app.filter("typeApp", function () {
    return function (input) {
        if (input == 1) {
            return "Web"
        } else if (input == 2) {
            return "Wap"
        } else {
            return "App"
        }
    }
})
app.filter("channerType", function () {
    return function (input) {
        if (input == 1) {
            return "A类"
        } else if (input == 2) {
            return "B类"
        } else if (input == 3) {
            return "C类"
        } else if (input == 4) {
            return "D类"
        } else {
            return "E类"
        }
    }
})