var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del'); //文件删除
var runSequence = require('run-sequence'); //异步任务
var gulpWatch = require('gulp-watch'); //监听插件
var uglify = require("gulp-uglify");
var htmlmin = require("gulp-htmlmin");
var minifyHTML   = require('gulp-minify-html');
var minifyCss = require("gulp-minify-css");
var concat = require('gulp-concat');
var through = require('through2');
var revCollector = require('./gulp-rev-collector');

var addUpdateTime  = require("./gulp-addUpdateTime").addUpdateTime;//自定义gulp任务

//对页面js、css引用增加版本号
gulp.task('rev',['clean-h'],function(){
    runSequence(['rev-2'],function(){
        gulp.start('rev-1');
    })
})

gulp.task('rev-1',function(){
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        // collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        // removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        // removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        // removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        // minifyJS: true,//压缩页面JS
        collapseInlineTagWhitespace: false,
        // minifyCSS: true//压缩页面CSS
    };
    return gulp.src(['rev-manifest.json','webapp/views/*.html','webapp/views/**/*.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        // .pipe(htmlmin(options))
        .pipe(minifyHTML({
            empty:true,
            spare:true
        }))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(addUpdateTime({type:"html"}))
        .pipe(gulp.dest('webapp/template/views/'))
})

gulp.task('rev-2',function(){
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        // collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        // removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        // removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        // removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        collapseInlineTagWhitespace: false,
        minifyCSS: true//压缩页面CSS
    };
    return gulp.src(['rev-manifest.json','webapp/login.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        // .pipe(htmlmin(options))
        .pipe(minifyHTML({
            empty:true,
            spare:true
        }))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(addUpdateTime({type:"html"}))
        .pipe(gulp.dest('webapp/template/'))
})

/**
 * 任务监听
 */
gulp.task('default',['build'],function () {
    var array = ['concatApp','concatClient','concatSystem','concatResource','concatReport','concatOrder','concatDefaultOrder'];
    runSequence(array,function(){
        gulpWatch('webapp/app/client/**/*.js',function () {
            runSequence(['concatClient'],function(){
                gulp.start('buildJs');
            })
        });
        gulpWatch('webapp/app/system/**/*.js',function () {
            runSequence(['concatSystem'],function(){
                gulp.start('buildJs');
            })
        });
        gulpWatch('webapp/app/resource/**/*.js',function () {
            runSequence(['concatResource'],function(){
                gulp.start('buildJs');
            })
        });
        gulpWatch('webapp/app/report/**/*.js',function () {
            runSequence(['concatReport'],function(){
                gulp.start('buildJs');
            })
        });
        gulpWatch('webapp/app/order/**/*.js',function () {
            runSequence(['concatOrder'],function(){
                gulp.start('buildJs');
            })
        });
        gulpWatch('webapp/app/defaultOrder/**/*.js',function () {
            runSequence(['concatDefaultOrder'],function(){
                gulp.start('buildJs');
            })
        });
        gulpWatch('webapp/app/*.js',function () {
            runSequence(['concatApp'],function(){
                gulp.start('buildJs');
            })
        });

        gulpWatch('webapp/views/**/*.html',function () {
            // gulp.start('buildHtml');
            gulp.start('rev-1');
        });
        gulpWatch('webapp/login.html',function () {
            // gulp.start('buildHtml2');
            gulp.start('rev-2');
        });
        gulpWatch('webapp/static/css/*.css',function () {
            gulp.start('buildCss');
        });

    });
});

gulp.task('build',['clean'],function(){
    runSequence(['copyJs'],function(){
        gulp.start('buildJs');
        // gulp.start('buildHtml');
        // gulp.start('buildHtml2');
        gulp.start('buildCss');
        runSequence(['rev-2'],function(){
            gulp.start('rev-1');
        })
    })
})

/**
 * js
 */
gulp.task('buildJs',function () {
    return gulp.src('webapp/static/js/*.js')
        .pipe(uglify({
            mangle:true,
            compress:true
        }))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(addUpdateTime())
        .pipe(gulp.dest('webapp/build/static/js/'));
});

/**
 * html
 */
gulp.task('buildHtml',function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        // collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        // removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        // removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        // removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        collapseInlineTagWhitespace: false,
        minifyCSS: true//压缩页面CSS
    };
    return gulp.src(['webapp/views/**/*.html','webapp/views/*.html'])
        .pipe(htmlmin(options))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(gulp.dest('webapp/template/views/'));
});

gulp.task('buildHtml2',function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        // collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        // removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        // removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        // removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        collapseInlineTagWhitespace: false,
        minifyCSS: true//压缩页面CSS
    };
    return gulp.src(['webapp/login.html'])
        .pipe(htmlmin(options))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(gulp.dest('webapp/template/'));
});

/**
 * css
 */
gulp.task('buildCss',function () {
    return gulp.src('webapp/static/css/*.css')
        .pipe(minifyCss())
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(addUpdateTime({type:"css"}))
        .pipe(gulp.dest('webapp/build/static/css/'))
});


/**
 * 拷贝js文件
 */
gulp.task('copyJs',function () {
    return gulp.src(['webapp/static/**'])
        .pipe(gulp.dest('webapp/build/static'));
});

/**
 * 清除build文件
 */
gulp.task('clean', function(){
    return del(['webapp/build','webapp/template']);
});

/**
 * 清除build文件
 */
gulp.task('clean-h', function(){
    return del(['webapp/template']);
});

/**
 * 合并文件 client
 */
gulp.task('concatApp',function () {
    return gulp.src(['webapp/app/*.js'])
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(gulp.dest('webapp/static/js/'))
})

gulp.task('concatClient',function () {
    return gulp.src(['webapp/app/client/**/*.js'])
        .pipe(concat('ClientManage.js'))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(gulp.dest('webapp/static/js/'))
})

gulp.task('concatSystem',function () {
    return gulp.src(['webapp/app/system/**/*.js'])
        .pipe(concat('systemManage.js'))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(gulp.dest('webapp/static/js/'))
})

gulp.task('concatResource',function () {
    return gulp.src(['webapp/app/resource/**/*.js'])
        .pipe(concat('resourceManage.js'))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(gulp.dest('webapp/static/js/'))
})

gulp.task('concatReport',function () {
    return gulp.src(['webapp/app/report/**/*.js'])
        .pipe(concat('reportManage.js'))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(gulp.dest('webapp/static/js/'))
})

gulp.task('concatOrder',function () {
    return gulp.src(['webapp/app/order/**/*.js'])
        .pipe(concat('order.js'))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(gulp.dest('webapp/static/js/'))
})

gulp.task('concatDefaultOrder',function () {
    return gulp.src(['webapp/app/defaultOrder/**/*.js'])
        .pipe(concat('defaultOrder.js'))
        .on('error', function(err) {
            gutil.log('Less Error!', err.message);
            this.end();
        })
        .pipe(gulp.dest('webapp/static/js/'))
})