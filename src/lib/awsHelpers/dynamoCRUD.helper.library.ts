/**
 * dynamodb CRUD helper library
 * THESE HELPERS USED TO MANIPULATE COLLECTIONS
 * 29 May 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module dynamodb/CRUD
 */

/**
 * puts or overwrites a record.
 * @param record
 * @param table
 * @param db
 * @returns {Promise<PromiseResult<D, E>>}
 */
export const putToDb = async (record, table, db) => {
  return db.put({
      TableName: table,
      Item: record
    }).promise();
}; // end putToDb

/**
 * takes params and db and updates the record.
 * @param updateParameters
 * @param db
 * @returns {Promise<ManagedUpload.SendData | PromiseResult<D, E>>}
 */
export const updateRecord = async (updateParameters, db) => {
  return db.update(updateParameters).promise();
};
