var express = require("express"),
    cluster = require("cluster"),
    net = require("net"),
    sio = require("socket.io"),
    sio_redis = require("socket.io-redis");

const Cryptr = require("cryptr");
const cryptr = new Cryptr("oUtRiGhTaLk_ApP");

// var port = 3262,
var port = 3264,
    num_processes = require("os").cpus().length;

console.log(num_processes);

if (cluster.isMaster) {
    // This stores our workers. We need to keep them to be able to reference
    // them based on source IP address. It's also useful for auto-restart,
    // for example.
    var workers = [];

    // Helper function for spawning worker at index 'i'.
    var spawn = function (i) {
        workers[i] = cluster.fork();

        // Optional: Restart worker on exit
        workers[i].on("exit", function (worker, code, signal) {
            console.log("respawning worker", i);
            spawn(i);
        });
    };

    // Spawn workers.
    for (var i = 0; i < num_processes; i++) {
        spawn(i);
    }

    // Helper function for getting a worker index based on IP address.
    // This is a hot path so it should be really fast. The way it works
    // is by converting the IP address to a number by removing the dots,
    // then compressing it to the number of slots we have.
    //
    // Compared against "real" hashing (from the sticky-session code) and
    // "real" IP number conversion, this function is on par in terms of
    // worker index distribution only much faster.
    var workerIndex = function (ip, len) {
        var _ip = ip.split(/['.'|':']/),
            arr = [];

        for (el in _ip) {
            if (_ip[el] == "") {
                arr.push(0);
            } else {
                arr.push(parseInt(_ip[el], 16));
            }
        }

        return Number(arr.join("")) % len;
    };

    // Create the outside facing server listening on our port.
    var server = net
        .createServer({ pauseOnConnect: true }, function (connection) {
            // We received a connection and need to pass it to the appropriate
            // worker. Get the worker for this connection's source IP and pass
            // it the connection.
            var worker =
                workers[workerIndex(connection.remoteAddress, num_processes)];
            worker.send("sticky-session:connection", connection);
        })
        .listen(port);
} else {
    // Note we don't use a port here because the master listens on it for us.
    var app = new express(),
        fs = require("fs"),
        cors = require("cors"),
        bodyParser = require("body-parser");

    // Here you might use middleware, attach routes, etc.

    // Don't expose our internal server to the outside.
    app.use(express.static(__dirname + "/public")); //set the root directory for web visitors
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cors());

    app.get("/app.js", (req, res, next) => {
        return res.sendFile(__dirname + "/view/app.js");
    });

    app.get("/socket.io.js", (req, res, next) => {
        return res.sendFile(
            __dirname + "/node_modules/socket.io-client/dist/socket.io.js"
        );
    });

    app.post("/encrypt", (req, res, next) => {
        try {
            let vals = Object.entries(req.body);

            for (let i = 0; i < vals.length; i++) {
                let ele = vals[i];

                req.body[ele[0]] = cryptr.encrypt(ele[1]);
            }

            return res.status(200).json({
                success: true,
                code: 200,
                data: {
                    ...req.body,
                },
            });
        } catch (err) {
            console.log(err);

            return res.status(400).json({
                success: false,
                code: 400,
                data: {},
            });
        }
    });

    app.post("/emit", (req, res) => {
        console.log("socket 1emitting");
        console.log(req.body.event, req.body.params, req.body.param);
        io.sockets.emit(req.body.event, JSON.parse(req.body.params));
        //io.sockets.emit("chatMessage", {"data": "1"})
        return res.status(200).json({});
    });

    var https = require("https").createServer(app);
    var http = require("http").createServer(app);
    var server = http.listen(0, "localhost");
    io = sio(server);

    // var httpServer = http.listen(3400, () => {
    //     console.log("server listening 3400")
    // })

    // Tell Socket.IO to use the redis adapter. By default, the redis
    // server is assumed to be on localhost:6379. You don't have to
    // specify them explicitly unless you want to change them.
    // io.adapter(sio_redis({ host: 'localhost', port: 6379 }));
    // try{
    //     io.adapter(sio_redis({ host: 'localhost', port: 6379 }));
    // }
    // catch(err){
    //     console.log(err)
    // }

    console.log("starting worker: " + cluster.worker.id);
    io.sockets.on("connection", function (socket) {
        console.log("connected to worker: " + cluster.worker.id);
        console.log("SOCKET CONNECTED", socket.id);
        socket.on("chatMessage", function (msg) {
            console.log("Message Received--Chat: ", msg);
            socket.broadcast.emit("chatMessage", msg);
        });
        socket.on("userStatus", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("userStatus", msg);
        });
        socket.on("RoomMemberOption", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("RoomMemberOption", msg);
        });
        socket.on("HeartBeat", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("HeartBeat", msg);
        });
        socket.on("UploadVideo", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("UploadVideo", msg);
        });
        socket.on("TopicUpdate", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("TopicUpdate", msg);
        });
        socket.on("DisableEnableInvitation", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("DisableEnableInvitation", msg);
        });
        socket.on("VideoAudioChnl", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("VideoAudioChnl", msg);
        });
        socket.on("VoiceVideoNoteChnl", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("VoiceVideoNoteChnl", msg);
        });
        socket.on("VVNCntChnl", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("VVNCntChnl", msg);
        });
        socket.on("Invite", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("Invite", msg);
        });
        socket.on("grabMic", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("grabMic", msg);
        });
        socket.on("playVideoChnl", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("playVideoChnl", msg);
        });
        socket.on("redDotChnl", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("redDotChnl", msg);
        });
        socket.on("pmChatMessage", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("pmChatMessage", msg);
        });
        socket.on("pmAddRemove", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("pmAddRemove", msg);
        });
        socket.on("chatTyping", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("chatTyping", msg);
        });
        socket.on("recentPm", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("recentPm", msg);
        });
        socket.on("loggedInOthrLoc", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("loggedInOthrLoc", msg);
        });
        socket.on("digSound", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("digSound", msg);
        });

        socket.on("roomMembers", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("roomMembers", msg);
        });

        socket.on("pmDetails", function (msg) {
            //console.log('Message Received: ', msg);

            socket.broadcast.emit("pmDetails", msg);
            //socket.join('pmRoom746');
            // socket.to("pmRoom746").emit('pmDetails', msg);
        });
    });

    // Here you might use Socket.IO middleware for authorization etc.

    // Listen to messages sent from the master. Ignore everything else.
    process.on("message", function (message, connection) {
        if (message !== "sticky-session:connection") {
            return;
        }

        // Emulate a connection event on the server by emitting the
        // event with the connection the master sent us.
        server.emit("connection", connection);

        connection.resume();
    });
}
