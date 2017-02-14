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
