'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var id = require('mongoose').Types.ObjectId;

/*
  Test data is from config/environment/test.js
*/

var mockGraphtype = {_id: id("00000000000000000000020f"), type: 'mock', formalName: 'Mock', params: [], learnMore: 'mock.com', description: 'A mock description.'};

describe('GET /api/graphtypes', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/graphtypes')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('GET /api/graphtypes/:id', function() {

  it('should respond with a 500 on bad request', function(done) {
    request(app)
      .get('/api/graphtypes/1')
      .expect(500)
      .expect('Content-type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      });
  });

  it('should respond with a 404 when the ID is not found', function(done) {
    request(app)
      .get('/api/graphtypes/ffffffffffffffffffffffff')
      .expect(404)
      .expect('Content-type', /plain/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      });
  });

  it('should respond with JSON object', function(done) {
    request(app)
      .get('/api/graphtypes/000000000000000000000201')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('type');
        res.body.should.have.property('formalName');
        done();
      });
  });
});

describe('POST /api/graphtypes/', function() {

  it('should respond with JSON object', function(done) {
    request(app)
      .post('/api/graphtypes/')
      .send(mockGraphtype)
      .expect(201)
      .expect('Content-type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('type');
        res.body.type.should.be.equal(mockGraphtype.type);
        res.body.should.have.property('formalName');
        res.body.formalName.should.be.equal(mockGraphtype.formalName);
        done();
      });
  });
});

describe('PUT|PATCH /api/graphtypes/:id', function() {

  it('should respond with JSON object', function(done) {
    mockGraphtype.type = 'modified';
    request(app)
      .put('/api/graphtypes/' + mockGraphtype._id)
      .send(mockGraphtype)
      .expect(200)
      .expect('Content-type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('type');
        res.body.type.should.be.equal('modified');
        res.body.should.have.property('formalName');
        res.body.formalName.should.be.equal(mockGraphtype.formalName);
        done();
      });
  });
});

describe('DELETE /api/graphtypes/:id', function() {

  it('should respond with nothing', function(done) {
    request(app)
      .delete('/api/graphtypes/' + mockGraphtype._id)
      .send(mockGraphtype)
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.ok;
        done();
      });
  });
});
