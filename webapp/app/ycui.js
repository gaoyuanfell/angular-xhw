(function(){
	var time=new Date().getTime(),
		doc=document,
		body=doc.body,
		$,
		ycui={version:'ycui0.1-20160114'};
	

	//下拉菜单初始 obj:jq dom节点或者选择器， fn:点击下拉内容的回调函数
	ycui.select=function(obj,fn){
		if(this.type(obj)==='string'){
			obj=$(obj);
		}
		obj.each(function(i,obj){
			obj=$(obj);
			var cur=obj.find('.yc-select-current'),icn=obj.find('i'),ops=obj.find('.yc-select-options'),inp=obj.find('input[type=hidden]'),inf=obj.find('.yc-select-fitter');
			obj.find('.yc-select-current,i').on('click',function(){
				obj.hasClass('yc-select-disable')||ops.find('li').size()>0&&ops.stop(true).slideDown('fast',function () {
					ops.css('height','auto');
				});
				return false;
			});
			ops.on('click',function(obj){
				if(obj.target.nodeName == 'INPUT'){
					return false;
				}
				obj=$(obj.target);
				var val=obj.attr('data-value');
				inp.prop('value',val),inp.change(),cur.html(obj.html()), ops.stop(true).slideUp('fast'),inp.change();	
				fn&&fn(obj);
				
				return false
			});
			$('body').on('click',function(){ops.stop(true).slideUp('fast')})
		});
	};
	
	//tab切换效果 obj:jq对象或者选择器.yc-tabSwitch,fn:点击选项时的回调函数
	ycui.tabSwitch=function(obj,fn){
		if(this.type(obj)==='string'){
			obj=$(obj);
		}			
		obj.each(function(i,obj){
			obj=$(obj);
			var item =obj.find(".yc-tab-item"),con=obj.find('.yc-tab-con');
			item.eq(0).addClass('yc-tab-item-current');
			con.hide().eq(0).show();
			item.on('click',function(){
				var i=$(this).index();
				item.removeClass('yc-tab-item-current').eq(i).addClass('yc-tab-item-current');
				con.hide().eq(i).fadeIn();					
				fn&&fn(item.eq(i),con.eq(i));
			})				
		})			
	};
	
	//显示自定义属性data-title提示文本信息 obj:jq dom对象或者类名
	ycui.showTitle=function(obj){
		if(this.type(obj)==='string'){
			obj=$(obj);
		}	
		obj.each(function(i,obj){
			obj=$(obj);
			obj.hover(function(){
				var _this=$(this),tle =_this.attr('data-title'),ori=_this.find('.yc-showTitle'),dom;
				if($.trim(tle)){						
					dom=ori.size()>0 ?ori.eq(0):$('<div class="yc-showTitle"><i class="yc-icon yc-showTitle-icon"></i>'+tle+'</div>').appendTo(_this);
					!_this.attr('position')&&_this.attr('position','relative');						
					dom.css({visibility:'visible',top:_this.outerHeight(),left:'50%',marginLeft:-dom.outerWidth()/2})										
				}		
			},function(){					
				$(this).find(".yc-showTitle").css('visibility','hidden');
			})
		})		
	};		
	
	
	//html字符串转换成dom对象 str:html字符串
	ycui.stringToHtml=function(str){
		var h=doc.createElement('div');
		h.innerHTML=str;
		return h.firstChild
	};
	
	//弹出顶部信息 str:文本内容,  style:对应的弹出样式info\success\warning\danger,  time:自动消失的时间
	ycui.alertInfo=function(str,style,time){
		var h='<div class="yc-alertInfo'+(style?' yc-alertInfo-'+style:'info')+'">'+str+'</div>';
		
		h=this.stringToHtml(h);
		if(this.type($)==='function'){
			$(h).appendTo(body).fadeIn();					
			setTimeout(function(){
				$(h).fadeOut('normal',function(){
					$(this).remove()
				});
			},time*1e3||3000)
		}else{
			body.appendChild(h);
			setTimeout(function(){
				h.parentNode.removeChild(h)
			},time*1e3||3000)
		}					
	};
	
	//判断obj的类型
	ycui.type=function(obj){
		var str=Object.prototype.toString.call(obj),res;
		switch(str){
			case '[object Number]':res='number';break;
			case '[object Boolean]':res='boolean';break;
			case '[object String]':res='string';break;
			case '[object Array]':res='array';break;
			case '[object Function]':res='function';break;
			case '[object RegExp]':res='regexp';break;
			case '[object Date]':res='date';break;
			case '[object Object]':res='object';break;
			case '[object Undefined]':res='undefined';break;
		}
		return res
	};
	
	/*  弹出参数说明
	 * {
		title:'提示框',               弹出顶部文字
		content:'',   			           弹出的文本内容|html
		ok:option.ok||'确定',		  确定按钮的名称
		okclick:option.okclick		 点击确认按钮执行函数
		no:option.no||'取消',		  取消按钮的名称
		noclick:option.noclick		 点击取消按钮执行函数
		render:option.render		弹窗弹出时的回调函数
		timeout:option.timeout||2.5  消失时间 -1不会消失
		};
	*/
	ycui.alert=function(_option){
		var defaultTitle = '<img src="'+ baseUrl +'/static/img/tjcg.png">';
		if(_option.error){
			defaultTitle = '<img src="'+ baseUrl +'/static/img/tjsb.png">';
		}
		var option={						
			title:_option.title || defaultTitle,
			content:_option.content||'',
			ok:_option.ok||'确定',
			okclick:_option.okclick,
			render:_option.render,
			timeout:_option.timeout||-1,
			error:_option.error || false
		};
		var id = 'bg'+new Date().getTime();
		var bg=$('<div data-bg="'+ id +'" class="dialog-bg" style="display:none"></div>');
		var wraper=$('<div id="'+ id +'" class="dialog-wraper"></div>');
		
		//只能这样修改 用的地方太多 有ionic就不能有title
		var con;
		if(!_option.title){
			var content = '<p class="dialog-title-con">'+ _option.content +'</p>';
			defaultTitle += content
			con=$('<div class="dialog-con">'+content+'</div>');
		}else{
			con=$('<div class="dialog-con">'+option.content+'</div>');
		}

		var title=$('<div class="dialog-title"><span class="title">'+option.title+'</span><i class="dialog-close yc-icon">&#xe619;</i></div>');
		var sub=$('<div class="dialog-submit"><a href="javascript:;" class="ok">'+option.ok+'</a></div>');
		var setTimeoutFun;
		wraper.append(title).append(con).append(sub).appendTo(bg),bg.appendTo(document.body),bg.fadeIn(300);
		
		var $createBg = window.top.$createBg;
		var closeFun;
		$createBg && (closeFun = $createBg(close));
		function close(){
			setTimeoutFun && clearInterval(setTimeoutFun);
			bg.fadeOut('fast',function(){
				bg.remove();
				if(typeof option.okclick==='function'){
					option.okclick();
				}
			})
		}

		title.find('i').on('click',function(){
			setTimeoutFun && clearInterval(setTimeoutFun);
			closeFun && closeFun();
			bg.fadeOut('fast',function(){
				bg.remove();
				if(typeof option.okclick==='function'){
					option.okclick();
				}
			})
		});		
		sub.find('a.ok').on('click',function(){	
			setTimeoutFun && clearInterval(setTimeoutFun);
			closeFun && closeFun();
			bg.fadeOut('fast',function(){
				bg.remove();
				if(typeof option.okclick==='function'){
					option.okclick();
				}
			})
		});

		$('div[data-bg="'+ id +'"]').bind('click', function (event) {
			if(event.target == $(this)[0]){
				setTimeoutFun && clearInterval(setTimeoutFun);
				closeFun && closeFun();
				bg.fadeOut('fast',function(){
					bg.remove();
					if(typeof option.okclick==='function'){
						option.okclick();
					}
				})
			}
		});

		setTimeout(function(){
			wraper.css({marginLeft:-wraper.outerWidth()/2 ,marginTop:-wraper.outerHeight()/2})
		},0);
		option.render&&option.render(wraper),option.timeout!=-1&&(setTimeoutFun = setTimeout(function(){
			closeFun && closeFun();
			bg.fadeOut('fast',function(){
				bg.remove();
				if(typeof option.okclick==='function'){
					option.okclick();
				}
			})
		},option.timeout*1e3))
	};	
	ycui.confirm=function(option){		
		option={						
			title:option.title||'确认框',
			content:option.content||'',
			ok:option.ok||'确定',
			no:option.no||'取消',
			okclick:option.okclick,
			noclick:option.noclick,
			render:option.render
		};
		var id = 'bg'+new Date().getTime();
		var bg=$('<div data-bg="'+ id +'" class="dialog-bg" style="display:none;"></div>'),
			wraper=$('<div id="'+ id +'" class="dialog-wraper"></div>'),
			title=$('<div class="dialog-title"><span class="title">'+option.title+'</span><i class="dialog-close yc-icon">&#xe619;</i></div>'),
			con=$('<div class="dialog-con">'+option.content+'</div>'),
			sub=$('<div class="dialog-submit"><a href="javascript:;" class="ok">'+option.ok+'</a> <a href="javascript:;" class="no">'+option.no+'</a></div>');
		wraper.append(title).append(con).append(sub).appendTo(bg),bg.appendTo(document.body),bg.fadeIn(500);

		var $createBg = window.top.$createBg;
		var closeFun;
		$createBg && (closeFun = $createBg(close));
		function close(){
			bg.fadeOut('fast',function(){
				bg.remove();
				if(typeof option.noclick==='function'){
					option.noclick();
				}
			})
		}
		
		title.find('i').on('click',function(){
			closeFun && closeFun();
			bg.fadeOut('fast',function(){
				bg.remove();
				if(typeof option.noclick==='function'){
					option.noclick();
				}
			})
		});
		
		sub.find('a.no').on('click',function(){
			closeFun && closeFun();
			bg.fadeOut('fast',function(){
				bg.remove();
				if(typeof option.noclick==='function'){
					option.noclick();
				}
			})
		});	
	
		sub.find('a.ok').on('click',function(){
			closeFun && closeFun();
			bg.fadeOut('fast',function(){
				bg.remove();
				if(typeof option.okclick==='function'){
					if(option.okclick())return;
				}
			})
		});

		$('div[data-bg="'+ id +'"]').bind('click', function (event) {
			if(event.target == $(this)[0]){
				closeFun && closeFun();
				bg.fadeOut('fast',function(){
					bg.remove();
				})
			}
		});
		
		setTimeout(function(){
			var f=wraper.outerHeight()>=(window.innerHeight),
				h=f?(window.innerHeight):wraper.outerHeight();				
			if(f){
				wraper.css({width:wraper.outerWidth(),marginLeft:-wraper.outerWidth()/2,top:10,marginTop:0}),bg.css({height:h});
			}else{
				var top = wraper.outerHeight()/2;
				top>255?top=255:top;
				wraper.css({width:wraper.outerWidth(),marginLeft:-wraper.outerWidth()/2,marginTop:-(top)});
			}			
		},65);	
		option.render&&option.render(wraper)
	};
	
	ycui.Array={
		clear:function(arr){			
			arr.length=0
		},
		insertAt:function(arr,index,obj){
			arr.splice(index,0,obj)
		},
		removeAt:function(arr,index){
			arr.splice(index,1)
		},
		remove:function(arr,obj){
			var index = arr.indexOf(obj);
		    if (index >= 0) {
		        arr.splice(index,1)
		    }
		}
	};
	
	//地域定向选择      	## areas:地域数组, list:已选择区域数组，id:容器选择器 point:返回函数处理标示，为true表示传递所有选择子集的父id;
	ycui.createAreas=function(areas,list,id,point){
		var checkAll=function(ae,y){			
			var aes=y?ae.find('.selectArea-dl'):$(this).parents('.selectArea-dl');
			
			aes.each(function(index,obj){
				var sa=$(obj),
					di=sa.find('dt input'),
					api=sa.find('.area-parent> label input,.area-self> label input'),
					aps=sa.find('.area-parent'),
					alen=di.attr('data-length'),
					flag=true;	
			
				aps.each(function(index,obj){
					var	ap=$(obj),
						acs=ap.find('.area-child input'),
						api=ap.children('label').find('input'),
						asn=ap.children('span'),
						len=asn.attr('data-length');						
					
					//市、区选择判断	
					for(var i=0,n=0;i<len;i++){
						if(acs.eq(i).prop('checked')){
							n++
						}
					}			
					if(n==len){
						api.prop('checked',true).removeClass('point'),api.parent('label').removeClass('point');
					}else if(n==0){
						api.prop('checked',false).removeClass('point'),api.parent('label').removeClass('point');
					}else{
						api.prop('checked',false).addClass('point'),api.parent('label').addClass('point');
					}			
					asn.html('('+n+'/'+len+')');	
				})				
					
				//省份选择判断
				for(var i=0,n=0;i<alen;i++){
					if(api.eq(i).prop('checked')){
						n++
					}else if(api.eq(i).hasClass('point')){
						flag=false	
					}
				}			
				if(n==alen){
					di.prop('checked',true).removeClass('point'),di.parent('label').removeClass('point');
				}else if(n==0&&flag){ 
					di.prop('checked',false).removeClass('point'),di.parent('label').removeClass('point');
				}else{
					di.prop('checked',false).addClass('point'),di.parent('label').addClass('point');
				}			
			})
		},		
		html='<div class="selectArea">';	
		
		//生成视图
		for(var i=0;i<areas.length;i++){
			var area=areas[i];
			html+='<dl class="selectArea-dl"><dt><label><input type="checkbox" name="arealist" value="'+area.areaId+'" data-length="'+area.parentList.length+'" data-name="'+area.areaName+'"> <b>'+area.areaName+'</b></label></dt><dd>'
			for(var j=0;j<area.parentList.length;j++){
				var parent=areas[i].parentList[j],flag=parent.childList&&parent.childList.length>0;			
				html+='<div class="'+(flag?'area-parent':'area-self')+'">';
				html+='<label><input type="checkbox" '+(list.indexOf(parent.parentId)!=-1?'checked':'')+' name="arealist" value="'+parent.parentId+'" data-level="'+(parent.level?parent.level:'')+'" data-name="'+parent.parentName+'" data-length="'+parent.childList.length+'"> '+parent.parentName+' </label>';
				if(flag){
					html+='<span data-length="'+parent.childList.length+'">(0/'+parent.childList.length+')</span>';
	                html+='<div class="area-child">';
	               	for(var k=0;k<parent.childList.length;k++){
	               		var child=parent.childList[k];
	               		html+='<label><input type="checkbox" '+(list.indexOf(child.childId)!=-1?'checked':'')+' name="arealist" value="'+child.childId+'"  data-level="'+(child.level?child.level:'')+'" data-name="'+child.childName+'"> '+child.childName+'</label>'
	               	}
	               	html+='</div>' 
				}				
               	html+='</div>'                 
			}
			html+='</dd></dl>'
		}
		html+='</div>';
		html=$(html),checkAll(html,1),$(id).append(html);
		 
		//区域处理
		html.find('dt input').click(function(){
			var ps=$(this).parents('.selectArea-dl').find('dd'),
				check=this.checked;
			
			ps.find('input, label').removeClass('point').prop('checked',check);
			$(this).removeClass('point'),$(this).parent('label').removeClass('point');
			ps.find('.area-parent > span').each(function(i,obj){
				var len=obj.getAttribute('data-length');  
				obj.innerHTML='('+(check?len:0)+'/'+len+')';
			})			
		});	
		
		//省份处理
		html.find('.area-parent >label input,.area-self >label input').click(function(){			
			var check=this.checked,
				sa=$(this).parents('.selectArea-dl'),
				di=sa.find('dt input'),
				alen=di.attr('data-length'),
				aps=sa.find('.area-parent> label input,.area-self> label input'),
				ap=$(this).parents('.area-parent'),
				sn=ap.children('span'),
				len=sn.attr('data-length'),				
				n=0,i=0;				
				
			ap.find('.area-child input').prop('checked',check);
			$(this).removeClass('point'),$(this).parent('label').removeClass('point');
			sn.html('('+(check?len:0)+'/'+len+')');			
			for(;i<alen;i++){
				if(aps.eq(i).prop('checked')){
					n++
				}
			}			
			if(n==alen){
				di.prop('checked',true).removeClass('point'),di.parent('label').removeClass('point');
			}else if(n==0){
				di.prop('checked',false).removeClass('point'),di.parent('label').removeClass('point');
			}else{
				di.prop('checked',false).addClass('point'),di.parent('label').addClass('point');
			}			
		});	
		
		//市、区处理		
		html.find('.area-child input').click(checkAll);
		
		
		//返回结果处理函数
		return function(id,name){
			var result=[];
			var resultName=[];
			var resultValue=[];
			html.find('input[name="arealist"]').each(function(i,obj){
				if(obj.checked||point&&$(obj).hasClass('point')){
					result.push(obj.value)
					resultName.push(obj.getAttribute('data-name'))
				}
			});
			html.find('.selectArea-dl').each(function (i, obj) {
				var input = $(obj).find('dt input[name="arealist"]')[0];
				var _obj = {};
				if(input.checked||$(input).hasClass('point')){
					_obj.name = input.getAttribute('data-name');
					_obj.length = +input.getAttribute('data-length');
				}

				$(obj).find('dd .area-parent').each(function (j, obj_1) {
					var input_1 = $(obj_1).find('label:first input[name="arealist"]')[0];
					var _obj1 = {};
					if(input_1.checked||$(input_1).hasClass('point')){
						_obj1.name = input_1.getAttribute('data-name');
						_obj1.length = +input_1.getAttribute('data-length');
					}
					if(_obj1.name){
						try{
							_obj.child.push(_obj1);
						}catch (e){
							_obj.child = [];
							_obj.child.push(_obj1);
						}
					}
					
					$(obj_1).find('.area-child input[name="arealist"]').each(function (k,obj_2) {
						var _obj2 = {};
						if(obj_2.checked||$(obj_2).hasClass('point')){
							_obj2.name = obj_2.getAttribute('data-name');
						}
						try{
							if(_obj2.name){
								_obj1.child.push(_obj2)
							}
						}catch (e){
							_obj1.child = [];
							if(_obj2.name){
								_obj1.child.push(_obj2)
							}
						}
					});
				});
				if(_obj.name){
					resultValue.push(_obj)
				}
			});
			if(id && name){
				return [result,resultName,resultValue];
			}
			if(name){
				return resultName;
			}
			return result
		}
	};

	ycui.loading = {
		show:function () {
			var loadingHtml = "<div class='yc-loading yc-loading-dialog' id='ycLoading'></div>";
			$(loadingHtml).appendTo(document.body);
		},
		hide:function () {
			$("#ycLoading").remove();
		}
	};
	
	ycui.createTree = function (data, id) {
		var $ele = $('#'+id);
		var $tree = $('<div class="yc-tree"></div>');
		var treeName = $ele.attr('data-name');
		var treeId = $ele.attr('data-id');
		var treeChildren = $ele.attr('data-children');
		var agencyNumber = $ele.attr('data-num');
		var a = 0;
		var h = '';
		
		while (data.length>a){
			h += children(data[a]);
			a++;
		}

		$tree.append(h);
		$ele.append($tree);
		$ele.find('label').click(function (event) {
			event.stopPropagation();
			$ele.find('label').removeClass('active');
			$(this).addClass('active');
		});
		
		// $ele.find('li span').click(function (event) {
		// 	event.stopPropagation();
		// 	var bo = $(this).attr('data-close');
		// 	var children = $(this).parent().children("div.parent").children();
		// 	if(bo == 'true'){
		// 		if(children.length>0){
		// 			children.show();
		// 			$(this).removeClass("open").addClass('close');
		// 			$(this).attr('data-close','false');
		// 		}
		// 	}else{
		// 		if(children.length>0){
		// 			children.hide();
		// 			$(this).removeClass("close").addClass('open');
		// 			$(this).attr('data-close','true');
		// 		}
		// 	}
		// });
		return $ele;
		function children(da) {
			var html = '';
			// html += '<div >';
			html += '<ul class="parent">';
			if(da[treeChildren] instanceof Array && da[treeChildren].length>0){
				html += '<li data-id="'+ da[treeId] +'" ><label class="pointer"><input value="'+ da[treeId] +'" data-name="'+ da[treeName] +'" data-num="'+ da[agencyNumber] +'" type="radio" name="tree">' + da[treeName]+'</label>';
				var array = da[treeChildren];
				for(var i = 0;i<array.length;i++){
					html +=children(array[i],true);
				}
				html += '</li>'
			}else{
				html += '<li data-id="'+ da[treeId] +'" ><label  class="pointer"><input value="'+ da[treeId] +'" data-name="'+ da[treeName] +'" data-num="'+ da[agencyNumber] +'" type="radio" name="tree">'+ da[treeName] +'</label></li>';
			}
			html += '</ul>';
			// html += '</div>';
			return html;
		}
	};
	
	window.ycui=ycui;
	//依赖提示	
	if(typeof jQuery!='undefined'&&ycui.type(jQuery)==='function'){
		$=jQuery,$(function(){doc=document,body=doc.body});
	}else{
		ycui.alertInfo('ycui.js依赖于jQuery,请先加载jQuery文件','danger');
		console.error('ycui.js依赖于jQuery,请先加载jQuery文件')
	}	
})();
