'use strict'
import onUpdate from './on-update';

import {
  requirePropertiesMixin,
  freezePropertiesMixin,
  hashPasswordsMixin
} from './mixins'

/**
 * @type {import('./index').ModelConfig}
 */
export default {

  modelName: 'user',
  factory: ({ uuid }) => {

    return function createUser({
      userName,
      password,
      firstName,
      lastName,
      email
    } = {}) {

      return Object.freeze({
        userId: uuid(),
        password,
        userName,
        firstName,
        lastName,
        email
      });
    }
  },
  mixins: [
    requirePropertiesMixin(
      'userName',
      'password',
      'firstName'
    ),
    freezePropertiesMixin(
      'userId',
      'userName'
    ),
    hashPasswordsMixin(
      'password'
    )
  ],

  ...onUpdate

}


