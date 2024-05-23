import * as Ariakit from "@ariakit/react"
import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { matchSorter } from "match-sorter"
import * as React from "react"
import { flushSync } from "react-dom"
import { api } from "../../../convex/_generated/api"
import type { ApiCharacterCondition } from "../../../convex/characters/types.ts"
import { getColorNames, getColorStyle } from "../../../shared/colors.ts"
import { expect } from "../../common/expect.ts"
import { randomItem } from "../../common/random.ts"
import { titleCase } from "../../common/string.ts"
import { Button } from "../../ui/Button.tsx"
import { Input } from "../../ui/Input.tsx"
import { menuItemStyle, menuPanelStyle } from "../../ui/Menu.tsx"
import { panel } from "../../ui/styles.ts"
import type { ApiCharacter } from "../characters/types.ts"

const conditionPresets: ApiCharacterCondition[] = [
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

export function CharacterConditionsListInput({ character }: { character: ApiCharacter }) {
	const updateConditions = useMutation(api.characters.functions.updateConditions)

	return (
		<div className="flex flex-col gap-1.5">
			{character.conditions.length > 0 ?
				<ul className="flex flex-wrap gap-1.5">
					{character.conditions.map((condition) => (
						<li key={condition.name}>
							<ConditionBadgeButton character={character} condition={condition} />
						</li>
					))}
				</ul>
			:	<p className="opacity-50">No conditions added yet.</p>}
			<form
				className="flex gap-2"
				action={async (formData) => {
					const name = formData.get("name") as string
					const presetColor = conditionPresets.find((it) => it.name === name)?.color

					await updateConditions({
						characterId: character._id,
						action: {
							type: "add",
							name,
							color: presetColor ?? expect(randomItem(getColorNames())),
						},
					}).catch(console.error)
				}}
			>
				<AddConditionInput currentConditions={character.conditions} />
				<Button type="submit" icon={<Lucide.Plus />} />
			</form>
		</div>
	)
}

function AddConditionInput({
	currentConditions,
}: {
	currentConditions: Iterable<ApiCharacterCondition>
}) {
	const [name, setName] = React.useState("")
	const [open, setOpen] = React.useState(false)
	const inputRef = React.useRef<HTMLInputElement>(null)

	const currentConditionNames = new Set(Iterator.from(currentConditions).map((it) => it.name))

	const filteredPresets = matchSorter(
		conditionPresets.filter((it) => !currentConditionNames.has(it.name)),
		name,
		{
			keys: ["name"],
		},
	)

	return (
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
				expect(inputRef.current).form?.requestSubmit()
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
							expect(inputRef.current).focus()
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
				className={menuPanelStyle()}
				flip={false}
				unmountOnHide
			>
				{filteredPresets.map((condition) => (
					<Ariakit.ComboboxItem
						key={condition.name}
						value={condition.name}
						className={menuItemStyle()}
					>
						{condition.name}
					</Ariakit.ComboboxItem>
				))}
			</Ariakit.ComboboxPopover>
		</Ariakit.ComboboxProvider>
	)
}

function ConditionBadgeButton({
	character,
	condition,
}: {
	character: ApiCharacter
	condition: ApiCharacterCondition
}) {
	const updateConditions = useMutation(api.characters.functions.updateConditions)

	const [, action, pending] = React.useActionState(async () => {
		await updateConditions({
			characterId: character._id,
			action: {
				type: "remove",
				name: condition.name,
			},
		}).catch(console.error)
	}, undefined)

	return (
		<form action={action}>
			<button
				type="submit"
				data-pending={pending || undefined}
				className={panel(
					"flex-center-row h-6 px-1.5 text-sm leading-none transition data-[pending]:animate-pulse data-[pending]:opacity-50",
					getColorStyle(condition.color),
				)}
			>
				{titleCase(condition.name)}
			</button>
		</form>
	)
}
