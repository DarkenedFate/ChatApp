var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/robotochat', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

//app.get('/:room', function(req, res) {
//    res.sendFile(__dirname + "/index.html");
//});

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
console.log(__dirname);

http.listen(8080);

io.on('connection', function(socket) {

    var name = '';

    socket.on('username', function(username){
        name = username;
    })

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.on('chat message', function(msg) {
         io.emit('chat message', "[" + name + " " + "] " + msg);
    });

    socket.on('server message', function(msg) {
        io.emit('server message', msg);
    });
});