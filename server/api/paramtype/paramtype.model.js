'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ParamtypeSchema = new Schema({
  name: String,
  type: String,
  display: String,
  required: Boolean,
  help: String
});

module.exports = mongoose.model('Paramtype', ParamtypeSchema);