/********************************************
 * utility library
 * 1 April 2017
 * delProfundo (@brunowatt)
 * bruno@hypermedia.tech
 ********************************************/

/**
 * simple ping endpoint
 * @returns {Promise<{message: string}>}
 */
export const ping = async () => {
  return { message: "PONG" };
}; //end ping

/**
 * simple echo endpoint
 * @param messageObject
 * @returns {Promise<any>}
 */
export const echo = async ( messageObject ) => {
  try {
    return JSON.parse( messageObject );
  } catch( err ) {
    throw err;
  }
}; // end echo