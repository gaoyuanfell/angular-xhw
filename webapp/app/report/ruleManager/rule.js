/**
 * Created by moka on 16-6-21.
 */
 app.directive('columnSetting',function(){
     return {
         restrict: "A",
         scope:{
             setting:"=columnSetting"
         },
         link:function(scope, element, attr){
             element[0].parentNode.style.position = 'relative';
             scope.setting.columnSetting = function(e,bo){
                 function fideIn($column){
                     $column.style.display = 'block';
                     $column.classList.remove('fadeOut');
                     $column.classList.add('fadeIn');
                 }
                 function findeOut($column){
                     $column.classList.remove('fadeIn');
                     $column.classList.add('fadeOut');
                     setTimeout(function() {
                         $column.style.display = 'none';
                     }, 150);
                 }
                 var $column;
                 if(e && bo){
                     $column = e.target.parentNode.parentNode;
                     if($column && $column.classList.contains('column-line')){
                         findeOut($column);
                     }
                 }else{
                     $column =e.target.parentNode.nextElementSibling;
                     if($column && $column.classList.contains('column-line')){
                         if($column.style.display == 'block'){
                             findeOut($column);
                         }else{
                             fideIn($column);
                         }
                     }
                 }
             }
         }
     }
 })

app.controller('orderRuleCtrl', ["$scope", "$location", "SysRuleUserFty",
    function ($scope, $location, SysRuleUserFty) {
        SysRuleUserFty.getUserRightsByParentId({rightsParentId: 4}).then(function (res) {
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
            $scope.contrastReport = _object;
        })

        $scope.removePageIndex = function () {
            window.sessionStorage.removeItem('session_page_index');
        }
    }]);
