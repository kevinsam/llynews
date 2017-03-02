const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const chalk = require('chalk');
const authHelper = require('./auth-helper');
const path = require('path');
const _ = require('lodash');

const print = (string) => {
  if (process.env.DISABLE_AUTH_LOGS !== 'true') {
    console.log(`${chalk.bgWhite.bold('[AUTH]')} : ${string}`);
  }
};

if (process.env.AUTH_REQUIRED === 'false') {
  print(
    chalk.bgYellow('Authentication is off. To enable set AUTH_REQUIRED to true in .env')
  );
}

if (process.env.DISABLE_AUTH_LOGS === 'true') {
  console.log(`${chalk.bgWhite.bold('[AUTH]')} : Logs are disabled.`);
}

const requiredEnvVars = [
  'OPENID_RESP_TYPE',
  'OPENID_SERV',
  'OPENID_SCOPE',
  'OPENID_JWKS_URI',
  'OPENID_NONCE',
  'OPENID_CLIENT_ID',
  'AUTH_REQUIRED',
  'COOKIE_SECRET',
  'CALLBACK',
];

// check user has set up environment variables
if (!(_.every(requiredEnvVars, _.partial(_.has, process.env)))) {
  print(
    chalk.bgRed(
      'Environment variables are missing! Please check your .env against the readme.'
    ));
  print(chalk.bgYellow('Auth has been disabled.'));
  process.env.AUTH_REQUIRED = 'false';
}

  // middleware that will authenticate the router
const authMiddleware = (req, res, next) => {
    // Function for getting the enviroment of the user - Production or Development.
    // if we're already authenticated
  if (process.env.AUTH_REQUIRED === 'false') {
      // pass through to next request
    print(chalk.bgCyan(`Serving ${req.originalUrl} without authenticating user.`));
    next();
  } else if (req.signedCookies.id_token) {
      // check if the client sent an id token
    print(chalk.bgCyan("Verifying user's token..."));
      // attempt to verify the token
    authHelper.verify(req.signedCookies.id_token)
      .then((verified) => {
        // if the token is verified successfully
        if (verified) {
          print(chalk.bgGreen('User successfully verified.'));
          print(chalk.bgGreen(`Access to ${req.originalUrl} granted!`));
          // honour the original request
          next();
        } else {
          print(chalk.bgYellow('User\'s token is unverified!'));
          authHelper.redirectToAuth(req, res);
        }
      });
  } else {
    print(chalk.bgYellow('Redirecting user to authenticate...'));
    authHelper.redirectToAuth(req, res);
  }
};

const authenticate = (router) => {
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({
    extended: true,
  }));
  router.use(cookieParser(process.env.COOKIE_SECRET));
    // this endpoint is called upon initiating access as a callback url from ping
    // user isn't authenticated quite yet

  router.get('/auth/ping/callback', (req, res) => {
      // render auth page
      // which is a fix for extracting # params from the url (contain's our token)

    res.sendFile(path.join(`${__dirname}/authClientSide.html`));
  });

  router.post('/auth/token', (req, res) => {
      // this POST is sent from the auth page we rendered in /auth/ping/callback
      // set a cookie on the client
      // we sign the cookie so we know this server gave out the cookie when verifying later
      // (prevents malicious editing on the client side)
    res.cookie(
        'id_token', req.body.id_token,
      {
        expires: new Date(Date.now() + (60 * 60 * 1000)),
        httpOnly: true,
        signed: true,
      }
      );
    res.end();
  });

  router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    return res.render('logout');
  });

    // use our auth middleware AFTER authentication flow routes
    // so unauthenticated users can access auth flow
  router.use(authMiddleware);
};

  // module constructor
module.exports = {
  authenticate,
};
