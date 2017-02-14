/**
 * Created by moka on 16-6-16.
 */
app.controller("affcheAddCtrl", ['$scope', 'SysNoticeFty','SysUserFty','UploadKeyFty',
    function ($scope, SysNoticeFty,SysUserFty,UploadKeyFty) {
        $scope.affche = {
            state:0,
            isPublic: 1,
            isEmail: 1,
            important: 0,
            publishRange:0
        };

        $scope.$on('loginUserInfo',function () {
            SysUserFty.userInfo({id: $scope.$parent.user.id}).then(function (res) {
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

        upload('affcheAddUpload')

        $scope.postEdit = function () {
            if(!$(".form").valid())return;
            ycui.loading.show();
            SysNoticeFty.addNotice($scope.affche).then(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewNotice')
                        }
                    });
                }
            })
        };

        $(".form").validate({
            rules: {
                myTitle: "required",
                myContent: "required"
            },
            messages: {
                myTitle: "请输入公告名称",
                myContent: "请输入公告内容"
            },
            errorClass: "error-span",
            errorElement: "span"
        })

    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller("affcheEditCtrl", ['$scope', '$http', 'SysNoticeFty','SysUserFty','UploadKeyFty',
    function ($scope, $http, SysNoticeFty,SysUserFty,UploadKeyFty) {
        var id = getSearch("id");
        ycui.loading.show();

        $scope.$on('loginUserInfo',function () {
            SysUserFty.userInfo({id: $scope.$parent.user.id}).then(function (res) {
                if (res) {
                    $scope.roleList = res.roleList;
                }
            })
        });
        
        SysNoticeFty.edit({id: id}).then(function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.affche = response;
            
            // $scope.title = response.title;
            // $scope.content = response.content;
            // $scope.isEmail = response.isEmail;
            // $scope.companyId = response.companyId;
            // $scope.departmentId = response.departmentId;
            // $scope.important = response.important;
            // $scope.showDate = response.showDate;
            // $scope.publishUser = response.publishUser;
            // $scope.state = response.state == 0 ? true : false;
            // $scope.sort = response.sort;
            // $scope.createTime = response.createTime;
            // $scope.updateTime = response.updateTime;
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

        upload('affcheAddUpload')


        $scope.postEdit = function () {
            
            var body = angular.copy($scope.affche);
            if(!$(".form").valid())return;
            delete body.createTime;
            delete body.updateTime;
            ycui.loading.show();
            SysNoticeFty.updateNotice(body).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewNotice')
                        },
                        timeout: 10
                    });
                }
            });
        };

        $(".form").validate({
            rules: {
                userName: "required",
                myContent: "required"
            },
            messages: {
                userName: "请输入公告名称",
                myContent: "请输入公告内容"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('afficheManageCtrl', ['$scope', '$http', 'SysNoticeFty',
    function ($scope, $http, SysNoticeFty) {
        ycui.loading.show();
        var pageSize = 10;
        modView = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.query = {pageSize:10,pageIndex:1};

        var endTime = new Date().dateFormat() + " 23:59:59";
        var startTime = new Date().calendar(1, -7).dateFormat() + " 00:00:00";
        $scope.query.endTime = endTime;
        $scope.query.startTime = startTime;

        SysNoticeFty.noticeList($scope.query).then(modView);
        $scope.ruleId = getSearch("ruleId");
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.searchConext = $scope.query.search;
            SysNoticeFty.noticeList($scope.query).then(modView);
        };
        $scope.delete = function (id) {
            ycui.confirm({
                content: "您确定要删除么",
                okclick: function () {
                    SysNoticeFty.removeNotice({id: id}).then(function (response) {
                        if (!response) return;
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                SysNoticeFty.noticeList($scope.query).then(modView);
                            }
                        });
                    })
                }
            })
        };

        var dateRange = new pickerDateRange('dateRangeAff', {
            defaultText: ' / ',
            isSingleDay: false,
            stopToday: false,
            calendars: 2,
            startDate: new Date().calendar(1, -7).dateFormat(),
            endDate: new Date().dateFormat(),
            inputTrigger: 'dateRange',
            success: function (obj) {
                $scope.query.startTime = obj.startDate + " 00:00:00";
                $scope.query.endTime = obj.endDate + " 23:59:59";
                SysNoticeFty.noticeList($scope.query).then(modView);
            }
        });
        
        $scope.changeState = function (id,state) {
            SysNoticeFty.enableNotice({id:id,state:~state}).then(function (res) {
                if(res && res.code == 200){
                    SysNoticeFty.noticeList($scope.query).then(modView);
                }
            })
        }
    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller("companyAddCtrl", ['$scope', '$http', 'SysCompanyFty', 'DictionaryFty', 
    function ($scope, $http, SysCompanyFty, DictionaryFty) {
    $scope.companyTypeSel = {
        list:[{name: '总公司', id: 1}, {name: '分公司', id: 2}],
        callback:function(e,d){
            d && d.id == 1 && (delete $scope.companyAreaId);
        }
    }
        $scope.companyType = 2;
    //获取地域
    ycui.loading.show();
    DictionaryFty.provinceListForCompany().then(function (response) {
        ycui.loading.hide();
        $scope.areaList = response;
    });

    $scope.postEdit = function () {
        $scope.validate = true;
        var pass = true;

        //下拉菜单的验证
        if ($scope.companyType == undefined) {
            pass = false
        }

        // if ($scope.companyType == 2 && $scope.companyAreaId == undefined) {
        //     pass = false
        // }

        //验证表单		
        if (!$(".form").valid()) {
            pass = false
        }

        if (pass) {
            ycui.loading.show();
            SysCompanyFty.companyAdd({
                companyName: $scope.companyName,
                manager: $scope.manager,
                phone: $scope.phone,
                remark: $scope.remark,
                companyType: $scope.companyType,
                companyAreaId: $scope.companyAreaId,
                email: $scope.email,
                telephone:$scope.telephone
            }).then(function (response) {
                ycui.loading.hide();
                if (response.code && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewCompany')
                        },
                        timeout: 10
                    })
                }
            });
        }
    };

    //表单验证
    $(".form").validate({
        rules: {
            userName: "required",
            companyName: {
                required: true
            },
            myUrl: {
                required: true,
                url: true
            },
            companyPerson: 'required',
            phone: {
                required: true,
                phone: true
            },
            telephone: {
                required: true,
                phone: true
            },
            myEmail: {
                required: true,
                email: true
            }
        },
        messages: {
            userName: '请输入公司名称',
            companyName: {
                required: '请输入公司简称'
            },
            companyPerson: '请输入公司管理员',
            phone: {
                required: '请输入电话'
            },
            telephone: {
                required: '请输入座机'
            },
            myEmail: {
                required: '请输入邮箱'
            }
        },
        errorClass: 'error-span',
        errorElement: 'span'
    });
}]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('companyEditCtrl', ['$scope', '$http', 'SysCompanyFty', 'DictionaryFty', 
    function ($scope, $http, SysCompanyFty, DictionaryFty) {
    var id = getSearch('id');
    $scope.companyTypeSel = {
        list:[{name: '总公司', id: 1}, {name: '分公司', id: 2}],
        callback:function(e,d){
            d && d.id == 1 && (delete $scope.companyAreaId);
        },
        disabled:1
    }
    ycui.loading.show();
    SysCompanyFty.companyEditInfo({id: id}).then(function (response) {
        ycui.loading.hide();
        if(!response) return;
        $scope.companyName = response.companyName;
        $scope.abbrName = response.abbrName;
        $scope.companyUrl = response.companyUrl;
        $scope.manager = response.manager;
        $scope.phone = response.phone;
        $scope.companyType = response.companyType;
        $scope.email = response.email;
        $scope.companyAreaId = response.companyAreaId;
        $scope.telephone = response.telephone;
        // setTimeout(function () {
        //     $("input[type=radio]").each(function (i, n) {
        //         if ($scope.companyAreaId == (i + 1)) {
        //             $(this).prop("checked", "checked")
        //         }
        //     })
        // }, 200)
    });

    //更新客户类型下拉菜单
    // $scope.updateCompanyType = function (id) {
    //     $scope.companyType = id;
    //     if (id == 1) {
    //         $scope.companyAreaId = 0;
    //     } else {
    //         $scope.companyAreaId = -1;
    //     }
    // };

    //获取地域
    DictionaryFty.provinceListForCompany().then(function (response) {
        $scope.areaList = response;
    });

    //获取value值
    // $scope.getAreaId = function (id) {
    //     $scope.companyAreaId = id;
    //     $('.selectArea').parent().find('.error-message').remove();
    // };

    $scope.postEdit = function () {

        $scope.validate = true;
        var pass = true;

        //下拉菜单的验证
        if ($scope.companyType == undefined) {
            pass = false
        }

        // if ($scope.companyType == 2 && $scope.companyAreaId == undefined) {
        //     pass = false
        // }

        if (!$(".form").valid()) {
            pass = false;
        }

        if (pass) {
            ycui.loading.show();
            SysCompanyFty.companyEdit({
                id: id,
                companyName: $scope.companyName,
                abbrName: $scope.abbrName,
                companyUrl: $scope.companyUrl,
                manager: $scope.manager,
                phone: $scope.phone,
                companyType: $scope.companyType,
                companyAreaId: $scope.companyAreaId,
                email: $scope.email,
                telephone:$scope.telephone
            }).then(function (response) {
                ycui.loading.hide();
                if (response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewCompany')
                        },
                        timeout:10
                    })
                }
            })
        }
    };

    $(".form").validate({
        rules: {
            userName: "required",
            companyName: {
                required: true
            },
            myUrl: {
                required: true,
                url: true
            },
            companyPerson: 'required',
            phone: {
                required: true,
                phone: true
            },
            telephone: {
                required: true,
                phone: true
            },
            myEmail: {
                required: true,
                email: true
            }
        },
        messages: {
            userName: '请输入公司名称',
            companyName: {
                required: '请输入公司简称'
            },
            companyPerson: '请输入公司管理员',
            phone: {
                required: '请输入电话'
            },
            telephone: {
                required: '请输入座机'
            },
            myEmail: {
                required: '请输入邮箱'
            }
        },
        errorClass: 'error-span',
        errorElement: 'span'
    });

}]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('companyManageCtrl', ['$scope', '$http', 'SysCompanyFty',
    function ($scope, $http, SysCompanyFty) {
        ycui.loading.show();
        $scope.page = {}
        var pageSize = 10,
            modView = function (response) {
                ycui.loading.hide();
                if (!response) return;
                $scope.page = {
                    page:response.page,
                    total_page:response.total_page
                }
                $scope.items = response.items;
                $scope.total_page = response.total_page;
            };

        $scope.query = {pageSize: pageSize,pageIndex:1};

        SysCompanyFty.companyPageList($scope.query).then(modView);

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.companyNameOrAbbr = $scope.query.search;
            SysCompanyFty.companyPageList($scope.query).then(modView);
        };

        ycui.select(".yc-select", function (valueId) {
            var arr = valueId.attr("data-value").split(":");
            var stringId = arr[0];
            var numId = arr[1];
            switch (stringId) {
                case "com":
                    $scope.companyType = numId == -1 ? "" : numId;
                    break;
            }
            var query = {pageSize: pageSize, pageIndex: 1};
            $scope.companyType && (query.companyType = $scope.companyType);
            SysCompanyFty.companyPageList(query).then(modView);
        })
        
    }]);
/**
 * Created by zhouqi on 2016/7/1.
 */
app.controller('contractTolerantAddCtrl', ['$scope', '$http', 'SysContractTolerantFty',
    function ($scope, $http, SysContractTolerantFty) {
        SysContractTolerantFty.contractTolerantCurrent().then(function (res) {
            if(res){
                $scope._cache = angular.copy(res);
                $scope.tolerantRule = res.tolerantRule;
                $scope.tolerant = accMul(res.tolerant,100);
                $scope.tolerantMoney = res.tolerantMoney;
            }else{
                $scope.tolerantRule = 1;
            }
        });

        $scope.tolerantSel = {
            list:[
                {name:'就低原则',id:1},
                {name:'就高原则',id:2},
            ]
        }

        $scope.postEdit = function () {
            if($scope.tolerant == $scope._cache.tolerant * 100 && $scope.tolerantMoney == $scope._cache.tolerantMoney && $scope.tolerantRule == $scope._cache.tolerantRule){
                ycui.alert({"content":"数据没有修改，请修改后提交！"});
                return;
            }
            if(!$(".form").valid)return;
            ycui.loading.show();
            SysContractTolerantFty.contractTolerantAdd({
                tolerant:$scope.tolerant * .01,
                tolerantMoney:$scope.tolerantMoney,
                tolerantRule:$scope.tolerantRule
            }).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        timeout:10,
                        okclick: function () {
                            goRoute('ViewTolerantRate');
                        }
                    })
                }
            })
        };

        $(".form").validate({
            rules: {tolerant: "required",tolerantMoney: "required"},
            messages: {tolerant: "请输入比率",tolerantMoney: "请输入绝对值"},
            errorClass: "error-span",
            errorElement: "span"
        });
    }]);
/**
 * Created by zhouqi on 2016/7/1.
 */
app.controller('contractTolerantCtrl', ['$scope', '$http', 'SysContractTolerantFty', function ($scope, $http, SysContractTolerantFty) {
    ycui.loading.show();
    SysContractTolerantFty.contractTolerantCurrent().then(function (res) {
        if(res){
            $scope.tolerantRule = res.tolerantRule;
            $scope.currentTolerant = res.tolerant;
            $scope.currentTolerantMoney = res.tolerantMoney;
        }
    });
    
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

    $scope.query = {pageSize: pageSize,pageIndex:1};

    SysContractTolerantFty.contractTolerantList($scope.query).then(modView);

    $scope.redirect = function (num) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1
        SysContractTolerantFty.contractTolerantList($scope.query).then(modView);
    };
}]);

app.filter('tolerantRuleFtr',function () {
    return function (input) {
        switch (input) {
            case 1:
                return "就低原则";
            case 2:
                return "就高原则";
        }
    };
});
/**
 * Created by moka on 16-6-16.
 */
app.controller("departmentAddCtrl", ['$scope', '$http', 'SysDepartmentFty', '$q',
    function ($scope, $http, SysDepartmentFty, $q) {
        $scope.parentDepSel = {};
        $scope.deListSel = {
            callback:function(e,d){
                if(d){
                    $scope.parentDepSel.$destroy()
                    SysDepartmentFty.parentDeps({companyId:d.id}).then(function(res){
                        if(res && res.code == 200){
                            $scope.parentDepSel.list = res.departmentList
                        }
                    })
                }
            }
        };
        
        var departmentListForDep = SysDepartmentFty.departmentListForDep().then(function (response) {
            $scope.deListSel.list = response.companyList;
        });

        $scope.postEdit = function () {
            $scope.validate = true;
            var pass = $(".form").valid()
            if ($scope.deListId == undefined) {
                pass = false
            }

            if (pass) {
                ycui.loading.show();
                SysDepartmentFty.departmentAdd({
                    departmentName: $scope.departmentName,
                    companyId: $scope.deListId,
                    parentDepId:$scope.parentDepId,
                    companyType:$scope.companyType
                }).then(function (response) {
                    ycui.loading.hide();
                    if (response && response.code == 200) {
                        ycui.alert({
                            content: response.msg,
                            okclick: function () {
                                goRoute('ViewDepartment')
                            },
                            timeout:10
                        });
                    }
                })
            }
        };

        //下拉框
        // ycui.select(".yc-select");

        /*表单验证*/
        $(".form").validate({
            rules: {
                departmentName: "required"
            },
            messages: {
                departmentName: '请输入部门名称'
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('departmentEditCtrl', ['$scope', '$http', 'SysDepartmentFty','$q',
    function ($scope, $http, SysDepartmentFty,$q) {
        var id = getSearch('id');
        ycui.loading.show();
        $scope.parentDepSel = {};
        $scope.deListSel = {
            // callback:function(e,d){
            //     if(d){
            //         $scope.parentDepSel.$destroy()
            //         SysDepartmentFty.parentDeps({companyId:d.id}).then(function(res){
            //             if(res && res.code == 200){
            //                 $scope.parentDepSel.list = res.departmentList
            //             }
            //         })
            //     }
            // }
        };
        // var departmentListForDep = SysDepartmentFty.departmentListForDep().then(function (response) {
        //     if (!response) return;
        //     $scope.deListSel.list = response.companyList;
        // });
        SysDepartmentFty.departmentEditInfo({id: id}).then(function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.id = response.id;
            $scope.deListId = response.companyId;
            $scope.companyName = response.companyName;
            $scope.departmentName = response.departmentName;
            $scope.companyType = response.companyType;
            $scope.parentDepId = response.parentDepId;
            $scope.parentDepName = response.parentDepName;
        });

        $scope.postEdit = function () {
            $scope.validate = true;
            var pass = $(".form").valid()
            if ($scope.deListId == undefined) {
                pass = false
            }
            if(!pass)return;
            ycui.loading.show();
            SysDepartmentFty.departmentEdit({
                id: $scope.id,
                departmentName: $scope.departmentName,
                companyId: $scope.deListId,
                companyType:$scope.companyType,
                parentDepId:$scope.parentDepId
            }).then(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewDepartment')
                        },
                        timeout:10
                    });
                }
            })
        };

        /*表单验证*/
        $(".form").validate({
            rules: {
                myText: "required"
            },
            messages: {
                myText: "请输入部门名称"
            },
            errorClass: 'error-span',
            errorElement: 'span',
            submitHandler: function (form) {
                $scope.postEdit();
            }
        });

    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('departmentManageCtrl', ['$scope', '$http', 'SysDepartmentFty', '$q',
    function ($scope, $http, SysDepartmentFty, $q) {
        ycui.loading.show();
        var pageSize = 10,
            modView = function (response) {
                ycui.loading.hide();
                if (!response) return;
                $scope.page = {
                    page:response.page,
                    total_page:response.total_page
                }
                $scope.items = response.items;
                $scope.total_page = response.total_page;
            };

        $scope.companyListSel = {
            callback:function(){
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                SysDepartmentFty.departmentPageList($scope.query).then(modView);
            }
        }
        var getCompany = SysDepartmentFty.getCompany().then(function (response) {
            if (response && response.code == 200) {
                $scope.companyListSel.list = response.companyList;
            }
        });
        $scope.query = {pageSize: pageSize,pageIndex:1};

        SysDepartmentFty.departmentPageList($scope.query).then(modView);


        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.departmentName = $scope.query.search;
            SysDepartmentFty.departmentPageList($scope.query).then(modView);
        };
    }]);
/**
 * Created by moka on 16-8-31.
 */
app.controller('FileManageCtrl',['$scope','SysDocumentFty',function ($scope,SysDocumentFty) {
    ycui.loading.show();
    $scope.query = {
        pageSize:10,
        pageIndex:1
    };
    var modView = function (response) {
        ycui.loading.hide();
        if (!response) return;
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;
    };

    SysDocumentFty.documentList($scope.query).then(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search;
        SysDocumentFty.documentList($scope.query).then(modView);
    };

    $scope.delete = function (id) {
        ycui.confirm({
            title:'文档删除',
            content:'确定要删除此文档?',
            okclick:function () {
                SysDocumentFty.documentDel({id:id}).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:10,
                            okclick:function () {
                                SysDocumentFty.documentList($scope.query).then(modView);
                            }
                        })
                    }
                })
            }
        })
    }
}])

app.controller('FileAddCtrl',['$scope','UploadKeyFty','SysDocumentFty',function ($scope,UploadKeyFty,SysDocumentFty) {
    
    $scope.document = {};

    var upload = function (id) {
        var key = '';
        var config = {
            server: fileUrl + "/contract/uploadDocument.htm",
            pick: {
                id: '#'+id,
                multiple: false
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
                var size = 100*1024*1024;
                if(file.size > size){
                    ycui.alert({
                        content: "文件大小不能超过100M(1M等于1024KB)",
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
                data.fileSize = $scope.fileSize;
            },
            uploadSuccess:function (uploader, file, res) {
                if(res){
                    $scope.$apply(function(){
                        $scope.document.documentUrl = res.uploadFile;
                    })
                }
            }
        }
        return uploadInit(config);
    };

    upload('documentUrl');
    
    $scope.postEdit = function () {
        $scope.validShow = true;
        var bo = true;
        if(!$(".form").valid()){
            bo = false;
        }
        if(!$scope.document.documentUrl){
            bo = false;
        }
        if(!bo){return};
        ycui.loading.show();
        SysDocumentFty.documentAdd($scope.document).then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ManageHelpDocument');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            documentName: "required"
        },
        messages: {
            documentName: "请输入文档名称"
        },
        errorClass: "error-span",
        errorElement: "span"
    })
    
}]);
/**
 * Created by moka on 16-8-5.
 */
app.controller('contractSyncCtrl',['$scope','DataSyncFty',function ($scope,DataSyncFty) {
    $scope.contractSync = function () {
        ycui.loading.show();
        DataSyncFty.getContract().then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    title:'合同同步',
                    content:'同步成功',
                    timeout:-1
                })
            }
        });
    };

    ycui.loading.show();
    var modView = function (response) {
        ycui.loading.hide();
        if(!response) return;
        $scope.page_size = response.page_size;
        $scope.prev_page = response.prev_page;
        $scope.total_page = response.total_page;
        $scope.items = response.items;
        $scope.page = response.page;
        $scope.total_count = response.total_count;
    };

    $scope.query = {pageSize:10,startTime:getDateFormat(),endDate:getDateFormat(),pageIndex:1,paramInt1:0};

    DataSyncFty.listSynLogs($scope.query).then(modView);

    new pickerDateRange('calendar-contract', {
        defaultText: ' / ',
        isSingleDay: false,
        stopToday: false,
        calendars: 2,
        startDate: getDateFormat(),
        endDate: getDateFormat(),
        success: function (obj) {
            $scope.query.pageIndex = 1;
            $scope.query.startTime = obj.startDate;
            $scope.query.endDate = obj.endDate;
            DataSyncFty.listSynLogs($scope.query).then(modView);
        }
    });
}]);

app.controller('incomePushCtrl',['$scope','DataSyncFty',function ($scope,DataSyncFty) {
    $scope.incomePush = function () {
        ycui.loading.show();
        DataSyncFty.pushContractMoney().then(function (res) {
            if(res && res.code == 200){
                ycui.alert({
                    title:'推送金额',
                    content:'推送成功',
                    timeout:-1
                })
            }
        });
    };

    ycui.loading.show();
    var modView = function (response) {
        ycui.loading.hide();
        if(!response) return;
        $scope.page_size = response.page_size;
        $scope.prev_page = response.prev_page;
        $scope.total_page = response.total_page;
        $scope.items = response.items;
        $scope.page = response.page;
        $scope.total_count = response.total_count;
    };

    $scope.query = {pageSize:10,startTime:getDateFormat(),endDate:getDateFormat(),pageIndex:1,paramInt1:1};

    DataSyncFty.listSynLogs($scope.query).then(modView);
    
    new pickerDateRange('calendar-income', {
        defaultText: ' / ',
        isSingleDay: false,
        stopToday: false,
        calendars: 2,
        startDate: getDateFormat(),
        endDate: getDateFormat(),
        success: function (obj) {
            $scope.query.pageIndex = 1;
            $scope.query.startTime = obj.startDate;
            $scope.query.endDate = obj.endDate;
            DataSyncFty.listSynLogs($scope.query).then(modView);
        }
    });
}]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('errorLogCtrl', ['$scope', '$http', 'SysLogFty', function ($scope, $http, SysLogFty) {
    ycui.loading.show();
    var pageSize = 10,
        modView = function (response) {
            if(!response) return;
            $scope.page_size = response.page_size;
            $scope.prev_page = response.prev_page;
            $scope.total_page = response.total_page;
            $scope.errorLogs = response.items;
            $scope.page = response.page;
            $scope.total_count = response.total_count;
            ycui.loading.hide();
        };

   $scope.query = {pageSize:pageSize,pageIndex:1};

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.descr = $scope.query.search;
        SysLogFty.errorLogList($scope.query).then(modView);
    };
    function getLastDate(currentDate, day) {
        var dd = new Date();
        dd.setDate(currentDate.getDate()+day);
        return dd.dateFormat();
    }
    var dateRange = new pickerDateRange('dateRangeError', {
        defaultText: ' / ',
        isSingleDay: false,
        stopToday: false,
        calendars: 2,
        startDate: getLastDate(new Date(), -6),
        endDate: getDateFormat(),
        inputTrigger: 'dateRange',
        success: function (obj) {
            $('#dateRange').val(obj.startDate);
            $scope.query.startTime = obj.startDate;
            $scope.query.endTime = obj.endDate;
            $scope.redirect(1);
        }
    });
    $scope.query.startTime = dateRange.mOpts.startDate;
    $scope.query.endTime = dateRange.mOpts.endDate;
    $scope.redirect(1);
}]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('operationLogCtrl', ['$scope', '$http', 'SysLogFty', function ($scope, $http, SysLogFty) {

    $scope.logTypeSel = {
        list:[
            {name:'新增',id:1},
            {name:'修改',id:2},
            {name:'删除',id:3},
            {name:'审批',id:4},
            {name:'禁用',id:5},
            {name:'登录',id:7},
            {name:'其他',id:6},
        ],
        callback:function(){
            $scope.redirect();
        }
    }

    ycui.loading.show();
    var pageSize = 10,
        modView = function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.operationLogs = response.items;
            $scope.total_page = response.total_page;
        };

    var startTime = new Date().calendar(1,-6).dateFormat();
    var endTime = new Date().dateFormat();

    $scope.query = {pageSize:pageSize,pageIndex:1,startTime:startTime,endTime:endTime};

    SysLogFty.operationLogList($scope.query).then(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search;
        SysLogFty.operationLogList($scope.query).then(modView);
    };
    
    $scope.typeShow = function(type){
        var types = ["无", "新增", "修改", "删除", "审核", "禁用", "其他", "登录"];
        return types[type];
    };
    
    function getLastDate(currentDate, day) {
        var dd = new Date();
        dd.setDate(currentDate.getDate()+day);
        return dd.dateFormat();
    }
    var dateRange = new pickerDateRange('dateRangeOperate', {
        defaultText: ' / ',
        isSingleDay: false,
        stopToday: false,
        calendars: 2,
        startDate: startTime,
        endDate: endTime,
        success: function (obj) {
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            $scope.query.startTime = obj.startDate;
            $scope.query.endTime = obj.endDate;
            SysLogFty.operationLogList($scope.query).then(modView);
        }
    });
}]);
/**
 * Created by moka on 16-8-31.
 */
app.controller('MarkManageCtrl',['$scope','SysMarkFty',function ($scope,SysMarkFty) {
    ycui.loading.show();
    $scope.query = {
        pageSize:10,
        pageIndex:1
    };
    var modView = function (response) {
        ycui.loading.hide();
        if (!response) return;
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;
    };

    SysMarkFty.adMarkList($scope.query).then(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search
        SysMarkFty.adMarkList($scope.query).then(modView);
    };

    $scope.delete = function (id) {
        ycui.confirm({
            title:'角标删除',
            content:'确定要删除此角标?',
            okclick:function () {
                SysMarkFty.deleteAdMark({id:id}).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:-1,
                            okclick:function () {
                                SysMarkFty.adMarkList($scope.query).then(modView);
                            }
                        })
                    }
                })
            }
        })
    }

    $scope.enable = function (id,state) {
        ycui.confirm({
            title:'角标启用/禁用',
            content:'确定要'+ (~state?'禁用':'启用') +'此角标?',
            okclick:function () {
                SysMarkFty.enableAdMark({id:id,state:~state}).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:-1,
                            okclick:function () {
                                SysMarkFty.adMarkList($scope.query).then(modView);
                            }
                        })
                    }
                })
            }
        })
    }
}])

app.controller('MarkAddCtrl',['$scope','UploadKeyFty','SysMarkFty',function ($scope,UploadKeyFty,SysMarkFty) {
    
    $scope.mark = {state:0,adMarkType:1};

    var upload = function (id) {
        var key = '';
        var config = {
            server: fileUrl + "/contract/uploadADMark.htm",
            pick: {
                id: '#'+id,
                multiple: false
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
                uploader.stop(file);
                UploadKeyFty.uploadKey().then(function (da) {
                    key = da.items;
                    uploader.upload(file);
                });
            },
            uploadBeforeSend:function (uploader, file, data) {
                data.uploadKey = key;
                data.fileSize = $scope.fileSize;
            },
            uploadSuccess:function (uploader, file, res) {
                if(res && res.code == 200){
                    $scope.imgList = [];
                    var wh = proportionPhoto(res.width,res.height,30,30);
                    var da = {
                        width:wh[0],
                        height:wh[1],
                        uploadFile:res.uploadFile
                    };
                    $scope.$apply(function () {
                        $scope.mark.adMarkUrl = res.uploadFile;
                        $scope.imgList.push(da);
                    });

                }else if(res && res.code == 500){
                    ycui.alert({
                        error:true,
                        content:res.msg,
                        timeout:10
                    })
                }
            }
        }
        return uploadInit(config);
    };

    upload('markUpload');
    
    $scope.postEdit = function () {
        $scope.validShow = true;
        var bo = true;
        if(!$scope.mark.adMarkUrl){
            bo = false;
        }
        if(!$(".form").valid()){
            bo = false;
        }
        if(!bo){return};
        ycui.loading.show();
        SysMarkFty.addAdMark($scope.mark).then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewADMark');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            adMarkName: "required"
        },
        messages: {
            adMarkName: "请输入角标名称"
        },
        errorClass: "error-span",
        errorElement: "span"
    })
    
}]);

app.controller('MarkCompileCtrl',['$scope','SysMarkFty','UploadKeyFty',function ($scope,SysMarkFty,UploadKeyFty) {
    var id = getSearch("id");
    $scope.mark = {};
    SysMarkFty.getAdMark({id:id}).then(function (res) {
        if(res){
            $scope.mark = res;
            $scope.imgList = [];
            var da = {
                width:24,
                height:14,
                uploadFile:res.adMarkUrl
            };
            $scope.imgList.push(da);
        }
    });

    var upload = function (id) {
        var key = '';
        var config = {
            server: fileUrl + "/contract/uploadADMark.htm",
            pick: {
                id: '#'+id,
                multiple: false
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
                uploader.stop(file);
                UploadKeyFty.uploadKey().then(function (da) {
                    key = da.items;
                    uploader.upload(file);
                });
            },
            uploadBeforeSend:function (uploader, file, data) {
                data.uploadKey = key;
                data.fileSize = $scope.fileSize;
            },
            uploadSuccess:function (uploader, file, res) {
                if(res && res.code == 200){
                    $scope.imgList = [];
                    var wh = proportionPhoto(res.width,res.height,30,30);
                    var da = {
                        width:wh[0],
                        height:wh[1],
                        uploadFile:res.uploadFile
                    };
                    $scope.$apply(function () {
                        $scope.mark.adMarkUrl = res.uploadFile;
                        $scope.imgList.push(da);
                    });
                }else if(res && res.code == 500){
                    ycui.alert({
                        error:true,
                        content:res.msg,
                        timeout:10
                    })
                }
            }
        };
        return uploadInit(config);
    };

    upload('markUpload');

    $scope.postEdit = function () {
        $scope.validShow = true;
        var bo = true;
        if(!$scope.mark.adMarkUrl){
            bo = false;
        }
        if(!$(".form").valid()){
            bo = false;
        }
        if(!bo){return};

        var body = {
            id:$scope.mark.id,
            adMarkName:$scope.mark.adMarkName,
            state:$scope.mark.state,
            adMarkUrlShow:$scope.mark.adMarkUrlShow,
            adMarkUrl:$scope.mark.adMarkUrl,
            adMarkType:$scope.mark.adMarkType
        };
        ycui.loading.show();
        SysMarkFty.updateAdMark(body).then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewADMark');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            adMarkName: "required"
        },
        messages: {
            adMarkName: "请输入角标名称"
        },
        errorClass: "error-span",
        errorElement: "span"
    })
}]);

app.filter('markPositionFtr',function () {
    return function (input) {
        switch (input) {
            case 1:
                return "左上角";
            case 2:
                return "左下角";
            case 3:
                return "右上角";
            case 4:
                return "右下角";
            default:
                return input;
        }
    };
});
/**
 * Created by moka on 16-9-12.
 */
app.controller('MonitorManageCtrl',['$scope','SysMonitorFty',function ($scope,SysMonitorFty) {
    ycui.loading.show();
    $scope.query = {
        pageSize:10,
        pageIndex:1
    };
    var modView = function (response) {
        ycui.loading.hide();
        if (!response) return;
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;
    };

    SysMonitorFty.monitorList($scope.query).then(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search
        SysMonitorFty.monitorList($scope.query).then(modView);
    };

    $scope.delete = function (id, name) {
        ycui.confirm({
            title:name,
            content:'是否删除此监控类型？',
            timeout:-1,
            okclick:function () {
                SysMonitorFty.monitorDel({id:id}).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:-1,
                            okclick:function () {
                                SysMonitorFty.monitorList($scope.query).then(modView);
                            }
                        })
                    }
                })
            }
        })
    }

    $scope.enable = function (id,state) {
        ycui.confirm({
            title:'监控类型开/关',
            content:'确定要'+ (state == -1?'开':'关') +'此监控类型?',
            okclick:function () {
                SysMonitorFty.monitorState({id:id,state:~state}).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:10,
                            okclick:function () {
                                SysMonitorFty.monitorList($scope.query).then(modView);
                            }
                        })
                    }
                })
            }
        })
    }

}]);

app.controller('MonitorInfoCtrl',['$scope','SysMonitorFty',function ($scope,SysMonitorFty) {
    console.info('system');
    $scope.monitorStateSel = {
        list:[
            {name:'正常',id:'1'},
            {name:'异常',id:'0'}
        ],
        callback:function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            SysMonitorFty.monitorDetailsList($scope.query).then(modView);
        }
    }

    ycui.loading.show();
    $scope.query = {
        pageSize:10,
        pageIndex:1
    };
    var modView = function (response) {
        ycui.loading.hide();
        if (!response) return;
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;
    };

    SysMonitorFty.monitorDetailsList($scope.query).then(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search
        SysMonitorFty.monitorDetailsList($scope.query).then(modView);
    };
}]);

app.controller('MonitorAddCtrl',['$scope','SysMonitorFty',function ($scope,SysMonitorFty) {
    
    $scope.monitor = {
        monitorSwitch:1,
        monitorCondition:1,
        monitorUrlType:1
    };

    $scope.postEdit = function () {
        $scope.validShow = true;

        if(!$(".form").valid()){
            return;
        }
        ycui.loading.show();
        SysMonitorFty.monitorAdd($scope.monitor).then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewMonitor');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            monitorName: "required",
            monitorUrl:{
                required:true
            },
            monitorMark: "required"
        },
        messages: {
            monitorName: "请输入监控名称",
            monitorUrl:{
                required:'请输入接口地址'
            },
            monitorMark:'请输入标示'
        },
        errorClass: "error-span",
        errorElement: "span"
    })
}])

app.controller('MonitorEditCtrl',['$scope','SysMonitorFty',function ($scope,SysMonitorFty) {
    var id = getSearch('id');
    SysMonitorFty.getMonitor({id:id}).then(function (res) {
        if(res && res.code == 200){
            $scope.monitor = res.items;
        }
    });

    $scope.postEdit = function () {
        $scope.validShow = true;

        if(!$(".form").valid()){
            return;
        }
        delete $scope.monitor.updateTime;
        ycui.loading.show();
        SysMonitorFty.monitorUpdate($scope.monitor).then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewMonitor');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            monitorName: "required",
            monitorUrl:{
                required:true
            }
        },
        messages: {
            monitorName: "请输入监控名称",
            monitorUrl:{
                required:'请输入接口地址'
            }
        },
        errorClass: "error-span",
        errorElement: "span"
    })
}]);

app.filter('monitorType',function () {
    return function (input) {
        switch (+input){
            case 1:
                return 'http请求正常';
            case 2:
                return '标示';
            case 3:
                return '值';
            case 4:
                return '其他';
            default:
                return
        }
    }
})
/**
 * Created by moka on 16-6-16.
 */
app.controller("roleAddCtrl", ['$scope', '$http', 'SysRuleUserFty','SysRoleFty',
    function ($scope, $http, SysRuleUserFty,SysRoleFty) {
        ycui.loading.show();
        SysRuleUserFty.levelsRights().then(function (res) {
            ycui.loading.hide();
            if(res){
                var array = changeRuleDate(res);
                $scope.getAreaids = ycui.createAreas(array, [], '#areasList', 1);
            }
        });

        $scope.role = {type:1};

        $scope.postEdit = function () {
            var roleClusterId = $scope.getAreaids();
            var bo = $(".form").valid();
            if (roleClusterId.length == 0) {
                ycui.alert({
                    content: "角色权限必须勾选"
                })
                return;
            }
            if(!bo)return;
            ycui.loading.show();
            var body = $scope.role;
            body.roleCluster = roleClusterId.join(",");
            SysRoleFty.addRole(body).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewRole');
                        },
                        timeout: 10
                    })
                }
            })
        };
        
        function changeRuleDate(arr) {
            var array = [];
            for(var key in arr){
                var ob = arr[key];
                var ar = [];
                ob.forEach(function (data) {
                    var a = [];
                    if(data.childRight instanceof Array){
                        data.childRight.forEach(function (da) {
                            a.push({
                                childId:da.id,
                                childName:da.rightName,
                                verify:da.verify
                            })
                        })
                    }
                    ar.push({
                        parentId:data.id,
                        parentName:data.rightName,
                        verify:data.verify,
                        childList:a
                    })
                });
                switch (key){
                    case 'AdOrder':
                        array.push({
                            areaName:"广告订单",
                            areaId:1,
                            parentList:ar
                        });
                        break;
                    case 'ResourceManage':
                        array.push({
                            areaName:"资源管理",
                            areaId:2,
                            parentList:ar
                        });
                        break;
                    case 'CustomerManage':
                        array.push({
                            areaName:"客户管理",
                            areaId:3,
                            parentList:ar
                        });
                        break;
                    case 'DataReport':
                        array.push({
                            areaName:"数据报表",
                            areaId:4,
                            parentList:ar
                        });
                        break;
                    case 'SystemSet':
                        array.push({
                            areaName:"系统设置",
                            areaId:5,
                            parentList:ar
                        });
                        break;
                }
            }
            return array;
        }

        

        $(".form").validate({
            rules: {
                myRole: "required"
            },
            messages: {
                myRole: "请输入角色名称"
            },
            errorClass: 'error-span',
            errorElement: 'span'
        })
    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller("roleCheckCtrl", ['$scope', '$http','SysRuleUserFty','SysRoleFty',
    function ($scope, $http,SysRuleUserFty,SysRoleFty) {
        setTimeout(function () {
            $("input").attr("disabled", "disabled");
        }, 200);
        
        $scope.role = {};
        var id = getSearch("id");
        ycui.loading.show();
        SysRoleFty.getRole({id:id}).then(function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.role = response;
            SysRuleUserFty.levelsRights().then(function (res) {
                if(res){
                    var array = changeRuleDate(res);
                    $scope.getAreaids = ycui.createAreas(array, $scope.role.roleCluster, '#areasList', 1);
                }
            });
        });
        
        $scope.backToRole = function () {
            location.replace("roleManage.html")
        };

        function changeRuleDate(arr) {
            var array = [];
            for (var key in arr) {
                var ob = arr[key];
                var ar = [];
                ob.forEach(function (data) {
                    var a = [];
                    if (data.childRight instanceof Array) {
                        data.childRight.forEach(function (da) {
                            a.push({
                                childId: da.id,
                                childName: da.rightName,
                                verify: da.verify
                            })
                        })
                    }
                    ar.push({
                        parentId: data.id,
                        parentName: data.rightName,
                        verify: data.verify,
                        childList: a
                    })
                });
                switch (key) {
                    case 'AdOrder':
                        array.push({
                            areaName: "广告订单",
                            areaId: 1,
                            parentList: ar
                        });
                        break;
                    case 'ResourceManage':
                        array.push({
                            areaName: "资源管理",
                            areaId: 2,
                            parentList: ar
                        });
                        break;
                    case 'CustomerManage':
                        array.push({
                            areaName: "客户管理",
                            areaId: 3,
                            parentList: ar
                        });
                        break;
                    case 'DataReport':
                        array.push({
                            areaName: "数据报表",
                            areaId: 4,
                            parentList: ar
                        });
                        break;
                    case 'SystemSet':
                        array.push({
                            areaName: "系统设置",
                            areaId: 5,
                            parentList: ar
                        });
                        break;
                }
            }
            return array;
        }
    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller("roleEditCtrl", ['$scope', '$http','SysRuleUserFty','SysRoleFty','$q',
    function ($scope, $http,SysRuleUserFty,SysRoleFty,$q) {
        var id = getSearch("id");
        ycui.loading.show();
        var getRole = SysRoleFty.getRole({id:id}).then(function (response) {
            if(!response) return;
            $scope.role = response;
        });
        $q.all([getRole]).then(function(){
            SysRuleUserFty.levelsRights().then(function (res) {
                ycui.loading.hide();
                if(res){
                    var array = changeRuleDate(res);
                    $scope.getAreaids = ycui.createAreas(array, $scope.role.roleCluster, '#areasList', 1);
                }
            });
        })

        $scope.postEdit = function () {
            var roleClusterId = $scope.getAreaids();
            var bo = $(".form").valid();
            if (roleClusterId.length == 0) {
                ycui.alert({
                    content: "角色权限必须勾选"
                })
                return;
            }
            if(!bo)return;
            ycui.loading.show();

            var body = {
                id:$scope.role.roleId,
                type:$scope.role.type,
                roleName:$scope.role.roleName,
                roleCluster:roleClusterId.join(",")
            }
            SysRoleFty.updateRole(body).then(function (res) {
                ycui.loading.hide();
                if(res && res.code == 200){
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewRole');
                        },
                        timeout: 10
                    });
                }
            })
        }
        $(".form").validate({
            rules: {
                myRole: "required"
            },
            messages: {
                myRole: "请输入角色名称"
            },
            errorClass: 'error-span',
            errorElement: 'span'
        })

        function changeRuleDate(arr) {
            var array = [];
            for (var key in arr) {
                var ob = arr[key];
                var ar = [];
                ob.forEach(function (data) {
                    var a = [];
                    if (data.childRight instanceof Array) {
                        data.childRight.forEach(function (da) {
                            a.push({
                                childId: da.id,
                                childName: da.rightName,
                                verify: da.verify
                            })
                        })
                    }
                    ar.push({
                        parentId: data.id,
                        parentName: data.rightName,
                        verify: data.verify,
                        childList: a
                    })
                });
                switch (key) {
                    case 'AdOrder':
                        array.push({
                            areaName: "广告订单",
                            areaId: 1,
                            parentList: ar
                        });
                        break;
                    case 'ResourceManage':
                        array.push({
                            areaName: "资源管理",
                            areaId: 2,
                            parentList: ar
                        });
                        break;
                    case 'CustomerManage':
                        array.push({
                            areaName: "客户管理",
                            areaId: 3,
                            parentList: ar
                        });
                        break;
                    case 'DataReport':
                        array.push({
                            areaName: "数据报表",
                            areaId: 4,
                            parentList: ar
                        });
                        break;
                    case 'SystemSet':
                        array.push({
                            areaName: "系统设置",
                            areaId: 5,
                            parentList: ar
                        });
                        break;
                }
            }
            return array;
        }

    }]);
/**
 * Created by moka on 16-6-16.
 */
app.controller('roleManageCtrl', ['$scope', '$http', 'SysRuleUserFty', 'SysRoleFty',
    function ($scope, $http, SysRuleUserFty,SysRoleFty) {
        ycui.loading.show();
        var pageSize = 10;
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

        $scope.companyTypeSel = {
            list:[
                {name:'总公司角色',id:1},
                {name:'分公司角色',id:2}
            ],
            callback:function () {
                SysRuleUserFty.listRole($scope.query).then(modView);
            }
        };

        $scope.disable = function (id, state,name) {
            var body = {id:id};
            if(state !== -1){
                ycui.confirm({
                    title:'【'+ name +'】禁用',
                    content:'请确认是否禁用该角色，禁用后将影响使用该角色的用户，请相应进行调整！',
                    okclick:function () {
                        body.state = -1;
                        SysRoleFty.enableRole(body).then(function (res) {
                            if(res && res.code == 200){
                                ycui.alert({
                                    content:res.msg,
                                    timeout:10
                                })
                                SysRuleUserFty.listRole($scope.query).then(modView);
                            }
                        })
                    }
                })
            }else{
                body.state = 0;
                SysRoleFty.enableRole(body).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:10
                        })
                        SysRuleUserFty.listRole($scope.query).then(modView);
                    }
                })
            }
        };

        $scope.query = {pageSize: pageSize,pageIndex:1};

        SysRuleUserFty.listRole($scope.query).then(modView);
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.param1 = $scope.query.search;
            SysRuleUserFty.listRole($scope.query).then(modView);
        };
}]);
/**
 * Created by moka on 16-6-16.
 */
app.controller("limitCtrl", ['$scope', 'SysRuleUserFty','SysLoginUserFty',
    function ($scope,SysRuleUserFty,SysLoginUserFty) {
        var loginUserInfo = SysLoginUserFty.loginUserInfo().then(function (res) {
            if (res && res.code == 200) {
                $scope.user = res;
                $scope.$broadcast('loginUserInfo');
            }
        });

        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 5}).then(function (res) {
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
            $scope.systemManageRule = _object;
        })
    }]);


/*_______________________________________*/

app.filter("typeApp", function () {
    return function (input) {
        if (input == 1) {
            return "Web"
        } else if (input == 2) {
            return "Wap"
        } else {
            return "APP"
        }
    }
})
app.filter("isNull", function () {
    return function (input) {
        if (input) {
            return input
        } else {
            return "请选择"
        }
    }
})

app.filter("companyTypeFtr", function () {
    return function (input) {
        switch (input) {
            case 1:
                return "总公司";
            case 2:
                return "分公司";
            default:
                return "--";
        }
    }
});


/**
 * Created by moka on 16-8-31.
 */
app.controller('SpecialManageCtrl',['$scope','SysSpecialFty',function ($scope,SysSpecialFty) {
    ycui.loading.show();
    $scope.query = {
        pageSize:10,
        pageIndex:1
    };
    var modView = function (response) {
        ycui.loading.hide();
        if (!response) return;
        $scope.page = {
            page:response.page,
            total_page:response.total_page
        }
        $scope.items = response.items;
        $scope.total_page = response.total_page;
    };

    SysSpecialFty.specialList($scope.query).then(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.param1 = $scope.query.search
        SysSpecialFty.specialList($scope.query).then(modView);
    };
    
    $scope.delete = function (id) {
        ycui.confirm({
            content:'是否删除此特效',
            okclick:function () {
                SysSpecialFty.specialDelete({id:id}).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content:res.msg,
                            timeout:10,
                            okclick:function () {
                                SysSpecialFty.specialList($scope.query).then(modView);
                            }
                        })
                    }
                })
            }
        })
    }
    
}]);

app.controller('SpecialAddCtrl',['$scope','SysSpecialFty',function ($scope,SysSpecialFty) {
    
    $scope.special = {};
    
    $scope.postEdit = function () {
        $scope.validShow = true;

        if(!$(".form").valid){
            return;
        }
        ycui.loading.show();
        SysSpecialFty.specialAdd($scope.special).then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewSpecialEffects');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            specialEffectsName: "required",
            specialEffectsUrl:{
                url:true,
                required:true
            }
        },
        messages: {
            specialEffectsName: "请输入特效名称",
            specialEffectsUrl: {
                required: "请输入特效打开地址",
                url: "请输入有效的url"
            }
        },
        errorClass: "error-span",
        errorElement: "span"
    })
    
}]);

app.controller('SpecialCompileCtrl',['$scope','SysSpecialFty',function ($scope,SysSpecialFty) {
    var id = getSearch("id");
    $scope.special = {};
    SysSpecialFty.getSpecial({id:id}).then(function (res) {
        if(res && res.code == 200){
            $scope.special = res.items;
        }
    });

    $scope.postEdit = function () {
        $scope.validShow = true;
        
        if(!$(".form").valid){
            return;
        }

        var body = {
            id:$scope.special.id,
            specialEffectsName:$scope.special.specialEffectsName,
            specialEffectsUrl:$scope.special.specialEffectsUrl,
            remark:$scope.special.remark
        }
        ycui.loading.show();
        SysSpecialFty.specialUpdate(body).then(function (res) {
            ycui.loading.hide();
            if(res && res.code == 200){
                ycui.alert({
                    content:res.msg,
                    okclick:function () {
                        goRoute('ViewSpecialEffects');
                    },
                    timeout:10
                })
            }
        })
    };

    $(".form").validate({
        rules: {
            specialEffectsName: "required",
            specialEffectsUrl:{
                url:true,
                required:true
            }
        },
        messages: {
            specialEffectsName: "请输入特效名称",
            specialEffectsUrl: {
                required: "请输入特效打开地址",
                url: "请输入有效的url"
            }
        },
        errorClass: "error-span",
        errorElement: "span"
    })
}]);
/**
 * Created by moka on 16-6-16.
 */
app.controller("userAddCtrl", ['$scope', '$http', 'SysUserFty','$q',
    function ($scope, $http, SysUserFty,$q) {
        $scope.userListSel = {};

        $scope.departmentListSel = {
            getName:function(obj,name){
                if(!name){
                    name = obj.departmentName
                }
                var _obj = obj.$$parent;
                if(_obj){
                    name = _obj.departmentName + '-' + name;
                    return this.getName(_obj,name);
                }
                return name;
            },
            callback:function(e,d){
                if(d){
                    $scope.userMode.agencyNames = this.getName(d);
                }
            }
        }
        $scope.companyListSel = {
            callback:function(e,d){
                $scope.departmentListSel.$destroy();
                $scope.userListSel.$destroy()
                var numId = d.id;
                ycui.loading.show();
                var roleListByCom = SysUserFty.roleListByCom({id:numId}).then(function (res) {
                    if(res && res.code == 200){
                        $scope.roleList = res.roleList;
                    }
                });
                var depAndUserList = SysUserFty.depAndUserList({companyId: numId}).then(function (response) {
                    $scope.departmentList = angular.copy(response.departmentList);
                    $scope.departmentListSel.list = response.departmentList;
                    $scope.userListSel.list = response.userList;
                })
                $q.all([roleListByCom,depAndUserList]).then(function(){
                    ycui.loading.hide();
                })
                delete $scope.userMode.agencyNumber;
                delete $scope.userMode.agencyNames;
                delete $scope.userMode.leaderId;
            }
        };
        var paramList = SysUserFty.paramList().then(function (response) {
            if (response && response.code == 200) {
                $scope.companyListSel.list = response.companyList;
            }
        });

        $scope.userMode = {roleIds:[]};
        $scope.userMode.state = 0;

        $scope.postEdit = function () {

            var body = angular.copy($scope.userMode);
            $scope.roleList && $scope.roleList.forEach(function (data) {
                if(data.check){
                    body.roleIds.push(data.id);
                }
            });

            if (body.logPwd != body.logPwd2) {
                ycui.alert({
                    content: "两次输入的密码不一样，请重新填写"
                });
                return
            }
            if (body.roleIds.length == 0) {
                $scope.roleIdBo = true;
                $scope.$watch('userMode.roleIds.length', function (newValue) {
                    if (newValue > 0) {
                        $scope.roleIdBo = false;
                    }
                });
                return
            }

            if (!body.companyId) {
                $scope.validShow = true;
                return
            }
            if (!body.agencyNumber) {
                $scope.validShow = true;
                return
            }

            if (!$(".form").valid()) {
                return
            }
            delete body.logPwd2;
            body.logPwd = md5(body.logPwd);
            ycui.loading.show();
            SysUserFty.userAdd(body).then(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewUser')
                        },
                        timeout: 10
                    });
                }
            });
        };
        $(".form").validate({
            rules: {
                loginName: "required",
                passWord: {
                    required: true
                },
                isPassWord: {
                    required: true
                },
                userName: "required",
                myPhone: {
                    phone: true
                },
                telephone:{
                    phone: true
                },
                myEmail: {
                    email: true
                }
            },
            messages: {
                loginName: '请输入用户名',
                passWord: {
                    required: '请输入6位及以上字符，区分大小写'
                },
                isPassWord: {
                    required: '请再次输入密码'
                },
                userName: '请输入姓名',
                myPhone: {

                },
                telephone:{

                }
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });

    }]);

/**
 * Created by moka on 16-6-16.
 */
app.controller("userEditCtrl", ['$scope', '$http', 'SysUserFty','$q',
    function ($scope, $http, SysUserFty,$q) {
        $scope.userListSel = {};

        $scope.departmentListSel = {
            getName:function(obj,name){
                if(!name){
                    name = obj.departmentName
                }
                var _obj = obj.$$parent;
                if(_obj){
                    name = _obj.departmentName + '-' + name;
                    return this.getName(_obj,name);
                }
                return name;
            },
            callback:function(e,d){
                if(d){
                    $scope.userMode.agencyNames = this.getName(d);
                }
            }
        }
        $scope.companyListSel = {
            disabled:true
        };

        var id = getSearch("id");

        $scope.userMode = {};
        $scope.user = {};

        ycui.loading.show();
        var getEditUserInfo = SysUserFty.getEditUserInfo({id:id}).then(function (response) {
            ycui.loading.hide();
            $scope.userMode = response;
            $scope.user.logName = response.logName;
            $scope.user.id = response.id;
        });

        $q.all([getEditUserInfo]).then(function () {
            var roleListByCom = SysUserFty.roleListByCom({id:$scope.userMode.companyId}).then(function (res) {
                if(res && res.code == 200){
                    res.roleList.forEach(function (data) {
                        $scope.userMode.roleList.map(function (da) {
                            if(da && data && da.id == data.id){
                                data.check = true;
                            }
                            return da
                        });
                    });
                    $scope.roleList = res.roleList;
                }
            });

            var depAndUserList = SysUserFty.depAndUserList({companyId: $scope.userMode.companyId}).then(function (response) {
                $scope.departmentListSel.list = response.departmentList;
                $scope.userListSel.list = response.userList;
            })
        });

        $scope.initialize = function () {
            ycui.confirm({
                title:'密码初始化',
                content:'请确认是否初始化密码，初始化后当前密码将会失效',
                timeout:-1,
                okclick:function () {
                    SysUserFty.initPwd({id:$scope.userMode.id,logName:$scope.userMode.logName}).then(function (res) {
                        if(res && res.code == 200){
                            ycui.alert({
                                content:res.msg + '<br> 提示:密码为用户名+当前年份!',
                                timeout:10
                            })
                        }
                    })
                }
            })
        };


        $scope.postEdit = function () {

            var body = angular.copy($scope.userMode);
            body.roleIds = [];
            $scope.roleList && $scope.roleList.forEach(function (data) {
                if(data.check){
                    body.roleIds.push(data.id);
                }
            });

            if (body.roleIds.length == 0) {
                $scope.roleIdBo = true;
                $scope.$watch('userMode.roleIds.length', function (newValue) {
                    if (newValue > 0) {
                        $scope.roleIdBo = false;
                    }
                });
                return
            }

            if (!body.companyId) {
                $scope.validShow = true;
                return
            }
            if (!body.agencyNumber) {
                $scope.validShow = true;
                return
            }

            if (!$(".form").valid()) {
                return
            }

            var query = {
                id:body.id,
                logName:body.logName,
                trueName:body.trueName,
                email:body.email,
                companyId:body.companyId,
                agencyNumber:body.agencyNumber,
                phone:body.phone,
                telephone:body.telephone,
                remark:body.remark,
                roleIds:body.roleIds,
                state:body.state,
                leaderId:body.leaderId,
                agencyNames:body.agencyNames
            };
            ycui.loading.show();
            SysUserFty.userEdit(query).then(function (response) {
                ycui.loading.hide();
                if (response && response.code == 200) {
                    ycui.alert({
                        content: response.msg,
                        okclick: function () {
                            goRoute('ViewUser')
                        },
                        timeout: 10
                    });
                }
            })
        };

        $(".form").validate({
            rules: {
                loginName: "required",
                passWord: {
                    required: true
                },
                userName: "required",
                myPhone: {
                    phone: true
                },
                telephone:{
                    phone: true
                },
                myEmail: {
                    email: true
                }
            },
            messages: {
                loginName: '请输入名字',
                passWord: {
                    required: '请输入所属公司'
                },
                userName: '请输入名字'
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });

        $scope.highBox = function () {
            $scope.user.oldPassword = '';
            $scope.user.newPassword = '';
            $scope.user.okPassword = '';
            $scope.validation = function(){
                $scope.user.oldPassword && SysUserFty.validPwd({id:$scope.user.id,logPwd:md5($scope.user.oldPassword)}).then(function(res){
                    if(res && res.code == 200){
                        $scope.validaMsgBo = false;
                    }else{
                        $scope.validaMsgBo = true;
                        $scope.validaMsgStr = res.msg;
                    }
                })
            };

            $scope.$watch('user.newPassword+user.okPassword',function () {
                if($scope.user.newPassword == $scope.user.okPassword){
                    $scope.validaMsgStr = '';
                    $scope.validaMsgBo = false;
                }
            });

            $scope.userEditPsdModule = {
                title:'修改密码',
                okClick:function(){
                    if(!$scope.validaMsgBo){
                        if (
                            $scope.user &&
                            ($scope.user.newPassword.length >= 6 &&
                            $scope.user.okPassword.length >= 6) &&
                            ($scope.user.newPassword == $scope.user.okPassword)) {
                            var body = {
                                id: $scope.user.id,
                                logPwd: md5($scope.user.oldPassword),
                                newLogPwd: md5($scope.user.newPassword)
                            }
                            ycui.loading.show();
                            SysUserFty.updatePwd(body).then(function(res){
                                ycui.loading.hide();
                                if(res && res.code == 200){
                                    $scope.validaMsgStr = '';
                                    $scope.validaMsgBo = false;
                                    setTimeout(function () {
                                        ycui.alert({
                                            content:res.msg,
                                            timeout:10
                                        })
                                    }, 500)
                                }
                            })
                        }else{
                            if($scope.user.newPassword != $scope.user.okPassword){
                                $scope.validaMsgStr = '两次密码输入不一致！';
                            }else{
                                $scope.validaMsgStr = '密码至少6字符';
                            }
                            $scope.validaMsgBo = true;
                            return true;
                        }
                    }else{
                        return true;
                    }
                },
                noClick:function(){
                    $scope.validaMsgBo = false;
                    $scope.validaMsgStr = '';
                }
            }
        }

    }]);

/**
 * Created by moka on 16-6-16.
 */
app.controller('userManageCtrl', ['$scope', '$http', 'SysUserFty', '$q',
    function ($scope, $http, SysUserFty, $q) {
        var pageSize = 10;
        $scope.userStateSel = {
            list:[
                {name:'启用',id:'0'},
                {name:'禁用',id:'-1'},
            ]
        }
        $scope.departmentListSel = {};
        $scope.companyListSel = {
            callback:function(e,d){
                $scope.departmentListSel.$destroy();
                if(d){
                    SysUserFty.depAndUserList({ companyId: d.id }).then(function (response) {
                        $scope.departmentListSel.list = response.departmentList;
                    });
                }
            },
            sessionBack:function(d){
                if(d){
                    var key = this.key.split(',')[0];
                    SysUserFty.depAndUserList({ companyId: d[key] }).then(function (response) {
                        $scope.departmentListSel.list = response.departmentList;
                    });
                }
            }
        };
        $scope.roleListSel = {};
        var paramListForSearch = SysUserFty.paramListForSearch().then(function (response) {
            if (response && response.code == 200) {
                $scope.companyListSel.list = response.companyList;
                $scope.roleListSel.list = response.roleList;
            }
        })

        $scope.query = {pageSize: pageSize,pageIndex:1};

        $scope.$on('sys-user',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            SysUserFty.userList($scope.query).then(modView);
        })

        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            if (!response) return;
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        };

        $scope.getRoleName = function(roleList){
            var str = '';
            if(roleList){
                roleList.forEach(function(ro,index){
                    str += ro.roleName + (index == (roleList.length - 1)?'':'、')
                })
            }
            return str;
        }

        SysUserFty.userList( $scope.query ).then(modView);

        // $scope.ruleId = getSearch("ruleId");

        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.logNameOrTrueName = $scope.query.search;
            SysUserFty.userList($scope.query).then(modView);
        };

        //启用/禁用
        $scope.reStartAddDel = function (id, state,name) {
            var reStartAddDel;

            ycui.confirm({
                title: '【'+ name +'】' + (state == '-1'?'启用':'禁用'),
                content: '确认' + (state == '-1'?'启用':'禁用') + '此用户?',
                okclick: function () {
                    if (state == -1) {
                        reStartAddDel = SysUserFty.reStart({ id: id })
                    } else {
                        reStartAddDel = SysUserFty.delete({ id: id })
                    }
                    reStartAddDel.then(function(res){
                        if(res && res.code){
                            ycui.alert({
                                content:res.msg,
                                timeout:10
                            })
                            SysUserFty.userList($scope.query).then(modView);
                        }
                    })
                }
            })

        }
    }]);