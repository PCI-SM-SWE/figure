'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var id = require('mongoose').Types.ObjectId;

/*
  Test data is from config/environment/test.js
*/

var mockParamtype = {_id: id("00000000000000000000030f"), name: 'mock', type: 'mock', display: 'Mock', required: true, help: 'Mock help.'};

describe('GET /api/paramtypes', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/paramtypes')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('GET /api/paramtypes/:id', function() {

  it('should respond with a 500 on bad request', function(done) {
    request(app)
      .get('/api/paramtypes/1')
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      });
  });

  it('should respond with a 404 when the ID is not found', function(done) {
    request(app)
      .get('/api/paramtypes/ffffffffffffffffffffffff')
      .expect(404)
      .expect('Content-Type', /plain/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      });
  });

  it('should respond with JSON object', function(done) {
    request(app)
      .get('/api/paramtypes/000000000000000000000301')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('name');
        res.body.should.have.property('type');
        done();
      });
  });
});

describe('POST /api/paramtypes/', function() {

  it('should respond with JSON object', function(done) {
    request(app)
      .post('/api/paramtypes/')
      .send(mockParamtype)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('name');
        res.body.name.should.be.equal(mockParamtype.name);
        res.body.should.have.property('display');
        res.body.display.should.be.equal(mockParamtype.display);
        done();
      });
  });
});

describe('PUT|PATCH /api/paramtypes/:id', function() {

  it('should respond with JSON object', function(done) {
    mockParamtype.name = 'modified';
    request(app)
      .put('/api/paramtypes/' + mockParamtype._id)
      .send(mockParamtype)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('name');
        res.body.name.should.be.equal('modified');
        res.body.should.have.property('display');
        res.body.display.should.be.equal(mockParamtype.display);
        done();
      });
  });
});

describe('DELETE /api/paramtypes/:id', function() {

  it('should respond with nothing', function(done) {
    request(app)
      .delete('/api/paramtypes/' + mockParamtype._id)
      .send(mockParamtype)
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.ok;
        done();
      });
  });
});
