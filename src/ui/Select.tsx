import * as Ariakit from "@ariakit/react"
import { LucideChevronDown } from "lucide-react"
import { menuItemStyle, menuPanelStyle } from "./menu.tsx"
import { labelText, panel } from "./styles.ts"

export interface SelectProps<Value extends string> {
	name?: string
	label: string
	value?: Value
	defaultValue?: Value
	onValueChange?: (value: Value) => void
	options: readonly SelectOption<Value>[]
}

export interface SelectOption<Value extends string> {
	value: Value
	label: string
	icon: React.ReactNode
}

export function Select<const Value extends string>({
	name,
	label,
	value,
	defaultValue,
	onValueChange,
	options,
}: SelectProps<Value>) {
	return (
		<div>
			<Ariakit.SelectProvider
				value={value}
				defaultValue={defaultValue}
				setValue={onValueChange}
			>
				<Ariakit.SelectLabel className={labelText("mb-1 leading-4")}>
					{label}
				</Ariakit.SelectLabel>
				<Ariakit.Select
					name={name}
					className={panel(
						"flex h-10 w-full items-center justify-start bg-primary-900 px-3 text-start shadow-none transition gap-1 hover:bg-primary-800 active:bg-primary-700 active:duration-0",
					)}
				>
					<span className="min-w-0 flex-1 truncate leading-none">
						<Ariakit.SelectValue>
							{(value) =>
								options.find((option) => option.value === value)?.label
							}
						</Ariakit.SelectValue>
					</span>
					<LucideChevronDown className="size-5" />
				</Ariakit.Select>
				<Ariakit.SelectPopover className={menuPanelStyle()} gutter={8}>
					<Ariakit.SelectList>
						{options.map((option) => (
							<Ariakit.SelectItem
								key={option.value}
								value={option.value}
								className={menuItemStyle()}
							>
								{option.icon}
								{option.label}
							</Ariakit.SelectItem>
						))}
					</Ariakit.SelectList>
				</Ariakit.SelectPopover>
			</Ariakit.SelectProvider>
		</div>
	)
}
