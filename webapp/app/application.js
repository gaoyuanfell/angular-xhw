/**
 * Created by Yuan on 2016/4/6 0006.
 */
var configForm = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    transformRequest: function (data) {
        if (!data) return undefined;
        return toBodyString(data);
    }
};

var configJson = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: function (data) {
        if (!data) return undefined;
        return JSON.stringify(data);
    }
};

/*统一的请求拦截 通用的angular.filter angular.factory 全局变量constant（不能修改） value（可修改）*/
var app = angular.module('WangCheng', []);
app.config(["$locationProvider", "$httpProvider", function ($locationProvider, $httpProvider) {
    $httpProvider.defaults.headers.post['Accept'] = '*/*';
    // $httpProvider.defaults.useXDomain = true;
    // delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.interceptors.push('InterceptorHttp');
}]);

app.factory("InterceptorHttp", [function () {
    return {
        responseError: function (response) {
            if (response.status == 500 || response.status == 404) {
                ycui.alert({
                    content: "系统错误",
                    timeout: 10,
                    error:true
                });
                delete response.data;
                return response;
            }
            !response.data && (response.data = {});
            return response;
        },
        request: function (request) {
            return request
        },
        response: function (response) {
            //登陆拦截
            if (response.data && response.data.status == 205) {
                if (location.href.indexOf('login.html') != -1) {
                    return response;
                } else {
                    top.location.href = baseUrl + "/login.html";
                    return response;
                }
            }
            //统一的错误处理
            if (response.status == 500) {
                ycui.alert({
                    content: "系统错误",
                    timeout: 10,
                    error:true
                });
                return response;
            }
            //统一的错误处理
            if (response.status == 415) {
                ycui.alert({
                    content: "参数错误",
                    timeout: 10,
                    error:true
                });
                return response;
            }
            if (response.data && response.data.code == 403) {
                ycui.alert({
                    content: response.data.msg,
                    timeout: 10,
                    error:true
                });
                return response;
            }
            //统一的自定义错误处理
            if (response.data && response.data.code == 500) {
                var data = angular.copy(response.data);
                delete data.code;
                delete data.success;
                var msg = "";
                for (var i in data) {
                    msg += data[i];
                }
                ycui.alert({
                    content: msg || response.data.msg,
                    timeout: 10,
                    error:true
                });
                return response;
            }
            !response.data && (response.data = {});
            return response;
        }
    };
}]);

app.directive('adCreate',['$timeout',function ($timeout) {
    return{
        scope: {
            advertising:'=advertising',
            config:'=config'
        },
        restrict: 'AE',
        templateUrl:'../adCreate.html',
        link: function(scope, element, attrs) {
            function showPhoto(advertising,url,sizes,type){
                var object = document.querySelector("." + advertising.uploadId);
                var config = {
                    src: url,
                    size:sizes,
                    style: true
                };
                if(advertising.adCreativeType == 2){
                    if(type == 'left'){
                        object = document.querySelector("." + advertising.leftId);
                    }else if(type == 'right'){
                        object = document.querySelector("." + advertising.rightId);
                    }
                    config.width = 130;
                    config.height = 180;
                }else{
                    config.width = 260;
                    config.height = 180;
                }

                var html = photoAndSwfPreview(config);
                object.innerHTML = "<div class='channel-object'>" + html + "</div>";
            }

            function removePhoto(advertising,type){
                var object = document.querySelector("." + advertising.uploadId);
                if(advertising.adCreativeType == 2){
                    if(type == 'left'){
                        object = document.querySelector("." + advertising.leftId);
                    }else if(type == 'right'){
                        object = document.querySelector("." + advertising.rightId);
                    }
                }
                object.innerHTML = '';
            }

            scope.loadImg = function(ad,url,type){
                $timeout.cancel(ad.$$timeout);
                ~function(ad,url,type){
                    ad.$$timeout = $timeout(function(){
                        var img = new Image()
                        img.src = url;
                        img.onload = function(e){
                            //尺寸校验
                            var sizes = ad.size.split('*')
                            if(type == 'right'){
                                sizes = ad.size2.split('*')
                            }
                            var width = img.width;
                            var height = img.height;
                            var _width = sizes[0];
                            var _height = sizes[1];

                            // if(width != _width || height != _height){
                            //     if(type == 'right'){
                            //         scope.$apply(function(){
                            //             ad.$sizesError2 = '尺寸不正确（' + width + '*' + height +'）';
                            //         })
                            //     }else{
                            //         scope.$apply(function(){
                            //             ad.$sizesError1 = '尺寸不正确（' + width + '*' + height +'）';
                            //         })
                            //     }
                            //     return;
                            // }

                            showPhoto(ad,url,[width,height],type);
                            scope.$apply(function(){
                                if(type == 'right'){
                                    delete ad.$sizesError2;
                                }else{
                                    delete ad.$sizesError1;
                                }
                            })
                        }
                        img.onerror = function(e){
                            if(type == 'right'){
                                scope.$apply(function(){
                                    ad.$sizesError2 = '图片地址有误';
                                })
                                removePhoto(ad,'right');
                            }else{
                                scope.$apply(function(){
                                    ad.$sizesError1 = '图片地址有误';
                                })
                                removePhoto(ad,'left');
                            }
                        }
                    },500)
                }(ad,url,type)
            }
        }
    }
}]);

app.directive('ngAttr', function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            scope.$watch(attr.ngAttr, function (newValue) {
                for (var i in newValue) {
                    element.attr(i, newValue[i]);
                }
            });
        }
    };
});

app.directive('ngColor', function () {
    return {
        restrict: "A",
        scope:{
            'color':'@ngColor'
        },
        link: function (scope, element, attr) {
            element[0].style.color = scope.color
        }
    };
});

app.directive('ngPadding', function () {
    return {
        restrict: "A",
        scope:{
            'padding':'@ngPadding'
        },
        link: function (scope, element, attr) {
            element[0].style.padding = scope.padding + 'px'
        }
    };
});

app.directive('ngPaddingLeft', function () {
    return {
        restrict: "A",
        scope:{
            'padding':'@ngPadding'
        },
        link: function (scope, element, attr) {
            element[0].style.paddingLeft = scope.padding + 'px'
        }
    };
});

app.directive('ngMargin', function () {
    return {
        restrict: "A",
        scope:{
            'margin':'@ngMargin'
        },
        link: function (scope, element, attr) {
            element[0].style.margin = scope.margin
        }
    };
});

app.directive('ngWidth', function () {
    return {
        restrict: "A",
        scope:{
            'width':'@ngWidth'
        },
        link: function (scope, element, attr) {
            if (scope.width == 'auto') {
                element[0].style.width = 'auto';
            } else {
                element[0].style.width = scope.width.indexOf('%') == -1 ? (scope.width + 'px') : (scope.width);
            }
        }
    };
});

app.directive('ngTitle', function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var dom = element[0];
            element.after('<div class="yc-showTitle"></div>');
            var $title = dom.nextElementSibling;
            $title.innerText = attr.ngTitle;
            dom.parentNode && (dom.parentNode.style.position = 'relative');
            element.on('mouseover', function () {
                $title.style.position = 'absolute';
                $title.style.top = dom.offsetHeight + 'px';
                // $title.style.top = '0px';
                $title.style.left = '50%';
                $title.style.marginLeft = -dom.offsetWidth / 2 + 'px';
                $title.style.fontSize = '12px';
                $title.style.visibility = 'visible';
            });
            element.on('mouseout', function () {
                $title.style.visibility = 'hidden';
            });
        }
    };
});

app.directive('repeatFinish', ['$timeout', function ($timeout) {
    return {
        link: function (scope, element, attr) {
            if (scope.$last == true) {
                $timeout(function () {
                    if (attr.repeatFinish) {
                        scope.$emit(attr.repeatFinish);
                    }
                });
            }
        }
    }
}]);

app.directive('ycPage',['$compile',function($compile){
    return {
        restrict: "AE",
        scope:{
            page:'=',
            redirect:'&',
            query:'=query',
            session:'@'
        },
        template:'<div class="yc-page"><div class="item"> <ul ng-click="search($event)"><li class="top">上一页</li><li ng-repeat="p in pageList track by $index" ng-class="{\'select\':p.n == page.page}">{{p.n}}</li><li class="bottom">下一页</li></ul></div><div class="item"><span class="go" ng-click="search($event)">跳转到</span><span><input ng-model="go" type="text"></span></div></div>',
        link:function(scope, element, attrs){
            var total_page = 1;
            var page = 1;
            scope.$session = true;
            if(scope.session && (scope.session == 'false' || scope.session == 0)){
                scope.$session = false;
            } 
            //暂时这样写 时间紧迫 引入独立 query
            var pageIndex = window.sessionStorage.getItem('session_page_index');
            if(+pageIndex){
                if(scope.$session){
                    scope.query.pageIndex = +pageIndex
                }
            }
            //暂时这样写 时间紧迫

            scope.$watch('page', function (newV, oldV, scope) {
                if(newV !== oldV){
                    total_page = scope.page.total_page;
                    page = scope.page.page;
                    scope.pageList = getList(3,total_page,page) || [];
                }
            })

            var $input = element[0].querySelector('span input');
            var $go = element[0].querySelector('span.go');
            $input && $input.addEventListener('keyup',function(event){
                var key = event.keyCode ? event.keyCode : event.which;
                if(key == 13){
                    $go.click();
                }
            })
            scope.search = function(e){
                var n = e.target.innerText;
                var p = scope.page.page;
                var tp = scope.page.total_page;
                switch (n) {
                    case '上一页':
                        p = p-1<=0?1:(p-1);
                        scope.page.page = p;
                        page != 1 && scope.redirect();
                        break;
                    case '下一页':
                        p = p+1>=tp?tp:(p+1);
                        scope.page.page = p;
                        page != tp && scope.redirect();
                        break;
                    case '跳转到':
                        if(!scope.go){
                            break;
                        }
                        var g = /^\d/ig;
                        scope.go = scope.go.replace(/[^0-9]/ig,'') || 1
                        if(scope.go <= 0){
                            scope.go = 1;
                        }
                        if(scope.go >= tp){
                            scope.go = tp;
                        }
                        scope.page.page = scope.go;
                        scope.redirect();
                        break;
                    default:
                        !isNaN(+n) && (scope.page.page = +n,scope.redirect());
                        break;
                }
                scope.pageList = getList(3,tp,scope.page.page);
                scope.$session && window.sessionStorage.setItem('session_page_index',scope.page.page);
            }

            function getList(n,tp,p){
                var arr = [];
                var s = n*2+5;
                if(tp >= s){
                    var _n = n;
                    var _p = p;
                    if(p-n-2<1){
                        while (_p) {
                            arr.unshift({n:_p});
                            --_p;
                        }
                        _p = p;
                        while (++_p<=n*2+3) {
                            arr.push({n:_p});
                        }
                        arr.push({n:'...'},{n:tp});
                    }else if(p+n+2>tp){
                        while (_p<=tp) {
                            arr.push({n:_p});
                            ++_p;
                        }
                        _p = p;
                         while (--_p>tp-n*2-3) {
                            arr.unshift({n:_p});
                        }
                        arr.unshift({n:1},{n:'...'});
                    }else{
                        while (_n) {
                            arr.push({n:p-_n});
                            --_n;
                        }
                        arr.push({n:p});
                        _n = n;
                        var i = 1;
                        while (i <= _n) {
                            arr.push({n:p+i});
                            ++i;
                        }
                        arr.unshift({n:1},{n:'...'});
                        arr.push({n:'...'},{n:tp});
                    }
                }else{
                    while (tp) {
                        arr.unshift({n:tp--});
                    }
                }
                return arr;
            }
        }
    }
}])

/**
 * 统一弹窗 数据驱动
 */
app.directive('ycModule', ['$timeout', function ($timeout) {
    return {
        restrict: "A",
        scope:{
            module:"=ycModule"
        },
        link:function(scope, element, attrs){
            var doc = element[0];
            var ok = doc.querySelector('.dialog-submit a.ok');
            var no = doc.querySelector('.dialog-submit a.no');
            var title = doc.querySelector('.dialog-title .title')
            var close = doc.querySelector('.dialog-title .dialog-close')
            var wraper = doc.querySelector('.dialog-wraper');
            var fadeOut = function (element) {
                removeEvent();
                doc.classList.add('animated','fadeOut');
                doc.classList.remove('fadeIn');
                $timeout(function () {
                    doc.style.display = 'none';
                }, 200);
            }

            function fadeOutFun(bo){
                scope.$apply(function () {
                    fadeOut(element);
                })
            }

            var fadeIn = function (element,config) {
                !config.noClick && (no.style.display = 'none');
                addEvent(config);
                attrs.width && (wraper.style.width = attrs.width + 'px');
                attrs.height && (wraper.style.height = attrs.height + 'px');
                attrs.top && (wraper.style.top = attrs.top + 'px');
                doc.style.display = 'block';
                setTimeout(function () {
                    var width = window.screen.width;
                    var bo = (width/2 - wraper.offsetWidth/2) > 180;
                    var marginLeft = -wraper.offsetWidth / 2 - 90
                    if(!bo){
                        marginLeft = -397;
                    }
                    wraper.style.marginLeft = marginLeft + 'px';
                    var top = (wraper.offsetHeight / 2)>240?240:(wraper.offsetHeight / 2);
                    wraper.style.marginTop = -top + 'px';
                },0);
                doc.classList.add('animated','fadeIn');
                doc.classList.remove('fadeOut','hide');

                var $createBg = window.top.$createBg;
                $createBg && (scope.module.closeFun = $createBg(fadeOutFun));
            }

            element.on('click', function (e) {
                var closeFun = scope.module.closeFun;
                if(e.target.classList.contains('dialog-bg')){
                    fadeOutFun();
                    closeFun && closeFun()
                }
            });

            function addEvent(config){
                var closeFun;
                angular.element(ok).bind('click', function (e) {
                    var bo = false;
                    closeFun = scope.module.closeFun;
                    scope.$apply(function () {
                        bo = config.okClick && config.okClick(e)
                    })
                    if (bo) {
                        return
                    };
                    e.stopPropagation();
                    scope.$apply(function () {
                        fadeOut(element);
                    })
                    closeFun && closeFun()
                })

                //
                angular.element(close).bind('click', function (e) {
                    closeFun = scope.module.closeFun;
                    scope.$apply(function () {
                        config.noClick && config.noClick(e);
                    })
                    e.stopPropagation();
                    scope.$apply(function () {
                        fadeOut(element);
                    })
                    closeFun && closeFun()
                })

                //
                angular.element(no).bind('click', function (e) {
                    closeFun = scope.module.closeFun;
                    scope.$apply(function () {
                        config.noClick && config.noClick(e);
                    })
                    e.stopPropagation();
                    scope.$apply(function () {
                        fadeOut(element);
                    })
                    closeFun && closeFun()
                })
            }

            function removeEvent(){
                angular.element(ok).unbind('click')
                angular.element(close).unbind('click')
                angular.element(no).unbind('click')
            }

            scope.$watch('module',function(newV,oldV){
                if(newV != oldV && newV){
                    title.textContent = newV.title || '提示框';
                    fadeIn(element,newV);
                    newV.fadeOut = fadeOutFun;
                }
            })
            // var doc = element[0];
            // var ok = doc.querySelector('.dialog-submit a.ok');
            // var no = doc.querySelector('.dialog-submit a.no');
            // var title = doc.querySelector('.dialog-title .title')
            // var close = doc.querySelector('.dialog-title .dialog-close')
            // var wraper = doc.querySelector('.dialog-wraper');
        }
    }
}])

//统一的打印指令
app.directive('ycPrint', ['$animate', function ($animate) {
    return {
        restrict: "A",
        scope: {
            key: '@ycPrint'
        },
        link: function postLink(scope, element, attrs) {
            var key = scope.key;
            var start = 'startprint';
            var end = 'endprint';
            var sComment = document.createComment(start + '-' + key);
            var eComment = document.createComment(end + '-' + key);
            var s = document.createElement('p');
            element[0].parentNode.insertBefore(s, element[0])
            angular.element(s).after(sComment, 0);
            element.after(eComment);
            s.remove();

            var scripts = document.getElementsByTagName('script');
            var s_script = '';
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].getAttribute('src')) {
                    s_script += scripts[i].outerHTML
                }
            }

            var links = document.getElementsByTagName('link');
            var s_link = '';
            for (var i = 0; i < links.length; i++) {
                s_link += links[i].outerHTML
            }

            var aotoFun = function (title) {
                var title = title || '报表打印';
                if (document.getElementsByTagName("title")[0]) {
                    document.getElementsByTagName("title")[0].textContent = title;
                } else {
                    var $title = document.createElement('title');
                    $title.textContent = title;
                    document.head.appendChild($title);
                }
                window.print();
            }
            window.print = function (_key, title) {
                var startStr = '<!--' + start + '-' + _key + '-->'; //设置打印开始区域
                var endStr = '<!--' + end + '-' + _key + '-->'; //设置打印结束区域
                var bdhtml = window.document.body.innerHTML;
                var printHtml = bdhtml.substring(bdhtml.indexOf(startStr) + startStr.length, bdhtml.indexOf(endStr)); //从标记里获取需要打印的页面
                printHtml = printHtml.replace('column-setting=\"clientCustom\"','column-setting=\"clientCustom\" style=\"display: none;\"');
                var script = '<script>' + '!' + aotoFun.toString() + '(\'' + title + '\')' + '</script>';
                window.open('about:blank', '打印', "toolbar =no, menubar=no, scrollbars=no, resizable=no, location=no, status=no").document.write(s_link + s_script + printHtml + script);
            }
        }
    }
}])

// 没有使用
app.directive('ycTable',[function(){
    return{
        restrict:'A',
        scope:{
            width:'@',//每个列之间用 ',' 隔开 ，多个控制用|隔开。
            column:'=',//控制列的显示隐藏。
            columnStr:'@'
        },
        link:function postLink(scope, element, attrs){
            var $table = element[0];
            $table.parentNode.style.position = 'relative';
            var $th = $table.querySelectorAll('thead th');
            // var length = $th.length;
            var $td = $table.querySelectorAll('tbody td');
            var columnList = scope.columnStr.split(',');
            scope.$watch('column',function(newV,oldV){
                if($th && columnList){
                    $th.forEach(function(da,index){
                        var s = columnList[index];
                        showOrhide(da,scope.column[s]);
                        $td[index] && showOrhide($td[index],scope.column[s])
                    })
                }
            },true)
            element.after('<div class="column-setting"> <i class="yc-icon pointer">&#xe624;</i> </div>');

            function showOrhide(ele,bo){
                if(bo){
                    ele && (ele.style.display = 'table-cell');
                }else{
                    ele && (ele.style.display = 'none');
                }
            }
        }
    }
}])


//统一的下拉选择指令

app.directive('ycSelect', ['$animate', '$compile', function ($animate, $compile) {
    return {
        restrict: "A",
        scope: {
            select: '=ycSelect',//
            width:'@width',//宽度
            value: '@value',//需要赋值的 key
            key: '@key',//获取值的 key
            name: '@name',//列表下需要显示的名称
            session: '@session',//session key
            group: '@group',//订阅
            placeholder: '@placeholder',//默认显示文字
            inputHolder:'@inputHolder',
            query:'=query',//结果对象 不填则为当先scope
            search:'@search',//查询方式
            defaultSearch:'@defaultSearch',
            add:'@',//手动添加选项 字符窜
            recursion:'@',//递归
            resname:'@',//值回填需要的字段 一般情况只需要取name就行 有可能新增修改所返回的值不一样
            reskey:'@',//根据key值取对象中scope.name中的值
            disabled:'@disabled',//是否禁用
            callback:'&'//选择后的回调
        },
        link: function postLink(scope, element, attrs) {

            scope.$on('yc-select', function (even, data) {
                viewPlaceholder();
            })
            scope.$watch('select.list', function (newV, oldV, scope) {
                if(newV !== oldV && newV){
                    scope.$emit('yc-select', scope);

                    if(scope.recursion){
                        newV = recursion(newV,scope.recursion);
                    }
                }
                if(newV && scope.add){
                    var s = scope.add.split(',');
                    var _arr = [];
                    s.forEach(function(da){
                        var bo = {};
                        bo[scope.name] = da;
                        if(newV[0] == undefined || da != newV[0][scope.name]){
                            _arr.unshift(bo);
                        }
                    })
                    _arr.map(function(da){
                        newV.unshift(da);
                    })
                }
            })

            function recursion(list,str,result,p){
                var _result = angular.copy(list);
                !result && (list.length = 0,result = list);
                for(var i = 0;i<_result.length;i++){
                    var parent = _result[i];
                    if(p){
                        delete p[str];
                        parent.$$parent = p;
                    }
                    result.push(parent);
                    var next = _result[i][str];
                    if(next && next.length > 0){
                        recursion(next,str,result,angular.copy(parent))
                    }
                }
                return result;
            }

            !scope.search && (scope.search = 'auto');
            !scope.defaultSearch && (scope.defaultSearch = '无查询结果');
            scope.select.defaultSearch && (scope.defaultSearch = scope.select.defaultSearch)
            !scope.name && (scope.name = 'name');
            !scope.query && (scope.query = scope.$parent);
            !scope.select.$list  && (scope.select.$list = {});
            !scope.placeholder && (scope.select.placeholder = '请选择内容');
            !scope.$$placeholder && (scope.$$placeholder = scope.placeholder || '请选择内容');
            !scope.key && (scope.key = 'id');
            if(scope.disabled){
                if(scope.disabled == 'true' || scope.disabled == 1){
                    scope.select.$disabled = true;
                }else {
                    scope.select.$disabled = false;
                }
            }else{
                scope.select.$disabled = false;
            }

            scope.select.$disabled = false;
            scope.select.name = scope.name;
            scope.select.key = scope.key;

            scope.$watch('resname',function(newV,oldV){
                newV && (scope.select.placeholder = newV);
                if(newV != oldV){
                    scope.select.placeholder = newV || scope.placeholder;
                }
            })

            scope.$watch('reskey',function(newV,oldV){
                if(newV != undefined){
                    var key = scope.key.split(',')[0];
                    var name = scope.name;
                    var selectList = scope.$watch('select.list',function(_newV,_oldV){
                        if(_newV && _newV.length > 0){
                            for(var i = 0;i<_newV.length;i++){
                                var da = _newV[i];
                                if(da[key] == newV){
                                    scope.select.placeholder = da[name] || scope.placeholder;
                                    scope.select.sessionBack && scope.select.sessionBack(da);
                                    break;
                                }
                            }
                            selectList();
                        }
                    })
                }
            })
            
            scope.$watch('disabled',function(newV,oldV){
                if(newV != oldV || (newV == oldV && newV != undefined)){
                    if(newV == 'true' || newV == 1){
                        scope.select.$disabled = true;
                    }else{
                        scope.select.$disabled = false;
                    }
                }
            })

            scope.$watch('select.disabled',function(newV,oldV){
                if(newV != oldV || (newV == oldV && newV != undefined)){
                    if(newV == 'true' || newV == 1 || newV == true){
                        scope.select.$disabled = true;
                    }else{
                        scope.select.$disabled = false;
                    }
                }
            })


            //初始化数据
            if(scope.width){
                if (scope.width == 'auto') {
                    element[0].style.width = 'auto';
                } else {
                    element[0].style.width = scope.width.indexOf('%') == -1 ? (scope.width + 'px') : (scope.width);
                }
            }
            // search   auto 自动 初始化需要提供list集合  hand 手动 初始化不需要提供list集合 但需要在输入回车回调函数初始化list集合 none 取消搜索框 (没有实现)

            //样式定义
            // var container = 'chosen-container';
            // var container_active = 'chosen-container-active';
            // var container_drop = 'chosen-with-drop';
            // var container_single = 'chosen-container-single';
            // var a_single = 'chosen-single';
            // var f_default = 'chosen-default';
            // var d_drop = 'chosen-drop';
            // var d_search = 'chosen-search';
            // var ul_results = 'chosen-results';
            // var li_active = 'active-result';
            // var li_selected = 'result-selected';
            // var li_hover = 'highlighted';

            //将保存的操作展现出来
            ~function viewSession() {
                if (!scope.key && !scope.value) return;
                if (!scope.session) return;
                var session = scope.session;
                var ob = window.sessionStorage.getItem(session);
                var reskey = scope.reskey;
                if (ob && (reskey == undefined || reskey.length == 0)) {
                    try {
                        ob = JSON.parse(ob);
                        var keys = scope.key.split(',');
                        var $value = scope.value.split(',');
                        for(var i = 0;i<keys.length;i++){
                            scope.query[$value[i]] = ob[keys[i]];
                        }
                        scope.select.placeholder = ob[scope.name];
                        scope.select.sessionBack && scope.select.sessionBack(ob);
                    } catch (e) {
                        console.error(e)
                    }
                }
            }();

            //添加内部html结构和样式表
            $animate.addClass(element, 'chosen-container chosen-container-single');
            element.append('<a class="chosen-single" ng-class="{\'chosen-default\':select.placeholder == undefined || select.placeholder == $$placeholder,\'chosen-single-disabled\':select.$disabled == true}"><span title="{{select.placeholder || placeholder}}">{{select.placeholder || placeholder}}</span><div><b></b></div></a>')
            element.append('<div class="chosen-drop"><div class="chosen-search"><input placeholder="{{inputHolder}}" ng-show="search != \'none\'" type="text" ng-model="select.$search" autocomplete="off" tabindex="5"> <span></span> </div><ul class="chosen-results"></ul></div>')

            var doc = element[0];
            var single = doc.querySelector('.chosen-single');
            var singleSpan = doc.querySelector('.chosen-single span');
            var drop = doc.querySelector('.chosen-drop');
            var search = doc.querySelector('.chosen-search');
            var input = doc.querySelector('.chosen-search input');
            var enterSpan = doc.querySelector('.chosen-search span');
            var results = doc.querySelector('.chosen-results');

            var $single = angular.element(single);
            var $input = angular.element(input);
            var $results = angular.element(results);
            var $drop = angular.element(drop);
            var $enterSpan = angular.element(enterSpan);
            //
            $results.append('<li ng-repeat="li in select.list track by $index"> <span class="active-result" ng-class="{\'result-selected\':select.$placeholder == li}" ng-style="{paddingLeft:setStylePadding(li)}" data-option-array-index="{{$index}}" data-index="{{$index}}" title="{{li[name]||li}}">{{li[name]||li}}</span></li>')
            $results.append('<li> <span data-index="-1" class="active-result" ng-if="search == \'hand\' && select.list.length == 0 && $alreadySearch" ng-bind="defaultSearch"></span> </li>');

            scope.setStylePadding = function (da) {
                var padding = 6;
                da = angular.copy(da);
                while (da.$$parent){
                    da = da.$$parent;
                    padding += 12
                }
                return padding + 'px'
            };

            //重新渲染
            $compile(element.contents())(scope);

            function viewPlaceholder() {
                var lists = scope.select.list;
                for (var i = 0; i < lists.length; i++) {
                    if (lists[i][scope.name] == scope.select.placeholder) {
                        scope.$placeholder = lists[i];
                    }
                }
            }

            scope.select.$destroy = function () {
                scope.select.$search = '';
                scope.select.list = [];
                scope.select.$list = {}; //搜索结果排除存放容器;
                scope.select.$placeholder = {}; //结果存放容器;
                scope.select.placeholder = scope.placeholder || '请选择内容';
                scope.$$placeholder = scope.placeholder || '请选择内容';

                var keys = scope.key.split(',');
                var $value = scope.value.split(',');
                for(var i = 0;i<keys.length;i++){
                    delete scope.query[$value[i]];
                }
                delSession();
            }

            // scope.select.setValue = function(vaule){
            //     scope.select.placeholder = vaule;
            // }

            // scope.select.$setValue = function(value){
            //     scope.select.placeholder = value;
            // }

            // scope.select.$setKey = function(key){

            //     var list = scope.select.list;
            //     if(list){
            //         for(var i = 0;i<list.length;i++){
            //             if(list[i][scope.key] == key){
            //                 scope.select.placeholder = list[i][scope.name];
            //                 break;
            //             }
            //         }
            //     }

            // }

            //键盘操作下拉框 下 40 上 38 回车 13 tab 9
            $input.on('keydown', function (e) {
                e.stopPropagation();
                var keyCode = e.keyCode;

                var doing = {
                    list: function () {
                        return $results.find('span');
                    },
                    have: function () {
                        var lis = this.list();
                        for (var i = 0, j = lis.length; i < j; i++) {
                            var li = lis[i];
                            if(li.classList.contains('highlighted')){
                                return i;
                            }
                        }
                        return -1;
                    },
                    '40': function () {
                        var i = this.have();
                        var lis = this.list();
                        if (!~i) {
                            angular.element(lis[0]) && lisAddLighted(angular.element(lis[0]));
                        } else {
                            if (lis[i + 1]) {
                                lisAddLighted(angular.element(lis[i + 1]));
                                lis[i + 1].scrollIntoView(false);
                            }
                        }
                    },
                    '38': function () {
                        var i = this.have();
                        var lis = this.list();
                        if (!~i) {
                            angular.element(lis[0]) && lisAddLighted(angular.element(lis[0]));
                        } else {
                            if (lis[i - 1]) {
                                lisAddLighted(angular.element(lis[i - 1]));
                                lis[i - 1].scrollIntoView(true);
                            }
                        }
                    },
                    '13': function () {
                        if(scope.search == 'hand'){
                            searchHand(scope.select.$search);
                        }else{
                            var i = this.have();
                            var lis = this.list();
                            if(lis[i]){
                                lis[i].click();
                            }else if(lis[0]){
                                lis[0].click();
                            }
                        }
                    },
                    '9': function () {
                        containerStatus(0);
                    }
                }
                doing[String(keyCode)] && doing[String(keyCode)]();
            })

            //功能已加上
            $enterSpan.on('click',function (e) {
                e.stopPropagation();
                e.preventDefault();
                var doing = {
                    list: function () {
                        return $results.find('span');
                    },
                    have: function () {
                        var lis = this.list();
                        for (var i = 0, j = lis.length; i < j; i++) {
                            var li = lis[i];
                            if(li.classList.contains('highlighted')){
                                return i;
                            }
                        }
                        return -1;
                    }
                }
                if(scope.search == 'hand'){
                    searchHand(scope.select.$search);
                }else{
                    var i = doing.have();
                    var lis = doing.list();
                    if(lis[i]){
                        lis[i].click();
                    }else if(lis[0]){
                        lis[0].click();
                    }
                }
            });

            //输入框失焦事件
            $input.on('blur', function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (scope.select.$isOnContainerTop) {
                    return;
                }
                if (!scope.select.$isOnContainer) { //不是在容器内操作直接关闭容器
                    containerStatus(0);
                }
            })

            //鼠标位置标识
            $drop.on('mouseover', function (e) {
                scope.select.$isOnContainer = true;
            })
            $drop.on('mouseout', function (e) {
                scope.select.$isOnContainer = false;
            })
            $single.on('mouseover', function (e) {
                scope.select.$isOnContainerTop = true;
            })
            $single.on('mouseout', function (e) {
                scope.select.$isOnContainerTop = false;
            })

            //保存操作 存在问题 是否需要同步query对象！
            function saveSession() {
                if (!scope.key && !scope.select.value) return;
                if (!scope.session) return;
                var session = scope.session;
                var ob = {};
                var keys = scope.key.split(',');
                var $value = scope.value.split(',');
                for(var i = 0;i<keys.length;i++){
                    ob[keys[i]] = scope.query[$value[i]];
                }
                // ob[scope.key] = scope.value;
                // ob[scope.key] = scope.query[scope.value];
                ob[scope.name] = scope.select.placeholder;
                window.sessionStorage.setItem(session, JSON.stringify(ob))
            }
            //移除操作记录
            function delSession() {
                if (!scope.key && !scope.value) return;
                if (!scope.session) return;
                var session = scope.session;
                window.sessionStorage.removeItem(session);
            }

            //发布订阅
            function release(data) {
                if (scope.group) {
                    scope.$emit(scope.group, data);
                }
            }

            //没有搜索框的时候也需要将
            // angular.element(document.body).on('click',function(){
            //     scope.$apply(function(){
            //         $animate.removeClass(element,'chosen-container-active chosen-with-drop')
            //     })
            // })


            //下拉框选择
            $results.on('click', function (e) {
                //需要清除分页session值
                window.sessionStorage.removeItem('session_page_index');

                e.stopPropagation();
                e.preventDefault();
                if (e.target.nodeName == 'SPAN') {
                    var index = e.target.getAttribute('data-index');
                    if(index == -1){return};
                    var value = scope.select.list[index];
                    var val = scope.select.list[index][scope.name] || scope.select.list[index];
                    scope.$apply(function () {
                        scope.select.placeholder = val;
                        scope.select.$placeholder = value;

                        // var key = scope.select.list[index][scope.key] || scope.select.list[index];
                        if(scope.key && scope.value){
                            //处理多个赋值
                            var keys = scope.key.split(',');
                            var $value = scope.value.split(',');
                            var haveKey = false;

                            for(var i = 0;i<keys.length;i++){
                                if(typeof value != "string"){
                                    if(value[keys[i]] == undefined){
                                        haveKey = true;;
                                    }
                                }
                            }

                            var reg = /(全部)|(无)/;
                            if(reg.test(val) || haveKey){
                                scope.select.placeholder = scope.$$placeholder;
                                scope.select.callback && scope.select.callback(e, undefined, scope.select.list ,index);
                                for(var i = 0;i<keys.length;i++){
                                    delete scope.query[$value[i]];
                                }
                                delSession();
                            }else{
                                //赋值
                                for(var i = 0;i<keys.length;i++){
                                    scope.query[$value[i]] = value[keys[i]];
                                }
                                scope.select.callback && scope.select.callback(e, value, scope.select.list ,index);
                                scope.callback && scope.callback();
                                saveSession();
                            }
                        }else{
                            scope.select.placeholder = scope.$$placeholder;
                            scope.select.callback && scope.select.callback(e, undefined, scope.select.list ,index);
                            delSession();
                        }
                    })
                    containerStatus(0);
                    release(value);
                }
            })

            function lisAddLighted(element) {
                //如果已经选择需要去除 highlighted 样式
                var lis = $results.find('span');
                for (var i = 0, j = lis.length; i < j; i++) {
                    var li = lis[i];
                    if(li.classList.contains('highlighted')){
                        lisRemLighted(angular.element(li))
                    }
                }
                scope.$apply(function () {
                    $animate.addClass(element, 'highlighted');
                })
            }

            function lisRemLighted(element) {
                scope.$apply(function () {
                    $animate.removeClass(element, 'highlighted');
                })
            }

            //鼠标标识列样式
            $results.on('mouseover', function (e) {
                if (e.target.nodeName == 'SPAN') {
                    lisAddLighted(angular.element(e.target))
                }
            })
            $results.on('mouseout', function (e) {
                if (e.target.nodeName == 'SPAN') {
                    lisRemLighted(angular.element(e.target))
                }
            })

            //控制下拉的开闭 0是关 1是开
            function containerStatus(status) {
                if (+status) {
                    var lis = $results.find('span');
                    var $li;
                    for (var i = 0, j = lis.length; i < j; i++) {
                        var li = lis[i];
                        if(li.classList.contains('result-selected')){
                            $li = angular.element(li);
                        }
                    }
                    if ($li) {
                        lisAddLighted($li)
                    }
                    input.select();
                    input.focus();
                    scope.$apply(function () {
                        $animate.addClass(element, 'chosen-container-active chosen-with-drop');
                        scope.select.$isContainerOpen = true;
                    })
                } else {
                    scope.$apply(function () {
                        $animate.removeClass(element, 'chosen-container-active chosen-with-drop');
                        scope.select.$isContainerOpen = false;
                        scope.$alreadySearch = false;
                    })
                }
            }
            //事件
            $single.on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (!scope.select.$isContainerOpen) {
                    switch (scope.search) {
                        case 'auto':
                            !scope.select.$disabled && (scope.select.list && scope.select.list.length > 0 || scope.select.$list && scope.select.$list.length > 0) && containerStatus(1);
                            break;
                        case 'hand':
                            !scope.select.$disabled && containerStatus(1);
                            break;
                    }

                } else {
                    containerStatus(0);
                }
            })

            // 自动 手动
            function searchHand(newV){
                scope.select.searchBlack && (scope.select.searchBlack(newV));
                newV && (scope.$alreadySearch = true);
            }
            function searchAuto(newV){
                var list = scope.select.list;
                if (!list) return;
                var $list = scope.select.$list;
                for (var a in $list) {
                    if(!isNaN(parseInt(a))){
                        list.splice(+a, 0, $list[a]);
                        delete $list[a];
                    }
                }
                var g = new RegExp('('+ newV +')', 'ig');
                var length = 0;
                for (var i = 0, j = list.length, l = list.length; i < j; i++) {
                    var name = list[i][scope.name];
                    if (name.indexOf(newV) == -1) {
                        $list[i + l - j] = list[i];
                        list.splice(i, 1);
                        ++length;
                        --j;
                        --i;
                    }
                }
                $list.length = length;
            }

            //搜索过滤
            scope.$watch('select.$search', function (newV, oldV, scope) {
                if (newV !== oldV) {
                    switch (scope.search) {
                        case 'auto':
                            searchAuto(newV);
                            break;
                    }
                }
            })
        }
    }
}])

/*兼容IE9的placeholder*/
app.directive('ngPlaceholder', ["$timeout", function ($timeout) {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var span;
            if (element.attr("ng-model")) {
                scope.$watch(attr.ngModel, function (newValue, oldValue) {
                    if (span) {
                        if (newValue) {
                            span.css("display", "none");
                        } else {
                            span.css("display", "block");
                        }
                    }
                });
            }
            if (!isSupportPlaceholder()) {
                var parent = element.parent();
                parent.css("position", "relative");
                span = document.createElement("span");
                span.style.position = "absolute";
                span.style.left = "5px";
                span.style.color = "#9f9f9f";
                span.style.display = "inlineBlock";
                span.style.lineHeight = "30px";
                span.style.width = "auto";
                span.style.display = "none";
                span.style.top = "0";
                span.innerHTML = attr.ngPlaceholder;
                parent.append(span);
                span = angular.element(span);

                if (element.val().length == 0) {
                    span.css("display", "block");
                }

                span.bind("click", function () {
                    span.css("display", "none");
                    element[0].focus();
                });

                element.bind('blur', function () {
                    if (element.val().length > 0) {
                        span.css("display", "none");
                    } else {
                        span.css({
                            "color": "#9f9f9f"
                        });
                        span.css("display", "block");
                    }
                });

                element.bind("input", function () {
                    if (element.val().length > 0) {
                        span.css("display", "none");
                    } else {
                        span.css({
                            "color": "#9f9f9f"
                        });
                        span.css("display", "block");
                    }
                });
            } else {
                $timeout(function () {
                    element.attr("placeholder", attr.ngPlaceholder);
                }, 20);
            }
        }
    };
}]);

//输出html filter;
app.filter('HtmlFtr', ['$sce', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input);
    };
}]);

//字符串截断
app.filter('WhiteSpaceFtr', [function ($) {
    return function (input, length) {
        if (input) {
            var len = input.length;
            var length = length || len;
            if (len > length) {
                return input.substr(0, length) + '...';
            }
        }
        return input;
    };
}]);

/*通用的 filter */
app.filter('dateYMD', function () {
    return function (input,format) {
        return input?new Date(input).dateFormat(format):'';
    };
});

/*通用的 filter */
app.filter('DateFormatFtr', function () {
    return function (input,format) {
        return input?new Date(input).dateFormat(format):'';
    };
});

// app.filter('orderTypeFtr', function () {
//     return function (input, type) {
//         switch (input) {
//             case -1:
//                 return "审核未通过";
//             case 0:
//                 return "审核中";
//             case 1:
//                 return "审核通过";
//             default:
//                 return "--";
//         }
//     };
// });

/**
 * 1=预定| 2=确定正式投放| 3=试用推广| 4=内部自用推广|5=补偿刊登
 */
app.filter("orderTypeFtr", function () {
    return function (input) {
        switch (input) {
            case 1:
                return "预定广告位";
            case 2:
                return "正式投放";
            case 3:
                return "试用推广";
            case 4:
                return "自用推广";
            case 5:
                return "补偿刊登";
            default:
                return "";
        }
    };
});

app.filter("scheduleTypeFtr", function () {
    return function (input) {
        switch (input) {
            case 0:
                return "正常购买";
            case 1:
                return "免费配送";
            case 2:
                return "自用";
            case 3:
                return "打包";
            default:
                return "";
        }
    };
});

app.filter("customerTypeFtr", function () {
    return function (input) {
        switch (input) {
            case 1:
                return "直客";
            case 2:
                return "代理商";
            case 3:
                return "代理子客户";
            default:
                return "";
        }
    };
});

app.filter("customerLevelFtr", function () {
    return function (input) {
        switch (input) {
            case 1:
                return "低";
            case 2:
                return "中";
            case 3:
                return "高";
            default:
                return "";
        }
    };
});

app.filter("defaultOrderCheckFtr", function () {
    return function (input, data) {
        if (data == -1) {
            return "--";
        }
        switch (input) {
            case -1:
                return "审核不通过";
            case 0:
                return "审核中";
            case 1:
                return "审核通过";
            default:
                return "--";
        }
    };
});

app.filter("toTwo", function () {
    return function (input) {
        if (isNaN(input) || (input == Infinity)) {
            return "0.00%";
        } else {
            return (input * 100).toFixed(2) + "%";
        }
    };
});

//广告位刊例价
app.filter("isDay", function () {
    return function (input) {
        switch (input) {
            case 1:
                return '天';
            case 2:
                return '月';
            case 3:
                return '小时';
            default:
                return "天"
        }
    }
})

//审核未通过=-1，总公司业务一级待审核=1，总公司业务二级待审核=2，分公司审核待核=3，分公司二级审核=4，审核通过=5
app.filter("checkStateFtr", function () {
    return function (input, data) {
        if (input == -1) {
            return '审核未通过';
        }
        if (input == 1) {
            return '审核通过';
        }
        if (data instanceof Array) {
            for (var i = 0; i < data.length; i++) {
                var da = data[i];
                if (da.checkStepState == 0 && da.state != -1) {
                    if (da.checkName == '分公司审核') {
                        return '分公司待审';
                    }
                    return da.checkName + '待审';
                }
            }
        }
        return '--';
    }
});
//<!--<!--0=待投放|1=投放中|2=已暂停|3=已完结|4=已撤销|5=已终止-->-->

app.filter("showStateFtr", function () {
    return function (input) {
        switch (input) {
            case 0:
                return '待投放';
            case 1:
                return '投放中';
            case 2:
                return '已暂停';
            case 3:
                return '已完结';
            case 4:
                return '已撤销';
            case 5:
                return '已终止';
            default:
                return "已终止"
        }
    }
});

app.filter("orderTypeValueFtr", function () {
    return function (input) {
        switch (input) {
            case 1:
                return '撤销';
            case 2:
                return '终止';
            default:
                return
        }
    }
});

app.filter("AdMarkTypeFtr", function () {
    return function (input) {
        switch (input) {
            case 1:
                return '客户广告';
            case 2:
                return '紧急广告';
            case 3:
                return '默认广告';
            case 4:
                return '打底广告';
            default:
                return ''
        }
    }
});

// + - * /
app.filter('MathFtr',function () {
    return function (input, str) {
        var math = str.substr(0,1);
        var num = str.substr(1);
        switch (math){
            case '+':
                return accAdd(input,num);
            case '-':
                return accSubtr(input,num);
            case '*':
                return accMul(input,num);
            case '/':
                return accDiv(input,num);
        }
    }
})

app.filter('MathFormatFtr',function () {
    return function (input,num,type) {
        return Math.format(Math.floor(input/num)*num,type)
    }
})

/**
 * 字典管理（城市 语言接口）
 */
app.factory("DictionaryFty", ["$http", function ($http) {
    var languageListApi = baseUrl + "/dic/languageList.htm";
    var cityListApi = baseUrl + "/dic/cityList.htm";
    var provinceListApi = baseUrl + "/dic/provinceList.htm";
    var provinceListForCompanyApi = baseUrl + "/dic/provinceListForCompany.htm";
    return {
        languageList: function () {
            return $http.get(languageListApi);
        },
        /* id */
        cityList: function (query) {
            return $http.post(cityListApi, query, configForm);
        },
        provinceList: function () {
            return $http.get(provinceListApi);
        },
        provinceListForCompany: function () {
            return $http.get(provinceListForCompanyApi);
        }
    };
}]);

/**
 * 订单管理 投放订单
 */
app.factory("OrdersFty", ["$http", function ($http) {
    var batchCheckApi = baseUrl + '/orders/batchCheck.htm';
    //接口1：分页搜索订单列表接口
    var ordersListApi = baseUrl + "/orders/list.htm";
    //接口2：获取订单的审核详情
    var orderCheckInfoApi = baseUrl + "/orders/checkInfo.htm";
    //接口3：更改订单的投放状态
    var changeShowStateApi = baseUrl + "/orders/changeShowState.htm";
    //接口4：添加订单接口 Content-Type: application/json
    var orderAddApi = baseUrl + "/orders/add.htm";
    //接口5：广告订单名称下拉列表接口
    var orderNameApi = baseUrl + "/orders/orderNames.htm";
    //接口6：订单对应的广告位下拉列表接口
    var adSpaceNamesByOrderApi = baseUrl + "/orderAdCreative/adSpaceNames.htm";
    //接口6.2：订单对应的尺寸下拉接口
    var adSpaceNamesBySizeApi = baseUrl + "/orderAdCreative/sizes.htm";
    //接口7：查看订单的详情
    var orderDetailApi = baseUrl + "/orders/getDetail.htm";
    //接口8：修改订单信息 Content-Type: application/json
    var orderUpdateApi = baseUrl + "/orders/update.htm";
    //接口9：订单审核
    var orderCheckApi = baseUrl + "/orders/checkOrder.htm";
    //接口10：订单创建时获取广告位来添加（列表数据）
    var getADSpacesForAddOrderApi = baseUrl + "/orders/getADSpacesForAddOrder.htm";
    //接口11：订单列表数据汇总接口
    var orderDataCountApi = baseUrl + "/orders/DataCount.htm";
    //接口13：显示订单对应的广告位占用信息接口
    var adSpaceUsedDetailApi = baseUrl + "/orders/adSpaceUsedDetail.htm";
    //接口12：合同附件上传文件服务器
    var contractUploadPDFApi = fileUrl + "/contract/uploadPDF.htm";
    //接口15：订单--创建和修改--广告位和投放档期与轮播上限的校验
    var judgeADShowDateUsableApi = baseUrl + "/orders/judgeADShowDateUsable.htm";
    //接口14：订单---合同号 --- 修改
    var updateContractCodeApi = baseUrl + "/orders/updateContractCode.htm";
    //接口16：订单---撤销/终止
    var orderCancelApi = baseUrl + '/orders/cancel.htm';
    //接口16：订单---撤销/终止
    var orderTerminateApi = baseUrl + '/orders/terminate.htm';
    //接口17：判断广告位是否已经产生数据
    var validDataApi = baseUrl + '/orders/validData.htm';
    //接口17：判断订单是否已经产生数据
    var validOrderDataApi = baseUrl + '/orders/validOrderData.htm';
    return {
        batchCheck: function (query) {
            return $http.post(batchCheckApi, query, configJson);
        },
        ordersList: function (query) {
            return $http.post(ordersListApi, query, configForm);
        },
        orderCheckInfo: function (query) {
            return $http.post(orderCheckInfoApi, query, configForm);
        },
        changeShowState: function (query) {
            return $http.post(changeShowStateApi, query, configForm);
        },
        adSpaceNamesByOrder: function (query) {
            return $http.post(adSpaceNamesByOrderApi, query, configForm);
        },
        adSpaceNamesBySize: function (query) {
            return $http.post(adSpaceNamesBySizeApi, query, configForm);
        },
        orderAdd: function (query) {
            return $http.post(orderAddApi, query, configJson);
        },
        orderDetail: function (query) {
            return $http.post(orderDetailApi, query, configForm);
        },
        orderUpdate: function (query) {
            return $http.post(orderUpdateApi, query, configJson);
        },
        orderCheck: function (query) {
            return $http.post(orderCheckApi, query, configForm);
        },
        getADSpacesForAddOrder: function (query) {
            return $http.post(getADSpacesForAddOrderApi, query, configForm);
        },
        orderDataCount: function (query) {
            return $http.post(orderDataCountApi, query, configForm);
        },
        adSpaceUsedDetail: function (query) {
            return $http.post(adSpaceUsedDetailApi, query, configForm);
        },
        orderName: function () {
            return $http.get(orderNameApi);
        },
        judgeADShowDateUsable: function (query) {
            return $http.post(judgeADShowDateUsableApi, query, configJson);
        },
        updateContractCode: function (query) {
            return $http.post(updateContractCodeApi, query, configJson);
        },
        orderCancel: function (query) {
            return $http.post(orderCancelApi, query, configForm);
        },
        orderTerminate: function (query) {
            return $http.post(orderTerminateApi, query, configForm);
        },
        validData: function (query) {
            return $http.post(validDataApi, query, configJson);
        },
        validOrderData: function (query) {
            return $http.post(validOrderDataApi, query, configJson);
        },
        contractUploadPDFApi: contractUploadPDFApi
    };
}]);

/**
 * 订单管理 排期管理
 */
app.factory("ScheduleFty", ["$http", function ($http) {
    //接口1：分页搜索排期接口
    var scheduleListApi = baseUrl + "/schedule/list.htm";
    //接口2 ：广告位排期详情接口
    var scheduleDetailApi = baseUrl + "/schedule/ordersDetail.htm";
    //接口3：排期查询 下拉列表数据获取
    var scheduleDownListApi = baseUrl + "/schedule/downList.htm";
    //接口4：添加广告位进订单
    var scheduleADToOrderApi = baseUrl + "/schedule/addADToOrder.htm";
    //广告位搜索下拉列表接口
    var dLInOrderApi = baseUrl + '/schedule/dLInOrder.htm';
    //获取节假日
    var getHolidaySetApi = baseUrl + '/holiday/getHolidaySet.htm';
    //设置节假日
    var initHolidaysApi = baseUrl + '/holiday/initHolidays.htm';

    return {
        scheduleList: function (query) {
            return $http.post(scheduleListApi, query, configForm);
        },
        scheduleDetail: function (query) {
            return $http.post(scheduleDetailApi, query, configForm);
        },
        scheduleDownList: function () {
            return $http.get(scheduleDownListApi);
        },
        scheduleADToOrder: function (query) {
            return $http.post(scheduleADToOrderApi, query, configForm);
        },
        dLInOrder: function () {
            return $http.get(dLInOrderApi);
        },
        getHolidaySet: function (query) {
            return $http.post(getHolidaySetApi, query, configForm);
        },
        initHolidays: function () {
            return $http.get(initHolidaysApi);
        }
    };
}]);

/**
 * 订单管理 默认订单创意管理
 */
app.factory("DefaultOrdersFty", ["$http", function ($http) {
    //接口9：默认订单创意的删除(单个和批量）
    var defaultAdCreativeEnableApi = baseUrl + "/defaultOrderAdCreative/enable.htm";
    //接口1：默认订单列表
    var defaultOrdersListApi = baseUrl + "/defaultOrders/list.htm";
    //接口2：添加订单（默认广告、优先广告） Content-Type:application/json
    var defaultOrdersAddApi = baseUrl + "/defaultOrders/add.htm";
    //接口3：获取默认订单信息
    var defaultOrdersDetailApi = baseUrl + "/defaultOrders/getOrder.htm";
    //接口4.1：获取默认订单的名称下拉 添加
    var defaultOrdersNameApi = baseUrl + "/defaultOrders/orderNamesForAdd.htm";
    //接口4.2：获取默认订单的名称下拉 添加
    var defaultOrdersNameSearchApi = baseUrl + "/defaultOrders/orderNamesForSearch.htm";
    //接口5：修改默认订单的信息 Content-Type:application/json
    var defaultOrdersUpdateApi = baseUrl + "/defaultOrders/updateOrder.htm";
    //接口6：创意分页搜索列表
    var defaultAdCreativeListApi = baseUrl + "/defaultOrderAdCreative/list.htm";
    //接口7：获取创意信息
    var defaultAdCreativeDetailApi = baseUrl + "/defaultOrderAdCreative/getAdCreative.htm";
    //接口8：获取默认订单创意的投放数据
    var defaultAdCreativeGetPVApi = baseUrl + "/defaultOrderAdCreative/getPV.htm";
    //接口9：默认订单创意的删除(单个和批量）
    var defaultAdCreativeDeleteApi = baseUrl + "/defaultOrderAdCreative/delete.htm";
    //接口10：默认订单的数据汇总
    var defaultOrderDataCountApi = baseUrl + "/defaultOrders/DataCount.htm";
    //接口11：默认订单的创意的数据汇总
    var defaultAdCreativeDataCountApi = baseUrl + "/defaultOrderAdCreative/DataCount.htm";
    //接口12：默认广告 创意的修改 contentType:application/json
    var defaultAdCreativeUpdateApi = baseUrl + "/defaultOrderAdCreative/update.htm";
    //接口13：紧急订单的审核
    var defaultOrderCheckApi = baseUrl + "/defaultOrders/checkEmergency.htm";
    //接口14：紧急创意的审核
    var checkEmergencyCheckApi = baseUrl + "/defaultOrderAdCreative/checkEmergency.htm";
    //接口2：根据默认广告订单ID加载对应的尺寸
    var defaultAdCreativeSizeListApi = baseUrl + "/defaultOrderAdCreative/getSizeList.htm";
    //接口4：默认广告创意参数的提交 ContentType: application/json
    var defaultAdCreativeAddApi = baseUrl + "/defaultOrderAdCreative/add.htm";
    //接口3：默认广告创意的上传
    var defaultAdCreativeUploadApi = fileUrl + "/defaultOrderAdCreative/upload.htm";
    //默认订单获取广告
    var getADspaceByDefaultOrderIdApi = baseUrl + '/ADSpace/getADspaceByDefaultOrderId.htm';
    //功能： 默认订单获取媒体
    var getMediaByOrderIdApi = baseUrl + '/orders/getMediaByOrderId.htm';
    //禁用启用默认订单
    var enableOrderApi = baseUrl + '/defaultOrders/enableOrder.htm';
    return {
        enableOrder:function(query){
            return $http.post(enableOrderApi,query,configForm);
        },
        getMediaByOrderId: function (query) {
            return $http.post(getMediaByOrderIdApi, query, configForm);
        },
        defaultOrdersList: function (query) {
            return $http.post(defaultOrdersListApi, query, configForm);
        },
        defaultOrdersAdd: function (query) {
            return $http.post(defaultOrdersAddApi, query, configJson);
        },
        defaultOrdersDetail: function (query) {
            return $http.post(defaultOrdersDetailApi, query, configForm);
        },
        defaultOrdersName: function (query) {
            return $http.post(defaultOrdersNameApi, query, configForm);
        },
        defaultOrdersNameSearch: function (query) {
            return $http.post(defaultOrdersNameSearchApi, query, configForm);
        },
        defaultOrdersUpdate: function (query) {
            return $http.post(defaultOrdersUpdateApi, query, configJson);
        },
        defaultAdCreativeList: function (query) {
            return $http.post(defaultAdCreativeListApi, query, configForm);
        },
        defaultAdCreativeDetail: function (query) {
            return $http.post(defaultAdCreativeDetailApi, query, configForm);
        },
        defaultAdCreativeGetPV: function (query) {
            return $http.post(defaultAdCreativeGetPVApi, query, configForm);
        },
        defaultAdCreativeEnable: function (query) {
            return $http.post(defaultAdCreativeEnableApi, query, configJson);
        },
        defaultAdCreativeDelete: function (query) {
            return $http.post(defaultAdCreativeDeleteApi, query, configJson);
        },
        defaultOrderDataCount: function (query) {
            return $http.post(defaultOrderDataCountApi, query, configForm);
        },
        defaultAdCreativeDataCount: function (query) {
            return $http.post(defaultAdCreativeDataCountApi, query, configForm);
        },
        defaultAdCreativeUpdate: function (query) {
            return $http.post(defaultAdCreativeUpdateApi, query, configJson);
        },
        defaultOrderCheck: function (query) {
            return $http.post(defaultOrderCheckApi, query, configForm);
        },
        checkEmergencyCheck: function (query) {
            return $http.post(checkEmergencyCheckApi, query, configForm);
        },
        defaultAdCreativeSizeList: function (query) {
            return $http.post(defaultAdCreativeSizeListApi, query, configForm);
        },
        defaultAdCreativeAdd: function (query) {
            return $http.post(defaultAdCreativeAddApi, query, configJson);
        },
        getADspaceByDefaultOrderId: function (query) {
            return $http.post(getADspaceByDefaultOrderIdApi, query, configForm);
        },
        defaultAdCreativeUploadApi: defaultAdCreativeUploadApi
    };
}]);

/**
 * 创意管理 监管
 */
app.factory('SuperviseFty', ['$http', function ($http) {
    var creativeApi = baseUrl + '/supervise/creative.htm'; //创意
    var materialApi = baseUrl + '/supervise/material.htm'; //素材
    var securityApi = baseUrl + '/supervise/security.htm'; //网络安全
    return {
        creative: function (query) {
            return $http.post(creativeApi, query, configJson);
        },
        material: function (query) {
            return $http.post(materialApi, query, configJson);
        },
        security: function (query) {
            return $http.post(securityApi, query, configJson);
        },
    }
}])

/**
 * 订单管理 创意管理
 */
app.factory("AdCreativeFty", ["$http", function ($http) {
    //获取角标url
    var getAdMarkApi = baseUrl + '/orderAdCreative/getAdMark.htm';
    //接口1：创意列表——分页搜索接口
    var adCreativeListApi = baseUrl + "/orderAdCreative/list.htm";
    //接口2：创意——修改 Content-Type: application/json
    var adCreativeUpdateApi = baseUrl + "/orderAdCreative/update.htm";
    //接口3：修改创意——投放状态
    var adCreativeUpStateApi = baseUrl + "/orderAdCreative/changeShowState.htm";
    //接口4：批量操作接口：删除（含单个）、暂停、投放 Content-Type: application/json
    var adCreativeBatchOptApi = baseUrl + "/orderAdCreative/batchOpt.htm";
    //接口5.2 接口5.1：广告订单名称下拉列表接口
    var adCreativeOrderNamesApi = baseUrl + "/orderAdCreative/orderNamesForAdd.htm";
    //接口5.1：广告订单名称下拉列表接口(创意列表搜索使用)
    var orderNamesForListApi = baseUrl + "/orderAdCreative/orderNamesForList.htm";
    //接口6.1：订单对应的广告位下拉列表接口
    var adSpaceNamesByOrderIdApi = baseUrl + "/orderAdCreative/adSpaceNames.htm";
    //接口6.2：订单对应的尺寸下拉接口
    var adSpaceSizesByOrderIdApi = baseUrl + "/orderAdCreative/sizes.htm";
    //接口7：审核创意
    var adCreativeCheckApi = baseUrl + "/orderAdCreative/checkAdCreative.htm";
    //接口9：创意素材参数提交接口 Content-Type: application/json
    var adCreativeUploadApi = baseUrl + "/orderAdCreative/upload.htm";
    //接口10：创意列表——数据汇总接口
    var adCreativeDataCountApi = baseUrl + "/orderAdCreative/DataCount.htm";
    //接口11：创意——审核详情获取接口
    var adCreativeCheckInfoApi = baseUrl + "/orderAdCreative/checkInfo.htm";
    //接口12：单个创意——详情获取接口
    var adCreativeInfoApi = baseUrl + "/orderAdCreative/getCreative.htm";

    //接口8：创意素材上传（单个文件）
    var adCreativeUploadFileApi = fileUrl + "/orderAdCreative/upload.htm";

    return {
        getAdMark: function (query) {
            return $http.post(getAdMarkApi, query, configForm);
        },
        adCreativeList: function (query) {
            return $http.post(adCreativeListApi, query, configForm);
        },
        adCreativeUpdate: function (query) {
            return $http.post(adCreativeUpdateApi, query, configJson);
        },
        adCreativeUpState: function (query) {
            return $http.post(adCreativeUpStateApi, query, configForm);
        },
        adCreativeBatchOpt: function (query) {
            return $http.post(adCreativeBatchOptApi, query, configJson);
        },
        adCreativeOrderNames: function () {
            return $http.get(adCreativeOrderNamesApi);
        },
        adSpaceNamesByOrderId: function (query) {
            return $http.post(adSpaceNamesByOrderIdApi, query, configForm);
        },
        adSpaceSizesByOrderId: function (query) {
            return $http.post(adSpaceSizesByOrderIdApi, query, configForm);
        },
        adCreativeCheck: function (query) {
            return $http.post(adCreativeCheckApi, query, configForm);
        },
        adCreativeUpload: function (query) {
            return $http.post(adCreativeUploadApi, query, configJson);
        },
        adCreativeDataCount: function (query) {
            return $http.post(adCreativeDataCountApi, query, configForm);
        },
        adCreativeCheckInfo: function (query) {
            return $http.post(adCreativeCheckInfoApi, query, configForm);
        },
        adCreativeInfo: function (query) {
            return $http.post(adCreativeInfoApi, query, configForm);
        },
        orderNamesForList: function () {
            return $http.get(orderNamesForListApi);
        },
        adCreativeUploadFileApi: adCreativeUploadFileApi
    };
}]);

/**
 * 订单管理 合同号管理
 *
 */
app.factory('ContractFty', ['$http', function ($http) {
    //修改合同号
    var updateContractsApi = baseUrl + '/contracts/updateContracts.htm';
    //合同号详情
    var findContractsApi = baseUrl + '/contracts/findContracts.htm';
    //添加合同号
    var addContractsApi = baseUrl + '/contracts/addContracts.htm';
    //合同号列表
    var listContractsApi = baseUrl + '/contracts/listContracts.htm';
    //根据合同号获取合同
    var getContractsByCodeApi = baseUrl + '/contracts/getContractsByCode.htm';
    return {
        updateContracts: function (query) {
            return $http.post(updateContractsApi, query, configForm);
        },
        findContracts: function (query) {
            return $http.post(findContractsApi, query, configForm);
        },
        addContracts: function (query) {
            return $http.post(addContractsApi, query, configForm);
        },
        listContracts: function (query) {
            return $http.post(listContractsApi, query, configForm);
        },
        getContractsByCode: function (query) {
            return $http.post(getContractsByCodeApi, query, configForm);
        }
    }
}]);

/**
 * 订单管理 内容管理
 *
 */
app.factory('ContentFty', ['$http', function ($http) {
    var contentAddApi = baseUrl + '/content/add.htm';
    var editCheckApi = baseUrl + '/content/check.htm'; //编辑内容 发布
    var editContentApi = baseUrl + '/content/editContent.htm'; //编辑内容 非发布
    var contentListApi = baseUrl + '/content/list.htm';
    var contentOneApi = baseUrl + '/content/getOne.htm';
    var ordersListApi = baseUrl + '/content/orders.htm';
    var contentDeleteApi = baseUrl + '/content/delete.htm';
    var mediaListApi = baseUrl + '/content/mediaList.htm';//获取媒体
    var getChannelsByMediaApi = baseUrl + '/channel/getChannelsByMedia.htm';//获取频道
    return {
        getChannelsByMedia: function (query) {
            return $http.post(getChannelsByMediaApi, query, configForm);
        },
        mediaList: function () {
            return $http.get(mediaListApi);
        },
        contentDelete: function (query) {
            return $http.post(contentDeleteApi, query, configJson);
        },
        ordersList: function (query) {
            return $http.post(ordersListApi, query, configForm);
        },
        contentAdd: function (query) {
            return $http.post(contentAddApi, query, configJson);
        },
        editCheck: function (query) {
            return $http.post(editCheckApi, query, configJson);
        },
        editContent: function (query) {
            return $http.post(editContentApi, query, configJson);
        },
        contentList: function (query) {
            return $http.post(contentListApi, query, configForm);
        },
        contentOne: function (query) {
            return $http.post(contentOneApi, query, configForm);
        }
    }
}]);

/**
 * 订单管理 流程管理
 */
app.factory('FlowFty', ['$http', function ($http) {
    var checkNamesApi = baseUrl + '/flow/checkNames.htm';
    var flowListApi = baseUrl + '/flow/list.htm';
    var flowTemplatesApi = baseUrl + '/flow/templates.htm';
    var flowsApi = baseUrl + '/flow/flows.htm'; //获取对应模板下的流程
    var flowsEditApi = baseUrl + '/flow/editFlows.htm';
    return {
        checkNames: function () {
            return $http.get(checkNamesApi);
        },
        flowList: function (query) {
            return $http.post(flowListApi, query, configForm);
        },
        flowTemplates: function () {
            return $http.get(flowTemplatesApi);
        },
        flows: function (query) {
            return $http.post(flowsApi, query, configForm);
        },
        flowsEdit: function (query) {
            return $http.post(flowsEditApi, query, configJson);
        }
    }
}])

/**
 * 资源管理 频道管理
 */
app.factory("ResChannelFty", ["$http", function ($http) {
    var mediaListForAddApi = baseUrl + '/channel/mediaListForAdd.htm';
    var mediaListForSeaApi = baseUrl + '/channel/mediaListForSea.htm';
    var getChannelsByMediaApi = baseUrl + '/channel/getChannelsByMedia.htm'; //媒体联动获取频道下拉
    var getChannelApi = baseUrl + "/channel/getChannel.htm"; //接口3
    //接口5： 频道列表分页展示和搜索接口
    var channelPageListApi = baseUrl + "/channel/pageList.htm";
    //接口7：添加频道
    var channelAddMediaApi = baseUrl + "/channel/addMediaChannel.htm";
    //接口6：批量修改频道级别
    var channelBatchUpdateLevelApi = baseUrl + "/channel/batchUpdateLevel.htm";
    //接口1：多行文本添加频道接口
    var channelAddApi = baseUrl + "/channel/add.htm";
    //接口2： 修改频道接口
    var channelUpdateApi = baseUrl + "/channel/update.htm";
    //接口4： 获取频道下拉列表接口
    var channelListApi = baseUrl + "/channel/list.htm";
    return {
        mediaListForAdd: function (query) {
            return $http.get(mediaListForAddApi);
        },
        mediaListForSea: function (query) {
            return $http.get(mediaListForSeaApi);
        },
        getChannelsByMedia: function (query) {
            return $http.post(getChannelsByMediaApi, query, configForm);
        },
        getChannel: function (query) {
            return $http.post(getChannelApi, query, configForm);
        },
        channelPageList: function (query) {
            return $http.post(channelPageListApi, query, configForm);
        },
        channelAddMedia: function (query) {
            return $http.post(channelAddMediaApi, query, configJson);
        },
        channelBatchUpdateLevel: function (query) {
            return $http.post(channelBatchUpdateLevelApi, query, configJson);
        },
        channelAdd: function (query) {
            return $http.post(channelAddApi, query, configJson);
        },
        channelUpdate: function (query) {
            return $http.post(channelUpdateApi, query, configForm);
        },
        channelList: function (query) {
            return $http.get(channelListApi);
        }
    };
}]);

app.factory("ResChannelLevelFty", ["$http", function ($http) {
    var channelLevelAddApi = baseUrl + '/channelLevel/add.htm';
    var channelLevelEditApi = baseUrl + '/channelLevel/update.htm';
    var channelLevelOneApi = baseUrl + '/channelLevel/one.htm';
    var channelLevelListApi = baseUrl + '/channelLevel/pdList.htm';
    var channelLevelPageListApi = baseUrl + '/channelLevel/list.htm';
    return {
        channelLevelAdd:function(query){
            return $http.post(channelLevelAddApi, query, configJson);
        },
        channelLevelEdit:function(query){
            return $http.post(channelLevelEditApi, query, configJson);
        },
        channelLevelOne:function(query){
            return $http.post(channelLevelOneApi, query, configForm);
        },
        channelLevelList:function(query){
            return $http.post(channelLevelListApi, query, configForm);
        },
        channelLevelPageList:function(query){
            return $http.post(channelLevelPageListApi, query, configForm);
        }
    }

}])

/**
 * 资源管理 媒体管理
 */
app.factory("ResMediaFty", ["$http", function ($http) {
    var listForDefautOrderApi = baseUrl + '/media/listForDefautOrder.htm';
    var mediaListInComApi = baseUrl + '/media/listInCom.htm';//根据公司ID获取媒体
    //媒体批量添加提交接口
    var mediaAddApi = baseUrl + "/media/add.htm";
    //接口2：修改媒体信息接口
    var mediaUpdateApi = baseUrl + "/media/update.htm";
    //接口4： 获取媒体下拉列表接口
    var mediaListApi = baseUrl + "/media/list.htm";
    //接口5：媒体分页列表展示和搜索接口
    var mediaPageListApi = baseUrl + "/media/pageList.htm";
    //接口3： 获取单个媒体信息接口
    var getMediaApi = baseUrl + '/media/getMedia.htm';
    //获取公司下拉（媒体所属公司）
    var companyListApi = baseUrl + "/media/companyList.htm";
    //默认订单添加，媒体下拉列表
    var listForOrderApi = baseUrl + "/media/listForOrder.htm";
    //通过媒体ID获取页面（刊例）
    var downListByMIdApi = baseUrl + '/periodication/downListByMId.htm';
    return {
        listForDefautOrder:function(query){
            return $http.get(listForDefautOrderApi)
        },
        mediaListInCom:function(query){
            return $http.post(mediaListInComApi,query,configForm)
        },
        mediaAdd: function (query) {
            return $http.post(mediaAddApi, query, configJson);
        },
        mediaUpdate: function (query) {
            return $http.post(mediaUpdateApi, query, configForm);
        },
        mediaList: function (query) {
            return $http.post(mediaListApi, query, configForm);
        },
        mediaPageList: function (query) {
            return $http.post(mediaPageListApi, query, configForm);
        },
        getMedia: function (query) {
            return $http.post(getMediaApi, query, configForm);
        },
        companyList: function () {
            return $http.get(companyListApi);
        },
        listForOrder: function () {
            return $http.get(listForOrderApi);
        },
        downListByMIdA: function (query) {
            return $http.post(downListByMIdApi, query, configForm);
        }
    };
}]);

/**
 * 资源管理 广告位管理
 */
app.factory("ResAdvertisingFty", ["$http", function ($http) {
    //打底广告--更新
    var upDefaultUrlApi = baseUrl + '/ADSpace/upDefaultUrl.htm';
    //接口1：添加广告位
    var aDSpaceAddApi = baseUrl + "/ADSpace/add.htm";
    //接口2：获取广告位信息（修改广告位信息专用）
    var aDSpaceDetailApi = baseUrl + "/ADSpace/getADSpace.htm";
    //接口3：修改广告位信息
    var aDSpaceUpdateApi = baseUrl + "/ADSpace/update.htm";
    //接口8：广告位添加下拉列表获取接口
    var aDSpaceDownListForAddApi = baseUrl + "/ADSpace/downListForAdd.htm";
    //接口13：获取媒体对应的频道
    var getChannelsApi = baseUrl + "/channel/getChannels.htm";
    //接口6： 广告位分页列表展示及搜索接口
    var ADSpaceListApi = baseUrl + "/ADSpace/pageList.htm";
    //接口7：媒体、频道、创意类型下拉接口
    var downListForSearchApi = baseUrl + "/ADSpace/downListForSearch.htm";
    //
    var getJSCodeApi = baseUrl + "/ADSpace/getJSCode.htm";
    //
    var checkADSpaceApi = baseUrl + "/ADSpace/checkADSpace.htm";
    //接口12： 刊例价--编辑
    var updatePriceApi = baseUrl + "/ADSpace/updatePrice.htm";
    //接口13：刊例价--编辑记录
    var getPriceRecordApi = baseUrl + '/ADSpace/getPriceRecord.htm';
    //禁用
    var removeApi = baseUrl + '/ADSpace/remove.htm';
    //启用
    var reStartApi = baseUrl + '/ADSpace/reStart.htm';
    return {
        upDefaultUrl:function (query) {
            return $http.post(upDefaultUrlApi, query, configJson);
        },
        ADSpaceList: function (query) {
            return $http.post(ADSpaceListApi, query, configForm);
        },
        aDSpaceAdd: function (query) {
            return $http.post(aDSpaceAddApi, query, configForm);
        },
        aDSpaceDownListForAdd: function () {
            return $http.get(aDSpaceDownListForAddApi);
        },
        getChannels: function (query) {
            return $http.post(getChannelsApi, query, configForm);
        },
        aDSpaceUpdate: function (query) {
            return $http.post(aDSpaceUpdateApi, query, configForm);
        },
        aDSpaceDetail: function (query) {
            return $http.post(aDSpaceDetailApi, query, configForm);
        },
        downListForSearch: function () {
            return $http.get(downListForSearchApi);
        },
        getJSCode: function (query) {
            return $http.post(getJSCodeApi, query, configJson);
        },
        checkADSpace: function (query) {
            return $http.post(checkADSpaceApi, query, configForm);
        },
        updatePrice: function (query) {
            return $http.post(updatePriceApi, query, configForm);
        },
        getPriceRecord: function (query) {
            return $http.post(getPriceRecordApi, query, configForm);
        },
        remove: function (query) {
            return $http.post(removeApi, query, configForm);
        },
        reStart: function (query) {
            return $http.post(reStartApi, query, configForm);
        }
    };
}]);

/**
 * 资源管理 创意管理
 */
app.factory("ResCreativityFty", ["$http", function ($http) {
    var ADSpaceTypeApi = baseUrl + "/ADSpaceType/list.htm"; //接口4：获取创意下拉列表
    //接口5：创意分页展示列表和搜索接口
    var adSpacePageListApi = baseUrl + "/ADSpaceType/pageList.htm";
    var getADTypeApi = baseUrl + '/ADSpaceType/getADType.htm';
    var updateApi = baseUrl + '/ADSpaceType/update.htm';

    return {
        aDSpaceType: function () {
            return $http.get(ADSpaceTypeApi);
        },
        adSpacePageList: function (query) {
            return $http.post(adSpacePageListApi, query, configForm);
        },
        getADType:function(query){
            return $http.post(getADTypeApi,query, configForm);
        },
        update:function(query){
            return $http.post(updateApi,query, configForm);
        }
    };
}]);

/**
 * 资源管理 尺寸管理
 */
app.factory("ResSizeFty", ["$http", function ($http) {
    var sizeAllNameApi = baseUrl + "/size/list.htm";
    var sizePageListApi = baseUrl + "/size//pageList.htm";
    var addSizeApi = baseUrl + '/size/add.htm';
    var getSizeApi = baseUrl + '/size/getSize.htm';
    var updateSizeApi = baseUrl + '/size/update.htm';
    return {
        sizeAllName: function () {
            return $http.get(sizeAllNameApi);
        },
        sizePageList: function (query) {
            return $http.post(sizePageListApi, query, configForm);
        },
        addSize:function(query){
            return $http.post(addSizeApi, query, configJson);
        },
        getSize:function(query){
            return $http.post(getSizeApi, query, configForm);
        },
        updateSize:function(query){
            return $http.post(updateSizeApi, query, configForm);
        }
    };
}]);

/**
 * 客户管理 客户
 */
app.factory("CustomerFty", ["$http", function ($http) {
    var getCustomerInOrderApi = baseUrl + '/customer/getCustomerInOrder.htm';//获取客户  无权限
    //获取指定类型以外的客户
    var getPartCustomerApi = baseUrl + "/customer/getPartCustomer.htm";
    //获取所有客户
    var getAllCustomerApi = baseUrl + "/customer/getAllCustomer.htm";
    //查看客户
    var getCustomerApi = baseUrl + "/customer/getCustomer.htm";
    //列表
    var listCustomerApi = baseUrl + "/customer/listCustomer.htm";
    //添加客户
    var addCustomerApi = baseUrl + "/customer/addCustomer.htm";
    //修改客户
    var updateCustomerApi = baseUrl + "/customer/updateCustomer.htm";
    //审核客户
    var reviewCustomerApi = baseUrl + '/customer/ReviewCustomer.htm';
    //获取客户下的联系人
    var getCustomerContactsApi = baseUrl + "/customer/getCustomerContacts.htm";
    //获取业务员列表
    var getCustomerFlowUserApi = baseUrl + "/customer/getCustomerFlowUser.htm";
    return {
        getCustomerInOrder:function(query){
            return $http.post(getCustomerInOrderApi,query,configForm);
        },
        getPartCustomer: function (query) {
            return $http.post(getPartCustomerApi, query, configForm);
        },
        getAllCustomer: function (query) {
            return $http.post(getAllCustomerApi, query, configForm);
        },
        getCustomer: function (query) {
            return $http.post(getCustomerApi, query, configForm);
        },
        listCustomer: function (query) {
            return $http.post(listCustomerApi, query, configForm);
        },
        addCustomer: function (query) {
            return $http.post(addCustomerApi, query, configJson);
        },
        updateCustomer: function (query) {
            return $http.post(updateCustomerApi, query, configJson);
        },
        reviewCustomer: function (query) {
            return $http.post(reviewCustomerApi, query, configJson);
        },
        getCustomerContacts: function (query) {
            return $http.post(getCustomerContactsApi, query, configForm);
        },
        getCustomerFlowUser: function (query) {
            return $http.post(getCustomerFlowUserApi, query, configForm);
        }
    };
}]);
/**
 * 客户管理 资质
 */
app.factory("QualificationFty", ["$http", function ($http) {
    //获取资质列表
    var findQualificationsUrl = baseUrl + "/qualifications/findQualifications.htm";
    //添加资质
    var addQualificationsUrl = baseUrl + "/qualifications/addQualifications.htm";
    //获取二级行业
    var secondLevelIndustryUrl = baseUrl + "/industry/secondLevelIndustry.htm";
    //修改资质
    var updateQualificationsUrl = baseUrl + "/qualifications/updateQualifications.htm";
    //获取客服下的资质
    var findCustomerQualificationsUrl = baseUrl + "/qualifications/findCustomerQualifications.htm";
    //查询行业
    var firstLevelIndustryUrl = baseUrl + "/industry/firstLevelIndustry.htm";
    //条件展示资质列表
    var listQualificationsUrl = baseUrl + "/qualifications/listQualifications.htm";
    //删除资质
    var deleteQualificationsUrl = baseUrl + "/qualifications/deleteQualifications.htm";
    return {
        findQualifications: function (query) {
            return $http.post(findQualificationsUrl, query, configForm);
        },
        addQualifications: function (query) {
            return $http.post(addQualificationsUrl, query, configJson);
        },
        secondLevelIndustry: function (query) {
            return $http.post(secondLevelIndustryUrl, query, configForm);
        },
        updateQualifications: function (query) {
            return $http.post(updateQualificationsUrl, query, configForm);
        },
        findCustomerQualifications: function (query) {
            return $http.post(findCustomerQualificationsUrl, query, configForm);
        },
        firstLevelIndustry: function () {
            return $http.get(firstLevelIndustryUrl);
        },
        listQualifications: function (query) {
            return $http.post(listQualificationsUrl, query, configForm);
        },
        deleteQualifications: function (query) {
            return $http.post(deleteQualificationsUrl, query, configForm);
        }

    };

}]);

/**
 * 系统管理 公司管理
 */
app.factory('SysCompanyFty', ["$http", function ($http) {
    var companyAddApi = baseUrl + "/company/add.htm";
    var companyEditInfoApi = baseUrl + "/company/getEditCompanyInfo.htm";
    var companyEditApi = baseUrl + "/company/edit.htm";
    var companyPageListApi = baseUrl + "/company/pageList.htm";
    //接口5：获取公司下拉列表--全部，无权限控制
    var companyListApi = baseUrl + "/company/list.htm";

    return {
        companyAdd: function (query) {
            return $http.post(companyAddApi, query, configForm);
        },
        companyEditInfo: function (query) {
            return $http.post(companyEditInfoApi, query, configForm);
        },
        companyEdit: function (query) {
            return $http.post(companyEditApi, query, configForm);
        },
        companyPageList: function (query) {
            return $http.post(companyPageListApi, query, configForm);
        },
        companyList: function (query) {
            return $http.post(companyListApi, query, configForm);
        }
    };
}]);

app.factory('SysDepartmentFty', ["$http", function ($http) {
    var departmentListApi = baseUrl + "/department/list.htm";
    var departmentPageListApi = baseUrl + "/department/pageList.htm";
    var departmentEditInfoApi = baseUrl + "/department/getEditDepartmentInfo.htm";
    var departmentEditApi = baseUrl + "/department/edit.htm";
    var departmentAddApi = baseUrl + "/department/add.htm";
    var departmentListForDepApi = baseUrl + "/department/getCompanyListForDep.htm";
    var getCompanyApi = baseUrl + "/department/getCompany.htm";
    var parentDepsApi = baseUrl + '/department/parentDeps.htm';
    return {
        departmentList: function () {
            return $http.get(departmentListApi);
        },
        departmentPageList: function (query) {
            return $http.post(departmentPageListApi, query, configForm);
        },
        departmentEditInfo: function (query) {
            return $http.post(departmentEditInfoApi, query, configForm);
        },
        departmentEdit: function (query) {
            return $http.post(departmentEditApi, query, configJson);
        },
        departmentAdd: function (query) {
            return $http.post(departmentAddApi, query, configJson);
        },
        departmentListForDep: function () {
            return $http.get(departmentListForDepApi);
        },
        getCompany: function () {
            return $http.get(getCompanyApi);
        },
        parentDeps:function(query){//companyId
            return $http.post(parentDepsApi,query,configForm);
        }
    };
}]);
/**
 * 系统管理 用户登陆管理
 */
app.factory("SysLoginUserFty", ["$http", function ($http) {
    var loginUserInfoApi = baseUrl + "/system/getLoginUser.htm";
    var loginApi = baseUrl + "/system/login.htm";
    var loginOutApi = baseUrl + "/system/loginOut.htm";
    return {
        loginUserInfo: function () {
            return $http.get(loginUserInfoApi);
        },
        login: function (query) {
            return $http.post(loginApi, query, configJson);
        },
        loginOut: function () {
            return $http.get(loginOutApi);
        }
    };
}]);

/**
 * 系统管理 角色管理
 */
app.factory("SysRoleFty", ["$http", function ($http) {
    var enableRoleApi = baseUrl + '/role/enableRole.htm';
    //获取角色信息
    var getRoleApi = baseUrl + '/role/getRole.htm';
    //新增角色
    var addRoleApi = baseUrl + '/role/addRole.htm';
    //修改角色
    var updateRoleApi = baseUrl + '/role/updateRole.htm';
    return {
        enableRole:function (query) {
            return $http.post(enableRoleApi, query, configForm);
        },
        getRole: function (query) {
            return $http.post(getRoleApi, query, configForm);
        },
        addRole: function (query) {
            return $http.post(addRoleApi, query, configForm);
        },
        updateRole: function (query) {
            return $http.post(updateRoleApi, query, configForm);
        }
    }
}])

/**
 * 系统管理 权限管理
 */
app.factory("SysRuleUserFty", ["$http", function ($http) {
    var getUserRightsApi = baseUrl + '/rights/getUserRights.htm';//获取用户菜单下的权限信息
    var rightsByFirstMenuApi = baseUrl + "/rights/rightsByFirstMenu.htm"; //获取用户菜单权限信息
    var ruleByParentIdApi = baseUrl + "/rights/getUserRightsByParentId.htm"; //根据父级获取子级权限信息
    var listRoleApi = baseUrl + "/role/listRole.htm";
    var rightsRuleAddApi = baseUrl + "/rights/addRights.htm";
    var rightsRuleEditApi = baseUrl + "/rights/Edit.htm";
    //分级获取所有权限
    var levelsRightsApi = baseUrl + '/rights/levelsRights.htm';
    return {
        getUserRights:function(){
            return $http.get(getUserRightsApi);
        },
        rightsByFirstMenu: function () {
            return $http.get(rightsByFirstMenuApi);
        },
        getUserRightsByParentId: function (query) {
            return $http.post(ruleByParentIdApi, query, configForm);
        },
        listRole: function (query) {
            return $http.post(listRoleApi, query, configForm);
        },
        rightsRuleAdd: function (query) {
            return $http.post(rightsRuleAddApi, query, configForm);
        },
        rightsRuleEdit: function (query) {
            return $http.post(rightsRuleEditApi, query, configForm);
        },
        levelsRights: function () {
            return $http.get(levelsRightsApi);
        }
    };
}]);

/**
 * 系统管理 用户管理
 */
app.factory("SysUserFty", ["$http", function ($http) {
    var roleListAllApi = baseUrl + '/user/roleListAll.htm';
    var reStartApi = baseUrl + '/user/reStart.htm'; //启用用户
    var deleteApi = baseUrl + '/user/delete.htm'; //禁用用户
    var getCheckOrdersCountApi = baseUrl + "/orders/getCheckOrdersCount.htm"; //获取没有审核的订单数量;
    //初始化密码
    var initPwdApi = baseUrl + '/user/initPwd.htm';
    //接口7.1：原密码输入验证接口
    var validPwdApi = baseUrl + "/user/validPwd.htm";
    //接口7：密码修改接口
    var updatePwdApi = baseUrl + "/user/updatePwd.htm";
    //接口4：获取要编辑的用户的信息
    var userInfoApi = baseUrl + "/user/getEditUserInfo.htm";
    //用户列表数据 分页查询接口
    var userListApi = baseUrl + "/user/list.htm";
    //接口10：根据所选公司获取一级部门和上级领导人员
    var depAndUserListApi = baseUrl + "/user/depAndUserList.htm";
    //接口9：用户添加公司、角色选择列表获取
    var paramListApi = baseUrl + "/user/paramList.htm";
    //接口9-2：用户搜索--公司、角色选择列表获取
    var paramListForSearchApi = baseUrl + '/user/paramListForSearch.htm';
    //用户修改
    var userEditApi = baseUrl + "/user/edit.htm";
    //用户添加
    var userAddApi = baseUrl + '/user/add.htm';
    //接口4：获取要编辑的用户的信息
    var getEditUserInfoApi = baseUrl + "/user/getEditUserInfo.htm";
    //根据公司获取权限列表
    var roleListByComApi = baseUrl + '/user/roleListByCom.htm';
    return {
        roleListAll:function () {
           return $http.get(roleListAllApi);
        },
        reStart: function (query) {
            return $http.post(reStartApi, query, configForm);
        },
        delete: function (query) {
            return $http.post(deleteApi, query, configForm);
        },
        getCheckOrdersCount: function () {
            return $http.get(getCheckOrdersCountApi);
        },
        initPwd: function (query) {
            return $http.post(initPwdApi, query, configJson);
        },
        validPwd: function (query) {
            return $http.post(validPwdApi, query, configForm);
        },
        updatePwd: function (query) {
            return $http.post(updatePwdApi, query, configForm);
        },
        userInfo: function (query) {
            return $http.post(userInfoApi, query, configForm);
        },
        userList: function (query) {
            return $http.post(userListApi, query, configForm);
        },
        depAndUserList: function (query) {
            return $http.post(depAndUserListApi, query, configForm);
        },
        paramList: function () {
            return $http.get(paramListApi);
        },
        userEdit: function (query) {
            return $http.post(userEditApi, query, configJson);
        },
        userAdd: function (query) {
            return $http.post(userAddApi, query, configJson);
        },
        getEditUserInfo: function (query) {
            return $http.post(getEditUserInfoApi, query, configForm);
        },
        paramListForSearch: function () {
            return $http.get(paramListForSearchApi);
        },
        roleListByCom: function (query) {
            return $http.post(roleListByComApi, query, configForm);
        }
    };
}]);

/**
 * 系统管理 公告管理
 */
app.factory("SysNoticeFty", ["$http", function ($http) {
    var viewUserAllNoticeApi = baseUrl + '/notice/viewUserAllNotice.htm';//查看用户所有公告
    var viewNoticeApi = baseUrl + '/notice/viewNotice.htm';//查看已读/未读公告
    var viewAllNoticeApi = baseUrl + "/notice/viewAllNotice.htm";
    var noticeListApi = baseUrl + "/notice/listNotice.htm";
    var removeNoticeApi = baseUrl + '/notice/removeNotice.htm';
    var addNoticeApi = baseUrl + '/notice/addNotice.htm';
    var editApi = baseUrl + '/notice/Edit.htm';
    var updateNoticeApi = baseUrl + '/notice/updateNotice.htm';
    var noticeReadApi = baseUrl + '/notice/read.htm';
    var enableNoticeApi = baseUrl + '/notice/enableNotice.htm';
    return {
        viewUserAllNotice:function(query){
            return $http.post(viewUserAllNoticeApi, query, configForm);
        },
        viewNotice:function(query){
            return $http.post(viewNoticeApi, query, configForm);
        },
        enableNotice: function (query) {
            return $http.post(enableNoticeApi, query, configForm);
        },
        noticeRead: function (query) {
            return $http.post(noticeReadApi, query, configForm);
        },
        viewAllNotice: function (query) {
            return $http.post(viewAllNoticeApi, query, configForm);
        },
        noticeList: function (query) {
            return $http.post(noticeListApi, query, configForm);
        },
        removeNotice: function (query) {
            return $http.post(removeNoticeApi, query, configForm);
        },
        addNotice: function (query) {
            return $http.post(addNoticeApi, query, configForm);
        },
        edit: function (query) {
            return $http.post(editApi, query, configForm);
        },
        updateNotice: function (query) {
            return $http.post(updateNoticeApi, query, configForm);
        }
    };
}]);
/***
 * 系统管理  日志管理
 */
app.factory("SysLogFty", ["$http", function ($http) {
    var operationLosListApi = baseUrl + "/log/listOperationLogs.htm",
        errorLogListApi = baseUrl + "/log/listErrorLogs.htm";
    return {
        operationLogList: function (query) {
            return $http.post(operationLosListApi, query, configForm)
        },
        errorLogList: function (query) {
            return $http.post(errorLogListApi, query, configForm)
        }
    }
}]);
/***
 * 系统管理  容错率管理
 */
app.factory("SysContractTolerantFty", ["$http", function ($http) {
    var contractTolerantCurrentApi = baseUrl + "/contractTolerant/current.htm",
        contractTolerantListApi = baseUrl + "/contractTolerant/pageList.htm",
        addContractTolerantApi = baseUrl + "/contractTolerant/addContractTolerant.htm";
    return {
        contractTolerantCurrent: function () {
            return $http.get(contractTolerantCurrentApi)
        },
        contractTolerantList: function (query) {
            return $http.post(contractTolerantListApi, query, configForm)
        },
        contractTolerantAdd: function (query) {
            return $http.post(addContractTolerantApi, query, configForm)
        }
    }
}]);

/***
 * 系统管理 角标管理
 */
app.factory("SysMarkFty", ["$http", function ($http) {
    var addAdMarkApi = baseUrl + '/AdMark/addAdMark.htm'; //添加
    var adMarkListApi = baseUrl + '/AdMark/adMarkList.htm'; //列表
    var getAdMarkApi = baseUrl + '/AdMark/getAdMark.htm';
    var updateAdMarkApi = baseUrl + '/AdMark/updateAdMark.htm';
    var deleteAdMarkApi = baseUrl + '/AdMark/deleteAdMark.htm';
    var enableAdMarkApi = baseUrl + '/AdMark/enableAdMark.htm';
    var adMarkSelectApi = baseUrl + '/AdMark/select.htm';
    return {
        adMarkSelect: function (query) {
            return $http.post(adMarkSelectApi,query,configForm);
        },
        enableAdMark: function (query) {
            return $http.post(enableAdMarkApi, query, configForm);
        },
        deleteAdMark: function (query) {
            return $http.post(deleteAdMarkApi, query, configForm);
        },
        addAdMark: function (query) {
            return $http.post(addAdMarkApi, query, configForm);
        },
        adMarkList: function (query) {
            return $http.post(adMarkListApi, query, configForm);
        },
        getAdMark: function (query) {
            return $http.post(getAdMarkApi, query, configForm);
        },
        updateAdMark: function (query) {
            return $http.post(updateAdMarkApi, query, configForm);
        }
    }
}]);

/***
 * 系统管理 特效管理
 */
app.factory('SysSpecialFty', ['$http', function ($http) {
    /**
     * SpecialEffectsName
     * specialEffectsUrl
     * rmark
     * @type {string}
     */
    var specialAddUrl = baseUrl + '/SpecialEffects/add.htm';
    var specialUpdateUrl = baseUrl + '/SpecialEffects/update.htm';
    var getSpecialApi = baseUrl + '/SpecialEffects/get.htm';
    var specialListUrl = baseUrl + '/SpecialEffects/list.htm';
    var specialDelete = baseUrl + '/SpecialEffects/delete.htm';
    var specialSelectApi = baseUrl + '/SpecialEffects/select.htm';
    return {
        specialSelect: function () {
            return $http.get(specialSelectApi);
        },
        specialAdd: function (query) {
            return $http.post(specialAddUrl, query, configForm);
        },
        specialUpdate: function (query) {
            return $http.post(specialUpdateUrl, query, configForm);
        },
        getSpecial: function (query) {
            return $http.post(getSpecialApi, query, configForm);
        },
        specialList: function (query) {
            return $http.post(specialListUrl, query, configForm);
        },
        specialDelete: function (query) {
            return $http.post(specialDelete, query, configForm);
        }
    }

}])

/***
 * 系统管理 系统监控
 */
app.factory('SysMonitorFty', ['$http', function ($http) {
    var monitorAddApi = baseUrl + '/monitorType/add.htm';
    var getMonitorApi = baseUrl + '/monitorType/get.htm';
    var monitorUpdateApi = baseUrl + '/monitorType/update.htm';
    var monitorListApi = baseUrl + '/monitorType/list.htm';
    var monitorStateApi = baseUrl + '/monitorType/changeState.htm';
    var monitorDelApi = baseUrl + '/monitorType/delete.htm';
    var monitorDetailsListApi = baseUrl + '/monitorDetails/list.htm';
    return {
        monitorDetailsList: function (query) {
            return $http.post(monitorDetailsListApi, query, configForm);
        },
        monitorAdd: function (query) {
            return $http.post(monitorAddApi, query, configForm);
        },
        getMonitor: function (query) {
            return $http.post(getMonitorApi, query, configForm);
        },
        monitorUpdate: function (query) {
            return $http.post(monitorUpdateApi, query, configForm);
        },
        monitorList: function (query) {
            return $http.post(monitorListApi, query, configForm);
        },
        monitorState: function (query) {
            return $http.post(monitorStateApi, query, configForm);
        },
        monitorDel: function (query) {
            return $http.post(monitorDelApi, query, configForm);
        }
    }

}]);

/***
 * 系统管理 文档管理
 */
app.factory('SysDocumentFty', ['$http', function ($http) {
    var documentListApi = baseUrl + '/document/list.htm';//文档地址
    var documentAddApi = baseUrl + '/document/add.htm';
    var documentDelApi = baseUrl + '/document/delete.htm';
    return {
        documentList:function(query){
            return $http.post(documentListApi, query, configForm);
        },
        documentAdd: function (query) {
            return $http.post(documentAddApi, query, configForm);
        },
        documentDel: function (query) {
            return $http.post(documentDelApi, query, configForm);
        }
    }

}]);

/**
 * 报表管理 频道印象报表
 */
app.factory('ImpressionFty', ['$http', function ($http) {
    var osReportApi = baseUrl + '/channelReport/osReport.htm'; //startTime 查询开始时间 endTime 查询截止时间 param1 操作系统名称 paramInt1 媒体Id paramInt2 频道ID
    var collectOSReportApi = baseUrl + '/channelReport/collectOSReport.htm';
    var browserReportApi = baseUrl + '/channelReport/browserReport.htm'; //param1 浏览器名称 paramInt1 媒体Id paramInt2 频道ID
    var collectBrowserReportApi = baseUrl + '/channelReport/collectBrowserReport.htm';
    var countryReportApi = baseUrl + '/channelReport/countryReport.htm';
    var collectCountryReportApi = baseUrl + '/channelReport/collectCountryReport.htm';
    var cityReportApi = baseUrl + '/channelReport/cityReport.htm';
    var collectCityReportApi = baseUrl + '/channelReport/collectCityReport.htm';
    return {
        osReport: function (query) {
            return $http.post(osReportApi, query, configForm);
        },
        collectOSReport: function (query) {
            return $http.post(collectOSReportApi, query, configForm);
        },
        browserReport: function (query) {
            return $http.post(browserReportApi, query, configForm);
        },
        collectBrowserReport: function (query) {
            return $http.post(collectBrowserReportApi, query, configForm);
        },
        countryReport: function (query) {
            return $http.post(countryReportApi, query, configForm);
        },
        collectCountryReport: function (query) {
            return $http.post(collectCountryReportApi, query, configForm);
        },
        cityReport: function (query) {
            return $http.post(cityReportApi, query, configForm);
        },
        collectCityReport: function (query) {
            return $http.post(collectCityReportApi, query, configForm);
        }
    }
}])


/**
 * 报表管理 客户报表管理
 */
app.factory("ReportCustomerFty", ["$http", function ($http) {
    //客户数据报表汇总
    var collectCustomerReportApi = baseUrl + "/CustomerReport/collectCustomerReport.htm";
    //代理客户数据报表汇总
    var collectAgentCustomerReportApi = baseUrl + "/CustomerReport/collectAgentCustomerReport.htm";
    //客户数据报表导出
    var exportCustomerReportApi = baseUrl + "/CustomerReport/exportCustomerReport.htm";
    //代理客户数据报表导出
    var exportAgentCustomerReportApi = baseUrl + "/CustomerReport/exportAgentCustomerReport.htm";
    //客户数据报表
    var customerReportApi = baseUrl + "/CustomerReport/CustomerReport.htm";
    //代理客户
    var agentCustomerReportApi = baseUrl + "/CustomerReport/AgentCustomerReport.htm";
    return {
        collectCustomerReport: function (query) {
            return $http.post(collectCustomerReportApi, query, configForm);
        },
        collectAgentCustomerReport: function (query) {
            return $http.post(collectAgentCustomerReportApi, query, configForm);
        },
        exportCustomerReport: function (query) {
            return $http.post(exportCustomerReportApi, query, configForm);
        },
        exportAgentCustomerReport: function (query) {
            return $http.post(exportAgentCustomerReportApi, query, configForm);
        },
        customerReport: function (query) {
            return $http.post(customerReportApi, query, configForm);
        },
        agentCustomerReport: function (query) {
            return $http.post(agentCustomerReportApi, query, configForm);
        }
    };
}]);
/**
 * 报表管理 广告位管理
 */
app.factory("ReportAdvertiseFty", ["$http", function ($http) {
    //关键字报表汇总
    var collectKeywordReportApi = baseUrl + '/special/collectKeywordReport.htm';
    //关键字报表
    var keywordReportApi = baseUrl + '/special/keywordReport.htm';
    //地域报表
    var totalCityApi = baseUrl + "/AdvertiseReport/totalCity.htm";
    //广告位报表
    var totalADSpaceApi = baseUrl + "/AdvertiseReport/totalADSpace.htm";
    //操作系统报表
    var totalOSApi = baseUrl + "/AdvertiseReport/totalOS.htm";
    //操作系统报表汇总
    var collectOSApi = baseUrl + "/AdvertiseReport/collectOS.htm";
    //创意报表汇总
    var collectAdCreativeApi = baseUrl + "/AdvertiseReport/collectAdCreative.htm";
    //地域报表汇总
    var collectCityApi = baseUrl + "/AdvertiseReport/collectCity.htm";
    //浏览器报表汇总
    var collectBrowserApi = baseUrl + "/AdvertiseReport/collectBrowser.htm";
    //日期报表汇总
    var collectDateReportApi = baseUrl + "/AdvertiseReport/collectDateReport.htm";
    //订单报表汇总
    var collectOrderApi = baseUrl + "/AdvertiseReport/collectOrder.htm";
    //广告位报表汇总
    var collectADSpaceApi = baseUrl + "/AdvertiseReport/collectADSpace.htm";
    //报表订单下拉接口
    var allNDefaultOrderNamesApi = baseUrl + "/orders/AllNDefaultOrderNames.htm";
    //浏览器报表
    var totalBrowserApi = baseUrl + "/AdvertiseReport/totalBrowser.htm";
    //订单报表
    var orderReportApi = baseUrl + "/AdvertiseReport/orderReport.htm";
    //日期报表
    var dateReportApi = baseUrl + "/AdvertiseReport/DateReport.htm";
    //创意报表
    var totalAdCreativeApi = baseUrl + "/AdvertiseReport/totalAdCreative.htm";
    //时段报表列表
    var totalHourApi = baseUrl + "/AdvertiseReport/hourReport.htm";
    //时段报表汇总
    var collectHourApi = baseUrl + "/AdvertiseReport/collectHour.htm";
    //订单消耗报表
    var orderCostReportApi = baseUrl + '/costReport/orderCostReport.htm';
    //订单消耗报表汇总
    var collectOrderCostReportApi = baseUrl + '/costReport/collectOrderCostReport.htm';
    //合同消耗报表
    var contractCostReportApi = baseUrl + '/costReport/contractCostReport.htm';
    //合同消耗汇总
    var collectContractCostReportApi = baseUrl + '/costReport/collectContractCostReport.htm';
    return {
        collectKeywordReport:function(query){
            return $http.post(collectKeywordReportApi, query, configForm);
        },
        keywordReport:function(query){
            return $http.post(keywordReportApi, query, configForm);
        },
        collectContractCostReport: function (query) {
            return $http.post(collectContractCostReportApi, query, configForm);
        },
        contractCostReport: function (query) {
            return $http.post(contractCostReportApi, query, configForm);
        },
        collectOrderCostReport: function (query) {
            return $http.post(collectOrderCostReportApi, query, configForm);
        },
        orderCostReport: function (query) {
            return $http.post(orderCostReportApi, query, configForm)
        },
        totalCity: function (query) {
            return $http.post(totalCityApi, query, configForm);
        },
        totalADSpace: function (query) {
            return $http.post(totalADSpaceApi, query, configForm);
        },
        totalOS: function (query) {
            return $http.post(totalOSApi, query, configForm);
        },
        collectOS: function (query) {
            return $http.post(collectOSApi, query, configForm);
        },
        collectAdCreative: function (query) {
            return $http.post(collectAdCreativeApi, query, configForm);
        },
        collectCity: function (query) {
            return $http.post(collectCityApi, query, configForm);
        },
        collectBrowser: function (query) {
            return $http.post(collectBrowserApi, query, configForm);
        },
        collectDateReport: function (query) {
            return $http.post(collectDateReportApi, query, configForm);
        },
        collectOrder: function (query) {
            return $http.post(collectOrderApi, query, configForm);
        },
        collectADSpace: function (query) {
            return $http.post(collectADSpaceApi, query, configForm);
        },
        allNDefaultOrderNames: function (query) {
            return $http.post(allNDefaultOrderNamesApi, query, configForm);
        },
        totalBrowser: function (query) {
            return $http.post(totalBrowserApi, query, configForm);
        },
        orderReport: function (query) {
            return $http.post(orderReportApi, query, configForm);
        },
        dateReport: function (query) {
            return $http.post(dateReportApi, query, configForm);
        },
        totalAdCreative: function (query) {
            return $http.post(totalAdCreativeApi, query, configForm);
        },
        totalHour: function (query) {
            return $http.post(totalHourApi, query, configForm);
        },
        collectHour: function (query) {
            return $http.post(collectHourApi, query, configForm);
        }
    };
}]);
/**
 * 报表管理 资源管理
 */
app.factory("ReportResourceFty", ["$http", function ($http) {
    //创意类型消耗报表
    var adCreativeConsumeApi = baseUrl + "/Resource/AdCreativeConsume.htm";
    //广告位消耗报表
    var aDSpaceConsumeApi = baseUrl + "/Resource/ADSpaceConsume.htm";
    //频道消耗报表汇总
    var collectChannelConsumeApi = baseUrl + "/Resource/collectChannelConsume.htm";
    //媒体消耗报表汇总
    var collectMediaConsumeApi = baseUrl + "/Resource/CollectMediaConsume.htm";
    //广告位消耗报表汇总
    var collectADSpaceConsumeApi = baseUrl + "/Resource/collectADSpaceConsume.htm";
    //创意类型消耗报表汇总
    var collectAdCreativeConsumeApi = baseUrl + "/Resource/collectAdCreativeConsume.htm";
    //频道消耗报表
    var mediaChannelConsumeApi = baseUrl + "/Resource/MediaChannelConsume.htm";
    //媒体消耗报表
    var mediaConsumeApi = baseUrl + "/Resource/MediaConsume.htm";
    return {
        adCreativeConsume: function (query) {
            return $http.post(adCreativeConsumeApi, query, configForm);
        },
        aDSpaceConsume: function (query) {
            return $http.post(aDSpaceConsumeApi, query, configForm);
        },
        collectChannelConsume: function (query) {
            return $http.post(collectChannelConsumeApi, query, configForm);
        },
        collectMediaConsume: function (query) {
            return $http.post(collectMediaConsumeApi, query, configForm);
        },
        collectADSpaceConsume: function (query) {
            return $http.post(collectADSpaceConsumeApi, query, configForm);
        },
        collectAdCreativeConsume: function (query) {
            return $http.post(collectAdCreativeConsumeApi, query, configForm);
        },
        mediaChannelConsume: function (query) {
            return $http.post(mediaChannelConsumeApi, query, configForm);
        },
        mediaConsume: function (query) {
            return $http.post(mediaConsumeApi, query, configForm);
        }
    };
}]);

/**
 * 文件上傳key
 */
app.factory("UploadKeyFty", ["$http", function ($http) {
    var uploadKeyApi = baseUrl + "/uploadKey/getKey.htm";
    return {
        uploadKey: function () {
            return $http.get(uploadKeyApi);
        }
    };
}]);

app.factory("DataSyncFty", ["$http", function ($http) {
    var listSynLogsApi = baseUrl + "/syn/listSynLogs.htm";
    var getContractApi = baseUrl + "/syn/getContract.htm";
    var pushContractMoneyApi = baseUrl + "/syn/pushContractMoney.htm";
    return {
        getContract: function () {
            return $http.get(getContractApi);
        },
        pushContractMoney: function () {
            return $http.get(pushContractMoneyApi);
        },
        listSynLogs: function (query) {
            return $http.post(listSynLogsApi, query, configForm);
        }
    };
}]);
