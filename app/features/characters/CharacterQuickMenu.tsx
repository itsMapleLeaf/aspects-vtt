import * as Ariakit from "@ariakit/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { RoomOwnerOnly, useRoom } from "#app/features/rooms/roomContext.js"
import { Button } from "#app/ui/Button.js"
import { FormLayout, FormRow } from "#app/ui/Form.js"
import { Menu, MenuButton, MenuItem, MenuPanel } from "#app/ui/Menu.js"
import { translucentPanel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import type { ApiCharacter } from "../characters/types.ts"
import { useCanvasMapController } from "../rooms/CanvasMapController.tsx"
import { CharacterDamageField, CharacterFatigueField } from "./CharacterForm.tsx"
import { useCreateAttributeRollMessage } from "./useCreateAttributeRollMessage.tsx"

export function CharacterQuickMenu(props: { character: ApiCharacter }) {
	const room = useRoom()
	const mapController = useCanvasMapController()
	const duplicateCharacter = useMutation(api.characters.duplicate)

	const onlySelectedCharacter = (() => {
		const [first, second] = mapController.selectedCharacters().take(2)
		if (first && !second) return first
	})()

	const popoverStore = Ariakit.usePopoverStore({
		open:
			!mapController.getMultiSelectArea() &&
			!mapController.tokenMenu &&
			onlySelectedCharacter?._id === props.character._id,
	})

	return (
		<Ariakit.PopoverProvider store={popoverStore}>
			<Ariakit.PopoverAnchor className="absolute inset-0" />
			<Ariakit.Popover
				portal
				hideOnInteractOutside={false}
				unmountOnHide
				gutter={8}
				className={translucentPanel("w-[24rem]")}
			>
				<FormLayout>
					<div className="flex items-end gap-2">
						<FormRow className="grid auto-cols-fr grid-flow-col">
							<CharacterDamageField character={props.character} />
							<CharacterFatigueField character={props.character} />
						</FormRow>
						<RollAttributeButton character={props.character} />
						<RoomOwnerOnly>
							<ToggleNameVisibleButton character={props.character} />
						</RoomOwnerOnly>
					</div>
				</FormLayout>
			</Ariakit.Popover>
		</Ariakit.PopoverProvider>
	)
}

function RollAttributeButton(props: {
	character: ApiCharacter
}) {
	const createAttributeRollMessage = useCreateAttributeRollMessage()
	const notionImports = useQuery(api.notionImports.get)
	return (
		<Menu placement="bottom">
			<Button tooltip="Roll Attribute" icon={<Lucide.Dices />} element={<MenuButton />} />
			<MenuPanel>
				{notionImports?.attributes?.map((attribute) => (
					<MenuItem
						key={attribute.key}
						icon={undefined}
						text={attribute.name}
						onClick={() =>
							createAttributeRollMessage({
								content: `${props.character.name}: ${attribute.name}`,
								attributeValue: props.character[attribute.key],
							})
						}
					/>
				))}
			</MenuPanel>
		</Menu>
	)
}

function ToggleNameVisibleButton(props: { character: ApiCharacter }) {
	const updateCharacter = useMutation(api.characters.update)
	return (
		<Button
			tooltip={props.character.nameVisible ? "Hide Name" : "Show Name"}
			icon={props.character.nameVisible ? <Lucide.Eye /> : <Lucide.EyeOff />}
			onClick={async () => {
				await updateCharacter({
					id: props.character._id,
					nameVisible: !props.character.nameVisible,
				})
			}}
		/>
	)
}
