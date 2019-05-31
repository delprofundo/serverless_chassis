/**
 * CUSTOM AUTHORIZER
 * 01 Jun 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module sec/authorize
 */
const DEPLOY_REGION = process.env.DEPLOY_REGION;
const MAX_TOKEN_EXPIRY_PATH = process.env.MAX_TOKEN_EXPIRY_PATH;
const USER_POOL_ID_PATH = process.env.COGNITO_USER_POOL_ID_PATH;
const SYSTEM_MEMBER_ID_PATH = process.env.SYSTEM_MEMBER_ID_PATH;
const JWA_PEM_PATH = process.env.JWA_PEM_PATH;
const logger = require("log-winston-aws-level");
const moment = require( "moment" );
const permissionsMatrix = require( "./permissionsMatrix" );
const { decryptJWE } = require( "jwe-handler" );
import { getSecretValue, getValue } from "../lib/awsHelpers/general.helper.library";

const AWS = require( "aws-sdk");
AWS.config.update({ region: DEPLOY_REGION });
const ssm = new AWS.SSM({apiVersion: "2014-11-06"});

export const handler = async ( event, context ) => {
  const authParams = await getAuthenticationParameters({
    max: MAX_TOKEN_EXPIRY_PATH,
    systemMemberId: SYSTEM_MEMBER_ID_PATH,
    /*userPoolId: USER_POOL_ID_PATH,*/
    jwaPem: JWA_PEM_PATH
  });
  const sourceClass = event.headers[ 'x-auth-class' ];
  switch( sourceClass ) {
    case "CONSOLE":
      console.log("CONSOLE AUTH NOT SUPPORTED" );
      authParams.iss = `https://cognito-idp.${ region }.amazonaws.com/${ authParams.userPoolId }`;
      //return authenticateConsoleUser( authParams, event, context );
      context.fail( "Unauthorized" );
    case "INTEGRATION":
      console.log( "INTEGRATION" );
      return authenticateIntegratedUser( authParams, event, context );
    default:
      console.log( "default" );
      return authenticateIntegratedUser( authParams, event, context );
  }
}; // end handler

/**
 * queries local system for AAA details.
 * @param authParams
 * @param event
 * @param context
 * @returns {Promise<void>}
 */
async function authenticateIntegratedUser( authParams, event, context ) {
  logger.info( 'inside authenticateIntegratedUser', authParams, event );
  const { jwaPem } = authParams;
  const clientToken = event.headers[ "Authorization" ];
  let localClientRecord;
  let resultEffect;
  try {
    localClientRecord = await decryptJWE( clientToken, jwaPem );
  } catch( err ) {
    console.log( "error trying the decrypt : ", err );
    context.fail( "Unauthorized" );
  }
  if( hasTokenExpired( localClientRecord.expiry ) === true ) {
    logger.info( "token has expired, auth failed" );
    context.fail( "Unauthorized" );
  }
  let permissionCheckParams = {
    path: extractBasePath(event.path),
    resource: event.resource,
    method: event.httpMethod,
    memberRole: localClientRecord.role
  };
  try {
    resultEffect = await permissionsMatrix.validateAccess( permissionCheckParams );
    return await buildIamPolicy({
      memberId: localClientRecord.memberId,
      effect: resultEffect.effect,
      resource: event.methodArn,
      context: localClientRecord
    })
  } catch( err ) {
    logger.error( "error building IAM policy", err );
    context.fail( "Unauthorized" );
  }
} // end authenticateIntegratedUser

/**
 * getAuthenticationParameters will pull all the needed security parameters from ssm
 * @param max
 * @param systemMemberId
 * @param jwaPem
 * @returns {Promise<{maxTokenExpiry: ((D & {$response: Response<D, E>})|never), jwaPem: ((D & {$response: Response<D, E>})|never)}>}
 */
const  getAuthenticationParameters = async ({ max, systemMemberId, jwaPem }) => {
  const resultArr = await Promise.all([
    await getSecretValue( jwaPem, ssm ),
    await getValue( max, ssm ),
    await getSecretValue( systemMemberId, ssm )
  ]);
  return {
    jwaPem: resultArr[ 0 ],
    maxTokenExpiry: resultArr[ 1 ],
    systemMemberId: resultArr[ 2 ]
  }
}; // end getAuthenticationParametersNew

/**
 * function returns bool stating if the unix time passed in is either
 * in the past or beyond what is acceptable for age.
 * @param tokenExpiryUnixTime
 * @returns {boolean}
 */
function hasTokenExpired( tokenExpiryUnixTime ) {
  return moment().unix() >= tokenExpiryUnixTime;
} // end hasTokenExpired

/**
 *  Function that creates an API Gateway policy document from validated input
 * @param memberId
 * @param effect
 * @param resource
 * @param context
 * @returns {Error|{policyDocument: {Version: string, Statement: {Action: string[], Resource: *[], Effect: *}[]}, context: *, principalId: *}}
 */
export function buildIamPolicy({ memberId, effect, resource, context }) {
  //test all input is valid and reject if not
  if(typeof memberId === "undefined" || memberId === null ) {
    return new Error( "memberId required to identify user or client" );
  }
  if(typeof effect === "undefined" || effect === null ) {
    return new Error( "invalid effect field" );
  }
  if(typeof resource === "undefined" || resource === null ) {
    return new Error( "invalid resource field" );
  }
  //assemble IAM policy document to return
  return {
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
} // end buildIamPolicy

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