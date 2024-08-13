import * as Lucide from "lucide-react"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import type { StrictOmit } from "../../../common/types.ts"
import { panel } from "../../ui/styles.ts"
import { diceKinds } from "./data.tsx"

export function DiceCounter({
	value,
	onChange,
	...props
}: StrictOmit<ComponentProps<"ul">, "onChange"> & {
	value: Record<string, number>
	onChange: (value: Record<string, number>) => void
}) {
	const update = (name: string, delta: number) => {
		onChange({ ...value, [name]: (value[name] ?? 0) + delta })
	}

	return (
		<ul {...props} className={twMerge("grid grid-cols-2 gap-2", props.className)}>
			{diceKinds
				.map((kind) => ({ kind, count: value[kind.name] ?? 0 }))
				.map(({ kind, count }) => (
					<li
						key={kind.name}
						data-selected={count > 0}
						className={panel(
							"flex items-center justify-center px-3 py-1 transition gap-2 *:data-[selected=false]:opacity-50",
						)}
					>
						<div className="flex flex-col">
							<button
								type="button"
								title={`Add a ${kind.name}`}
								className="-m-2 flex items-center justify-center p-2 opacity-50 transition hover:opacity-75 active:text-primary-700 active:opacity-100 active:duration-0"
								onClick={() => update(kind.name, 1)}
							>
								<Lucide.ChevronUp />
							</button>
							<button
								type="button"
								title={`Add a ${kind.name}`}
								className="-mx-2 flex items-center justify-center px-2 opacity-50 transition hover:opacity-75 active:text-primary-700 active:opacity-100 active:duration-0"
								onClick={() => update(kind.name, -1)}
							>
								<Lucide.ChevronDown />
							</button>
						</div>

						<p className="text-center text-xl font-medium tabular-nums">{count}</p>

						<button
							type="button"
							className="transition *:size-12 hover:brightness-75 active:brightness-125 active:duration-0"
							title={`Click to add a ${kind.name}, right-click to remove`}
							onClick={() => update(kind.name, 1)}
							onContextMenu={(event) => {
								event.preventDefault()
								update(kind.name, -1)
							}}
						>
							<kind.Component />
						</button>
					</li>
				))}
		</ul>
	)
}
