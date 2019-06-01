/**
 * @module member/Representor
 * @type {function(*=, *=): {body: string, statusCode: number, headers: {"Access-Control-Allow-Origin": string, "Access-Control-Allow-Credentials": boolean}}}
 */

/**
 * Basic success response wrapper.
 * If no status present standard 200 returned
 * @param candidateObject
 * @param statusCode
 * @returns {{body: string, statusCode: number, headers: {"Access-Control-Allow-Origin": string, "Access-Control-Allow-Credentials": boolean}}}
 */
export const RESifySuccess = ( candidateObject, statusCode = 200 ) => {
  return {
    body: JSON.stringify( candidateObject ),
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    }
  };
}; // end RESifySuccess

/**
 * Basic error response wrapper. Takes an error and status code.
 * If no status code presented 500 is used.
 * @param errorResponse
 * @param statusCode
 * @returns {{body: string, statusCode: *, headers: {"Access-Control-Allow-Origin": string, "Access-Control-Allow-Credentials": boolean}}}
 */
export const RESifyErr = ( errorResponse, statusCode = 500 ) => {
  return {
    body: JSON.stringify({ message: errorResponse.message }),
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    }
  };
}; // end RESifyErr