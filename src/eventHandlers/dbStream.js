/**
 * db stream handler
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module vault/streamHandler
 */


const { DEPLOY_REGION, GLOBAL_SERVICE_BUS, SERVICE_TABLE } = process.env;
const logger = require("log-winston-aws-level");
const AWSXRay = require("aws-xray-sdk-core");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));
AWS.config.update({ region: DEPLOY_REGION });
const db = new AWS.DynamoDB.DocumentClient();
const stream = new AWS.Kinesis();

// TODO : Add schema details here, example:
import { service_global_metadata } from "../schema/serviceGlobalMetadata";
const { EVENT_TYPES, RECORD_TYPES } = service_global_metadata;

import { unstring } from "../lib/awsHelpers/general.helper.library";
import {deindexDynamoRecord, dynamoGet} from "../lib/awsHelpers/dynamoCRUD.helper.library";
import { generatePartitionKey, streamPublish } from "../lib/awsHelpers/kinesis.helper.library";
import { streamEventPromisifier } from "../lib/awsHelpers/dynamoStream.helper.library";

/**
 * changes to items in the service table spawn events.
 * this function captures those events and hands down to processors.
 * @param event
 * @returns {Promise<void>}
 */
export const tableStreamHandler = async ( event ) => {
  logger.info( "inside tableStreamHandler", event );
  const tableUpdateAssembly = {
    incomingRecords: [ ...unstring( event.Records )]
  };
  try {
    const workerResponse = await processTableStreamEvents( tableUpdateAssembly, stream );
    logger.info( "successfully processed stream events :", workerResponse );
  } catch ( err ) {
    logger.error( "error processing table stream event : ", err );
    throw err;
  }
}; // end tableStreamHandler

export const processTableStreamEvents = async ( tableUpdateAssembly ) => {
  return streamEventPromisifier( tableUpdateAssembly, processTableStreamEvent, stream )
}; // end processTableStreamEvents

const processTableStreamEvent = async ( record, stream ) => {
  logger.info( "inside processTableStreamEvent : ", record );
  switch( record.streamEventName ) {
    case "INSERT":
      return await processTableInsertEvent( record, stream );
    case "MODIFY":
    case "REMOVE":
    default:
      logger.info( `table event type ${ record.streamEventName } not handled : `, record );
  }
}; // end processTableStreamEvent

const processTableInsertEvent = async ( record ) => {
  const { newRec } = record;
  const { recordType, ...processRec } = deindexDynamoRecord( newRec );
  const calculatedEventType = calculateNewRecordEvent( recordType );
  logger.info( "calucated : ", calculatedEventType );
  let payloadRecord = {};
  switch( calculatedEventType ) {
    //TODO : handle SUBMITTED INSTRUMENT and SESSION REQUESTED (maybe)
    case EVENT_TYPES.FAKE_EVENT:
      const { cardholderName, encryptedCardData, ...recordToShare } = processRec;
      const dbResponse = await dynamoGet(
        recordToShare.instrumentId,
        RECORD_TYPES.FAKE_RECORD,
        SERVICE_TABLE, db
      );
      logger.info( "got the session : ", dbResponse );
      const sessionToken = dbResponse.Item.sessionToken;
      // TODO : SAGA HERE if no item begin te saga
      payloadRecord = { instrument: { ...recordToShare }, sessionToken };
      break;
    default:
      logger.info( `new record of type ${ recordType } not handled`);
      return;
  }
  try {
    const busResponse = await publishToBus( payloadRecord, calculatedEventType, stream );
    logger.info ( "bus response : ", busResponse );
  } catch( err ) {
    logger.error( "error pushing record to shared service bus", err );
    throw err;
  }
}; // end processTableInsertEvent

const publishToBus = async ( payload, eventType, stream ) => {
  const busResponse = await streamPublish(
    { ...payload },
    eventType,
    generatePartitionKey(),
    GLOBAL_SERVICE_BUS,
    stream );
}; // end publishToBus

const calculateNewRecordEvent = ( recordType ) => {
  if( recordType === RECORD_TYPES.FAKE_RECORD ) {
    return  EVENT_TYPES.FAKE_EVENT;
  } else {
    return undefined;
  }
}; // end calculateNewRecordEvent

const processTableModifyEvent = async ( record ) => {
  // ONLY IF SUBMITTED INSTRUMENT FIRE
  //if( record.)
};