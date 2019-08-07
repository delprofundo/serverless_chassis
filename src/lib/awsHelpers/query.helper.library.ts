/**
 * query helper library
 * THESE HELPERS USED TO QUERY COLLECTIONS
 * 24 Sept 2018
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module dynamodb/queryHelper
 */

import { BaseQueryParameters } from "../../interface/types";

/**
 * where a query accepts a custom page limit this is
 * used to decide between that provided and the default.
 * @param candidateLimit
 * @param pageParams : object containing the bounds and default
 * @returns {boolean}
 */
export const isAcceptablePageLimit = (candidateLimit: number, pageParams: any): boolean => {
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
export const createBaseQueryParameters = (table: string, queryStringParameters: any, pageParams: any): BaseQueryParameters => {
  let baseQueryParameterObject: BaseQueryParameters = {
    TableName: table
  };
  if (queryStringParameters !== null && Object.prototype.hasOwnProperty.call(queryStringParameters, "lek")) {
    baseQueryParameterObject = { ...baseQueryParameterObject, ExclusiveStartKey: JSON.parse(queryStringParameters.lek) };
  }
  if (queryStringParameters !== null && Object.prototype.hasOwnProperty.call(queryStringParameters, "limit")) {
    const limit = isAcceptablePageLimit(queryStringParameters.limit, pageParams)
      ? queryStringParameters.limit
      : pageParams.DEFAULT;
    return { ...baseQueryParameterObject, Limit: limit };
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
export const lekMe = (targetResponse: object, dynamoResponse: any): object => {
  if (
    Object.prototype.hasOwnProperty.call(dynamoResponse, "LastEvaluatedKey") &&
    dynamoResponse.LastEvaluatedKey !== null
  ) {
    return { ...targetResponse, lek: dynamoResponse.LastEvaluatedKey };
  }
  return targetResponse;
}; // end lekMe
