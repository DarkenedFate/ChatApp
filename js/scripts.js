/*************
 * socket.io stuff
 */

var socket = io.connect("http://191.238.32.68:8080");

var autoScroll = false;
var myName = '';

var textInput = $("#text");

$("#send-msg").click(function () {
    if (textInput.val() != '') {
        if (textInput.val().substring(0, 3) == "/me") {
            socket.emit('emote', textInput.val().substring(3, textInput.val().length));
        } else {
            socket.emit('chat message', textInput.val());
        }

        socket.emit('done typing');
        textInput.val('');
        return false;
    }
});

var timer = null;

textInput.keypress(function (event) {
    if (textInput.val() != '') {

        if (textInput.val().substring(0, 1) != "/") {
            socket.emit('user typing');
            clearTimeout(timer);

            timer = setTimeout(function () {
                socket.emit('done typing');
            }, 500);
        }

        if (event.which == 13) { // user pressed enter
            event.preventDefault();

            if (textInput.val().substring(0, 3) == "/me") {
                socket.emit('emote', textInput.val().substring(3, textInput.val().length));
            } else if (textInput.val().substring(0, 5) == "/name") {
                var regex = new RegExp("\\W");
                var newName = textInput.val().substring(6, textInput.val().length);
                if (newName.length > 0) {
                    if (regex.test(newName)) {
                        $("#messages").append("<p style='color: red;'>You may only use alphanumeric" +
                        " characters and underscores (_) in your name</p>");
                        textInput.val('');
                        return false;
                    }
                    else {
                        socket.emit('change name', newName);
                        myName = newName;
                    }
                }
            } else if (textInput.val().substring(0, 5) == "/help") {
                $("#messages").append("<p style='color: yellow;'>Available Commands:<br/>" +
                "/help -- displays this message<br/>" +
                "/name [new name] -- changes your name<br/>" +
                "/me [msg] -- send an emote</p>");
                $("#messages").scrollTop($("#messages")[0].scrollHeight);
            } else if (textInput.val().substring(0, 2) == "/w") {
                var command = textInput.val().split(" ");
                var recipient = command[1];
                var msg = command.slice(2, command.length);

                socket.emit('whisper', msg.join(" "), recipient, myName);
                $("#messages").append("<p style='color: mediumpurple;'>To " + recipient + ": " + msg.join(" ") + "</p>");

            } else {
                socket.emit('chat message', textInput.val());
            }

            socket.emit('done typing');
            textInput.val('');
            return false;
        }
    }
});

$("#submit-user").click(function () {

    myName = $("#name").val();

    $("#login-container").fadeOut(function () {
        $("#chat-container").fadeIn(function () {
            textInput.focus();
        });
    });

    socket.emit('username', myName);
    socket.emit('users');
    socket.emit('server message', "[Server] " + myName + " has joined the chat.");
    $("#name").val('');
    return false;
});

$("#name").keypress(function (event) {

    var regex = new RegExp("[a-zA-Z0-9_]");
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);

    if (event.which == 13) {
        event.preventDefault();

        myName = $("#name").val();

        $("#login-container").fadeOut(function () {
            $("#chat-container").fadeIn(function () {
                textInput.focus();
            });
        });
        socket.emit('username', myName);
        socket.emit('users');
        socket.emit('server message', "[Server] " + myName + " has joined the chat.");
        $("#name").val('');
        return false;
    }

    if (!regex.test(key)) {
        event.preventDefault();
        return false;
    }

});

socket.on('chat message', function (msg) {
    $("#messages").append("<p>" + msg + "</p>");
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
});

socket.on('server message', function (msg) {
    $("#messages").append("<p class='red-text'>" + msg + "</p>");
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
});

socket.on('users', function (data) {
    $("#users").html('');
    $.each(data, function (index, value) {
        $("#users").append("<p>" + value + "</p>");
    });
});

socket.on('user typing', function (data, name) {
    if (!$("#" + name).length && name != myName) {
        $("#whos-typing").append("<p id=" + name + ">" + data + "</p>");
    }
});

socket.on('done typing', function (name) {
    $("#" + name).remove();
});

socket.on('emote', function (msg, name) {
    $("#messages").append("<p style='color: orange;'>" + name + " " + msg + "</p>");
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
});

socket.on('change name', function(name) {
    //myName = name;
});

socket.on('whisper', function(msg, sender){
    $("#messages").append("<p style='color: mediumpurple;'>Whisper from " + sender + ": " + msg + "</p>");
});

socket.on('error message', function(msg) {
    $("#messages").append("<p style='color: red;'>" + msg + "</p>");
});

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
        indexes.push(i);
    }
    return indexes;
}

/*************
 * jQuery section
 */

$(function () {
    $("#chat-container").hide();
    $("#name").focus();
});