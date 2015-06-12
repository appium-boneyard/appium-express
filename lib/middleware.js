import log from './logger';

function allowCrossDomain (req, res, next) {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS,DELETE');
    res.header('Access-Control-Allow-Headers', 'origin, content-type, accept');

    // need to respond 200 to OPTIONS

    if ('OPTIONS' === req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  } catch (err) {
    log.error(`Unexpected error: ${err.stack}`);
    next();
  }
}

function fixPythonContentType (req, res, next) {
  // hack because python client library sux and give us wrong content-type
  if (/^\/wd/.test(req.path) && /^Python/.test(req.headers['user-agent'])) {
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      req.headers['content-type'] = 'application/json';
    }
  }

  next();
}

function catchAllHandler (e, req, res, next) {
  try {
    res.status(500).send(`Unknown server error! ${e.stack}`);
    log.error(e);
  } catch (e) {}
  next(e);
}

export { allowCrossDomain, fixPythonContentType, catchAllHandler };
