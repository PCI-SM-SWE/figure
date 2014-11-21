'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var id = require('mongoose').Types.ObjectId;

/*
  Test data is from config/environment/test.js
*/

var mockThing = {_id: id("00000000000000000000000f"), name: 'mock', info: 'mocked info'};

describe('GET /api/things', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/things')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('GET /api/things/:id', function() {

  it('should respond with a 500 on bad request', function(done) {
    request(app)
      .get('/api/things/1')
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
      .get('/api/things/ffffffffffffffffffffffff')
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
      .get('/api/things/000000000000000000000001')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('name');
        res.body.should.have.property('info');
        done();
      });
  });
});

describe('POST /api/things/', function() {

  it('should respond with JSON object', function(done) {
    request(app)
      .post('/api/things/')
      .send(mockThing)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('name');
        res.body.name.should.be.equal(mockThing.name);
        res.body.should.have.property('info');
        res.body.info.should.be.equal(mockThing.info);
        done();
      });
  });
});

describe('PUT|PATCH /api/things/:id', function() {

  it('should respond with JSON object', function(done) {
    mockThing.name = 'modified';
    request(app)
      .put('/api/things/' + mockThing._id)
      .send(mockThing)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('name');
        res.body.name.should.be.equal('modified');
        res.body.should.have.property('info');
        res.body.info.should.be.equal(mockThing.info);
        done();
      });
  });
});

describe('DELETE /api/things/:id', function() {

  it('should respond with nothing', function(done) {
    request(app)
      .delete('/api/things/' + mockThing._id)
      .send(mockThing)
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.ok;
        done();
      });
  });
});
