import { createContext, RefObject, use } from "react"
import { Vec } from "~/shared/vec.ts"

export type BattleMapStageInfo = {
	getViewportCenter: () => Vec
}

export const defaultStageInfo: BattleMapStageInfo = {
	getViewportCenter: () =>
		Vec.from([window.innerWidth, window.innerHeight]).divide(2),
}

export const BattleMapStageInfoContext = createContext<
	RefObject<BattleMapStageInfo>
>({
	current: defaultStageInfo,
})

export function useBattleMapStageInfo() {
	return use(BattleMapStageInfoContext)
}
