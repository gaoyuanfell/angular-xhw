/**
 * Created by moka on 16-6-21.
 */
/**
 * 合同号列表
 */
app.controller('contractListCtrl', ['$scope', 'ContractFty','UploadKeyFty',
    function ($scope, ContractFty,UploadKeyFty) {
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
        };
        $scope.query = {pageSize: 10, pageIndex: 1};
        ContractFty.listContracts($scope.query).then(modViewA);

        $scope.redirect = function (num,con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search
            ContractFty.listContracts($scope.query).then(modViewA);
        };

        var upload = function(id){
            var key = '';
            var config = {
                server: baseUrl + "/contracts/readContracts.htm",
                pick: {
                    id: '#'+id,
                    multiple: false
                },
                // accept: {
                //     title: 'xls',
                //     extensions: 'xls,xlsx',
                //     mimeTypes: '.xls,.xlsx'
                // },
                error:function(uploader,err){
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: -1,
                        error:true
                    });
                    ycui.loading.hide();
                    uploader.reset();
                },
                uploadComplete:function(){
                    ycui.loading.hide();
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
                },
                uploadSuccess:function(uploader,file, res){
                    if (res && res.code == 200) {
                        var arr = res.msg.replace(/\;/g,'<br>');
                        ycui.alert({
                            content: '<div style="max-height: 300px;overflow-y: auto;width: auto;">'+ arr +'</div>',
                            timeout: 10,
                            okclick:function () {
                                ContractFty.listContracts(query).then(modViewA);
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
            return uploadInit(config);
        }

        // var uploadInit = function (id) {
        //     var config = {
        //         server: baseUrl + "/contracts/readContracts.htm",
        //         pick: {
        //             id: '#'+id,
        //             multiple: false
        //         },
        //         fileVal: "uploadFile",
        //         accept: {
        //             title: 'xls',
        //             extensions: 'xls,xlsx',
        //             mimeTypes: '.xls,.xlsx'
        //         }
        //     };
        //     var uploader = WebUploader.create(config);
        //     uploader.on('error', function (err) {
        //         ycui.alert({
        //             content: "错误的文件类型",
        //             timeout: -1,
        //             error:true
        //         });
        //         ycui.loading.hide();
        //         uploader.reset();
        //     });
        //     uploader.on('uploadComplete', function () {
        //         ycui.loading.hide();
        //     });
        //     var key = '';
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
        //     });
        //     return uploader
        // };
        
        /**
         * 合同导入
         */
        // upload('contractImport')

        // var uploader = uploadInit('contractImport').on('uploadSuccess',function (file, res) {
        //     if (res && res.code == 200) {
        //         var arr = res.msg.replace(/\;/g,'<br>');
        //         ycui.alert({
        //             content: '<div style="max-height: 300px;overflow-y: auto;width: auto;">'+ arr +'</div>',
        //             timeout: -1,
        //             okclick:function () {
        //                 ContractFty.listContracts(query).then(modViewA);
        //             }
        //         });
        //         ycui.loading.hide();
        //         uploader.reset();
        //     }else if (res._raw == "false") {
        //         ycui.alert({
        //             content: "不正确的操作",
        //             timeout: -1,
        //             error:true
        //         });
        //         uploader.reset();
        //     } else {
        //         ycui.alert({
        //             content: res.msg,
        //             timeout: -1,
        //             error:true
        //         });
        //         uploader.reset();
        //     }
        // });

        $scope.contractDown = function () {
            window.open(fileUrl + '/download/合同录入模板.xlsx','_blank')
        }
    }]);

/**
 * 新增合同号
 */
app.controller('contractAddCtrl', ['$scope', 'ContractFty',
    function ($scope, ContractFty) {
        $scope.contract = {type:1};

        $scope.postEdit = function () {
            if(!$(".form").valid()){
                return;
            }
            var query = {
                contractCode:$scope.contract.contractCode,
                contractMoney:$scope.contract.contractMoney,
                discount:$scope.contract.discount*.01,
                present:$scope.contract.present*.01,
                type:$scope.contract.type,
                contractName:$scope.contract.contractName
            }
            ycui.loading.show();
            ContractFty.addContracts(query).then(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewContract')
                        },
                        timeout: 10
                    });
                }
            })
        };
        /**
         * 验证
         */
        $(".form").validate({
            rules: {
                contractCode: {required: true},
                contractMoney: {required: true, number: true,min:1,},
                discount: {
                    required: true, 
                    number: true,
                    min:1,
                    max:100
                },
                present: {
                    required: true, 
                    number: true,
                    min:0
                },
                contractName: {required: true}
            },
            messages: {
                contractCode: {required: '请输入合同号'},
                contractMoney: {required: '请输入合同总金额',number:'请输入正确的合同总金额',min:'请输入大于等于1合同总金额'},
                discount: {required: '请输入合同折扣比例',number:'请输入正确的合同折扣比例',min:'请输入大于等1合同折扣比例',max:'请输入小于等于100合同折扣比例'},
                present: {required: '请输入合同配送比例',number:'请输入正确的合同配送比例',min:'请输入大于等于0配送比例'},
                contractName: {required: '请输入合同名称'}
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);

/**
 * 修改合同号
 */
app.controller('contractEditCtrl', ['$scope', 'ContractFty',
    function ($scope, ContractFty) {
        $scope.contract = {};
        var id = getSearch("id");
        $scope.id = id;
        ContractFty.findContracts({id: id}).then(function (res) {
            if (res && res.code == 200) {
                $scope.contract = res.items;
                $scope.contract.discount = $scope.contract.discount*100;
                $scope.contract.present = $scope.contract.present*100;
            }
        });

        $scope.postEdit = function () {
            if(!$(".form").valid()){
                return;
            }
            var query = {
                contractCode:$scope.contract.contractCode,
                contractMoney:$scope.contract.contractMoney,
                discount:$scope.contract.discount*.01,
                id:$scope.contract.id,
                present:$scope.contract.present*.01,
                type:$scope.contract.type,
                contractName:$scope.contract.contractName
            };
            ycui.loading.show();
            ContractFty.updateContracts(query).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewContract')
                        },
                        timeout: 10
                    });
                }
            })
        };
        /**
         * 验证
         */
        $(".form").validate({
            rules: {
                contractCode: {required: true},
                contractMoney: {required: true, number: true,min:1},
                discount: {
                    required: true,
                    number: true,
                    min:1,
                    max:100
                },
                present: {
                    required: true,
                    number: true,
                    min:0
                },
                contractName: {required: true}
            },
            messages: {
                contractCode: {required: '请输入合同号'},
                contractMoney: {required: '请输入合同总金额',number:'请输入正确的合同总金额',min:'请输入大于等于1合同总金额'},
                discount: {required: '请输入合同折扣比例',number:'请输入正确的合同折扣比例',min:'请输入大于等于1合同折扣比例',max:'请输入小于等于100合同折扣比例'},
                present: {required: '请输入合同配送比例',number:'请输入正确的合同配送比例',min:'请输入大于等于0配送比例'},
                contractName: {required: '请输入合同名称'}
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);