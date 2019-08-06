/**
 * SERVICE SHARED TYPES
 * 04 Aug 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module common/types
 */
import { v4String } from "uuid/interfaces";

/*
  Common Communication Types
 */
export interface AsyncResponse {
  result: string;
  recordId: v4String;
  recordType: string;
  responseMessage?: string;
  traceId?: string;
} // end AsyncResponse interface

/*
  Authentication Types
 */
export interface AuthenticationParameters {
  maxTokenExpiry: string;
  jwaPem: string;
  userPoolId?: string;
  systemMemberId?: string;
} // end AuthenticationParameters

interface FlexibleObject {
  key: string;
  value: any;
} // end FlexibleObject Interface

export interface PermissionCheckParameters {
  path: string;
  resource: string;
  method: string;
  memberRole?: string;
  clientType?: string;
} // end PermissionCheckParameters Interface

export interface IamPolicyParameters {
  memberId: v4String;
  effect: string;
  resource: string;
  context?: FlexibleObject;
} // end IamPolicyParameters Interface
