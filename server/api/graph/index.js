'use strict';

var express = require('express');
var controller = require('./graph.controller');

var router = express.Router();

router.get('/:name', controller.index);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;