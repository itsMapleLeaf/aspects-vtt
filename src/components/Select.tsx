import * as Ariakit from "@ariakit/react"
import { LucideChevronDown } from "lucide-react"
import { type ReactNode } from "react"
import { formField, labelText } from "~/styles/forms.ts"
import { textInput } from "~/styles/input.ts"
import { menuItem, menuPanel } from "~/styles/menu.ts"

export interface SelectProps<T>
	extends Omit<Ariakit.SelectProps, "value" | "defaultValue"> {
	label: string
	options: SelectOption<T>[]
	value?: T
	defaultValue?: T
	onChangeValue?: (value: T) => void
}

export interface SelectOption<T> {
	value: T
	name?: ReactNode
	description?: ReactNode
	icon?: ReactNode
}

export function Select<T extends NonNullable<unknown>>({
	label,
	options,
	value: valueProp,
	defaultValue,
	onChangeValue,
	...props
}: SelectProps<T>) {
	const store = Ariakit.useSelectStore({
		value: valueProp?.toString(),
		defaultValue: defaultValue?.toString(),
		setValue: (value) => {
			const selectedItem = options.find(
				(option) => option.value.toString() === value,
			)
			if (selectedItem) {
				onChangeValue?.(selectedItem.value)
			}
		},
	})

	const value = Ariakit.useStoreState(store, "value")
	const selectedItem = options.find(
		(option) => option.value.toString() === value,
	)

	return (
		<div className={formField()}>
			<Ariakit.SelectProvider store={store}>
				<Ariakit.SelectLabel className={labelText()}>
					{label}
				</Ariakit.SelectLabel>
				<Ariakit.Select
					{...props}
					value={selectedItem?.value.toString()}
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
							key={item.value.toString()}
							id={item.value.toString()}
							value={item.value.toString()}
							className={menuItem()}
						>
							{item.icon && <span className="mr-2">{item.icon}</span>}
							<span>{item.name ?? item.value.toString()}</span>
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
