/**
 * Created by moka on 16-6-17.
 */
app.controller("channelManageCtrl", ['$scope', '$http', 'ResChannelFty', 'ResMediaFty','$q','ResChannelLevelFty','SysCompanyFty','SysDepartmentFty',
    function ($scope, $http, ResChannelFty, ResMediaFty,$q,ResChannelLevelFty,SysCompanyFty,SysDepartmentFty) {

        $scope.departmentListSel = {
            callback:function(e,d){
                if(d){
                    $scope.query.depScope = d.agencyNumber;
                }else{
                    $scope.query.depScope = $scope.companyListSel.$placeholder.agencyNumber;//从暂存数据取出
                }
                ycui.loading.show();
                $scope.query.pageIndex = 1;
                ResChannelFty.channelPageList($scope.query).then(modView)
            }
        };
        $scope.companyListSel = {
            callback:function(e,d){
                $scope.departmentListSel.$destroy();
                if(d && d.id == 3){
                    SysDepartmentFty.parentDeps({ companyId: d.id }).then(function (res) {
                        if(res && res.code == 200){
                            $scope.departmentListSel.list = res.departmentList;
                        }
                    });
                }
            },
            sessionBack:function(d){
                if(d && d.id == 3){
                    SysDepartmentFty.parentDeps({ companyId: d.id }).then(function (res) {
                        if(res && res.code == 200){
                            $scope.departmentListSel.list = res.departmentList;
                        }
                    });
                }
            }
        };

        SysCompanyFty.companyList().then(function(res){
            if(res instanceof Array){
                $scope.companyListSel.list = res;
            }
        })

        $scope.mediaListSel = {};
        
        $scope.levelNameSel = {}
        $scope.levelNameSel2 = {}
        ResChannelLevelFty.channelLevelList().then(function(res){
            $scope.levelNameSel.list = res.levels;
            $scope.levelNameSel2.list = angular.copy(res.levels);
        })

        $scope.hasImageSel = {
            list:[
                {name:'已上传',id:1},
                {name:'未上传',id:0}
            ]
        };
        var listForOrder = ResChannelFty.mediaListForSea().then(function (res) {
            if (res && res.code == 200) {
                $scope.mediaListSel.list = res.mediaList
            }
        });
        var pageSize = 10;
        $scope.query = {pageIndex:1,pageSize:pageSize};

        $scope.$on('res-channe-list',function(){
            ycui.loading.show();
            $scope.query.pageIndex = 1;
            ResChannelFty.channelPageList($scope.query).then(modView)
        })

        ycui.loading.show();
        var modView = function (response) {
            ycui.loading.hide();
            $scope.page = {
                page:response.page,
                total_page:response.total_page
            }
            $scope.items = response.items;
            $scope.total_page = response.total_page;
        }
        ResChannelFty.channelPageList($scope.query).then(modView)

        var postApi = "/channel/batchUpdateLevel.htm";
       
        $scope.redirect = function (num, con) {
            ycui.loading.show();
            $scope.query.pageIndex = num || 1;
            $scope.query.channelNameOrId = $scope.query.search;
            ResChannelFty.channelPageList($scope.query).then(modView)
        };

        $scope.channeCheckAll = function(e){
            if(!$scope.items){
                return;
            }
            var bo = e.target.checked;
            for(var i = 0;i<$scope.items.length;i++){
                var data = $scope.items[i];
                data.$check = bo;
            }
        }

        $scope.setMoreLevel = function () {
            var arrId = [];
            for (var i = 0; i < $scope.items.length; i++) {
                var data = $scope.items[i];
                if (data.$check) {
                    arrId.push({
                        id:data.id
                    })
                }
            }
            if (arrId.length == 0) {
                ycui.alert({
                    error:true,
                    content: "请至少选择一个",
                    timeout: 10
                });
            } else {
                $scope.setMoreLevelModule = {
                    level:1,
                    title:'批量设置频道级别',
                    okClick:function () {
                        $http.post(baseUrl + postApi, {
                            channels: arrId,
                            level: $scope._setMoreLevelModule.level
                        }).then(function (response) {
                            if (response.code == 200) {
                                ycui.alert({
                                    content: response.msg,
                                    okclick: function () {
                                        ResChannelFty.channelPageList($scope.query).then(modView)
                                    },
                                    timeout: 10
                                });
                            }
                        })
                    },
                    noClick:function () {}
                }
            }
        }
    }]);