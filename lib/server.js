import path from 'path';
import express from 'express';
import http from 'http';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import { startLogFormatter, endLogFormatter } from './express-logging';
import { allowCrossDomain, fixPythonContentType, catchAllHandler } from './middleware';

const STATIC_DIR = path.resolve(__dirname, '..', '..', 'static');

function appiumServer (middleware) {
  let app = express();
  let server = http.createServer(app);

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
  app.use(middleware);
  app.use(catchAllHandler);

  return server;
}

export { appiumServer };
