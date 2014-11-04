/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Graphtype = require('./graphtype.model');

exports.register = function(socket) {
  Graphtype.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Graphtype.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('graphtype:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('graphtype:remove', doc);
}