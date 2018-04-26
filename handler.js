const util = require( './lib/util.server.library' );
//ADD LIB's HERE

const AWS = require( "aws-sdk" );
AWS.config.update({ region:'us-east-1' });
//declare the DB here and inject it to all calls that require it
const db = new AWS.DynamoDB.DocumentClient();

import {
  RESify200,
  RESifyErr
} from './lib/RESifier.representor.library';

//EXPORTED FUNCTIONS
/*
 * FUNCTION: ping
 * simple pinging endpoint to test raw service
 */
export const ping = ( event, context, cb ) => {
  util.ping( )
    .then( res => {
      cb( null, RESify200( res ));
    })
    .catch( err => {
      cb( null, RESifyErr( err ))
    })
}; //end ping