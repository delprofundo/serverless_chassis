/**
 * s3 helper library
 * THESE HELPERS USED TO WORK WITH BUCKETS AND OBJECTS
 * 29 May 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module s3/helper
 */
import AWS from "aws-sdk"; // eslint-disable-line import/no-extraneous-dependencies

import * as AWSXRay from "aws-xray-sdk-core";
// eslint-disable-line import/no-extraneous-dependencies
const AWS_WRAPPED = AWSXRay.captureAWS(AWS);

const { DEPLOY_REGION } = process.env;
const s3 = new AWS_WRAPPED.S3({ region: DEPLOY_REGION, signatureVersion: "v4" });

const MEDIA_TYPES = {
  VIDEO: {
    CONTENT_TYPE: "video/mp4"
  }
};

/**
 * copies an object from one bucket to another
 * @param objectKey
 * @param sourceBucket
 * @param destinationBucket
 * @returns {Promise<void>}
 */
export const copyBucketObject = async (objectKey: string, sourceBucket: string, destinationBucket: string): Promise<AWS.S3.CopyObjectResult> => {
  try {
    const response = await s3
      .copyObject({
        Bucket: destinationBucket,
        CopySource: `${sourceBucket}/${objectKey}`,
        Key: objectKey
      })
      .promise();
    return response.data;
  } catch (err) {
    throw err;
  }
}; // end copyBucketObject

export const createMultipartUpload = async (objectKey: string, mediaType: string, bucket: string): Promise<AWS.S3.CreateMultipartUploadOutput> => {
  try {
    return await s3
      .createMultipartUpload({
        Bucket: bucket,
        Key: objectKey,
        ContentType: MEDIA_TYPES[mediaType].CONTENT_TYPE
      })
      .promise();
  } catch (err) {
    throw err;
  }
}; // end createMultipartUpload

export const completeMultiUpload = async (completionPayload: AWS.S3.CompleteMultipartUploadRequest): Promise<AWS.S3.CompleteMultipartUploadOutput> => {
  try {
    return s3.completeMultipartUpload(completionPayload).promise();
  } catch (err) {
    throw err;
  }
}; // end completeMultipartUpload
