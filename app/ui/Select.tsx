import * as Ariakit from "@ariakit/react"
import * as Lucide from "lucide-react"
import type React from "react"
import type { ComponentProps, ReactNode } from "react"
import { mod } from "../../common/math.ts"
import { Button } from "./Button.tsx"
import { FormField } from "./Form.tsx"
import { LoadingDecoration } from "./LoadingDecoration.tsx"
import { MenuItem, MenuPanel } from "./Menu.tsx"
import { type EditableProps, useEditable } from "./useEditable.tsx"

export interface SelectOptionWithoutId<T> {
	id?: string | undefined
	value: Extract<T, string>
	label: ReactNode
	icon?: ReactNode
}

export interface SelectOptionWithId<T> {
	id: string
	value: T
	label: ReactNode
	icon?: ReactNode
}

export type SelectOption<T> = SelectOptionWithoutId<T> | SelectOptionWithId<T>

export function Select<T>(props: {
	label: ReactNode
	value: T | undefined
	options: ReadonlyArray<SelectOption<T>>
	placeholder?: ReactNode
	onChange: (value: T) => void
	className?: string
}) {
	const currentOption = props.options.find((it) => it.value === props.value)

	const getOptionId = (option: SelectOption<T>) => ("id" in option ? option.id : option.value)

	const cycleOption = (delta: number) => {
		const currentOptionIndex = props.options.findIndex((it) => it.value === props.value)
		const nextOption = props.options[mod(currentOptionIndex + delta, props.options.length)]
		if (nextOption) props.onChange(nextOption.value)
	}

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "ArrowUp") {
			event.preventDefault()
			cycleOption(-1)
		}
		if (event.key === "ArrowDown") {
			event.preventDefault()
			cycleOption(1)
		}
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
					icon={currentOption?.icon}
					className="w-full"
					align="start"
					element={<Ariakit.Select onKeyDown={handleKeyDown} />}
				>
					<div className="flex flex-1 flex-row">
						{currentOption?.label ?? (
							<span className="opacity-50">{props.placeholder ?? "Choose one"}</span>
						)}
						<Lucide.ChevronDown className="ml-auto" />
					</div>
				</Button>
			</FormField>
			<Ariakit.SelectPopover
				portal
				gutter={8}
				sameWidth
				unmountOnHide
				className={MenuPanel.style()}
			>
				{props.options.map((option) => (
					<Ariakit.SelectItem
						key={getOptionId(option)}
						value={getOptionId(option)}
						className={MenuItem.style()}
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
