/********************************************
 * Basic JWT signer for internal service calls between services
 * 29 May 2019
 * delProfundo (@brunowatt)
 * bruno@hypermedia.tech
 ********************************************/
const logger = require("log-winston-aws-level");
const moment = require( "moment" );
const { createJWE } = require( "jwe-handler" );
import { getSecretValue, getValue } from "../lib/awsHelpers/general.helper.library";
const DEPLOY_REGION = process.env.DEPLOY_REGION;
const SYSTEM_MEMBER_ID_PATH = process.env.SYSTEM_MEMBER_ID_PATH;
const JWA_PEM_PATH = process.env.JWA_PEM_PATH;
const MAX_TOKEN_EXPIRY_PATH = process.env.MAX_TOKEN_EXPIRY_PATH;
const AWS = require( "aws-sdk");
AWS.config.update({ region: DEPLOY_REGION });
const ssm = new AWS.SSM({apiVersion: "2014-11-06"});

export const handler = async ( event ) => {

  let itemToEncrypt;
  let generatedJwe;
  let authParams;

  try {
    authParams = await getAuthenticationParameters({
      max: MAX_TOKEN_EXPIRY_PATH,
      systemMemberId: SYSTEM_MEMBER_ID_PATH,
      jwaPem: JWA_PEM_PATH
    });
  } catch( err ) {
    throw err;
  }

  const { maxTokenExpiry, jwaPem, systemMemberId } = authParams;
  itemToEncrypt = {
    memberId: systemMemberId,
    role: "SYSTEM",
    expiry: moment().add( maxTokenExpiry, "minutes" ).unix()
  };

  try {
    generatedJwe = await createJWE( itemToEncrypt, jwaPem );
  } catch( err ) {
    logger.error( "error in generate JWE try block : ", err );
    throw err;
  }
  return generatedJwe;
}; // end handler

/**
 * getAuthenticationParameters will pull all the needed security parameters from ssm
 * @param max
 * @param systemMemberId
 * @param jwaPem
 * @returns {Promise<{maxTokenExpiry: (PromiseResult<D, E>|never), systemMemberId: (PromiseResult<D, E>|never), jwaPem: (PromiseResult<D, E>|never)}>}
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