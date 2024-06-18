import { Emitter } from "../../lib/primitives/Emitter.ts"

export type RoomCommand = never

export const RoomCommandEvent = new Emitter<RoomCommand>()
