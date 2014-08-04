var Handler = function(socket)
{
	this.socket = socket;
}

// Handler.prototype.sampleDataRequest = function(num, callback)
// {
// 	socket.emit('sample' + num + ' requested');
	
// 	var response = socket.on('sample' + num + ' data', function(data)
// 	{
// 		socket.emit('sample' + num + ' received');
// 	//	console.log(data);
// 		callback(data);
// 	});
// }

Handler.prototype.redisError = function(callback)
{
	socket.on('Redis Error', function(err)
	{
		callback(err);
	});
}

Handler.prototype.fileUploadRequest = function(callback)
{
	var response = socket.on('file data', function(data)
	{
		callback(data);
	});
}

Handler.prototype.storedDataRequest = function(name, callback)
{
	socket.emit('stored data requested', name);
	console.log(name);
	
	socket.on(name + ' data', function(data)
	{
		socket.emit(name + ' received');
		callback(data);
	});
}

Handler.prototype.filesList = function(callback)
{
	var response = socket.on('files', function(filesObject)
	{
		callback(filesObject);
	});
}

Handler.prototype.saveGraph = function(graphObject)
{
	socket.emit('save graph', graphObject);
}

Handler.prototype.getSavedGraphs = function(callback)
{
	socket.emit('get saved graphs');

	socket.on('send saved graphs', function(graphObjects)
	{
		callback(graphObjects);
	});
}