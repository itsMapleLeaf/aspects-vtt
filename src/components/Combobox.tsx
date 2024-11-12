import * as Ariakit from "@ariakit/react"
import { matchSorter } from "match-sorter"
import { Key, type ReactNode } from "react"
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
	key?: Key
}

export function Combobox({
	options,
	value,
	defaultValue,
	onChangeValue,
	...props
}: ComboboxProps) {
	const store = Ariakit.useComboboxStore({
		value,
		defaultValue,
		setValue: onChangeValue,
	})
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
							key={item.key ?? item.value}
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
