import { Emitter } from "../../helpers/Emitter.ts"

export type RoomCommand = never

export const RoomCommandEvent = new Emitter<RoomCommand>()
