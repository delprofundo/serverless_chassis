/**
 * http service handler
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module http/ServiceHandler
 */
const logger = require("log-winston-aws-level");
const util = require( "../lib/util.server.library" );

import {
  RESifySuccess,
  RESifyErr
} from "../lib/awsHelpers/RESifier.representor.library";
import { unstring } from "../lib/awsHelpers/general.helper.library";

/**
 * ping - simple GET test
 * @param event
 */
export const ping = async ( event ) => {
  try {
    return RESifySuccess( await util.ping())
  } catch( err ) {
    logger.error( "error in ping : ", err );
    throw RESifyErr( err );
  }
}; // end ping

/**
 * echo - simple POST test
 * @param event
 */
export const echo = async( event ) => {
  try {
    return RESifySuccess( await util.echo( event.body ));
  } catch( err ) {
    logger.error( "error in echo", err );
    return RESifyErr( err );
  }
}; // end echo