/**
 * service handler
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module YYYYY/ServiceHandler
 */
// const HONEYCOMB_API_KEY = process.env.HONEYCOMB_API_KEY;
// const HONEYCOMB_DATASET = process.env.HONEYCOMB_DATASET;
import { RESifySuccess, RESifyErr } from "./lib/awsHelpers/RESifier.representor.library";

const { DEPLOY_REGION } = process.env;

// ADD LIB's HERE

const AWSXRay = require("aws-xray-sdk-core");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));
const util = require("./lib/util.server.library");
// declare the DB here and inject it to all calls that require it
const db = new AWS.DynamoDB.DocumentClient();

// EXPORTED FUNCTIONS
/**
 * ping - simple GET test
 * @param event
 */
export const ping = async event => {
    try {
        return RESifySuccess(await util.ping());
    } catch (err) {
        logger.error("error in ping : ", err);
        throw RESifyErr(err);
    }
}; // end ping

/**
 * echo - simple POST test
 * @param event
 */
export const echo = async event => {
    try {
        return RESifySuccess(await util.echo(event.body));
    } catch (err) {
        logger.error("error in echo", err);
        return RESifyErr(err);
    }
}; // end echo
