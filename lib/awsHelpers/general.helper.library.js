/**
 * shortcut for unstringing a potentially stringed json thing
 * @param item
 * @returns {*}
 */
export const unstring = item => {
    if (typeof item === "string") {
        return JSON.parse(item);
    }
    return item;
}; // end unstring

/**
 * common async respond assembler
 * @param resultCode
 * @param recordId
 * @param recordType
 * @returns {{result: *, recordId: *, recordType: *}}
 */
export const generateAsyncResponse = (resultCode, recordId, recordType) => {
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
export const getSecretValue = async (key, ssm) => {
    try {
        const param = await ssm
            .getParameters({
                Names: [key],
                WithDecryption: true
            })
            .promise();
        return param.Parameters[0].Value;
    } catch (err) {
        throw err;
    }
}; // end getSecretValue

/**
 * pass in ssm and a full ssm parameter path key to get that value back
 * @param key
 * @param ssm
 * @returns {Promise<PromiseResult<D, E> | never>}
 */
export const getValue = async (key, ssm) => {
    try {
        const ssmResponse = await ssm.getParameters({ Names: [key] }).promise();
        return ssmResponse.Parameters[0].Value;
    } catch (err) {
        throw err;
    }
}; // end getValue
