'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GraphSchema = new Schema({
  title: String,
  data: Schema.Types.Mixed,
  owner: String,
  type: String
});

module.exports = mongoose.model('Graph', GraphSchema);