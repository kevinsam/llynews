'use strict';

var fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');
var atob = require('atob');

var verify = function verify(idToken) {
  return new Promise(function (resolve) {
    // fetch our JWKS config to convert to public key
    fetch(process.env.OPENID_JWKS_URI, {
      method: 'GET',
      body: 'a=1'
    }).then(function (resp) {
      return resp.json();
    }).then(function (json) {
      // decode our token to extract the kid to match the signature key
      var decoded = JSON.parse(atob(idToken.split('.')[0]));
      // check the response from JWKS config url,
      // attempt to match the kid from the token to a signature
      json.keys.forEach(function (key) {
        // if this signature key's kid matches our decoded token's kid
        if (key.kid === decoded.kid) {
          // convert the JWKS signature key to a pem
          var pem = jwkToPem(key);

          // verify the token signature with the signature we matched from JWKS
          jwt.verify(idToken, pem, {
            algorithms: 'RS256'
          }, function (err, result) {
            // if there's a result from verification...
            if (result &&
            // Check that all the JWT verified info matches our configurated info
            result.nonce === process.env.OPENID_NONCE && result.aud === process.env.OPENID_CLIENT_ID && result.iss === process.env.OPENID_SERV) {
              // if everything matches, authenticate the user
              resolve(true);
            } else {
              resolve(false);
            }
          });
        }
      });
    }).catch(function (err) {
      console.log(err);
    });
  });
};

var getAuthCallbackURL = function getAuthCallbackURL(req) {
  return new Promise(function (resolve, reject) {
    var callbackURL = void 0;
    if (process.env.NODE_ENV === 'production') {
      callbackURL = req.get('X-Forwarded-Proto') + '://' + req.get('host') + process.env.CALLBACK;
      resolve(callbackURL);
    } else if (process.env.NODE_ENV === 'development') {
      callbackURL = req.protocol + '://' + req.get('host') + process.env.CALLBACK;
      resolve(callbackURL);
    } else {
      reject(callbackURL);
    }
  });
};

var redirectToAuth = function redirectToAuth(req, res) {
  getAuthCallbackURL(req).then(function (callback) {
    // attempt to authenticate the user by using OpenID flow
    res.redirect(process.env.OPENID_SERV + '/as/authorization.oauth2' + ('?scope=' + process.env.OPENID_SCOPE) + ('&client_id=' + process.env.OPENID_CLIENT_ID) + ('&response_type=' + process.env.OPENID_RESP_TYPE) + ('&nonce=' + process.env.OPENID_NONCE) + ('&state=' + encodeURIComponent(req.originalUrl)) + ('&redirect_uri=' + encodeURIComponent(callback)));
  }).catch(function (e) {
    res.status(500, {
      error: e
    });
  });
};

module.exports = {
  redirectToAuth: redirectToAuth,
  verify: verify
};