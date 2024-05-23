import * as Ariakit from "@ariakit/react"
import * as Lucide from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { Button } from "./Button.tsx"
import { FormField } from "./Form.tsx"
import { LoadingDecoration } from "./LoadingDecoration.tsx"
import { menuItemStyle, menuPanelStyle } from "./Menu.tsx"
import { type EditableProps, useEditable } from "./useEditable.tsx"

export type SelectOption<T> =
	| {
			id?: string | undefined
			value: Extract<T, string>
			label: ReactNode
			icon?: ReactNode
	  }
	| {
			id: string
			value: T
			label: ReactNode
			icon?: ReactNode
	  }

export function Select<T>(props: {
	label: ReactNode
	value: T | undefined
	options: readonly SelectOption<T>[]
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
						{option.icon}
						{option.label}
					</Ariakit.SelectItem>
				))}
			</Ariakit.SelectPopover>
		</Ariakit.SelectProvider>
	)
}

export function EditableSelect<T>({
	className,
	...props
}: EditableProps<ComponentProps<typeof Select<T>>, T>) {
	const editable = useEditable(props)
	return (
		<LoadingDecoration pending={editable.pending} className={className}>
			<Select
				{...editable.inputProps}
				onChange={(value) => {
					editable.inputProps.onChange(value)
					editable.submit(value)
				}}
			/>
		</LoadingDecoration>
	)
}
