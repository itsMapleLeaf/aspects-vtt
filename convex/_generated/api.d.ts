/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.13.0.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_context from "../lib/context.js";
import type * as lib_db from "../lib/db.js";
import type * as lib_effect from "../lib/effect.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_storage from "../lib/storage.js";
import type * as lib_validators from "../lib/validators.js";
import type * as rooms from "../rooms.js";
import type * as scenes from "../scenes.js";
import type * as secrets from "../secrets.js";
import type * as users from "../users.js";

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
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/context": typeof lib_context;
  "lib/db": typeof lib_db;
  "lib/effect": typeof lib_effect;
  "lib/functions": typeof lib_functions;
  "lib/storage": typeof lib_storage;
  "lib/validators": typeof lib_validators;
  rooms: typeof rooms;
  scenes: typeof scenes;
  secrets: typeof secrets;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
