import * as Lucide from "lucide-react"
import { Button } from "~/ui/Button.tsx"
import { FormLayout } from "~/ui/Form.tsx"
import { ModalButton, ModalPanel, ModalPanelContent, ModalProvider } from "~/ui/Modal.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "~/ui/Popover.tsx"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { useOwnedCharacter } from "../characters/hooks.ts"
import { DateTimeSettingsForm } from "../game/DateTimeSettingsForm.tsx"
import { QuickReference } from "../game/QuickReference.tsx"
import { RoomOwnerOnly } from "./roomContext.tsx"
import { RoomSettingsForm } from "./RoomSettingsForm.tsx"
import { RoomTool, RoomToolbarStore } from "./RoomToolbarStore.tsx"

export function RoomToolbar() {
	const state = RoomToolbarStore.useState()
	const actions = RoomToolbarStore.useActions()
	const character = useOwnedCharacter()

	const aspect =
		character?.learnedAspectSkills?.length ?
			character?.learnedAspectSkills?.reduce((a, b) =>
				a.aspectSkillIds.length > b.aspectSkillIds.length ? a : b,
			).aspectId
		:	undefined

	// yes, i'm petty
	// prettier-ignore
	const aspectIcon =
		aspect === "fire" ? <Lucide.Flame /> :
		aspect === "water" ? <Lucide.Droplet /> :
		aspect === "wind" ? <Lucide.Wind /> :
		aspect === "light" ? <Lucide.Sun /> :
		aspect === "darkness" ? <Lucide.Moon /> :
		<Lucide.Tornado />

	return (
		<nav aria-label="Toolbar" className="flex gap-2">
			<ToolbarButton
				icon={<Lucide.SquareDashedMousePointer />}
				tooltip="Draw Area"
				active={state.activeTool === RoomTool.Draw}
				onClick={actions.toggleDrawTool}
			/>

			<ToolbarSeparator />

			<ToolbarPopover icon={aspectIcon} tooltip="Aspect Art">
				<AspectArtStats />
			</ToolbarPopover>

			{character && (
				<ToolbarPopover icon={<Lucide.HeartPulse />} tooltip="Status">
					<div className="grid w-48 gap-2 p-2">
						<CharacterStatusFields character={character} />
					</div>
				</ToolbarPopover>
			)}

			<ToolbarSeparator />

			<RoomOwnerOnly>
				<ToolbarPopover icon={<Lucide.CalendarClock />} tooltip="Date & Time">
					<div className="w-96">
						<DateTimeSettingsForm />
					</div>
				</ToolbarPopover>
				<ToolbarPopover icon={<Lucide.Settings />} tooltip="Settings">
					<div className="w-64">
						<RoomSettingsForm />
					</div>
				</ToolbarPopover>
			</RoomOwnerOnly>

			<ToolbarModal icon={<Lucide.HelpCircle />} tooltip="Help">
				<ModalPanel title="Quick Reference" className="max-w-screen-md" fullHeight>
					<ModalPanelContent>
						<QuickReference />
					</ModalPanelContent>
				</ModalPanel>
			</ToolbarModal>
		</nav>
	)
}

function ToolbarButton({
	icon,
	tooltip,
	active,
	onClick,
}: {
	icon: React.ReactNode
	tooltip: string
	active?: boolean
	onClick?: () => void
}) {
	return (
		<Button
			icon={icon}
			tooltip={tooltip}
			appearance="clear"
			size="md"
			square
			active={active}
			onClick={onClick}
		/>
	)
}

function ToolbarSeparator() {
	return (
		<div className="shrink-0 basis-px self-stretch bg-primary-300/75 first:hidden last:hidden" />
	)
}

function ToolbarPopover({
	icon,
	tooltip,
	children,
}: {
	icon: React.ReactNode
	tooltip: string
	children: React.ReactNode
}) {
	return (
		<Popover>
			<PopoverTrigger render={<ToolbarButton icon={icon} tooltip={tooltip} />} />
			<PopoverPanel gutter={16}>{children}</PopoverPanel>
		</Popover>
	)
}

function ToolbarModal({
	icon,
	tooltip,
	children,
}: {
	icon: React.ReactNode
	tooltip: string
	children: React.ReactNode
}) {
	return (
		<ModalProvider>
			<ModalButton render={<ToolbarButton icon={icon} tooltip={tooltip} />} />
			{children}
		</ModalProvider>
	)
}

function AspectArtStats() {
	return (
		<FormLayout>
			<p>placeholder</p>
		</FormLayout>
	)
}
