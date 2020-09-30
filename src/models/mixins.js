import crypto from 'crypto';
import { hash, encrypt } from './utils';

/**
 * @callback mixinFunction
 * @param {Object} o Object to compose
 * @returns {Object} Composed object
 */

/**
 * @callback functionalMixinFactory
 * @param {*} mixinFunctionParams params for mixin function 
 * @returns {mixinFunction}
 */

/**
 * 
 * @param {*} o Object to compose
 * @param {*} name `Function.name` 
 * @param {function(): (o:any) => any} cb functional mixin
 */
function preUpdateMixins(o, name, cb) {
  const preUpdateMixins = o.preUpdateMixins || new Map();
  preUpdateMixins.toJSON = () => void 0; // don't print this

  if (!preUpdateMixins.has(name)) {
    preUpdateMixins.set(name, cb());
    return {
      ...o,
      preUpdateMixins
    }
  }
  return o;
}

/**
 * Functional mixin that encrypts the properties specified in `propNames`  
 * @param  {...string} propNames - The properties to encrypt
 */
const encryptProperties = (...propNames) => (o) => {
  const encryptProps = () => {
    return propNames.map(p => o[p]
      ? { [p]: encrypt(o[p]) }
      : {})
      .reduce((p, c) => ({ ...c, ...p }));
  }

  const mixins = preUpdateMixins(
    o,
    encryptProperties.name,
    () => encryptProperties(...propNames)
  );

  return {
    ...mixins,
    ...encryptProps()
  }
}

/**
 * Functional mixin that prevents properties from being updated
 * @param {boolean} isUpdate - only execute when true
 * @param  {...string} propNames - names of properties to freeze
 */
const freezeProperties = (isUpdate, ...propNames) => (o) => {
  const preventUpdates = () => {
    const intersection = Object.keys(o)
      .filter(key => propNames.includes(key));

    if (intersection?.length > 0) {
      throw new Error(`cannot update readonly properties: ${intersection}`);
    }
  }

  if (isUpdate) {
    preventUpdates();
  }

  return preUpdateMixins(o, freezeProperties.name, () => {
    return freezeProperties(true, ...propNames)
  });
}

/** 
 * Functional mixin that enforces required fields 
 * @param  {...string} propNames - required property names
 */
const requireProperties = (...propNames) => (o) => {
  const missing = propNames.filter(key => !o[key]);
  if (missing?.length > 0) {
    throw new Error(`missing required properties: ${missing}`);
  }
  return o;
}

const hashPasswords = (hash, ...propNames) => (o) => {
  function hashPwds() {
    return propNames.map(p => o[p]
      ? { [p]: hash(o[p]) }
      : {})
      .reduce((p, c) => ({ ...c, ...p }));
  }

  const mixins = preUpdateMixins(
    o,
    hashPasswords.name,
    () => hashPasswords(hash, ...propNames)
  );

  return {
    ...mixins,
    ...hashPwds()
  }
}

export function requirePropertiesMixin(...propNames) {
  return requireProperties(...propNames);
}

export function freezePropertiesMixin(...propNames) {
  return freezeProperties(false, ...propNames);
}

export function encryptPropertiesMixin(...propNames) {
  return encryptProperties(...propNames);
}

export function hashPasswordsMixin(...propNames) {
  return hashPasswords(hash, ...propNames);
}

// Implement GDPR across models
const encryptPersonalInfo = encryptProperties(
  'lastName',
  'address',
  'email',
  'phone',
  'mobile',
  'creditCard',
  'ccv',
  'ssn'
);

/**
 * Global mixins
 */
const GlobalMixins = [
  encryptPersonalInfo
];

export default GlobalMixins;


