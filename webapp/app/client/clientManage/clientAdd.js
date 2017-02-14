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
