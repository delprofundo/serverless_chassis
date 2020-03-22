/********************************************
 * AUTH HARNESS PERMISSIONS MATRIX
 * simple matrix mapping permissions to functions in
 * this service.
 * 22 March 2018
 * delProfundo (@brunowatt)
 * bruno@hypermedia.tech
 ********************************************/
const SERVICE_BASE_PATH = process.env.SERVICE_BASE_PATH;

const CLIENT_TYPES = {
  GATEWAY: "GATEWAY", // a partner service that is directly integrated
  CLIENT: "CLIENT", // a user authenticed interface, cognito/s3/react for instance
  NODE: "NODE", // an internal component of our system
  LEAF: "LEAF", // semi-intelligent data source only (ie: iot device)
  ADMIN: "ADMIN",
  AUTH_ADMIN: "AUTH_ADMIN",
  SYSTEM: "SYSTEM"
};

const MEMBER_ROLES = {
  MEMBER: "MEMBER",
  BRAND_ADMIN: "BRAND_ADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  SYSTEM: "SYSTEM"
};

const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE"
};

/**
 * matrix interface, returns the effect clause of a IAM role
 * @param path
 * @param resource
 * @param method
 * @param memberRole
 * @param clientType
 * @returns {Promise<{effect: string}>}
 */
export async function validateAccess({ path, resource, method, memberRole, clientType }) {
  // this is to switch between users/clients
  console.log( "path", path);
  console.log( resource );
  console.log( method );
  console.log( memberRole );
  console.log( clientType );
  let effectiveEntity;
  if( memberRole ) {
    effectiveEntity = memberRole;
  } else if ( clientType ) {
    effectiveEntity = clientType;
  } else {
    console.log( "neither client or user type present, deny access" );
    return { effect: "deny" };
  }
  let pathObj = permissionsMatrix.find( pathItem => {
    return pathItem.path === path;
  });
  let resourceObj = pathObj.resources.find( resourceItem => {
    return resourceItem.resource === resource;
  });
  if( typeof resourceObj === "undefined" || resourceObj === null ) {
    return { effect: "deny" };
  }
  let methodObj = resourceObj.methods.find( methodItem => {
    return methodItem.method === method;
  });
  if( typeof methodObj === "undefined" || methodObj === null ) {
    return { effect: "deny" };
  }
  let deniedUser = methodObj.deny.find(denyItem => {
    return denyItem === effectiveEntity;
  });
  if (deniedUser === effectiveEntity) {
    return {effect: "deny"};
  }
  let permittedUser = methodObj.allow.find( accessItem => {
    return accessItem === effectiveEntity;
  });
  if( typeof permittedUser === "undefined" || permittedUser === null ) {
    console.log("failed as user type not in allow list");
    return { effect: "deny" };
  } else {
    return { effect: "allow" };
  }
}

/**
 * This array stores an object for each API path with nested entries allowing simple lookup of permissions
 */
const permissionsMatrix = [
  {
    path: `/${SERVICE_BASE_PATH}`,
    resources: [
      {
        resource: "/",
        methods: [
          {
            method: METHODS.GET,
            allow: [
              MEMBER_ROLES.MEMBER,
              MEMBER_ROLES.SYSTEM,
              MEMBER_ROLES.PLATFORM_ADMIN
            ],
            deny: [
            ]
          },
          {
            method: METHODS.POST,
            allow: [
              MEMBER_ROLES.MEMBER,
              MEMBER_ROLES.PLATFORM_ADMIN
            ],
            deny: [
            ]
          }
        ]
      },
      {
        resource: "/{id}",
        methods: [
          {
            method: METHODS.GET,
            allow: [
              MEMBER_ROLES.MEMBER,
              MEMBER_ROLES.SYSTEM,
              MEMBER_ROLES.PLATFORM_ADMIN
            ],
            deny: [
            ]
          }
        ]
      },
      {
        resource: "/{id}/finalize",
        methods: [
          {
            method: METHODS.PUT,
            allow: [
              MEMBER_ROLES.MEMBER
            ],
            deny: [
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
              MEMBER_ROLES.MEMBER
            ],
            deny: [
            ]
          }
        ]
      },
    ]
  }
];
