/**
 * CUSTOM AUTHORIZER
 * 01 Jun 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module sec/authorize
 */
import * as logger from "log-winston-aws-level";
import * as AWS from "aws-sdk"; // eslint-disable-line import/no-extraneous-dependencies
import * as moment from "moment";
import { decryptJWE } from "jwe-handler";
import { getSecretValue, getValue } from "../lib/awsHelpers/general.helper.library";
import * as permissionsMatrix from "./permissionsMatrix";

const { DEPLOY_REGION } = process.env;
const { MAX_TOKEN_EXPIRY_PATH } = process.env;
const { SYSTEM_MEMBER_ID_PATH } = process.env;
const { JWA_PEM_PATH } = process.env;

AWS.config.update({ region: DEPLOY_REGION });
const ssm = new AWS.SSM({ apiVersion: "2014-11-06" });

/**
 * getAuthenticationParameters will pull all the needed security parameters from ssm
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

/**
 *  Function that creates an API Gateway policy document from validated input
 * @param memberId
 * @param effect
 * @param resource
 * @param context
 * @returns {Error|{policyDocument: {Version: string, Statement: {Action: string[], Resource: *[], Effect: *}[]}, context: *, principalId: *}}
 */
export function buildIamPolicy({ memberId, effect, resource, context }) {
  // test all input is valid and reject if not
  if (typeof memberId === "undefined" || memberId === null) {
    return new Error("memberId required to identify user or client");
  }
  if (typeof effect === "undefined" || effect === null) {
    return new Error("invalid effect field");
  }
  if (typeof resource === "undefined" || resource === null) {
    return new Error("invalid resource field");
  }
  return {
    principalId: memberId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: effect,
          Action: ["execute-api:Invoke"],
          Resource: [resource]
        }
      ]
    },
    context
  };
} // end buildIamPolicy

/**
 * takes a path from an APIG event record and
 * returns the base path.
 * @param path
 * @returns {string}
 */
function extractBasePath(path) {
  const pathSegments = path.split("/").slice(1);
  return `/${pathSegments[0]}`;
} // extractBasePath

/**
 * function returns bool stating if the unix time passed in is either
 * in the past or beyond what is acceptable for age.
 * @param tokenExpiryUnixTime
 * @returns {boolean}
 */
function hasTokenExpired(tokenExpiryUnixTime) {
  return moment().unix() >= tokenExpiryUnixTime;
} // end hasTokenExpired

/**
 * queries local system for AAA details.
 * @param authParams
 * @param event
 * @param context
 * @returns {Promise<void>}
 */
async function authenticateIntegratedUser(authParams, event, context) {
  logger.info("inside authenticateIntegratedUser", authParams, event);
  const { jwaPem } = authParams;
  const clientToken = event.headers.Authorization;
  let localClientRecord;
  let resultEffect;
  try {
    localClientRecord = await decryptJWE(clientToken, jwaPem);
  } catch (err) {
    logger.info("error trying the decrypt : ", err);
    context.fail("Unauthorized");
  }
  if (hasTokenExpired(localClientRecord.expiry) === true) {
    logger.info("token has expired, auth failed");
    context.fail("Unauthorized");
  }
  const permissionCheckParams = {
    path: extractBasePath(event.path),
    resource: event.resource,
    method: event.httpMethod,
    memberRole: localClientRecord.role
  };
  try {
    resultEffect = await permissionsMatrix.validateAccess(permissionCheckParams);
    return await buildIamPolicy({
      memberId: localClientRecord.memberId,
      effect: resultEffect.effect,
      resource: event.methodArn,
      context: localClientRecord
    });
  } catch (err) {
    logger.error("error building IAM policy", err);
    return context.fail("Unauthorized");
  }
} // end authenticateIntegratedUser

const handler = async (event, context) => {
  const authParams = await getAuthenticationParameters({
    max: MAX_TOKEN_EXPIRY_PATH,
    systemMemberId: SYSTEM_MEMBER_ID_PATH,
    /* userPoolId: USER_POOL_ID_PATH, */
    jwaPem: JWA_PEM_PATH
  });
  return authenticateIntegratedUser(authParams, event, context);
}; // end handler

export default handler;
