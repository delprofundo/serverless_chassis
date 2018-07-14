//const HONEYCOMB_API_KEY = process.env.HONEYCOMB_API_KEY;
//const HONEYCOMB_DATASET = process.env.HONEYCOMB_DATASET;
import {
  RESifySuccess,
  RESifyErr
} from "./lib/RESifier.representor.library";

const DEPLOY_REGION = process.env.DEPLOY_REGION;

//ADD LIB's HERE

const AWSXRay = require("aws-xray-sdk-core");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));
const util = require( "./lib/util.server.library" );
//declare the DB here and inject it to all calls that require it
const db = new AWS.DynamoDB.DocumentClient();

//EXPORTED FUNCTIONS
/**
 * ping - simple GET test
 * @param event
 * @param context
 * @param cb
 */
export const ping = ( event, context, cb ) => {
  //hny.sendNow({
  //  message: 'ping http call',
  //});
  util.ping( )
    .then( res => {
      cb( null, RESifySuccess( res ));
    })
    .catch( err => {
      cb( null, RESifyErr( err ));
    });
}; //end ping

/**
 * echo - simple POST test
 * @param event
 * @param context
 * @param cb
 */
export const echo = ( event, context, cb ) => {
  util.echo( event.body )
    .then( res => {
      cb( null, RESifySuccess( res ));
    })
    .catch( err => {
      cb( null, RESifyErr( err ));
    });
}; //end echo