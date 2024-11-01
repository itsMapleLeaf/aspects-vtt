import * as Ariakit from "@ariakit/react"
import { LucideChevronDown } from "lucide-react"
import { type ReactNode } from "react"
import { formField, labelText } from "~/styles/forms.ts"
import { textInput } from "~/styles/input.ts"
import { menuItem, menuPanel } from "~/styles/menu.ts"

export interface SelectProps<Value extends string>
	extends Omit<Ariakit.SelectProps, "value" | "defaultValue"> {
	label: string
	options: SelectOption[]
	value?: Value
	defaultValue?: Value
	onChangeValue?: (value: Value) => void
}

export interface SelectOption {
	name?: ReactNode
	description?: ReactNode
	icon?: ReactNode
	value: string
}

export function Select<const Value extends string>({
	label,
	options,
	value: valueProp,
	defaultValue,
	onChangeValue,
	...props
}: SelectProps<Value>) {
	const store = Ariakit.useSelectStore({
		value: valueProp,
		defaultValue,
		setValue: onChangeValue,
	})

	const value = Ariakit.useStoreState(store, "value")
	const selectedItem = options.find(
		(option) => option.value.toString() === value,
	)

	return (
		<div className={formField(props.className)}>
			<Ariakit.SelectProvider store={store}>
				<Ariakit.SelectLabel className={labelText()}>
					{label}
				</Ariakit.SelectLabel>
				<Ariakit.Select
					{...props}
					value={selectedItem?.value}
					className={textInput("!flex items-center text-start gap-1.5")}
				>
					<span className="flex-1">{selectedItem?.name ?? "Choose one"}</span>
					<LucideChevronDown />
				</Ariakit.Select>
				<Ariakit.SelectPopover
					className={menuPanel("max-w-2xl")}
					gutter={8}
					portal
					unmountOnHide
				>
					{options.map((item) => (
						<Ariakit.SelectItem
							key={item.value}
							value={item.value}
							className={menuItem("flex !h-fit flex-col items-start py-1.5")}
						>
							<div className="flex gap-2">
								{item.icon && <span className="mr-2">{item.icon}</span>}
								<span>{item.name ?? item.value.toString()}</span>
							</div>
							{item.description && (
								<span className="text-sm font-medium tracking-wide text-primary-300">
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
