app.controller('clientAddCtrl', ['$scope', '$http', 'SysLoginUserFty', 'CustomerFty', 'SysDepartmentFty','SysUserFty','SysCompanyFty',
    function ($scope, $http, SysLoginUserFty, CustomerFty, SysDepartmentFty,SysUserFty,SysCompanyFty) {

        $scope.clientModel = {};
        $scope.clientModel.discount = "100";
        $scope.clientModel.customerLevel = 1;

        $scope.clientTypeSel = {
            list: [{id: 1, name: "直客"}, {id: 2, name: "代理商"}, {id: 3, name: "代理子客户"}],
            callback:function(e,d){
                if(d && d.id != 3){
                    $scope.childListSel.$destroy();
                }
            }
        }
        /**
         * 获取子客户
         */
        $scope.childListSel = {}
        CustomerFty.getAllCustomer({customerType: 2}).then(function (response) {
            if(response){
                $scope.childListSel.list = response.items;
            }
        });


        SysLoginUserFty.loginUserInfo().then(function (data) {
            $scope.labelClientList.push({
                trueName:data.trueName,
                id:data.id
            });
        });

        // 下拉框
        // $scope.updateSelect = function (name, id) {
        //     if (name && id) {
        //         $scope.clientModel[name] = id;
        //         if(name == 'customerType' && id != 3){
        //             delete $scope.clientModel.parentId
        //         }
        //     }
        // };

        $scope.postEdit = function () {
            $scope.validShow = true;
            if(!$(".form").valid()){
                return;
            }
            
            if($scope.clientModel.customerType == 3 && !$scope.clientModel.parentId){
                return;
            }

            if(!$scope.clientModel.customerType  || !$scope.clientModel.customerLevel || $scope.labelClientList.length==0){
                return;
            }

            var query = $scope.clientModel;
            query.customerContacts = $scope.clientList;
            query.customerContacts.forEach(function (data, index) {
                data.contactSort = index + 1;
            });
            query.flowUsers = [];
            $scope.labelClientList.forEach(function (data) {
                query.flowUsers.push({id: data.id});
            });

            ycui.loading.show();
            CustomerFty.addCustomer(query).then(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewCustomer')
                        }
                    });
                }
            });

        }

        //客户类型下拉框
        // ycui.select(".yc-select");
        //表单验证
        $(".form").validate({
            rules: {
                clientName: "required",
                myUrl:'url'
            },
            messages: {
                clientName: '请输入客户名称',
                myUrl:'请填写正确的地址!'
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });

        /*业务员添加*/
        var pageSize = 5;
        $scope.query = {pageSize: pageSize}
        $scope.departmentListSel = {};
        $scope.companyListSel = {
            callback:function(e,d){
                $scope.departmentListSel.$destroy();
                d && SysUserFty.depAndUserList({companyId:d.id}).then(function (res) {
                    if(res && res.code == 200){
                        $scope.departmentListSel.list = res.departmentList;
                    }
                });
            }
        };
        SysCompanyFty.companyList().then(function (res) {
            if(res){
                $scope.companyListSel.list = res;
            }
        })

        var modView = function (response) {
            ycui.loading.hide();
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.logNameOrTrueName = $scope.query.search;
            CustomerFty.getCustomerFlowUser($scope.query).then(modView);
        };

        $scope.$on('client-add',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            CustomerFty.getCustomerFlowUser($scope.query).then(modView);
        })
        CustomerFty.getCustomerFlowUser($scope.query).then(modView);

        /**
         * 业务员
         * @type {Array}
         */
        $scope.labelClientList = [];

        $scope.showAdClient = function () {
            $scope.clientModule = {
                title:'选择业务员',
                okClick:function(){

                },
                noClick:function(){

                }
            }
        }

        //点击添加到右边
        $scope.putRightInfo = function (itemInfo) {
            for (var i = 0; i < $scope.labelClientList.length; i++) {
                if (itemInfo.id == $scope.labelClientList[i].id) {
                    return
                }
            }
            $scope.labelClientList.push(itemInfo);
        };

        //判断右边里有没有
        $scope.isInRight = function (id) {
            for (var i = 0; i < $scope.labelClientList.length; i++) {
                if (id == $scope.labelClientList[i].id) {
                    return "noShow"
                }
            }
        };

        $scope.clearInfo = function () {
            $scope.labelClientList.length = 0;
        };

        $scope.deleteInfo = function (index) {
            $scope.labelClientList.splice(index, 1)
        };

        /**
         * 联系人
         * @type {*[]}
         */
        $scope.clientList = [{}];
        $scope.addContact = function () {
            $scope.clientList.push({});
        }
        $scope.removeContact = function (index) {
            if ($scope.clientList.length != 1) {
                ycui.confirm({
                    title:"删除联系人",
                    content:"确定需要删除此联系人",
                    okclick:function () {
                        $scope.$apply(function () {
                            $scope.clientList.splice(index, 1);
                        })
                    }
                });
            }
        };
        /**
         * 改变优先级
         */
        $scope.switchingPosition = function (inx, index) {
            if (inx == 0 && index < 0) {
                return
            }
            if (inx == $scope.clientList.length - 1 && index == 1) {
                return
            }
            var form = $scope.clientList[inx];
            var to = $scope.clientList[inx + index];
            $scope.clientList.splice(inx, 1, to);
            $scope.clientList.splice(inx + index, 1, form);
        }
    }]);

/**
 * Created by moka on 16-6-16.
 */
app.controller('auditCtrl', ['$scope', '$http', 'CustomerFty',
    function ($scope, $http, CustomerFty) {
        $scope.clientModel = {customerState:1};

        //获取修改信息															
        var id = parseInt(getSearch("id"));
        ycui.loading.show();
        CustomerFty.getCustomer({id: id}).then(function (response) {
            ycui.loading.hide();
            if (response && response.code == 200) {
                delete response.items.updateTime;
                delete response.items.createTime;
                $scope.clientModel = response.items;
                
                $scope.clientModel.customerState = 1;//默认门审核通过

                $scope.labelClientList = $scope.clientModel.flowUsers;
                $scope.clientList = $scope.clientModel.customerContacts;
            }
        });

        ycui.select(".yc-select");
        
        function post() {
            ycui.loading.show();
            CustomerFty.reviewCustomer($scope.clientModel).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            location.replace("clientManageh.html")
                        },
                        timeout: -1
                    });
                }
            })
        }
        
        $scope.postEdit = function () {
            if($scope.clientModel.customerState == 1){
                ycui.confirm({
                    content: "请确定是否将此客户设为审核通过？",
                    timeout:-1,
                    okclick: function () {
                        post();
                    }
                })
            }else{
                post();
            }
        };
    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('clientEditCtrl', ['$scope', '$http', 'CustomerFty', 'SysUserFty','SysCompanyFty',
    function ($scope, $http, CustomerFty, SysUserFty,SysCompanyFty) {
        $scope.clientTypeSel = {
            list: [{id: 1, name: "直客"}, {id: 2, name: "代理商"}, {id: 3, name: "代理子客户"}],
            callback:function(e,d){
                if(d && d.id != 3){
                    $scope.childListSel.$destroy();
                }
            }
        }
        /**
         * 获取子客户
         */
        $scope.childListSel = {}


        // var customerName, customerType, parentId;

        //获取修改信息															
        var id = parseInt(getSearch("id"));
        ycui.loading.show();
        CustomerFty.getCustomer({id: id}).then(function (response) {
            ycui.loading.hide();
            if (response && response.code == 200) {
                delete response.items.updateTime;
                delete response.items.createTime;
                $scope.clientModel = response.items;

                $scope.labelClientList = $scope.clientModel.flowUsers;
                $scope.clientList = $scope.clientModel.customerContacts;

                // /**
                //  * 判断是否修改
                //  */
                // customerName = $scope.clientModel.customerName;
                // customerType = $scope.clientModel.customerType;
                // parentId = $scope.clientModel.parentId;

                CustomerFty.getAllCustomer({customerType:2}).then(function (response) {
                    var _childList = [];
                    if(response.items){
                        response.items.forEach(function (data) {
                            if(data.id != id){
                                _childList.push(data);
                            }
                        })
                    }
                    $scope.childListSel.list = _childList
                });
            }
        });

        $scope.postEdit = function () {
            $scope.validShow = true;
            //验证表单		
            if (!$(".form").valid()) {
                return
            }
            
            if($scope.clientModel.customerType == 3 && !$scope.clientModel.parentId){
                return;
            }
            
            if(!$scope.clientModel.customerType || !$scope.clientModel.customerLevel || $scope.labelClientList.length==0){
                return
            }

            // if (($scope.clientModel.customerName != customerName) || ($scope.clientModel.customerType != customerType) || ($scope.clientModel.parentId != parentId)) {
            //     ycui.confirm({
            //         content: "修改客户名称，客户类型，代理名称会重新触发审核，审核中的客户不能新建订单<br><span style='color: red;'>请确认是否修改?</span>",
            //         okclick: function () {
            //             updateCustomer();
            //         }
            //     })
            // } else {
            //     updateCustomer();
            // }
            updateCustomer();
            
            function updateCustomer() {
                var query = $scope.clientModel;
                delete query.customerState;
                var flowUsers = [];
                query.flowUsers.forEach(function (data) {
                    flowUsers.push({id: data.id});
                });
                query.flowUsers = flowUsers;
                query.customerContacts = $scope.clientList;
                query.customerContacts.forEach(function (data, index) {
                    data.contactSort = index + 1;
                });
                ycui.loading.show();
                CustomerFty.updateCustomer(query).then(function (response) {
                    ycui.loading.hide();
                    if (response && response.code == 200) {
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                goRoute('ViewCustomer')
                            },
                            timeout: 10
                        });
                    }
                })
            }
        }
        //客户类型下拉框
        ycui.select(".yc-select");
        //表单验证
        $(".form").validate({
            rules: {
                clientName: "required",
                clientAbbrev: {
                    required: true
                },
                myUrl: {
                    url: true
                },
                discount: {
                    required: true
                }
            },
            messages: {
                clientName: '请输入客户名称',
                clientAbbrev: {
                    required: '请输入客户简称'
                },
                myUrl: {
                    url: '请输入正确的网址'
                },
                discount: {
                    required: '请输入折扣比例'
                }
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });

        /*业务员添加*/
        var pageSize = 5;
        $scope.query = {pageSize: pageSize}
        $scope.departmentListSel = {};
        $scope.companyListSel = {
            callback:function(e,d){
                $scope.departmentListSel.$destroy();
                d && SysUserFty.depAndUserList({companyId:d.id}).then(function (res) {
                    if(res && res.code == 200){
                        $scope.departmentListSel.list = res.departmentList;
                    }
                });
            }
        };
        SysCompanyFty.companyList().then(function (res) {
            if(res){
                $scope.companyListSel.list = res;
            }
        })

        var modView = function (response) {
            ycui.loading.hide();
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.logNameOrTrueName = $scope.query.search;
            CustomerFty.getCustomerFlowUser($scope.query).then(modView);
        };

        $scope.$on('client-add',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            CustomerFty.getCustomerFlowUser($scope.query).then(modView);
        })
        CustomerFty.getCustomerFlowUser($scope.query).then(modView);

        /**
         * 业务员
         * @type {Array}
         */
        $scope.labelClientList = [];

        $scope.showAdClient = function () {
            $scope.clientModule = {
                title:'选择业务员',
                okClick:function(){

                },
                noClick:function(){

                }
            }
        }

        //点击添加到右边
        $scope.putRightInfo = function (itemInfo) {
            for (var i = 0; i < $scope.labelClientList.length; i++) {
                if (itemInfo.id == $scope.labelClientList[i].id) {
                    return
                }
            }
            $scope.labelClientList.push(itemInfo);
        };

        //判断右边里有没有
        $scope.isInRight = function (id) {
            for (var i = 0; i < $scope.labelClientList.length; i++) {
                if (id == $scope.labelClientList[i].id) {
                    return "noShow"
                }
            }
        };

        $scope.clearInfo = function () {
            $scope.labelClientList.length = 0;
        };

        $scope.deleteInfo = function (index) {
            $scope.labelClientList.splice(index, 1)
        };

        /**
         * 联系人
         * @type {*[]}
         */
        // $scope.clientList = [{}];
        $scope.addContact = function () {
            $scope.clientList.push({});
        };
        $scope.removeContact = function (index) {
            if ($scope.clientList.length != 1) {
                ycui.confirm({
                    title:"删除联系人",
                    content:"确定需要删除此联系人",
                    okclick:function () {
                        $scope.$apply(function () {
                            $scope.clientList.splice(index, 1);
                        })
                    }
                });
            }
        };
        /**
         * 改变优先级
         */
        $scope.switchingPosition = function (inx, index) {
            if (inx == 0 && index < 0) {
                return
            }
            if (inx == $scope.clientList.length - 1 && index == 1) {
                return
            }
            var form = $scope.clientList[inx];
            var to = $scope.clientList[inx + index];
            $scope.clientList.splice(inx, 1, to);
            $scope.clientList.splice(inx + index, 1, form);
        }
    }]);


/**
 * Created by moka on 16-6-16.
 */
app.controller('clientManageCtrl', ['$scope', '$http', '$location', 'CustomerFty', 'SysRuleUserFty','UploadKeyFty',
    function ($scope, $http, $location, CustomerFty, SysRuleUserFty,UploadKeyFty) {
        $scope.clientTypeSel = {
            list: [{id: 1, name: "直客"}, {id: 2, name: "代理商"}, {id: 3, name: "代理子客户"}],
            callback:function(e,d){
                $scope.query.pageIndex = 1;
                ycui.loading.show();
                CustomerFty.listCustomer($scope.query).then(modView);
            }
        }
        
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
        };

        $scope.query = {pageSize: pageSize};

        var paramInt1 = getUrlSearch($location.absUrl()).paramInt1;

        if (paramInt1) {
            $scope.query.paramInt1 = paramInt1;
            CustomerFty.listCustomer($scope.query).then(modView);
        } else {
            delete $scope.query.paramInt1
            CustomerFty.listCustomer($scope.query).then(modView);
        }

        $scope.listActive = function (listItems, id, name) {
            if (listItems.length > 0) {
                goRoute('ViewPutOrder',{customerId:id,customerName:name})
            } else {
                ycui.alert({
                    content: "您没有查看订单权限",
                    timeout: 100
                })
            }
        }

        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 1}).then(function (response) {
            if (response && response.code == 200) {
                $scope.listItems = response.items;
            }
        })

        
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            CustomerFty.listCustomer($scope.query).then(modView);
        };

        //审核状态图标
        $scope.isShowOut = function (type) {
            if (type == 0 || type == 1) {
                return false
            } else {
                return true
            }
        };


        //下拉框
        // ycui.select(".yc-select", function (clientValue) {
        //     var clientValueString = clientValue.html();
        //     var arr = clientValue.attr("data-value").split(":");
        //     var stringId = arr[0];
        //     var numId = arr[1];

        //     switch (stringId) {

        //         case "de":
        //             if (numId == -1) {
        //                 $scope.optype = ""
        //             } else {
        //                 $scope.optype = numId;
        //             }
        //             break;

        //         case "ro":
        //             if (clientValueString == "全部") {
        //                 $scope.state = ""
        //             } else {
        //                 $scope.state = numId;
        //             }
        //             break;

        //     }
        //     var query = {pageSize: pageSize, pageIndex: 1};
        //     $scope.search && (query.param1 = $scope.search);
        //     $scope.optype && (query.paramInt2 = $scope.optype);
        //     $scope.state && (query.paramInt3 = $scope.state);
        //     CustomerFty.listCustomer(query).then(modView);
        // });

        //审核状态
        // $scope.isPassList = function (id, state) {
        //     if (state == -1 || state == 1) {
        //         ycui.alert({
        //             content: "该客户已被审核，不能重复审核"
        //         })
        //     } else {
        //         location.replace("audit.html?id=" + id);
        //     }
        // };
        /**
         * 显示客户下的联系人
         * @param id
         * @param index
         * @param bo
         */
        $scope.showContacList = function (id, index, bo) {
            if (bo) {
                ycui.loading.show();
                CustomerFty.getCustomerContacts({customerId: id}).then(function (res) {
                    ycui.loading.hide();
                    if(res && res.items && res.items.length > 0){
                        var array = angular.copy($scope.items);
                        array.splice(index + 1, 0, res.items);
                        var s = [];
                        for (var i = 0; i < array.length; i++) {
                            if (array[i] instanceof Array) {
                                for (var a = 0; a < array[i].length; a++) {
                                    s.push(array[i][a]);
                                    array[i][a].hiddenList = true;
                                }
                            } else {
                                s.push(array[i]);
                            }
                        }
                        s[index].showList = bo;
                        $scope.items = s; 
                    }
                });
            } else {
                ycui.loading.show();
                CustomerFty.getCustomerContacts({customerId: id}).then(function (res) {
                    ycui.loading.hide();
                    if(res && res.items && res.items.length > 0){
                        var array = angular.copy($scope.items);
                        var length = res.items.length;
                        while (length > 0) {
                            array.splice(index + length, 1);
                            --length
                        }
                        array[index].showList = bo;
                        $scope.items = array;
                    }
                })
            }

        };
        
        $scope.mapList = function (arr) {
            if(arr){
                var s = '';
                arr.map(function (da) {
                    s += da.trueName + '\n'
                });
                return s
            }
        }

        var upload = function (id) {
            var key = '';
            var config = {
                server: baseUrl + "/customer/readCustomer.htm",
                pick: {
                    id: '#'+id,
                    multiple: false
                },
                accept: {
                    title: 'xls',
                    extensions: 'xls,xlsx',
                    mimeTypes: '.xls,.xlsx'
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
                uploadComplete:function () {
                    ycui.loading.hide();
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
                },
                uploadSuccess:function (uploader,file, res) {
                    if (res && res.code == 200) {
                        var arr = res.msg.replace(/\;/g,'<br>');
                        ycui.alert({
                            content: '<div style="max-height: 300px;overflow-y: auto;width: auto;">'+ arr +'</div>',
                            timeout: 10,
                            okclick:function () {
                                CustomerFty.listCustomer($scope.query).then(modView);
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
            return uploadInit(config)
        }('customerImport');

        $scope.customerDown = function () {
            window.open(fileUrl + '/download/客户录入模板.xlsx','_blank');
        };
        
        $scope.customerOut = function () {
            var url = baseUrl + '/customer/exportCustomerReport.htm' + '?pageIndex=' + $scope.page.page + '&pageSize=' + 10 +
                '&param1=' + ($scope.query.search || '') + '&paramInt2=' + ($scope.state || '');
            window.open(url, '_blank')
        }

    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('QualificationCtrl', ["$scope", "$http", "QualificationFty", "CustomerFty", '$q',
    function ($scope, $http, QualificationFty, CustomerFty, $q) {
        /**
         * 获取子客户
         */
        $scope.childListSel = {}
        var getAllCustomer = CustomerFty.getAllCustomer().then(function (response) {
            if(response){
                $scope.childListSel.list = response.items;//param1
            }
        });

        $scope.clientTypeSel = {
            list: [{id: 1, name: "直客"}, {id: 2, name: "代理商"}, {id: 3, name: "代理子客户"}],//paramInt1
            callback:function(e,d){
                $scope.childListSel.$destroy();
                var query = {}
                if(d){
                    query.customerType = d.id
                }
                CustomerFty.getAllCustomer(query).then(function (response) {
                    if (response) {
                        $scope.childListSel.list = response.items;
                    }
                });
            }
        }
        
        var id = getSearch('id');
        var customerName = getSearch('customerName');
        $scope.query = {pageSize: 10, pageIndex: 1};
        if(id){
            // $scope.query.customerName = customerName;
            $scope.query.paramInt1 = id;
        }
        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        //搜索
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param2 = $scope.query.search;
            QualificationFty.listQualifications($scope.query).then(modView);
        };

        $scope.$on('qualification-list',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            QualificationFty.listQualifications($scope.query).then(modView);
        })

        // if (id) {
        //     QualificationFty.findCustomerQualifications($scope.query).then(modView);
        // } else {
            
        // }

        QualificationFty.listQualifications($scope.query).then(modView);

        $scope.delete = function (id) {
            ycui.confirm({
                content: "请确认，您将执行删除操作",
                okclick: function () {
                    QualificationFty.deleteQualifications({id: id}).then(function (response) {
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                location.reload()
                            }
                        });
                    })
                }
            })
        };

        var industry = {
            "leve2": [[],[{"id": 197, "name": "安保服务"}, {"id": 198, "name": "安保器材"}, {
                "id": 199,
                "name": "安全防伪"
            }, {"id": 200, "name": "防盗报警"}, {"id": 201, "name": "交通消防"}, {"id": 202, "name": "智能楼宇"}], [{
                "id": 203,
                "name": "办公设备"
            }, {"id": 204, "name": "教具"}, {"id": 205, "name": "文具"}], [{
                "id": 206,
                "name": "彩票"
            }], [{"id": 207, "name": "物流"}, {"id": 208, "name": "车辆"}, {"id": 209, "name": "火车"}, {
                "id": 210,
                "name": "船舶"
            }, {"id": 211, "name": "飞机"}], [{"id": 212, "name": "成人用品"}], [{"id": 213, "name": "出版印刷"}, {
                "id": 214,
                "name": "影视传媒"
            }, {"id": 215, "name": "广播有线电视"}], [{
                "id": 216,
                "name": "电脑整机"
            }, {"id": 217, "name": "电脑配件"}, {"id": 218, "name": "网络设备"}, {"id": 219, "name": "电脑服务"}], [{
                "id": 220,
                "name": "电子元器件"
            }, {"id": 221, "name": "电机设备"}, {"id": 222, "name": "电线电缆"}, {"id": 223, "name": "供电设备"}, {
                "id": 224,
                "name": "照明设备"
            }, {"id": 225, "name": "仪器仪表"}], [{
                "id": 226,
                "name": "建筑工程"
            }, {"id": 227, "name": "房屋租售"}, {"id": 228, "name": "物业管理"}, {"id": 229, "name": "装修服务"}, {
                "id": 230,
                "name": "建筑装修材料"
            }], [{"id": 231, "name": "网上商城"}, {"id": 232, "name": "导购网站"}, {"id": 233, "name": "团购网站"}, {
                "id": 234,
                "name": "社交平台"
            }, {"id": 235, "name": "分类服务平台"}, {
                "id": 236,
                "name": "生活服务网站"
            }, {"id": 237, "name": "休闲娱乐网站"}], [{"id": 238, "name": "服装"}, {"id": 239, "name": "鞋帽"}, {
                "id": 240,
                "name": "纺织原料"
            }], [{"id": 241, "name": "箱包"}, {"id": 242, "name": "饰品"}], [{"id": 243, "name": "涂料"}, {
                "id": 244,
                "name": "化工原料"
            }, {"id": 245, "name": "橡胶"}, {
                "id": 246,
                "name": "塑料"
            }, {"id": 247, "name": "能源"}, {"id": 248, "name": "冶金"}, {"id": 249, "name": "包装材料"}], [{
                "id": 250,
                "name": "通用机械设备"
            }, {"id": 251, "name": "通用零配件"}, {"id": 252, "name": "建筑工程机械"}, {"id": 253, "name": "勘探机械"}, {
                "id": 254,
                "name": "化工机械"
            }, {"id": 255, "name": "木材石材加工机械"}, {
                "id": 256,
                "name": "印刷机械"
            }, {"id": 257, "name": "模具"}, {"id": 258, "name": "食品机械"}, {"id": 259, "name": "农林机械"}, {
                "id": 260,
                "name": "纸制造加工设备"
            }, {"id": 261, "name": "制鞋纺织机械"}, {"id": 262, "name": "商业设备"}, {"id": 263, "name": "包装机械"}, {
                "id": 264,
                "name": "制药设备"
            }, {"id": 265, "name": "冶炼铸造设备"}, {
                "id": 266,
                "name": "机床机械"
            }, {"id": 267, "name": "五金工具"}, {"id": 268, "name": "物流设备"}, {"id": 269, "name": "清洁通风设备"}, {
                "id": 270,
                "name": "焊接材料设备"
            }, {"id": 271, "name": "玻璃橡塑设备"}, {"id": 272, "name": "金属材料"}, {
                "id": 273,
                "name": "电子产品制造设备"
            }], [{"id": 274, "name": "家具"}, {"id": 275, "name": "家纺家饰"}, {
                "id": 276,
                "name": "厨具餐具"
            }, {"id": 277, "name": "日化用品"}], [{"id": 278, "name": "大型家电"}, {"id": 279, "name": "厨用电器"}, {
                "id": 280,
                "name": "卫浴家电"
            }, {"id": 281, "name": "健康电器"}, {"id": 282, "name": "生活小家电"}], [{"id": 283, "name": "学前教育"}, {
                "id": 284,
                "name": "小初高教育"
            }, {"id": 285, "name": "高教自考"}, {
                "id": 286,
                "name": "留学"
            }, {"id": 287, "name": "IT培训"}, {"id": 288, "name": "语言培训"}, {"id": 289, "name": "职业培训"}, {
                "id": 290,
                "name": "文体培训"
            }, {"id": 291, "name": "企业培训拓展"}, {"id": 292, "name": "特殊人群教育"}], [{"id": 293, "name": "污染处理"}, {
                "id": 294,
                "name": "废旧回收"
            }, {"id": 295, "name": "节能"}], [{
                "id": 296,
                "name": "理财"
            }, {"id": 297, "name": "银行"}, {"id": 298, "name": "保险"}, {"id": 299, "name": "投资担保"}, {
                "id": 300,
                "name": "典当"
            }], [{"id": 301, "name": "礼品"}], [{"id": 302, "name": "旅游"}, {"id": 303, "name": "宾馆酒店"}, {
                "id": 304,
                "name": "交通票务"
            }, {"id": 305, "name": "文体票务"}], [{
                "id": 306,
                "name": "化妆品"
            }, {"id": 307, "name": "美容"}], [{"id": 308, "name": "母婴护理"}], [{"id": 309, "name": "兽医兽药"}, {
                "id": 310,
                "name": "农药"
            }, {"id": 311, "name": "化肥"}, {"id": 312, "name": "养殖"}, {"id": 313, "name": "种植"}, {
                "id": 314,
                "name": "园林景观"
            }], [{"id": 315, "name": "操作系统"}, {
                "id": 316,
                "name": "中间件软件"
            }, {"id": 317, "name": "应用软件"}, {"id": 318, "name": "杀毒软件"}, {"id": 319, "name": "监控安全软件"}, {
                "id": 320,
                "name": "数据库软件"
            }, {"id": 321, "name": "企业软件"}, {"id": 322, "name": "行业专用软件"}, {"id": 323, "name": "支付结算软件"}, {
                "id": 324,
                "name": "教学软件"
            }], [{"id": 325, "name": "出国"}, {
                "id": 326,
                "name": "招聘"
            }, {"id": 327, "name": "翻译"}, {"id": 328, "name": "设计"}, {"id": 329, "name": "广告"}, {
                "id": 330,
                "name": "公关策划"
            }, {"id": 331, "name": "咨询"}, {"id": 332, "name": "拍卖"}, {"id": 333, "name": "代理"}, {
                "id": 334,
                "name": "调查"
            }, {"id": 335, "name": "法律服务"}, {
                "id": 336,
                "name": "会计审计"
            }, {"id": 337, "name": "铃声短信"}], [{"id": 338, "name": "搬家"}, {"id": 339, "name": "家政"}, {
                "id": 340,
                "name": "征婚交友"
            }, {"id": 341, "name": "仪式典礼"}, {"id": 342, "name": "摄影"}, {"id": 343, "name": "汽车租赁"}, {
                "id": 344,
                "name": "家电维修"
            }, {"id": 345, "name": "居民服务"}], [{
                "id": 346,
                "name": "生活食材"
            }, {"id": 347, "name": "休闲零食"}, {"id": 348, "name": "饮料"}, {"id": 349, "name": "保健食品"}, {
                "id": 350,
                "name": "烟酒"
            }, {"id": 351, "name": "餐馆"}], [{"id": 352, "name": "手机"}, {"id": 353, "name": "数码产品"}], [{
                "id": 354,
                "name": "通讯服务"
            }, {"id": 355, "name": "通讯设备"}], [{
                "id": 356,
                "name": "网站建设"
            }, {"id": 357, "name": "域名空间"}], [{"id": 358, "name": "男科"}, {"id": 359, "name": "妇科"}, {
                "id": 360,
                "name": "美容整形"
            }, {"id": 361, "name": "专科医院"}, {"id": 362, "name": "中医"}, {"id": 363, "name": "体检机构"}, {
                "id": 364,
                "name": "综合医院"
            }, {"id": 365, "name": "药品"}, {
                "id": 366,
                "name": "医疗器械"
            }], [{"id": 367, "name": "游戏开发"}, {"id": 368, "name": "游戏运营"}, {"id": 369, "name": "游戏周边"}], [{
                "id": 370,
                "name": "体育器械"
            }, {"id": 371, "name": "休闲活动"}, {"id": 372, "name": "运势测算"}, {"id": 373, "name": "宠物服务"}, {
                "id": 374,
                "name": "玩具模型"
            }, {"id": 375, "name": "乐器"}], [{
                "id": 376,
                "name": "服装饰品加盟"
            }, {"id": 377, "name": "美容化妆加盟"}, {"id": 378, "name": "礼品加盟"}, {"id": 379, "name": "食品保健品加盟"}, {
                "id": 380,
                "name": "生活服务加盟"
            }, {"id": 381, "name": "教育培训加盟"}, {"id": 382, "name": "机械电子建材加盟"}, {"id": 383, "name": "汽车加盟"}, {
                "id": 384,
                "name": "旅游住宿加盟"
            }, {
                "id": 385,
                "name": "干洗加盟"
            }, {"id": 386, "name": "综合招商"}, {"id": 387, "name": "养殖加盟"}], [{
                "id": 388,
                "name": "学术公管社会组织"
            }], [{"id": 389, "name": "国际组织"}], [{"id": 390, "name": "其他"}]],
            "leve1": ["全部","安全安保", "办公文教", "彩票", "车辆物流", "成人用品", "出版传媒", "电脑硬件", "电子电工", "房地产建筑装修", "分类平台", "服装鞋帽", "箱包饰品", "化工原料制品", "机械设备", "家庭日用品", "家用电器", "教育培训", "节能环保", "金融服务", "礼品", "旅游住宿", "美容化妆", "母婴护理", "农林牧渔", "软件", "商务服务", "生活服务", "食品保健品", "手机数码", "通讯服务设备", "网络服务", "医疗服务", "游戏", "运动休闲娱乐", "招商加盟", "学术公管社会组织", "国际组织", "其他"]
        };

        $scope.industrySel2 = {}
        $scope.industrySel = {
            list:industry.leve1,
            callback:function(e,d,list){
                $scope.industrySel2.$destroy();
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                $scope.query.param3 = d;
                QualificationFty.listQualifications($scope.query).then(modView);
                if(!d)return;
                var i = list.length;
                while (i--) {
                    if (d == industry.leve1[i]) {
                        break;
                    }
                }
                $scope.industrySel2.list = industry.leve2[i];
            },
            sessionBack:function (d) {
                if(!d)return;
                var name = this.name;
                var i = this.list.length;
                while (i--) {
                    if (d[name] == industry.leve1[i]) {
                        break;
                    }
                }
                $scope.industrySel2.list = industry.leve2[i];
            }
        }

    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('QualificationAddCtrl', ["$scope", "$http", "QualificationFty", "CustomerFty", "UploadKeyFty",
    function ($scope, $http, QualificationFty, CustomerFty, UploadKeyFty) {
        var upload = function(ob){
            var key = "";
            var config = {
                server: fileUrl + '/contract/fileUpload.htm',
                pick: {
                    id: "#" + ob.id,
                    multiple: false
                },
                beforeFileQueued:function(uploader,file){
                    var size = 3*1024*1024;
                    if(file.size > size){
                        ycui.alert({
                            content: "文件大小不能超过3M(1M等于1024KB)",
                            timeout: 10,
                            error:true
                        });
                        return false;
                    }
                    ycui.loading.show();
                    uploader.stop();
                    UploadKeyFty.uploadKey().then(function (da) {
                        key = da.items;
                        uploader.upload();
                    });
                },
                uploadSuccess:function(uploader,file, res){
                    var $img = document.querySelector('.' + ob.id);
                    uploader.makeThumb(file, function (error, src) {
                        var img = '<img width="60" src="' + src + '">';
                        $img.innerHTML = img;
                        ob.src = res.uploadFile;
                    });
                },
                uploadBeforeSend:function(uploader,ob, data){
                    data.uploadKey = key;
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                error:function(uploader){
                    ycui.loading.hide();
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: 10,
                        error:true
                    });
                    uploader.reset();
                }
            }
            uploadInit(config);
        }

        var industry = {
            "leve2": [[],[{"id": 197, "name": "安保服务"}, {"id": 198, "name": "安保器材"}, {
                "id": 199,
                "name": "安全防伪"
            }, {"id": 200, "name": "防盗报警"}, {"id": 201, "name": "交通消防"}, {"id": 202, "name": "智能楼宇"}], [{
                "id": 203,
                "name": "办公设备"
            }, {"id": 204, "name": "教具"}, {"id": 205, "name": "文具"}], [{
                "id": 206,
                "name": "彩票"
            }], [{"id": 207, "name": "物流"}, {"id": 208, "name": "车辆"}, {"id": 209, "name": "火车"}, {
                "id": 210,
                "name": "船舶"
            }, {"id": 211, "name": "飞机"}], [{"id": 212, "name": "成人用品"}], [{"id": 213, "name": "出版印刷"}, {
                "id": 214,
                "name": "影视传媒"
            }, {"id": 215, "name": "广播有线电视"}], [{
                "id": 216,
                "name": "电脑整机"
            }, {"id": 217, "name": "电脑配件"}, {"id": 218, "name": "网络设备"}, {"id": 219, "name": "电脑服务"}], [{
                "id": 220,
                "name": "电子元器件"
            }, {"id": 221, "name": "电机设备"}, {"id": 222, "name": "电线电缆"}, {"id": 223, "name": "供电设备"}, {
                "id": 224,
                "name": "照明设备"
            }, {"id": 225, "name": "仪器仪表"}], [{
                "id": 226,
                "name": "建筑工程"
            }, {"id": 227, "name": "房屋租售"}, {"id": 228, "name": "物业管理"}, {"id": 229, "name": "装修服务"}, {
                "id": 230,
                "name": "建筑装修材料"
            }], [{"id": 231, "name": "网上商城"}, {"id": 232, "name": "导购网站"}, {"id": 233, "name": "团购网站"}, {
                "id": 234,
                "name": "社交平台"
            }, {"id": 235, "name": "分类服务平台"}, {
                "id": 236,
                "name": "生活服务网站"
            }, {"id": 237, "name": "休闲娱乐网站"}], [{"id": 238, "name": "服装"}, {"id": 239, "name": "鞋帽"}, {
                "id": 240,
                "name": "纺织原料"
            }], [{"id": 241, "name": "箱包"}, {"id": 242, "name": "饰品"}], [{"id": 243, "name": "涂料"}, {
                "id": 244,
                "name": "化工原料"
            }, {"id": 245, "name": "橡胶"}, {
                "id": 246,
                "name": "塑料"
            }, {"id": 247, "name": "能源"}, {"id": 248, "name": "冶金"}, {"id": 249, "name": "包装材料"}], [{
                "id": 250,
                "name": "通用机械设备"
            }, {"id": 251, "name": "通用零配件"}, {"id": 252, "name": "建筑工程机械"}, {"id": 253, "name": "勘探机械"}, {
                "id": 254,
                "name": "化工机械"
            }, {"id": 255, "name": "木材石材加工机械"}, {
                "id": 256,
                "name": "印刷机械"
            }, {"id": 257, "name": "模具"}, {"id": 258, "name": "食品机械"}, {"id": 259, "name": "农林机械"}, {
                "id": 260,
                "name": "纸制造加工设备"
            }, {"id": 261, "name": "制鞋纺织机械"}, {"id": 262, "name": "商业设备"}, {"id": 263, "name": "包装机械"}, {
                "id": 264,
                "name": "制药设备"
            }, {"id": 265, "name": "冶炼铸造设备"}, {
                "id": 266,
                "name": "机床机械"
            }, {"id": 267, "name": "五金工具"}, {"id": 268, "name": "物流设备"}, {"id": 269, "name": "清洁通风设备"}, {
                "id": 270,
                "name": "焊接材料设备"
            }, {"id": 271, "name": "玻璃橡塑设备"}, {"id": 272, "name": "金属材料"}, {
                "id": 273,
                "name": "电子产品制造设备"
            }], [{"id": 274, "name": "家具"}, {"id": 275, "name": "家纺家饰"}, {
                "id": 276,
                "name": "厨具餐具"
            }, {"id": 277, "name": "日化用品"}], [{"id": 278, "name": "大型家电"}, {"id": 279, "name": "厨用电器"}, {
                "id": 280,
                "name": "卫浴家电"
            }, {"id": 281, "name": "健康电器"}, {"id": 282, "name": "生活小家电"}], [{"id": 283, "name": "学前教育"}, {
                "id": 284,
                "name": "小初高教育"
            }, {"id": 285, "name": "高教自考"}, {
                "id": 286,
                "name": "留学"
            }, {"id": 287, "name": "IT培训"}, {"id": 288, "name": "语言培训"}, {"id": 289, "name": "职业培训"}, {
                "id": 290,
                "name": "文体培训"
            }, {"id": 291, "name": "企业培训拓展"}, {"id": 292, "name": "特殊人群教育"}], [{"id": 293, "name": "污染处理"}, {
                "id": 294,
                "name": "废旧回收"
            }, {"id": 295, "name": "节能"}], [{
                "id": 296,
                "name": "理财"
            }, {"id": 297, "name": "银行"}, {"id": 298, "name": "保险"}, {"id": 299, "name": "投资担保"}, {
                "id": 300,
                "name": "典当"
            }], [{"id": 301, "name": "礼品"}], [{"id": 302, "name": "旅游"}, {"id": 303, "name": "宾馆酒店"}, {
                "id": 304,
                "name": "交通票务"
            }, {"id": 305, "name": "文体票务"}], [{
                "id": 306,
                "name": "化妆品"
            }, {"id": 307, "name": "美容"}], [{"id": 308, "name": "母婴护理"}], [{"id": 309, "name": "兽医兽药"}, {
                "id": 310,
                "name": "农药"
            }, {"id": 311, "name": "化肥"}, {"id": 312, "name": "养殖"}, {"id": 313, "name": "种植"}, {
                "id": 314,
                "name": "园林景观"
            }], [{"id": 315, "name": "操作系统"}, {
                "id": 316,
                "name": "中间件软件"
            }, {"id": 317, "name": "应用软件"}, {"id": 318, "name": "杀毒软件"}, {"id": 319, "name": "监控安全软件"}, {
                "id": 320,
                "name": "数据库软件"
            }, {"id": 321, "name": "企业软件"}, {"id": 322, "name": "行业专用软件"}, {"id": 323, "name": "支付结算软件"}, {
                "id": 324,
                "name": "教学软件"
            }], [{"id": 325, "name": "出国"}, {
                "id": 326,
                "name": "招聘"
            }, {"id": 327, "name": "翻译"}, {"id": 328, "name": "设计"}, {"id": 329, "name": "广告"}, {
                "id": 330,
                "name": "公关策划"
            }, {"id": 331, "name": "咨询"}, {"id": 332, "name": "拍卖"}, {"id": 333, "name": "代理"}, {
                "id": 334,
                "name": "调查"
            }, {"id": 335, "name": "法律服务"}, {
                "id": 336,
                "name": "会计审计"
            }, {"id": 337, "name": "铃声短信"}], [{"id": 338, "name": "搬家"}, {"id": 339, "name": "家政"}, {
                "id": 340,
                "name": "征婚交友"
            }, {"id": 341, "name": "仪式典礼"}, {"id": 342, "name": "摄影"}, {"id": 343, "name": "汽车租赁"}, {
                "id": 344,
                "name": "家电维修"
            }, {"id": 345, "name": "居民服务"}], [{
                "id": 346,
                "name": "生活食材"
            }, {"id": 347, "name": "休闲零食"}, {"id": 348, "name": "饮料"}, {"id": 349, "name": "保健食品"}, {
                "id": 350,
                "name": "烟酒"
            }, {"id": 351, "name": "餐馆"}], [{"id": 352, "name": "手机"}, {"id": 353, "name": "数码产品"}], [{
                "id": 354,
                "name": "通讯服务"
            }, {"id": 355, "name": "通讯设备"}], [{
                "id": 356,
                "name": "网站建设"
            }, {"id": 357, "name": "域名空间"}], [{"id": 358, "name": "男科"}, {"id": 359, "name": "妇科"}, {
                "id": 360,
                "name": "美容整形"
            }, {"id": 361, "name": "专科医院"}, {"id": 362, "name": "中医"}, {"id": 363, "name": "体检机构"}, {
                "id": 364,
                "name": "综合医院"
            }, {"id": 365, "name": "药品"}, {
                "id": 366,
                "name": "医疗器械"
            }], [{"id": 367, "name": "游戏开发"}, {"id": 368, "name": "游戏运营"}, {"id": 369, "name": "游戏周边"}], [{
                "id": 370,
                "name": "体育器械"
            }, {"id": 371, "name": "休闲活动"}, {"id": 372, "name": "运势测算"}, {"id": 373, "name": "宠物服务"}, {
                "id": 374,
                "name": "玩具模型"
            }, {"id": 375, "name": "乐器"}], [{
                "id": 376,
                "name": "服装饰品加盟"
            }, {"id": 377, "name": "美容化妆加盟"}, {"id": 378, "name": "礼品加盟"}, {"id": 379, "name": "食品保健品加盟"}, {
                "id": 380,
                "name": "生活服务加盟"
            }, {"id": 381, "name": "教育培训加盟"}, {"id": 382, "name": "机械电子建材加盟"}, {"id": 383, "name": "汽车加盟"}, {
                "id": 384,
                "name": "旅游住宿加盟"
            }, {
                "id": 385,
                "name": "干洗加盟"
            }, {"id": 386, "name": "综合招商"}, {"id": 387, "name": "养殖加盟"}], [{
                "id": 388,
                "name": "学术公管社会组织"
            }], [{"id": 389, "name": "国际组织"}], [{"id": 390, "name": "其他"}]],
            "leve1": ["全部","安全安保", "办公文教", "彩票", "车辆物流", "成人用品", "出版传媒", "电脑硬件", "电子电工", "房地产建筑装修", "分类平台", "服装鞋帽", "箱包饰品", "化工原料制品", "机械设备", "家庭日用品", "家用电器", "教育培训", "节能环保", "金融服务", "礼品", "旅游住宿", "美容化妆", "母婴护理", "农林牧渔", "软件", "商务服务", "生活服务", "食品保健品", "手机数码", "通讯服务设备", "网络服务", "医疗服务", "游戏", "运动休闲娱乐", "招商加盟", "学术公管社会组织", "国际组织", "其他"]
        };

        var id = getSearch('id');
        var customerName = getSearch('customerName');
        if (id) {
            $scope.query = {
                id: id,
                customerName: customerName
            }
            $scope.clientResult = id;
        }

        $scope.industrySel2 = {}
        $scope.industrySel = {
            list:industry.leve1,
            callback:function(e,d,list){
                $scope.industrySel2.$destroy();
                if(!d)return;
                var i = list.length;
                while (i--) {
                    if (d == industry.leve1[i]) {
                        break;
                    }
                }
                $scope.industrySel2.list = industry.leve2[i];
            }
        }

        $scope.childListSel = {}
        var getAllCustomer = CustomerFty.getAllCustomer().then(function (response) {
            if(response){
                $scope.childListSel.list = response.items;//param1
            }
        });

        $scope.$on('filesList',function(){
            var length = $scope.files.length;
            upload($scope.files[length-1]);
        })

        $scope.files = [{id: 'uploadBtn' + new Date().getTime()}];

        $scope.fileAdd = function () {
            var id = 'uploadBtn' + new Date().getTime();
            $scope.files.push({id: id});
        }

        $scope.fileRemove = function (index) {
            $scope.files.splice(index, 1);
        }

        // $scope.clients = [], $scope.clientResult = -1, $scope.leve1 = -1, $scope.industryResult = {
        //     id: -1,
        //     name: '请选择'
        // }, $scope.uploadList = [], $scope.files = [];

        
        
        // $scope.fileAdd = function () {
        //     var num = ++i >= 10 ? i : '0' + i,
        //         id = 'uploadBtn' + new Date().getTime() + num;
        //     $scope.files.push({id: id, num: num});
        //     setTimeout(function () {
        //         uploadInit('#' + id);
        //     }, 100)
        // };
        // $scope.fileRemove = function (id) {
        //     var i = $scope.files.length;
        //     while (i--) {
        //         if ($scope.files[i].id === id) {
        //             $scope.files.splice(i, 1);
        //             break;
        //         }
        //     }
        // };
        // $scope.updateLeve1 = function (opt) {
        //     var i = $scope.industry.leve1.length;
        //     while (i--) {
        //         if (opt == $scope.industry.leve1[i]) {
        //             break;
        //         }
        //     }
        //     $scope.leve1 = i;
        //     if (i != -1) {
        //         $scope.industryResult.name = $scope.industry.leve2[i][0].name, $scope.industryResult.id = $scope.industry.leve2[i][0].id
        //     } else {
        //         $scope.industryResult.name = '请选择所属行业', $scope.industryResult.id = $scope.industry.leve2[i].id = -1;
        //     }
        // };
        // $scope.updateLeve2 = function (opt) {
        //     opt && ($scope.industryResult.name = opt.name, $scope.industryResult.id = opt.id)
        // };
        // $scope.updateClient = function (opt) {
        //     opt && ($scope.clientResult = opt.id)
        // };
        $scope.postEdit = function (flag) {

            var src = [];
            var name = [];

            $scope.files.forEach(function(da){
                da.src && src.push(da.src);
                da.name && name.push(da.name);
            })

            ycui.loading.show();
            QualificationFty.addQualifications({
                customerId: $scope.clientResult,
                industryId: $scope.industryId,
                qualificationsFileUrl: src,
                qualificationsName: name
            }).then(function (response) {
                ycui.loading.hide();
                if (response) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewCustomer1');
                        }
                    })
                }
            })

            // var files = {qualificationsFileUrl: [], qualificationsName: []},
            //     lists = $('.upload-section .yc-Qualification-uploading'),
            //     inp, img, tit, con = '', i = lists.size();

            // if ($scope.clientResult == -1) {
            //     $('#clientType').find('.error-message').size() <= 0 && ($('#clientType').append('<div class="error-message"><i class="yc-icon">&#xe601;</i> 请选择客户</div>'));
            //     flag = true;
            // }
            // if ($scope.industryResult.id == -1) {
            //     $('#industryType').find('.error-message').size() <= 0 && ($('#industryType').append('<div class="error-message"><i class="yc-icon">&#xe601;</i> 请选择所属行业</div>'));
            //     flag = true;
            // }
            // while (i--) {
            //     inp = lists.eq(i).find('input[type="text"]').prop('value') || '';
            //     img = lists.eq(i).find('.upload-show img');
            //     tit = lists.eq(i).find('.uploading-top-text').text();

            //     !inp.trim() && (con += tit + "：请填写资质名称<br>");
            //     img.size() == 0 && (con += tit + "：请选择上传资质文件<br>");
            //     !con && (files.qualificationsName.push(inp), files.qualificationsFileUrl.push(img.attr('data-src')));
            // }
            // con && (flag = true, ycui.alert({
            //     content: $('<div><div style="text-align:left;">' + con + '</div></div>').html(),
            //     timeout: 5
            // }));

            // if (flag) {
            //     return
            // } else {
            //     ycui.loading.show();
            //     QualificationFty.addQualifications({
            //         customerId: $scope.clientResult,
            //         industryId: $scope.industryResult.id,
            //         qualificationsFileUrl: files.qualificationsFileUrl,
            //         qualificationsName: files.qualificationsName
            //     }).then(function (response) {
            //         ycui.loading.hide();
            //         if (response) {
            //             ycui.alert({
            //                 content: response.msg,
            //                 okclick: function () {
            //                     location.replace('QualificationManage.html')
            //                 }
            //             })
            //         }
            //     })
            // }
        };

        // $scope.$watch('clientResult', function (newvalue) {
        //     newvalue != -1 && $('#clientType').find('.error- ').remove();
        // });
        // $scope.$watch('industryResult', function (newvalue) {
        //     newvalue.id != -1 && $('#industryType').find('.error-message').remove();
        // }, true);

        // CustomerFty.getAllCustomer().then(function (response) {
        //     $scope.clients = response.items
        // });
        // ycui.select('.yc-select'), uploadInit('#uplaodBtn');
    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('QualificationEditCtrl', ["$scope", "$http", "QualificationFty","UploadKeyFty", 
    function ($scope, $http, QualificationFty,UploadKeyFty) {
        var upload = function(ob){
            var key = "";
            var config = {
                server: fileUrl + '/contract/fileUpload.htm',
                pick: {
                    id: "#" + ob.id,
                    multiple: false
                },
                beforeFileQueued:function(uploader,file){
                    var size = 3*1024*1024;
                    if(file.size > size){
                        ycui.alert({
                            content: "文件大小不能超过3M(1M等于1024KB)",
                            timeout: 10,
                            error:true
                        });
                        return false;
                    }
                    ycui.loading.show();
                    uploader.stop();
                    UploadKeyFty.uploadKey().then(function (da) {
                        key = da.items;
                        uploader.upload();
                    });
                },
                uploadSuccess:function(uploader,file, res){
                    $scope.$apply(function(){
                        ob.qualificationsUrl = res.uploadFile;
                    })
                },
                uploadBeforeSend:function(uploader,ob, data){
                    data.uploadKey = key;
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                error:function(uploader){
                    ycui.loading.hide();
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: 10,
                        error:true
                    });
                    uploader.reset();
                }
            }
            uploadInit(config);
        }

        $scope.id = 'uplaodBtn';
        upload($scope);

        var id = getSearch('id');

        ycui.loading.show();
        QualificationFty.findQualifications({id: id}).then(function (response) {
            ycui.loading.hide();
            if(response){
                $scope.clientId = response.customerId;
                $scope.customerName = response.customerName;
                $scope.industryId = response.industryId;
                $scope.qualificationName = response.qualificationName;
                $scope.qualificationsUrl = response.qualificationsUrl
            }
        });

        var industry = {
            "leve2": [[],[{"id": 197, "name": "安保服务"}, {"id": 198, "name": "安保器材"}, {
                "id": 199,
                "name": "安全防伪"
            }, {"id": 200, "name": "防盗报警"}, {"id": 201, "name": "交通消防"}, {"id": 202, "name": "智能楼宇"}], [{
                "id": 203,
                "name": "办公设备"
            }, {"id": 204, "name": "教具"}, {"id": 205, "name": "文具"}], [{
                "id": 206,
                "name": "彩票"
            }], [{"id": 207, "name": "物流"}, {"id": 208, "name": "车辆"}, {"id": 209, "name": "火车"}, {
                "id": 210,
                "name": "船舶"
            }, {"id": 211, "name": "飞机"}], [{"id": 212, "name": "成人用品"}], [{"id": 213, "name": "出版印刷"}, {
                "id": 214,
                "name": "影视传媒"
            }, {"id": 215, "name": "广播有线电视"}], [{
                "id": 216,
                "name": "电脑整机"
            }, {"id": 217, "name": "电脑配件"}, {"id": 218, "name": "网络设备"}, {"id": 219, "name": "电脑服务"}], [{
                "id": 220,
                "name": "电子元器件"
            }, {"id": 221, "name": "电机设备"}, {"id": 222, "name": "电线电缆"}, {"id": 223, "name": "供电设备"}, {
                "id": 224,
                "name": "照明设备"
            }, {"id": 225, "name": "仪器仪表"}], [{
                "id": 226,
                "name": "建筑工程"
            }, {"id": 227, "name": "房屋租售"}, {"id": 228, "name": "物业管理"}, {"id": 229, "name": "装修服务"}, {
                "id": 230,
                "name": "建筑装修材料"
            }], [{"id": 231, "name": "网上商城"}, {"id": 232, "name": "导购网站"}, {"id": 233, "name": "团购网站"}, {
                "id": 234,
                "name": "社交平台"
            }, {"id": 235, "name": "分类服务平台"}, {
                "id": 236,
                "name": "生活服务网站"
            }, {"id": 237, "name": "休闲娱乐网站"}], [{"id": 238, "name": "服装"}, {"id": 239, "name": "鞋帽"}, {
                "id": 240,
                "name": "纺织原料"
            }], [{"id": 241, "name": "箱包"}, {"id": 242, "name": "饰品"}], [{"id": 243, "name": "涂料"}, {
                "id": 244,
                "name": "化工原料"
            }, {"id": 245, "name": "橡胶"}, {
                "id": 246,
                "name": "塑料"
            }, {"id": 247, "name": "能源"}, {"id": 248, "name": "冶金"}, {"id": 249, "name": "包装材料"}], [{
                "id": 250,
                "name": "通用机械设备"
            }, {"id": 251, "name": "通用零配件"}, {"id": 252, "name": "建筑工程机械"}, {"id": 253, "name": "勘探机械"}, {
                "id": 254,
                "name": "化工机械"
            }, {"id": 255, "name": "木材石材加工机械"}, {
                "id": 256,
                "name": "印刷机械"
            }, {"id": 257, "name": "模具"}, {"id": 258, "name": "食品机械"}, {"id": 259, "name": "农林机械"}, {
                "id": 260,
                "name": "纸制造加工设备"
            }, {"id": 261, "name": "制鞋纺织机械"}, {"id": 262, "name": "商业设备"}, {"id": 263, "name": "包装机械"}, {
                "id": 264,
                "name": "制药设备"
            }, {"id": 265, "name": "冶炼铸造设备"}, {
                "id": 266,
                "name": "机床机械"
            }, {"id": 267, "name": "五金工具"}, {"id": 268, "name": "物流设备"}, {"id": 269, "name": "清洁通风设备"}, {
                "id": 270,
                "name": "焊接材料设备"
            }, {"id": 271, "name": "玻璃橡塑设备"}, {"id": 272, "name": "金属材料"}, {
                "id": 273,
                "name": "电子产品制造设备"
            }], [{"id": 274, "name": "家具"}, {"id": 275, "name": "家纺家饰"}, {
                "id": 276,
                "name": "厨具餐具"
            }, {"id": 277, "name": "日化用品"}], [{"id": 278, "name": "大型家电"}, {"id": 279, "name": "厨用电器"}, {
                "id": 280,
                "name": "卫浴家电"
            }, {"id": 281, "name": "健康电器"}, {"id": 282, "name": "生活小家电"}], [{"id": 283, "name": "学前教育"}, {
                "id": 284,
                "name": "小初高教育"
            }, {"id": 285, "name": "高教自考"}, {
                "id": 286,
                "name": "留学"
            }, {"id": 287, "name": "IT培训"}, {"id": 288, "name": "语言培训"}, {"id": 289, "name": "职业培训"}, {
                "id": 290,
                "name": "文体培训"
            }, {"id": 291, "name": "企业培训拓展"}, {"id": 292, "name": "特殊人群教育"}], [{"id": 293, "name": "污染处理"}, {
                "id": 294,
                "name": "废旧回收"
            }, {"id": 295, "name": "节能"}], [{
                "id": 296,
                "name": "理财"
            }, {"id": 297, "name": "银行"}, {"id": 298, "name": "保险"}, {"id": 299, "name": "投资担保"}, {
                "id": 300,
                "name": "典当"
            }], [{"id": 301, "name": "礼品"}], [{"id": 302, "name": "旅游"}, {"id": 303, "name": "宾馆酒店"}, {
                "id": 304,
                "name": "交通票务"
            }, {"id": 305, "name": "文体票务"}], [{
                "id": 306,
                "name": "化妆品"
            }, {"id": 307, "name": "美容"}], [{"id": 308, "name": "母婴护理"}], [{"id": 309, "name": "兽医兽药"}, {
                "id": 310,
                "name": "农药"
            }, {"id": 311, "name": "化肥"}, {"id": 312, "name": "养殖"}, {"id": 313, "name": "种植"}, {
                "id": 314,
                "name": "园林景观"
            }], [{"id": 315, "name": "操作系统"}, {
                "id": 316,
                "name": "中间件软件"
            }, {"id": 317, "name": "应用软件"}, {"id": 318, "name": "杀毒软件"}, {"id": 319, "name": "监控安全软件"}, {
                "id": 320,
                "name": "数据库软件"
            }, {"id": 321, "name": "企业软件"}, {"id": 322, "name": "行业专用软件"}, {"id": 323, "name": "支付结算软件"}, {
                "id": 324,
                "name": "教学软件"
            }], [{"id": 325, "name": "出国"}, {
                "id": 326,
                "name": "招聘"
            }, {"id": 327, "name": "翻译"}, {"id": 328, "name": "设计"}, {"id": 329, "name": "广告"}, {
                "id": 330,
                "name": "公关策划"
            }, {"id": 331, "name": "咨询"}, {"id": 332, "name": "拍卖"}, {"id": 333, "name": "代理"}, {
                "id": 334,
                "name": "调查"
            }, {"id": 335, "name": "法律服务"}, {
                "id": 336,
                "name": "会计审计"
            }, {"id": 337, "name": "铃声短信"}], [{"id": 338, "name": "搬家"}, {"id": 339, "name": "家政"}, {
                "id": 340,
                "name": "征婚交友"
            }, {"id": 341, "name": "仪式典礼"}, {"id": 342, "name": "摄影"}, {"id": 343, "name": "汽车租赁"}, {
                "id": 344,
                "name": "家电维修"
            }, {"id": 345, "name": "居民服务"}], [{
                "id": 346,
                "name": "生活食材"
            }, {"id": 347, "name": "休闲零食"}, {"id": 348, "name": "饮料"}, {"id": 349, "name": "保健食品"}, {
                "id": 350,
                "name": "烟酒"
            }, {"id": 351, "name": "餐馆"}], [{"id": 352, "name": "手机"}, {"id": 353, "name": "数码产品"}], [{
                "id": 354,
                "name": "通讯服务"
            }, {"id": 355, "name": "通讯设备"}], [{
                "id": 356,
                "name": "网站建设"
            }, {"id": 357, "name": "域名空间"}], [{"id": 358, "name": "男科"}, {"id": 359, "name": "妇科"}, {
                "id": 360,
                "name": "美容整形"
            }, {"id": 361, "name": "专科医院"}, {"id": 362, "name": "中医"}, {"id": 363, "name": "体检机构"}, {
                "id": 364,
                "name": "综合医院"
            }, {"id": 365, "name": "药品"}, {
                "id": 366,
                "name": "医疗器械"
            }], [{"id": 367, "name": "游戏开发"}, {"id": 368, "name": "游戏运营"}, {"id": 369, "name": "游戏周边"}], [{
                "id": 370,
                "name": "体育器械"
            }, {"id": 371, "name": "休闲活动"}, {"id": 372, "name": "运势测算"}, {"id": 373, "name": "宠物服务"}, {
                "id": 374,
                "name": "玩具模型"
            }, {"id": 375, "name": "乐器"}], [{
                "id": 376,
                "name": "服装饰品加盟"
            }, {"id": 377, "name": "美容化妆加盟"}, {"id": 378, "name": "礼品加盟"}, {"id": 379, "name": "食品保健品加盟"}, {
                "id": 380,
                "name": "生活服务加盟"
            }, {"id": 381, "name": "教育培训加盟"}, {"id": 382, "name": "机械电子建材加盟"}, {"id": 383, "name": "汽车加盟"}, {
                "id": 384,
                "name": "旅游住宿加盟"
            }, {
                "id": 385,
                "name": "干洗加盟"
            }, {"id": 386, "name": "综合招商"}, {"id": 387, "name": "养殖加盟"}], [{
                "id": 388,
                "name": "学术公管社会组织"
            }], [{"id": 389, "name": "国际组织"}], [{"id": 390, "name": "其他"}]],
            "leve1": ["全部","安全安保", "办公文教", "彩票", "车辆物流", "成人用品", "出版传媒", "电脑硬件", "电子电工", "房地产建筑装修", "分类平台", "服装鞋帽", "箱包饰品", "化工原料制品", "机械设备", "家庭日用品", "家用电器", "教育培训", "节能环保", "金融服务", "礼品", "旅游住宿", "美容化妆", "母婴护理", "农林牧渔", "软件", "商务服务", "生活服务", "食品保健品", "手机数码", "通讯服务设备", "网络服务", "医疗服务", "游戏", "运动休闲娱乐", "招商加盟", "学术公管社会组织", "国际组织", "其他"]
        };


        $scope.industrySel2 = {}
        $scope.industrySel = {
            list:industry.leve1,
            callback:function(e,d,list){
                $scope.industrySel2.$destroy();
                if(!d)return;
                var i = list.length;
                while (i--) {
                    if (d == industry.leve1[i]) {
                        break;
                    }
                }
                $scope.industrySel2.list = industry.leve2[i];
            }
        }

        $scope.getIndustry = function (name) {
            var i = industry.leve2.length;
            while (i--) {
                if (name)break;
                for (var j = 0; j < industry.leve2[i].length; j++) {
                    if (industry.leve2[i][j].id == $scope.industryId) {
                        name = industry.leve1[i];
                        $scope.industryName = industry.leve2[i][j].name;
                        break;
                    }
                }
            }
            return name
        };

        $scope.postEdit = function(){
            var body = {
                id: id,
                customerId: $scope.clientId,
                industryId: $scope.industryId,
                qualificationsUrl: $scope.qualificationsUrl,
                qualificationName: $scope.qualificationName
            }
            ycui.loading.show();
            QualificationFty.updateQualifications(body).then(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewCustomer1');
                        }
                    })
                }
            })
        }
}]);
/**
 * Created by moka on 16-6-16.  
 */
app.controller("clientLimitCtrl", ['$scope', 'SysRuleUserFty',
    function ($scope, SysRuleUserFty) {
        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 3}).then(function (res) {
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
            $scope.qualityRule = _object;
            $scope.clientRule = _object;
        })
    }])