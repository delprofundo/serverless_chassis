/**
 * dynamodb CRUD helper library
 * THESE HELPERS USED TO MANIPULATE COLLECTIONS
 * 29 May 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module dynamodb/CRUD
 */

export const dynamoGet = async ( hashKey, rangeKey, tableName,  db ) => {
  return await db.get({
    TableName: tableName,
    Key: {
      hashKey: hashKey,
      rangeKey: rangeKey
    }
  }).promise()
} ; // end dynamoGet

/**
 * puts or overwrites a record.
 * @param record
 * @param table
 * @param db
 * @returns {Promise<PromiseResult<D, E>>}
 */
export const dynamoPut = async (record, table, db ) => {
  return await db.put({
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
export const updateRecord = async ( updateParameters, db ) => {
  return db.update( updateParameters ).promise()
};

const DELIMITER = "#";
export const compoundKeyExtract = ( string, indexNumber = 1 ) => {
  const workingString = string.split( DELIMITER ).slice( 0, indexNumber );
  console.log("working : ", workingString );
  return workingString.join( DELIMITER );
};

/**
 * simple function taht removes the hash and range key from objects inserted
 * in a multi view dynamo table (ie: one table for single service)
 * @param dynamoRecord
 * @returns {*}
 */
export const deindexDynamoRecord = ( dynamoRecord ) => {
  console.log( "in de-index : ", dynamoRecord );
  const { hashKey, rangeKey, ...trimmedRecord } = dynamoRecord;
  return trimmedRecord;
}; // end deindexDynamo;