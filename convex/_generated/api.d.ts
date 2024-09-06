/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as functions_characters from "../functions/characters.js";
import type * as functions_rooms from "../functions/rooms.js";
import type * as functions_scenes from "../functions/scenes.js";
import type * as functions_storage from "../functions/storage.js";
import type * as functions_users from "../functions/users.js";
import type * as http from "../http.js";
import type * as lib_api from "../lib/api.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_secrets from "../lib/secrets.js";
import type * as lib_storage from "../lib/storage.js";
import type * as lib_testing from "../lib/testing.js";
import type * as lib_utils from "../lib/utils.js";
import type * as lib_validators from "../lib/validators.js";
import type * as test_functions from "../test/functions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "functions/characters": typeof functions_characters;
  "functions/rooms": typeof functions_rooms;
  "functions/scenes": typeof functions_scenes;
  "functions/storage": typeof functions_storage;
  "functions/users": typeof functions_users;
  http: typeof http;
  "lib/api": typeof lib_api;
  "lib/auth": typeof lib_auth;
  "lib/errors": typeof lib_errors;
  "lib/secrets": typeof lib_secrets;
  "lib/storage": typeof lib_storage;
  "lib/testing": typeof lib_testing;
  "lib/utils": typeof lib_utils;
  "lib/validators": typeof lib_validators;
  "test/functions": typeof test_functions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
