/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');

Thing.find({}).remove(function() {
  Thing.create({
    name : 'Data Source Integration',
    info : 'Consume data from multiple different sources including: MySQL, Hadoop, some other fancy thing!'
  }, {
    name : 'Powerful Insight',
    info : 'Filter large data sets to see what really matters!'
  }, {
    name : 'Elegant Visualizations',
    info : 'Beatiful graphs guide analysis!'
  }, {
    name : 'Scalability',
    info : 'One-click network set-up!'
  }, {
    name : 'Security',
    info : 'Your data is secure if you choose to upload it!'
  });
});

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
    }
  );
});