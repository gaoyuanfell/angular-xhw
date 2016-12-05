/**
 * Created by moka on 16-5-30.自定义gulp插件 给每个js css html文件添加 最后修改时间 
 */

var gutil = require('gulp-util');
var through = require('through2');

Date.prototype.dateFormat = function (str) {
    str = str || "yyyy-MM-dd";
    var y = this.getFullYear();
    var M = this.getMonth() + 1;
    var d = this.getDate();
    var H = this.getHours();
    var m = this.getMinutes();
    var s = this.getSeconds();
    return str.replace("yyyy", y).replace("MM", M).replace("dd", d).replace("HH", H).replace("mm", m).replace("ss", s);
};

var addUpdateTime = function (options) {
    !options && (options = {type:"javascript"});
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }
        var data = "";
        switch (options.type){
            case "javascript":
                data = '\n/*!!!!! 最后修改于： '+ new Date().dateFormat('yyyy-MM-dd HH:mm:ss') + ' date:' + Date.now() +' !!!!!*/';
                break;
            case "css":
                data = '\n/*!!!!! 最后修改于： '+ new Date().dateFormat('yyyy-MM-dd HH:mm:ss') + ' date:' + Date.now() +' !!!!!*/';
                break;
            case "html":
                data = '\n<!--!!!!! 最后修改于： '+ new Date().dateFormat('yyyy-MM-dd HH:mm:ss') + ' date:' + Date.now() +' !!!!!-->';
                break;
        }
        file.contents = new Buffer(String(file.contents) + data);
        this.push(file);
        cb();
    });
};

module.exports = {
    addUpdateTime:addUpdateTime
};