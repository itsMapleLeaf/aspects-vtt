/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.11.3.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth_functions from "../auth/functions.js";
import type * as auth_helpers from "../auth/helpers.js";
import type * as characters_CharacterModel from "../characters/CharacterModel.js";
import type * as characters_functions from "../characters/functions.js";
import type * as crons from "../crons.js";
import type * as diceMacros_functions from "../diceMacros/functions.js";
import type * as env from "../env.js";
import type * as helpers_convex from "../helpers/convex.js";
import type * as helpers_effect from "../helpers/effect.js";
import type * as http from "../http.js";
import type * as messages_functions from "../messages/functions.js";
import type * as migrations from "../migrations.js";
import type * as notionImports_functions from "../notionImports/functions.js";
import type * as rooms_combat_functions from "../rooms/combat/functions.js";
import type * as rooms_combat_helpers from "../rooms/combat/helpers.js";
import type * as rooms_functions from "../rooms/functions.js";
import type * as rooms_RoomModel from "../rooms/RoomModel.js";
import type * as scenes_functions from "../scenes/functions.js";
import type * as scenes_tokens_functions from "../scenes/tokens/functions.js";
import type * as scenes_types from "../scenes/types.js";
import type * as storage_functions from "../storage/functions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/functions": typeof auth_functions;
  "auth/helpers": typeof auth_helpers;
  "characters/CharacterModel": typeof characters_CharacterModel;
  "characters/functions": typeof characters_functions;
  crons: typeof crons;
  "diceMacros/functions": typeof diceMacros_functions;
  env: typeof env;
  "helpers/convex": typeof helpers_convex;
  "helpers/effect": typeof helpers_effect;
  http: typeof http;
  "messages/functions": typeof messages_functions;
  migrations: typeof migrations;
  "notionImports/functions": typeof notionImports_functions;
  "rooms/combat/functions": typeof rooms_combat_functions;
  "rooms/combat/helpers": typeof rooms_combat_helpers;
  "rooms/functions": typeof rooms_functions;
  "rooms/RoomModel": typeof rooms_RoomModel;
  "scenes/functions": typeof scenes_functions;
  "scenes/tokens/functions": typeof scenes_tokens_functions;
  "scenes/types": typeof scenes_types;
  "storage/functions": typeof storage_functions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
