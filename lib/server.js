import path from 'path';
import express from 'express';
import http from 'http';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import { default as log } from 'appium-logger';
import { startLogFormatter, endLogFormatter } from './express-logging';
import { allowCrossDomain, fixPythonContentType, catchAllHandler } from './middleware';

const STATIC_DIR = path.resolve(__dirname, '..', '..', 'static');

function appiumServer (configureRoutes, port, hostname = 'localhost') {
  let app = express();
  let server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      if (err.code === 'EADDRNOTAVAIL') {
        log.error("Couldn't start REST http interface listener. " +
                  "Requested address is not available.");
      } else {
        log.error("Couldn't start REST http interface listener. The requested " +
                  "port may already be in use. Please make sure there's no " +
                  "other instance of this server running already.");
      }
      reject(err);
    });
    server.on('connection', (socket) => {
      socket.setTimeout(600 * 1000); // 10 minute timeout
    });
    configureServer(app, configureRoutes);
    server.listen(port, hostname, (err) => {
      if (err) {
        reject(err);
      }
      resolve(server);
    });
  });
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
