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
                {name:'全部'},
                {name:'素材待监管',id:1},
                {name:'素材监管合格',id:2},
                {name:'素材监管不合格',id:3},
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
                {name:'全部'},
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
        var orderNamesForList = AdCreativeFty.orderNamesForList().success(function (response) {
            if (response && response.code == 200) {
                $scope.orderNameSel.list = response.orderNames;
                $scope.orderNameSel.list.unshift({orderName:'全部'})
            }
        });
        var sizeAllName = ResSizeFty.sizeAllName().success(function (response) {
            if (response && response.code == 200) {
                $scope.sizeSel.list = response.sizeList;
                $scope.sizeSel.list.unshift({size:'全部'})
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
                    {type:2,name:'素材监管',stateName:superviseToName('materialSupState',info.materialSupState),time:info.materialSupTime,remake:info.materialSupRemark,state:info.materialSupState},
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
                        return '素材待监管';
                        case 1:
                        return '素材监管合格';
                        case -1:
                        return '素材监管不合格';
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
        
        AdCreativeFty.adCreativeList($scope.query).success(modViewA)
        AdCreativeFty.adCreativeDataCount($scope.query).success(getDataCount);

        $scope.$on('createListGroup',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            AdCreativeFty.adCreativeList($scope.query).success(modViewA)
            AdCreativeFty.adCreativeDataCount($scope.query).success(getDataCount);
        })

        /*搜索框*/
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.adCreativeName = $scope.query.search;
            AdCreativeFty.adCreativeList($scope.query).success(modViewA);
            AdCreativeFty.adCreativeDataCount($scope.query).success(getDataCount);
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
            AdCreativeFty.adCreativeUpState(queryApi).success(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    AdCreativeFty.adCreativeList($scope.query).success(modViewA);
                    AdCreativeFty.adCreativeDataCount($scope.query).success(getDataCount);
                }
            })
        };

        $scope.$on('loginUserInfo',function () {
            SysUserFty.userInfo({id: $scope.$parent.user.id}).success(function (res) {
                if (res) {
                    $scope.$user = res;
                    console.info(res);
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
                var getAdMark = AdCreativeFty.getAdMark({ id: items.adMarkId }).success(function (res) {
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
                        httpPost.success(function (res) {
                            if (res && res.code == 200) {
                                ycui.alert({
                                    content: res.msg,
                                    timeout: 10,
                                    okclick:function () {
                                        AdCreativeFty.adCreativeList($scope.query).success(modViewA);
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

            switch(+catagory){
                case 1:
                switch (type) {
                    case 2:
                        var wh2 = size2.split("*");
                        if (typeId == 11) {
                            html += photoAndSwfPreview2({
                                src: url,
                                width: 200,
                                height: 200,
                                size: wh,
                                landingPage: landingPage,
                                adMarkUrl: adMarkUrl,
                                adMarkArea: adMarkArea
                            }, { src: url2, width: 200, height: 200, size: wh2, landingPage: landingPage });
                        } else {
                            if (url != undefined) {
                                html += photoAndSwfPreview({
                                    src: url,
                                    width: 200,
                                    height: 200,
                                    size: wh,
                                    landingPage: landingPage,
                                    adMarkUrl: adMarkUrl,
                                    adMarkArea: adMarkArea
                                });
                            }
                            if (url2 != undefined) {
                                html += photoAndSwfPreview({
                                    src: url2,
                                    width: 200,
                                    height: 200,
                                    size: wh2,
                                    landingPage: landingPage,
                                    adMarkUrl: adMarkUrl,
                                    adMarkArea: adMarkArea
                                });
                            }
                        }
                        break;
                    case 3:
                        if (url != undefined) {
                            html += photoAndSwfPreview({
                                src: url,
                                width: 200,
                                height: 200,
                                size: wh,
                                landingPage: landingPage,
                                adMarkUrl: adMarkUrl,
                                adMarkArea: adMarkArea
                            });
                        }
                        break;
                    case 4:
                        if (url != undefined) {
                            html += photoAndSwfPreview({
                                src: url,
                                width: 200,
                                height: 200,
                                size: wh,
                                landingPage: landingPage,
                                adMarkUrl: adMarkUrl,
                                adMarkArea: adMarkArea
                            });
                        }
                        break;
                    case 5:
                        if (url != undefined) {
                            html += photoAndSwfPreview({
                                src: url,
                                width: 200,
                                height: 200,
                                size: wh,
                                landingPage: landingPage,
                                adMarkUrl: adMarkUrl,
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
                var getAdMark = AdCreativeFty.getAdMark({ id: data.adMarkId }).success(function (res) {
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
                            }).success(function (response) {
                                if (response.code == 200) {
                                    ycui.alert({
                                        content: response.msg,
                                        timeout: -1,
                                        okclick: function () {
                                            AdCreativeFty.adCreativeList($scope.query).success(modViewA);
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
                                            AdCreativeFty.adCreativeList($scope.query).success(modViewA);
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
                            }).success(function (response) {
                                if (response.code == 200) {
                                    ycui.alert({
                                        content: response.msg,
                                        timeout: -1,
                                        okclick: function () {
                                            AdCreativeFty.adCreativeList($scope.query).success(modViewA);
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
                                            AdCreativeFty.adCreativeList($scope.query).success(modViewA);
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
                    UploadKeyFty.uploadKey().success(function (da) {
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
            var haveAddAffcheRule = SysRuleUserFty.getUserRightsByParentId({rightsParentId: 5}).success(function (res) {
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
                        AdCreativeFty.adCreativeBatchOpt(body).success(function(response){
                            if (response.code == 200) {
                                ycui.alert({
                                    content: response.msg,
                                    timeout: -1,
                                    okclick: function () {
                                        AdCreativeFty.adCreativeList($scope.query).success(modViewA);
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
                                            AdCreativeFty.adCreativeList($scope.query).success(modViewA);
                                        },
                                        timeout: 10
                                    });
                                } else {
                                    ycui.alert({
                                        content: "作废成功",
                                        okclick: function () {
                                            AdCreativeFty.adCreativeList($scope.query).success(modViewA);
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
                AdCreativeFty.adCreativeList($scope.query).success(modViewA);
                AdCreativeFty.adCreativeDataCount($scope.query).success(getDataCount);
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
                OrdersFty.orderDetail({ id: id }).success(function (res) {
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
