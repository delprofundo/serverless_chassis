/**
 * returns an object used by authoriser to verify permissions
 */
const USER_TYPES = {
  ADMIN: "ADMINS",
  BRAND_ADMIN: "BRAND_ADMINS",
  SYSTEM: "SYSTEM",
  MEMBER: "MEMBERS",
  ANONYMOUS: "ANONYMOUS"
};
const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE"
};

/**
 * takes the individual components that make up the endpoint the user is trying to access
 * and returns a boolean representing whether they have access (true for yes).
 * This could be replaced with a database table but this structure is faster.
 * @param path
 * @param resource
 * @param method
 * @param userType
 * @returns {boolean}
 */
module.exports = function({ path, resource, method, userType }) {
  // get the pathObj object
  console.log(`passed in path = ${path}`);

  let pathObj = permissionsMatrix.find( pathItem => {
    console.log( "paf item :", JSON.stringify(pathItem));
    console.log( "actual paf item", pathItem.path);
    console.log(path === pathItem.path);
    return pathItem.path === path;
  });
  // get the resource object
  let resourceObj = pathObj.resources.find( resourceItem => {
    console.log(resourceItem);
    return resourceItem.resource === resource;
  });
  if( typeof resourceObj === "undefined" || resourceObj === null ) {
    console.log("failed finding resource in : ", JSON.stringify(resourceObj));
    return false;
  }
  // get the method object
  let methodObj = resourceObj.methods.find( methodItem => {
    return methodItem.method === method;
  });
  if( typeof methodObj === "undefined" || methodObj === null ) {
    console.log( "failed finding method in : ", JSON.stringify( methodObj ));
    return false;
  }
  // check if the user has access
  let permittedUser = methodObj.allow.find( userItem => {
    return userItem === userType.toUpperCase();
  });
  if( typeof permittedUser === "undefined" || permittedUser === null ) {
    console.log( "failed as user type not in method user type allow list" );
    return false;
  } else {
    return true;
  }
}; // end validateAccess

/**
 * This array stores an object for each API path with nested entries allowing simple lookup of permissions
 * YOU MUST REPLACE THIS WITH YOUR OWN STRUCTURE.
 */
const permissionsMatrix = [
  {
    path: "/hashTags",
    resources: [
      {
        resource: "/",
        methods: [
          {
            method: METHODS.GET,
            allow: [
              USER_TYPES.MEMBER,
              USER_TYPES.ADMIN,
              USER_TYPES.BRAND_ADMIN,
              USER_TYPES.ANONYMOUS,
              USER_TYPES.SYSTEM
            ]
          }
        ]
      },
      {
        resource: "/ping",
        methods: [
          {
            method: METHODS.GET,
            allow: [
              USER_TYPES.MEMBER,
              USER_TYPES.ADMIN,
              USER_TYPES.BRAND_ADMIN,
              USER_TYPES.ANONYMOUS,
              USER_TYPES.SYSTEM
            ]
          }
        ]
      },
      {
        resource: "/echo",
        methods: [
          {
            method: METHODS.POST,
            allow: [
              USER_TYPES.SYSTEM,
              USER_TYPES.ADMIN
            ]
          }
        ]
      }
    ]
  }
];