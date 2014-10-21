var socketio = require ('socket.io');
var fs = require ('fs');
var io;

exports.listen = function (server) {
    io = socketio.listen(server);
    io.set('log level', 1);

    io.sockets.on ('connection', function (socket) {
        sendSampleData (socket);
        //methods go here
    });
};

function sendSampleData (socket) {
    socket.on ('getSampleData', function (num) {
        if (num == 1) {
            fs.readFile('./public/sample_data/Charm_City_Circulator_Ridership.csv', 'utf8', function (err, data) {
                if (err)
                    return console.log(err);

                //console.log (data);
                socket.emit('sendSampleData', data);
            });
        }
        else if (num == 2) {
            fs.readFile('./public/sample_data/pie_chart_sample_data.csv', 'utf8', function (err, data) {
                if (err)
                    return console.log(err);

                //console.log (data);
                socket.emit('sendSampleData', data);
            });
        }
        else {
            socket.emit('sendSampleData', 'Sorry, no sample data found.');
        }
    });
}
