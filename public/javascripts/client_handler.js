var Handler = function(socket) {
	this.socket = socket;
}

Handler.prototype.sample1Request = function(callback) {
	socket.emit('sample1 requested', 'Sample Data 1 Requested');
	var response = socket.on('sample1 data', function(data) {
		socket.emit('sample1 received', 'Sample Data 1 Received');
//		console.log(data);
		callback(data);
	});
}


//		socket.on('news', function(data) {
//			console.log(data);
//			socket.emit('my other event', {
//				my : 'data'
//			});
//		});