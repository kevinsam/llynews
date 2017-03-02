const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const atob = require('atob');

const verify = (idToken) => {
  return new Promise((resolve) => {
    // fetch our JWKS config to convert to public key
    fetch(process.env.OPENID_JWKS_URI, {
      method: 'GET',
      body: 'a=1',
    })
    .then((resp) => {
      return resp.json();
    }).then((json) => {
      // decode our token to extract the kid to match the signature key
      const decoded = JSON.parse(atob(idToken.split('.')[0]));
      // check the response from JWKS config url,
      // attempt to match the kid from the token to a signature
      json.keys.forEach((key) => {
        // if this signature key's kid matches our decoded token's kid
        if (key.kid === decoded.kid) {
          // convert the JWKS signature key to a pem
          const pem = jwkToPem(key);

          // verify the token signature with the signature we matched from JWKS
          jwt.verify(idToken, pem, {
            algorithms: 'RS256',
          },
          (err, result) => {
            // if there's a result from verification...
            if (
                result &&
                // Check that all the JWT verified info matches our configurated info
                (result.nonce === process.env.OPENID_NONCE) &&
                (result.aud === process.env.OPENID_CLIENT_ID) &&
                (result.iss === process.env.OPENID_SERV)
              ) {
                // if everything matches, authenticate the user
              resolve(true);
            } else {
              resolve(false);
            }
          });
        }
      });
    }).catch((err) => {
      console.log(err);
    });
  });
};

const getAuthCallbackURL = (req) => {
  return new Promise((resolve, reject) => {
    let callbackURL;
    if (process.env.NODE_ENV === 'production') {
      callbackURL = `${req.get('X-Forwarded-Proto')}://${req.get('host')}${process.env.CALLBACK}`;
      resolve(callbackURL);
    } else if (process.env.NODE_ENV === 'development') {
      callbackURL = `${req.protocol}://${req.get('host')}${process.env.CALLBACK}`;
      resolve(callbackURL);
    } else {
      reject(callbackURL);
    }
  });
};

const redirectToAuth = (req, res) => {
  getAuthCallbackURL(req).then((callback) => {
    // attempt to authenticate the user by using OpenID flow
    res.redirect(
      `${process.env.OPENID_SERV}/as/authorization.oauth2` +
      `?scope=${process.env.OPENID_SCOPE}` +
      `&client_id=${process.env.OPENID_CLIENT_ID}` +
      `&response_type=${process.env.OPENID_RESP_TYPE}` +
      `&nonce=${process.env.OPENID_NONCE}` +
      `&state=${encodeURIComponent(req.originalUrl)}` +
      `&redirect_uri=${encodeURIComponent(callback)}`
    );
  }).catch((e) => {
    res.status(500, {
      error: e,
    });
  });
};

module.exports = {
  redirectToAuth,
  verify,
};
