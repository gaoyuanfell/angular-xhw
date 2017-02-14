window.addEventListener('load', function () {
    var menu = document.querySelector('.frame-menu .menu');
    menu && menu.setAttribute('click-num',0);

    var event = 'click';
    var mobile = navigator.userAgent.match(/.*Mobile.*/);
    if(mobile){
        event = 'touchend';
    }
    menu && menu.addEventListener(event, function (e) {

        window.sessionStorage.clear()

        var tar = e.target;
        var nodeName = tar.nodeName
        var ele = nodeName == 'P' ? tar : tar.parentNode;
        if (ele.nodeName == 'P') {
            var clickNum = +menu.getAttribute('click-num');//记录点击次数

            var p = ele.nextElementSibling;
            var ul = window.top.document.querySelector('.frame-menu .menu-pl ul.active');
            if (ele.nodeName == 'P') {
                ul && (ul.previousElementSibling.querySelector('.status').innerHTML = '&#xe602;', heightMenu(ul, 1, 10, function () {
                    ul.classList.remove('active');
                    menu.setAttribute('click-num',++clickNum);
                }));
                if (!p.classList.contains('active')) {
                    heightMenu(p, 0, 10, function () {
                        p.classList.add('active');
                        menu.setAttribute('click-num',++clickNum);
                    });
                    ele.querySelector('.status').innerHTML = '&#xe608;'
                } else if(ul !== p){
                    heightMenu(p, 1, 10, function () {
                        p.classList.remove('active');
                        menu.setAttribute('click-num',++clickNum);
                    });
                    ele.querySelector('.status').innerHTML = '&#xe602;'
                }
            }
        }else if(nodeName == 'A'){
            e.preventDefault();
            var route = tar.getAttribute('href');
            top.location.hash = route;
        }
    })

    window.top.$createBg = function (callback) {
        var menu = document.querySelector('.frame-menu .menu');
        var menuBg = document.createElement('div');
        menuBg.classList.add('menu-bg', 'animated', 'fadeIn');
        menu.parentNode.insertBefore(menuBg, menu);
        menuBg.style.display = 'block';
        var frame = document.querySelector('.frame-top');
        frame.classList.add('user-select-none');
        frame.style.backgroundColor = 'transparent';
        
        window.top.$backgroundColor && clearTimeout(window.top.$backgroundColor);
        
        function close() {
            menuBg.classList.remove('fadeIn');
            menuBg.classList.add('fadeOut');

            frame.classList.remove('user-select-none');
            callback && callback();
            setTimeout(function () {
                document.querySelector('.frame-menu').removeChild(menuBg);
            }, 150)
            window.top.$backgroundColor = setTimeout(function () {
                frame.style.backgroundColor = '#f5f8fa';
                delete window.top.$backgroundColor;
            }, 150)
        }

        menuBg.addEventListener('click', close);
        return function () {
            menuBg.classList.remove('fadeIn');
            menuBg.classList.add('fadeOut');
            frame.classList.remove('user-select-none');
            setTimeout(function () {
                document.querySelector('.frame-menu').removeChild(menuBg);
            }, 150)
            window.top.$backgroundColor = setTimeout(function () {
                frame.style.backgroundColor = '#f5f8fa';
                delete window.top.$backgroundColor;
            }, 150)
        };
    }

    // window.top.$headerBg = function(bo){
    //     var franeTop = document.querySelector('.frame-top');
    //     var color = bo?'#f5f8fa':'';
    //     franeTop.style.backgroundColor = color;
    // }

    window.top.$checkNumChange = function(_num){
        var checkOrdersCount = top.document.querySelector('._checkOrdersCount');
        if(checkOrdersCount){
            var num = +checkOrdersCount.innerText || 0;
            if(num == 0){
                checkOrdersCount.parentNode.style.display = 'block'
            }
            num = checkOrdersCount.innerText = num + _num;
            if(num == 0){
                checkOrdersCount.parentNode.style.display = 'none'
            }
        }
    }

    window.top.$setCheckNumChange = function(_num){
        var checkOrdersCount = top.document.querySelector('._checkOrdersCount');
        if(checkOrdersCount){
            checkOrdersCount.innerText = _num
            if(_num == 0){
                checkOrdersCount.parentNode.style.display = 'none'
            }else{
                checkOrdersCount.parentNode.style.display = 'block';
                checkOrdersCount.parentNode.classList.remove('ng-hide');
            }
        }
    }

    //消息
    $('.frame-top .massage').on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $massage = e.target;
        var left =  $massage.offsetLeft;
        var width =  $massage.offsetWidth;
        var bo = $('.message_box').is(':hidden')
        var dialog = 'dl' + Date.now();
        var $dialog = $('<div id="' + dialog + '" class="dialog-bg-tm animated fadeIn"></div>');
        var $message_box = $('.message_box table')
        if (bo) {
            $('.message_box').css({right: 400 - 124 - left - width/2 + 'px'}).fadeIn(150);
            $('body').append($dialog);
            function close() {
                $('.message_box').fadeOut(150);
                $dialog.removeClass('animated fadeIn');
                $dialog.addClass('animated fadeOut');
                setTimeout(function () {
                    $dialog.remove();
                }, 100);
                $message_box.unbind();
            }

            $dialog.on('click', close);
            $message_box.on('click', close);
        } else {
            $('.message_box').fadeOut(150);
        }
    })

    //个人信息
    $('.frame-top .user-info').on('click', function (e) {
        e.stopPropagation();
        var bo = $('.user_info_box').is(':hidden')
        var dialog = 'dl' + Date.now();
        var $dialog = $('<div id="' + dialog + '" class="dialog-bg-tm animated fadeIn"></div>');
        var $userInfoBox = $('.user_info_box table');
        if (bo) {
            $('.user_info_box').fadeIn(150);
            $('body').append($dialog);
            function close() {
                $('.user_info_box').fadeOut(150);
                $dialog.removeClass('animated fadeIn');
                $dialog.addClass('animated fadeOut');
                setTimeout(function () {
                    $dialog.remove();
                }, 100);
                $userInfoBox.unbind()
            }

            $dialog.on('click', close)
            $userInfoBox.on('click', close)
        } else {
            $('.user_info_box').fadeOut(150);
        }
    })
})

//加载默认路由
function start(Route, _hash) {
    var a = window.top.document.querySelectorAll('.frame-menu a[data-route]');
    if (a && a.length > 0) {
        for (var i = 0, j = a.length; i < j; i++) {
            var _a = a[i];
            var r = _a.getAttribute('data-route');
            _a.setAttribute('href', '#' + Route.key + '/' + r);
        }
    }
    var hash = Route.getHash();
    var l = hash.indexOf('?');
    var route = l == -1 ? (hash) : (hash.substr(0, l));
    if (Route.getUrl(hash)) {
        Route.changeState(route);
    } else if (Route.getUrl(_hash)) {
        top.location.hash = '#' + Route.key + '/' + _hash;
        Route.changeState(route);
    }
}
//路由改变后执行的方法
function domMenu(hash) {
    // dom操作
    var ul = window.top.document.querySelectorAll('.frame-menu .menu-pl ul');
    var ulActive = window.top.document.querySelector('.frame-menu .menu-pl ul.active');

    // 1.去掉携带的参数 2.去掉新增修改的后缀
    var _hash = hash;
    var l = _hash.indexOf('?');
    _hash = l == -1 ? _hash : _hash.substr(0, l);
    _hash = _hash.replace(/(add)$|(edit)$|(create)$|(createAdd)$|(createEdit)$|(edit)$|(check)$/ig, '')
    var $active = window.top.document.querySelector('.frame-menu .menu-pl ul a[data-route=' + _hash + ']');

    if (ulActive) {
        var _$active = ulActive.querySelector('a[data-route=' + _hash + ']');
        var a = window.top.document.querySelector('.frame-menu .menu-pl ul a[data-route].select');
        a && a.classList.remove('select');
        if (!_$active) {
            heightMenu(ulActive, 1, 10, function () {
                ulActive.classList.remove('active');
            });
            ulActive.previousElementSibling.querySelector('i.status').innerHTML = '&#xe602;';

            $active && setTimeout(function () {
                var p = $active.parentNode.parentNode;
                heightMenu(p, 0, 10, function () {
                    p.classList.add('active');
                });
                $active.classList.add('select');
                p.previousElementSibling.querySelector('i.status').innerHTML = '&#xe608;';
            }, 500)
        } else {
            $active && $active.classList.add('select');
        }
    } else if($active){
        $active.classList.add('select');
        var p = $active.parentNode.parentNode;
        heightMenu(p, 0, 10, function () {
            p.classList.add('active');
        });
    }
}

function clearSession(hash){
    var _hash = hash;
    var l = _hash.indexOf('?');
    _hash = l == -1 ? _hash : _hash.substr(0, l);
    _hash = _hash.replace(/(add)$|(edit)$|(create)$|(createAdd)$|(createEdit)$|(edit)$|(check)$/ig, '')
    var $active = window.top.document.querySelector('.frame-menu .menu-pl ul a[data-route=' + _hash + ']');
    if(!$active){
        window.sessionStorage.clear()
    }
}

// window hash标志 iframe ID
!function (win, key, frame) {
    var _self;
    var config = {
        startWill: function (_hash) {
            start(this, _hash);
        },
        startComponent: function () {

        },
        stateWill: function (hash) {
            ycui.loading.show();
            domMenu(hash);
            clearSession(hash);
        },
        stateComponent: function () {
            ycui.loading.hide();
        }
    }

    if (!win.top.$R) {
        _self = win.top.$R = new Route(key, frame, config);
    }
}(this.top, '!', 'iframe');

app.controller('menuCtrl', ['$scope', 'SysRuleUserFty', 'SysLoginUserFty', 'SysNoticeFty', 'SysUserFty',
    function ($scope, SysRuleUserFty, SysLoginUserFty, SysNoticeFty, SysUserFty) {

        //保持回话
        setInterval(function () {
            SysLoginUserFty.loginUserInfo().then(function(res){
                if(res){
                    console.info('keep session')
                }
            })
        }, 60 * 1000 * 29);

        $scope.$on('ruleList-finish', function () {
            $R.start('Index');
            //不是谷歌浏览器 采用自定义滚动条
            var chrome = /Chrome/.exec(navigator.userAgent)
            var Edge = /Edge/.exec(navigator.userAgent)
            var Mobile = navigator.userAgent.match(/.*Mobile.*/);
            if(!Mobile && !chrome){
                var $element = document.querySelector('.menu');
                var config = {
                    position:4,//默认4
                    range:40,//滚轮的速度
                    $mutation:{//MutationObserver 的配置项 可以没有 在div的宽高变化的情况下加此配置项
                        config:{
                            attributes: true,
                            // childList: true,
                            // characterData: true ,
                            // subtree:true,
                            attributeFilter:['click-num'],
                            attributeOldValue:true
                        },
                        element:$element
                    },
                };
                function callback(mutations,scroll){
                    mutations.forEach(function(mutation){
                        var t = mutation.target;
                        if(t.classList.contains('menu')){
                            if(scroll.initHeight()){
                                scroll.btnHide();
                                return;
                            }
                            scroll.btnShow();
                        }
                    })
                }
                Scroll.start($element,config,callback);
                $scope.idGoogleBow = false;
            }else{
                $scope.idGoogleBow = true;
            }
        })

        SysLoginUserFty.loginUserInfo().then(function (data) {
            if (data && data.code == 200) {
                $scope.user = data;
            }
        })

        SysUserFty.getCheckOrdersCount().then(function (res) {
            if (res && res.code == 200) {
                var count = res.count;
                $scope.checkOrdersCount = count > 99?99:count;
            }
        });

        /*用户信息获取*/
        $scope.userInfo = function () {
            $scope.userInfoModule = {
                title: '用户信息',
                okClick: function () {

                }
            }
            SysUserFty.userInfo({id: $scope.user.id}).then(function (data) {
                if (data) {
                    $scope.user = data;
                }
            })
        };

        // 退出登录
        $scope.loginOut = function () {
            SysLoginUserFty.loginOut().then(function (data) {
                if (data && data.code == 200) {
                    window.sessionStorage.clear();
                    top.window.location.href = baseUrl + "/login.html";
                }
            });
        }

        //公告详情
        $scope.getInfoNotice = function (item, $event) {
            SysNoticeFty.noticeRead({id: item.id}).then(function () {
                SysNoticeFty.viewNotice({readState: 0}).then(function (res) {
                    if (res && res.code == 200) {
                        $scope.noticeList = res.items;
                        $scope.mshNum = res.items.length;
                    }
                });
                $scope.noticeInfoModule = {
                    title: '【' + item.title + '】公告详细信息',
                    okClick: function () {

                    },
                    data: item
                }
            });
            //
            //
            // var _content = item.content.replace(/\n/g,'<br/>');
            // // var html = "<div style='text-align: left;font-weight: bold;font-size: 20px;'>" + data.title + "</div><div style='max-height: 350px;height:auto;margin: 10px 0 0 30px;font-size: 16px;text-align: left;overflow-y: auto;max-width: 500px'>" + _content + "</div>";
            // var html = "<div style='max-height: 350px;height:auto;margin: 10px 0 0 30px;font-size: 14px;text-align: left;overflow-y: auto;max-width: 500px'>" + _content + "</div>";
            // SysNoticeFty.noticeRead({id:item.id}).then(function () {
            //     SysNoticeFty.viewNotice({readState:0}).then(function (res) {
            //         if (res && res.code == 200) {
            //             $scope.noticeList = res.items;
            //             $scope.mshNum = res.items.length;
            //         }
            //     });
            // })
        }


        // 修改密码
        $scope.passwordEdit = function () {
            $scope.user.oldPassword = '';
            $scope.user.newPassword = '';
            $scope.user.okPassword = '';
            $scope.validation = function () {
                SysUserFty.validPwd({id: $scope.user.id, logPwd: md5($scope.user.oldPassword)}).then(function (res) {
                    if (res && res.code == 200) {
                        $scope.validaMsgBo = false;
                    } else {
                        $scope.validaMsgBo = true;
                        $scope.validaMsgStr = res.msg;
                    }
                })
            }

            $scope.$watch('user.newPassword+user.okPassword', function () {
                if ($scope.user.newPassword == $scope.user.okPassword) {
                    $scope.validaMsgStr = '';
                    $scope.validaMsgBo = false;
                }
            });

            $scope.passwordEditModule = {
                title: '修改登录密码',
                okClick: function () {
                    if (!$scope.validaMsgBo) {
                        if (
                            $scope.user &&
                            ($scope.user.oldPassword.length >= 6 &&
                            $scope.user.newPassword.length >= 6 &&
                            $scope.user.okPassword.length >= 6) &&
                            ($scope.user.newPassword == $scope.user.okPassword)) {
                            var body = {
                                id: $scope.user.id,
                                logPwd: md5($scope.user.oldPassword),
                                newLogPwd: md5($scope.user.newPassword)
                            }
                            SysUserFty.updatePwd(body).then(function (res) {
                                if (res && res.code == 200) {
                                    var t = new Date((new Date()).getTime() + 60 * 60 * 24 * 1000 * 30);
                                    cookie.set('user', JSON.stringify({
                                        logName: $scope.user.logName,
                                        logPwd: md5($scope.user.newPassword)
                                    }), {domain: location.hostname, expires: t, path: "/"});
                                    cookie.set(md5($scope.user.logName), JSON.stringify({
                                        logName: $scope.user.logName,
                                        logPwd: md5($scope.user.newPassword)
                                    }), {domain: location.hostname, expires: t, path: "/"});

                                    $scope.validaMsgStr = '';
                                    $scope.validaMsgBo = false;

                                    setTimeout(function () {
                                        ycui.alert({
                                            content: res.msg,
                                            timeout: 10
                                        })
                                    }, 500)
                                }
                            })
                        } else {
                            if ($scope.user.newPassword != $scope.user.okPassword) {
                                $scope.validaMsgStr = '两次密码输入不一致！';
                            } else {
                                $scope.validaMsgStr = '密码至少6字符';
                            }
                            $scope.validaMsgBo = true;
                            return true;
                        }
                    } else {
                        return true;
                    }
                },
                noClick: function () {

                }
            }
        }

        /*获取公告信息*/
        SysNoticeFty.viewNotice({readState: 0}).then(function (res) {
            if (res && res.code == 200) {
                $scope.noticeList = res.items;
                $scope.mshNum = res.items.length;
            }
        });

        // SysNoticeFty.viewNotice({readState:0}).then(function (res) {
        //     console.info(res);
        //     if (res && res.code == 200) {
        //         $scope.noticeList = res.items || [];
        //     }
        // });

        var rules = {'广告订单': [], '资源管理': [], '客户管理': [], '数据报表': [], '系统设置': []};
        SysRuleUserFty.getUserRights().then(function (res) {
            if (res && res.code == 200) {
                var items = res.items;
                for (var i = 0, j = items.length; i < j; i++) {
                    var item = items[i];
                    if (item.childRights && item.childRights.length > 0) {
                        rules[item.firstRightName] = item.childRights;
                    }
                }

                var $m = [];
                $menu.forEach(function (me) {
                    var name = me.name;
                    var ml = me.list;
                    for (var j = 0; j < ml.length; j++) {
                        var bo = true;
                        var rl = rules[name];
                        var mel = ml[j];
                        for (var i = 0; i < rl.length; i++) {
                            if (mel.name.replace(/\d/g, '') == rl[i].verify) {
                                bo = false;
                                $m.push(mel)
                                break;
                            }
                        }
                        if (bo) {
                            ml.splice(j, 1);
                            j--;
                        }
                    }
                })

                $R.reg($r.concat($m));
                $R.reg({ name: 'Holiday', url: 'ADManage/holidayList.html' })
                $R.reg({ name: 'Help', url: 'help.html' })
                $menu.unshift({name: '首页', list: [{name: 'Index', url: 'index.html', title: '公告'}], icon: '&#xe604;'})
                $scope.ruleList = $menu;
            }
        })
    }])
