/********************************************
 * mpa_api
 * utility library, place things here sparingly.
 * promote to npm module once meaningful
 * Check with Bruno before adding functionality here.
 * 1 April 2017
 * delProfundo (@brunowatt)
 * bruno@hypermedia.tech
 ********************************************/

//just telling you the service is actually alive
export async function ping( ) {
  return new Promise(( resolve ) => {
    resolve({ message: "PONG" });
  })
} //end exports.pingSecuredHarness