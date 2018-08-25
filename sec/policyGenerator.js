/**
 * Function that creates an API Gateway policy document from validated input
 * @param userId
 * @param effect
 * @param resource
 * @param context
 * @returns {{principalId: *, policyDocument: {Version: string, Statement: *[]}}}
 */
module.exports = function( userId, effect, resource, context ) {
  console.log(`building IAM policy for user: ${ userId }, effect: ${ effect }, on resource: ${ resource }, context: ${ context }`);
  // TODO : test all input is valid and reject if not

  //assemble IAM policy document to return
  const policy = {
    principalId: userId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: effect,
          Action: [
            "execute-api:Invoke"
          ],
          Resource: [
            resource
          ]
        }
      ]
    }//,
    //TODO: context
  };
  console.log(`generated policy document: `, JSON.stringify( policy ));
  return policy;
  //})
}; // end buildIAMPolicy
