import * as Ariakit from "@ariakit/react"
import * as Lucide from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "#app/ui/Button.js"
import { FormField } from "#app/ui/Form.js"
import { menuItemStyle, menuPanelStyle } from "#app/ui/Menu.js"

export function Select<T extends string>(props: {
	label: ReactNode
	value: string | undefined
	options: Array<{ label: ReactNode; value: T }>
	placeholder?: ReactNode
	onChange: (value: T) => void
	className?: string
}) {
	return (
		<Ariakit.SelectProvider
			value={props.value}
			setValue={(value) => {
				const option = props.options.find((o) => o.value === value)
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
						props.options.find((o) => o.value === props.value)?.label ?? (
							<span className="opacity-50">{props.placeholder ?? "Choose one"}</span>
						)
					}
					element={<Ariakit.Select />}
					className="w-full flex-row-reverse justify-between"
				/>
			</FormField>
			<Ariakit.SelectPopover portal gutter={8} sameWidth className={menuPanelStyle()}>
				{props.options.map((option) => (
					<Ariakit.SelectItem key={option.value} value={option.value} className={menuItemStyle()}>
						{option.label}
					</Ariakit.SelectItem>
				))}
			</Ariakit.SelectPopover>
		</Ariakit.SelectProvider>
	)
}
