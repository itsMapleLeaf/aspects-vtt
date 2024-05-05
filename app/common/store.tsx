import * as React from "react"
import { useEffectEvent } from "./react.ts"

export function createStore<State, Actions, ContextValue>(options: {
	state: State
	actions: (setState: React.Dispatch<React.SetStateAction<State>>, getState: () => State) => Actions
	context: (state: State) => ContextValue
}) {
	const StateContext = React.createContext(options.context(options.state))

	const ActionsContext = React.createContext(
		options.actions(
			() => {},
			() => options.state,
		),
	)

	function Provider({ children }: { children: React.ReactNode }) {
		const [state, setState] = React.useState(options.state)
		const getState = useEffectEvent(() => state)

		const actions = React.useMemo(
			() => options.actions(setState, getState),
			[options.actions, getState],
		)

		return (
			<StateContext.Provider value={options.context(state)}>
				<ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
			</StateContext.Provider>
		)
	}

	function useStoreState() {
		return React.useContext(StateContext)
	}

	function useStoreActions() {
		return React.useContext(ActionsContext)
	}

	return {
		Provider,
		useState: useStoreState,
		useActions: useStoreActions,
	}
}

export type StoreState<S> = S extends { useState(): unknown } ? ReturnType<S["useState"]> : never

export type StoreActions<S> = S extends { useActions(): unknown }
	? ReturnType<S["useActions"]>
	: never
