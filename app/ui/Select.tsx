import * as Ariakit from "@ariakit/react"
import * as Lucide from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "./Button.tsx"
import { FormField } from "./Form.tsx"
import { menuItemStyle, menuPanelStyle } from "./Menu.tsx"

export type SelectOption<T> =
	| { id?: string | undefined; label: ReactNode; value: Extract<T, string> }
	| { id: string; label: ReactNode; value: T }

export function Select<T>(props: {
	label: ReactNode
	value: T | undefined
	options: SelectOption<T>[]
	placeholder?: ReactNode
	onChange: (value: T) => void
	className?: string
}) {
	const currentOption = props.options.find((it) => it.value === props.value)

	function getOptionId(option: SelectOption<T>) {
		return "id" in option ? option.id : option.value
	}

	return (
		<Ariakit.SelectProvider
			value={currentOption && getOptionId(currentOption)}
			setValue={(id) => {
				const option = props.options.find((it) => id === getOptionId(it))
				if (option) props.onChange(option.value)
			}}
		>
			<FormField
				label={<Ariakit.SelectLabel>{props.label}</Ariakit.SelectLabel>}
				className={props.className}
			>
				<Button
					icon={<Lucide.ChevronDown />}
					text={
						currentOption?.label ?? (
							<span className="opacity-50">{props.placeholder ?? "Choose one"}</span>
						)
					}
					element={<Ariakit.Select />}
					className="w-full flex-row-reverse justify-between"
				/>
			</FormField>
			<Ariakit.SelectPopover portal gutter={8} sameWidth className={menuPanelStyle()}>
				{props.options.map((option) => (
					<Ariakit.SelectItem
						key={getOptionId(option)}
						value={getOptionId(option)}
						className={menuItemStyle()}
					>
						{option.label}
					</Ariakit.SelectItem>
				))}
			</Ariakit.SelectPopover>
		</Ariakit.SelectProvider>
	)
}
