/** ******************************************
 * Basic JWT signer for internal service calls between services
 * 29 May 2019
 * delProfundo (@brunowatt)
 * bruno@hypermedia.tech
 ******************************************* */
import * as logger from "log-winston-aws-level";
import moment from "moment";
import { createJWE } from "jwe-handler";
import * as AWS from "aws-sdk"; // eslint-disable-line import/no-extraneous-dependencies
import { getSecretValue, getValue } from "../lib/awsHelpers/general.helper.library";

const { DEPLOY_REGION } = process.env;
const { SYSTEM_MEMBER_ID_PATH } = process.env;
const { JWA_PEM_PATH } = process.env;
const { MAX_TOKEN_EXPIRY_PATH } = process.env;

AWS.config.update({ region: DEPLOY_REGION });
const ssm = new AWS.SSM({ apiVersion: "2014-11-06" });

/**
 * getAuthenticationParameters will pull all the needed security parameters from ssm ha
 * @param max
 * @param systemMemberId
 * @param jwaPem
 * @returns {Promise<{maxTokenExpiry: *, systemMemberId: *, jwaPem: *}>}
 */
const getAuthenticationParameters = async ({ max, systemMemberId, jwaPem }) => {
  const resultArr = await Promise.all([
    await getSecretValue(jwaPem, ssm),
    await getValue(max, ssm),
    await getSecretValue(systemMemberId, ssm)
  ]);
  return {
    jwaPem: resultArr[0],
    maxTokenExpiry: resultArr[1],
    systemMemberId: resultArr[2]
  };
}; // end getAuthenticationParametersNew

const handler = async () => {
  let generatedJwe;
  let authParams;
  try {
    authParams = await getAuthenticationParameters({
      max: MAX_TOKEN_EXPIRY_PATH,
      systemMemberId: SYSTEM_MEMBER_ID_PATH,
      jwaPem: JWA_PEM_PATH
    });
  } catch (err) {
    throw err;
  }
  const { maxTokenExpiry, jwaPem, systemMemberId } = authParams;
  const itemToEncrypt = {
    memberId: systemMemberId,
    role: "SYSTEM",
    expiry: moment()
      .add(maxTokenExpiry, "minutes")
      .unix()
  };
  try {
    generatedJwe = await createJWE(itemToEncrypt, jwaPem);
  } catch (err) {
    logger.error("error in generate JWE try block : ", err);
    throw err;
  }
  return generatedJwe;
}; // end handler

export default handler;
