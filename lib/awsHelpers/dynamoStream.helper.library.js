/**
 * queue helper library
 * THESE HELPERS USED TO QUERY COLLECTIONS
 * 13 May 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module dynamodb/queryHelper
 */
const logger = require( "log-winston-aws-level" );
const AWS = require( "aws-sdk" );
const extractDynamoStreamDelta = require( "dynamo-stream-diff" );

/**
 * HOF that takes a dynamoDb stream event, a processor function and a target
 * @param streamEventAssembly
 * @param eventProcessorFunction
 * @param target
 * @returns {Promise<any>}
 */
export const dynamoStreamEventPromisifier = async ( streamEventAssembly, eventProcessorFunction, target ) => {
  const reducedEvents = streamEventAssembly.incomingRecords.map( processIndividualDynamoRecord );
  try {
    await Promise.all(reducedEvents.map( async ( event ) => {
      return eventProcessorFunction( event, target )
    }))
  } catch( err ) {
    logger.error( "error in table stream PROMISIFIER", err );
    throw err;
  }
}; // end dynamoStreamEventPromisifier

/**
 * helper to extract the useful contents from a dynamo stream record including new old and delta
 * @param dynamoRecord
 * @returns {{oldRec: any, newRec: any, streamEventName: DynamoDBStreams.OperationType}}
 */
const processIndividualDynamoRecord = ( dynamoRecord ) => {
  const dynamoRecordParse = AWS.DynamoDB.Converter.output;
  let response ={
    newRec: dynamoRecordParse( { M: dynamoRecord.dynamodb.NewImage } ),
    oldRec: dynamoRecordParse( { M: dynamoRecord.dynamodb.OldImage } ),
    streamEventName: dynamoRecord.eventName
  };
  if( dynamoRecord.eventName === "MODIFY" ) {
    const diff = extractDynamoStreamDelta( dynamoRecord );
    response.delta = diff.diffList
  }
  return response;
}; // end processIndividualDynamoRecord