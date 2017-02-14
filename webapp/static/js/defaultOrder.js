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
/**
 * Created by moka on 16-6-21.
 */
app.controller("trueCreatelistEditCtrl", ['$scope', '$http', '$q','DefaultOrdersFty', "UploadKeyFty",
    function ($scope, $http, $q, DefaultOrdersFty,UploadKeyFty) {

        $scope.creative = {};

        var id = getSearch("id");
        var orderEdit = DefaultOrdersFty.defaultAdCreativeDetail({id:id}).then(function (res) {
            if(res && res.code == 200){
                $scope.creative = res.adCreative;

                var box = document.querySelector('.yc-indent-article');
                
                var size = res.adCreative.size.split("*");
                var html = photoAndSwfPreview({
                    src: res.adCreative.fileHttpUrl,
                    width: 266,
                    height: 180,
                    size: size,
                    style: false
                });
                box.innerHTML = html;
            }
        });

        $q.all([orderEdit]).then(function () {
            $scope.creative.uploadId = 'ad' + Math.uuid();
            setTimeout(function() {
                upload($scope.creative);    
            }, 20);
        });

        //点击禁用弹窗
        $scope.stateChange = function () {
            if ($scope.creative.priority == 99 && $scope.creative.state == -1) {
                ycui.confirm({
                    content: "创意禁用后不可投放！若再重新启用，须重新进入审批流程。请确认是否禁用该创意？",
                    noclick: function () {
                        $scope.$apply(function () {
                            $scope.creative.state = 0;
                        })
                    }
                });
            }
        };

        $scope.postEdit = function () {
            ycui.loading.show();
            DefaultOrdersFty.defaultAdCreativeUpdate($scope.creative).then(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewDefaultOrderCreate')
                        }
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
                            timeout: -1
                        });
                        uploader.reset();
                        return
                    }
                    if (res.code == 500) {
                        ycui.alert({
                            content: res.msg,
                            timeout: -1
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
                        style: false
                    })

                    var box = document.querySelector('.yc-indent-article');
                    box.innerHTML = html;
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                error:function(uploader,error){
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: 10
                    });
                    ycui.loading.hide();
                    uploader.reset();
                }
            }
            uploadInit(config);
        }



        // function uploadInit(data) {
        //     var size = data.size.split('*');
        //     var id = '#' + data.uploadId;
        //     var cof = {
        //             swf: baseUrl + "/static/lib/Uploader.swf",
        //             auto: false,
        //             server: fileUrl + '/defaultOrderAdCreative/upload.htm',
        //             pick: {
        //                 id: id,
        //                 multiple: false
        //             },
        //             accept: {
        //                 extensions: 'swf,gif,jpg,jpeg,bmp,png',
        //                 mimeTypes: 'image/*,application/x-shockwave-flash'
        //             }
        //         },
        //         uploader = WebUploader.create(cof);
        //     var key = "";
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
        //         data.width = size[0];
        //         data.height = size[1];
        //     })
        //     uploader.on('uploadSuccess', function (file, res) {
        //         if (res._raw == 'false') {
        //             ycui.alert({
        //                 content: "不正确的操作",
        //                 timeout: -1
        //             });
        //             uploader.reset();
        //             return
        //         }
        //         if (res.code == 500) {
        //             ycui.alert({
        //                 content: res.msg,
        //                 timeout: -1
        //             });
        //             uploader.reset();
        //             return
        //         }
        //         data.fileHttpUrl = res.adCreative.fileHttpUrl;
        //         data.fileMD5 = res.adCreative.fileMD5;
        //         data.fileSize = res.adCreative.fileSize;
        //         data.fileType = res.adCreative.fileType;
        //         var show = $(id).prev(".yc-indent1-article");
                
        //         show.attr("data-fileHttpUrl", res.adCreative.fileHttpUrl)
        //             .attr("data-fileMD5", res.adCreative.fileMD5)
        //             .attr("data-fileSize", res.adCreative.fileSize)
        //             .attr("data-fileType", res.adCreative.fileType)
        //             .attr("data-size", size.join('*'));
                
        //         var html = photoAndSwfPreview({
        //             src: res.adCreative.fileHttpUrl,
        //             width: 308,
        //             height: 250,
        //             size: size,
        //             style: false
        //         });
        //         show.html("");
        //         show.append(html)
        //     });
        //     uploader.on('uploadError', function (file, res) {
        //         ycui.alert({
        //             content: res
        //         });
        //         uploader.reset();
        //     });
        //     uploader.on('error', function () {
        //         ycui.alert({
        //             content: "错误的文件类型",
        //             timeout: -1
        //         });
        //         uploader.reset();
        //     });
        //     uploader.on("uploadComplete", function () {
        //         ycui.loading.hide();
        //     })
        // }

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
/**
 * Created by moka on 16-6-21.
 */
app.controller("trueCreateListCtrl", ["$scope", "$http", "DefaultOrdersFty", '$q',
    function ($scope, $http, DefaultOrdersFty, $q) {
        $scope.checkStateSel = {
            list:[
                {name:'全部'},
                {name:'审核中',id:0},
                {name:'审核通过',id:1},
                {name:'审核不通过',id:-1},
            ]
        }
        $scope.defaultOrderSel = {
            callback:function(e,d){
                if(d){
                    $scope.queryValue.orderName = d.orderName
                    $scope.query.orderId = d.id
                }
            },
            sessionBack:function(d){
                $scope.queryValue.orderName = d.orderName
                $scope.query.orderId = d.id
            }
        };

        //获取默认订单的名称下拉
        var defaultOrdersNameSearch = DefaultOrdersFty.defaultOrdersNameSearch().then(function (response) {
            $scope.defaultOrderSel.list = response.defaultOrdersList;
        });

        $scope.$on('deCreateListGroup',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            DefaultOrdersFty.defaultAdCreativeList($scope.query).then(modViewA);
            DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).then(getDataCount);
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

        var getDataCount = function (response) {
            if (response.code == 200) {
                $scope.clickAll = response.clickAll;
                $scope.pvAll = response.pvAll;
            }
        };

        $scope.query = {};
        $scope.queryValue = {};
        $scope.query.startDate = getDateFormat();
        $scope.query.endDate = getDateFormat();
        $scope.query.pageSize = 10;
        
        //保存查询条件
        // if (window.sessionStorage.getItem("trueCreateSession")) {
        //     var query = JSON.parse(window.sessionStorage.getItem("trueCreateSession")) || {};
        //     var queryValue = JSON.parse(window.sessionStorage.getItem('trueCreateValueSession')) || {};
        //     angular.extend($scope.query, query);
        //     angular.extend($scope.queryValue, queryValue);
        // }else{
        //     window.sessionStorage.setItem("trueCreateSession", JSON.stringify($scope.query));
        //     window.sessionStorage.setItem("trueCreateValueSession", JSON.stringify($scope.queryValue));
        // }
        
        var id = getSearch("orderId");
        var orderName = getSearch('orderName');
        $scope.query.orderId = id;
        $scope.queryValue.orderName = orderName;

        DefaultOrdersFty.defaultAdCreativeList($scope.query).then(modViewA);
        DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).then(getDataCount);

        //判断审核能不能跳转
        $scope.okChecked = function (id, priority, state, emergencyCheckState) {
            switch (priority) {
                case 0:
                    var checkState = $scope.$parent.trueAdvertisementRule['EmergencyCreativeAudit'];
                    if (!checkState) {
                        ycui.alert({
                            content: "没有默认创意审核权限"
                        });
                        return
                    }
                    break;
                case 99:
                    var defaultCheckState = $scope.$parent.trueAdvertisementRule['DefaultCreativeReview'];
                    if (!defaultCheckState) {
                        ycui.alert({
                            content: "没有紧急创意审核权限"
                        });
                        return
                    }
                    break;
            }

            if (state == 0) {   //紧急广告和启用状态
                if (emergencyCheckState != 0) {  //判断是不是审核中，不是就不能点
                    ycui.alert({
                        content: "该创意已被审核，不能重复审核"
                    })
                } else {
                    DefaultOrdersFty.defaultAdCreativeDetail({id: id}).then(function (data) {
                        var url = data.adCreative.fileHttpUrl;
                        var wh = data.adCreative.size.split("*");
                        var landingPage = data.adCreative.landingPage;
                        var adCreativeName = data.adCreative.adCreativeName;
                        var html = photoAndSwfPreview({
                            src: url,
                            width: 500,
                            height: 250,
                            size: wh,
                            landingPage: landingPage
                        });
                        $scope._okCheckedModule = data.adCreative || {};
                        $scope._okCheckedModule.$html = html;
                        $scope._okCheckedModule.$emergencyCheckState = 1;

                        $scope.okCheckedModule = {
                            title:"创意审核",
                            okClick:function(){
                                var check = $scope._okCheckedModule.$emergencyCheckState
                                var remark = $scope._okCheckedModule.$emergencyRemark
                                if(check == -1 && !remark){
                                    $scope._okCheckedModule.$valid = true;
                                    return true;
                                }
                                var query = {id: id, emergencyCheckState: check};
                                remark && (query.emergencyRemark = remark);
                                DefaultOrdersFty.checkEmergencyCheck(query).then(function (res) {
                                    if(res && res.code == 200){
                                        ycui.alert({
                                            content:res.msg,
                                            timeout:10,
                                            okclick:function(){
                                                DefaultOrdersFty.defaultAdCreativeList($scope.query).then(modViewA);
                                                DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).then(getDataCount);
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }
        };

        $scope.goOrderDefault = function(id){
            goRoute('ViewDefaultOrder',{
                creativeToOrderId:id
            },{
                stateWill:function(){
                    window.sessionStorage.removeItem('session_page_index');
                }
            })
        }

        //默认广告图片预览
        $scope.showPhoto = function (url, name, size, landingPage) {
            var wh = size.split("*");
            ycui.alert({
                content: "<div> " + photoAndSwfPreview({
                    src: url,
                    width: 700,
                    height: 350,
                    size: wh,
                    landingPage: landingPage
                }) + "</div>",
                timeout: 10,
                title: "【" + name + "】创意预览"
            })
        }

        //全选和全不选
        // var arrId = [];
        // var secValue = 0;
        // var oCheckIpt = document.getElementById("checkIpt");
        // var oTbody = document.getElementById("tBody");
        // var aIpt = oTbody.getElementsByTagName("input");
        // oCheckIpt.onclick = function () {
        //     for (var i = 0; i < aIpt.length; i++) {
        //         aIpt[i].checked = oCheckIpt.checked;
        //     }
        // }

        // setTimeout(function () {
        //     for (var i = 0; i < aIpt.length; i++) {
        //         aIpt[i].onclick = function () {
        //             var count = 0;
        //             for (var i = 0; i < aIpt.length; i++) {
        //                 if (aIpt[i].checked == true) {
        //                     count++;
        //                 }
        //             }
        //             if (count == aIpt.length) {
        //                 oCheckIpt.checked = true;
        //             } else {
        //                 oCheckIpt.checked = false;
        //             }
        //         }
        //     }
        // }, 1000)

        $scope.setMore = function () {
            var arrTrue = [];
            for (var i = 0; i < aIpt.length; i++) {
                if (aIpt[i].checked) {
                    arrTrue.push(aIpt[i])
                }
            }

            if (arrTrue.length == 0) {
                ycui.alert({
                    content: "请至少选择一个"
                });
            } else {
                var arrId = [];
                for (var i = 0; i < arrTrue.length; i++) {
                    arrId.push({
                        "adCreativeName": arrTrue[i].getAttribute("data-name"),
                        "id": arrTrue[i].getAttribute("data-id")
                    })
                }
                ycui.confirm({
                    content: '请确认，您将批量删除所选择的创意',
                    okclick: function () {
                        DefaultOrdersFty.defaultAdCreativeDelete({"creatives": arrId}).then(function (response) {
                            if (response.code == 200) {
                                ycui.alert({
                                    content: response.msg,
                                    okclick: function () {
                                        DefaultOrdersFty.defaultAdCreativeList($scope.query).then(modViewA);
                                        DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).then(getDataCount);
                                    }
                                });
                            } else if (response.code == 201) {
                                ycui.alert({
                                    content: response.hasPVNames.join(",") + "创意有投放数据，不能删除",
                                    okclick: function () {
                                        DefaultOrdersFty.defaultAdCreativeList($scope.query).then(modViewA);
                                        DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).then(getDataCount);
                                    }
                                });
                            }
                        })
                    }
                })
            }
        };

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

        $scope.deleteCreate = function (id, name,state) {
            var body = {creatives:[]};
            var arrCreate = body.creatives;
            if(id){
                arrCreate.push({adCreativeName: name, id: id});
                body.state = ~state
            }else{
                body.state = -1;
                for(var i = 0;i<$scope.items.length;i++){
                    var data = $scope.items[i];
                    if(data.$check){
                        arrCreate.push({
                            adCreativeName:data.adCreativeName,
                            id:data.id
                        })
                    }
                }
                if(arrCreate.length == 0){
                    ycui.alert({
                        error:true,
                        content:'请选择需要禁用的创意！'
                    });
                    return
                }
            }
            var msg = "请确认，您将执行禁用操作";
            if(state == -1 && id){
                msg = "请确认，您将执行启用操作";
            }
            ycui.confirm({
                content: msg,
                okclick: function () {
                    DefaultOrdersFty.defaultAdCreativeEnable(body).then(function (response) {
                        if (response.code == 200) {
                            ycui.alert({
                                content: response.msg,
                                okclick: function () {
                                    DefaultOrdersFty.defaultAdCreativeList($scope.query).then(modViewA);
                                    DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).then(getDataCount);
                                }
                            });
                        } else if (response.code == 201) {
                            ycui.alert({
                                error:true,
                                content: response.hasPVNames.join(",") + "已有投放数据，不能操作",
                                timeout: 10
                            });
                        }else if(response.code == 403){
                            ycui.alert({
                                error:true,
                                content: response.noRightNames.join(",") + "权限不够，不能操作",
                                timeout: 10
                            });
                        }
                    })
                }
            })
        };


        /*搜索框*/
        $scope.redirect = function (num,con) {
            ycui.loading.show();
            $scope.query.adCreativeNameOrId = $scope.query.search;
            DefaultOrdersFty.defaultAdCreativeList($scope.query).then(modViewA);
            DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).then(getDataCount);
        };

        var dateRange = new pickerDateRange('clientAff', {
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
                $scope.query.pageIndex = 1;
                DefaultOrdersFty.defaultAdCreativeList($scope.query).then(modViewA);
                DefaultOrdersFty.defaultAdCreativeDataCount($scope.query).then(getDataCount);
            }
        });
    }])
/**
 * Created by moka on 16-6-21.
 */
app.controller("orderRuleCtrl", ["$scope", "SysRuleUserFty","SysLoginUserFty",
    function ($scope, SysRuleUserFty,SysLoginUserFty) {

        var loginUserInfo = SysLoginUserFty.loginUserInfo().then(function (res) {
            if (res && res.code == 200) {
                $scope.user = res;
                $scope.$broadcast('loginUserInfo',res);
            }
        });

        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 1}).then(function (res) {
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
            $scope.trueAdvertisementRule = _object;
        })
    }]);

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
/**
 * Created by moka on 16-6-21.
 */
app.controller("trueAdvertisementAddCtrl", ['$scope', '$http','ResMediaFty','DefaultOrdersFty','UploadKeyFty','SysUserFty',
    function ($scope, $http,ResMediaFty,DefaultOrdersFty,UploadKeyFty,SysUserFty) {
        $scope.state = 0;
        $scope.priority = 0;
        $scope.landingPage = "http://";
        $scope.timeArr = [];

        //公告信息
        $scope.affche = {
            state:0,
            isPublic: 1,
            isEmail: 1,
            important: 0,
            publishRange:0
        };

        $scope.$on('loginUserInfo',function (event,data) {
            SysUserFty.userInfo({id: data.id}).then(function (res) {
                if (res) {
                    $scope.roleList = res.roleList;
                    $scope.affche.publishUserId = res.id;
                    $scope.affche.publishRoleId = $scope.roleList[0].id;
                    $scope.affche.publishUser = res.trueName;
                }
            })
        });

        var upload = function (id) {
            var key = '';
            var config = {
                server: fileUrl + "/contract/uploadNotice.htm",
                pick: {
                    id: '#'+id,
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
                            $scope.affche.noticeAttachment = res.uploadFile;
                        })
                    }
                }
            }
            return uploadInit(config);
        };

        upload('affcheAddUpload');


        //获取媒体名称
        ResMediaFty.listForDefautOrder().then(function (response) {
            $scope.media = response.mediaList;
        });

        function initPickerDate(data){
            !function(da){
                new pickerDateRange(da.id, {
                    defaultText: ' / ',
                    isSingleDay: false,
                    stopToday: false,
                    stopTodayBefore: true,
                    calendars: 2,
                    shortbtn: 0,
                    success: function (data) {
                        da.startTime = data.startDate;
                        da.endTime = data.endDate;
                    }
                });
            }(data)
        }

        $scope.timeArr = [{id: "calend1"}];

        $scope.$on('timeArrList',function(){
            var length = $scope.timeArr.length;
            initPickerDate($scope.timeArr[length-1])
        })

        $scope.addDiv = function () {
            var id = 't' + Math.uuid();
            $scope.timeArr.push({id: id});
        }

        $scope.removeDiv = function (ev, index) {
            $scope.timeArr.splice(index, 1);
        }

        var mediaName = [];
        $scope.mediaNamePush = function(e,id){
            if(id != undefined){
                var checked = e.target.checked;
                if(checked){
                    mediaName.push(id);
                }else{
                    for(var i = 0;i<mediaName.length;i++){
                        var s = mediaName[i];
                        if(s == id){
                            mediaName.splice(i,1);
                            break;
                        }
                    }
                }
            }else{
                return mediaName.length;
            }
        }

        $scope.postEdit = function () {
            $scope.validate = true;
            var bo = false;
            $scope.mediaIds = mediaName.join(",")
            if($scope.priority != 99){
                $scope.timeArr = [{id: "calend1"}];
            }
            var timeArr = [];
            for (var i = 0; i < $scope.timeArr.length; i++) {
                var da = $scope.timeArr[i];
                if (da.startTime && da.endTime) {
                    timeArr.push({
                        startTime: da.startTime,
                        endTime: da.endTime
                    })
                }
            }
            if (!$(".form").valid()) {bo = true;}
            if(!$scope.mediaIds){bo = true;}
            if(bo){return};

            var body = {
                orderShowDates: timeArr,
                orderName: $scope.orderName,
                state: $scope.state,
                priority: $scope.priority,
                landingPage: $scope.landingPage,
                mediaIds: $scope.mediaIds
            }

            if($scope.priority == 99){
               body.notice = $scope.affche; 
            }

            ycui.loading.show();
            DefaultOrdersFty.defaultOrdersAdd(body).then(function(res){
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            if ($scope.state == '0') {
                                goRoute('ViewDefaultOrderCreateAdd',{
                                    orderId:res.orderId,
                                    orderName:res.orderName
                                })
                            } else {
                                goRoute('ViewDefaultOrder')
                            }
                        },
                        timeout: 10
                    });
                }
            })

        }
        //表单验证
        $(".form").validate({
            rules: {
                orderName: "required",
                myUrl: {
                    required: true,
                    url: true
                },
                myTitle: "required",
                myContent: "required"
            },
            messages: {
                orderName: '必须填入订单名称',
                myUrl: {
                    required: '必须填入落地页地址'
                },
                myTitle: "请输入公告名称",
                myContent: "请输入公告内容"
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller("trueAdvertisementAuditCtrl", ["$scope", "$http", "DefaultOrdersFty",'ResMediaFty','$q',
    function ($scope, $http, DefaultOrdersFty,ResMediaFty,$q) {

        // function initPickerDate(data){
        //     !function(da){
        //         var s = da.startTime?new Date(da.startTime).dateFormat():'';
        //         var e = da.endTime?new Date(da.endTime).dateFormat():'';
        //         new pickerDateRange(da.id, {
        //             defaultText: ' 至 ',
        //             isSingleDay: false,
        //             stopToday: false,
        //             stopTodayBefore: true,
        //             calendars: 2,
        //             shortbtn: 0,
        //             startDate:s,
        //             endDate:e,
        //             success: function (data) {
        //                 da.startTime = data.startDate;
        //                 da.endTime = data.endDate;
        //             }
        //         });
        //     }(data)
        // }

        // $scope.addDiv = function () {
        //     var id = 't' + Math.uuid();
        //     $scope.orderShowDates.push({id: id});
        // }

        // $scope.removeDiv = function (ev, index) {
        //     $scope.orderShowDates.splice(index, 1);
        // }

        // ResMediaFty.listForOrder().then(function (response) {
        //     $scope.media = response.mediaList;
        // });

        // var mediaName = [];
        // $scope.mediaNamePush = function(e,id,name){
        //     if(id != undefined){
        //         var checked = e.target.checked;
        //         if(checked){
        //             mediaName.push({
        //                 id:id,
        //                 mediaName:name
        //             });
        //         }else{
        //             for(var i = 0;i<mediaName.length;i++){
        //                 var s = mediaName[i].id;
        //                 if(s == id){
        //                     mediaName.splice(i,1);
        //                     break;
        //                 }
        //             }
        //         }
        //     }else{
        //         return mediaName.length;
        //     }
        // }


        $scope.emergencyCheckState = 1
        var id = getSearch("id");
        ycui.loading.show();//$check
        var defaultOrdersDetail = DefaultOrdersFty.defaultOrdersDetail({id: id}).then(function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.orderName = response.order.orderName
            $scope.priority = response.order.priority
            $scope.showState = response.order.showState
            $scope.landingPage = response.order.landingPage
            $scope.mediaIds = response.order.mediaIds
            $scope.mediaNames = response.order.mediaNames
            mediaName = $scope.mediaLista = response.order.mediaList
            $scope.state = response.order.state
            $scope.orderShowDates = [];

            var orderShowDates = [];
            if ($scope.priority == 99) {
                for (var i = 0; i < response.order.orderShowDates.length; i++) {
                    orderShowDates.push({
                        id: "calend" + i,
                        "startTime": new Date(response.order.orderShowDates[i].startDate).dateFormat(),
                        "endTime": new Date(response.order.orderShowDates[i].endDate).dateFormat()
                    });
                }
            }
            // var timeArrList = $scope.$on('timeArrList',function(){
            //     orderShowDates.forEach(function(data,index,da){
            //         da.length - 1 != index && initPickerDate(data);
            //     })
            //     timeArrList();
            // })
            
            $scope.orderShowDates = orderShowDates;
        })

        // $scope.$on('timeArrList',function(){
        //     var length = $scope.orderShowDates.length;
        //     initPickerDate($scope.orderShowDates[length-1])
        // })

        $q.all([defaultOrdersDetail]).then(function(){
            ResMediaFty.listForOrder().then(function (response) {
                var m = $scope.mediaIds.split(',');
                var list = response.mediaList;
                for(var i = 0;i<list.length;i++){
                    if(m.indexOf(String(list[i].id)) != -1){
                        list[i].$check = true;
                    }
                }
                $scope.media = list;
            });
        })

        $scope.postEdit = function(){
            var pass = true;
            if ($scope.emergencyCheckState == 1) {
                pass = false;
                ycui.confirm({
                    content: "请确定是否将此订单设为审核通过？",
                    okclick: function () {
                        var id = parseInt(getSearch("id"));
                        DefaultOrdersFty.defaultOrderCheck({
                            id: id,
                            emergencyCheckState: 1
                        }).then(function (response) {
                            if (response.code == 200) {
                                ycui.alert({
                                    content: response.msg,
                                    okclick: function () {
                                        goRoute('ViewDefaultOrder')
                                    }
                                });
                            }
                        })
                    }
                });
            }

            if (pass) {
                var id = parseInt(getSearch("id"));
                ycui.loading.show();
                DefaultOrdersFty.defaultOrderCheck({
                    id: id,
                    emergencyRemark: $scope.emergencyRemark,
                    emergencyCheckState: $scope.emergencyCheckState
                }).then(function (response) {
                    ycui.loading.hide();
                    if (response && response.code == 200) {
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                goRoute('ViewDefaultOrder')
                            }
                        });
                    }
                })
            }
        }
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller("trueAdvertisementEditCtrl", ["$scope", "$http", "DefaultOrdersFty",'ResMediaFty','$q',
    function ($scope, $http, DefaultOrdersFty,ResMediaFty,$q) {

        function initPickerDate(data){
            !function(da){
                var s = da.startTime?new Date(da.startTime).dateFormat():'';
                var e = da.endTime?new Date(da.endTime).dateFormat():'';
                new pickerDateRange(da.id, {
                    defaultText: ' / ',
                    isSingleDay: false,
                    stopToday: false,
                    stopTodayBefore: true,
                    calendars: 2,
                    shortbtn: 0,
                    startDate:s,
                    endDate:e,
                    success: function (data) {
                        da.startTime = data.startDate;
                        da.endTime = data.endDate;
                    }
                });
            }(data)
        }

        $scope.addDiv = function () {
            var id = 't' + Math.uuid();
            $scope.orderShowDates.push({id: id});
        }

        $scope.removeDiv = function (ev, index) {
            $scope.orderShowDates.splice(index, 1);
        }

        // ResMediaFty.listForDefautOrder().then(function (response) {
        //     $scope.media = response.mediaList;
        // });

        var mediaName = [];
        $scope.mediaNamePush = function(e,id,name){
            if(id != undefined){
                var checked = e.target.checked;
                if(checked){
                    mediaName.push({
                        id:id,
                        mediaName:name
                    });
                }else{
                    for(var i = 0;i<mediaName.length;i++){
                        var s = mediaName[i].id;
                        if(s == id){
                            mediaName.splice(i,1);
                            break;
                        }
                    }
                }
            }else{
                return mediaName.length;
            }
        }



        var id = getSearch("id");
        ycui.loading.show();//$check
        var defaultOrdersDetail = DefaultOrdersFty.defaultOrdersDetail({id: id}).then(function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.orderName = response.order.orderName
            $scope.priority = response.order.priority
            $scope.showState = response.order.showState
            $scope.landingPage = response.order.landingPage
            $scope.mediaIds = response.order.mediaIds
            $scope.mediaNames = response.order.mediaNames
            mediaName = $scope.mediaLista = response.order.mediaList
            $scope.state = response.order.state
            $scope.orderShowDates = [];

            var orderShowDates = [];
            if ($scope.priority == 99) {
                for (var i = 0; i < response.order.orderShowDates.length; i++) {
                    orderShowDates.push({
                        id: "calend" + i,
                        "startTime": new Date(response.order.orderShowDates[i].startDate).dateFormat(),
                        "endTime": new Date(response.order.orderShowDates[i].endDate).dateFormat()
                    });
                }
            }
            var timeArrList = $scope.$on('timeArrList',function(){
                orderShowDates.forEach(function(data,index,da){
                    da.length - 1 != index && initPickerDate(data);
                })
                timeArrList();
            })
            
            $scope.orderShowDates = orderShowDates;
        })

        $scope.$on('timeArrList',function(){
            var length = $scope.orderShowDates.length;
            initPickerDate($scope.orderShowDates[length-1])
        })

        $q.all([defaultOrdersDetail]).then(function(){
            ResMediaFty.listForDefautOrder().then(function (response) {
                var m = $scope.mediaIds.split(',');
                var list = response.mediaList;
                for(var i = 0;i<list.length;i++){
                    if(m.indexOf(String(list[i].id)) != -1){
                        list[i].$check = true;
                    }
                }
                $scope.media = list;
            });
        })

        $scope.postEdit = function(){
            $scope.validate = true;
            var bo = false;
            $scope.mediaIds = mediaName.join(",");
            if($scope.priority != 99){
                $scope.orderShowDates = [{id: "calend1"}];
            }
            var timeArr = [];
            for (var i = 0; i < $scope.orderShowDates.length; i++) {
                var da = $scope.orderShowDates[i];
                if (da.startTime && da.endTime) {
                    timeArr.push({
                        startTime: da.startTime,
                        endTime: da.endTime
                    })
                }
            }
            if (!$(".form").valid()) {bo = true;}
            if(!$scope.mediaIds){bo = true;}
            if(bo){return};

            var body = {
                id: +id,
                orderShowDates: timeArr,
                orderName: $scope.orderName,
                state: $scope.state,
                priority: $scope.priority,
                landingPage: $scope.landingPage,
                mediaList: mediaName
            }

            ycui.loading.show();
            DefaultOrdersFty.defaultOrdersUpdate(body).then(function(res){
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewDefaultOrder')
                        },
                        timeout: 10
                    });
                }
                ycui.loading.hide();
            })
        }

        //表单验证
        $(".fForm").validate({
            rules: {
                orderName: "required",

                myUrl: {
                    required: true,
                    url: true
                }
            },
            messages: {
                orderName: '必须填入订单名称',
                myUrl: {
                    required: '必须填入落地页地址'
                }
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });

        //订单状态弹出提示
        $scope.changeState = function () {
            if ($scope.showState == 1 && $scope.state == -1) {
                ycui.confirm({
                    content: "<div>订单禁用后不可投放！</div>若从新开启，须重新进入审批流程<div> <div>请确认是否禁用该订单?</div>",
                    noclick: function () {
                        $scope.$apply(function () {
                            $scope.state = 0
                        })
                    }
                })
            }
        };
    }]);
/**
 * Created by moka on 16-6-21.
 */
app.controller("tureAdCtrl", ["$scope", "$http", "DefaultOrdersFty",
    function ($scope, $http, DefaultOrdersFty) {
        $scope.checkStateSel = {
            list:[
                {name:'全部'},
                {name:'审核中',id:0},
                {name:'审核通过',id:1},
                {name:'审核不通过',id:-1},
            ]
        }
        $scope.priorityOrderSel = {
            list:[
                {name:'全部'},
                {name:'默认广告',id:0},
                {name:'紧急广告',id:99},
                {name:'审核不通过',id:-1},
            ]
        }

        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            if(!response){return}
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        var getAllDate = function (response) {
            if (response && response.code == 200) {
                $scope.clickAll = response.clickAll;
                $scope.pvAll = response.pvAll;
                $scope.totalMoney = response.totalMoney;
            }
        };

        $scope.$on('deOrderListGroup',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            DefaultOrdersFty.defaultOrdersList($scope.query).then(modView);
            DefaultOrdersFty.defaultOrderDataCount($scope.query).then(getAllDate);
        })

        //判断审核能不能跳转
        $scope.okChecked = function (id, priority, state, emergencyCheckState) {
            switch (priority){
                case 0:
                    var checkState = $scope.$parent.trueAdvertisementRule['EmergencyOrderReview'];
                    if (!checkState) {
                        ycui.alert({
                            content: "没有默认订单审核权限"
                        });
                        return
                    }
                    break;
                case 99:
                    var defaultCheckState = $scope.$parent.trueAdvertisementRule['DefaultOrderReview'];
                    if (!defaultCheckState) {
                        ycui.alert({
                            content: "没有紧急订单审核权限"
                        });
                        return
                    }
                    break;
            }



            if (state == 0) {   //紧急广告和启用状态
                if (emergencyCheckState != 0) {  //判断是不是审核中，不是就不能点
                    ycui.alert({
                        content: "该订单已被审核，不能重复审核"
                    })
                } else {
                    goRoute('ViewDefaultOrderCheck',{
                        id:id
                    })
                }
            }
        };

        $scope.query = {};
        $scope.queryValue = {};
        $scope.query.startDate = getDateFormat();
        $scope.query.endDate = getDateFormat();
        $scope.query.pageSize = 10;

        var orderId = getSearch("creativeToOrderId");
        if (orderId) {
            var a = {pageSize: 10, creativeToOrderId: orderId};
            DefaultOrdersFty.defaultOrdersList(a).then(modView);
            DefaultOrdersFty.defaultOrderDataCount(a).then(getAllDate);
        } else {
            DefaultOrdersFty.defaultOrdersList($scope.query).then(modView);
            DefaultOrdersFty.defaultOrderDataCount($scope.query).then(getAllDate);
        }

        //搜索框
        $scope.redirect = function (num,co) {
            ycui.loading.show();
            $scope.query.defaultOrderNameOrID = $scope.query.search;
            $scope.query.pageIndex = num || 1;
            DefaultOrdersFty.defaultOrdersList($scope.query).then(modView);
            DefaultOrdersFty.defaultOrderDataCount($scope.query).then(getAllDate);
        };

        $scope.goDefaultCreate = function(id,name){
            goRoute('ViewDefaultOrderCreate',{
                orderId:id,
                orderName:name
            },{
                stateWill:function(){
                    window.sessionStorage.removeItem('session_page_index');
                }
            })
        }

        //默认显示当天的时间

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
                DefaultOrdersFty.defaultOrdersList($scope.query).then(modView);
                DefaultOrdersFty.defaultOrderDataCount($scope.query).then(getAllDate);
            }
        });

        $scope.changeState = function(state,id){
            function _changeState(res){
                if(res && res.code == 200){
                    ycui.alert({
                        content:res.msg,
                        timeout:10,
                        okclick:function(){
                            DefaultOrdersFty.defaultOrdersList($scope.query).then(modView);
                            DefaultOrdersFty.defaultOrderDataCount($scope.query).then(getAllDate);
                        }
                    })
                }
            }
            if(state == 0){
                ycui.confirm({
                    content: "<div>订单禁用后不可投放！</div>若重新开启，须重新进入审批流程<div> <div>请确认是否禁用该订单?</div>",
                    okclick: function () {
                        DefaultOrdersFty.enableOrder({state:~state,id:id}).then(_changeState)
                    }
                })
            }else{
                DefaultOrdersFty.enableOrder({state:~state,id:id}).then(_changeState)
            }
        }

    }]);
