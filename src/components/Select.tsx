import * as Ariakit from "@ariakit/react"
import { LucideChevronDown } from "lucide-react"
import { type ReactNode } from "react"
import { formField, labelText } from "~/styles/forms.ts"
import { textInput } from "~/styles/input.ts"
import { menuItem, menuPanel } from "~/styles/menu.ts"

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
					className={menuPanel()}
					gutter={8}
					portal
					unmountOnHide
				>
					{options.map((item) => (
						<Ariakit.SelectItem
							key={item.value}
							id={item.value}
							value={item.value}
							className={menuItem()}
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
