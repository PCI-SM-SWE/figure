'use strict';

// Test specific configuration
// ===========================

var Thing = require('../../api/thing/thing.model');
var User = require('../../api/user/user.model');
var Graphtype = require('../../api/graphtype/graphtype.model');
var Paramtype = require('../../api/paramtype/paramtype.model');
var Graph = require('../../api/graph/graph.model');
var id = require('mongoose').Types.ObjectId;

Thing.find({}).remove(function() {
  Thing.create({
    _id: new id('000000000000000000000001'),
    name: 'Test Thing',
    info: 'Some other fancy thing!'
  });
});

User.find({}).remove(function() {
  User.create({
    _id: new id('000000000000000000000101'),
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  });
});

Graphtype.find({}).remove(function() {
  Graphtype.create({
    _id: new id('000000000000000000000201'),
    type: 'test',
    formalName: 'Test Chart',
    params: ['x', 'y'],
    learnMore: 'https://en.wikipedia.org/',
    description: 'A test chart.'
  });
});

Paramtype.find({}).remove(function() {
  Paramtype.create({
    _id: new id('000000000000000000000301'),
    name: 'test',
    type: 'string',
    display: 'Test',
    required: true,
    help: 'This is the help message.'
  });
});

Graph.find({}).remove(function() {
  Graph.create({
    _id: new id('000000000000000000000401'),
    title: 'test',
    data: [],
    owner: 'test',
    type: 'test'
  });
});

module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/figure-test'
  }
};