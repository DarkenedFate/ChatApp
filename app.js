var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var tz = require('moment-timezone');
var Autolinker = require('autolinker');
var jstz = require('./js/jstz.js').jstz;

app.get('/robotochat', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

//app.get('/:room', function(req, res) {
//    res.sendFile(__dirname + "/index.html");
//});

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
console.log(__dirname);

http.listen(8080);


var users = [];
var userSockets = [];

io.on('connection', function (socket) {

    var name = '';
    var timezoneName = '';

    socket.on('username', function (username) {
        name = username;
        users.push(name);
        userSockets[username] = socket;
    });

    socket.on('disconnect', function () {
        io.emit('server message', name + " has disconnected");

        var index = users.indexOf(name);
        if (index > -1) {
            users.splice(index, 1);
        }

        io.emit('users', users);
    });

    socket.on('chat message', function (msg) {
        var now = moment().tz("America/New_York").format("hh:mm:ss A");
        //"[" + name + " " + now + "] " +
        io.emit('chat message', Autolinker.link(msg), name);
    });

    socket.on('users', function () {
        io.emit('users', users);
    });

    socket.on('server message', function (msg) {
        io.emit('server message', msg);
    });

    socket.on('user typing', function () {
        io.emit('user typing', name + " is typing...", name);
    });

    socket.on('done typing', function () {
        io.emit('done typing', name);
    });

    socket.on('emote', function (msg) {
        io.emit('emote', msg, name);
    });

    socket.on('change name', function (newName) {
        io.emit('server message', name + " has changed their name to " + newName);

        var index = users.indexOf(name);
        if (index > -1) {
            users.splice(index, 1);
        }
        users.push(newName);
        io.emit('users', users);
        userSockets[newName] = userSockets[name];
        name = newName;
        io.emit('change name', newName);
    });

    socket.on('whisper', function(msg, recipient, sender) {
        if (userSockets[recipient] != null) {
            userSockets[recipient].emit('whisper', msg, sender);
        } else {
            userSockets[sender].emit('error message', recipient + " is offline.");
        }
    });

    socket.on('timezone', function(timezone) {
        timezoneName = timezone;
    });
});