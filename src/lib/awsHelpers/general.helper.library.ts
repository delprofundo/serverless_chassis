import {
    IAsyncResponse,
} from "../../interface/types";

import { SSM } from "aws-sdk"
import {v4String} from "uuid/interfaces";

/**
 * shortcut for unstringing a potentially stringed json thing
 * @param item
 * @returns {*}
 */
export const unstring = (item: Object|string): Object => {
    const working = item;
    if (typeof item === "string") {
        return JSON.parse( <string>working );
    }
    return working;
}; // end unstring

/**
 * common async response assembler
 * @param resultCode
 * @param recordId
 * @param recordType
 * @returns {{result: *, recordId: *, recordType: *}}
 */
export const generateAsyncResponse = ( resultCode: string, recordId: v4String, recordType: string ): IAsyncResponse => {
    return {
        result: resultCode,
        recordId,
        recordType
    };
}; // end generateAsyncResponse