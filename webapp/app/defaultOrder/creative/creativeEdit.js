/**
 * Created by moka on 16-6-21.
 */
app.controller("trueCreatelistEditCtrl", ['$scope', '$http', '$q','DefaultOrdersFty', "UploadKeyFty",
    function ($scope, $http, $q, DefaultOrdersFty,UploadKeyFty) {

        $scope.creative = {};

        var id = getSearch("id");
        var orderEdit = DefaultOrdersFty.defaultAdCreativeDetail({id:id}).then(function (res) {
            if(res && res.code == 200){
                $scope.creative = res.adCreative;

                var box = document.querySelector('.yc-indent-article');
                
                var size = res.adCreative.size.split("*");
                var html = photoAndSwfPreview({
                    src: res.adCreative.fileHttpUrl,
                    width: 266,
                    height: 180,
                    size: size,
                    style: false
                });
                box.innerHTML = html;
            }
        });

        $q.all([orderEdit]).then(function () {
            $scope.creative.uploadId = 'ad' + Math.uuid();
            setTimeout(function() {
                upload($scope.creative);    
            }, 20);
        });

        //点击禁用弹窗
        $scope.stateChange = function () {
            if ($scope.creative.priority == 99 && $scope.creative.state == -1) {
                ycui.confirm({
                    content: "创意禁用后不可投放！若再重新启用，须重新进入审批流程。请确认是否禁用该创意？",
                    noclick: function () {
                        $scope.$apply(function () {
                            $scope.creative.state = 0;
                        })
                    }
                });
            }
        };

        $scope.postEdit = function () {
            ycui.loading.show();
            DefaultOrdersFty.defaultAdCreativeUpdate($scope.creative).then(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewDefaultOrderCreate')
                        }
                    });
                }
            })
        };

        var upload = function(data){
            var key = "";
            var size = data.size.split('*');
            var id = '#' + data.uploadId;
            var config = {
                server: fileUrl + '/defaultOrderAdCreative/upload.htm',
                pick: {
                    id: id,
                    multiple: false
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
                    data.width = size[0];
                    data.height = size[1];
                },
                uploadSuccess:function(uploader,file, res){
                    if (res._raw == 'false') {
                        ycui.alert({
                            content: "不正确的操作",
                            timeout: -1
                        });
                        uploader.reset();
                        return
                    }
                    if (res.code == 500) {
                        ycui.alert({
                            content: res.msg,
                            timeout: -1
                        });
                        uploader.reset();
                        return
                    }
                    data.fileHttpUrl = res.adCreative.fileHttpUrl;
                    data.fileMD5 = res.adCreative.fileMD5;
                    data.fileSize = res.adCreative.fileSize;
                    data.fileType = res.adCreative.fileType;

                    var html = photoAndSwfPreview({
                        src: res.adCreative.fileHttpUrl,
                        width: 266,
                        height: 180,
                        size: size,
                        style: false
                    })

                    var box = document.querySelector('.yc-indent-article');
                    box.innerHTML = html;
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                error:function(uploader,error){
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: 10
                    });
                    ycui.loading.hide();
                    uploader.reset();
                }
            }
            uploadInit(config);
        }



        // function uploadInit(data) {
        //     var size = data.size.split('*');
        //     var id = '#' + data.uploadId;
        //     var cof = {
        //             swf: baseUrl + "/static/lib/Uploader.swf",
        //             auto: false,
        //             server: fileUrl + '/defaultOrderAdCreative/upload.htm',
        //             pick: {
        //                 id: id,
        //                 multiple: false
        //             },
        //             accept: {
        //                 extensions: 'swf,gif,jpg,jpeg,bmp,png',
        //                 mimeTypes: 'image/*,application/x-shockwave-flash'
        //             }
        //         },
        //         uploader = WebUploader.create(cof);
        //     var key = "";
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
        //         data.width = size[0];
        //         data.height = size[1];
        //     })
        //     uploader.on('uploadSuccess', function (file, res) {
        //         if (res._raw == 'false') {
        //             ycui.alert({
        //                 content: "不正确的操作",
        //                 timeout: -1
        //             });
        //             uploader.reset();
        //             return
        //         }
        //         if (res.code == 500) {
        //             ycui.alert({
        //                 content: res.msg,
        //                 timeout: -1
        //             });
        //             uploader.reset();
        //             return
        //         }
        //         data.fileHttpUrl = res.adCreative.fileHttpUrl;
        //         data.fileMD5 = res.adCreative.fileMD5;
        //         data.fileSize = res.adCreative.fileSize;
        //         data.fileType = res.adCreative.fileType;
        //         var show = $(id).prev(".yc-indent1-article");
                
        //         show.attr("data-fileHttpUrl", res.adCreative.fileHttpUrl)
        //             .attr("data-fileMD5", res.adCreative.fileMD5)
        //             .attr("data-fileSize", res.adCreative.fileSize)
        //             .attr("data-fileType", res.adCreative.fileType)
        //             .attr("data-size", size.join('*'));
                
        //         var html = photoAndSwfPreview({
        //             src: res.adCreative.fileHttpUrl,
        //             width: 308,
        //             height: 250,
        //             size: size,
        //             style: false
        //         });
        //         show.html("");
        //         show.append(html)
        //     });
        //     uploader.on('uploadError', function (file, res) {
        //         ycui.alert({
        //             content: res
        //         });
        //         uploader.reset();
        //     });
        //     uploader.on('error', function () {
        //         ycui.alert({
        //             content: "错误的文件类型",
        //             timeout: -1
        //         });
        //         uploader.reset();
        //     });
        //     uploader.on("uploadComplete", function () {
        //         ycui.loading.hide();
        //     })
        // }

        //表单验证
        $(".form").validate({
            rules: {
                adCreativeName: "required",
            },
            messages: {
                adCreativeName: '必须填入创意名称',
            },
            errorClass: 'error-span',
            errorElement: 'span'
        });
    }]);