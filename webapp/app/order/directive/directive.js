/**
 * Created by moka on 16-6-21.
 */
app.directive("originalityBox", [
    function () {
        var html = "<div ng-init='updateCreative = !data.orderId' class='yc-compile-section clear' ng-if='data.advertisingShow'><div class='yc-col-2 yc-col-2-max'></div><div class='upload-adCreative yc-col-10'><div class='upload-adCreative-top'><span ng-hide='data.useSizeShow'>【广告位】<span ng-style='titleStyle' ng-bind='data.adSpaceName'></span></span><span>【尺寸】<span ng-style='titleStyle'>{{data.adSpaceTypeId == 9?(data.size + ' ' + data.size2):data.size}}</span></span><span ng-hide='data.useSizeShow'>【创意类型】<span ng-style='titleStyle' ng-bind='data.adSpaceTypeName'></span></span></div><div class='upload-adCreative-body clear'><div class='upload-adCreative-title'><p>请上传创意：</p> </div><div class='upload-adCreative-add'>" +
            " <adver-words data='data'></adver-words> " +
            " <adver-couplet data='data'></adver-couplet> " +
            " <adver-channel data='data'></adver-channel> " +
            " <adver-channel-in data='data'></adver-channel-in> " +
            " <adver-channel-in2 data='data'></adver-channel-in2> " +
            "<div ng-show='updateCreative' class='adCreative-add'><i ng-click='adCreative()' class='yc-icon'>&#xe644;</i></div></div></div></div></div>";

        var uploadInit = function (id) {
            var config = {
                swf: baseUrl + "/static/lib/Uploader.swf",
                server: fileUrl + "/orderAdCreative/upload.htm",
                pick: {
                    id: id,
                    multiple: false
                },
                fileVal: "uploadFile",
                accept: {
                    extensions: 'gif,jpg,jpeg,bmp,png,swf',
                    mimeTypes: 'image/*,application/x-shockwave-flash'
                }
            };
            var uploader = WebUploader.create(config);
            uploader.on('error', function (err) {
                ycui.alert({
                    content: "错误的文件类型",
                    timeout: 10,
                    error:true
                });
                ycui.loading.hide();
                uploader.reset();
            })

            uploader.on('uploadComplete', function () {
                ycui.loading.hide();
            })
            return uploader
        };
        var getId = function () {
            return "ad" + new Date().getTime() + Math.floor(Math.random() * 1000);
        };
        return {
            restrict: "E",
            template: html,
            controller: function () {
                /*图片上传*/
                this.uploadInit = uploadInit;
                /*获取随机ID*/
                this.getId = getId;
            },
            scope: {
                data: "="
            },
            compile: function () {
                return {
                    pre: function preLink(scope) {
                    },
                    post: function postLink(scope) {
                        //标题字体颜色
                        scope.titleStyle = {color: "red"};
                        // console.info(scope.data.adCreativeType);
                        switch (scope.data.adCreativeType) {
                            case 1:
                                scope.adCreative = function () {
                                    scope.data.advertising1.push({
                                        size: scope.data.size,
                                        fileSizeLimit: scope.data.fileSize,
                                        adSpaceId: scope.data.id,
                                        adCreativeType: scope.data.adCreativeType,
                                        fileType: 3
                                    });
                                }
                                break;
                            case 2:
                                scope.adCreative = function () {
                                    scope.data.advertising2.push({
                                        size: scope.data.size,
                                        size2: scope.data.size2,
                                        fileSizeLimit: scope.data.fileSize,
                                        adSpaceId: scope.data.id,
                                        adCreativeType: scope.data.adCreativeType,
                                        adSpaceTypeId: scope.data.adSpaceTypeId,
                                        leftId: getId(),
                                        rightId: getId()
                                    });
                                };
                                break;
                            case 3:
                                scope.adCreative = function () {
                                    scope.data.advertising3.push({
                                        size: scope.data.size,
                                        fileSizeLimit: scope.data.fileSize,
                                        adSpaceId: scope.data.id,
                                        adCreativeType: scope.data.adCreativeType,
                                        uploadId: getId()
                                    });
                                }
                                break;
                            case 4:
                                scope.adCreative = function () {
                                    scope.data.advertising4.push({
                                        size: scope.data.size,
                                        fileSizeLimit: scope.data.fileSize,
                                        adSpaceId: scope.data.id,
                                        adCreativeType: scope.data.adCreativeType,
                                        uploadId: getId()
                                    });
                                };
                                break;
                            case 5:
                                scope.adCreative = function () {
                                    scope.data.advertising5.push({
                                        size: scope.data.size,
                                        fileSizeLimit: scope.data.fileSize,
                                        adSpaceId: scope.data.id,
                                        adCreativeType: scope.data.adCreativeType,
                                        uploadId: getId()
                                    });
                                };
                                break;
                            default :
                                break;
                        }
                    }
                }
            }
        }
    }]);

app.directive("adverWords", ["$timeout",
    function ($timeout) {
        var html = "<div ng-repeat='data in data.advertising1'><div ng-if='closeBo' class='adCreative-box'> <input class='adverCouplet' ng-model='data.adCreativeName'  type='text' placeholder='请输入创意名称' ng-class='{\"redBorder\":!data.adCreativeName && data.adCreativeNameValid}' ng-keyup='data.adCreativeNameValid = true'> <div class='adCreative-box-words'> <div class='size' ng-bind='data.size'></div><div class='span'></div>  </div> <div class='maxlengthInput'><textarea class='adCreativeTitle' ng-model='data.adCreativeTitle' placeholder='请输入文字链内容' maxlength='30' ng-class='{\"redBorder\":!data.adCreativeTitle && data.adCreativeTitleValid}' ng-keyup='data.adCreativeTitleValid = true'></textarea><span class='textareaLength'></span></div>  <div ng-click='clodeBox($index)' ng-show='$index > 0' class='close'><i class='yc-icon'>&#xe643;</i></div>  <div class='landing-page'><div>*落地页：</div><div><textarea ng-model='data.landingPage' placeholder='请输入落地页地址' ng-class='{\"redBorder\":!regUrl.test(data.landingPage) && data.landingPageValid}' ng-keyup='data.landingPageValid = true'></textarea></div></div>  </div> </div>";
        return {
            restrict: "AE",
            template: html,
            require: "^?originalityBox",
            scope: {
                data: "="
            },
            transclude: true,
            compile: function () {
                return {
                    pre: function (scope, element) {
                        scope.regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
                        if (scope.data.adCreativeType != 1)return;
                        scope.$watch('data.advertising1.length', function (newValue, oldValue) {
                            if (newValue >= oldValue) {
                                $timeout(function () {
                                    
                                    var textarea = element[0].getElementsByClassName("adCreativeTitle");
                                    var span = element[0].getElementsByClassName("textareaLength");
                                    var maxlength = angular.element(textarea[newValue - 1]).attr("maxlength");
                                    var length = angular.element(textarea).val().length;
                                    span[newValue - 1].innerText = (length || 0) + "/" + maxlength;
                                    angular.element(textarea[newValue - 1]).bind("input", function (event) {
                                        angular.element(event.target).next().text(event.target.value.length + "/" + maxlength)
                                    })
                                }, 20)
                            }
                        })
                    },
                    post: function (scope, element, iAttrs, controller) {
                        if (scope.data.adCreativeType != 1)return;
                        scope.closeBo = true;
                        if (scope.data.advertising1 && scope.data.advertising1[0].orderId) {
                            if (scope.data.advertising1[0].lawCheckState == 1 && scope.data.advertising1[0].artCheckState == 1) {
                                delete scope.data.advertising1[0].uploadId
                            }
                            if (scope.data.advertising1[0].lawCheckState == 1 && scope.data.advertising1[0].artCheckState == 0) {
                                delete scope.data.advertising1[0].uploadId
                            }
                        } else {
                            scope.data.advertising1 = []
                            scope.data.advertising1.push({
                                size: scope.data.size,
                                adSpaceId: scope.data.id,
                                adCreativeType: scope.data.adCreativeType,
                                fileType: 3
                            });
                        }
                        scope.clodeBox = function (index) {
                            scope.data.advertising1.splice(index, 1)
                        }
                    }
                }
            }
        }
    }]);

app.directive("adverCouplet", ["$timeout", "UploadKeyFty",
    function ($timeout, UploadKeyFty) {
        var html = "<div ng-repeat='data in data.advertising2'><div ng-if='closeBo' class='adCreative-box'> <input class='adverCouplet' ng-model='data.adCreativeName' type='text' placeholder='请输入创意名称' ng-class='{\"redBorder\":!data.adCreativeName && data.adCreativeNameValid}' ng-keyup='data.adCreativeNameValid = true'> <div class='adCreative-box-couplet'> <div class='couplet-header'> <p class='size' ng-bind='data.size'></p><p ng-if='data.adSpaceTypeId == 9' class='size' ng-bind='data.size2'></p> <p class='prompt'></p> </div> <div class='couplet-body'> <div class='couplet-uploading'> <span ng-if='data.adSpaceTypeId == 11'>左侧待传</span><div ng-show='data.leftId' class='couplet-uploading-btn' id='{{data.leftId}}'> 选择文件 </div> </div> <div class='couplet-uploading'> <span ng-if='data.adSpaceTypeId == 11'>右侧待传</span><div ng-show='data.rightId' class='couplet-uploading-btn' id='{{data.rightId}}'> 选择文件 </div> </div> </div> </div> <div ng-click='clodeBox($index)' ng-show='$index > 0' class='close'><i class='yc-icon'>&#xe643;</i></div>  <div class='landing-page'><div>*落地页：</div><div><textarea name='landingPage' ng-model='data.landingPage' placeholder='请输入落地页地址' ng-class='{\"redBorder\":!regUrl.test(data.landingPage) && data.landingPageValid}' ng-keyup='data.landingPageValid = true'></textarea></div></div>  </div></div>";
        return {
            restrict: "AE",
            template: html,
            require: "^?originalityBox",
            scope: {
                data: "="
            },
            transclude: true,
            compile: function () {
                return {
                    pre: function preLink(scope) {
                        scope.regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
                    },
                    post: function postLink(scope, element, iAttrs, controller) {
                        if (scope.data.adCreativeType != 2)return;
                        scope.closeBo = true;
                        var wh = scope.data.size.split("*");
                        if (!scope.data.size2) {
                            scope.data.size2 = scope.data.size;
                        }
                        var wh2 = scope.data.size2.split("*");
                        if (scope.data.advertising2 && scope.data.advertising2[0].orderId) {
                            var htmlLeft = photoAndSwfPreview({
                                src: scope.data.advertising2[0].fileHttpUrl,
                                width: 115,
                                height: 210,
                                size: wh,
                                style: true
                            })
                            if (!scope.data.advertising2[0].fileHttpUrl2) {
                                scope.data.advertising2[0].fileHttpUrl2 = scope.data.advertising2[0].fileHttpUrl;
                            }
                            var htmlRight = photoAndSwfPreview({
                                src: scope.data.advertising2[0].fileHttpUrl2,
                                width: 115,
                                height: 210,
                                size: wh2,
                                style: true
                            })
                            $timeout(function () {
                                var uploadHtmlLeft = angular.element(element)[0].querySelector("#" + scope.data.advertising2[0].leftId)
                                var uploadHtmlRight = angular.element(element)[0].querySelector("#" + scope.data.advertising2[0].rightId)
                                angular.element(uploadHtmlLeft).after("<div class='channel-object'>" + htmlLeft + "</div>");
                                angular.element(uploadHtmlRight).after("<div class='channel-object'>" + htmlRight + "</div>");

                                delete scope.data.advertising2[0].leftId
                                delete scope.data.advertising2[0].rightId

                                scope.disabled = true;
                                
                            }, 100)

                        } else {
                            scope.data.advertising2 = []
                            scope.data.advertising2.push({
                                size: scope.data.size,
                                size2: scope.data.size2,
                                fileSizeLimit: scope.data.fileSize,
                                adSpaceId: scope.data.id,
                                adCreativeType: scope.data.adCreativeType,
                                adSpaceTypeId: scope.data.adSpaceTypeId,
                                leftId: controller.getId(),
                                rightId: controller.getId()
                            });
                        }

                        scope.$watch("data.advertising2.length", function (newValue, oldValue, scope) {
                            if (newValue < oldValue)return;
                            var advertising2 = scope.data.advertising2;
                            setTimeout(function () {
                                var index = advertising2.length - 1;
                                var keyleft = "";
                                var uploaderleft = controller.uploadInit("#" + advertising2[index].leftId)
                                    .on('beforeFileQueued', function (file) {
                                        ycui.loading.show();
                                        uploaderleft.stop(file);
                                        UploadKeyFty.uploadKey().success(function (da) {
                                            keyleft = da.items;
                                            uploaderleft.upload(file);
                                        });
                                    })
                                    .on('uploadBeforeSend', function (ob, data) {
                                        data.uploadKey = keyleft;
                                        if (scope.data.size) {
                                            var sizes = scope.data.size.split('*');
                                            data.width = sizes[0];
                                            data.height = sizes[1];
                                        }
                                        data.fileSize = advertising2[index].fileSizeLimit
                                    })
                                    .on('uploadSuccess', function (file, res) {
                                        if (res && res.code == 200) {
                                            var adCreative = res.adCreative;
                                            advertising2[index].fileHttpUrl = adCreative.fileHttpUrl;
                                            advertising2[index].fileMD5 = adCreative.fileMD5;
                                            advertising2[index].fileSize = adCreative.fileSize;
                                            advertising2[index].fileType = adCreative.fileType;
                                            var object = angular.element(element)[0].querySelector("#" + advertising2[index].leftId);
                                            var div = object.parentNode.querySelector(".channel-object");
                                            if (div) {
                                                div.parentNode.removeChild(div);
                                            }
                                            var html = photoAndSwfPreview({
                                                src: adCreative.fileHttpUrl,
                                                width: 115,
                                                height: 210,
                                                size: wh,
                                                style: true
                                            })
                                            angular.element(object).after("<div class='channel-object'>" + html + "</div>");
                                            uploaderleft.reset();
                                        } else if (res._raw == "false") {
                                            ycui.alert({
                                                content: "不正确的操作",
                                                timeout: 10,
                                                error:true
                                            })
                                            uploaderleft.reset();
                                        } else {
                                            ycui.alert({
                                                content: res.msg,
                                                timeout: 10,
                                                error:true
                                            })
                                            uploaderleft.reset();
                                        }

                                    });
                                var keyright = "";
                                var uploaderRight = controller.uploadInit("#" + advertising2[index].rightId)
                                    .on('beforeFileQueued', function (file) {
                                        ycui.loading.show();
                                        uploaderRight.stop(file);
                                        UploadKeyFty.uploadKey().success(function (da) {
                                            keyright = da.items;
                                            uploaderRight.upload(file);
                                        });
                                    })
                                    .on('uploadBeforeSend', function (ob, data) {
                                        data.uploadKey = keyright;
                                        if (scope.data.size2) {
                                            var sizes = scope.data.size2.split('*');
                                            data.width = sizes[0];
                                            data.height = sizes[1];
                                        }

                                        data.fileSize = advertising2[index].fileSizeLimit
                                    })
                                    .on('uploadSuccess', function (file, res) {
                                        if (res && res.code == 200) {
                                            var adCreative = res.adCreative;
                                            advertising2[index].fileHttpUrl2 = adCreative.fileHttpUrl;
                                            advertising2[index].fileMD5 = adCreative.fileMD5;
                                            advertising2[index].fileSize = adCreative.fileSize;
                                            advertising2[index].fileType = adCreative.fileType;
                                            var object = angular.element(element)[0].querySelector("#" + advertising2[index].rightId);
                                            var div = object.parentNode.querySelector(".channel-object");
                                            if (div) {
                                                div.parentNode.removeChild(div);
                                            }

                                            var html = photoAndSwfPreview({
                                                src: adCreative.fileHttpUrl,
                                                width: 115,
                                                height: 210,
                                                size: wh2,
                                                style: true
                                            })
                                            angular.element(object).after("<div class='channel-object'>" + html + "</div>");
                                            uploaderRight.reset();
                                        } else if (res._raw == "false") {
                                            ycui.alert({
                                                content: "不正确的操作",
                                                timeout: 10,
                                                error:true
                                            })
                                            uploaderRight.reset();
                                        } else {
                                            ycui.alert({
                                                content: res.msg,
                                                timeout: 10,
                                                error:true
                                            })
                                            uploaderRight.reset();
                                        }
                                    });
                            }, 100);
                        }, true)
                        scope.clodeBox = function (index) {
                            scope.data.advertising2.splice(index, 1)
                        }
                    }
                }
            }
        }
    }]);

app.directive("adverChannelIn", ["$timeout", "UploadKeyFty",
    function ($timeout, UploadKeyFty) {
        var html = "<div ng-repeat='data in data.advertising4' ><div ng-if='closeBo' class='adCreative-box'> <input type='text' ng-model='data.adCreativeName' placeholder='请输入创意名称' ng-class='{\"redBorder\":!data.adCreativeName && data.adCreativeNameValid}' ng-keyup='data.adCreativeNameValid = true'> <div class='channel-in'> <div class='span' ng-bind='data.size'></div><div ng-show='data.uploadId' class='channel-btn' id='{{data.uploadId}}'> <span>选择文件</span> </div> </div> <div class='maxlengthInput'><textarea ng-model='data.adCreativeTitle' ng-disabled='disabled'  placeholder='请输入广告标题' maxlength='30' style='resize: none' ng-class='{\"redBorder\":!data.adCreativeTitle && data.adCreativeTitleValid}' ng-keyup='data.adCreativeTitleValid = true'></textarea><span class='textareaLength'></span></div> <div ng-click='clodeBox($index)' ng-show='$index > 0' class='close'><i class='yc-icon'>&#xe643;</i></div>  <div class='landing-page'><div>*落地页：</div><div><textarea name='landingPage' ng-model='data.landingPage' placeholder='请输入落地页地址' ng-class='{\"redBorder\":!regUrl.test(data.landingPage) && data.landingPageValid}' ng-keyup='data.landingPageValid = true'></textarea></div></div>  </div> </div>";
        return {
            restrict: "AE",
            template: html,
            require: "^?originalityBox",
            scope: {
                data: "="
            },
            compile: function () {
                return {
                    pre: function preLink(scope, element) {
                        scope.regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
                        if (scope.data.adCreativeType != 4)return;
                        scope.$watch('data.advertising4.length', function (newValue, oldValue) {
                            if (newValue >= oldValue) {
                                $timeout(function () {
                                    var textarea = element[0].getElementsByTagName("textarea");
                                    var span = element[0].getElementsByClassName("textareaLength");

                                    var maxlength = angular.element(textarea[newValue - 1]).attr("maxlength");
                                    var length = angular.element(textarea).val().length;
                                    span[newValue - 1].innerText = (length || 0) + "/" + maxlength;
                                    angular.element(textarea[newValue - 1]).bind("input", function (event) {
                                        angular.element(event.target).next().text(event.target.value.length + "/" + maxlength)
                                    })
                                }, 20)
                            }
                        })
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        if (scope.data.adCreativeType != 4)return;
                        scope.closeBo = true;

                        var wh = scope.data.size.split("*");

                        if (scope.data.advertising4 && scope.data.advertising4[0].orderId) {
                            var html = photoAndSwfPreview({
                                src: scope.data.advertising4[0].fileHttpUrl,
                                width: 290,
                                height: 263,
                                size: wh,
                                style: true
                            })

                            $timeout(function () {
                                var uploadHtml = angular.element(iElement)[0].querySelector("#" + scope.data.advertising4[0].uploadId)
                                angular.element(uploadHtml).after("<div class='channel-object'>" + html + "</div>");

                                delete scope.data.advertising4[0].uploadId
                                scope.disabled = true;
                                
                            }, 100)

                        } else {
                            scope.data.advertising4 = [];
                            scope.data.advertising4.push({
                                size: scope.data.size,
                                fileSizeLimit: scope.data.fileSize,
                                adSpaceId: scope.data.id,
                                adCreativeType: scope.data.adCreativeType,
                                uploadId: controller.getId()
                            });
                        }

                        scope.$watch("data.advertising4.length", function (newValue, oldValue, scope) {
                            var advertising4 = scope.data.advertising4
                            if (newValue < oldValue)return;
                            setTimeout(function () {
                                var index = advertising4.length - 1;
                                var key = "";
                                var uploader = controller.uploadInit("#" + advertising4[index].uploadId)
                                    .on('beforeFileQueued', function (file) {
                                        ycui.loading.show();
                                        uploader.stop(file);
                                        UploadKeyFty.uploadKey().success(function (da) {
                                            key = da.items;
                                            uploader.upload(file);
                                        });
                                    })
                                    .on('uploadBeforeSend', function (ob, data) {
                                        data.uploadKey = key;
                                        if (scope.data.size) {
                                            var sizes = scope.data.size.split('*');
                                            data.width = sizes[0];
                                            data.height = sizes[1];
                                        }
                                        data.fileSize = advertising4[index].fileSizeLimit;
                                    })
                                    .on('uploadSuccess', function (file, res) {
                                        if (res && res.code == 200) {
                                            var adCreative = res.adCreative;
                                            advertising4[index].fileHttpUrl = adCreative.fileHttpUrl;
                                            advertising4[index].fileMD5 = adCreative.fileMD5;
                                            advertising4[index].fileSize = adCreative.fileSize;
                                            advertising4[index].fileType = adCreative.fileType;
                                            var object = angular.element(iElement)[0].querySelector("#" + advertising4[index].uploadId);
                                            var div = object.parentNode.querySelector(".channel-object");
                                            if (div) {
                                                div.parentNode.removeChild(div);
                                            }

                                            var html = photoAndSwfPreview({
                                                src: adCreative.fileHttpUrl,
                                                width: 290,
                                                height: 263,
                                                size: wh,
                                                style: true
                                            })
                                            angular.element(object).after("<div class='channel-object'>" + html + "</div>");
                                            uploader.reset();
                                        } else if (res._raw == "false") {
                                            ycui.alert({
                                                content: "不正确的操作",
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        } else {
                                            ycui.alert({
                                                content: res.msg,
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        }
                                    });
                            }, 10);
                        }, true)

                        scope.clodeBox = function (index) {
                            scope.data.advertising4.splice(index, 1)
                            scope.backgroundImage.splice(index, 1)
                        }
                    }
                }
            }
        }
    }]);

app.directive("adverChannelIn2", ["$timeout", "UploadKeyFty",
    function ($timeout, UploadKeyFty) {
        var html = "<div ng-repeat='data in data.advertising5'><div ng-if='closeBo' class='adCreative-box'> <input type='text' ng-model='data.adCreativeName' placeholder='请输入创意名称' ng-class='{\"redBorder\":!data.adCreativeName && data.adCreativeNameValid}' ng-keyup='data.adCreativeNameValid = true'> <div class='channel-in2'> <div class='span' ng-bind='data.size'></div><div ng-show='data.uploadId' class='channel-btn' id='{{data.uploadId}}'> <span>选择文件</span> </div> </div> <div class='maxlengthInput'><textarea class='inputCreative adCreativeText borderBottomNone' type='text' maxlength='30' ng-model='data.adCreativeTitle' ng-disabled='disabled'  placeholder='请输入广告标题' ng-class='{\"redBorder\":!data.adCreativeTitle && data.adCreativeTitleValid}' ng-keyup='data.adCreativeTitleValid = true'></textarea><span class='inputLength'></span></div> <div class='maxlengthInput'><textarea class='textareaCreative' rows='4' name='adCreativeText' ng-model='data.adCreativeText' ng-disabled='disabled'  placeholder='请输入广告描述' maxlength='500' ng-class='{\"redBorder\":!data.adCreativeText && data.adCreativeTextValid}' ng-keyup='data.adCreativeTextValid = true'></textarea><span class='textareaLength'></span></div> <div ng-click='clodeBox($index)' ng-show='$index > 0' class='close'><i class='yc-icon'>&#xe643;</i></div>  <div class='landing-page'><div>*落地页：</div><div><textarea name='landingPage' ng-model='data.landingPage' placeholder='请输入落地页地址' ng-class='{\"redBorder\":!regUrl.test(data.landingPage) && data.landingPageValid}' ng-keyup='data.landingPageValid = true'></textarea></div></div>  </div> </div>";
        return {
            restrict: "AE",
            template: html,
            require: "^?originalityBox",
            scope: {
                data: "="
            },
            compile: function () {
                return {
                    pre: function preLink(scope, element) {
                        scope.regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
                        if (scope.data.adCreativeType != 5)return;
                        scope.$watch('data.advertising5.length', function (newValue, oldValue) {
                            if (newValue >= oldValue) {
                                $timeout(function () {
                                    var textarea = element[0].getElementsByClassName("textareaCreative");
                                    var input = element[0].getElementsByClassName("inputCreative");
                                    var span = element[0].getElementsByClassName("textareaLength");
                                    var inputSpan = element[0].getElementsByClassName("inputLength");

                                    var maxlength = angular.element(textarea[newValue - 1]).attr("maxlength");
                                    var inputMaxlength = angular.element(input[newValue - 1]).attr("maxlength");
                                    var textareaValueLength = angular.element(textarea).val().length;
                                    var inputValueLength = angular.element(input).val().length;
                                    span[newValue - 1].innerText = (textareaValueLength || 0) + "/" + maxlength;
                                    inputSpan[newValue - 1].innerText = (inputValueLength || 0) + "/" + inputMaxlength;
                                    angular.element(textarea[newValue - 1]).bind("input", function (event) {
                                        angular.element(event.target).next().text(event.target.value.length + "/" + maxlength)
                                    })
                                    angular.element(input[newValue - 1]).bind("input", function (event) {
                                        angular.element(event.target).next().text(event.target.value.length + "/" + inputMaxlength)
                                    })
                                }, 20)
                            }
                        })
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        if (scope.data.adCreativeType != 5)return;
                        scope.closeBo = true;
                        var wh = scope.data.size.split("*");

                        if (scope.data.advertising5 && scope.data.advertising5[0].orderId) {
                            var html = photoAndSwfPreview({
                                src: scope.data.advertising5[0].fileHttpUrl,
                                width: 290,
                                height: 250,
                                size: wh,
                                style: true
                            })

                            $timeout(function () {
                                var uploadHtml = angular.element(iElement)[0].querySelector("#" + scope.data.advertising5[0].uploadId)
                                angular.element(uploadHtml).after("<div class='channel-object'>" + html + "</div>");

                                delete scope.data.advertising5[0].uploadId
                                scope.disabled = true;
                                
                            }, 100)


                        } else {
                            scope.data.advertising5 = []
                            scope.data.advertising5.push({
                                size: scope.data.size,
                                fileSizeLimit: scope.data.fileSize,
                                adSpaceId: scope.data.id,
                                adCreativeType: scope.data.adCreativeType,
                                uploadId: controller.getId()
                            });
                        }

                        scope.$watch("data.advertising5.length", function (newValue, oldValue, scope) {
                            var advertising5 = scope.data.advertising5
                            if (newValue < oldValue)return;
                            setTimeout(function () {
                                var index = advertising5.length - 1;
                                var key = "";
                                var uploader = controller.uploadInit("#" + advertising5[index].uploadId)
                                    .on('beforeFileQueued', function (file) {
                                        ycui.loading.show();
                                        uploader.stop(file);
                                        UploadKeyFty.uploadKey().success(function (da) {
                                            key = da.items;
                                            uploader.upload(file);
                                        });
                                    })
                                    .on('uploadBeforeSend', function (ob, data) {
                                        data.uploadKey = key;
                                        if (scope.data.size) {
                                            var sizes = scope.data.size.split('*');
                                            data.width = sizes[0];
                                            data.height = sizes[1];
                                        }
                                        data.fileSize = advertising5[index].fileSizeLimit
                                    })
                                    .on('uploadSuccess', function (file, res) {
                                        if (res && res.code == 200) {
                                            var adCreative = res.adCreative;
                                            advertising5[index].fileHttpUrl = adCreative.fileHttpUrl;
                                            advertising5[index].fileMD5 = adCreative.fileMD5;
                                            advertising5[index].fileSize = adCreative.fileSize;
                                            advertising5[index].fileType = adCreative.fileType;
                                            var object = angular.element(iElement)[0].querySelector("#" + advertising5[index].uploadId);
                                            var div = object.parentNode.querySelector(".channel-object");
                                            if (div) {
                                                div.parentNode.removeChild(div);
                                            }
                                            var html = photoAndSwfPreview({
                                                src: adCreative.fileHttpUrl,
                                                width: 290,
                                                height: 250,
                                                size: wh,
                                                style: true
                                            })
                                            angular.element(object).after("<div class='channel-object'>" + html + "</div>");
                                            uploader.reset();
                                        } else if (res._raw == "false") {
                                            ycui.alert({
                                                content: "不正确的操作",
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        } else {
                                            ycui.alert({
                                                content: res.msg,
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        }
                                    });
                            }, 10);
                        }, true)

                        scope.clodeBox = function (index) {
                            scope.data.advertising5.splice(index, 1)
                        }
                    }
                }
            }
        }
    }]);

app.directive("adverChannel", ["$timeout", "UploadKeyFty",
    function ($timeout, UploadKeyFty) {
        var html = "<div ng-repeat='data in data.advertising3'><div class='adCreative-box'> <input ng-model='data.adCreativeName' type='text' placeholder='请输入创意名称' ng-class='{\"redBorder\":!data.adCreativeName && data.adCreativeNameValid}' ng-keyup='data.adCreativeNameValid = true'> <div class='channel'> <div class='span' ng-bind='data.size'></div><div ng-show='data.uploadId' class='channel-btn' id='{{data.uploadId}}'> 选择文件 </div></div> <div ng-click='clodeBox($index)' ng-show='$index > 0' class='close'><i class='yc-icon'>&#xe643;</i></div>  <div class='landing-page'><div>*落地页：</div><div><textarea name='landingPage' ng-model='data.landingPage' placeholder='请输入落地页地址' ng-class='{\"redBorder\":!regUrl.test(data.landingPage) && data.landingPageValid}' ng-keyup='data.landingPageValid = true'></textarea></div></div>  </div></div>";
        return {
            restrict: "AE",
            template: html,
            require: "^?originalityBox",
            scope: {
                data: "="
            },
            transclude: true,
            compile: function () {
                return {
                    pre: function preLink(scope) {
                        scope.regUrl = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        if (scope.data.adCreativeType != 3)return;

                        var wh = scope.data.size.split("*");
                        if (scope.data.advertising3 && scope.data.advertising3[0].orderId) {
                            var html = photoAndSwfPreview({
                                src: scope.data.advertising3[0].fileHttpUrl,
                                width: 290,
                                height: 300,
                                size: wh,
                                style: true
                            })

                            $timeout(function () {
                                var uploadHtml = angular.element(iElement)[0].querySelector("#" + scope.data.advertising3[0].uploadId)
                                angular.element(uploadHtml).after("<div class='channel-object'>" + html + "</div>");
                                
                                delete scope.data.advertising3[0].uploadId
                                scope.disabled = true;
                            }, 100)


                        } else {
                            scope.data.advertising3 = []
                            scope.data.advertising3.push({
                                size: scope.data.size,
                                fileSizeLimit: scope.data.fileSize,
                                adSpaceId: scope.data.id,
                                adCreativeType: scope.data.adCreativeType,
                                uploadId: controller.getId()
                            });
                        }
                        scope.$watch("data.advertising3.length", function (newValue, oldValue, scope) {
                            var advertising3 = scope.data.advertising3
                            if (newValue < oldValue)return;
                            setTimeout(function () {
                                var index = advertising3.length - 1;
                                var key = "";
                                var uploader = controller.uploadInit("#" + advertising3[index].uploadId)
                                    .on('beforeFileQueued', function (file) {
                                        ycui.loading.show();
                                        uploader.stop(file);
                                        UploadKeyFty.uploadKey().success(function (da) {
                                            key = da.items;
                                            uploader.upload(file);
                                        });
                                    })
                                    .on('uploadBeforeSend', function (ob, data) {
                                        data.uploadKey = key;
                                        if (scope.data.size) {
                                            var sizes = scope.data.size.split('*')
                                            data.width = sizes[0];
                                            data.height = sizes[1];
                                        }
                                        data.fileSize = advertising3[index].fileSizeLimit
                                    })
                                    .on('uploadSuccess', function (file, res) {
                                        if (res && res.code == 200) {
                                            var adCreative = res.adCreative;
                                            advertising3[index].fileHttpUrl = adCreative.fileHttpUrl;
                                            advertising3[index].fileMD5 = adCreative.fileMD5;
                                            advertising3[index].fileSize = adCreative.fileSize;
                                            advertising3[index].fileType = adCreative.fileType;
                                            var object = angular.element(iElement)[0].querySelector("#" + advertising3[index].uploadId);
                                            var div = object.parentNode.querySelector(".channel-object");
                                            if (div) {
                                                div.parentNode.removeChild(div);
                                            }
                                            var html = photoAndSwfPreview({
                                                src: adCreative.fileHttpUrl,
                                                width: 290,
                                                height: 300,
                                                size: wh,
                                                style: true
                                            })
                                            angular.element(object).after("<div class='channel-object'>" + html + "</div>");
                                            uploader.reset();
                                        } else if (res._raw == "false") {
                                            ycui.alert({
                                                content: "不正确的操作",
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        } else {
                                            ycui.alert({
                                                content: res.msg,
                                                timeout: 10,
                                                error:true
                                            })
                                            uploader.reset();
                                        }
                                    });
                            }, 10);
                        }, true)

                        scope.clodeBox = function (index) {
                            scope.data.advertising3.splice(index, 1)
                        }
                    }
                }
            }
        }
    }]);