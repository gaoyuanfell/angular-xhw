/**
 * Created by moka on 16-6-16.
 */
app.controller('QualificationEditCtrl', ["$scope", "$http", "QualificationFty","UploadKeyFty", 
    function ($scope, $http, QualificationFty,UploadKeyFty) {
        var upload = function(ob){
            var key = "";
            var config = {
                server: fileUrl + '/contract/fileUpload.htm',
                pick: {
                    id: "#" + ob.id,
                    multiple: false
                },
                beforeFileQueued:function(uploader,file){
                    var size = 3*1024*1024;
                    if(file.size > size){
                        ycui.alert({
                            content: "文件大小不能超过3M(1M等于1024KB)",
                            timeout: 10,
                            error:true
                        });
                        return false;
                    }
                    ycui.loading.show();
                    uploader.stop();
                    UploadKeyFty.uploadKey().then(function (da) {
                        key = da.items;
                        uploader.upload();
                    });
                },
                uploadSuccess:function(uploader,file, res){
                    $scope.$apply(function(){
                        ob.qualificationsUrl = res.uploadFile;
                    })
                },
                uploadBeforeSend:function(uploader,ob, data){
                    data.uploadKey = key;
                },
                uploadComplete:function(){
                    ycui.loading.hide();
                },
                error:function(uploader){
                    ycui.loading.hide();
                    ycui.alert({
                        content: "错误的文件类型",
                        timeout: 10,
                        error:true
                    });
                    uploader.reset();
                }
            }
            uploadInit(config);
        }

        $scope.id = 'uplaodBtn';
        upload($scope);

        var id = getSearch('id');

        ycui.loading.show();
        QualificationFty.findQualifications({id: id}).then(function (response) {
            ycui.loading.hide();
            if(response){
                $scope.clientId = response.customerId;
                $scope.customerName = response.customerName;
                $scope.industryId = response.industryId;
                $scope.qualificationName = response.qualificationName;
                $scope.qualificationsUrl = response.qualificationsUrl
            }
        });

        var industry = {
            "leve2": [[],[{"id": 197, "name": "安保服务"}, {"id": 198, "name": "安保器材"}, {
                "id": 199,
                "name": "安全防伪"
            }, {"id": 200, "name": "防盗报警"}, {"id": 201, "name": "交通消防"}, {"id": 202, "name": "智能楼宇"}], [{
                "id": 203,
                "name": "办公设备"
            }, {"id": 204, "name": "教具"}, {"id": 205, "name": "文具"}], [{
                "id": 206,
                "name": "彩票"
            }], [{"id": 207, "name": "物流"}, {"id": 208, "name": "车辆"}, {"id": 209, "name": "火车"}, {
                "id": 210,
                "name": "船舶"
            }, {"id": 211, "name": "飞机"}], [{"id": 212, "name": "成人用品"}], [{"id": 213, "name": "出版印刷"}, {
                "id": 214,
                "name": "影视传媒"
            }, {"id": 215, "name": "广播有线电视"}], [{
                "id": 216,
                "name": "电脑整机"
            }, {"id": 217, "name": "电脑配件"}, {"id": 218, "name": "网络设备"}, {"id": 219, "name": "电脑服务"}], [{
                "id": 220,
                "name": "电子元器件"
            }, {"id": 221, "name": "电机设备"}, {"id": 222, "name": "电线电缆"}, {"id": 223, "name": "供电设备"}, {
                "id": 224,
                "name": "照明设备"
            }, {"id": 225, "name": "仪器仪表"}], [{
                "id": 226,
                "name": "建筑工程"
            }, {"id": 227, "name": "房屋租售"}, {"id": 228, "name": "物业管理"}, {"id": 229, "name": "装修服务"}, {
                "id": 230,
                "name": "建筑装修材料"
            }], [{"id": 231, "name": "网上商城"}, {"id": 232, "name": "导购网站"}, {"id": 233, "name": "团购网站"}, {
                "id": 234,
                "name": "社交平台"
            }, {"id": 235, "name": "分类服务平台"}, {
                "id": 236,
                "name": "生活服务网站"
            }, {"id": 237, "name": "休闲娱乐网站"}], [{"id": 238, "name": "服装"}, {"id": 239, "name": "鞋帽"}, {
                "id": 240,
                "name": "纺织原料"
            }], [{"id": 241, "name": "箱包"}, {"id": 242, "name": "饰品"}], [{"id": 243, "name": "涂料"}, {
                "id": 244,
                "name": "化工原料"
            }, {"id": 245, "name": "橡胶"}, {
                "id": 246,
                "name": "塑料"
            }, {"id": 247, "name": "能源"}, {"id": 248, "name": "冶金"}, {"id": 249, "name": "包装材料"}], [{
                "id": 250,
                "name": "通用机械设备"
            }, {"id": 251, "name": "通用零配件"}, {"id": 252, "name": "建筑工程机械"}, {"id": 253, "name": "勘探机械"}, {
                "id": 254,
                "name": "化工机械"
            }, {"id": 255, "name": "木材石材加工机械"}, {
                "id": 256,
                "name": "印刷机械"
            }, {"id": 257, "name": "模具"}, {"id": 258, "name": "食品机械"}, {"id": 259, "name": "农林机械"}, {
                "id": 260,
                "name": "纸制造加工设备"
            }, {"id": 261, "name": "制鞋纺织机械"}, {"id": 262, "name": "商业设备"}, {"id": 263, "name": "包装机械"}, {
                "id": 264,
                "name": "制药设备"
            }, {"id": 265, "name": "冶炼铸造设备"}, {
                "id": 266,
                "name": "机床机械"
            }, {"id": 267, "name": "五金工具"}, {"id": 268, "name": "物流设备"}, {"id": 269, "name": "清洁通风设备"}, {
                "id": 270,
                "name": "焊接材料设备"
            }, {"id": 271, "name": "玻璃橡塑设备"}, {"id": 272, "name": "金属材料"}, {
                "id": 273,
                "name": "电子产品制造设备"
            }], [{"id": 274, "name": "家具"}, {"id": 275, "name": "家纺家饰"}, {
                "id": 276,
                "name": "厨具餐具"
            }, {"id": 277, "name": "日化用品"}], [{"id": 278, "name": "大型家电"}, {"id": 279, "name": "厨用电器"}, {
                "id": 280,
                "name": "卫浴家电"
            }, {"id": 281, "name": "健康电器"}, {"id": 282, "name": "生活小家电"}], [{"id": 283, "name": "学前教育"}, {
                "id": 284,
                "name": "小初高教育"
            }, {"id": 285, "name": "高教自考"}, {
                "id": 286,
                "name": "留学"
            }, {"id": 287, "name": "IT培训"}, {"id": 288, "name": "语言培训"}, {"id": 289, "name": "职业培训"}, {
                "id": 290,
                "name": "文体培训"
            }, {"id": 291, "name": "企业培训拓展"}, {"id": 292, "name": "特殊人群教育"}], [{"id": 293, "name": "污染处理"}, {
                "id": 294,
                "name": "废旧回收"
            }, {"id": 295, "name": "节能"}], [{
                "id": 296,
                "name": "理财"
            }, {"id": 297, "name": "银行"}, {"id": 298, "name": "保险"}, {"id": 299, "name": "投资担保"}, {
                "id": 300,
                "name": "典当"
            }], [{"id": 301, "name": "礼品"}], [{"id": 302, "name": "旅游"}, {"id": 303, "name": "宾馆酒店"}, {
                "id": 304,
                "name": "交通票务"
            }, {"id": 305, "name": "文体票务"}], [{
                "id": 306,
                "name": "化妆品"
            }, {"id": 307, "name": "美容"}], [{"id": 308, "name": "母婴护理"}], [{"id": 309, "name": "兽医兽药"}, {
                "id": 310,
                "name": "农药"
            }, {"id": 311, "name": "化肥"}, {"id": 312, "name": "养殖"}, {"id": 313, "name": "种植"}, {
                "id": 314,
                "name": "园林景观"
            }], [{"id": 315, "name": "操作系统"}, {
                "id": 316,
                "name": "中间件软件"
            }, {"id": 317, "name": "应用软件"}, {"id": 318, "name": "杀毒软件"}, {"id": 319, "name": "监控安全软件"}, {
                "id": 320,
                "name": "数据库软件"
            }, {"id": 321, "name": "企业软件"}, {"id": 322, "name": "行业专用软件"}, {"id": 323, "name": "支付结算软件"}, {
                "id": 324,
                "name": "教学软件"
            }], [{"id": 325, "name": "出国"}, {
                "id": 326,
                "name": "招聘"
            }, {"id": 327, "name": "翻译"}, {"id": 328, "name": "设计"}, {"id": 329, "name": "广告"}, {
                "id": 330,
                "name": "公关策划"
            }, {"id": 331, "name": "咨询"}, {"id": 332, "name": "拍卖"}, {"id": 333, "name": "代理"}, {
                "id": 334,
                "name": "调查"
            }, {"id": 335, "name": "法律服务"}, {
                "id": 336,
                "name": "会计审计"
            }, {"id": 337, "name": "铃声短信"}], [{"id": 338, "name": "搬家"}, {"id": 339, "name": "家政"}, {
                "id": 340,
                "name": "征婚交友"
            }, {"id": 341, "name": "仪式典礼"}, {"id": 342, "name": "摄影"}, {"id": 343, "name": "汽车租赁"}, {
                "id": 344,
                "name": "家电维修"
            }, {"id": 345, "name": "居民服务"}], [{
                "id": 346,
                "name": "生活食材"
            }, {"id": 347, "name": "休闲零食"}, {"id": 348, "name": "饮料"}, {"id": 349, "name": "保健食品"}, {
                "id": 350,
                "name": "烟酒"
            }, {"id": 351, "name": "餐馆"}], [{"id": 352, "name": "手机"}, {"id": 353, "name": "数码产品"}], [{
                "id": 354,
                "name": "通讯服务"
            }, {"id": 355, "name": "通讯设备"}], [{
                "id": 356,
                "name": "网站建设"
            }, {"id": 357, "name": "域名空间"}], [{"id": 358, "name": "男科"}, {"id": 359, "name": "妇科"}, {
                "id": 360,
                "name": "美容整形"
            }, {"id": 361, "name": "专科医院"}, {"id": 362, "name": "中医"}, {"id": 363, "name": "体检机构"}, {
                "id": 364,
                "name": "综合医院"
            }, {"id": 365, "name": "药品"}, {
                "id": 366,
                "name": "医疗器械"
            }], [{"id": 367, "name": "游戏开发"}, {"id": 368, "name": "游戏运营"}, {"id": 369, "name": "游戏周边"}], [{
                "id": 370,
                "name": "体育器械"
            }, {"id": 371, "name": "休闲活动"}, {"id": 372, "name": "运势测算"}, {"id": 373, "name": "宠物服务"}, {
                "id": 374,
                "name": "玩具模型"
            }, {"id": 375, "name": "乐器"}], [{
                "id": 376,
                "name": "服装饰品加盟"
            }, {"id": 377, "name": "美容化妆加盟"}, {"id": 378, "name": "礼品加盟"}, {"id": 379, "name": "食品保健品加盟"}, {
                "id": 380,
                "name": "生活服务加盟"
            }, {"id": 381, "name": "教育培训加盟"}, {"id": 382, "name": "机械电子建材加盟"}, {"id": 383, "name": "汽车加盟"}, {
                "id": 384,
                "name": "旅游住宿加盟"
            }, {
                "id": 385,
                "name": "干洗加盟"
            }, {"id": 386, "name": "综合招商"}, {"id": 387, "name": "养殖加盟"}], [{
                "id": 388,
                "name": "学术公管社会组织"
            }], [{"id": 389, "name": "国际组织"}], [{"id": 390, "name": "其他"}]],
            "leve1": ["全部","安全安保", "办公文教", "彩票", "车辆物流", "成人用品", "出版传媒", "电脑硬件", "电子电工", "房地产建筑装修", "分类平台", "服装鞋帽", "箱包饰品", "化工原料制品", "机械设备", "家庭日用品", "家用电器", "教育培训", "节能环保", "金融服务", "礼品", "旅游住宿", "美容化妆", "母婴护理", "农林牧渔", "软件", "商务服务", "生活服务", "食品保健品", "手机数码", "通讯服务设备", "网络服务", "医疗服务", "游戏", "运动休闲娱乐", "招商加盟", "学术公管社会组织", "国际组织", "其他"]
        };


        $scope.industrySel2 = {}
        $scope.industrySel = {
            list:industry.leve1,
            callback:function(e,d,list){
                $scope.industrySel2.$destroy();
                if(!d)return;
                var i = list.length;
                while (i--) {
                    if (d == industry.leve1[i]) {
                        break;
                    }
                }
                $scope.industrySel2.list = industry.leve2[i];
            }
        }

        $scope.getIndustry = function (name) {
            var i = industry.leve2.length;
            while (i--) {
                if (name)break;
                for (var j = 0; j < industry.leve2[i].length; j++) {
                    if (industry.leve2[i][j].id == $scope.industryId) {
                        name = industry.leve1[i];
                        $scope.industryName = industry.leve2[i][j].name;
                        break;
                    }
                }
            }
            return name
        };

        $scope.postEdit = function(){
            var body = {
                id: id,
                customerId: $scope.clientId,
                industryId: $scope.industryId,
                qualificationsUrl: $scope.qualificationsUrl,
                qualificationName: $scope.qualificationName
            }
            ycui.loading.show();
            QualificationFty.updateQualifications(body).then(function (res) {
                ycui.loading.hide();
                if (res && res.code == 200) {
                    ycui.alert({
                        content: res.msg,
                        okclick: function () {
                            goRoute('ViewCustomer1');
                        }
                    })
                }
            })
        }
}]);