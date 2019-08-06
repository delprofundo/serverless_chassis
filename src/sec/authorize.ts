/**
 * CUSTOM AUTHORIZER
 * 01 Jun 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module sec/authorize
 */
import * as logger from "log-winston-aws-level";
import * as AWS from "aws-sdk"; // eslint-disable-line import/no-extraneous-dependencies
import moment from "moment";
import { decryptJWE } from "jwe-handler";
import { IIamPolicyParameters, IPermissionCheckParameters } from "../interface/types";
import { getAuthenticationParameters } from "../lib/awsHelpers/authentication.helper.library";
import * as permissionsMatrix from "./permissionsMatrix";

const { DEPLOY_REGION } = process.env;
const { MAX_TOKEN_EXPIRY_PATH } = process.env;
const { SYSTEM_MEMBER_ID_PATH } = process.env;
const { JWA_PEM_PATH } = process.env;

AWS.config.update({ region: DEPLOY_REGION });
const ssm = new AWS.SSM({ apiVersion: "2014-11-06" });

/**
 *  Function that creates an API Gateway policy document from validated input
 * @param memberId
 * @param effect
 * @param resource
 * @param context
 * @returns {Error|{policyDocument: {Version: string, Statement: {Action: string[], Resource: *[], Effect: *}[]}, context: *, principalId: *}}
 */
export function buildIamPolicy({ memberId, effect, resource, context }: IIamPolicyParameters) {
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
function extractBasePath(path: string): string {
  const pathSegments = path.split("/").slice(1);
  return `/${pathSegments[0]}`;
} // extractBasePath

/**
 * function returns bool stating if the unix time passed in is either
 * in the past or beyond what is acceptable for age.
 * @param tokenExpiryUnixTime
 * @returns {boolean}
 */
function hasTokenExpired(tokenExpiryUnixTime: number): boolean {
  return moment().unix() >= tokenExpiryUnixTime;
} // end hasTokenExpired

/**
 * queries local system for AAA details.
 * @param authParams
 * @param event
 * @param context
 * @returns {Promise<void>}
 */
async function authenticateIntegratedUser(authParams, event, context): Promise<any> {
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
  const permissionCheckParams: IPermissionCheckParameters = {
    path: extractBasePath(event.path),
    resource: event.resource,
    method: event.httpMethod,
    memberRole: localClientRecord.role
  };
  try {
    resultEffect = await permissionsMatrix.default(permissionCheckParams);
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
  const authParams = await getAuthenticationParameters(
    {
      maxTokenExpiry: MAX_TOKEN_EXPIRY_PATH,
      systemMemberId: SYSTEM_MEMBER_ID_PATH,
      /* userPoolId: USER_POOL_ID_PATH, */
      jwaPem: JWA_PEM_PATH
    },
    ssm
  );
  return authenticateIntegratedUser(authParams, event, context);
}; // end handler

export default handler;
