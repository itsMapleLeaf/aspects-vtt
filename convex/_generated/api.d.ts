/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.10.0.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as characters from "../characters.js";
import type * as diceRolls from "../diceRolls.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as mapTokens from "../mapTokens.js";
import type * as rooms from "../rooms.js";
import type * as sessions from "../sessions.js";
import type * as storage from "../storage.js";
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
  characters: typeof characters;
  diceRolls: typeof diceRolls;
  http: typeof http;
  images: typeof images;
  mapTokens: typeof mapTokens;
  rooms: typeof rooms;
  sessions: typeof sessions;
  storage: typeof storage;
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
