'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GraphtypeSchema = new Schema({
  type: String,
  formalName: String,
  params: Array,
  learnMore: String,
  description: String
});

module.exports = mongoose.model('Graphtype', GraphtypeSchema);