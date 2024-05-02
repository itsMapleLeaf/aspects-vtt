import { Emitter } from "../../common/emitter.ts"

export type RoomCommand = never

export const RoomCommandEvent = new Emitter<RoomCommand>()
