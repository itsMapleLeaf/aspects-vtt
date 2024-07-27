import {
	LucideBicepsFlexed,
	LucideEye,
	LucideLightbulb,
	LucideSparkles,
	LucideWind,
} from "lucide-react"
import type { Attribute } from "~/modules/attributes/data.ts"

export function AttributeIcon({ id }: { id: Attribute["id"] }) {
	return {
		strength: <LucideBicepsFlexed />,
		mobility: <LucideWind />,
		sense: <LucideEye />,
		intellect: <LucideLightbulb />,
		wit: <LucideSparkles />,
	}[id]
}
