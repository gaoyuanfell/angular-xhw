/**
 * Created by moka on 16-6-17.
 */
app.controller("createEditCtrl", ['$scope', 'ResCreativityFty',
    function ($scope, ResCreativityFty) {

        $scope.catagorysList = [
            {name:'图片',value:1},
            {name:'JS',value:2},
            {name:'H5',value:3}
        ];

        var id = getSearch("id");

        ycui.loading.show();
        ResCreativityFty.getADType({id:id}).success(function (response) {
            ycui.loading.hide();
            if(!response) return;
            $scope.createType = response;

            var catagorys = response.catagorys;
            if(catagorys){
                var list = catagorys.split(',');
                $scope.catagorysList.forEach(function (da) {
                    if(list.indexOf(String(da.value)) != -1){
                        da.check = true;
                    }
                })
            }
        })

        $scope.catagorysValid = function(){
            var ca = $scope.catagorysList;
            for(var i = 0;i<ca.length;i++){
                if(ca[i].check){
                    return true;
                }
            }
        }

        $scope.postEdit = function () {
            $scope.validShow = true;
            var bo = false;
            var catagorys = [];
            $scope.catagorysList.forEach(function(data){
                if(data.check){
                    catagorys.push(data.value);
                }
            })
            if(catagorys.length == 0){bo = true;}
            if(!$(".form").valid()){bo = true;};
            if(bo)return;
            ycui.loading.show();
            var body = angular.copy($scope.createType);

            delete body.updateTime
            delete body.createTime
            body.catagorys = catagorys.join(',');
            ResCreativityFty.update(body).success(function(res){
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewCreativeType');
                        },
                        timeout: 10
                    });
                }
                ycui.loading.hide();
            })
        }

        $(".form").validate({
            rules: {
                myText: "required",
                sort: "required",
            },
            messages: {
                myText: "请输入创意名称",
                sort: "请输入排序序号"
            },
            errorClass: "error-span",
            errorElement: "span"
        })
    }]);