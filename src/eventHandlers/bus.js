/**
 * inter service event bus handler
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module vault/busHanlder
 */
const { DEPLOY_REGION, SERVICE_QUEUE } = process.env;
const logger = require("log-winston-aws-level");
const AWSXRay = require("aws-xray-sdk-core");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));
AWS.config.update({ region: DEPLOY_REGION });

import { kinesisStreamEventPromisifier } from "../lib/awsHelpers/kinesis.helper.library";
import { queuePush } from "../lib/awsHelpers/queue.helper.library";

import { service_global_metadata } from "../schema/serviceGlobalMetadata"
const { INTERESTING_GLOBAL_EVENTS } = service_global_metadata;

const queue = new AWS.SQS();

export const busEventHandler = async ( event ) => {
  const busEvents = [ ...event.Records ];
  try {
    const workerResponse = await processBusEvents( busEvents, queue );
  } catch( err ) {
    logger.error( "error in busEventHandler : ", err );
    throw err;
  }
}; // end busEventHandler

export const processBusEvents = async (busEvents, queue ) => {
  return kinesisStreamEventPromisifier( busEvents, processBusEvent, queue )
}; // end processBusEvents

const processBusEvent = async ( event, queue ) => {
  switch( event.data.type ) {
    case INTERESTING_GLOBAL_EVENTS.FAKE_GLOBAL_EVENT:
      return await defaultPushToQueue( event, queue );
      //TODO : insert handling for other events here, most can use default push to queue
    default:
      logger.info( `uninteresting event of type ${ event.data.type  } ignored` );
  }
};

const defaultPushToQueue = async ( event, queue ) => {
  try{
    const queueResponse = await queuePush({ ...event.data.item }, event.data.type, SERVICE_QUEUE, queue );
    logger.info( "success response putting request on queue : ", queueResponse );
  } catch ( err ) {
    logger.error( "error processing vault session request down to queue : ", err );
    throw err;
  }
}; // end defaultPushToQueue