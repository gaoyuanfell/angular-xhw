/**
 * Created by moka on 16-6-21.
 */
app.controller("trueAdvertisementAddCtrl", ['$scope', '$http','ResMediaFty','DefaultOrdersFty','UploadKeyFty','SysUserFty',
    function ($scope, $http,ResMediaFty,DefaultOrdersFty,UploadKeyFty,SysUserFty) {
        $scope.state = 0;
        $scope.priority = 0;
        $scope.landingPage = "http://";
        $scope.timeArr = [];

        //公告信息
        $scope.affche = {
            state:0,
            isPublic: 1,
            isEmail: 1,
            important: 0,
            publishRange:0
        };

        $scope.$on('loginUserInfo',function (event,data) {
            SysUserFty.userInfo({id: data.id}).then(function (res) {
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

        upload('affcheAddUpload');


        //获取媒体名称
        ResMediaFty.listForDefautOrder().then(function (response) {
            $scope.media = response.mediaList;
        });

        function initPickerDate(data){
            !function(da){
                new pickerDateRange(da.id, {
                    defaultText: ' / ',
                    isSingleDay: false,
                    stopToday: false,
                    stopTodayBefore: true,
                    calendars: 2,
                    shortbtn: 0,
                    success: function (data) {
                        da.startTime = data.startDate;
                        da.endTime = data.endDate;
                    }
                });
            }(data)
        }

        $scope.timeArr = [{id: "calend1"}];

        $scope.$on('timeArrList',function(){
            var length = $scope.timeArr.length;
            initPickerDate($scope.timeArr[length-1])
        })

        $scope.addDiv = function () {
            var id = 't' + Math.uuid();
            $scope.timeArr.push({id: id});
        }

        $scope.removeDiv = function (ev, index) {
            $scope.timeArr.splice(index, 1);
        }

        var mediaName = [];
        $scope.mediaNamePush = function(e,id){
            if(id != undefined){
                var checked = e.target.checked;
                if(checked){
                    mediaName.push(id);
                }else{
                    for(var i = 0;i<mediaName.length;i++){
                        var s = mediaName[i];
                        if(s == id){
                            mediaName.splice(i,1);
                            break;
                        }
                    }
                }
            }else{
                return mediaName.length;
            }
        }

        $scope.postEdit = function () {
            $scope.validate = true;
            var bo = false;
            $scope.mediaIds = mediaName.join(",")
            if($scope.priority != 99){
                $scope.timeArr = [{id: "calend1"}];
            }
            var timeArr = [];
            for (var i = 0; i < $scope.timeArr.length; i++) {
                var da = $scope.timeArr[i];
                if (da.startTime && da.endTime) {
                    timeArr.push({
                        startTime: da.startTime,
                        endTime: da.endTime
                    })
                }
            }
            if (!$(".form").valid()) {bo = true;}
            if(!$scope.mediaIds){bo = true;}
            if(bo){return};

            var body = {
                orderShowDates: timeArr,
                orderName: $scope.orderName,
                state: $scope.state,
                priority: $scope.priority,
                landingPage: $scope.landingPage,
                mediaIds: $scope.mediaIds
            }

            if($scope.priority == 99){
               body.notice = $scope.affche; 
            }

            ycui.loading.show();
            DefaultOrdersFty.defaultOrdersAdd(body).then(function(res){
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            if ($scope.state == '0') {
                                goRoute('ViewDefaultOrderCreateAdd',{
                                    orderId:res.orderId,
                                    orderName:res.orderName
                                })
                            } else {
                                goRoute('ViewDefaultOrder')
                            }
                        },
                        timeout: 10
                    });
                }
            })

        }
        //表单验证
        $(".form").validate({
            rules: {
                orderName: "required",
                myUrl: {
                    required: true,
                    url: true
                },
                myTitle: "required",
                myContent: "required"
            },
            messages: {
                orderName: '必须填入订单名称',
                myUrl: {
                    required: '必须填入落地页地址'
                },
                myTitle: "请输入公告名称",
                myContent: "请输入公告内容"
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);