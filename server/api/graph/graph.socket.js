/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Graph = require('./graph.model');

exports.register = function(socket) {
  Graph.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Graph.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('graph:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('graph:remove', doc);
}