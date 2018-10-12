/**
 * shortcut for unstringing a potentially stringed json thing
 * @param item
 * @returns {*}
 */
export function unstring( item ) {
  if( typeof item === "string" ) {
    return JSON.parse( item )
  } else {
    return item
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