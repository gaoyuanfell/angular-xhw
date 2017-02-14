/**
 * Created by moka on 16-9-2.
 */
app.controller('ContentListCtrl', ['$scope', 'ContentFty', 'AdCreativeFty', '$q', function ($scope, ContentFty, AdCreativeFty, $q) {
    
    $scope.channelListSel = {};
    $scope.mediaListSel = {
        callback:function(e,d){
            $scope.channelListSel.$destroy();
            if(d){
                ContentFty.getChannelsByMedia({mediaId:d.id}).then(function(res){
                    $scope.channelListSel.list = res.channels;
                })
            }
        },
        sessionBack:function(d){
            if(d){
                ContentFty.getChannelsByMedia({mediaId:d.id}).then(function(res){
                    $scope.channelListSel.list = res.channels;
                })
            }
        }
    };

    ContentFty.mediaList().then(function(res){
        if(res && res.code == 200){
            $scope.mediaListSel.list = res.mediaList;
        }
    })

    $scope.orderNameSel = {};
    $scope.stateSel = {
        list:[
            {name:'审核中',id:0},
            {name:'审核通过',id:1},
            {name:'审核不通过',id:-1},
        ]
    };

    //订单
    var orderNamesForList = AdCreativeFty.orderNamesForList().then(function (response) {
        if (response && response.code == 200) {
            $scope.orderNameSel.list = response.orderNames;
        }
    });

    
    ycui.loading.show();
    $scope.query = {
        pageSize: 10,
        pageIndex: 1
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

        response.items && response.items.forEach(function (data) {
            if (data.creativeList && data.creativeList.length > 0) {
                data.orderName = data.creativeList[0].orderName
            }
        })
        $scope.items = response.items;
    }

    ContentFty.contentList($scope.query).then(modView);

    $scope.redirect = function (num, con) {
        ycui.loading.show();
        $scope.query.pageIndex = num || 1;
        $scope.query.searchName = $scope.query.search;
        ContentFty.contentList($scope.query).then(modView);
    };

    $scope.$on('contentListGroup',function(){
        ycui.loading.show();
        $scope.query.pageIndex = 1;
        ContentFty.contentList($scope.query).then(modView);
    })
    

    $scope.contentCheck = function (id, name) {
        var body = $scope._contentCheckModule = {id:id,checkState:1}
        var reg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
        $scope.contentCheckModule = {
            title:'【' + name + '】' + '审核',
            okClick:function(){
                $scope._contentCheckModule.$valid = true;
                var testValue = $scope.contentCheckModule.testValue = reg.test(body.publishAddr);
                if(body.checkState == 1 && !testValue){
                    return true;
                }
                if(body.checkState == -1 && !body.checkRemark){
                    return true;
                }
                ContentFty.editCheck(body).then(function (res) {
                    if(res && res.code == 200){
                        ycui.alert({
                            content: res.msg,
                            timeout: 10,
                            okclick: function () {
                                ContentFty.contentList($scope.query).then(modView);
                            }
                        })
                    }
                })
            },
            noClick:function(){

            }
        }

    }

    $scope.showInfo = function (item) {
        if (item && item.creativeList && item.creativeList.length > 0) {
            var html = '';
            //ID、广告位名称、频道、媒体
            html += '<table class="yc-table"><thead><tr><th>ID</th><th>广告位名称</th><th>频道</th><th>媒体</th></tr></thead><%body%></table>'
            var body = '';
            item.creativeList.forEach(function (data) {
                body += '<tr><td>' + data.adSpaceId + '</td><td>' + data.adSpaceName + '</td><td>' + data.channelName + '</td><td>' + data.mediaName + '</td></tr>';
            })
            ycui.alert({
                title: '【' + item.contentName + '】',
                content: html.replace('<%body%>', body),
                timeout: -1
            })
        }
    }

    $scope.delete = function (id, name) {
        ycui.confirm({
            title: '【' + name + '】内容删除',
            content: '确定要删除此内容?',
            okclick: function () {
                ContentFty.contentDelete({ id: id }).then(function (res) {
                    if (res && res.code == 200) {
                        ycui.alert({
                            content: res.msg,
                            timeout: -1,
                            okclick: function () {
                                ContentFty.contentList($scope.query).then(modView);
                            }
                        })
                    }
                })
            }
        })
    }

}])