var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// New Code
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/LoopFindr');
var fs = require('fs');
var youtubedl = require('youtube-dl');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.sockets.on('connection', function(socket){
    socket.on('downloadVideo', function(url){
        // initialize video item for youtube-dl
        var video = youtubedl(url + "",
            ['--max-quality=18']);
        var size = 0;
        video.on('info', function(info) {
            size = info.size;
            console.log('Download started');
            console.log('filename: ' + info.filename);
            console.log('size: ' + info.size);
        });         
        video.on('end', function() {
            console.log("\nDownload complete");
        });
        var pos = 0;
        video.on('data', function(data) {
            pos += data.length;
            // `size` should not be 0 here.
            var percent = (pos / size * 100).toFixed(2);
            process.stdout.cursorTo(0);
            process.stdout.clearLine(1);
            process.stdout.write(percent + '%');
        });
        // DOWNLOAD
        video.pipe(fs.createWriteStream('tmp/myvideo.mp4'));
    })
});

app.use(express.static(__dirname + "/public"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;