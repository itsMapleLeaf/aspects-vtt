import { LucideBan } from "lucide-react"
import type { ReactNode } from "react"
import { FormField } from "./Form.tsx"
import { panel } from "./styles.ts"
import { Tooltip } from "./Tooltip.tsx"

export function ReadOnlyField({ label, value }: { label: ReactNode; value: ReactNode }) {
	return (
		<FormField label={label}>
			<div
				className={panel(
					"flex items-center justify-between gap-1.5 bg-primary-300/30 py-2 pl-3 pr-2",
				)}
			>
				<p className="min-w-0 flex-1 whitespace-pre-wrap break-words">{value}</p>
				<Tooltip
					content="Read-only"
					className="-m-2 rounded p-2 opacity-25 transition-opacity hover:opacity-50 focus-visible:opacity-50"
				>
					<button>
						<LucideBan className="size-4" aria-hidden />
						<span className="sr-only">Read-only</span>
					</button>
				</Tooltip>
			</div>
		</FormField>
	)
}
