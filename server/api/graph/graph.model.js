'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GraphSchema = new Schema({
  title: String,
  data: Array,
  owner: String,
  type: String,
  params: Array
});

module.exports = mongoose.model('Graph', GraphSchema);