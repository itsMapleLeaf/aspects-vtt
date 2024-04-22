import * as Ariakit from "@ariakit/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { type ReactNode, useState } from "react"
import { Vector } from "#app/common/vector.js"
import { editCharacterEvent } from "#app/features/characters/events.ts"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { RoomOwnerOnly, useCharacters, useRoom } from "#app/features/rooms/roomContext.js"
import { TokenElement } from "#app/features/tokens/TokenElement.tsx"
import { Button } from "#app/ui/Button.js"
import { ContextMenu } from "#app/ui/ContextMenu.js"
import { FormActions, FormField, FormLayout, FormRow } from "#app/ui/Form.js"
import {
	Menu,
	MenuButton,
	MenuItem,
	MenuPanel,
	menuItemStyle,
	menuPanelStyle,
} from "#app/ui/Menu.js"
import { Modal, ModalPanel, ModalPanelContent } from "#app/ui/Modal.js"
import { NumberField } from "#app/ui/NumberField.js"
import { translucentPanel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import type { ApiAttribute, ApiCharacter } from "../characters/types.ts"
import { TokenLabel, TokenSelectionOutline } from "../tokens/TokenMap.tsx"
import { CharacterDamageField, CharacterFatigueField } from "./CharacterForm.tsx"
import { DeleteCharacterButton } from "./DeleteCharacterButton.tsx"
import { useCreateAttributeRollMessage } from "./useCreateAttributeRollMessage.tsx"

export function CharacterTokenElement(props: {
	character: ApiCharacter
	selected: boolean
	onSelect: () => void
	onMove: (position: Vector) => Promise<unknown>
}) {
	const room = useRoom()
	const duplicateCharacter = useMutation(api.characters.duplicate)
	const [moving, setMoving] = useState(false)
	const popoverStore = Ariakit.usePopoverStore({
		open: props.selected && !moving,
	})
	return (
		<TokenElement
			token={props.character.token}
			size={Vector.from(room.mapCellSize)}
			onPointerDown={(event) => {
				if (event.button === 0) {
					props.onSelect()
					setMoving(true)
				}
			}}
			onDoubleClick={(event) => {
				editCharacterEvent.emit(props.character._id)
			}}
			onMoveFinish={async (...args) => {
				setMoving(false)
				await props.onMove(...args)
			}}
			attachments={
				<TokenLabel
					text={
						props.character.isOwner || props.character.nameVisible
							? `${props.character.displayName}\n(${props.character.displayPronouns})`
							: "???"
					}
				/>
			}
		>
			{props.selected && <TokenSelectionOutline />}
			<UploadedImage
				id={props.character.imageId}
				emptyIcon={<Lucide.Ghost />}
				data-hidden={!props.character.token.visible}
				className="relative size-full transition-opacity data-[hidden=true]:opacity-50"
			/>
			<Ariakit.PopoverProvider store={popoverStore}>
				<Ariakit.PopoverAnchor className="absolute inset-0" />
				<Ariakit.Popover
					portal
					hideOnInteractOutside={false}
					unmountOnHide
					gutter={8}
					className={translucentPanel("w-[20rem]")}
				>
					<FormLayout>
						<div className="flex items-end gap-2">
							<div className="flex flex-1 gap-2 *:flex-1">
								<CharacterDamageField character={props.character} />
								<CharacterFatigueField character={props.character} />
							</div>
							{room.isOwner ? null : <RollAttributeButton character={props.character} />}
						</div>
						<RoomOwnerOnly>
							<FormRow className="*:basis-0">
								<RollAttributeButton character={props.character} />
								<Button
									tooltip="Duplicate"
									icon={<Lucide.Copy />}
									onClick={() => duplicateCharacter({ id: props.character._id })}
								/>
								<DeleteCharacterButton character={props.character} />
								<ToggleVisibleButton character={props.character} />
								<ToggleNameVisibleButton character={props.character} />
							</FormRow>
						</RoomOwnerOnly>
					</FormLayout>
				</Ariakit.Popover>
			</Ariakit.PopoverProvider>
		</TokenElement>
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
						onClick={() =>
							createAttributeRollMessage({
								content: `${props.character.name}: ${attribute.name}`,
								attributeValue: props.character[attribute.key],
							})
						}
					>
						{attribute.name}
					</MenuItem>
				))}
			</MenuPanel>
		</Menu>
	)
}

function CharacterContextMenu(props: { character: ApiCharacter; children?: React.ReactNode }) {
	return (
		<Modal>
			{(store) => (
				<>
					<ContextMenu
						className="absolute inset-0 size-full"
						options={[
							{
								label: "Contested roll...",
								icon: <Lucide.Swords />,
								onClick: () => store.show(),
							},
						]}
					>
						{props.children}
					</ContextMenu>
					<ModalPanel
						title={
							<>
								<span className="opacity-50">Contested Roll vs.</span> {props.character.displayName}
							</>
						}
					>
						<ModalPanelContent>
						<ContestedRollForm opponent={props.character} onRoll={() => store.hide()} />
						</ModalPanelContent>
					</ModalPanel>
				</>
			)}
		</Modal>
	)
}

function ContestedRollForm({ opponent, onRoll }: { opponent: ApiCharacter; onRoll?: () => void }) {
	const characters = useCharacters()
	const selfCharacter = characters.find((c) => c.isOwner)

	const attributes = useQuery(api.notionImports.get)?.attributes
	const strengthAttribute = attributes?.find((a) => a.key === "strength")

	const createAttributeRollMessage = useCreateAttributeRollMessage()

	const [values, setValues] = useState<{
		selfCharacter: ApiCharacter | undefined
		selfAttribute: ApiAttribute | undefined
		selfBoostCount: number
		selfSnagCount: number
		opponentAttribute: ApiAttribute | undefined
		opponentBoostCount: number
		opponentSnagCount: number
	}>({
		selfCharacter,
		selfAttribute: strengthAttribute,
		selfBoostCount: 0,
		selfSnagCount: 0,
		opponentAttribute: strengthAttribute,
		opponentBoostCount: 0,
		opponentSnagCount: 0,
	})

	const setValue = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
		setValues((values) => ({ ...values, [key]: value }))
	}

	return (
		<FormLayout>
			<Select
				label="Character"
				options={characters.map((c) => ({ label: c.displayName, value: c._id }))}
				value={values.selfCharacter?._id}
				placeholder="Choose a character"
				onChange={(id) => {
					const character = characters.find((c) => c._id === id)
					if (character) {
						setValue("selfCharacter", character)
					}
				}}
			/>
			<FormRow>
				<AttributeSelectField
					className="!shrink-0 !basis-56"
					label="Your Attribute"
					value={values.selfAttribute ?? strengthAttribute}
					onChange={(value) => setValue("selfAttribute", value)}
				/>
				<NumberField
					label="Boost Count"
					value={values.selfBoostCount}
					onChange={(value) => setValue("selfBoostCount", value)}
				/>
				<NumberField
					label="Snag Count"
					value={values.selfSnagCount}
					onChange={(value) => setValue("selfSnagCount", value)}
				/>
			</FormRow>
			<FormRow>
				<AttributeSelectField
					className="!shrink-0 !basis-56"
					label="Opponent Attribute"
					value={values.opponentAttribute ?? strengthAttribute}
					onChange={(value) => setValue("opponentAttribute", value)}
				/>
				<NumberField
					label="Boost Count"
					value={values.opponentBoostCount}
					onChange={(value) => setValue("opponentBoostCount", value)}
				/>
				<NumberField
					label="Snag Count"
					value={values.opponentSnagCount}
					onChange={(value) => setValue("opponentSnagCount", value)}
				/>
			</FormRow>
			<FormActions>
				<Button
					text="Roll"
					icon={<Lucide.Dices />}
					onClick={async () => {
						if (!selfCharacter) {
							return
						}
						await Promise.all([
							createAttributeRollMessage({
								content: `${opponent.nameVisible ? opponent.displayName : "???"}: ${
									values.opponentAttribute?.name ?? "Strength"
								}`,
								attributeValue: opponent[values.opponentAttribute?.key ?? "strength"],
								boostCount: values.opponentBoostCount,
								snagCount: values.opponentSnagCount,
							}),
							createAttributeRollMessage({
								content: `${selfCharacter.nameVisible ? selfCharacter.displayName : "???"}: ${
									values.selfAttribute?.name ?? "Strength"
								}`,
								attributeValue: selfCharacter[values.selfAttribute?.key ?? "strength"],
								boostCount: values.selfBoostCount,
								snagCount: values.selfSnagCount,
							}),
						])
						onRoll?.()
					}}
				/>
			</FormActions>
		</FormLayout>
	)
}

function AttributeSelectField(props: {
	label: ReactNode
	value: ApiAttribute | undefined
	onChange: (value: ApiAttribute) => void
	className?: string
}) {
	const attributes = useQuery(api.notionImports.get)?.attributes
	return (
		<Select
			label={props.label}
			value={props.value?.key}
			options={
				attributes?.map((attribute) => ({ label: attribute.name, value: attribute.key })) ?? []
			}
			placeholder="Select an attribute"
			onChange={(key) => {
				const attribute = attributes?.find((a) => a.key === key)
				if (attribute) props.onChange(attribute)
			}}
			className={props.className}
		/>
	)
}

function Select<T extends string>(props: {
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

function ToggleVisibleButton(props: { character: ApiCharacter }) {
	const updateCharacter = useMutation(api.characters.update)
	return (
		<Button
			tooltip={props.character.token.visible ? "Hide Token" : "Show Token"}
			icon={props.character.token.visible ? <Lucide.Image /> : <Lucide.ImageOff />}
			onClick={async () => {
				await updateCharacter({
					id: props.character._id,
					visible: !props.character.token.visible,
				})
			}}
		/>
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
