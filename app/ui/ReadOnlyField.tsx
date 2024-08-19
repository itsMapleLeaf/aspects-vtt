import { LucideBan } from "lucide-react"
import type { ReactNode } from "react"
import { FormField } from "./Form.tsx"
import { Tooltip } from "./Tooltip.tsx"
import { panel } from "./styles.ts"

export function ReadOnlyField({
	label,
	value,
}: {
	label: ReactNode
	value: ReactNode
}) {
	return (
		<FormField label={label}>
			<div
				className={panel(
					"flex items-center justify-between bg-primary-700/30 py-2 pl-3 pr-2 gap-1.5",
				)}
			>
				<p className="min-w-0 flex-1 whitespace-pre-wrap break-words">
					{value}
				</p>
				<Tooltip
					content="Read-only"
					className="-m-2 rounded p-2 opacity-25 transition-opacity hover:opacity-50 focus-visible:opacity-50"
				>
					<button type="button">
						<LucideBan className="size-4" aria-hidden />
						<span className="sr-only">Read-only</span>
					</button>
				</Tooltip>
			</div>
		</FormField>
	)
}
