// transpile:mocha

import { server } from '../..';
import { configureServer } from '../lib/server';
import request from 'request-promise';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import 'mochawait';

const should = chai.should();
chai.use(chaiAsPromised);

describe('server configuration', () => {
  it('should actually use the middleware', () => {
    let app = {use: sinon.spy(), all: sinon.spy()};
    let configureRoutes = () => {};
    configureServer(app, configureRoutes);
    app.use.callCount.should.equal(10);
    app.all.callCount.should.equal(2);
  });

  it('should reject if error thrown in configureRoutes parameter', async () => {
    let configureRoutes = () => {
      throw new Error("I'm Mr. MeeSeeks look at me!");
    };
    await server(configureRoutes, 8181).should.eventually.be
           .rejectedWith("MeeSeeks");
  });
});
describe('server', () => {
  let hwServer;
  before(async () => {
    function configureRoutes (app) {
      app.get('/', (req, res) => {
        res.header['content-type'] = 'text/html';
        res.status(200).send("Hello World!");
      });
      app.get('/wd/hub/pythonsucks', (req, res) => {
        res.status(200).send(req.headers['content-type']);
      });
      app.get('/error', () => {
        throw new Error("hahaha");
      });
    }
    hwServer = await server(configureRoutes, 8181);
  });
  it('should start up with our middleware', async () => {
    let body = await request("http://localhost:8181/");
    body.should.eql("Hello World!");
  });
  it('should start up with our middleware', async () => {
    let body = await request({
      url: "http://localhost:8181/wd/hub/pythonsucks",
      headers: {
        "user-agent": "Python",
        "content-type": "application/x-www-form-urlencoded"
      }
    });
    body.should.eql("application/json");
  });
  it('should catch errors in the catchall', async () => {
    let err;
    try {
      await request("http://localhost:8181/error");
    } catch (e) {
      err = e;
    }
    should.exist(err);
    err.message.should.contain("hahaha");
  });
  it('should error if we try to start again on a port that is used', async () => {
    await server(() => {}, 8181).should.eventually.be.rejectedWith(/EADDRINUSE/);
  });
  it('should error if we try to start on a bad hostname', async () => {
    await server(() => {}, 8181, 'lolcathost').should.eventually.be.rejectedWith(/ENOTFOUND/);
    await server(() => {}, 8181, '1.1.1.1').should.eventually.be.rejectedWith(/EADDRNOTAVAIL/);
  });
  after(async () => {
    hwServer.close();
  });
});
