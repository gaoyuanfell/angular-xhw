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
