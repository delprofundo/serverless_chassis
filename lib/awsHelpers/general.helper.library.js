/**
 * shortcut for unstringing a potentially stringed json thing
 * @param item
 * @returns {*}
 */
export function unstring( item ) {
  if( typeof item === "string" ) {
    return JSON.parse( item );
  } else {
    return item;
  }
}

/**
 * common async respond assembler
 * @param resultCode
 * @param recordId
 * @param recordType
 * @returns {{result: *, recordId: *, recordType: *}}
 */
export function generateAsyncResponse( resultCode, recordId, recordType ) {
  return {
    result: resultCode,
    recordId: recordId,
    recordType: recordType
  };
} // end generateAsyncResponse

/**
 * pass in ssm and a full ssm parameter path key to get that value back (that is secret)
 * @param key
 * @param ssm
 * @returns {Promise<PromiseResult<D, E> | never>}
 */
export async function getSecretValue( key, ssm ) {
  try {
    const ssmResponse = await ssm.getParameters({
      Names: [key],
      WithDecryption: true
    });
  } catch( err ) {
    throw err;
  }
} // end getSecretValue


/**
 * pass in ssm and a full ssm parameter path key to get that value back
 * @param key
 * @param ssm
 * @returns {Promise<PromiseResult<D, E> | never>}
 */
export async function getValue( key, ssm ) {
  try {
    const ssmResponse = await ssm.getParameters({ Names: [ key ]});
    return ssmResponse.Parameters[ 0 ].Value;
  } catch( err ) {
    throw err;
  }
} // end getValue