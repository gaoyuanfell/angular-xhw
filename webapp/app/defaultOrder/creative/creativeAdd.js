/**
 * Created by moka on 16-6-21.
 */
app.controller("trueCreatelistAddCtrl", ["$scope", "$http", "DefaultOrdersFty", "UploadKeyFty","ScheduleFty","ResMediaFty","$q",'ResChannelFty',
    function ($scope, $http, DefaultOrdersFty, UploadKeyFty,ScheduleFty,ResMediaFty,$q,ResChannelFty) {

        /**
         * 默认值
         * @type {{}}
         */
        $scope.creative = {state:0};
        $scope.uploadType = 0;

        // 广告位
        $scope.query = {pageSize: 5,paramInt1:$scope.creative.orderId};//搜索条件
        
        var modView = function (response) {
            ycui.loading.hide();
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.adListInfo = [];

        /**
         * 显示 广告位
         * @param name
         */
        $scope.orderNameListSel = {
            callback:function(e,d){
                if(d){
                    $scope.adListInfo = [];
                    $scope.adListInfoCache = [];
                    $scope.query.paramInt1 = d.id
                    if($scope.uploadType == 0){
                        uploadSize(d.id);
                    }
                    DefaultOrdersFty.getMediaByOrderId({orderId:d.id}).then(function (res) {
                        if(res && res.code == 200){
                            $scope.mediaListSel.list = res.items;
                        }
                    })
                }
            }
        };
        
        var defaultOrdersName = DefaultOrdersFty.defaultOrdersName().then(function (response) {
            if(response){
                $scope.orderNameListSel.list = response.defaultOrdersList;
            }
        });

        // 选择广告位
        $scope.mediaListSel = {
            callback:function(e,d){
                $scope.periodicationSel.$destroy();
                d && ResChannelFty.getChannelsByMedia({ mediaId: d.id }).then(function (response) {
                    $scope.periodicationSel.list = response.channels;
                });
            }
        };
        $scope.periodicationSel = {};
        $scope.sizeListSel = {};
        $scope.typeListSel = {};

        $scope.$on('default-create-ad',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            DefaultOrdersFty.getADspaceByDefaultOrderId($scope.query).then(modView);
        })

        ScheduleFty.dLInOrder().then(function (res) {
            if(res && res.code == 200){
                $scope.periodicationSel.list = res.periodicationList;
                $scope.sizeListSel.list = res.sizeList;
                $scope.typeListSel.list = res.typeList;
            }
        })

        //有id
        if(getSearch('orderId')){
            var id = getSearch('orderId')
            $scope.creative.orderId = $scope.query.paramInt1 = id;
            $scope.orderName = getSearch('orderName');
            if($scope.uploadType == 0){
                uploadSize(id);
            }
            DefaultOrdersFty.getMediaByOrderId({orderId:id}).then(function (res) {
                if(res && res.code == 200){
                    $scope.mediaListSel.list = res.items;
                }
            })
        }

        $scope.showCreativeList = function(){
            $scope.redirect = function (num,con) {
                ycui.loading.show();
                $scope.query.pageIndex = num || 1;
                $scope.query.param1 = $scope.query.search;
                DefaultOrdersFty.getADspaceByDefaultOrderId($scope.query).then(modView);
            };
            DefaultOrdersFty.getADspaceByDefaultOrderId($scope.query).then(modView);

            $scope.adSpaceModule = {
                title:'添加广告位',
                okClick:function(){
                    hideCreativeList();
                },
                noClick:function(){

                }
            }
        }

        function hideCreativeList() {
            var adListInfoCache = $scope.adListInfoCache;
            var adListInfo = $scope.adListInfo;
            var _cache = [];
            for(var i = 0; i <adListInfoCache.length; i++){
                var cache = adListInfoCache[i];
                var bo = true;
                for(var j = 0; j <adListInfo.length; j++){
                    var listInfo = adListInfo[j];
                    if(cache.id == listInfo.id){
                        bo = false;
                        break;
                    }
                }
                bo && (cache.uploadId = 'ad' + Math.uuid(),_cache.push(cache));
            }
            adListInfo = $scope.adListInfo = adListInfo.concat(_cache);
            var _cacheId = $scope._cacheId;
            if(_cacheId.length > 0){
                for(var a = 0; a <adListInfo.length; a++){
                    var listInfo = adListInfo[a];
                    if(_cacheId.indexOf(listInfo.id) != -1){
                        $scope.adListInfo.splice(a,1);
                        --a;
                    }
                }
            }
            $scope._cacheId.length = 0;

            // var _cache = [];
            // $scope.adListInfoCache.forEach(function (data) {
            //     if($scope.adListInfo.length>0){
            //         var _bo = false;
            //         $scope.adListInfo.forEach(function (da) {
            //             if(da.id == data.id){
            //                 _bo = true;
            //             }
            //         });
            //         if(!_bo){
            //             data.uploadId = 'ad' + Math.uuid();
            //             _cache.push(angular.copy(data))
            //         }
            //     }else{
            //         data.uploadId = 'ad' + Math.uuid();
            //         _cache.push(angular.copy(data))
            //     }
            // });
            // $scope.adListInfo = $scope.adListInfo.concat(_cache);
        };
        
        //暂存广告位
        $scope.adListInfoCache = [];

        $scope.putRightInfo = function (itemInfo) {
            for (var i = 0; i < $scope.adListInfoCache.length; i++) {
                if (itemInfo.id == $scope.adListInfoCache[i].id) {
                    return
                }
            }
            $scope.adListInfoCache.push(itemInfo);
        };
        
        //判断右边里有没有
        $scope.isInRight = function (id) {
            for (var i = 0; i < $scope.adListInfoCache.length; i++) {
                if (id == $scope.adListInfoCache[i].id) {
                    return "noShow"
                }
            }
        };

        $scope.deleteInfo = function (index) {
            var id = $scope.adListInfo[index].id;
            var adListInfoCache = $scope.adListInfoCache;
            for(var i = 0; i <adListInfoCache.length; i++){
                var cache = adListInfoCache[i];
                if(cache.id == id){
                    adListInfoCache.splice(i,1);
                    break;
                }
            }
            $scope.adListInfo.splice(index,1);
        };
        
        $scope.clearInfo = function () {
            $scope.adListInfoCache.length = 0;
        };
        $scope._cacheId = [];
        $scope.deleteInfoByIndex = function (index) {
            var _cache = $scope.adListInfoCache[index];
            $scope._cacheId.push(_cache.id);
            $scope.adListInfoCache.splice(index,1);
        };

        /**
         * 按照尺寸上传
         * @param id 
         */
        $scope.$on('adListInfoList',function(){
            $scope.adListInfo.forEach(function (data) {
                !data.$init && upload(data)
            })
        })
        function uploadSize(id) {
            DefaultOrdersFty.defaultAdCreativeSizeList({id: id}).then(function (res) {
                if(res && res.code == 200){
                    $scope.adListInfo = [];
                    var _cache = [];
                    res.size.forEach(function (data) {
                        _cache.push({
                            size:data,
                            uploadId: 'ad' + Math.uuid()
                        })
                    });
                    $scope.adListInfo = $scope.adListInfo.concat(_cache);
                }
            })
        }

        /**
         * 改变上传方式 重新初始化
         */
        $scope.uploadTypeChange = function () {
            if($scope.uploadType == 0){
                if($scope.creative.orderId != undefined){
                    uploadSize($scope.creative.orderId)
                }
            }else{
                $scope.adListInfo = []; 
            }
        };

        $scope.postEdit = function () {
            $scope.validateShow = true;
            if(!$(".form").valid()){
                return
            }
            var creatives = [];
            
            if($scope.uploadType == 0){
                $scope.adListInfo.forEach(function (data) {
                    if(!data.fileHttpUrl){
                        return;
                    }
                    creatives.push({
                        adCreativeName:$scope.creative.adCreativeName + data.size,
                        fileHttpUrl:data.fileHttpUrl,
                        size:data.size,
                        fileSize:data.fileSize,
                        fileType:data.fileType,
                        fileMD5:data.fileMD5
                    })
                });
            }else if($scope.uploadType == 1){
                $scope.adListInfo.forEach(function (data) {
                    if(!data.fileHttpUrl){
                        return;
                    }
                    creatives.push({
                        adCreativeName:$scope.creative.adCreativeName + data.size,
                        fileHttpUrl:data.fileHttpUrl,
                        size:data.size,
                        fileSize:data.fileSize,
                        fileType:data.fileType,
                        fileMD5:data.fileMD5,
                        adSpaceId:data.adSpaceId || data.id
                    })
                });
            }
            var body = {
                orderId:$scope.creative.orderId,
                state:$scope.creative.state,
                creatives:creatives
            }

            ycui.loading.show();
            DefaultOrdersFty.defaultAdCreativeAdd(body).then(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewDefaultOrderCreate')
                        },
                        timeout:10
                    });
                }
            })
        };

        var upload = function(data){
            var key = "";
            var size = data.size.split('*');
            var id = '#' + data.uploadId;
            var config = {
                server: fileUrl + '/defaultOrderAdCreative/upload.htm',
                pick: {
                    id: id,
                    multiple: false
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
                    data.width = size[0];
                    data.height = size[1];
                },
                uploadSuccess:function(uploader,file, res){
                    if (res._raw == 'false') {
                        ycui.alert({
                            content: "不正确的操作",
                            timeout: 10,
                            error:true
                        });
                        uploader.reset();
                        return
                    }
                    if (res.code == 500) {
                        ycui.alert({
                            content: res.msg,
                            timeout: 10,
                            error:true
                        });
                        uploader.reset();
                        return
                    }
                    data.fileHttpUrl = res.adCreative.fileHttpUrl;
                    data.fileMD5 = res.adCreative.fileMD5;
                    data.fileSize = res.adCreative.fileSize;
                    data.fileType = res.adCreative.fileType;

                    var html = photoAndSwfPreview({
                        src: res.adCreative.fileHttpUrl,
                        width: 266,
                        height: 180,
                        size: size,
                        style: true
                    })

                    var box = document.querySelector(id).previousElementSibling.querySelector('.yc-indent-article');
                    box.innerHTML = html;
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                error:function(uploader,error){
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: 10,
                        error:true
                    });
                    ycui.loading.hide();
                    uploader.reset();
                }
            }
            data.$init = true;
            uploadInit(config);
        }

        //表单验证
        $(".form").validate({
            rules: {
                adCreativeName: "required",
            },
            messages: {
                adCreativeName: '必须填入创意名称',
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);