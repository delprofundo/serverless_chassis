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
export const isAcceptablePageLimit = (candidateLimit, pageParams) => {
  if (!candidateLimit) {
    return false;
  }
  return !(candidateLimit < pageParams.MIN || candidateLimit > pageParams.MAX);
}; // end isAcceptablePageLimit

/**
 * simply assembles the table, LEK and limit parameters for a db query/scan
 * @param table
 * @param queryStringParameters
 * @param pageParams
 * @returns {{TableName: *}}
 */
export const createBaseQueryParameters = (table, queryStringParameters, pageParams) => {
  let baseQueryParameterObject = {
    TableName: table,
    ExclusiveStartKey: undefined,
    Limit: undefined
  };
  if (queryStringParameters !== null && Object.prototype.hasOwnProperty.call(queryStringParameters, "lek")) {
    baseQueryParameterObject = {
      ...baseQueryParameterObject,
      ExclusiveStartKey: JSON.parse(queryStringParameters.lek)
    };
  }
  if (queryStringParameters !== null && Object.prototype.hasOwnProperty.call(queryStringParameters, "limit")) {
    const limit = isAcceptablePageLimit(queryStringParameters.limit, pageParams)
      ? queryStringParameters.limit
      : pageParams.DEFAULT;
    baseQueryParameterObject = { ...baseQueryParameterObject, Limit: limit };
  }
  return baseQueryParameterObject;
}; // end createBaseQueryParameters

/**
 * takes a response object that holds the returned collection and the dynamo response
 * to insert the lek in the user space response should it be present
 * @param targetResponse
 * @param dynamoResponse
 * @returns {*}
 */
export const lekMe = (targetResponse, dynamoResponse) => {
  const updatedResponse = targetResponse;
  if (
    Object.prototype.hasOwnProperty.call(dynamoResponse, "LastEvaluatedKey") &&
    dynamoResponse.LastEvaluatedKey !== null
  ) {
    return {...updatedResponse, lek: dynamoResponse.LastEvaluatedKey};
  }
  return updatedResponse;
}; // end lekMe
