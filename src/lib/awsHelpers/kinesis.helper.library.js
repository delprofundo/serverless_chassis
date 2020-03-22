/**
 * kinesis stream helper library
 * THESE HELPERS USED TO HANDLE STREAMS
 * 25 January 2020
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module kinesis/streamHelper
 */

const logger = require( "log-winston-aws-level" );
const randomString = require( "randomstring" );
const uuid = require( "uuid" );

export const streamPublish = async ( eventRecord, eventType, partitionKey, streamAddress, stream ) => {
  return await stream.putRecord({
    StreamName: streamAddress,
    PartitionKey: partitionKey,
    Data: JSON.stringify({
      id: uuid.v1(),
      type: eventType,
      timestamp: Date.now(),
      item: eventRecord
    })
  }).promise();
}; // end streamPublish


export const kinesisStreamEventPromisifier = async ( queueEvents, eventProcessorFunction, target1, target2 ) => {
  logger.info( "in k promisifier : ", queueEvents );

  try {
    await Promise.all(queueEvents.map( async ( event ) => {

      const parsedEvent = {
        ...event,
        ...event.kinesis,
        data: JSON.parse( Buffer.from( event.kinesis.data, "base64" ))
      };
      delete parsedEvent.kinesis;
      logger.info( "parsed Event : ", parsedEvent );
      return eventProcessorFunction( parsedEvent, target1, target2 )
    }))
  } catch( err ) {
    logger.error( "error in table stream PROMISIFIER", err );
    throw err;
  }
}; // end kinesisStreamEventPromisifier

export const generatePartitionKey = () => {
  return randomString.generate( 12 )
}; // end generatePartitionKey