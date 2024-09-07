import { FunctionReturnType } from "convex/server"
import React from "react"
import * as v from "valibot"
import { api } from "../../../convex/_generated/api.js"

export type ApiRoom = NonNullable<
	FunctionReturnType<typeof api.functions.rooms.get>
>

export type PanelLocation = v.InferOutput<typeof panelLocationSchema>
export const panelLocationSchema = v.object({
	sidebar: v.union([v.literal("left"), v.literal("right")]),
	group: v.number(),
})

export interface PanelProperties {
	title: string
	icon: React.ReactNode
	content: React.ReactNode
	defaultLocation: PanelLocation
}

export interface Panel extends PanelProperties {
	id: string
}

export type Sidebar = "left" | "right"
