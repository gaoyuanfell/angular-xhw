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