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
    let app = {use: sinon.spy()};
    let configureRoutes = () => {};
    configureServer(app, configureRoutes);
    app.use.callCount.should.equal(10);
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
  after(async () => {
    hwServer.close();
  });
});
