/********************************************
 * BASIC SERVICE CUSTOM AUTHORIZOR
 * varation of two more basic tools published by aws
 * 23 Dec 2017
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 ********************************************/
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_REGION = process.env.COGNITO_REGION;
const logger = require( "log-winston-aws-level" );
const request = require("request");
const jwkToPem = require("jwk-to-pem");
const jwt = require( "jsonwebtoken" );
const policyGenerator = require( "./policyGenerator.js" );
const permissionsMatrix = require( "./servicePermissionsMatrix" );

const tokenIssuer = "https://cognito-idp." + COGNITO_REGION + ".amazonaws.com/" + COGNITO_USER_POOL_ID;
let pems; // this will hold the key required to decode the JTW

/**
 * basic initial auth routine. simply decodes the token
 * and confirms the users role exists in the types array.
 * @param event
 * @param context
 * @param callback
 * @returns {Promise<void>}
 */
exports.handler = function( event, context, callback ) {
  if (!pems) {
    try {
      const tokenPath = `${ tokenIssuer }/.well-known/jwks.json`;
      request.get({
        url: tokenPath,
        json: true
      }, function ( err, response, body ) {
        if ( !err && response.statusCode === 200 ) {
          pems = {};
          let keys = body[ "keys" ];
          for (let i = 0; i < keys.length; i++) {
            //Convert each key to PEM
            let key_id = keys[ i ].kid;
            let modulus = keys[ i ].n;
            let exponent = keys[ i ].e;
            let key_type = keys[ i ].kty;
            let jwk = { kty: key_type, n: modulus, e: exponent };
            pems[ key_id ] = jwkToPem( jwk );
          }
          //Now continue with validating the token
          validateToken( pems, event, context )
            .then( policy => {
              logger.info( "returning this policy : ", policy );
              callback( null, policy );
            })
            .catch( err => {
              logger.error( "error creating policy : ", err.message );
              callback( context.fail( "Unauthorized" ));
            });
        } else {
          //Unable to download JWKs, fail the call
          logger.error( "failing cause its an error", err );
          callback( context.fail( "error" ));
        }
      });
    } catch ( err ) {
      logger.error( "error in create pem path : ", err );
      callback( context.fail( "Unauthorized" ));
    }
  } else {
    // validate
    try {
      console.log( "in else try" );
      //Now continue with validating the token
      validateToken( pems, event, context )
        .then( policy => {
          console.log( "returning this policy : ", policy );
          callback( null, policy );
        })
        .catch( err => {
          logger.error( "error creating policy : ", err.message );
          callback( context.fail( "Unauthorized" ));
        });
    } catch ( err ) {
      logger.error( "error in existing pem path : ", err );
      callback( context.fail( "Unauthorized" ));
    }
  }
}; // end authorisation handler

/**
 * takes the extracted pems and the event stuff
 * to validate and return the policy
 * @param pems
 * @param event
 * @param context
 * @returns {Promise<any>}
 */
function validateToken( pems, event, context ) {
  return new Promise(( resolve, reject ) => {
    try {
      const incomingToken = event.headers.Authorization;
      const decodedToken = jwt.decode( incomingToken, { complete: true });
      logger.info( "decoded token : ", JSON.stringify( decodedToken ));
      //TODO: THINK ABOUT THIS
      const tokenContext = decodedToken.tokenContext;
      if (!decodedToken) {
        logger.error("Not a valid JWT token");
        context.fail("Unauthorized");
        reject();
      }
      //Fail if token is not from your UserPool
      if (decodedToken.payload.iss !== tokenIssuer) {
        logger.error("invalid issuer");
        context.fail("Unauthorized");
        reject();
      }
      //Reject the jwt if it"s not an "Access Token"
      if (decodedToken.payload.token_use !== "access") {
        logger.error("Not an access token");
        context.fail("Unauthorized");
        reject();
      }
      //Get the kid from the token and retrieve corresponding PEM
      let kid = decodedToken.header.kid;
      let pem = pems[kid];
      if (!pem) {
        logger.error("Invalid access token");
        context.fail("Unauthorized");
        reject();
      }
      //now verify that its from where its supposed to be and then we can think about assembly
      jwt.verify( incomingToken, pem, { issuer: tokenIssuer }, ( err, payload ) => {
        if( err ) {
          logger.error( "token failed verification : ", err );
          context.fail( "Unauthorized" );
        } else {
          // put together parameters to check permissions with
          let permissionsCheckParams = {
            path: extractBasePath( event.path ),
            resource: event.resource,
            method: event.httpMethod,
            userType: decodedToken.payload[ "cognito:groups" ][ 0 ].toUpperCase() // TODO : check that this really works, that the first in the array has lowest priority always
          };
          //determine permission value bool
          const isAllowed = permissionsMatrix( permissionsCheckParams );

          logger.info( "outcome of some on role arr : ", isAllowed );
          const effect = isAllowed ? "Allow" : "Deny";
          const userId = decodedToken.payload.sub;
          const authorizerContext = {}; //solve context
          const policyDocument = policyGenerator( userId, effect, event.methodArn, authorizerContext );

          logger.info( "returning IAM policy document : ", policyDocument );
          resolve( policyDocument );
        }
      });
    } catch ( err ) {
      logger.error( "err from IAM policy generation", err );
      reject( err );
    }
  });
}

/**
 * takes a path from an APIG event record and
 * returns the base path.
 * @param path
 * @returns {string}
 */
function extractBasePath( path ) {
  //break up the path at the back slashes
  const pathSegments = path.split( "/" ).slice( 1 );
  return `/${ pathSegments[ 0 ]}`;
}