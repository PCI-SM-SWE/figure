var client = function (socket)
{
	this.socket = socket;
};

client.prototype.getSampleData = function (num)
{
	this.socket.emit ('getSampleData', num);
}

/*
client.prototype.getScoreboard = function ()
{
	this.socket.emit ("getScoreboard");
};

client.prototype.submitActivity = function (firstName, lastName, activity)
{
	var parameters = {'firstName': firstName, 'lastName': lastName, 'activity': activity};
	this.socket.emit ("submitActivity", parameters);
};*/

