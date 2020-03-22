/**
 * service queue handler
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module vault/queueHandler
 */
const logger = require( "log-winston-aws-level" );
import { unstring } from "../lib/awsHelpers/general.helper.library";
import { queueEventPromisifier } from "../lib/awsHelpers/queue.helper.library";
import { service_global_metadata } from "../schema/serviceGlobalMetadata";
const { REQUEST_TYPES } = service_global_metadata;


/**
 * receives service bus messages and hands them down to be processed
 * successful ending clears the messages, error means they will be reprocessed
 * as such all commands that cross the queue must be idempotent.
 * @param event
 * @returns {Promise<void>}
 */
export const queueHandler = async ( event ) => {
  logger.info( "inside vault service queue handler : ", event );
  const queueEvents = [ ...unstring( event.Records )];
  logger.info( "queue events : ", queueEvents );
  try {
    await processQueueMessages( queueEvents );
    logger.info( "success processing queue events : " );
  } catch( err ) {
    logger.error( "error processing queue events : ", err );
    throw err;
  }
}; // end queueHandler

export const processQueueMessages = async ( queueEvents ) => {
  return queueEventPromisifier( queueEvents, processQueueMessage );
}; // end processQueueMessages

const processQueueMessage = async ( queueEvent, db ) => {
  logger.info( "inside processQueueMessage", queueEvent );
  const { requestType, eventPayload } = queueEvent;
  switch ( requestType ) {
    case REQUEST_TYPES.FAKE_REQUEST:
      //TODO: Add actual request, will call into a domain server library
      // EXAMPLE : return processFakeRequest( eventPayload );

    default:
      //TODO : push record to dump
      logger.info( "processQueueMessage switch fall through request type:", requestType );
      return;
  }
}; // end processQueueMessage