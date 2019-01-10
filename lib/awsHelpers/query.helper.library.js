/**
 * query helper library
 * THESE HELPERS USED TO QUERY COLLECTIONS
 * 24 Sept 2018
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module dynamodb/queryHelper
 */

/**
 * where a query accepts a custom page limit this is
 * used to decide between that provided and the default.
 * @param candidateLimit
 * @param pageParams : object containing the bounds and default
 * @returns {boolean}
 */
export function isAcceptablePageLimit( candidateLimit, pageParams ) {
  // if candidate outside of min and max false
  if( !candidateLimit ){
    logger.info( "returning false" );
    return false;
  }
  return !( candidateLimit < pageParams.MIN || candidateLimit > pageParams.MAX );
} // end isAcceptablePageLimit

/**
 * simply assembles the table, LEK and limit parameters for a db query/scan
 * @param table
 * @param queryStringParameters
 * @param pageParams
 * @returns {{TableName: *}}
 */
export function createBaseQueryParameters( table, queryStringParameters, pageParams ) {
  let baseQueryParameterObject = {
    TableName: table
  };
  if( queryStringParameters !== null && queryStringParameters.hasOwnProperty( "lek" )) {
    baseQueryParameterObject.ExclusiveStartKey = JSON.parse( queryStringParameters.lek );
  }
  if( queryStringParameters !== null && queryStringParameters.hasOwnProperty( "limit" )) {
    baseQueryParameterObject.Limit = isAcceptablePageLimit(queryStringParameters.limit, pageParams )
      ? queryStringParameters.limit
      : pageParams.DEFAULT;
  }
  return baseQueryParameterObject;
} // end createBaseQueryParameters

/**
 * takes a response object that holds the returned collection and the dynamo response
 * to insert the lek in the user space response should it be present
 * @param targetResponse
 * @param dynamoResponse
 * @returns {*}
 */
export function lekMe( targetResponse, dynamoResponse ) {
  if( dynamoResponse.hasOwnProperty( "LastEvaluatedKey" ) && dynamoResponse.LastEvaluatedKey !== null ) {
    targetResponse.lek = dynamoResponse.LastEvaluatedKey;
  }
  return targetResponse;
} // end lekMe