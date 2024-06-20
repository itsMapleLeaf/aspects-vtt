/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.12.1.
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
import type * as characterAspectSkills_functions from "../characterAspectSkills/functions.js";
import type * as characterAspectSkills_types from "../characterAspectSkills/types.js";
import type * as characters_CharacterModel from "../characters/CharacterModel.js";
import type * as characters_functions from "../characters/functions.js";
import type * as characters_helpers from "../characters/helpers.js";
import type * as characters_types from "../characters/types.js";
import type * as dice_helpers from "../dice/helpers.js";
import type * as diceMacros_functions from "../diceMacros/functions.js";
import type * as diceMacros_types from "../diceMacros/types.js";
import type * as env from "../env.js";
import type * as helpers_convex from "../helpers/convex.js";
import type * as helpers_effect from "../helpers/effect.js";
import type * as http from "../http.js";
import type * as messages_functions from "../messages/functions.js";
import type * as messages_helpers from "../messages/helpers.js";
import type * as messages_types from "../messages/types.js";
import type * as rooms_combat_functions from "../rooms/combat/functions.js";
import type * as rooms_combat_helpers from "../rooms/combat/helpers.js";
import type * as rooms_combat_types from "../rooms/combat/types.js";
import type * as rooms_functions from "../rooms/functions.js";
import type * as rooms_helpers from "../rooms/helpers.js";
import type * as rooms_RoomModel from "../rooms/RoomModel.js";
import type * as rooms_types from "../rooms/types.js";
import type * as scenes_functions from "../scenes/functions.js";
import type * as scenes_tokens_functions from "../scenes/tokens/functions.js";
import type * as scenes_tokens_types from "../scenes/tokens/types.js";
import type * as scenes_types from "../scenes/types.js";
import type * as storage_functions from "../storage/functions.js";
import type * as types from "../types.js";
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
  "auth/functions": typeof auth_functions;
  "auth/helpers": typeof auth_helpers;
  "characterAspectSkills/functions": typeof characterAspectSkills_functions;
  "characterAspectSkills/types": typeof characterAspectSkills_types;
  "characters/CharacterModel": typeof characters_CharacterModel;
  "characters/functions": typeof characters_functions;
  "characters/helpers": typeof characters_helpers;
  "characters/types": typeof characters_types;
  "dice/helpers": typeof dice_helpers;
  "diceMacros/functions": typeof diceMacros_functions;
  "diceMacros/types": typeof diceMacros_types;
  env: typeof env;
  "helpers/convex": typeof helpers_convex;
  "helpers/effect": typeof helpers_effect;
  http: typeof http;
  "messages/functions": typeof messages_functions;
  "messages/helpers": typeof messages_helpers;
  "messages/types": typeof messages_types;
  "rooms/combat/functions": typeof rooms_combat_functions;
  "rooms/combat/helpers": typeof rooms_combat_helpers;
  "rooms/combat/types": typeof rooms_combat_types;
  "rooms/functions": typeof rooms_functions;
  "rooms/helpers": typeof rooms_helpers;
  "rooms/RoomModel": typeof rooms_RoomModel;
  "rooms/types": typeof rooms_types;
  "scenes/functions": typeof scenes_functions;
  "scenes/tokens/functions": typeof scenes_tokens_functions;
  "scenes/tokens/types": typeof scenes_tokens_types;
  "scenes/types": typeof scenes_types;
  "storage/functions": typeof storage_functions;
  types: typeof types;
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
