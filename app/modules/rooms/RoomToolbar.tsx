import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { Button } from "~/ui/Button.tsx"
import { ConfirmModalButton } from "~/ui/ConfirmModalButton.tsx"
import { FormActions, FormLayout } from "~/ui/Form.tsx"
import {
	Modal,
	ModalButton,
	ModalPanel,
	ModalPanelContent,
	ModalProvider,
} from "~/ui/Modal.tsx"
import { NumberField } from "~/ui/NumberField.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "~/ui/Popover.tsx"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { useOwnedCharacters } from "../characters/hooks.ts"
import { useMutationAction, useSafeAction } from "../convex/hooks.ts"
import { DateTimeSettingsForm } from "../game/DateTimeSettingsForm.tsx"
import { QuickReference } from "../game/QuickReference.tsx"
import { RoomSettingsForm } from "./RoomSettingsForm.tsx"
import type { RoomToolbarStore } from "./RoomToolbarStore.ts"
import { RoomOwnerOnly } from "./roomContext.tsx"

export function RoomToolbar({ store }: { store: RoomToolbarStore }) {
	const character = useOwnedCharacters()[0]

	const [, extraCombatAction] = useMutationAction(
		api.characters.functions.extraCombatAction,
	)

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
					<ToolbarButton
						icon={<Lucide.FastForward />}
						tooltip="Extra combat action"
						onClick={() => extraCombatAction({ id: character._id })}
					/>
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
		<div className="shrink-0 basis-px self-stretch bg-primary-700/75 first:hidden last:hidden" />
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

/**
 * Shows a modal which asks for a certain number of hours, then they gain that
 * much resolve.
 */
function RestButton({ characterId }: { characterId: Id<"characters"> }) {
	const rest = useMutation(api.characters.functions.rest)

	const [hours, setHours] = useState(1)
	const [open, setOpen] = useState(false)

	const [, action, pending] = useSafeAction(async (_: FormData) => {
		await rest({ id: characterId, hours })
		setOpen(false)
	})

	return (
		<Modal
			title="Rest"
			trigger={<ToolbarButton icon={<Lucide.FlameKindling />} tooltip="Rest" />}
			open={open}
			onOpenChange={setOpen}
		>
			<form action={action} className="contents">
				<FormLayout className="items-center">
					<NumberField
						label="Hours"
						min={1}
						value={hours}
						onChange={setHours}
						className="w-32"
					/>
					<p className="text-pretty">
						You will rest for <strong>{hours}</strong> hour(s) and gain{" "}
						<strong>{hours}</strong> resolve.
					</p>
					<FormActions>
						<Button
							type="submit"
							icon={<Lucide.FlameKindling />}
							pending={pending}
						>
							Rest
						</Button>
					</FormActions>
				</FormLayout>
			</form>
		</Modal>
	)
}
