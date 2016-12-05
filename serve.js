/**
 * Created by moka on 16-6-15.
 */
var PORT = 8081;
var MIME = {
    'htm':  'text/html',
    'html': 'text/html',
    'css':  'text/css',
    'gif':  'image/gif',
    'ico':  'image/x-icon',
    'jpg':  'image/jpeg',
    'js':   'text/javascript',
    'png':  'image/png',
    'rar':  'application/x-rar-compressed',
    'txt':  'text/plain',
    'json': 'text/plain',
    'jar':  'application/java-archive',
    '*':'*/*'
};
var webapp = '/webapp';
var dir = process.argv[2];
var ROOT = dir ? dir : process.cwd();
ROOT += webapp;

var default_file = '/login.html';
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

http.createServer(function(request, response) {
    console.info(url.parse(request.url).pathname);
    var pathname = url.parse(request.url).pathname;
    var realpath = pathname !== '/' ? ROOT + pathname : ROOT + default_file;
    var extname = path.extname(realpath).slice(1);
    var contentType = 'text/html';

    if (extname && MIME[extname]) {
        contentType = MIME[extname];
    }

    fs.exists(realpath, function(exists) {
        if (exists) {
            fs.readFile(realpath, function(err, data) {
                if (err) throw err;
                response.writeHead(200, {'Content-Type': contentType,"Accept":'*/*',"Access-Control-Allow-Origin":"*/*"});
                response.write(data);
                response.end();
            });
        } else {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write('Not Found');
            response.end();
        }
    });

}).listen(PORT);

console.log('simple static file server runing at port: ' + PORT + '.');