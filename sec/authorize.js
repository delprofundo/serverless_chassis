/**
 * CUSTOM AUTHORIZER
 * 11 Jan 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module sec/authorize
 */
const logger = require("log-winston-aws-level");
const moment = require( "moment" );
import { unstring } from "../lib/awsHelpers/general.helper.library";
const jose  = require( "node-jose" );
const permissionsMatrix = require( "./permissionsMatrix" );
const JWA_KEY = process.env.JWA_KEY;
const MAX_TOKEN_EXPIRY = process.env.MAX_TOKEN_EXPIRY;

export const handler = ( event, context, callback ) => {
  console.log(moment().add( MAX_TOKEN_EXPIRY, "minutes" ).unix());
  console.log( MAX_TOKEN_EXPIRY );
  let localKeystore = jose.JWK.createKeyStore();
  let localClientRecord;
  // 1. use the X-Auth-Class-Id header to look up client record
  localKeystore.add( JWA_KEY )
    .then(() => {
      decryptClientJWE(event.headers["Authorization"], localKeystore)
        .then(decryptedPayload => {
          console.log("DECRYPTED : ", decryptedPayload);
          localClientRecord = unstring( decryptedPayload );

          if( hasTokenExpired( localClientRecord.expiry ) === true ) {
            logger.info( "token has expired, auth failed" );
            callback( context.fail( "Unauthorized" ));
          }

          let permissionCheckParams = {
            path: extractBasePath(event.path),
            resource: event.resource,
            method: event.httpMethod,
            memberRole: localClientRecord.role
          };
          console.log("permCheckParams: ", permissionCheckParams);

          return permissionsMatrix.validateAccess(permissionCheckParams);
        })
        .then(resultEffect => {
          console.log("success from perm validate access");
          return buildIamPolicy({
            memberId: localClientRecord.memberId,
            effect: resultEffect.effect,
            resource: event.methodArn,
            context: localClientRecord
          });
        })
        .then(policyDocument => {
          callback(null, policyDocument);
        })
        .catch(err => {
          console.log( "err in authorizer : ", err  );
          callback( context.fail( "Unauthorized" ));
        });
    });
};

/**
 * function returns bool stating if the unix time passed in is either
 * in the past or beyond what is acceptable for age.
 * @param tokenExpiryUnixTime
 * @returns {boolean}
 */
function hasTokenExpired( tokenExpiryUnixTime ) {
  logger.info( "passed in epoch time", tokenExpiryUnixTime );
  if( moment().unix() >= tokenExpiryUnixTime ) {
    logger.info( "now is greater than the token expiry" );
    return true;
  } else {
    console.log( tokenExpiryUnixTime >= moment().add( MAX_TOKEN_EXPIRY, "minutes" ).unix());
    return tokenExpiryUnixTime >= moment().add( MAX_TOKEN_EXPIRY, "minutes" ).unix();
  }
} // end hasTokenExpired

function decryptClientJWE( jwe, keystore ) {
  return new Promise(( resolve, reject ) => {
    jose.JWE.createDecrypt( keystore )
      .decrypt( jwe )
      .then( decryptedJWE => {
        console.log( "decrypt success" );
        resolve( JSON.parse(decryptedJWE.payload.toString()));
      })
      .catch( err => {
        console.log( "failed decrypt", err );
        reject( err );
      });
  });
} // end decryptClientJWE

/**
 * Function that creates an API Gateway policy document from validated input
 * @param memberId
 * @param effect
 * @param resource
 * @param context
 * @returns {Promise<any>}
 */
function buildIamPolicy({ memberId, effect, resource, context }) {
  return new Promise(( resolve, reject ) => {
    //test all input is valid and reject if not
    if(typeof memberId === "undefined" || memberId === null ) {
      reject( new Error( "memberId required to identify user or client" ));
    }
    if(typeof effect === "undefined" || effect === null ) {
      reject( new Error( "invalid effect field" ));
    }
    if(typeof resource === "undefined" || resource === null ) {
      reject( new Error( "invalid resource field" ));
    }
    //assemble IAM policy document to return
    const policy = {
      principalId: memberId,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: effect,
            Action: [
              "execute-api:Invoke"
            ],
            Resource: [
              resource
            ]
          }
        ]
      },
      context
    };
    console.log( "generated policy document: ", JSON.stringify( policy ));
    resolve( policy );
  });
} // end buildIAMPolicy

/**
 * takes a path from an APIG event record and
 * returns the base path.
 * @param path
 * @returns {string}
 */

function extractBasePath( path ) {
  //break up the path at the back slashes
  const pathSegments = path.split("/").slice(1);
  return `/${pathSegments[ 0 ]}`;
} // extractBasePath
