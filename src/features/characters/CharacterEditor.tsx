import { useMutation } from "convex/react"
import {
	LucideHeartPulse,
	LucidePackage,
	LucideSparkles,
	LucideUserRound,
} from "lucide-react"
import * as v from "valibot"
import { useLocalStorage } from "~/common/react/dom.ts"
import { usePatchUpdate } from "~/common/react/usePatchUpdate.ts"
import { Field } from "~/components/Field.tsx"
import { Heading, HeadingLevel } from "~/components/Heading.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { Tabs } from "~/components/Tabs.tsx"
import { api } from "~/convex/_generated/api"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterInventoryEditor } from "~/features/characters/CharacterInventoryEditor.tsx"
import { CharacterProfileEditor } from "~/features/characters/CharacterProfileEditor.tsx"
import { CharacterSkillsEditor } from "~/features/characters/CharacterSkillsEditor.tsx"
import { WealthTierSelect } from "~/features/characters/WealthTierSelect.tsx"
import { textInput } from "~/styles/input.ts"
import { primaryHeading } from "~/styles/text.ts"
import { CharacterConditionsInput } from "./CharacterConditionsInput.tsx"

export function CharacterEditor({
	character,
}: {
	character: NormalizedCharacter
}) {
	const [activeId, setActiveId] = useLocalStorage(
		`characterEditorDialog:activeId:${character._id}`,
		"profile",
		v.parser(v.string()),
	)

	return (
		<div className="isolate flex max-h-full min-h-0 flex-1 flex-col overflow-y-auto p-2 gap-2">
			<Tabs.Root
				selectedId={activeId}
				setSelectedId={(id) => setActiveId((current) => id ?? current)}
			>
				<HeadingLevel>
					<div className="sticky -top-2 z-10 -m-2 flex shrink-0 flex-col bg-primary-800 p-2 gap">
						<Heading className={primaryHeading()}>{character.name}</Heading>
						<Tabs.List>
							<Tabs.Tab id="profile">
								<LucideUserRound /> Profile
							</Tabs.Tab>
							<Tabs.Tab id="status">
								<LucideHeartPulse /> Status
							</Tabs.Tab>
							<Tabs.Tab id="inventory">
								<LucidePackage /> Inventory
							</Tabs.Tab>
							<Tabs.Tab id="skills">
								<LucideSparkles /> Skills
							</Tabs.Tab>
						</Tabs.List>
					</div>

					<Tabs.Panel id="profile" unmountOnHide>
						<CharacterProfileEditor character={character} />
					</Tabs.Panel>

					<Tabs.Panel id="status" unmountOnHide>
						<CharacterStatusEditor character={character} />
					</Tabs.Panel>

					<Tabs.Panel id="inventory" unmountOnHide>
						<CharacterInventoryEditor character={character} />
					</Tabs.Panel>

					<Tabs.Panel id="skills" unmountOnHide>
						<CharacterSkillsEditor character={character} />
					</Tabs.Panel>
				</HeadingLevel>
			</Tabs.Root>
		</div>
	)
}

function CharacterStatusEditor({
	character: characterProp,
}: {
	character: NormalizedCharacter
}) {
	const update = useMutation(api.characters.update)
	const { patched: character, update: handleChange } = usePatchUpdate(
		characterProp,
		(patch) => update({ ...patch, characterId: characterProp._id }),
	)

	return (
		<div className="flex flex-col gap-3">
			<div className="grid auto-cols-fr grid-flow-col gap">
				<Field label={`Health`}>
					<div className="flex items-center gap-2">
						<NumberInput
							className={textInput()}
							max={character.healthMax}
							value={character.health}
							onSubmitValue={(value) => handleChange({ health: value })}
						/>
						<div aria-label="out of">/</div>
						<NumberInput
							className={textInput()}
							placeholder={character.healthMax}
							required={false}
							value={character.healthMaxOverride}
							onSubmitValue={(value) =>
								handleChange({ healthMaxOverride: value })
							}
							onSubmitEmpty={() => handleChange({ healthMaxOverride: null })}
						/>
					</div>
				</Field>
				<Field label={`Resolve`}>
					<div className="flex items-center gap-2">
						<NumberInput
							className={textInput()}
							max={character.resolveMax}
							value={character.resolve}
							onSubmitValue={(value) => handleChange({ resolve: value })}
						/>
						<div aria-label="out of">/</div>
						<NumberInput
							className={textInput()}
							placeholder={character.resolveMax}
							required={false}
							value={character.resolveMaxOverride}
							onSubmitValue={(value) =>
								handleChange({ resolveMaxOverride: value })
							}
							onSubmitEmpty={() => handleChange({ resolveMaxOverride: null })}
						/>
					</div>
				</Field>
			</div>

			<WealthTierSelect
				value={character.wealth}
				onChange={(value) => handleChange({ wealth: value })}
			/>

			<CharacterConditionsInput characterIds={[character._id]} />
		</div>
	)
}
