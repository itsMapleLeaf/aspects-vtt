import React from "react"

export interface RoomToolbarStore {
	activeTool: "Select" | "Draw"
	toggleDrawTool: () => void
	activateSelectTool: () => void
}

export function useRoomToolbarStore(): RoomToolbarStore {
	const [activeTool, setActiveTool] = React.useState<"Select" | "Draw">("Select")
	return {
		activeTool,
		toggleDrawTool() {
			setActiveTool(activeTool === "Draw" ? "Select" : "Draw")
		},
		activateSelectTool() {
			setActiveTool("Select")
		},
	}
}
