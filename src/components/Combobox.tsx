import * as Ariakit from "@ariakit/react"
import { matchSorter } from "match-sorter"
import { type ReactNode } from "react"
import { textInput } from "~/styles/input.ts"
import { menuItem, menuPanel } from "~/styles/menu.ts"

export interface ComboboxProps extends Ariakit.ComboboxProps {
	options: ComboboxOption[]
	value?: string
	defaultValue?: string
	onChangeValue?: Ariakit.ComboboxProviderProps["setValue"]
}

export interface ComboboxOption {
	value: string
	name?: ReactNode
	description?: ReactNode
	icon?: ReactNode
}

export function Combobox({
	options,
	value,
	onChangeValue,
	...props
}: ComboboxProps) {
	const store = Ariakit.useComboboxStore({ value, setValue: onChangeValue })
	const searchInput = Ariakit.useStoreState(store, "value")

	const matches = matchSorter(options, searchInput, {
		keys: ["value"],
	})

	return (
		<Ariakit.ComboboxProvider store={store}>
			<Ariakit.Combobox
				autoSelect
				{...props}
				className={textInput(props.className)}
			/>
			{matches.length > 0 && (
				<Ariakit.ComboboxPopover
					className={menuPanel()}
					gutter={8}
					portal
					unmountOnHide
				>
					{matches.map((item) => (
						<Ariakit.ComboboxItem
							key={item.value}
							id={item.value}
							value={item.value}
							className={menuItem()}
						>
							<p>{item.name ?? item.value}</p>
							{item.description && <p>{item.name ?? item.value}</p>}
						</Ariakit.ComboboxItem>
					))}
				</Ariakit.ComboboxPopover>
			)}
		</Ariakit.ComboboxProvider>
	)
}
