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
  return db.put({
    TableName: table,
    Item: record
  }).promise();
}; // end putToDb

export const incrementCounterField = ( hashKey, rangeKey, fieldName, tableName, db ) => {
  const updateParams = {
    TableName: tableName,
    Key: {
      hashKey,
      rangeKey
    },
    UpdateExpression: 'add #inc_name :inc_value',
    ExpressionAttributeNames: {
      '#inc_name': fieldName
    },
    ExpressionAttributeValues: {
      ':inc_value': 1
    },
    ReturnConsumedCapacity: 'TOTAL',
    ReturnValues: 'ALL_NEW'
  }
  return db.update( updateParams ).promise();
}; // end incrementCounterField

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
  return workingString.join( DELIMITER );
};

/**
 * simple function taht removes the hash and range key from objects inserted
 * in a multi view dynamo table (ie: one table for single service)
 * @param dynamoRecord
 * @returns {*}
 */
export const deindexDynamoRecord = ( dynamoRecord ) => {
  const { hashKey, rangeKey, ...trimmedRecord } = dynamoRecord;
  return trimmedRecord;
}; // end deindexDynamo;
