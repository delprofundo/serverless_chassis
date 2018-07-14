/********************************************
 * utility library
 * 1 April 2017
 * delProfundo (@brunowatt)
 * bruno@hypermedia.tech
 ********************************************/

/**
 * simple ping endpoint
 * @returns {Promise<any>}
 */
export async function ping( ) {
  return new Promise(( resolve ) => {
    resolve({ message: "PONG" });
  });
} //end ping

/**
 * simple echo endpoint
 * @param messageObject
 * @returns {Promise<any>}
 */
export async function echo( messageObject ) {
  return new Promise(( resolve ) => {
    resolve( JSON.parse( messageObject ));
  });
} // end echo