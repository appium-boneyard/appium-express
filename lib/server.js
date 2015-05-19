import B from 'bluebird';
import path from 'path';
import express from 'express';
import http from 'http';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import { startLogFormatter, endLogFormatter } from './express-logging';
import { allowCrossDomain, fixPythonContentType, catchAllHandler } from './middleware';

const STATIC_DIR = path.resolve(__dirname, '..', '..', 'static');

async function appiumServer (configureRoutes, port, hostname = 'localhost') {
  let app = express();
  let server = http.createServer(app);

  configureServer(app, configureRoutes);

  await B.promisify(server.listen.bind(server))(port, hostname);
  return server;
}

function configureServer (app, configureRoutes) {
  app.use(endLogFormatter);
  app.use(favicon(path.resolve(STATIC_DIR, 'favicon.ico')));
  app.use(express.static(STATIC_DIR));
  app.use(allowCrossDomain);
  app.use(fixPythonContentType);
  app.use(bodyParser.urlencoded({extended: true}));
  // make sure appium never fails because of a file size upload limit
  app.use(bodyParser.json({limit: '1gb'}));
  app.use(startLogFormatter);
  app.use(methodOverride());
  configureRoutes(app);
  app.use(catchAllHandler);
}

export { appiumServer, configureServer };
