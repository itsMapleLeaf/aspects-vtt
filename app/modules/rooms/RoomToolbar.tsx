import * as Lucide from "lucide-react"
import type { Falsy } from "~/helpers/types.ts"
import { Button } from "~/ui/Button.tsx"
import { ModalButton, ModalPanel, ModalPanelContent, ModalProvider } from "~/ui/Modal.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "~/ui/Popover.tsx"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { useOwnedCharacter } from "../characters/hooks.ts"
import { DateTimeSettingsForm } from "../game/DateTimeSettingsForm.tsx"
import { QuickReference } from "../game/QuickReference.tsx"
import { useRoom } from "./roomContext.tsx"
import { RoomSettingsForm } from "./RoomSettingsForm.tsx"
import { RoomTool, RoomToolbarStore } from "./RoomToolbarStore.tsx"

type ToolbarItem = {
	name: string
	icon: React.ReactNode
	active?: boolean
} & (
	| { type: "button"; onClick: () => void }
	| { type: "popover"; content: React.ReactNode }
	| { type: "modal"; title: string; panel: React.ReactNode }
)

const separator = Symbol("separator")

export function RoomToolbar() {
	const state = RoomToolbarStore.useState()
	const actions = RoomToolbarStore.useActions()
	const room = useRoom()
	const character = useOwnedCharacter()

	const toolbarItems: Array<ToolbarItem | typeof separator | Falsy> = [
		{
			type: "button",
			name: "Draw Area",
			icon: <Lucide.SquareDashedMousePointer />,
			active: state.activeTool === RoomTool.Draw,
			onClick: actions.toggleDrawTool,
		},
		separator,
		{
			type: "popover",
			name: "Actions",
			icon: <Lucide.Zap />,
			content: <p>todo figure this out</p>,
		},
		character && {
			type: "popover",
			name: "Status",
			icon: <Lucide.BarChart2 />,
			content: (
				<div className="grid w-48 gap-2 p-2">
					<CharacterStatusFields character={character} />
				</div>
			),
		},
		separator,
		room.isOwner && {
			type: "popover",
			name: "Date & Time",
			icon: <Lucide.CalendarClock />,
			content: (
				<div className="w-96">
					<DateTimeSettingsForm />
				</div>
			),
		},
		room.isOwner && {
			type: "popover",
			name: "Settings",
			icon: <Lucide.Settings />,
			content: (
				<div className="w-64">
					<RoomSettingsForm />
				</div>
			),
		},
		{
			type: "modal",
			name: "Help",
			icon: <Lucide.HelpCircle />,
			title: "Help",
			panel: (
				<ModalPanel title="Quick Reference" className="max-w-screen-md" fullHeight>
					<ModalPanelContent>
						<QuickReference />
					</ModalPanelContent>
				</ModalPanel>
			),
		},
	]

	return (
		<nav aria-label="Toolbar" className="flex gap-2">
			{toolbarItems.filter(Boolean).map((item, i) =>
				item === separator ? <ToolbarSeparator key={i} />
				: item.type === "button" ?
					<Button
						key={i}
						icon={item.icon}
						tooltip={item.name}
						appearance="clear"
						size="md"
						square
						active={item.active}
						onClick={item.onClick}
					/>
				: item.type === "popover" ?
					<Popover key={i}>
						<PopoverTrigger
							render={
								<Button
									key={i}
									icon={item.icon}
									tooltip={item.name}
									appearance="clear"
									size="md"
									square
									active={item.active}
								/>
							}
						/>
						<PopoverPanel gutter={16}>{item.content}</PopoverPanel>
					</Popover>
				: item.type === "modal" ?
					<ModalProvider key={i}>
						<ModalButton
							render={
								<Button
									key={i}
									icon={item.icon}
									tooltip={item.name}
									appearance="clear"
									size="md"
									square
									active={item.active}
								/>
							}
						/>
						{item.panel}
					</ModalProvider>
				:	null,
			)}
		</nav>
	)
}

function ToolbarSeparator() {
	return (
		<div className="shrink-0 basis-px self-stretch bg-primary-300/75 first:hidden last:hidden" />
	)
}
