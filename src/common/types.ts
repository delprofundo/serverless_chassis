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
export interface IAsyncResponse {
    result: string,
    recordId: v4String,
    recordType: string,
    responseMessage?: string,
    traceId?: string
} // end IAsyncResponse interface

export interface IHTTPResponse {
    statusCode: number,
    body: string,
    headers?: object
}
/*
  Authentication Types
 */
export interface IAuthenticationParameters {
    maxTokenExpiry: string,
    jwaPem: string,
    userPoolId?: string,
    systemMemberId?: string
} // end IAuthenticationParameters

interface IFlexibleObject {
    key: string,
    value: any
} // end IFlexibleObject Interface

export interface IPermissionCheckParameters {
    path: string,
    resource: string,
    method: string,
    memberRole?: string,
    clientType?: string
} // end IPermissionCheckParameters Interface

export interface IIamPolicyParameters {
    memberId: v4String,
    effect: string,
    resource: string,
    context?: IFlexibleObject
} // end IIamPolicyParameters Interface