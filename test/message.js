let app = require('../src/index')
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let should = chai.should();

var assert = require('assert');
let messageModel = require('../src/models/message');

describe('messageModel', function(){

  it('should respond 403 due to missing bearer ', function(done) {
    chai.request('http://localhost:3004')
      .post('/api/v1/sns')
      .end(function (err, res) {
        res.should.have.status(403);
        res.should.be.json;
        res.body.should.have.property("status");
        res.body.status.should.be.equal("fail");
        done();
      });
  });

  it('should respond 500 because of bad bearer token ', function(done) {

    let message = "uport.me:" + Array(3).join('asdf');
    chai.request('http://localhost:3004')
      .post('/api/v1/sns')
      .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIyb2pRSmZmYlAyck03cG5rOEdocng1Y2NzUTZrdXJVaThwQiIsImlhdCI6MTUxMDY5NTQ0NCwiYXVkIjoiMm9lWHVmSEdEcFU1MWJmS0JzWkRkdTdKZTl3ZUozcjdzVkciLCJ0eXBlIjoibm90aWZpY2F0aW9ucyIsInZhbHVlIjoiYXJuOmF3czpzbnM6dXMtd2VzdC0yOjExMzE5NjIxNjU1ODplbmRwb2ludC9HQ00vdVBvcnQvYTk5ZGFhYjgtMGU1Yy0zNWE0LTk5NzItODZlYjQyNzhjYTQyIiwiZXhwIjoxNTExMzAwMjQ0fQ.6_88lM-D0wc5NoD6QFmnoydj_30HHGWEtPNVhGJiC3EemRl_8w2DfA1ilwN-lxtk3aqyf4Kcfo5AyKbEBXYMtQ')
      .send({"message": message})
      .end(function (err, res) {
        err.should.not.be.null;
        res.should.have.status(500);
        done();
      });
  });

  it('should not insert registry due to message length ', function(done) {
    let message = "uport.me:" + Array(1000).join('asdf');
    chai.request(app)
      .post('/api/v1/sns')
      .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIyb2pRSmZmYlAyck03cG5rOEdocng1Y2NzUTZrdXJVaThwQiIsImlhdCI6MTUxMDc1MzU0NSwiYXVkIjoiMm9lWHVmSEdEcFU1MWJmS0JzWkRkdTdKZTl3ZUozcjdzVkciLCJ0eXBlIjoibm90aWZpY2F0aW9ucyIsInZhbHVlIjoiYXJuOmF3czpzbnM6dXMtd2VzdC0yOjExMzE5NjIxNjU1ODplbmRwb2ludC9HQ00vdVBvcnQvYTk5ZGFhYjgtMGU1Yy0zNWE0LTk5NzItODZlYjQyNzhjYTQyIiwiZXhwIjoxNTExMzU4MzQ1fQ.UrCbf7Ccomi8EaySC-4smyMB71fUGgD2xqRfhwfPQTFUa2809wkgK640OjoszbDTMnQx8m7KSubCMmb7f1R3xA')
      .send({"message": message})
      .end(function (err, res) {
          res.should.have.status(500);
          done();
      });
    });

    it('should insert registry without problems ', function(done) {
      let message = "uport.me:" + Array(100).join('asdf');
      chai.request(app)
        .post('/api/v1/sns')
        .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIyb2pRSmZmYlAyck03cG5rOEdocng1Y2NzUTZrdXJVaThwQiIsImlhdCI6MTUxMDc1MzU0NSwiYXVkIjoiMm9lWHVmSEdEcFU1MWJmS0JzWkRkdTdKZTl3ZUozcjdzVkciLCJ0eXBlIjoibm90aWZpY2F0aW9ucyIsInZhbHVlIjoiYXJuOmF3czpzbnM6dXMtd2VzdC0yOjExMzE5NjIxNjU1ODplbmRwb2ludC9HQ00vdVBvcnQvYTk5ZGFhYjgtMGU1Yy0zNWE0LTk5NzItODZlYjQyNzhjYTQyIiwiZXhwIjoxNTExMzU4MzQ1fQ.UrCbf7Ccomi8EaySC-4smyMB71fUGgD2xqRfhwfPQTFUa2809wkgK640OjoszbDTMnQx8m7KSubCMmb7f1R3xA')
        .send({"message": message})
        .end(function (err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          done();
        });
      });
})
