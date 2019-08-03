/**
 * s3 helper library
 * THESE HELPERS USED TO WORK WITH BUCKETS AND OBJECTS
 * 29 May 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module s3/helper
 */
import * as AWS from "aws-sdk"; // eslint-disable-line import/no-extraneous-dependencies

import * as AWSXRay from "aws-xray-sdk-core";
// eslint-disable-line import/no-extraneous-dependencies
AWS = AWSXRay.captureAWS(AWS);

const { DEPLOY_REGION } = process.env;
const s3 = new AWS.S3({ region: DEPLOY_REGION, signatureVersion: "v4" });

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
export const copyBucketObject = async (objectKey, sourceBucket, destinationBucket) => {
  try {
    await s3
      .copyObject({
        Bucket: destinationBucket,
        CopySource: `${sourceBucket}/${objectKey}`,
        Key: objectKey
      })
      .promise();
  } catch (err) {
    throw err;
  }
}; // end copyBucketObject

export const createMultipartUpload = async (objectKey, mediaType, bucket) => {
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

export const completeMultiUpload = async completionPayload => {
  try {
    return s3.completeMultipartUpload(completionPayload).promise();
  } catch (err) {
    throw err;
  }
}; // end completeMultipartUpload
