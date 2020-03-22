/********************************************
 * utility library
 * 1 April 2017
 * delProfundo (@brunowatt)
 * bruno@hypermedia.tech
 ********************************************/
const {
  SERVICE_QUEUE,
  SERVICE_TABLE,
  DEPLOY_REGION
} = process.env;

const logger = require("log-winston-aws-level");
const AWSXRay = require("aws-xray-sdk-core");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));
AWS.config.update({ region: DEPLOY_REGION });
const db = new AWS.DynamoDB.DocumentClient();
const queue = new AWS.SQS();

/**
 * simple ping endpoint
 * @returns {Promise<{message: string}>}
 */
export const ping = async () => {
  return { message: "PONG" };
}; //end ping

/**
 * simple echo endpoint
 * @param messageObject
 * @returns {Promise<any>}
 */
export const echo = async ( messageObject ) => {
  try {
    return JSON.parse( messageObject );
  } catch( err ) {
    throw err;
  }
}; // end echo