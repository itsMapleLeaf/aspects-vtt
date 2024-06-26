import { createStore } from "../../helpers/react/store.tsx"

export const RoomTool = {
	Select: "Select",
	Draw: "Draw",
} as const

interface State {
	activeTool: (typeof RoomTool)[keyof typeof RoomTool]
}

const initialState: State = {
	activeTool: RoomTool.Select,
}

export const RoomToolbarStore = createStore({
	state: initialState,
	actions: (setState) => ({
		toggleDrawTool() {
			setState((state) => ({
				...state,
				activeTool: state.activeTool !== RoomTool.Draw ? RoomTool.Draw : RoomTool.Select,
			}))
		},
		enableSelectTool() {
			setState((state) => ({
				...state,
				activeTool: RoomTool.Select,
			}))
		},
	}),
	context: (state) => state,
})
