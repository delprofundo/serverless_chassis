/**
 * queue helper library
 * THESE HELPERS USED TO QUERY COLLECTIONS
 * 24 Sept 2018
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module dynamodb/queryHelper
 */
const logger = require("log-winston-aws-level");

/**
 * takes message, queue url and queue and puts message on queue
 * @param body
 * @param queueUrl
 * @param queue
 * @returns {Promise<void>}
 */
export const pushToQueue = async (body, queueUrl, queue) => {
    try {
        return queue
            .sendMessage({
                MessageBody: JSON.stringify(body),
                QueueUrl: queueUrl
            })
            .promise();
    } catch (err) {
        throw err;
    }
}; // end pushToQueue

/**
 * HOF pushing messages onto service stream
 * @param streamEvents
 * @param eventProcessorFunction
 * @param target
 * @returns {Promise<[any, any, any, any, any, any, any, any, any, any]>}
 */
export const queueEventPromisifier = async (streamEvents, eventProcessorFunction, target) => {
    const parsedEvents = streamEvents.map(event => {
        return extractQueueEvent(event);
    });
    try {
        return Promise.all(
            parsedEvents.map(async event => {
                return await eventProcessorFunction(event, target);
            })
        );
    } catch (err) {
        logger.error("error in queue event PROMISIFIER", err);
        throw err;
    }
}; // end queueEventPromisifier

/**
 * parses a SQS queue event
 * @param incomingQueueEvent
 * @returns {any}
 */
const extractQueueEvent = incomingQueueEvent => {
    const incomingQueuePayload = JSON.parse(incomingQueueEvent.body);
    incomingQueuePayload.queueMessageId = incomingQueueEvent.messageId;
    incomingQueuePayload.sentTime = incomingQueueEvent.attributes.SentTimestamp;
    return incomingQueuePayload;
}; // end extractQueueEvent
