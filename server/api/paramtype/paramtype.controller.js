'use strict';

var _ = require('lodash');
var Paramtype = require('./paramtype.model');

// Get list of paramtypes
exports.index = function(req, res) {
  Paramtype.find(function (err, paramtypes) {
    if(err) { return handleError(res, err); }
    return res.json(200, paramtypes);
  });
};

// Get a single paramtype
exports.show = function(req, res) {
  Paramtype.findById(req.params.id, function (err, paramtype) {
    if(err) { return handleError(res, err); }
    if(!paramtype) { return res.send(404); }
    return res.json(paramtype);
  });
};

// Creates a new paramtype in the DB.
exports.create = function(req, res) {
  Paramtype.create(req.body, function(err, paramtype) {
    if(err) { return handleError(res, err); }
    return res.json(201, paramtype);
  });
};

// Updates an existing paramtype in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Paramtype.findById(req.params.id, function (err, paramtype) {
    if (err) { return handleError(res, err); }
    if(!paramtype) { return res.send(404); }
    var updated = _.merge(paramtype, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, paramtype);
    });
  });
};

// Deletes a paramtype from the DB.
exports.destroy = function(req, res) {
  Paramtype.findById(req.params.id, function (err, paramtype) {
    if(err) { return handleError(res, err); }
    if(!paramtype) { return res.send(404); }
    paramtype.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}