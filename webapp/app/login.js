/**
 * Created by Yuan on 2016/3/24 0024.
 */
!function (app) {
    app.controller("loginCtrl", ["$scope", "SysLoginUserFty", "$document", function ($scope, SysLoginUserFty, $document) {
        if((!/Chrome/.exec(navigator.userAgent) || /Edge/.exec(navigator.userAgent)) && !navigator.userAgent.match(/.*Mobile.*/)){
            $scope.ChromeManager = true;//不是谷歌浏览器 提示用户下载谷歌浏览器
        }

        if(login_session){
            SysLoginUserFty.loginUserInfo().success(function (data) {
                if(data && data.code == 200){
                    window.top.location.href = baseUrl + "/views/frame.html";
                }
            })
        }

        $scope.user = {};
        if(cookie.get('user')){
            try {
                $scope.user = JSON.parse(cookie.get('user'));
            }catch (e){
                cookie.remove('user')
            }
        }
        if(cookie.get(md5('rememberPwd'))){
            try {
                $scope.rememberPwd = JSON.parse(cookie.get(md5('rememberPwd'))).rememberPwd;
            }catch (e){
                cookie.remove(md5('rememberPwd'))
            }
        }
        //验证码刷新
        var initImg = function () {
            var img = new Image();
            img.onload = function () {
                $scope.$apply(function () {
                    $scope.imgSrc = img.src;
                })
            };
            img.src = baseUrl + "/checkcode/code.htm?_=" + new Date().getTime();
        };

        $scope.$watch('rememberPwd',function(newV,oldV){
            if(newV != oldV){
                var t = new Date((new Date()).getTime() + 60 * 60 * 24 * 1000 * 30);
                cookie.set(md5('rememberPwd'),JSON.stringify({rememberPwd:newV}),{domain:location.hostname,expires: t,path: "/"});
            }
        })

        if(window.sessionStorage && window.sessionStorage.getItem("loginErrorNum")){
            $scope.errorNum = window.sessionStorage.getItem("loginErrorNum");
            initImg();
        }
        var validate = function () {
            if (!$scope.user.logName || $scope.user.logName == "") {
                $scope.msg = "请输入用户名";
                return false;
            }
            if (!$scope.user.logPwd || $scope.user.logPwd == "") {
                $scope.msg = "请输入密码";
                return false;
            }
        };
        $scope.login = function () {
            if (!$scope.user.logName) {
                $scope.msg = "请输入用户名";
                return
            }
            if (!$scope.user.logPwd) {
                $scope.msg = "请输入密码";
                return
            }
            delete $scope.msg;
            var logPwd = md5($scope.user.logPwd);
            var query = {
                logName:$scope.user.logName,
                logPwd:logPwd
            };
            if(cookie.get(md5(query.logName))){
                try {
                    query = JSON.parse(cookie.get(md5(query.logName)));
                }catch (e){
                    cookie.remove('user');
                    cookie.remove(md5(query.logName));
                }
            }else{
                validate();
            }
            if ($scope.errorNum >= 3) {
                query.validateCode = $scope.user.validateCode;
            }
            SysLoginUserFty.login(query).success(function (data) {
                if (data.code == 200) {
                    if($scope.rememberPwd){
                        var t = new Date((new Date()).getTime() + 60 * 60 * 24 * 1000 * 30);
                        cookie.set(md5(query.logName),JSON.stringify(query),{domain:location.hostname,expires: t,path: "/"});
                        cookie.set('user',JSON.stringify(query),{domain:location.hostname,expires: t,path: "/"});
                    }else{
                        cookie.remove(md5(query.logName));
                    }
                    window.sessionStorage && window.sessionStorage.removeItem("loginErrorNum");
                    window.top.location.href = baseUrl + "/views/frame.html";
                } else {
                    $scope.errorNum = data.loginCount;
                    $scope.msg = data.msg;

                    window.sessionStorage && window.sessionStorage.setItem("loginErrorNum",$scope.errorNum);
                    if ($scope.errorNum >= 3) {
                        $scope.user.validateCode = "";
                        initImg();
                    }
                }
            });
        };

        $scope.refreshCode = function () {
            initImg();
        };

        $document.bind("keypress", function (event) {
            if (event.keyCode == 13) {
                if (!$scope.user.logName) {
                    $scope.$apply(function () {
                        $scope.msg = "请输入用户名";
                    });
                    return
                }
                if (!$scope.user.logPwd) {
                    $scope.$apply(function () {
                        $scope.msg = "请输入密码";
                    });
                    return
                }
                $scope.login();
            }
        })
    }]);
}(app);
