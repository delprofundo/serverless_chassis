const Joi = require("@hapi/joi");

const validate = ( schema, object, strip = true ) => {
  const { error, value } = schema.validate( object, { stripUnknown: strip } );
  if( error ) {
    throw new Error( error.details[0].message );
  }
  return value;
}; // end validate

const EVENT_TYPES = {
  FAKE_EVENT: "FAKE_EVENT"
};

const INTERESTING_GLOBAL_EVENTS = {
  FAKE_GLOBAL_EVENT: "FAKE_GLOBAL_EVENT"
};

const RECORD_TYPES = {
  FAKE_RECORD: "FAKE_RECORD"
};

const ERROR_TYPES = {

};

export const service_global_metadata = {
  ERROR_TYPES,
  EVENT_TYPES,
  INTERESTING_GLOBAL_EVENTS,
  RECORD_TYPES
};