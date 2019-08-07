import {
  AsyncResponse,
  AuthenticationParameters,
} from "../../interface/types";

import { SSM } from "aws-sdk";
import {v4String} from "uuid/interfaces";

/**
 * shortcut for unstringing a potentially stringed json thing
 * @param item
 * @returns {*}
 */
export const unstring = (item: object|string): object => {
  if (typeof item === "string") {
    return JSON.parse( item );
  }
  return item;
}; // end unstring

/**
 * common async response assembler
 * @param resultCode
 * @param recordId
 * @param recordType
 * @returns {{result: *, recordId: *, recordType: *}}
 */
export const generateAsyncResponse = ( resultCode: string, recordId: v4String, recordType: string ): AsyncResponse => {
  return {
    result: resultCode,
    recordId,
    recordType
  };
}; // end generateAsyncResponse

/**
 * pass in ssm and a full ssm parameter path key to get that value back (that is secret)
 * @param key
 * @param ssm
 * @returns {Promise<PromiseResult<D, E> | never>}
 */
export const getSecretValue = async ( key: string, ssm: SSM ): Promise<string> => {
  try {
    const param = await ssm
      .getParameters({
        Names: [ key ],
        WithDecryption: true
      })
      .promise();
    return param.Parameters[ 0 ].Value;
  } catch ( err ) {
    throw err;
  }
}; // end getSecretValue

/**
 * pass in ssm and a full ssm parameter path key to get that value back
 * @param key
 * @param ssm
 * @returns {Promise<PromiseResult<D, E> | never>}
 */
export const getValue = async ( key: string, ssm: SSM ): Promise<string> => {
  try {
    const ssmResponse = await ssm.getParameters({ Names: [key] }).promise();
    return ssmResponse.Parameters[0].Value;
  } catch (err) {
    throw err;
  }
}; // end getValue

/**
 * getAuthenticationParameters will pull all the needed security parameters from ssm
 * @param maxTokenExpiry
 * @param systemMemberId
 * @param jwaPem
 * @param ssm
 */
export const getAuthenticationParameters = async ({ maxTokenExpiry, systemMemberId, jwaPem }: AuthenticationParameters , ssm: SSM ) => {
  const resultArr = await Promise.all([
    await getSecretValue(jwaPem, ssm),
    await getValue(maxTokenExpiry, ssm),
    await getSecretValue(systemMemberId, ssm)
  ]);
  return {
    jwaPem: resultArr[0],
    maxTokenExpiry: resultArr[1],
    systemMemberId: resultArr[2]
  };
}; // end getAuthenticationParametersNew
