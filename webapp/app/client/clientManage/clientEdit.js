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
        CustomerFty.getCustomer({id: id}).success(function (response) {
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

                CustomerFty.getAllCustomer({customerType:2}).success(function (response) {
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
                
                CustomerFty.updateCustomer(query).success(function (response) {
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
                d && SysUserFty.depAndUserList({companyId:d.id}).success(function (res) {
                    if(res && res.code == 200){
                        $scope.departmentListSel.list = res.departmentList;
                    }
                });
            }
        };
        SysCompanyFty.companyList().success(function (res) {
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
            CustomerFty.getCustomerFlowUser($scope.query).success(modView);
        };

        $scope.$on('client-add',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            CustomerFty.getCustomerFlowUser($scope.query).success(modView);
        })
        CustomerFty.getCustomerFlowUser($scope.query).success(modView);

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

