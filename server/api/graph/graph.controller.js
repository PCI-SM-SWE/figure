'use strict';

var _ = require('lodash');
var Graph = require('./graph.model');

// Get a list of graphs for a user
exports.index = function(req, res) {
  Graph.find({owner: req.params.name}, function (err, graph) {
    if(err) { return handleError(res, err); }
    if(!graph) { return res.send(404); }
    return res.json(graph);
  });
};

// Creates a new graph in the DB.
exports.create = function(req, res) {
  Graph.create(req.body, function(err, graph) {
    if(err) { return handleError(res, err); }
    return res.json(201, graph);
  });
};

// Updates an existing graph in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Graph.findById(req.params.id, function (err, graph) {
    if (err) { return handleError(res, err); }
    if(!graph) { return res.send(404); }
    var updated = _.merge(graph, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, graph);
    });
  });
};

// Deletes a graph from the DB.
exports.destroy = function(req, res) {
  Graph.findById(req.params.id, function (err, graph) {
    if(err) { return handleError(res, err); }
    if(!graph) { return res.send(404); }
    graph.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}