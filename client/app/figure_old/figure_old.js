'use strict';

angular.module('figureApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/figure/old', {
        templateUrl: 'app/figure_old/figure_old.html',
        controller: 'FigureOldCtrl'
      });
  });

/*
 * Makes save button unclickable if nothing is in field
 * Lot of repeating code, see if I can condense it somehow
 */

// For bar graph save button
$("#xAxisBar, #yAxisBar, #titleBar").on({
    mouseenter: function() {
        if($("#xAxisBar").val() == '' || $("#yAxisBar").val() == '' || $("#titleBar").val() == '' || $('#barGraph').children().length == 0) {
            $(".saveBtn").attr("disabled", "disabled");
        } else {
            $(".saveBtn").removeAttr("disabled");
        }
    },
    keyup: function() {
        if($("#xAxisBar").val() == '' || $("#yAxisBar").val() == '' || $("#titleBar").val() == '' || $('#barGraph').children().length == 0) {
            $(".saveBtn").attr("disabled", "disabled");
        } else {
            $(".saveBtn").removeAttr("disabled");
        }
    }
});

// For line graph save button
$("#xAxisLine, #yAxisLine, #titleLine").on({
    mouseenter: function() {
        if($("#xAxisLine").val() == '' || $("#yAxisLine").val() == '' || $("#titleLine").val() == '' || $('#lineGraph').children().length == 0) {
            $(".saveBtn").attr("disabled", "disabled");
        } else {
            $(".saveBtn").removeAttr("disabled");
        }
    },
    keyup: function() {
        if($("#xAxisLine").val() == '' || $("#yAxisLine").val() == '' || $("#titleLine").val() == '' || $('#lineGraph').children().length == 0) {
            $(".saveBtn").attr("disabled", "disabled");
        } else {
            $(".saveBtn").removeAttr("disabled");
        }
    }
});

// For pie chart save button
$("#valueField, #titlePie").on({
    mouseenter: function() {
        if($("#valueField").val() == '' || $("#titlePie").val() == '' || $('#pieChart').children().length == 0) {
            $(".saveBtn").attr("disabled", "disabled");
        } else {
            $(".saveBtn").removeAttr("disabled");
        }
    },
    keyup: function() {
        if($("#valueField").val() == '' || $("#titlePie").val() == '' || $('#pieChart').children().length == 0) {
            $(".saveBtn").attr("disabled", "disabled");
        } else {
            $(".saveBtn").removeAttr("disabled");
        }
    }
});

// For map save button
$("#locationField, #choroplethValueField, #titleChoroplethMap").on({
    mouseenter: function() {
        if($("#locationField").val() == '' || $("#choroplethValueField").val() == '' || $("#titleChoroplethMap").val() == '') {
            $(".saveBtn").attr("disabled", "disabled");
        } else {
            $(".saveBtn").removeAttr("disabled");
        }
    },
    keyup: function() {
        if($("#locationField").val() == '' || $("#choroplethValueField").val() == '' || $("#titleChoroplethMap").val() == '') {
            $(".saveBtn").attr("disabled", "disabled");
        } else {
            $(".saveBtn").removeAttr("disabled");
        }
    }
});

var Handler = function(socket)
{
    this.socket = socket;
};

// used for uploading a file to the server
Handler.prototype.fileUploadRequest = function(callback)
{
    var response = socket.on('file data', function(data)
    {
        callback(data);
    });
};

// client requests the file names in uploaded_files and sample_data directories
// client requests all tables names in ifloops.com
Handler.prototype.filesList = function(callback)
{/*
    var response = socket.on('files', function(filesObject)
    {
        callback(filesObject);
    }); */
};

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
};

// request a specified number of rows from table
Handler.prototype.storedTable = function(table, numEntries, callback)
{
    socket.emit('stored table requested', {'table': table, 'num_entries': numEntries});

    socket.on(table + ' data', function(data)
    {
        callback(data);
    });
};

// save a graph image with its information
Handler.prototype.saveGraph = function(graphObject)
{
    socket.emit('save graph', graphObject);
};

// retrieve all saved graphs
Handler.prototype.getSavedGraphs = function(callback)
{
    socket.emit('get saved graphs');

    socket.on('send saved graphs', function(graphObjects)
    {
        callback(graphObjects);
    });
};

// save dashboard as (dashboardName).html
Handler.prototype.saveDashboard = function(dashboardObject, callback)
{
    socket.emit('save dashboard', dashboardObject);
    callback();
};

// retrieve dashboard data
Handler.prototype.getDashboard = function(title, callback)
{
    socket.emit('get dashboard', title);

    socket.on('dashboard data sent', function(dashboardObject)
    {
        callback(dashboardObject);
    });
};

(function(global){

  /*
  Channels

  delivery.connect
  file.load

  send.start
  send.success
  send.error

  receive.start
  receive.success
  receive.error
  */
  var imageFilter = /^(image\/gif|image\/jpeg|image\/png|image\/svg\+xml|image\/tiff)/i,
      pubSub;

  /********************************/
  /****        PUBSUB     *********/
  /********************************/
  function PubSub(){
    this.channels = {};
  };

  PubSub.prototype.subscribe = function(channel, fn){
    if (this.channels[channel] === undefined) {
      this.channels[channel] = [fn];
    }else{
      this.channels[channel].push(fn);
    };
  };

  PubSub.prototype.publish = function(channel,obj){
    var cnl = this.channels[channel];
    var numChannels = (cnl === undefined) ? 0 : cnl.length;
    for (var i = 0; i < numChannels; i++) {
      cnl[i](obj);
    };
  };

  /********************************/
  /****        FilePackage    *****/
  /********************************/
  function FilePackage(file,receiving){
    _this = this;
    this.name = file.name;
    this.size = file.size;

    if(receiving){
      this.uid = file.uid;
      this.isText = file.isText;
      this.mimeType = file.mimeType;
      this.data = file.data;
      this.dataURLPrefix = file.prefix;
      pubSub.publish('receive.success',this);
    }else{
      //Sending a file.
      this.uid = this.getUID();
      this.reader = new FileReader();

      this.reader.onerror = function(obj){};

      this.reader.onload = function(){
        _this.base64Data = _this.reader.result;
        _this.prepBatch();
      };

      this.reader.readAsDataURL(file);
    };
  };


  FilePackage.prototype.getUID = function(){
    //fix this
    return this.name + this.size + (new Date()).getTime();
  };

  FilePackage.prototype.prepBatch = function(){
    //replace 'data:image/gif;base64,' with ''
    this.data = this.base64Data.replace(/^[^,]*,/,'');
    this.batch = {
      uid: this.uid,
      name: this.name,
      size: this.size,
      data: this.data
    };
    pubSub.publish('file.load',this);
  };

  FilePackage.prototype.isImage = function(){
    return imageFilter.test(this.mimeType);
  };

  FilePackage.prototype.isText = function(){
    return this.isText;
  }

  FilePackage.prototype.text = function(){
    return this.data;
  }

  FilePackage.prototype.dataURL = function(){
    return this.dataURLPrefix + this.data;
  };

  /********************************/
  /****        DELIVERY     *******/
  /********************************/
  function Delivery(socket){
    this.socket = socket;
    this.sending = {};
    this.receiving = {};
    this.connected = false;
    this.subscribe();
    this.connect();
  };

  Delivery.prototype.subscribe = function(){
    var _this = this;
    pubSub.subscribe('file.load',function(filePackage){
      _this.socket.emit('send.start',filePackage.batch);
    });

    pubSub.subscribe('receive.success',function(filePackage){
      _this.socket.emit('send.success',filePackage.uid);

    });

    //Socket Subscriptions
    this.socket.on('send.success',function(uid){
      pubSub.publish('send.success',_this.sending[uid]);
      delete _this.sending[uid];
    });

    this.socket.on('receive.start',function(file){
      pubSub.publish('receive.start',file.uid);
      var filePackage = new FilePackage(file,true);
      _this.receiving[file.uid] = filePackage;

    });
  };

  Delivery.prototype.connect = function(){
    var _this = this;
    this.socket.on('delivery.connect',function(){
      _this.connected = true;
      pubSub.publish('delivery.connect', _this);
    });
    this.socket.emit('delivery.connecting','');
  };

  Delivery.prototype.on = function(evt,fn){
    if (evt === 'delivery.connect' && this.connected) {
      return fn(this);
    };
    pubSub.subscribe(evt,fn);
  };

  Delivery.prototype.off = function(evt){
    throw "Delivery.off() has not yet been implemented.";
  };

  Delivery.prototype.send = function(file){
    var filePackage = new FilePackage(file);
    this.sending[filePackage.uid] = filePackage;
    return filePackage.uid;
  };

  pubSub = new PubSub();

  window.Delivery = Delivery;

})(window);
