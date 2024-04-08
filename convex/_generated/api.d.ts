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
import type * as CharacterModel from "../CharacterModel.js";
import type * as characters from "../characters.js";
import type * as crons from "../crons.js";
import type * as env from "../env.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as migrations from "../migrations.js";
import type * as notionImports from "../notionImports.js";
import type * as resultResponse from "../resultResponse.js";
import type * as RoomModel from "../RoomModel.js";
import type * as rooms from "../rooms.js";
import type * as storage from "../storage.js";
import type * as token from "../token.js";
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
  CharacterModel: typeof CharacterModel;
  characters: typeof characters;
  crons: typeof crons;
  env: typeof env;
  helpers: typeof helpers;
  http: typeof http;
  messages: typeof messages;
  migrations: typeof migrations;
  notionImports: typeof notionImports;
  resultResponse: typeof resultResponse;
  RoomModel: typeof RoomModel;
  rooms: typeof rooms;
  storage: typeof storage;
  token: typeof token;
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
