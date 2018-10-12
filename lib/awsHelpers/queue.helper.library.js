/**
 * queue helper library
 * THESE HELPERS USED TO QUERY COLLECTIONS
 * 24 Sept 2018
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module dynamodb/queryHelper
 */
const logger = require( "log-winston-aws-level" );
/**
 * HOF pushing messages onto service stream
 * @param streamEvents
 * @param eventProcessorFunction
 * @param target
 * @returns {Promise<any>}
 */
export async function queueEventPromisifier( streamEvents, eventProcessorFunction, target ) {
  return new Promise(( resolve, reject ) => {
    let parsedEvents = streamEvents.map( event => {
      logger.info("extracting queue event from : ", event );
      return extractQueueEvent( event );
    });
    let processEventsPromiseArray = parsedEvents.map(
      function( event ) { return eventProcessorFunction( event, target );}
    );
    Promise.all( processEventsPromiseArray )
      .then( () => {
        logger.info( "successfully processed all events" );
        resolve();
      })
      .catch( err => {
        logger.error( "error processing events ", err );
        reject( err );
      });
  });
} // end queueEventPromisifier

/**
 * parses a SQS queue event
 * @param incomingQueueEvent |
 * @returns {any}
 */
function extractQueueEvent( incomingQueueEvent ) {
  logger.info( "in extract queue events: ", incomingQueueEvent);
  logger.info( typeof incomingQueueEvent );
  let incomingQueuePayload = JSON.parse( incomingQueueEvent.body );
  incomingQueuePayload.messageId = incomingQueueEvent.messageId;
  incomingQueuePayload.sentTime = incomingQueueEvent.attributes.SentTimestamp;
  return incomingQueuePayload;
} // end extractQueueEvent

