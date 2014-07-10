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

Handler.prototype.storedDataRequest = function(name, callback) {
	socket.emit('stored data requested', name);
	console.log(name);
	var response = socket.on(name + ' data', function(data) {
		socket.emit(name + ' received');
		callback(data);
	});
}

Handler.prototype.filesList = function(callback) {
	var response = socket.on('uploaded files', function(files) {
		callback(files);
	});
}

// Handler.prototype.saveAsImage = function (svgElement, callback)
// {
// 	var oSerializer = new XMLSerializer();
// 	var sXML = oSerializer.serializeToString(svgElement);
// 	console.log(sXML);

// 	var oParser = new DOMParser();
// 	var oDOM = oParser.parseFromString(sXML, "text/xml");
// 	console.log(oDOM);
// 	socket.emit('saveAsImage', );
// 	return;
// 	callback();
// }


//		socket.on('news', function(data) {
//			console.log(data);
//			socket.emit('my other event', {
//				my : 'data'
//			});
//		});