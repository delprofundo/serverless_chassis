/**
 * dynamodb CRUD helper library
 * THESE HELPERS USED TO MANIPULATE COLLECTIONS
 * 29 May 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module dynamodb/CRUD
 */
import { DynamoDB } from "aws-sdk";

/**
 * puts or overwrites a record.
 * @param dbItem
 * @param db
 * @returns {Promise<PromiseResult<D, E>>}
 */
export const putToDb = async (dbItem: DynamoDB.DocumentClient.PutItemInput, db: DynamoDB.DocumentClient): Promise<DynamoDB.DocumentClient.PutItemOutput> => {
  return db.put(dbItem).promise();
}; // end putToDb

/**
 * takes params and db and updates the record.
 * @param updateParameters
 * @param db
 * @returns {Promise<ManagedUpload.SendData | PromiseResult<D, E>>}
 */
export const updateRecord = async (updateParameters: DynamoDB.DocumentClient.UpdateItemInput, db: DynamoDB.DocumentClient): Promise<DynamoDB.DocumentClient.UpdateItemOutput>  => {
  return db.update(updateParameters).promise();
};
