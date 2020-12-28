"use strict";

import {
  requirePropertiesMixin,
  freezePropertiesMixin,
  hashPasswordsMixin,
} from "./mixins";

export function userFactory({ uuid }) {
  return async ({
    userName,
    password,
    customerId,
    firstName,
    lastName,
    phone,
    email,
  } = {}) =>
    Object.freeze({
      userId: uuid(),
      password,
      userName,
      customerId,
      firstName,
      lastName,
      phone,
      email,
    });
}

export const userMixins = [
  requirePropertiesMixin("userName", "password", "firstName"),
  freezePropertiesMixin("userId", "userName"),
  hashPasswordsMixin("password"),
];

export function getUserSerializers({ decrypt }) {
  return [
    {
      on: "deserialize",
      key: "phone",
      type: "string",
      value: (key, value) => decrypt(value),
    },
    {
      on: "deserialize",
      key: "email",
      type: "string",
      value: (key, value) => decrypt(value),
    },
    {
      on: "deserialize",
      key: "lastName",
      type: "string",
      value: (key, value) => decrypt(value),
    },
  ];
}
