import path from 'path';
import log from './logger';
import swig from 'swig';


const STATIC_DIR = path.resolve(__dirname, '..', '..', 'static');

/*
 * Dynamic page mapped to /test/guinea-pig
 */
function guineaPig (req, res) {
  let delay = req.params.delay ? parseInt(req.params.delay, 10) : 0;
  let params = {
    serverTime: parseInt(Date.now() / 1000, 10),
    userAgent: req.headers['user-agent'],
    comment: 'None'
  };
  if (req.method === 'POST') {
    params.comment = req.body.comments || params.comment;
  }
  log.debug(`Sending guinea pig response with params: ${JSON.stringify(params)}`);
  setTimeout(() => {
    res.set('Content-Type', 'text/html');
    res.cookie('guineacookie1', 'i am a cookie value', {path: '/'});
    res.cookie('guineacookie2', 'cookié2', {path: '/'});
    res.cookie('guineacookie3', 'cant access this', {
      domain: '.blargimarg.com',
      path: '/'
    });
    res.send(getTemplate('guinea-pig.html')(params));
  }, delay);
}

/*
 * Dynamic page mapped to /welcome
 */
function welcome (req, res) {
  let params = {message: 'Let\'s browse!'};
  log.debug(`Sending welcome response with params: ${JSON.stringify(params)}`);
  res.send(getTemplate('welcome.html')(params));
}

function getTemplate (templateName) {
  return swig.compileFile(path.resolve(STATIC_DIR, 'test', templateName));
}

export { guineaPig, welcome, STATIC_DIR };
