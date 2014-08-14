var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var express = require('express');
var app = express();
var redis = require("redis");
var client = redis.createClient(6379, "107.170.173.86", {max_attempts:5});
var mysql = require('mysql');
// var pool = mysql.createPool(
// {
// 	host: 'ifloops.com',
// 	user: 'figure',
// 	password: 'figure'
// });

// pool.getConnection(function(err, connection)
// {
// 	connection.query('use test_source', function(err)
// 	{
// 		if (err)
// 		{
// 			console.log(err);
// 			return;
// 		}

// 		console.log('connected to mysql');
// 	});

// 	connection.release();
// });

var mysqlConnection = mysql.createConnection(
{
	host: 'ifloops.com',
	user: 'figure',
	password: 'figure',
	database: 'test_source'
});

mysqlConnection.connect(function(err)
{
	if (err)
	{
		console.log(err.stack);
		return;
	}

	console.log('connected to mysql');
});

app.set('port', process.env.PORT || 80);
app.use(express.static(path.join(__dirname, 'public')));

// client.on("connect", function()
// {
// 	console.log("Redis connected");
// 	// client.hkeys("graphs", function (err, replies)
// 	// {
// 	// 	graphCounter = replies.length;
// 	// });
// });

// function send404(response)
// {
// 	response.writeHead(404, {'Content-Type': 'text/plain'});
// 	response.write('Error 404: resource not found.');
// 	response.end();
// }

// function sendFile(response, filePath, fileContents)
// {
// 	response.writeHead(
// 		200,
// 		{"content-type": mime.lookup(path.basename(filePath))}
// 		);
// 	response.end(fileContents);
// }

// function serveStatic(response, cache, absPath)
// {
// 	if (cache[absPath])
// 	{
// 		sendFile(response, absPath, cache[absPath]);
// 	} 
// 	else
// 	{
// 		fs.exists(absPath, function(exists)
// 		{
// 			if (exists)
// 			{
// 				fs.readFile(absPath, function(err, data)
// 				{
// 					if (err) 
// 						send404(response);
// 					else 
// 					{
// 						cache[absPath] = data;
// 						sendFile(response, absPath, data);
// 					}
// 				});
// 			} 
// 			else
// 				send404(response);
// 		});
// 	}
// }

app.get('/', function(req, res)
{
	res.render('./public/index.html');	
});

app.get('/*', function(req, res)
{
	res.sendfile('./public/saved_dashboards/' + req.originalUrl.substring(1) + '.html');
});

app.listen();

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

// Socket IO begins
var io = require('socket.io')(server);
var dl = require('delivery');

// client.on("error", function (err)
// {
// 	console.log(err);
// 	socket.emit('Redis Error', err);
// });

io.on('connection', function(socket)
{
	console.log('Client connected');

	// Sending list of previously uploaded files to client
	fs.readdir('./public/uploaded_files', function(err, uploaded_files)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			// console.log(uploaded_files);

			for (var i = 0; i < uploaded_files.length; i++)
				uploaded_files[i] = './public/uploaded_files/' + uploaded_files[i]

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

					mysqlConnection.query("select table_name from information_schema.tables where table_type = 'Base Table' and table_schema = 'test_source'", function(err, fields)
					{
						var mysqlTables = [];
						
						for (var j = 0; j < fields.length; j++)
							mysqlTables[j] = fields[j].table_name;

						socket.emit('files', {'uploaded_files': uploaded_files, 'sample_data': sample_data, 'mysql_tables' : mysqlTables});
					});					
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
		//console.log(name + " requested");
		getFile(name, function(data)
		{	
			socket.emit(name + ' data', data);
		});

		socket.on(name + ' received', function(response)
		{
			//console.log(name + " sent succesfully");
		})
	});

	socket.on('stored table requested', function(table)
	{
		console.log('stored table requested');		
		console.log(table);
		mysqlConnection.query("select column_name from information_schema.columns where table_name = 'fec_contrib';", function(err, fields)
		{
			if (err)
				console.log(err);

			//console.log(fields);

			var column_names = [];

			for (var i = 0; i < fields.length; i++)
				column_names[i] = fields[i].column_name;
			
			mysqlConnection.query("select * from fec_contrib limit 100", function(err, data)
			{
				socket.emit(table + ' data', {'headers': column_names, 'data': data});
			});
		});		
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

			if (err)
			{
				console.log(err);
				return;
			}

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
			});


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

	socket.on('save dashboard', function(dashboardObject)
	{
		fs.writeFile('./public/saved_dashboards/' + dashboardObject.title + '.html', dashboardObject.html, function(err)
		{		
			if (err)
			{
				console.log(err);
				return;
			}

			client.hset('dashboards', dashboardObject.title, JSON.stringify(dashboardObject.grid));
			// console.log("1");
			// socket.emit('dashboard received', true);
			// console.log("2");
		});
	});

	socket.on('get dashboard', function(title)
	{
		client.hget('dashboards', title, function(err, reply)
		{
			if (err)
			{
				console.log(err);
				return;
			}

			//console.log(JSON.parse(reply));
			socket.emit('dashboard data sent', {'title': title, 'grid': JSON.parse(reply)});
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
		fs.writeFile('./public/uploaded_files/'+file.name,file.buffer, function(err)
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
