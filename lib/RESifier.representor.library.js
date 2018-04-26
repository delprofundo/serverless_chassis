

module.exports.RESify200 = RESify200;
module.exports.RESifyErr = RESifyErr;


//Very basic function to take a candidate, stringify and prepare to be RES
//Temporary TODO: refactor this out in favour of the representor service
function RESify200( candidateObject ){
  return {
    body: JSON.stringify( candidateObject ),
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    }
  };
}


/**
 * Basic error response wrapper. Takes an error and status code.
 * If no status code presented 500 is used.
 * @param errorResponse
 * @param statusCode
 * @returns {{body: string, statusCode: *, headers: {"Access-Control-Allow-Origin": string, "Access-Control-Allow-Credentials": boolean}}}
 * @constructor
 */
function RESifyErr( errorResponse, statusCode = 500 ){
  return {
    body: JSON.stringify({ message: errorResponse.message }),
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    }
  };
}