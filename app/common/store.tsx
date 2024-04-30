import * as React from "react"

export function createStore<State, Actions, ContextValue>(options: {
	state: State
	actions: (setState: React.Dispatch<React.SetStateAction<State>>) => Actions
	context: (state: State) => ContextValue
}) {
	const StateContext = React.createContext(options.context(options.state))
	const ActionsContext = React.createContext(options.actions(() => {}))

	function Provider({ children }: { children: React.ReactNode }) {
		const [state, setState] = React.useState(options.state)
		const actions = React.useMemo(() => options.actions(setState), [options.actions])
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
