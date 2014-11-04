/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Paramtype = require('./paramtype.model');

exports.register = function(socket) {
  Paramtype.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Paramtype.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('paramtype:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('paramtype:remove', doc);
}