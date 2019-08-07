/**
 * queue helper library
 * THESE HELPERS USED TO QUERY COLLECTIONS
 * 24 Sept 2018
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module dynamodb/queryHelper
 */
import logger from "log-winston-aws-level";
import { unstring } from "./general.helper.library";
import { DynamoDB, SQS } from "aws-sdk";

/**
 * parses a SQS queue event
 * @param incomingQueueEvent
 * @returns {{queueEvent}}
 */
const extractQueueEvent = (incomingQueueEvent: any): object => {
  return {
    ...unstring(incomingQueueEvent.body),
    queueMessageId: incomingQueueEvent.messageId,
    sentTime: incomingQueueEvent.attributes.SentTimestamp
  };
}; // end extractQueueEvent

/**
 * takes message, queue url and queue and puts message on queue
 * @param body
 * @param queueUrl
 * @param queue
 * @returns {Promise<void>}
 */
export const pushToQueue = async (body: object, queueUrl: string, queue: SQS): Promise<SQS.SendMessageResult> => {
  try {
    return queue.sendMessage({
        MessageBody: JSON.stringify(body),
        QueueUrl: queueUrl
      }).promise();
  } catch (err) {
    throw err;
  }
}; // end pushToQueue

/**
 * HOF pushing messages onto service stream
 * @param queueEvents
 * @param eventProcessorFunction
 * @param target
 * @returns {Promise<[any, any, any, any, any, any, any, any, any, any]>}
 */
export const queueEventPromisifier = async (queueEvents: readonly object[], eventProcessorFunction: (e: object, t: SQS | DynamoDB) => any, target: SQS | DynamoDB): Promise<any> => {
  const parsedEvents = queueEvents.map((event) => {
    return extractQueueEvent(event);
  });
  try {
    return await Promise.all(
      parsedEvents.map(async (event) => {
        return eventProcessorFunction(event, target);
      })
    );
  } catch (err) {
    logger.error("error in queue event PROMISIFIER", err);
    throw err;
  }
}; // end queueEventPromisifier
