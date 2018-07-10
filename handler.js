const DEPLOY_REGION = process.env.DEPLOY_REGION

const util = require( './lib/util.server.library' );
//ADD LIB's HERE

const AWS = require( "aws-sdk" );
AWS.config.update({ region: DEPLOY_REGION });
//declare the DB here and inject it to all calls that require it
const db = new AWS.DynamoDB.DocumentClient();

import {
  RESifySuccess,
  RESifyErr
} from './lib/RESifier.representor.library';

//EXPORTED FUNCTIONS
/**
 * ping - simple GET test
 * @param event
 * @param context
 * @param cb
 */
export const ping = ( event, context, cb ) => {
  util.ping( )
  .then( res => {
    cb( null, RESifySuccess( res ));
  })
  .catch( err => {
    cb( null, RESifyErr( err ))
  })
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
  .catch( er => {
    cb( null, RESifyErr( err ));
  })
}; //end echo