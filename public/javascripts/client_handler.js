var Handler = function(socket) {
	this.socket = socket;
}

Handler.prototype.sampleDataRequest = function(num, callback)
{
	socket.emit('sample' + num + ' requested');
	
	var response = socket.on('sample' + num + ' data', function(data)
	{
		socket.emit('sample' + num + ' received');
//		console.log(data);
		callback(data);
	});
}

Handler.prototype.fileUploadRequest = function(callback) {
	var response = socket.on('file data', function(data) {
		callback(data);
	});
}


//		socket.on('news', function(data) {
//			console.log(data);
//			socket.emit('my other event', {
//				my : 'data'
//			});
//		});