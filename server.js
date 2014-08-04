var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var express = require('express');
var app = express();
var redis = require("redis");
var client = redis.createClient(6379, "107.170.173.86", {max_attempts:5});

// Socket IO begins
var io = require('socket.io')(server);
var dl = require('delivery');

app.set('port', process.env.PORT || 80);
app.use(express.static(path.join(__dirname, 'public')));

client.on("error", function (err)
{
	console.log(err);
	socket.emit('Redis Error', err);
});

// client.on("connect", function()
// {
// 	console.log("Redis connected");
// 	// client.hkeys("graphs", function (err, replies)
// 	// {
// 	// 	graphCounter = replies.length;
// 	// });
// });

function send404(response)
{
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

function sendFile(response, filePath, fileContents)
{
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}
		);
	response.end(fileContents);
}

function serveStatic(response, cache, absPath)
{
	if (cache[absPath])
	{
		sendFile(response, absPath, cache[absPath]);
	} 
	else
	{
		fs.exists(absPath, function(exists)
		{
			if (exists)
			{
				fs.readFile(absPath, function(err, data)
				{
					if (err) 
						send404(response);
					else 
					{
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} 
			else
				send404(response);
		});
	}
}

app.get('/', function (req, res)
{
	res.render('./public/index.html');	
});

//app.get('')

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

// var server = http.createServer(function(request, response)
// {
// 	var filePath = false;
	
// 	if (request.url == '/')
// 		filePath = 'public/index.html';
// 	else 
// 		filePath = 'public' + request.url;

// 	var absPath = './' + filePath;
// 	serveStatic(response, cache, absPath);
// });

function getFile(path, callback)
{
	fs.readFile(path,'utf-8', function (err, data)
	{
		if (err)
			throw err;
		if (typeof callback === "function") 
			callback(data);		
	});
}

// server.listen(80, function()
// {
// 	console.log("Server listening on port 80.");
// });



//function handler(req, res) {
//	fs.readFile(__dirname + '/index.html', function(err, data) {
//		if(err) {
//			res.writeHead(500);
//			return res.end('Error loading index.html');
//		}
//		res.writeHead(200);
//		res.end(data);
//	});fff
//}

io.on('connection', function(socket)
{
	console.log('Client connected');
	
	// Sending list of previously uploaded files to client
	fs.readdir('./uploaded_files', function(err, uploaded_files)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			// console.log(uploaded_files);

			for (var i = 0; i < uploaded_files.length; i++)
				uploaded_files[i] = './uploaded_files/' + uploaded_files[i]

			// Sending list of samples files to client
			fs.readdir('./public/sample_data', function(err, sample_data)
			{
				if(err)
				{
					console.log(err);
				}
				else
				{
					// console.log(sample_data);

					for (var i = 0; i < sample_data.length; i++)
						sample_data[i] = './public/sample_data/' + sample_data[i]

					socket.emit('files', {'uploaded_files': uploaded_files, 'sample_data': sample_data});
				}
			});
		}
	});

	// socket.on('sample1 requested', function(response)
	// {
	// 	console.log("Sample 1 requested");
	// 	getFile('./public/sample_data/Charm_City_Circulator_Ridership.csv', function(data)
	// 	{
	// 		socket.emit('sample1 data', data);
	// 	});
	// });

	// socket.on('sample1 received', function(response)
	// {
	// 	console.log("Sample 1 sent succesfully");
	// });


	// socket.on('sample2 requested', function(response)
	// {
	// 	console.log("Sample 2 requested");
	// 	getFile('./public/sample_data/pie_chart_sample_data.csv', function(data)
	// 	{
	// 		socket.emit('sample2 data', data);
	// 	});
	// });

	// socket.on('sample2 received', function(response)
	// {
	// 	console.log("Sample 2 sent succesfully");
	// });


	// socket.on('sample3 requested', function(response)
	// {
	// 	console.log("Sample 3 requested");
	// 	getFile('./public/sample_data/choropleth_map_sample_data.csv', function(data)
	// 	{
	// 		socket.emit('sample3 data', data);
	// 	});
	// });

	// socket.on('sample3received', function(response)
	// {
	// 	console.log("Sample 3 sent succesfully");
	// });


	// socket.on('sample4 requested', function(response)
	// {
	// 	console.log("Sample 4 requested");
	// 	getFile('./public/sample_data/upload_testing2.csv', function(data)
	// 	{
	// 		socket.emit('sample4 data', data);
	// 	});
	// });

	// socket.on('sample4 received', function(response)
	// {
	// 	console.log("Sample 4 sent succesfully");
	// });

	// Sending data previously uploaded
	socket.on('stored data requested', function(name)
	{
		console.log(name + " requested");
		getFile(name, function(data)
		{	
			socket.emit(name + ' data', data);
		});

		socket.on(name + ' received', function(response)
		{
			console.log(name + " sent succesfully");
		})
	});

	socket.on('save graph', function(graphObject)
	{
		// var base64Data = graphObject.png.replace(/^data:image\/png;base64,/, "");
		
		// fs.writeFile("./public/saved_images/graph" + graphCounter + ".png", base64Data, "base64", function(err)
		// {
		// 	console.log(err);
		// });
		
		client.hset('graphs', graphObject.title, JSON.stringify(graphObject));
		// console.log('finished saving');
	});

	socket.on('get saved graphs', function()
	{
		client.hkeys("graphs", function (err, replies)
		{
			// console.log('in get saved graphs');
			// console.log(replies);

			graphCounter = replies.length;

			// fs.readdir('./public/saved_images', function(err, uploaded_files)
			// {	
			// 	if (uploaded_files.length != graphCounter)
			// 	{
			// 		console.log("Redis and ./public/saved_images folder are out of sync");
			// 		return;
			// 	}

			// 	uploaded_files.sort(function(a, b)
			// 	{	
			// 		return (fs.statSync('./public/saved_images/' + a).mtime.getTime() - fs.statSync('./public/saved_images/' + b).mtime.getTime());
			// 	});
			// });	
	
			var graphObjects = new Array();
			var multi = client.multi();
			var indices = new Array();

			replies.forEach(function(title)
			{
				multi.hget('graphs', title, function(err, reply)
				{
					var graphObject = JSON.parse(reply);
					graphObjects.push(graphObject);				
				});
			})


			// for (var i = 0; i < graphCounter; i++)
			// {
			// 	indices.push(i);
			// }

			// indices.forEach(function(index)
			// {
			// 	multi.hget('graphs', 'graph:' + index, function(err, reply)
			// 	{
			// 		var graphObject = JSON.parse(reply);
			//  		//graphObject.file_name = uploaded_files[i];
			//  		// graphObject.file_name = 'graph' + i;
			// 		graphObjects.push(graphObject);				
			// 	});
			// });

			// for (var i = 0; i < graphCounter; i++)
			// {
			// 	multi.hget('graphs', 'graph:' + i, function(err, reply)
			// 	{
			// 		var graphObject = JSON.parse(reply);
			//  		//graphObject.file_name = uploaded_files[i];
			//  		// graphObject.file_name = 'graph' + i;
			// 		graphObjects.push(graphObject);				
			// 	});
			// }

			multi.exec(function(err, reply)
			{	
				// for (var i = 0; i < graphCounter; i++)
				// 	graphObjects[i].file_name = uploaded_files[i];
				socket.emit('send saved graphs', graphObjects);
			});
		});		
	});
});

/*
 * Using delivery to send uploaded files to the server, then back from the server to the
 * client, having converted the contents of the file to a string to be parsed client-side(for now)
 */
io.sockets.on('connection', function(socket)
{
	var delivery = dl.listen(socket);

	delivery.on('receive.success',function(file)
	{
		fs.writeFile('./uploaded_files/'+file.name,file.buffer, function(err)
		{
			if(err)
			{
				console.log('File could not be saved.');
			}
			else
			{
				console.log('File ' + file.name + ' recieved');
				socket.emit('file data', file.buffer.toString());
			}
		});
	});
});


//var chatServer = require('./public/javascripts/server_handler.js');
//chatServer.listen(server);
