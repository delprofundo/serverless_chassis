/**
 * service handler
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module YYYYY/ServiceHandler
 */
import * as AWS from "aws-sdk"; // eslint-disable-line import/no-extraneous-dependencies
import * as logger from "log-winston-aws-level";
import * as AWSXRay from "aws-xray-sdk-core";
import { RESifySuccess, RESifyErr } from "./lib/awsHelpers/RESifier.representor.library";
import * as util from "./lib/util.server.library";

// ADD LIB's HERE

const { DEPLOY_REGION } = process.env;

AWS.config.update({ region: DEPLOY_REGION });
AWS = AWSXRay.captureAWS(AWS);
// declare the DB here and inject it to all calls that require it
const db = new AWS.DynamoDB.DocumentClient(); // eslint-disable-line  @typescript-eslint/no-unused-vars

// EXPORTED FUNCTIONS
/**
 * ping - simple GET test
 */
export const ping = async () => {
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
