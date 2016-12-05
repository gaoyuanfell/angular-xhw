// var baseUrl = '//192.168.100.100:8080/XinHuaNet';

//正式地址
// var baseUrl = '//m1.xinhuanet.com';
// var fileUrl = "//m2.xinhuanet.com:8081"; //上传地址
// var xadnUrl = '//m2.xinhuanet.com:8081';//投放js

//正式地址测试
// var baseUrl = '//m1.xinhuanet.com:8082';
// var fileUrl = "//m1.xinhuanet.com:8082/fileUpload"; //上传地址
// var xadnUrl = '//m1.xinhuanet.com:8082/fileUpload';//投放js

//太仓地址
var baseUrl = '//xhw.adpush.cn';
var fileUrl = '//xhwCreative.adpush.cn'; //上传地址
var xadnUrl = '//xhwCreative.adpush.cn';

//延时JS
var jsDelayed = xadnUrl +  '/js/xadndelayed.js';

var jsssssssss = '<script sid="<%id%>" type="text/javascript" src="' + xadnUrl + '/js/xadn.js"></script>';
var login_session = true;

if (/MSIE 9.0/i.test(navigator.userAgent) && !("classList" in document.documentElement)) {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function() {
            var self = this;
            function update(fn) {
                return function(value) {
                    var classes = self.className.split(/\s+/g),
                        index = classes.indexOf(value);

                    fn(classes, index, value);
                    self.className = classes.join(" ");
                }
            }
            return {
                add: update(function(classes, index, value) {
                    if (!~index) classes.push(value);
                }),
                remove: update(function(classes, index) {
                    if (~index) classes.splice(index, 1);
                }),
                toggle: update(function(classes, index, value) {
                    if (~index)
                        classes.splice(index, 1);
                    else
                        classes.push(value);
                }),
                contains: function(value) {
                    return !!~self.className.split(/\s+/g).indexOf(value);
                },
                item: function(i) {
                    return self.className.split(/\s+/g)[i] || null;
                }
            };
        }
    });
}

function heightMenu(p, bo, speed,callback) {
    var t = 5;
    var h = p.offsetHeight;
    if(bo){
        setTimeout(function(){
            if (h <= 0) {
                callback && callback()
                // p.classList.remove('active');
            } else {
                h -= speed
                var _h = (h < 0 ? 0 : h) + 'px';
                p.style.height = _h;
                setTimeout(arguments.callee,t);
            }
        },t)
    }else{
        var ch = p.children[0].offsetHeight * p.children.length;
        setTimeout(function(){
            if (h >= ch) {
                callback && callback()
                // p.classList.add('active');
            } else {
                h += speed
                p.style.height = h + 'px';
                setTimeout(arguments.callee,t);
            }
        },t)
    }
}

function Route(key,frame,config) {
    this.regex = {};
    this.data = {};
    this.key = key;
    this.frame = frame;
    this.config = config || {};
}

//config 钩子函数 stateWill stateComponent
Route.prototype.changeState = function (hash) {
    if (hash) {
        this.config.stateWill && this.config.stateWill.bind(this)(hash);//路由改变后执行的方法 开始前
        var url = this.getUrl(hash);
        var iframe = document.getElementById(this.frame);
        iframe.contentWindow.location.replace(url);
        this.config.stateComponent && this.config.stateComponent.bind(this)(hash);//路由改变后执行的方法 开始后
        return true;
    }
};

Route.prototype.getHash = function () {
    var r = '#' + this.key;
    return location.hash.substr(r.length + 1);
};

Route.prototype.getUrl = function (hash) {
    hash = this.searchJSON(hash, this.data);
    var q = toBodyString(this.data);
    var url = q?(this.regex[hash] + '?' + q):(this.regex[hash]);
    if(url){
        return decodeURIComponent(url);
    }
    return '';
};

//name url
Route.prototype.reg = function (o) {
    if (o instanceof Array) {
        for (var i = 0, j = o.length; i < j; i++) {
            var r = o[i];
            if (!r.name || !r.url) continue;
            this.regex[r.name] = r.url;
        }
    } else {
        if (!o.name || !o.url) return this;
        this.regex[o.name] = o.url;
    }
    return this;
};

Route.prototype.listen = function () {
    var _self = this;
    window.top.onhashchange = function (event) {
        var hash = _self.getHash();
        _self.searchJSON(hash, _self.data);
        if (_self.getUrl(hash)) {
            _self.changeState(hash);
            _self.data = {};
        }
    }
};
//_hash 默认hash 没有注册的路由就会跳到这个默认的路由上

//config 钩子函数 startWill startComponent
Route.prototype.start = function (_hash) {
    this.config.startWill && this.config.startWill.bind(this)(_hash);//开始前
    this.listen();
    this.config.startComponent && this.config.startComponent.bind(this)(_hash);//开始后
};

Route.prototype.searchJSON = function (url, obj) {
    !obj && (obj = {});
    url = decodeURIComponent(url)
    var l = url.indexOf('?');
    if (l != -1) {
        var s = url.substr(l + 1, l.length);
        var _s = s.split("&");
        for (var i = 0; i < _s.length; i++) {
            var _ss = _s[i];
            var _sss = _ss.split('=');
            obj[_sss[0]] = _sss[1];
        }
        return url.substr(0,l);
    }
    return url;
}

Route.prototype.go = function (hash, data) {
    this.data = data || {};
    this.searchJSON(hash, this.data);
    top.location.hash = '#' + this.key + '/' + hash;
}

var $menu = [
    {
        name:'广告订单',
        list:[
            { name: 'QueryScheduling', url: 'ADManage/listManage.html', title: '查询排期' },
            { name: 'ViewPutOrder', url: 'ADManage/putListManage.html', title: '投放订单' },
            { name: 'ViewContent', url: 'ADManage/contentManage.html', title: '内容管理' },
            { name: 'ViewDefaultOrder', url: 'ADManage/trueAdvertisement.html', title: '默认订单' },
            { name: 'ViewContract', url: 'ADManage/contractList.html', title: '合同管理' },
            { name: 'ViewAuditProcess', url: 'ADManage/processList.html', title: '流程管理' },
        ],
        icon:'&#xe600;'
    },
    {
        name:'资源管理',
        list:[
            { name: 'ViewMediaChannelADSpace1', url: 'ResourceManage/mediaManage.html', title: '媒体' },
            { name: 'ViewMediaChannelADSpace2', url: 'ResourceManage/channelManage.html', title: '频道' },
            { name: 'ViewMediaChannelADSpace4', url: 'ResourceManage/channelLevelManage.html', title: '频道级别' },
            { name: 'ViewMediaChannelADSpace3', url: 'ResourceManage/advertiseManage.html', title: '广告位' },
            { name: 'ViewCreativeType', url: 'ResourceManage/createManage.html', title: '广告类型' },
            { name: 'ViewSize', url: 'ResourceManage/sizeManage.html', title: '尺寸' },
        ],
        icon:'&#xe605;'
    },
    {
        name:'客户管理',
        list:[
            { name: 'ViewCustomer', url: 'ClientManage/clientManageh.html', title: '客户' },
            { name: 'ViewCustomer1', url: 'ClientManage/QualificationManage.html', title: '资质' },
        ],
        icon:'&#xe603;'
    },
    {
        name:'数据报表',
        list:[
            { name: 'ViewDataSummary', url: 'ReportManage/dataSummary.html', title: '数据概览' },
            { name: 'ViewCustomerReport', url: 'ReportManage/clientReport.html', title: '客户报表' },
            { name: 'ViewResourceConsumptionReport', url: 'ReportManage/resourceReport.html', title: '资源报表' },
            { name: 'ViewAdvertisingReport', url: 'ReportManage/adReport.html', title: '广告投放' },
            { name: 'ViewOrderCostReport', url: 'ReportManage/orderConsume.html', title: '订单消耗' },
            { name: 'ViewContractCostReport', url: 'ReportManage/contractConsume.html', title: '合同消耗' },
        ],
        icon:'&#xe607;'
    },
    {
        name:'系统设置',
        list:[
            { name: 'ViewCompany', url: 'SystemManage/companyManage.html', title: '所属' },
            { name: 'ViewDepartment', url: 'SystemManage/departmentManage.html', title: '部门' },
            { name: 'ViewRole', url: 'SystemManage/roleManage.html', title: '角色' },
            { name: 'ViewUser', url: 'SystemManage/userManage.html', title: '用户' },
            { name: 'ViewNotice', url: 'SystemManage/afficheManage.html', title: '公告' },
            { name: 'ViewOperationLog', url: 'SystemManage/logManage.html', title: '日志' },
            { name: 'ViewTolerantRate', url: 'SystemManage/contractTolerantManage.html', title: '容错率' },
            { name: 'ViewADMark', url: 'SystemManage/markManage.html', title: '角标' },
            { name: 'ViewSpecialEffects', url: 'SystemManage/specialManage.html', title: '特效' },
            { name: 'ViewMonitor', url: 'SystemManage/monitorManage.html', title: '监控' },
            { name: 'ManageHelpDocument', url: 'SystemManage/fileManage.html', title: '文档' },
        ],
        icon:'&#xe606;'
    }
]

var $r = [
    { name: 'Index', url: 'index.html', title: '首页' },
    { name: 'QueryScheduling', url: 'ADManage/listManage.html' },
    { name: 'ViewPutOrder', url: 'ADManage/putListManage.html' },
    { name: 'ViewContent', url: 'ADManage/contentManage.html' },
    { name: 'ViewDefaultOrder', url: 'ADManage/trueAdvertisement.html' },
    { name: 'ViewContract', url: 'ADManage/contractList.html' },
    { name: 'ViewAuditProcess', url: 'ADManage/processList.html' },

    { name: 'ViewPutOrderAdd', url: 'ADManage/putAdd.html' },
    { name: 'ViewPutOrderCheck', url: 'ADManage/putCheck.html' },
    { name: 'ViewPutOrderEdit', url: 'ADManage/putEdit.html' },
    { name: 'ViewPutOrderCreate', url: 'ADManage/putCreateManage.html' },
    { name: 'ViewPutOrderCreateAdd', url: 'ADManage/putListAdd.html' },
    { name: 'ViewPutOrderCreateEdit', url: 'ADManage/putListEdit.html' },

    { name: 'ViewContentAdd', url: 'ADManage/contentIncreased.html' },
    { name: 'ViewContentEdit', url: 'ADManage/contentCompile.html' },

    { name: 'ViewDefaultOrderAdd', url: 'ADManage/trueAdvertisementAdd.html' },
    { name: 'ViewDefaultOrderCheck', url: 'ADManage/trueAdvertisementAudit.html' },
    { name: 'ViewDefaultOrderEdit', url: 'ADManage/trueAdvertisementEdit.html' },
    { name: 'ViewDefaultOrderCreate', url: 'ADManage/trueCreateAd.html' },
    { name: 'ViewDefaultOrderCreateAdd', url: 'ADManage/trueCreateListAdd.html' },
    { name: 'ViewDefaultOrderCreateEdit', url: 'ADManage/trueCreateListEdit.html' },

    { name: 'ViewContractAdd', url: 'ADManage/contractAdd.html' },
    { name: 'ViewContractEdit', url: 'ADManage/contractEdit.html' },

    { name: 'ViewAuditProcessEdit', url: 'ADManage/processEdit.html' },
    //报表
    { name: 'ViewDataSummary', url: 'ReportManage/dataSummary.html' },
    { name: 'ViewCustomerReport', url: 'ReportManage/clientReport.html' },
    { name: 'ViewResourceConsumptionReport', url: 'ReportManage/resourceReport.html' },
    { name: 'ViewAdvertisingReport', url: 'ReportManage/adReport.html' },
    { name: 'ViewOrderCostReport', url: 'ReportManage/orderConsume.html' },
    { name: 'ViewContractCostReport', url: 'ReportManage/contractConsume.html' },
    //资源管理
    { name: 'ViewMediaChannelADSpace1', url: 'ResourceManage/mediaManage.html' },
    { name: 'ViewMediaChannelADSpace2', url: 'ResourceManage/channelManage.html' },
    { name: 'ViewMediaChannelADSpace3', url: 'ResourceManage/advertiseManage.html' },
    { name: 'ViewCreativeType', url: 'ResourceManage/createManage.html' },
    { name: 'ViewSize', url: 'ResourceManage/sizeManage.html' },

    { name: 'ViewMediaChannelADSpace1Add', url: 'ResourceManage/mediaIncreased.html' },
    { name: 'ViewMediaChannelADSpace1Edit', url: 'ResourceManage/mediaCompile.html' },

    { name: 'ViewMediaChannelADSpace2Add', url: 'ResourceManage/channelIncrease.html' },
    { name: 'ViewMediaChannelADSpace2Edit', url: 'ResourceManage/channelCompile.html' },

    { name: 'ViewMediaChannelADSpace3Add', url: 'ResourceManage/advertiseIncrease.html' },
    { name: 'ViewMediaChannelADSpace3Edit', url: 'ResourceManage/advertiseCompile.html' },

    { name: 'ViewMediaChannelADSpace4Add', url: 'ResourceManage/channelLevelIncrease.html' },
    { name: 'ViewMediaChannelADSpace4Edit', url: 'ResourceManage/channelLevelCompile.html' },

    { name: 'ViewCreativeTypeEdit', url: 'ResourceManage/createCompile.html' },

    { name: 'ViewSizeAdd', url: 'ResourceManage/sizeIncreased.html' },
    { name: 'ViewSizeEdit', url: 'ResourceManage/sizeCompile.html' },

    //客户管理
    { name: 'ViewCustomer', url: 'ClientManage/clientManageh.html' },
    { name: 'ViewCustomer1', url: 'ClientManage/QualificationManage.html' },

    { name: 'ViewCustomerAdd', url: 'ClientManage/clientAdd.html' },
    { name: 'ViewCustomerEdit', url: 'ClientManage/clientEdit.html' },

    { name: 'ViewCustomer1Add', url: 'ClientManage/QualificationAdd.html' },
    { name: 'ViewCustomer1Edit', url: 'ClientManage/QualificationEdit.html' },

    //系统管理
    { name: 'ViewCompany', url: 'SystemManage/companyManage.html' },
    { name: 'ViewDepartment', url: 'SystemManage/departmentManage.html' },
    { name: 'ViewRole', url: 'SystemManage/roleManage.html' },
    { name: 'ViewUser', url: 'SystemManage/userManage.html' },
    { name: 'ViewNotice', url: 'SystemManage/afficheManage.html' },
    { name: 'ViewOperationLog', url: 'SystemManage/logManage.html' },
    { name: 'ViewTolerantRate', url: 'SystemManage/contractTolerantManage.html' },
    { name: 'ViewADMark', url: 'SystemManage/markManage.html' },
    { name: 'ViewSpecialEffects', url: 'SystemManage/specialManage.html' },
    { name: 'ViewMonitor', url: 'SystemManage/monitorManage.html' },

    { name: 'ViewCompanyEdit', url: 'SystemManage/companyCompile.html' },
    { name: 'ViewCompanyAdd', url: 'SystemManage/companyIncreased.html' },
    { name: 'ViewDepartmentEdit', url: 'SystemManage/departmentCompile.html' },
    { name: 'ViewDepartmentAdd', url: 'SystemManage/departmentIncreased.html' },

    { name: 'ViewRoleAdd', url: 'SystemManage/roleIncreased.html' },
    { name: 'ViewRoleEdit', url: 'SystemManage/roleCompile.html' },

    { name: 'ViewUserAdd', url: 'SystemManage/userIncreased.html' },
    { name: 'ViewUserEdit', url: 'SystemManage/userCompile.html' },

    { name: 'ViewNoticeAdd', url: 'SystemManage/affcheIncreased.html' },
    { name: 'ViewNoticeEdit', url: 'SystemManage/affcheCompile.html' },

    { name: 'ViewTolerantRateEdit', url: 'SystemManage/contractTolerantIncreased.html' },

    { name: 'ViewADMarkAdd', url: 'SystemManage/markIncreased.html' },
    { name: 'ViewADMarkEdit', url: 'SystemManage/markCompile.html' },

    { name: 'ViewSpecialEffectsAdd', url: 'SystemManage/specialIncreased.html' },
    { name: 'ViewSpecialEffectsEdit', url: 'SystemManage/specialCompile.html' },

    { name: 'ViewMonitorAdd', url: 'SystemManage/monitorIncreased.html' },
    { name: 'ViewMonitorEdit', url: 'SystemManage/monitorCompile.html' },

    { name: 'ManageHelpDocumentAdd', url: 'SystemManage/fileIncreased.html' },
]

//外部路由跳转
function goRoute(route,data,config){
    var config = config || {};
    if (window.top !== window.self) {//解决跳出iframe页面跳转的问题
        var q = toBodyString(data);
        q = decodeURIComponent(q);
        route = q?(route + '?' + q):route;
        config.stateWill && config.stateWill();
        window.top.$R.go(route);
        config.stateComponent && config.stateComponent();
    } else {
        data && ($route.data = data);
        // $route.searchJSON(route, $route.data);
        var url = $route.getUrl(route);
        config.stateWill && config.stateWill();
        window.top.location.href = '../' + url;
        config.stateComponent && config.stateComponent();
    }
}

window.addEventListener('load',function(){
    // console.info('top' + window.top.name);
    // console.info('self' + window.self.name);
    var bo = window.top === window.self;
    startRoute(bo);

    //改变framTop的背景
    // var header = document.querySelector('nav.header');
    // header && header.addEventListener('mouseover',function(){
    //     window.top.$headerBg && window.top.$headerBg(true);
    // })
    // header && header.addEventListener('mouseout',function(){
    //     window.top.$headerBg && window.top.$headerBg(false);
    // })

    //搜索框回车搜索
    $(document.body).keyup(function (event) {
        var key = event.keyCode ? event.keyCode : event.which;
        if (key == 13) {
            // var input = document.querySelector('input[ng-model=search]')
            // || document.querySelector('input[ng-model=search2]')
            // || document.querySelector('input[ng-model=query.search]')
            // || document.querySelector('input[ng-model=query.search2]');
            // if(input && $(input).is(':focus')){
            //     input.nextElementSibling.querySelector('i.yc-icon').click();
            // }
            var input = $('input[ng-model]:focus')
            if(input.length > 0){
                var i = input[0].nextElementSibling.querySelector('i.yc-icon');
                i && i.click();
            }
        }
    });

})

function startRoute(bo){
    if(bo){
        $route = window.top.$R;
        !$route && ($route = new Route('!'),$route.reg($r));
    }else{
        document.addEventListener('click', function (e) {
            var t = e.target;
            var p = t.parentNode;
            if(p && p.classList && p.classList.contains('scroll')){
                if(!p.classList.contains('scroll-nav')){
                    window.sessionStorage.removeItem('session_page_index');
                }
            }
            if (t && t.nodeName == 'A' && t.getAttribute('data-route')) {
                e.preventDefault();
                e.stopPropagation();
                var route = t.getAttribute('data-route');
                goRoute(route);
            }
        });
        $route = new Route('!');
        $route.reg($r);
    }

    // table滚动 tab滚动
    !function(){
        var mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";//火狐SB
        var table = document.querySelectorAll('.table-container');
        var nav = document.querySelectorAll('.header .scroll');
        // var nav = document.querySelectorAll('.header');
        // for(var i = 0;i<table.length;i++){
        //     table[i] && table[i].addEventListener(mousewheelevt,function(e){
        //         e.preventDefault();
        //         e.stopPropagation();
        //         var d = e.wheelDelta || -e.detail;
        //         if (d > 0) {
        //             this.scrollLeft = this.scrollLeft - 80
        //         } else {
        //             this.scrollLeft = this.scrollLeft + 80
        //         }
        //     })
        // }
        for(var i = 0;i<nav.length;i++){
            // var config = {
            //     position:2,//默认4
            //     range:40//滚轮的速度
            // };
            // var scroll = Scroll.start(nav[i],config);
            // scroll.$content.style.overflowX = 'hidden';
            nav[i] && nav[i].addEventListener(mousewheelevt,function(e){
                e.preventDefault();
                e.stopPropagation();
                var d = e.wheelDelta || -e.detail;
                if (d > 0) {
                    this.scrollLeft = this.scrollLeft - 80
                } else {
                    this.scrollLeft = this.scrollLeft + 80
                }
            })
        }
    }()


    // tab切换 定位活动状态
    var a = document.querySelectorAll('.header .scroll a.nav[data-route]');
    var tabHash;
    var tabUrl;

    if (window.self === window.top) {
        tabUrl = location.pathname;
    }else{
        var _tabHash = window.top.location.hash;
        var l = _tabHash.indexOf('?');
        tabHash = l == -1 ? (_tabHash) : (_tabHash.substr(0, l));
        var _keyL = '#' + $route.key + '/';
        tabHash = tabHash.substr(_keyL.length);
    }
    for(var i = 0;i<a.length;i++){
        var _a = a[i];
        _a.classList.remove('active');
        var _r = _a.getAttribute('data-route');
        var _l = _r.indexOf('?');
        _r = _l == -1 ? (_r) : (_r.substr(0, _l));
        if((tabUrl && tabUrl.indexOf($route.regex[_r]) != -1) ||  _r == tabHash){
            _a.classList.add('active');
        }
    }
}

/**
 * 查看c是否在p元素中
 * 
 * @param {any} p
 * @param {any} c
 * @returns
 */
function containsEle(p, c) {
    return p.contains ?
        p != c && p.contains(c) :
        !!(p.compareDocumentPosition(c) & 16);
}

// var $util = {
//     /**
//     *Dom 相关操作
//     */
//     dom:{
//         $: function(id) {
//             return document.getElementById(id);
//         },
//         getStyle: function(obj, prop) {
//             var style = obj.currentStyle || window.getComputedStyle(obj, '');
//             if (obj.style.filter) {
//                 return obj.style.filter.match(/\d+/g)[0];
//             }
//             return style[prop];
//         },
//         setStyle: function(obj, prop, val) {
//             switch (prop) {
//             case 'opacity':
//                 if($util.client.browser.ie){
//                     obj.style.filter = 'alpha(' + prop + '=' + val*100 + ')'
//                 }else{
//                     obj.style[prop] = val;
//                 }
//                 break;
//             default:
//                 obj.style[prop] = val + 'px';
//                 break;
//             }
//         },
//         setStyles: function(obj, props) {
//             for (var prop in props) {
//                 switch (prop) {
//                 case 'opacity':
//                     if($util.client.browser.ie){
//                         obj.style.filter = 'alpha(' + prop + '=' + props[prop] + ')'
//                     }else{
//                         obj.style[prop] = props[prop];
//                     }
//                     break;
//                 default:
//                     obj.style[prop] = props[prop] + 'px';
//                     break;
//                 }
//             }
//         }
//     },
//     tween: {
//         Linear: function(t, b, c, d) {
//             return c * t / d + b;
//         },
//         Quad: {
//             easeIn: function(t, b, c, d) {
//                 return c * (t /= d) * t + b;
//             },
//             easeOut: function(t, b, c, d) {
//                 return - c * (t /= d) * (t - 2) + b;
//             },
//             easeInOut: function(t, b, c, d) {
//                 if ((t /= d / 2) < 1) return c / 2 * t * t + b;
//                 return - c / 2 * ((--t) * (t - 2) - 1) + b;
//             }
//         },
//         Cubic: {
//             easeIn: function(t, b, c, d) {
//                 return c * (t /= d) * t * t + b;
//             },
//             easeOut: function(t, b, c, d) {
//                 return c * ((t = t / d - 1) * t * t + 1) + b;
//             },
//             easeInOut: function(t, b, c, d) {
//                 if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
//                 return c / 2 * ((t -= 2) * t * t + 2) + b;
//             }
//         },
//         Quart: {
//             easeIn: function(t, b, c, d) {
//                 return c * (t /= d) * t * t * t + b;
//             },
//             easeOut: function(t, b, c, d) {
//                 return - c * ((t = t / d - 1) * t * t * t - 1) + b;
//             },
//             easeInOut: function(t, b, c, d) {
//                 if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
//                 return - c / 2 * ((t -= 2) * t * t * t - 2) + b;
//             }
//         },
//         Quint: {
//             easeIn: function(t, b, c, d) {
//                 return c * (t /= d) * t * t * t * t + b;
//             },
//             easeOut: function(t, b, c, d) {
//                 return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
//             },
//             easeInOut: function(t, b, c, d) {
//                 if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
//                 return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
//             }
//         },
//         Sine: {
//             easeIn: function(t, b, c, d) {
//                 return - c * Math.cos(t / d * (Math.PI / 2)) + c + b;
//             },
//             easeOut: function(t, b, c, d) {
//                 return c * Math.sin(t / d * (Math.PI / 2)) + b;
//             },
//             easeInOut: function(t, b, c, d) {
//                 return - c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
//             }
//         },
//         Expo: {
//             easeIn: function(t, b, c, d) {
//                 return (t == 0) ? b: c * Math.pow(2, 10 * (t / d - 1)) + b;
//             },
//             easeOut: function(t, b, c, d) {
//                 return (t == d) ? b + c: c * ( - Math.pow(2, -10 * t / d) + 1) + b;
//             },
//             easeInOut: function(t, b, c, d) {
//                 if (t == 0) return b;
//                 if (t == d) return b + c;
//                 if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
//                 return c / 2 * ( - Math.pow(2, -10 * --t) + 2) + b;
//             }
//         },
//         Circ: {
//             easeIn: function(t, b, c, d) {
//                 return - c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
//             },
//             easeOut: function(t, b, c, d) {
//                 return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
//             },
//             easeInOut: function(t, b, c, d) {
//                 if ((t /= d / 2) < 1) return - c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
//                 return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
//             }
//         },
//         Elastic: {
//             easeIn: function(t, b, c, d, a, p) {
//                 if (t == 0) return b;
//                 if ((t /= d) == 1) return b + c;
//                 if (!p) p = d * .3;
//                 if (!a || a < Math.abs(c)) {
//                     a = c;
//                     var s = p / 4;
//                 } else var s = p / (2 * Math.PI) * Math.asin(c / a);
//                 return - (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
//             },
//             easeOut: function(t, b, c, d, a, p) {
//                 if (t == 0) return b;
//                 if ((t /= d) == 1) return b + c;
//                 if (!p) p = d * .3;
//                 if (!a || a < Math.abs(c)) {
//                     a = c;
//                     var s = p / 4;
//                 } else var s = p / (2 * Math.PI) * Math.asin(c / a);
//                 return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
//             },
//             easeInOut: function(t, b, c, d, a, p) {
//                 if (t == 0) return b;
//                 if ((t /= d / 2) == 2) return b + c;
//                 if (!p) p = d * (.3 * 1.5);
//                 if (!a || a < Math.abs(c)) {
//                     a = c;
//                     var s = p / 4;
//                 } else var s = p / (2 * Math.PI) * Math.asin(c / a);
//                 if (t < 1) return - .5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
//                 return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
//             }
//         }
//     }
// }

// var animation = function(obj) {
//     this.obj = obj;
//     this.frames = 0;
//     this.timmer = undefined;
//     this.running = false;
//     this.ms = [];
// }

// animation.prototype = {
//     fps: 36,
//     init: function(props, duration, tween) {
//         //console.log('初始化');
//         this.curframe = 0;
//         this.initstate = {};
//         this.props = props;
//         this.duration = duration || 1000;
//         this.tween = tween || function(t, b, c, d) {
//             return t * c / d + b;
//         };
//         this.frames = Math.ceil(this.duration * this.fps/1000);
//         for (var prop in this.props) {
//             this.initstate[prop] = {
//                 from: parseFloat($util.dom.getStyle(this.obj, prop)),
//                 to: parseFloat(this.props[prop])
//             };
//         }
//     },
//     start: function() {
//         if (!this.running && this.hasNext()) {
//             this.ms.shift().call(this)
//         }
//         return this;
//     },
//     //开始播放
//     play: function(callback) {
//         //console.log('开始动画！');
//         var that = this;

//         this.running = true;

//         if (this.timmer) {
//             this.stop();
//         }

//         this.timmer = setInterval(function() {
//             if (that.complete()) {
//                 that.stop();
//                 that.running = false;
//                 if (callback) {
//                     callback.call(that);
//                 }
//                 return;
//             }
//             that.curframe++;
//             that.enterFrame.call(that);
//         },
//         1000 / this.fps);

//         return this;
//     },
//     // 停止动画
//     stop: function() {
//         //console.log('结束动画！');
//         if (this.timmer) {
//             clearInterval(this.timmer);
//             // 清除掉timmer id
//             this.timmer = undefined;
//         }

//     },
//     go: function(props, duration, tween) {
//         var that = this;
//         //console.log(tween)
//         this.ms.push(function() {
//             that.init.call(that, props, duration, tween);
//             that.play.call(that, that.start);
//         });
//         return this;
//     },
//     //向后一帧
//     next: function() {
//         this.stop();
//         this.curframe++;
//         this.curframe = this.curframe > this.frames ? this.frames: this.curframe;
//         this.enterFrame.call(this);
//     },
//     //向前一帧
//     prev: function() {
//         this.stop();
//         this.curframe--;
//         this.curframe = this.curframe < 0 ? 0 : this.curframe;
//         this.enterFrame.call(this);
//     },
//     //跳跃到指定帧并播放
//     gotoAndPlay: function(frame) {
//         this.stop();
//         this.curframe = frame;
//         this.play.call(this);
//     },
//     //跳到指定帧停止播放
//     gotoAndStop: function(frame) {
//         this.stop();
//         this.curframe = frame;
//         this.enterFrame.call(this);
//     },
//     //进入帧动作
//     enterFrame: function() {
//         //console.log('进入帧：' + this.curframe)
//         var ds;
//         for (var prop in this.initstate) {
//             //console.log('from: ' + this.initstate[prop]['from'])
//             ds = this.tween(this.curframe, this.initstate[prop]['from'], this.initstate[prop]['to'] - this.initstate[prop]['from'], this.frames).toFixed(2);
//             //console.log(prop + ':' + ds)
//             $util.dom.setStyle(this.obj, prop, ds)
//         }
//     },
//     //动画结束
//     complete: function() {
//         return this.curframe >= this.frames;
//     },
//     hasNext: function() {
//         return this.ms.length > 0;
//     }
// }


// $(function () {
//     $(document.body).click(function () {
//         var doc = top.document;
//         $(doc).find(".frame-top-setting-list,.frame-info").stop(true).slideUp('fast');
//     });

//     //阻止公告栏的冒泡事件
//     $(".frame-info").click(function (event) {
//         event.stopPropagation();
//     });

//     //检索所有查询框 绑定回车事件
//     $(document.body).keyup(function (event) {
//         var key = event.keyCode ? event.keyCode : event.which;
//         if (key == 13) {
//             var input = $("div.yc-search-wraper").find("input:focus[type=text]");
//             if (input.length == 1) {
//                 input.next("i.yc-icon").trigger("click");
//             }
//         }
//     });
// });

//全局hash路由控制
// var route = {
//     start: function () {
//         this.match(top.location.hash);
//         this.listen();
//     },
//     url: function (url) {
//         var tdoc = $(top.document.body),
//             ifr = tdoc.find("#main"),
//             menu = (url.match(this.routeReg) || [])[1];

//         ifr && (tdoc.find(".menu li a").removeClass("current"), tdoc.find(".menu li[data-menu=" + menu + "] a").addClass("current"), ifr.attr("src", url.slice(1)));
//     },
//     routeReg: /^#?(ADManage|SystemManage|ResourceManage|ReportManage|ClientManage)/i,
//     match: function (url) {
//         this.routeReg.test(url) && this.url(url);
//     },
//     listen: function () {
//         var that = this;
//         top.onhashchange = function (event) {
//             that.match(top.location.hash);
//         }
//     },
//     change: function (url) {
//         this.routeReg.test(url) && (top.location.hash = url);
//     }
// };

//
// /**
//  * 快速排序法
//  * @param arr
//  * @returns {*}
//  */
// var quickSort = function(arr) {
//     if (arr.length <= 1) { return arr; }
//     var pivotIndex = Math.floor(arr.length / 2);
//     var pivot = arr.splice(pivotIndex, 1)[0];
//     var left = [];
//     var right = [];
//     for (var i = 0; i < arr.length; i++){
//         if (arr[i] < pivot) {
//             left.push(arr[i]);
//         } else {
//             right.push(arr[i]);
//         }
//     }
//     return quickSort(left).concat([pivot], quickSort(right));
// };
// /**
//  * 插入排序发
//  * @param arr
//  */
// var insertSort = function (arr) {
//     var length = arr.length, j, i, key;
//     for (j = 1; j < length; j++) {
//         key = arr[j];
//         i = j - 1;
//         while (i >= 0 && arr[i] > key) {
//             arr[i + 1] = arr[i];
//             i--;
//         }
//         arr[i + 1] = key;
//     }
// };
/**
 * 解决小数运算精度缺失问题
 * @param arg1
 * @param arg2
 * @returns {number}
 */
//加法
function accAdd(arg1, arg2) {
    var r1, r2, m;
    try {
        r1 = arg1.toString().split(".")[1].length
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = arg2.toString().split(".")[1].length
    } catch (e) {
        r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg1 * m + arg2 * m) / m
}
//减法
function accSubtr(arg1, arg2) {
    var r1, r2, m, n;
    try {
        r1 = arg1.toString().split(".")[1].length
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = arg2.toString().split(".")[1].length
    } catch (e) {
        r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return Number(((arg1 * m - arg2 * m) / m).toFixed(n));
}
function accMul(arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
        m += s1.split(".")[1].length
    } catch (e) {
    }
    try {
        m += s2.split(".")[1].length
    } catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}
function accDiv(arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try {
        t1 = arg1.toString().split(".")[1].length
    } catch (e) {
    }
    try {
        t2 = arg2.toString().split(".")[1].length
    } catch (e) {
    }
    with (Math) {
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        return accMul((r1 / r2), pow(10, t2 - t1));
    }
}

function merge(target,source){
    for(var i in source){
        source.hasOwnProperty(i) && (target[i] = source[i]);
    }
}

// 上传控件统一方法
function uploadInit(option) {
    var config = {
        swf: baseUrl + "/static/lib/Uploader.swf",
        // server: fileUrl + "/contract/uploadADMark.htm",
        // pick: {
        //     id: '#'+id,
        //     multiple: false
        // },
        auto:false,
        compress:false,
        fileVal: "uploadFile",
        resize: false
    };
    merge(config,option || {});
    var uploader = WebUploader.create(config);

    uploader.on('beforeFileQueued', function (file) {
        if(config.beforeFileQueued){
            var bo = config.beforeFileQueued(this,file);
            if(bo == false){
                return false;
            }
        }
        return true;
    });

    uploader.on('uploadError',function(file ,reason){
        ycui.alert({
            error:true,
            content: "网络错误",
            timeout: 10
        });
        this.reset();
    })

    uploader.on('error',function(err){
        if(config.error){
            config.error(this,err);
        }else{
            ycui.alert({
                error:true,
                content: "错误的文件类型",
                timeout: 10
            });
            ycui.loading.hide();
        }
        uploader.reset();
    })

    uploader.on('uploadComplete', function () {
        config.uploadComplete && config.uploadComplete();
        uploader.reset();
        ycui.loading.hide();
    });

    uploader.on('uploadBeforeSend', function (ob, data) {
        config.uploadBeforeSend && config.uploadBeforeSend(this,ob,data);
    });

    uploader.on('uploadSuccess',function(file,res){
        config.uploadSuccess && config.uploadSuccess(this,file,res);
    })

    uploader.on('fileQueued',function(file){
        config.fileQueued && config.fileQueued(this,file);
    })
    return uploader
};

var cookie = {
    get: function (t, e) {
        var i = new RegExp("(^| )" + t + "=([^;]*)(;|$)"),
            n = i.exec(document.cookie);
        return n ? e ? decodeURIComponent(n[2]) : n[2] : ""
    },
    set: function (t, e, i, n) {
        var o = i.expires;
        document.cookie = t + "=" + (n ? encodeURIComponent(e) : e) + (i.path ? "; path=" + i.path : "") + (o ? "; expires=" + o.toGMTString() : "") + (i.domain ? "; domain=" + i.domain : "")
    },
    remove: function (t) {
        var e = new Date();
        this.set(t, "", {
            path: "/",
            expires: e
        })
    }
};

var getImgInfo = function (url) {
    var i = new Image();
    i.src = url;
    return i;
}

/**
 * 解析url地址 返回数据对象
 * @param url
 */
var getUrlSearch = function (url) {
    url = decodeURIComponent(url);
    var params = url.substr(url.lastIndexOf("?") + 1, url.length);
    var s = params.split("&");
    var a = "{";
    s.forEach(function (data, index) {
        var ar = data.split("=");
        if (s.length - 1 == index) {
            a += "\"" + ar[0] + "\"" + ":" + "\"" + ar[1] + "\"";
        } else {
            a += "\"" + ar[0] + "\"" + ":" + "\"" + ar[1] + "\"" + ",";
        }
    });
    a += "}";
    return JSON.parse(a);
};
/**
 * 2016-5-25 日期转date对象
 * @param strDate
 * @returns {Date}
 */
var stringToDate = function (strDate) {
    var n = strDate.split("-");
    if (n.length != 3) {
        n = strDate.split("/");
    }
    var d = new Date();
    d.setFullYear(n[0]);
    d.setMonth(n[1] - 1);
    d.setDate(n[2]);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * 返回当前月的天数数组
 * @param nowDate "2016-4-13" 可以不传 默认当前月
 * @returns {number[]}
 */
var getDateArray = function (nowDate) {
    if (!nowDate) {
        nowDate = new Date().dateFormat();
    }
    var array = [];
    var date;
    if(nowDate instanceof Date){
        date = nowDate
    }else{
        date = nowDate && stringToDate(nowDate);
    }
    var m = date.getMonth();
    for (var i = 1; i <= 31; i++) {
        date.setDate(i);
        if (date.getMonth() != m) {
            break;
        } else {
            array.push(i);
        }
    }
    return array;
};

/**
 * 返回当前月的星期数组
 * @param nowDate "2016-4-13" 可以不传 默认当前月
 * @param format
 * @returns {Array}
 */
var getWeekArray = function (nowDate, format) {
    var day = [];
    var array = getDateArray(nowDate);
    var date = stringToDate(nowDate);

    function formatStr(num) {
        switch (num) {
            case 0:
                return "日";
            case 1:
                return "一";
            case 2:
                return "二";
            case 3:
                return "三";
            case 4:
                return "四";
            case 5:
                return "五";
            case 6:
                return "六";
        }
    }

    array.forEach(function (data) {
        date.setDate(data);
        if (format == ("EN" || "en")) {
            day.push(date.getDay());
        } else {
            day.push(formatStr(date.getDay()));
        }
    });
    return day;
};

/**
 * 返回两个日期之间的天数组
 */
var getDateRange = function(start,end,array,config){
    !config && (config = {});
    var startDate = stringToDate(start);
    var endDate = stringToDate(end);
    var y = endDate.getFullYear() - startDate.getFullYear();
    var m;
    if(y>0){
        m = 12 - startDate.getMonth() + endDate.getMonth();
    }else{
        m = endDate.getMonth() - startDate.getMonth();
    }
    var dates = [];
    var s = stringToDate(start)
    for(var i = 0;i <= m; i++){
        var _m = s.dateFormat('yyyy-MM')
        var _y =  _m + '-01';
        var _last = s.getLastDate().getDate();
        s.setDate(1);
        var _d = [];
        for(var j = 1; j <= _last;j++){
            var xt = stringToDate(_m + '-' + j).getTime()
            var nowDate = Date.now();
            var startDateT = startDate.getTime();
            var endDateT = endDate.getTime();
            var bo1 = xt >= startDateT;
            var bo2 = xt <= endDateT;

            var bo4 = xt <= nowDate;

            var ob = {day:j};
            if(bo1 && bo2){
                var bo3 = true;
                //在范围内的需要判断值是否在 时间范围内
                if(array){
                    bo3 = false;
                    for(var k = 0;k<array.length;k++){
                        var st = stringToDate(array[k].startTime).getTime();
                        var et = stringToDate(array[k].endTime).getTime();
                        if(xt >= st && xt <= et){
                            bo3 = true;
                            break;
                        }
                    }
                }
                ob.selected = bo3;
            }else{
                ob.hidden = true;
            }
            if(config.beforeTimeDiff && bo4){
                ob.hidden1 = true;
            }

            _d.push(ob);

            // if(bo1 && bo2){
            //     var bo3 = true;
            //     //在范围内的需要判断值是否在 时间范围内
            //     if(array){
            //         bo3 = false;
            //         for(var k = 0;k<array.length;k++){
            //             var st = stringToDate(array[k].startTime).getTime();
            //             var et = stringToDate(array[k].endTime).getTime();
            //             if(xt >= st && xt <= et){
            //                 bo3 = true;
            //                 break;
            //             }
            //         }
            //     }
            //     _d.push({
            //         day:j,
            //         selected:bo3
            //     })
            // }else{
            //     _d.push({
            //         day:j,
            //         hidden:true,
            //     })
            // }
        }
        var _yd = stringToDate(_y);
        var week = _yd.getDay();
        for(var a = week;a>0;a--){
            _d.unshift({display:true});
        }
        dates.push({
            month:_m,
            year:_y,
            dates:_d
        })
        s.calendar(2,1);
    }
    return dates;
}

/**
 * 将一维数组 转成二维数组
 * @param array 一维数组
 * @param size 平均数
 * @returns {Array} 二维数组
 */
var array1Change2 = function (array, size) {
    var b = [];
    var a = [];
    for (var i = 1, j = array.length; i <= j; i++) {
        a.push(array[i - 1]);
        if (i % size == 0) {
            b.push(a);
            a = [];
        } else if (i == j) {
            b.push(a);
            a = [];
        }
    }
    return b;
};

/**
 *
 * @param oldWidth 图片原宽
 * @param oldHeight 图片原高
 * @param limitWidth 限定宽
 * @param limitHeight 限定高
 * @returns {*[]} 返回array 宽高
 */
var proportionPhoto = function (oldWidth, oldHeight, limitWidth, limitHeight) {
    oldWidth = Number(oldWidth);
    oldHeight = Number(oldHeight);
    limitWidth = Number(limitWidth);
    limitHeight = Number(limitHeight);

    if (oldWidth <= limitWidth && oldHeight <= limitHeight) {
        return [oldWidth, oldHeight];
    }

    var a = oldWidth / oldHeight;
    var b = limitWidth / limitHeight;
    if (a >= 1 && b >= 1) {
        if (oldWidth / limitWidth > oldHeight / limitHeight) {
            return [limitWidth, Math.floor(limitWidth * oldHeight / oldWidth)];
        }
        return [Math.floor(oldWidth * limitHeight / oldHeight), limitHeight];
    }

    if (a >= 1 && b <= 1) {
        return [limitWidth, Math.floor(oldHeight * limitWidth / oldWidth)];
    }

    if (a <= 1 && b >= 1) {
        return [Math.floor(limitHeight * oldWidth / oldHeight), limitHeight];
    }

    if (a <= 1 && b <= 1) {
        if (oldWidth / limitWidth < oldHeight / limitHeight) {
            return [Math.floor(oldWidth * limitHeight / oldHeight), limitHeight];
        }
        return [limitWidth, Math.floor(limitWidth * oldHeight / oldWidth)];
    }
};

/**
 *  图片SWF 预览
 * @param data {width height src data.size}
 * @returns {string}
 */
var photoAndSwfPreview = function (data) {
    var wh = proportionPhoto(data.size[0], data.size[1], data.width, data.height);
    var adMarkUrl = data.adMarkUrl;
    var adMarkArea = data.adMarkArea;
    var photo = "";
    var style = "";
    var href = parseGet(baseUrl + "/views/preview.html", data);
    var a = "<a style='width: " + wh[0] + "px; height: 100%; position: absolute; cursor: pointer; opacity: 0; background-color: rgb(255, 255, 255);' href='" + href + "' target='_blank'></a>";
    if (data.style) {
        style = "top:" + (data.height - wh[1]) / 2 + "px;";
    }
    if (data.src.lastIndexOf(".swf") != -1) {
        photo = a + "<object width='" + wh[0] + "' height='" + wh[1] + "' align='middle' classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0'><param name='allowScriptAccess' value='always'><param name='movie' value='" + data.src + "'><param name='quality' value='high'><param name='bgcolor' value='#000'><param name='height' value='" + wh[1] + "'><param name='width' value='" + wh[0] + "'><param name='FlashVars' value='true'><param name='allowFullScreen' value='true'><param name='wmode' value='transparent'><param name='loop' value='true'><embed width='" + wh[0] + "' height='" + wh[1] + "' pluginspage='http://www.macromedia.com/go/getflashplayer' src='" + data.src + "' type='application/x-shockwave-flash' wmode='transparent' flashvars='false' allowfullscreen='true' loop='true' allowscriptaccess='always' bgcolor='#000' quality='high'></object>";
    } else {
        photo = a + "<img src='" + data.src + "' width='" + wh[0] + "' height='" + wh[1] + "'>";
    }

    //角标
    var adMark = '<span style="<%style%>"> <img style="display: block;" src="' + adMarkUrl + '" width="15" height="15">  </span>';
    var adMarkStyle = 'position: absolute;bottom: 2px;right: 0px;';
    switch (+adMarkArea) {
        case 1:
            adMarkStyle = 'position: absolute;top: 0;left: 0;';
            break;
        case 2:
            adMarkStyle = 'position: absolute;bottom: 0;left: 0;';
            break;
        case 3:
            adMarkStyle = 'position: absolute;top: 0;right: 0;';
            break;
        case 4:
            adMarkStyle = 'position: absolute;bottom: 0;right: 0;';
            break;
        default:
            break;
    }
    adMark = adMark.replace(/(<%style%>)/g, adMarkStyle);
    if(!adMarkUrl){adMark = ''}

    return "<div style='margin: 0 auto;position: relative;width: " + wh[0] + "px;height: "+ wh[1] +"px;" + style + "'>" + photo + adMark +"</div>";
};

/**
 *  图片SWF 预览 对联
 * @param data {width height src data.size}
 * @param data2
 * @returns {string}
 */
var photoAndSwfPreview2 = function (data, data2) {
    var wh = proportionPhoto(data.size[0], data.size[1], data.width, data.height);
    var adMarkUrl = data.adMarkUrl;
    var adMarkArea = data.adMarkArea;
    var photo = "";
    var style = "";
    var href = parseGet(baseUrl + "/views/preview.html", data);
    var a = "<a style='width: " + wh[0] + "px; height: 100%; display:block;position: absolute; cursor: pointer; opacity: 0; background-color: rgb(255, 255, 255);' href='" + href + "' target='_blank'></a>";
    if (data.style) {
        style = "top:" + (data.height - wh[1]) / 2 + "px;";
    }
    if (data.src.lastIndexOf(".swf") != -1) {
        photo = a + "<object width='" + wh[0] + "' height='" + wh[1] + "' align='middle' classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0'><param name='allowScriptAccess' value='always'><param name='movie' value='" + data.src + "'><param name='quality' value='high'><param name='bgcolor' value='#000'><param name='height' value='" + wh[1] + "'><param name='width' value='" + wh[0] + "'><param name='FlashVars' value='true'><param name='allowFullScreen' value='true'><param name='wmode' value='transparent'><param name='loop' value='true'><embed width='" + wh[0] + "' height='" + wh[1] + "' pluginspage='http://www.macromedia.com/go/getflashplayer' src='" + data.src + "' type='application/x-shockwave-flash' wmode='transparent' flashvars='false' allowfullscreen='true' loop='true' allowscriptaccess='always' bgcolor='#000' quality='high'></object>";
    } else {
        photo = a + "<img src='" + data.src + "' width='" + wh[0] + "' height='" + wh[1] + "'>";
    }
    var href2 = parseGet(baseUrl + "/views/preview.html", data2);
    var wh2 = proportionPhoto(data2.size[0], data2.size[1], data2.width, data2.height);
    var a2 = "<a style='width: " + wh2[0] + "px; height: 100%; display:block;position: absolute; cursor: pointer; opacity: 0; background-color: rgb(255, 255, 255);' href='" + href2 + "' target='_blank'></a>";
    var photo2 = "";
    if (data.src.lastIndexOf(".swf") != -1) {
        photo2 = a2 + "<object width='" + wh2[0] + "' height='" + wh2[1] + "' align='middle' classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0'><param name='allowScriptAccess' value='always'><param name='movie' value='" + data2.src + "'><param name='quality' value='high'><param name='bgcolor' value='#000'><param name='height' value='" + wh2[1] + "'><param name='width' value='" + wh2[0] + "'><param name='FlashVars' value='true'><param name='allowFullScreen' value='true'><param name='wmode' value='transparent'><param name='loop' value='true'><embed width='" + wh2[0] + "' height='" + wh2[1] + "' pluginspage='http://www.macromedia.com/go/getflashplayer' src='" + data2.src + "' type='application/x-shockwave-flash' wmode='transparent' flashvars='false' allowfullscreen='true' loop='true' allowscriptaccess='always' bgcolor='#000' quality='high'></object>";
    } else {
        photo2 = a2 + "<img src='" + data2.src + "' width='" + wh2[0] + "' height='" + wh2[1] + "'>";
    }

    //角标
    var adMark = '<span style="<%style%>"> <img style="display: block;" src="' + adMarkUrl + '" width="15" height="15">  </span>';
    var adMarkStyle = 'position: absolute;bottom: 2px;right: 0px;';
    switch (+adMarkArea) {
        case 1:
            adMarkStyle = 'position: absolute;top: 0;left: 0;';
            break;
        case 2:
            adMarkStyle = 'position: absolute;bottom: 0;left: 0;';
            break;
        case 3:
            adMarkStyle = 'position: absolute;top: 0;right: 0;';
            break;
        case 4:
            adMarkStyle = 'position: absolute;bottom: 0;right: 0;';
            break;
        default:
            break;
    }
    adMark = adMark.replace(/(<%style%>)/g, adMarkStyle);
    if(!adMarkUrl){adMark = ''}

    return "<div style='margin: 0 auto;position: relative;width: auto;height: auto;" + style + "'><div style='display: inline-block;position: relative;'>" + photo + adMark + "</div><div style='display: inline-block;position: relative;'>" + photo2 + adMark + "</div></div>";
};

/**
 *
 * @param num
 * @param n
 * @returns {*}
 */
function intAddZero(num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}
/**
 * 日期格式化
 * yyyy-MM-dd HH:mm:ss
 * @param str
 */
Date.prototype.dateFormat = function (str) {
    str = str || "yyyy-MM-dd";
    var y = this.getFullYear();
    var M = intAddZero(this.getMonth() + 1, 2);
    var d = intAddZero(this.getDate(), 2);
    var H = intAddZero(this.getHours(), 2);
    var m = intAddZero(this.getMinutes(), 2);
    var s = intAddZero(this.getSeconds(), 2);
    return str.replace("yyyy", y).replace("MM", M).replace("dd", d).replace("HH", H).replace("mm", m).replace("ss", s);
};

/**
 * 获取当月的最后一天
 */
Date.prototype.getLastDate = function () {
    var d = this.getDate();
    this.calendar(1, -(+d - 1)).calendar(2, 1).calendar(1, -1);
    return this
};

/**
 * 获取当月的最后一天
 */
Date.prototype.getFirstDate = function () {
    var d = this.getDate();
    this.calendar(1, -(+d - 1));
    return this
};

/**
 * 日期的加减
 * @param dateType 1天 2月 3年 4时 5分 6秒
 * @param num 加减的量
 */
Date.prototype.calendar = function (dateType, num) {
    switch (dateType) {
        case 1:
            var d = this.getDate();
            this.setDate(d + num);
            return this;
        case 2:
            var m = this.getMonth();
            this.setMonth(m + num);
            return this;
        case 3:
            var y = this.getFullYear();
            this.setFullYear(y + num);
            return this;
        case 4:
            var h = this.getHours();
            this.setHours(h + num);
            return this;
        case 5:
            var M = this.getMinutes();
            this.setMinutes(M + num);
            return this;
        case 6:
            var s = this.getSeconds();
            this.setSeconds(s + num);
            return this;
    }
};

/**
 * 将日期数组转成有时间范围的数组对象
 *
 * @param {any} array
 * @param {any} start 开始时间字段
 * @param {any} end 结束时间字段
 * @returns
 */
function makeDateRange(array,start,end){
    var _date = [];
    var _s;//范围开始时间
    var _e;//范围结束时间
    array.forEach(function(d,index,ob){
        if(!_e && !_s){
            _s = d;
            _e = d;
        }else{
            var _ss = new Date(_e).calendar(1,1).getTime();
            var _dd = new Date(d).getTime();
            if(_ss != _dd){
                var _bo = {};
                _bo[start] = _s;
                _bo[end] = _e || _s;
                _date.push(_bo);
                _s = _e = d;
            }else{
                _e = d
            }
        }

        if(index == ob.length -1){
            if(_e && _s){
                var _bo = {};
                _bo[start] = _s;
                _bo[end] = _e;
                _date.push(_bo);
            }else{
                var _bo = {};
                _bo[start] = _s;
                _bo[end] = _s;
                _date.push(_bo);
            }
        }
    })
    return _date;
}


/**
 * 计算两个时间之间相差的天数
 */
Date.differDate = function (startDate, endDate) {
    !(startDate instanceof Date) && (startDate = new Date(startDate));
    !(endDate instanceof Date) && (endDate = new Date(endDate));
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
};

/**
 * 计算两个时间之间相差的月数 按满月计算 不管天数
 */
Date.differMonth = function (startDate, endDate) {
    !(startDate instanceof Date) && (startDate = new Date(startDate));
    !(endDate instanceof Date) && (endDate = new Date(endDate));
    var sy = startDate.getFullYear();
    var ey = endDate.getFullYear();
    var sm = startDate.getMonth();
    var em = endDate.getMonth();
    if(sy == ey){
        return em - sm;
    }else{
        return (12-sm + em + 1 + (ey - sy - 1)*12)
    }
};

/**
 * 将24小时的01字符串转换为对应的小时
 * @param string {string}
 * @returns {Array}
 */
Date.stringForTime = function (string) {
    var _array = string.split('');
    var _a = [];
    _array.forEach(function (da, index) {
        if (da === '1') {
            _a.push(intAddZero(index, 2) + ':' + '00' + '-' + intAddZero(index, 2) + ':' + '59')
        }
    });
    return _a;
};

/**
 * 判断两个时间有完整月
 * @param startDate
 * @param endDate
 * @returns {boolean}
 */
Date.fullMonth = function (startDate, endDate) {
    var _s = startDate;
    var _e = endDate;
    !(startDate instanceof Date) && (startDate = new Date(startDate));
    !(endDate instanceof Date) && (endDate = new Date(endDate));
    var _sd = startDate.getDate();
    var _ed = endDate.getDate();

    var _d = Date.differDate(startDate, endDate) + 1;

    var _sm = startDate.getMonth();
    var _em = endDate.getMonth();

    var _slast = new Date(_s).getLastDate().getDate();
    var _elast = new Date(_e).getLastDate().getDate();

    if (startDate.getFullYear != endDate.getFullYear) {
        return true
    }

    if ((_em - _sm) >= 2) {
        return true
    } else if ((_em - _sm) == 0) {
        return _d >= _slast
    } else if ((_em - _sm) == 1) {
        if (_sd == 1 || _elast == _ed) {
            return true
        }
    }
    return false;
};

/**
 * 给定一个默认值为一定长度额数组
 * @param length
 * @param def
 * @returns {Array}
 */
var createArray = function (length, def) {
    var _a = [];
    for (var i = 0; i < length; i++) {
        _a.push(def);
    }
    return _a;
};
/**
 * 过滤空元素
 * @param array
 * @returns {*}
 */
var arrayFilter = function (array) {
    var _a = [];
    array.forEach(function (da) {
        if (!da) return;
        _a.push(da);
    });
    return _a
}

/**
 * 计算数组中 某个元素出现的个数
 */

var countElement = function (array, ele) {
    var i = 0;
    array.forEach(function (data) {
        if (data == ele) {
            i++
        }
    });
    return i;
};

/**
 * 查看数组是否包含 某个元素
 * @param array
 * @param ele
 * @returns {boolean}
 */
var containElement = function (array, ele) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === ele || array[i].id == ele.id) {
            return true;
        }
    }
    return false;
}

/**
 * 获取数组中的前几个元素
 */
var getFrontElement = function (array, num) {
    var _array = [];
    for (var i = 0; i < num; i++) {
        if (array[i]) {
            _array.push(array[i]);
        } else {
            return _array;
        }
    }
    return _array;
}

var getFirstOb = function (ob) {
    if (ob) {
        for (var i in ob) {
            return i;
        }
    }
}

function toQueryPair(key, value) {
    if (typeof value == 'undefined') {
        return key;
    }
    return key + '=' + encodeURIComponent(value === null ? '' : String(value));
}

function toBodyString(obj) {
    var ret = [];
    for (var key in obj) {
        var values = obj[key];
        if (values && values.constructor == Array) { //数组
            var queryValues = [];
            for (var i = 0, len = values.length, value; i < len; i++) {
                value = values[i];
                queryValues.push(toQueryPair(key, value));
            }
            ret = ret.concat(queryValues);
        } else { //字符串
            ret.push(toQueryPair(key, values));
        }
    }
    return ret.join('&');
}

/*补零*/
function fillZero(n) {
    if (n <= 9) {
        return "0" + n;
    } else {
        return "" + n;
    }
}

function chDate(str) {
    var res = [];
    var arr = str.split("-");
    for (var i = 0; i < arr.length; i++) {
        res.push(fillZero(arr[i]));
    }
    return res.join("-");
}

function getLocalTime(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleDateString().replace(/:\d{1,2}$/, ' ');
}

/**
 * 获取地址栏内指定的参数
 * @param name
 * @returns {*|string}
 */
var getSearch = function (name) {
    var reg = new RegExp('(?:^|&)' + name + '=([^&]*)(?:&|$)', 'i');
    return ((decodeURIComponent(location.search).split('?')[1] || '').match(reg) || [])[1] || '';
};

var parseGet = function (u, obj) {
    var p = '', j;
    for (j in obj) {
        obj.hasOwnProperty(j) && (p += j + '=' + obj[j] + '&');
    }
    return u + '?' + p + '_=' + new Date() * 1;
};

function getDateFormat(data) {
    var d = data || new Date();
    return d.getFullYear() + "-" + fillZero((+d.getMonth() + 1)) + "-" + fillZero(d.getDate());
}

// 判断浏览器是否支持placeholder属性
function isSupportPlaceholder() {
    var input = document.createElement('input');
    return 'placeholder' in input;
}

/**
 *
 * @param queryKey String
 * @param queryValue  Object
 * @param exclude Array 排除对象中的某些属性
 * @constructor
 */
var YcSessionStorage = function (queryKey, queryValue, exclude) {
    if (exclude instanceof Array) {
        exclude.forEach(function (da) {
            delete queryValue[da];
        });
    }
    window.sessionStorage.setItem(queryKey, JSON.stringify(queryValue));
};

/**
 * excel导出字段排除
 * @param showColumns
 * @param Column
 */
var exportFun = function (showColumns, Column) {
    var i = 0;
    for (var a in Column) {
        if (!Column[a]) {
            showColumns.splice(i, 1);
            --i;
        }
        i++;
    }
};

var isFunction = function (value) {
    return value instanceof Function;
};

var isArray = function (value) {
    return value instanceof Array;
};

(function () {
    // Private array of chars to use
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

    Math.uuid = function (len, radix) {
        var chars = CHARS, uuid = [], i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    };

    // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
    // by minimizing calls to random()
    Math.uuidFast = function () {
        var chars = CHARS, uuid = new Array(36), rnd = 0, r;
        for (var i = 0; i < 36; i++) {
            if (i == 8 || i == 13 || i == 18 || i == 23) {
                uuid[i] = '-';
            } else if (i == 14) {
                uuid[i] = '4';
            } else {
                if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid.join('');
    };

    // A more compact, but less performant, RFC4122v4 solution:
    Math.uuidCompact = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
})();

Math.format = function(number,type){
    type && (number = parseInt(number));
    var money1 = new Number(number);
    if (money1 > 1000000000000000000 || money1 < 0) {
        return;
    }
    var monee = Math.round(money1 * 100).toString(10)
    var i, j;
    j = 0;
    var leng = monee.length;
    var monval = "";
    for (i = 0; i < leng; i++) {
        monval = monval + to_upper(monee.charAt(i)) + to_mon(leng - i - 1,type);
    }
    return repace_acc(monval,type);

    function to_upper(a) {
        switch (a) {
            case '0': return '零';
            case '1': return '壹';
            case '2': return '贰';
            case '3': return '叁';
            case '4': return '肆';
            case '5': return '伍';
            case '6': return '陆';
            case '7': return '柒';
            case '8': return '捌';
            case '9': return '玖';
            default: return '';
        }
    }
    function to_mon(a,type) {
        if (a > 10) {
            a = a - 8;
            return (to_mon(a));
        }
        switch (a) {
            case 0: return type?'':'分';
            case 1: return type?'':'角';
            case 2: return type || '元';
            case 3: return '拾';
            case 4: return '佰';
            case 5: return '仟';
            case 6: return '万';
            case 7: return '拾';
            case 8: return '佰';
            case 9: return '仟';
            case 10: return '亿';
        }
    }

    function repace_acc(Money,type) {
        Money = Money.replace("零分", "");
        Money = Money.replace("零角", "零");
        var yy;
        var outmoney;
        outmoney = Money;
        yy = 0;
        while (true) {
            var lett = outmoney.length;
            if(type){
                outmoney = outmoney.replace("零"+type, type);
            }else{
                outmoney = outmoney.replace("零元", "元");
            }
            outmoney = outmoney.replace("零万", "万");
            outmoney = outmoney.replace("零亿", "亿");
            outmoney = outmoney.replace("零仟", "零");
            outmoney = outmoney.replace("零佰", "零");
            outmoney = outmoney.replace("零零", "零");
            outmoney = outmoney.replace("零拾", "零");
            outmoney = outmoney.replace("亿万", "亿零");
            outmoney = outmoney.replace("万仟", "万零");
            outmoney = outmoney.replace("仟佰", "仟零");
            yy = outmoney.length;
            if (yy == lett) break;
        }
        yy = outmoney.length;
        if (outmoney.charAt(yy - 1) == '零') {
            outmoney = outmoney.substring(0, yy - 1);
        }
        yy = outmoney.length;
        if (!type && outmoney.charAt(yy - 1) == '元') {
            outmoney = outmoney + '整';
        }
        return outmoney
    }
}

/**
 * 自定义滚动条
 * 
 * @param {any} $element 容器
 * @param {any} position 1上 2下 3左 4右
 */
function Scroll($element,config){
    this.event = {};
    this.range = config.range || 10;
    this.speed = config.speed || 1;
    this.$element = $element;
    this.$content = this.$element.firstElementChild;
    this.$content.style.position = 'absolute'
    this.boxHeight = $element.clientHeight;//容器高度
    this.maxHeight = this.$content.clientHeight;//需滚动的高度
    this.proportion = +(this.boxHeight/this.maxHeight);//比例
    this.position = config.position || 4;
    this.init();
}

/**
 * $element 滚动的元素
 * config 配置项 position：方向（1,2,3,4） range：速度 $mutation：监听dom变化的配置项，没有就不监听  一般用于元素宽高变化的情况
 * callback 有$mutation 配置参数的情况才有回调函数
 */
Scroll.start = function($element,config,callback){
    var startEvent = 'mouseover';
    var endEvent = 'mouseleave';
    var clickEvent = 'mouseup'

    var scroll;
    if(navigator.userAgent.match(/.*Mobile.*/)){
        startEvent = 'touchstart';
        endEvent = 'touchend';
        scroll = new Scroll($element,config);
    };

    function mutationFun (scroll,$mutation){
        //监听对象
        var target = $mutation.element;

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver

        // 创建观察者对象
        var observer = new MutationObserver(function(mutations){
            if(mutations && mutations.length > 0){
                console.info(scroll.$content.style.top);
                callback && callback(mutations,scroll);
            }
        });
        
        // 配置观察选项:config.$mutation.config
        
        // 传入目标节点和观察选项
        observer.observe(target, $mutation.config);
    }

    function scrollChange(e){
        if(scroll){
            if(scroll.initHeight()){
                scroll.btnHide();
                return;
            }
            scroll.btnShow();
        }else{
            scroll = new Scroll($element,config);
            config.$mutation && mutationFun(scroll,config.$mutation);
        }
    }

    $element.addEventListener(startEvent,scrollChange);

    $element.addEventListener(endEvent,function(e){
        if(scroll){
            if(!scroll.move){
                scroll.btnHide();
            }
        }
        scroll.callback = function(){
            scroll.btnHide()
        }
    });
}

Scroll.prototype = {
    btnShow:function(){
        var _this = this;
        var $btn = _this.$btn;
        $btn.classList.remove('fadeOut');
        $btn.style.display = 'block';
        $btn.classList.add('animated','fadeIn');
    },
    btnHide:function(){
        var _this = this;
        var $btn = _this.$btn;
        $btn.classList.remove('fadeIn');
        $btn.classList.add('fadeOut');
        setTimeout(function() {
            $btn.style.display = 'none';
        }, 150);
    },
    destroy:function(){
        var _this = this;
        var $content = _this.$content;
        var $btn = _this.$btn;
        var mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
        $content.removeEventListener(mousewheelevt,_this.event.content_mousewheelevt);
        $btn.removeEventListener('mousedown',_this.event.btn_mousedown);
        document.removeEventListener('mousemove',_this.event.document_mousemove);
        $btn.removeEventListener('touchstart',_this.event.btn_touchstart);
        document.removeEventListener('touchmove',_this.event.document_touchmove);
        document.removeEventListener('touchend',_this.event.document_touchend);
        $content.removeEventListener('touchstart',_this.event.content_touchstart);
        $content.removeEventListener('touchmove',_this.event.content_touchmove);
        $content.removeEventListener('touchend',_this.event.content_touchend);
        _this.btnHide();
    },
    pcInit:function(){
        var $content = this.$content;
        var $btn = this.$btn;

        var _this = this;
        var mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";

        _this.event.content_mousewheelevt = function(e){
            e.preventDefault();
            e.stopPropagation();
            // _this.range = 10;
            var d = e.wheelDelta || -e.detail;
            _this.slide(d > 0);
        }
        $content.addEventListener(mousewheelevt,_this.event.content_mousewheelevt);

        _this.event.btn_mousedown = function(e){
            e.stopPropagation();
            e.preventDefault();
            _this.x = e.clientX;
            _this.y = e.clientY;
        }
        $btn.addEventListener('mousedown',_this.event.btn_mousedown);

        _this.event.document_mousemove = function(e){
            e.stopPropagation();
            e.preventDefault();
            if(e.buttons == 1){
                var x = e.clientX;
                var y = e.clientY;
                var oldY = _this.y;
                if(y == oldY){return};
                var bo = y - oldY < 0;
                _this.range = _this.y - y;
                _this.slide(true);
                _this.y = y;
            }
        }
        document.addEventListener('mousemove',_this.event.document_mousemove);
    },
    mobileInit:function(){
        var _this = this;
        var $content = this.$content;
        var $btn = this.$btn;
        this.range = 2;

        _this.event.btn_touchstart = function(e){
            e.stopPropagation();
            e.preventDefault();
            var touchstart = e.changedTouches;
            if(touchstart && touchstart.length == 1){
                var touch = touchstart[0];
                _this.dragging = true;
                _this.x = touch.clientX;
                _this.y = touch.clientY;
            }
        }
        $btn.addEventListener('touchstart',_this.event.btn_touchstart);

        _this.event.document_touchmove = function(e){
            e.stopPropagation();
            e.preventDefault();
            if(!_this.dragging){return};
            var touchmove = e.changedTouches;
            if(touchmove && touchmove.length == 1){
                var touch = touchmove[0];
                var x = touch.clientX;
                var y = touch.clientY;
                if(y == _this.y){return};
                _this.range = _this.y - y;
                _this.slide(true);
                _this.y = y;
            }
        }

        document.addEventListener('touchmove',_this.event.document_touchmove);

        _this.event.document_touchend = function(e){
            _this.dragging = false;
        }
        document.addEventListener('touchend',_this.event.document_touchend)

        _this.event.content_touchstart = function(e){
            // e.stopPropagation();
            e.preventDefault();
            _this.move && _this.move.$setInterval && clearInterval(_this.move.$setInterval);
            var touchstart = e.changedTouches;
            if(touchstart && touchstart.length == 1){
                var touch = touchstart[0];
                var x = touch.clientX;
                var y = touch.clientY;
                _this.move = new MovePoint(x,y);
                _this.move.time = e.timeStamp
            }
        }
        $content.addEventListener('touchstart',_this.event.content_touchstart);

        _this.event.content_touchmove = function(e){
            if(!_this.move){return};
            var touchmove = e.changedTouches;
            if(touchmove && touchmove.length == 1){
                var touch = touchmove[0];
                var x = touch.clientX;
                var y = touch.clientY;

                this.range = 2;
                
                var path = _this.move.move(x,y)*180/Math.PI;
                var direction = _this.move.path(path);
                _this.move.direction = direction;
                if(direction == 1){
                    _this.slide(false)
                }else if(direction == 2){
                    _this.slide(true)
                }
                _this.move.x = x;
                _this.move.y = y;
            }
        }
        $content.addEventListener('touchmove',_this.event.content_touchmove);

        _this.event.content_touchend = function(e){
            if(!_this.move){return};
            var touchend = e.changedTouches;
            if(touchend && touchend.length == 1){
                var touch = touchend[0];
                var x = touch.clientX;
                var y = touch.clientY;
                var speed = _this.move.speed(e.timeStamp,x,y);
                if(speed > 0.8 && _this.$last == false){
                    _this.range = Math.floor(6*speed);
                    var $setInterval = _this.move.$setInterval = setInterval(function(){
                        var bo = false;
                        if(_this.move.direction == 1){
                            bo = false;
                        }else if((_this.move.direction == 2)){
                            bo = true;
                        }
                        _this.slide(bo,function(){
                            _this.$last = true;
                        });
                        _this.range = _this.range - 0.5;
                        if(_this.range < 0 || _this.$last){
                            clearInterval($setInterval);
                            _this.callback && _this.callback();
                            _this.range = 2;
                            _this.move = null;
                        }
                    },20)
                }else{
                    _this.move = null;
                }
            }
        }
        $content.addEventListener('touchend',_this.event.content_touchend);
    },
    initHeight:function(){
        var position = this.position;
        
        switch (+position) {
            case 1:
            case 2:
            this.boxHeight = this.$element.clientWidth;//容器高度
            this.maxHeight = this.$content.clientWidth;//需滚动的高度
            this.proportion = +(this.boxHeight/this.maxHeight);//比例
            if(this.proportion >= 1){
                this.$btn.style.left = '0px';
                this.$content.style.left = '0px';
            }
            var btnHeight = +(this.boxHeight*this.proportion);
            if(btnHeight < 20){
                btnHeight = 20;
            }
            this.btnHeight = btnHeight;

            this.$btn.style.height = '8px';
            this.$btn.style.width = this.btnHeight + 'px';
            break;
            case 3:
            case 4:
            default:
            this.boxHeight = this.$element.clientHeight;//容器高度
            this.maxHeight = this.$content.clientHeight;//需滚动的高度

            var proportion = this.proportion;
            var rangeHeight = this.range/proportion;

            this.proportion = +(this.boxHeight/this.maxHeight);//比例
            if(this.proportion >= 1){
                this.$content.style.top = '0px';
                this.$btn.style.top = '0px';
            }

            var btnHeight = +(this.boxHeight*this.proportion);
            if(btnHeight < 20){
                btnHeight = 20;
            }
            this.btnHeight = btnHeight;

            this.$btn.style.height = this.btnHeight + 'px';
            this.$btn.style.width = '8px';
            break;
        }
        return this.proportion >= 1;
    },
    location:function(){//1上 2下 3左 4右
        var position = this.position;
        var $scroll = this.$scroll;
        var $btn = this.$btn;
        switch (+position) {
            case 1:
                // $scroll.classList.add('scroll-position-1');
                $btn.classList.add('scroll-position-1');
            break;
            case 2:
                // $scroll.classList.add('scroll-position-2');
                $btn.classList.add('scroll-position-2');
            break;
            case 3:
                // $scroll.classList.add('scroll-position-3');
                $btn.classList.add('scroll-position-3');
            break;
            case 4:
                // $scroll.classList.add('scroll-position-4');
                $btn.classList.add('scroll-position-4');
            break;
            default:
                // $scroll.classList.add('scroll-position-4');
                $btn.classList.add('scroll-position-4');
                break;
        }
    },
    init:function(){
        //创建必要元素
        // var $scroll = document.createElement('div');
        // $scroll.classList.add('scroll');
        // this.$element.appendChild($scroll);
        // this.$scroll = $scroll;
        this.$content.style.position = 'absolute'
        var $btn = document.createElement('div');
        $btn.classList.add('scroll-btn');
        this.$element.appendChild($btn);
        this.$btn = $btn;
        this.location();
        this.addEvent();
        if(this.initHeight()){
            this.btnHide();
            return
        };//计算高度
        this.btnShow();//展现滚轮
        
    },
    addEvent:function(){
        //初始化事件
        if(navigator.userAgent.match(/.*Mobile.*/)){
            this.mobileInit();
        }else{
            this.pcInit();
        }
    },
    slide:function(bo,callback){
        var proportion = this.proportion;
        if(proportion >= 1)return;
        var position = this.position;
        var $position = 'left';
        switch (+position) {
            case 1:
            case 2:
            $position = 'left';
            break;
            case 3:
            $position = 'top';
            break;
            case 4:
            $position = 'top';
            break;
            default:
            $position = 'top';
                break;
        }

        var $content = this.$content;//内容
        var $btn = this.$btn;//按钮

        var btnTop = +$btn.style[$position].replace(/px/ig,'');
        var contentTop = +$content.style[$position].replace(/px/ig,'');

        var rangeHeight = this.range/this.proportion;//内容滑动的高度
        var boxHeight = this.boxHeight;
        var btnHeight = this.btnHeight;
        var maxHeight = this.maxHeight;
        var range = this.range;

        this.$last = false;//是否滚到最后或开始

        if(bo){
            btnTop = btnTop - range;
            if(btnTop < 0){
                btnTop = 0;
            }
            if(btnTop > (boxHeight - btnHeight)){
                btnTop = boxHeight - btnHeight
            }
            contentTop = contentTop + rangeHeight;
            if(contentTop > 0){
                contentTop = 0;
                this.$last = true;
            }
            if(Math.abs(contentTop) > (maxHeight - boxHeight)){
                contentTop = (boxHeight - maxHeight);
                this.$last = true;
            }
            $btn.style[$position] = btnTop + 'px';
            $content.style[$position] = contentTop + 'px';
        }else{
            btnTop = btnTop + range;
            if(btnTop > (boxHeight - btnHeight)){
                btnTop = boxHeight - btnHeight
            }
            contentTop = contentTop - rangeHeight;
            if(Math.abs(contentTop) > (maxHeight - boxHeight)){
                contentTop = boxHeight - maxHeight
                this.$last = true;
            }
            $btn.style[$position] = btnTop + 'px';
            $content.style[$position] = contentTop + 'px';
        }
    }
}

//移动端 手势移动方向
function MovePoint(x,y) {
    this.x = x;
    this.oldX = x;
    this.y = y;
    this.oldY = y;
}
MovePoint.prototype = {
    move:function(x, y){
        return Math.atan2(y-this.y,x-this.x);
    },
    //1向上 2向下 3向左 4向右 0未滑动
    path:function (path) {
        if (path >= -135 && path <= -45) {
            return 1;
        } else if (path > 45 && path < 135) {
            return 2;
        } else if ((path >= 135 && path <= 180) || (path >= -180 && path < -135)) {
            return 3;
        } else if (path >= -45 && path <= 45) {
            return 4;
        }
    },
    speed:function(time,x,y){//速度
        var x = Math.abs(this.oldX - x);
        var y = Math.abs(this.oldY - y);
        var p = Math.pow(x,2) + Math.pow(y,2);
        return Math.sqrt(p)/(time-this.time);
    }
}
