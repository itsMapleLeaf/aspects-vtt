import * as Ariakit from "@ariakit/react"
import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { matchSorter } from "match-sorter"
import * as React from "react"
import { flushSync } from "react-dom"
import { unwrap } from "../../../common/errors.ts"
import { randomItem } from "../../../common/random.ts"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import type { ApiCharacterCondition } from "../../../convex/characters/types.ts"
import { Button } from "../../ui/Button.tsx"
import { Input } from "../../ui/Input.tsx"
import { MenuItem, MenuPanel } from "../../ui/Menu.tsx"
import { getColorNames } from "../user-colors/data.ts"

export function AddCharacterConditionInput({
	currentConditions,
	characterIds,
}: {
	currentConditions: Iterable<ApiCharacterCondition>
	characterIds: Id<"characters">[]
}) {
	const [name, setName] = React.useState("")
	const [open, setOpen] = React.useState(false)
	const inputRef = React.useRef<HTMLInputElement>(null)

	const currentConditionNames = new Set(
		Iterator.from(currentConditions).map((it) => it.name),
	)

	const filteredPresets = matchSorter(
		conditionPresets.filter((it) => !currentConditionNames.has(it.name)),
		name,
		{
			keys: ["name"],
		},
	)

	const updateConditions = useMutation(
		api.characters.functions.updateConditions,
	)

	const action = async (formData: FormData): Promise<void> => {
		const name = formData.get("name") as string
		const presetColor = conditionPresets.find((it) => it.name === name)?.color

		await updateConditions({
			characterIds,
			action: {
				type: "add",
				name,
				color: presetColor ?? unwrap(randomItem(getColorNames())),
			},
		}).catch(console.error)
	}

	return (
		<form className="flex gap-2" action={action}>
			<Ariakit.ComboboxProvider
				open={filteredPresets.length === 0 ? false : open}
				setOpen={setOpen}
				setSelectedValue={(value) => {
					const name = typeof value === "string" ? value : value[0]
					if (!name) return

					// make sure the DOM has the right value before submitting
					flushSync(() => {
						setName(name)
					})
					unwrap(inputRef.current).form?.requestSubmit()
				}}
			>
				<div className="relative w-full">
					<Ariakit.Combobox
						autoComplete="both"
						autoSelect="always"
						render={
							<Input
								name="name"
								placeholder="Add condition"
								value={name}
								onChangeValue={setName}
								ref={inputRef}
							/>
						}
					/>
					{name.length > 0 && (
						<button
							type="button"
							className="absolute inset-y-0 right-0 flex items-center pr-2 opacity-50 transition hover:opacity-100"
							onClick={() => {
								setName("")
								unwrap(inputRef.current).focus()
								setOpen(true)
							}}
						>
							<Lucide.X className="h-5 w-5" />
						</button>
					)}
				</div>
				<Ariakit.ComboboxPopover
					gutter={4}
					sameWidth
					className={MenuPanel.style()}
					flip={false}
					unmountOnHide
					portal
				>
					{filteredPresets.map((condition) => (
						<Ariakit.ComboboxItem
							key={condition.name}
							value={condition.name}
							className={MenuItem.style()}
						>
							{condition.name}
						</Ariakit.ComboboxItem>
					))}
				</Ariakit.ComboboxPopover>
			</Ariakit.ComboboxProvider>
			<Button type="submit" icon={<Lucide.Plus />} />
		</form>
	)
}

export const conditionPresets: ApiCharacterCondition[] = [
	{
		name: "Burning",
		color: "red",
	},
	{
		name: "Unconscious",
		color: "orange",
	},
	{
		name: "Prone",
		color: "yellow",
	},
	{
		name: "Poisoned",
		color: "green",
	},
	{
		name: "Immobile",
		color: "blue",
	},
	{
		name: "Blinded",
		color: "purple",
	},
	{
		name: "Incapacitated",
		color: "pink",
	},
	{
		name: "Charmed",
		color: "fuchsia",
	},
]
