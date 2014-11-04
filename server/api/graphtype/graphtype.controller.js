'use strict';

var _ = require('lodash');
var Graphtype = require('./graphtype.model');

// Get list of graphtypes
exports.index = function(req, res) {
  Graphtype.find(function (err, graphtypes) {
    if(err) { return handleError(res, err); }
    return res.json(200, graphtypes);
  });
};

// Get a single graphtype
exports.show = function(req, res) {
  Graphtype.findById(req.params.id, function (err, graphtype) {
    if(err) { return handleError(res, err); }
    if(!graphtype) { return res.send(404); }
    return res.json(graphtype);
  });
};

// Creates a new graphtype in the DB.
exports.create = function(req, res) {
  Graphtype.create(req.body, function(err, graphtype) {
    if(err) { return handleError(res, err); }
    return res.json(201, graphtype);
  });
};

// Updates an existing graphtype in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Graphtype.findById(req.params.id, function (err, graphtype) {
    if (err) { return handleError(res, err); }
    if(!graphtype) { return res.send(404); }
    var updated = _.merge(graphtype, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, graphtype);
    });
  });
};

// Deletes a graphtype from the DB.
exports.destroy = function(req, res) {
  Graphtype.findById(req.params.id, function (err, graphtype) {
    if(err) { return handleError(res, err); }
    if(!graphtype) { return res.send(404); }
    graphtype.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}