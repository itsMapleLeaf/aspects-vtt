import { createContext, RefObject, use } from "react"
import { Vec } from "~/shared/vec.ts"

export type BattleMapStageInfo = {
	getViewportCenter: () => { x: number; y: number }
}

export const defaultStageInfo: BattleMapStageInfo = {
	getViewportCenter: () =>
		Vec.from([window.innerWidth, window.innerHeight]).dividedBy(2).toJSON(),
}

export const BattleMapStageInfoContext = createContext<
	RefObject<BattleMapStageInfo>
>({
	current: defaultStageInfo,
})

export function useBattleMapStageInfo() {
	return use(BattleMapStageInfoContext)
}
