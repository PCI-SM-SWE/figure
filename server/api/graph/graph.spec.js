'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var id = require('mongoose').Types.ObjectId;

/*
  Test data is from config/environment/test.js
*/

var mockGraph = {_id: id("00000000000000000000040f"), title: 'mock', owner: 'mock', data: [], type: 'mock'};

describe('GET /api/graphs/:name', function() {

  it('should respond with a 404 when the ID is not found', function(done) {
    request(app)
      .get('/api/graphs')
      .expect(404)
      .expect('Content-type', /text/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      });
  });

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/graphs/test')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.length.should.be.equal(1);
        res.body[0].should.have.property('title');
        res.body[0].should.have.property('owner');
        res.body[0].owner.should.be.equal('test');
        done();
      });
  });
});

describe('POST /api/graphs/', function() {

  it('should respond with JSON object', function(done) {
    request(app)
      .post('/api/graphs/')
      .send(mockGraph)
      .expect(201)
      .expect('Content-type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('title');
        res.body.title.should.be.equal(mockGraph.title);
        res.body.should.have.property('owner');
        res.body.owner.should.be.equal(mockGraph.owner);
        done();
      });
  });
});

describe('PUT|PATCH /api/graphs/:id', function() {

  it('should respond with JSON object', function(done) {
    mockGraph.title = 'modified';
    request(app)
      .put('/api/graphs/' + mockGraph._id)
      .send(mockGraph)
      .expect(200)
      .expect('Content-type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('title');
        res.body.title.should.be.equal('modified');
        res.body.should.have.property('owner');
        res.body.owner.should.be.equal(mockGraph.owner);
        done();
      });
  });

  it('should respond with a 500 on bad request', function(done) {
    request(app)
      .put('/api/graphs/1')
      .send(mockGraph)
      .expect(500)
      .expect('Content-type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      });
  });
});

describe('DELETE /api/graphs/:id', function() {

  it('should respond with nothing', function(done) {
    request(app)
      .delete('/api/graphs/' + mockGraph._id)
      .send(mockGraph)
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.ok;
        done();
      });
  });
});
