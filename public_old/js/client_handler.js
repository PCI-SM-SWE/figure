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

// Handler.prototype.redisError = function(callback)
// {
// 	socket.on('Redis Error', function(err)
// 	{
// 		callback(err);
// 	});
// }

// used for uploading a file to the server
Handler.prototype.fileUploadRequest = function(callback)
{
	var response = socket.on('file data', function(data)
	{
		callback(data);
	});
}

// client requests the file names in uploaded_files and sample_data directories
// client requests all tables names in ifloops.com
Handler.prototype.filesList = function(callback)
{
	var response = socket.on('files', function(filesObject)
	{
		callback(filesObject);
	});
}

// request actual contents of a file
Handler.prototype.storedDataRequest = function(name, callback)
{
	socket.emit('stored data requested', name);
	// console.log(name);
	
	socket.on(name + ' data', function(data)
	{
		socket.emit(name + ' received');
		callback(data);
	});
}

// request a specified number of rows from table
Handler.prototype.storedTable = function(table, numEntries, callback)
{
	socket.emit('stored table requested', {'table': table, 'num_entries': numEntries});

	socket.on(table + ' data', function(data)
	{
		callback(data);
	});
}

// save a graph image with its information
Handler.prototype.saveGraph = function(graphObject)
{
	socket.emit('save graph', graphObject);
}

// retrieve all saved graphs
Handler.prototype.getSavedGraphs = function(callback)
{
	socket.emit('get saved graphs');

	socket.on('send saved graphs', function(graphObjects)
	{
		callback(graphObjects);
	});
}

// save dashboard as (dashboardName).html
Handler.prototype.saveDashboard = function(dashboardObject, callback)
{
	socket.emit('save dashboard', dashboardObject);
	callback();
}

// retrieve dashboard data
Handler.prototype.getDashboard = function(title, callback)
{
	socket.emit('get dashboard', title);

	socket.on('dashboard data sent', function(dashboardObject)
	{
		callback(dashboardObject);
	});
}