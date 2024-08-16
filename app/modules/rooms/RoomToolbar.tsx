import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { Button } from "~/ui/Button.tsx"
import { ConfirmModalButton } from "~/ui/ConfirmModalButton.tsx"
import {
	ModalButton,
	ModalPanel,
	ModalPanelContent,
	ModalProvider,
} from "~/ui/Modal.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "~/ui/Popover.tsx"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { useOwnedCharacters } from "../characters/hooks.ts"
import { DateTimeSettingsForm } from "../game/DateTimeSettingsForm.tsx"
import { QuickReference } from "../game/QuickReference.tsx"
import { RoomSettingsForm } from "./RoomSettingsForm.tsx"
import type { RoomToolbarStore } from "./RoomToolbarStore.ts"
import { RoomOwnerOnly } from "./roomContext.tsx"

export function RoomToolbar({ store }: { store: RoomToolbarStore }) {
	const character = useOwnedCharacters()[0]

	return (
		<nav aria-label="Toolbar" className="flex gap-2">
			<ToolbarButton
				icon={<Lucide.SquareDashedMousePointer />}
				tooltip="Draw Area"
				active={store.activeTool === "Draw"}
				onClick={store.toggleDrawTool}
			/>

			<ToolbarSeparator />

			{character && (
				<>
					<ToolbarPopover icon={<Lucide.HeartPulse />} tooltip="Status">
						<div className="grid w-48 p-2 gap-2">
							<CharacterStatusFields character={character} />
						</div>
					</ToolbarPopover>
					<RestButton characterId={character._id} />
				</>
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
				<ModalPanel
					title="Quick Reference"
					className="max-w-screen-md"
					fullHeight
				>
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
			<PopoverTrigger
				render={<ToolbarButton icon={icon} tooltip={tooltip} />}
			/>
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

function RestButton({ characterId }: { characterId: Id<"characters"> }) {
	const rest = useMutation(api.characters.functions.rest)
	return (
		<ConfirmModalButton
			title="Rest"
			message={
				<>
					<p>
						Resting uses <strong>8 hours</strong> of the day.
					</p>
					<p>
						You will gain <strong>3d4 resolve</strong>.
					</p>
					<p>Are you sure you want to rest?</p>
				</>
			}
			confirmText="Yes, rest for 8 hours"
			confirmIcon={<Lucide.FlameKindling />}
			cancelText="Sleep is for the weak."
			render={<ToolbarButton icon={<Lucide.FlameKindling />} tooltip="Rest" />}
			onConfirm={() => rest({ id: characterId })}
			dangerous={false}
		/>
	)
}
