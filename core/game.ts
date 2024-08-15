import { P, match } from "ts-pattern"
import { omit } from "../common/object.ts"

export * as AspectsGameState from "./game.ts"

export interface Game {
	characters: Record<string, Character>
	scenes: Record<string, Scene>
	currentSceneId: string | null
	time: number // in-game hours since the beginning of time
}

export interface Character {
	id: string
	name: string
	health: number
	resolve: number
}

export interface Scene {
	id: string
	actors: Record<string, SceneActor>
}

export interface SceneActor {
	id: string
	characterId: string
	position: Vector
	size: Vector
}

export interface Vector {
	x: number
	y: number
}

export const initialGame: Game = {
	characters: {},
	scenes: {},
	currentSceneId: null,
	time: 0,
}

export type GameEvent =
	| { type: "characters:add"; character: Omit<Character, "id"> }
	| {
			type: "characters:update"
			characterId: string
			props: Partial<Omit<Character, "id">>
	  }
	| { type: "characters:remove"; characterId: string }
	| { type: "scenes:add"; scene: Omit<Scene, "id"> }
	| {
			type: "scenes:update"
			sceneId: string
			props: Partial<Omit<Scene, "id">>
	  }
	| { type: "scenes:remove"; sceneId: string }
	| { type: "currentScene:set"; sceneId: string }
	| { type: "currentScene:actors:add"; actor: Omit<SceneActor, "id"> }
	| {
			type: "currentScene:actors:update"
			actorId: string
			props: Partial<SceneActor>
	  }
	| { type: "currentScene:actors:remove"; actorId: string }
	| { type: "time:set"; time: number }

export function transition(state: Game, event: GameEvent): Game {
	const currentScene =
		state.currentSceneId ? state.scenes[state.currentSceneId] : null

	return {
		characters: match(event)
			.with({ type: "characters:add" }, (event) => {
				const id = crypto.randomUUID()
				return { ...state.characters, [id]: { ...event.character, id } }
			})
			.with({ type: "characters:remove" }, (event) => {
				return omit(state.characters, [event.characterId])
			})
			.with({ type: "characters:update" }, (event) => {
				const character = state.characters[event.characterId]
				return character ?
						{
							...state.characters,
							[event.characterId]: { ...character, ...event.props },
						}
					:	state.characters
			})
			.otherwise(() => state.characters),

		scenes: match([event, currentScene])
			.with([{ type: "scenes:add" }, P._], ([event]) => {
				const id = crypto.randomUUID()
				return { ...state.scenes, [id]: { ...event.scene, id } }
			})
			.with([{ type: "scenes:remove" }, P._], ([event]) => {
				return omit(state.scenes, [event.sceneId])
			})
			.with([{ type: "scenes:update" }, P._], ([event]) => {
				const scene = state.scenes[event.sceneId]
				return scene ?
						{
							...state.scenes,
							[event.sceneId]: { ...scene, ...event.props },
						}
					:	state.scenes
			})
			.with(
				[{ type: P.string.startsWith("currentScene:") }, P.nonNullable],
				([event, scene]) => ({
					...state.scenes,
					[scene.id]: transitionCurrentScene(event, scene),
				}),
			)
			.otherwise(() => state.scenes),

		currentSceneId: match(event)
			.with({ type: "currentScene:set" }, (event) => event.sceneId)
			.otherwise(() => state.currentSceneId),

		time: match(event)
			.with({ type: "time:set" }, (event) => event.time)
			.otherwise(() => state.time),
	}
}

export function transitionCurrentScene(event: GameEvent, scene: Scene): Scene {
	return match(event)
		.with({ type: "currentScene:actors:add" }, (event) => {
			const id = crypto.randomUUID()
			return {
				...scene,
				actors: {
					...scene.actors,
					[id]: { ...event.actor, id },
				},
			}
		})
		.with({ type: "currentScene:actors:remove" }, (event) => {
			return {
				...scene,
				actors: omit(scene.actors, [event.actorId]),
			}
		})
		.otherwise(() => scene)
}
