import * as Ariakit from "@ariakit/react"
import { LucideChevronDown } from "lucide-react"
import { type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { formField, labelText } from "~/styles/forms.ts"
import { textInput } from "~/styles/input.ts"
import { panel } from "~/styles/panel.ts"
import { fadeZoomTransition } from "~/styles/transitions.ts"

export interface SelectProps extends Ariakit.SelectProps {
	label: string
	options: SelectOption[]
	value?: string
	defaultValue?: string
}

export interface SelectOption {
	value: string
	name?: ReactNode
	description?: ReactNode
	icon?: ReactNode
}

export function Select({
	label,
	options,
	defaultValue,
	...props
}: SelectProps) {
	const store = Ariakit.useSelectStore({
		defaultValue,
	})

	const value = Ariakit.useStoreState(store, "value")
	const selectedItem = options.find((option) => option.value === value)

	return (
		<div className={formField()}>
			<Ariakit.SelectProvider store={store}>
				<Ariakit.SelectLabel className={labelText()}>
					{label}
				</Ariakit.SelectLabel>
				<Ariakit.Select
					{...props}
					className={textInput(
						"!flex items-center text-start gap-1.5",
						props.className,
					)}
				>
					<span className="flex-1">{selectedItem?.name ?? "Choose one"}</span>
					<LucideChevronDown />
				</Ariakit.Select>
				<Ariakit.SelectPopover
					className={twMerge(
						panel(),
						fadeZoomTransition(),
						"flex w-[--popover-anchor-width] min-w-56 max-w-lg flex-col rounded-md border border-primary-600 bg-primary-700 p-gap shadow-md gap-1",
					)}
					gutter={8}
					portal
					unmountOnHide
				>
					{options.map((item) => (
						<Ariakit.SelectItem
							key={item.value}
							id={item.value}
							value={item.value}
							className={twMerge(
								"flex h-control-md cursor-default items-center rounded transition hover:bg-primary-600 data-[active-item]:bg-primary-600",
								// this scary class ensures the item padding
								// always aligns with control padding,
								// with respect to the popover side padding
								"px-[calc(theme(spacing.control-padding-md)-(theme(spacing.1)))]",
							)}
						>
							{item.icon && <span className="mr-2">{item.icon}</span>}
							<span>{item.name ?? item.value}</span>
							{item.description && (
								<span className="ml-2 text-sm font-medium tracking-wide text-primary-300">
									{item.description}
								</span>
							)}
						</Ariakit.SelectItem>
					))}
				</Ariakit.SelectPopover>
			</Ariakit.SelectProvider>
		</div>
	)
}
