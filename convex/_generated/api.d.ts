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
import type * as api_ from "../api.js";
import type * as auth from "../auth.js";
import type * as characterAspectSkills from "../characterAspectSkills.js";
import type * as characters_CharacterModel from "../characters/CharacterModel.js";
import type * as characters_functions from "../characters/functions.js";
import type * as characters_types from "../characters/types.js";
import type * as dice_helpers from "../dice/helpers.js";
import type * as diceMacros_functions from "../diceMacros/functions.js";
import type * as env from "../env.js";
import type * as helpers_convex from "../helpers/convex.js";
import type * as helpers_effect from "../helpers/effect.js";
import type * as helpers_partial from "../helpers/partial.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as images_node from "../images_node.js";
import type * as items from "../items.js";
import type * as messages_functions from "../messages/functions.js";
import type * as messages_helpers from "../messages/helpers.js";
import type * as messages_types from "../messages/types.js";
import type * as migrate from "../migrate.js";
import type * as rooms_combat_functions from "../rooms/combat/functions.js";
import type * as rooms_combat_helpers from "../rooms/combat/helpers.js";
import type * as rooms_combat_types from "../rooms/combat/types.js";
import type * as rooms_functions from "../rooms/functions.js";
import type * as rooms_RoomModel from "../rooms/RoomModel.js";
import type * as scenes_functions from "../scenes/functions.js";
import type * as scenes_tokens_functions from "../scenes/tokens/functions.js";
import type * as scenes_tokens_types from "../scenes/tokens/types.js";
import type * as secrets from "../secrets.js";
import type * as storage from "../storage.js";
import type * as testing from "../testing.js";
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
  api: typeof api_;
  auth: typeof auth;
  characterAspectSkills: typeof characterAspectSkills;
  "characters/CharacterModel": typeof characters_CharacterModel;
  "characters/functions": typeof characters_functions;
  "characters/types": typeof characters_types;
  "dice/helpers": typeof dice_helpers;
  "diceMacros/functions": typeof diceMacros_functions;
  env: typeof env;
  "helpers/convex": typeof helpers_convex;
  "helpers/effect": typeof helpers_effect;
  "helpers/partial": typeof helpers_partial;
  http: typeof http;
  images: typeof images;
  images_node: typeof images_node;
  items: typeof items;
  "messages/functions": typeof messages_functions;
  "messages/helpers": typeof messages_helpers;
  "messages/types": typeof messages_types;
  migrate: typeof migrate;
  "rooms/combat/functions": typeof rooms_combat_functions;
  "rooms/combat/helpers": typeof rooms_combat_helpers;
  "rooms/combat/types": typeof rooms_combat_types;
  "rooms/functions": typeof rooms_functions;
  "rooms/RoomModel": typeof rooms_RoomModel;
  "scenes/functions": typeof scenes_functions;
  "scenes/tokens/functions": typeof scenes_tokens_functions;
  "scenes/tokens/types": typeof scenes_tokens_types;
  secrets: typeof secrets;
  storage: typeof storage;
  testing: typeof testing;
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
